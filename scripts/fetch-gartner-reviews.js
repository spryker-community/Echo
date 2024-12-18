import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REVIEWS_URL = 'https://www.gartner.com/reviews/market/digital-commerce/vendor/spryker/product/spryker-cloud-commerce-os/reviews?marketSeoName=digital-commerce&vendorSeoName=spryker&productSeoName=spryker-cloud-commerce-os';

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
        // Extract the date and convert it to ISO format
        const dateText = review.querySelector('.review-headline-container')?.textContent?.trim();
        const dateMatch = dateText?.match(/Reviewed on (.+)/);
        const dateStr = dateMatch ? dateMatch[1] : '';
        const date = new Date(dateStr);
        
        return {
          totalScore: review.querySelector('.avgStarIcon .ratingNumber')?.textContent?.trim(),
          title: review.querySelector('.review-headline')?.textContent?.trim(),
          shortDescription: review.querySelector('.uxd-truncate-text')?.textContent?.trim(),
          fullReviewLink: null,
          date: date.toISOString() // Store date in ISO format
        };
      });
    });
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'public', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Save to JSON file
    const filePath = path.join(dataDir, 'gartner-reviews.json');
    console.log(`Saving ${reviews.length} reviews to ${filePath}`);
    
    await fs.writeFile(
      filePath,
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        reviews
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
