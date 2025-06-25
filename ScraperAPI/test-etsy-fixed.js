const EtsyScraper = require('./etsy-scraper');
require('dotenv').config();

async function testEtsyFixed() {
  const scraper = new EtsyScraper();
  
  console.log('🔧 Testing Fixed Etsy Scraper...');
  console.log('=====================================\n');
  
  try {
    // Test with a simple keyword
    console.log('=== Test 1: Simple keyword search ===');
    const results = await scraper.searchEtsyProducts('ring', 1, 10);
    
    if (results.length > 0) {
      console.log(`✅ Success! Found ${results.length} products`);
      console.log('\n🎯 Sample product:');
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      console.log('❌ No products found, but no errors either');
    }
    
    console.log('\n=== Test 2: Popular keyword ===');
    const jewelryResults = await scraper.searchEtsyProducts('jewelry', 1, 5);
    console.log(`Found ${jewelryResults.length} jewelry products`);
    
    if (jewelryResults.length > 0) {
      jewelryResults.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - ${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
if (require.main === module) {
  testEtsyFixed();
}

module.exports = { testEtsyFixed }; 