import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REVIEWS_URL = 'https://www.gartner.com/reviews/market/digital-commerce/vendor/spryker/product/spryker-cloud-commerce-os/reviews?marketSeoName=digital-commerce&vendorSeoName=spryker&productSeoName=spryker-cloud-commerce-os';

// Function to convert date string to ISO format
function parseReviewDate(dateStr) {
  // Extract date from "Reviewed on Sep 26, 2024"
  const match = dateStr.match(/Reviewed on (.+)/);
  if (!match) return null;

  // Convert month abbreviation to number
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };

  const dateParts = match[1].split(' ');
  if (dateParts.length !== 3) return null;

  const month = months[dateParts[0]];
  const day = dateParts[1].replace(/,/g, '').padStart(2, '0'); // Remove any commas
  const year = dateParts[2].replace(/,/g, ''); // Remove any commas

  if (!month || !day || !year) return null;

  // Return in ISO format YYYY-MM-DD
  return `${year}-${month}-${day}`;
}

// Function to clean up review text
function cleanReviewText(text) {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\.+/g, '.') // Replace multiple periods with single period
    .replace(/\s+\./g, '.') // Remove space before period
    .replace(/\.$/, '') // Remove trailing period
    .trim();
}

async function fetchReviews() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });
  
  const page = await browser.newPage();
  
  try {
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"'
    });

    console.log('Navigating to Gartner reviews page...');
    const response = await page.goto(REVIEWS_URL, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    console.log('Page response status:', response.status());
    
    // Save the page HTML for debugging
    const html = await page.content();
    await fs.writeFile('gartner-debug.html', html);
    console.log('Saved page HTML to gartner-debug.html');
    
    // Scroll the page to trigger dynamic loading
    console.log('Scrolling the page to load reviews...');
    let previousHeight;
    let retries = 5;
    while (retries > 0) {
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
      const currentHeight = await page.evaluate('document.body.scrollHeight');
      if (currentHeight === previousHeight) break; // Stop if no new content is loaded
      retries--;
    }

    // Wait for reviews to load with a longer timeout
    console.log('Waiting for reviews to load...');
    await page.waitForSelector('.review', { timeout: 60000 });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'gartner-debug.png', fullPage: true });
    console.log('Saved screenshot to gartner-debug.png');
    
    // Extract reviews
    console.log('Extracting reviews...');
    const reviews = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.review')).map(review => {
        // Extract rating
        const ratingElement = review.querySelector('.avgStarIcon .ratingNumber');
        const rating = ratingElement ? parseFloat(ratingElement.textContent) : null;
        
        // Extract title
        const titleElement = review.querySelector('.review-headline');
        const title = titleElement ? titleElement.textContent.trim() : null;
        
        // Extract date
        const dateElement = review.querySelector('.review-headline-container');
        const date = dateElement ? dateElement.textContent.trim() : null;
        
        // Extract reviewer details
        const details = Array.from(review.querySelectorAll('.review-details li'))
          .map(detail => detail.textContent.trim())
          .reduce((acc, detail) => {
            const [key, value] = detail.split(': ');
            acc[key] = value || key; // If no colon, use the whole string as value
            return acc;
          }, {});
        
        // Extract review text
        const textElement = review.querySelector('.uxd-truncate-text');
        let text = '';
        if (textElement) {
          // Get all text nodes within the element
          const walker = document.createTreeWalker(
            textElement,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          let node;
          while (node = walker.nextNode()) {
            // Skip if the text is part of a link (like "Read Full Review")
            if (!node.parentElement.closest('a')) {
              text += node.textContent.trim() + ' ';
            }
          }
        }
        
        return {
          rating,
          title,
          date,
          reviewerFunction: details['Reviewer Function'],
          companySize: details['Company Size'],
          industry: details['Industry'],
          text: text.trim() || null
        };
      });
    });
    
    // Process reviews outside of page.evaluate for better error handling
    const processedReviews = reviews.map(review => ({
      ...review,
      date: parseReviewDate(review.date),
      text: review.text ? cleanReviewText(review.text) : null
    }));
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'public', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Save to JSON file
    const filePath = path.join(dataDir, 'gartner-reviews.json');
    console.log(`Saving ${processedReviews.length} reviews to ${filePath}`);
    
    await fs.writeFile(
      filePath,
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        reviewsUrl: REVIEWS_URL,
        reviews: processedReviews
      }, null, 2)
    );
    
    console.log('Successfully saved reviews!');
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the fetcher
fetchReviews().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
