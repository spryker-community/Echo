import { config } from 'dotenv';
import { searchBlueSkyPosts, getBskyPostUrl } from './bluesky';

// Load environment variables from .env file
config();

async function testBlueSkyApi() {
  try {
    console.log('Testing BlueSky API...');
    console.log('===================');
    
    console.log('\nEnvironment Check:');
    console.log('------------------');
    const hasIdentifier = !!process.env.VITE_BLUESKY_IDENTIFIER;
    const hasPassword = !!process.env.VITE_BLUESKY_APP_PASSWORD;
    const hasKeywords = !!process.env.VITE_YOUTUBE_KEYWORDS;
    
    console.log('BlueSky Identifier:', hasIdentifier ? 'Present' : 'Missing');
    console.log('BlueSky Password:', hasPassword ? 'Present' : 'Missing');
    console.log('Search Keywords:', hasKeywords ? 'Present' : 'Missing');
    
    if (!hasIdentifier || !hasPassword || !hasKeywords) {
      throw new Error('Missing required environment variables');
    }
    
    console.log('\nTesting Authentication and Search...');
    const posts = await searchBlueSkyPosts();
    console.log(`Found ${posts.length} posts`);
    
    if (posts.length > 0) {
      console.log('\nSample Posts:');
      console.log('-------------');
      
      // Show first 3 posts as samples
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`\nPost ${index + 1}:`);
        console.log('Author:', post.author.handle);
        console.log('Display Name:', post.author.displayName || 'N/A');
        console.log('Text:', post.record.text);
        console.log('Created:', new Date(post.record.createdAt).toLocaleString());
        console.log('Has Images:', !!post.embed?.images?.length);
        console.log('URL:', getBskyPostUrl(post.uri));
      });
      
      // Test URL generation
      console.log('\nTesting URL Generation:');
      console.log('----------------------');
      const samplePost = posts[0];
      console.log('Post URI:', samplePost.uri);
      console.log('Web URL:', getBskyPostUrl(samplePost.uri));
    }
    
    console.log('\nAPI Test Successful! ✅');
  } catch (error) {
    console.error('\nAPI Test Failed! ❌');
    if (error instanceof Error) {
      console.error('Error Message:', error.message);
      console.error('Stack Trace:', error.stack);
    } else {
      console.error('Unknown Error:', error);
    }
    process.exit(1);
  }
}

// Run the test
console.log('Starting BlueSky API Test...\n');
testBlueSkyApi();
