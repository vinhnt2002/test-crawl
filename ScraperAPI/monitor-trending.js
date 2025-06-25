const EtsyScraper = require('./etsy-scraper');
const config = require('./config');
require('dotenv').config();

async function monitorTrending() {
  const scraper = new EtsyScraper();
  
  console.log('🔥 Starting Etsy Trending Products Monitor');
  console.log('=====================================\n');
  
  const categories = Object.keys(config.etsy.categories);
  const results = {};
  
  try {
    for (const category of categories) {
      console.log(`📈 Crawling trending: ${category}`);
      console.log(`⏰ ${new Date().toLocaleString()}\n`);
      
      const products = await scraper.crawlTrendingProducts(category, 30);
      results[category] = products;
      
      console.log(`✅ Found ${products.length} trending products in ${category}`);
      
      // Log top 3 products
      if (products.length > 0) {
        console.log('\n🔝 Top 3 products:');
        products.slice(0, 3).forEach((product, index) => {
          console.log(`${index + 1}. ${product.title} - ${product.price} (${product.shop_name})`);
        });
      }
      
      console.log(`\n${'='.repeat(50)}\n`);
      
      // Delay để tránh rate limit
      if (categories.indexOf(category) < categories.length - 1) {
        console.log('⏳ Waiting 5 seconds before next category...\n');
        await scraper.delay(5000);
      }
    }
    
    // Summary
    console.log('\n📊 SUMMARY REPORT');
    console.log('==================');
    
    let totalProducts = 0;
    for (const [category, products] of Object.entries(results)) {
      console.log(`${category}: ${products.length} products`);
      totalProducts += products.length;
    }
    
    console.log(`\n🎯 Total products scraped: ${totalProducts}`);
    console.log(`⏰ Completed at: ${new Date().toLocaleString()}`);
    
    // Tìm category hot nhất
    const hottest = Object.entries(results)
      .sort(([,a], [,b]) => b.length - a.length)[0];
    
    if (hottest) {
      console.log(`🔥 Hottest category: ${hottest[0]} (${hottest[1].length} products)`);
    }
    
  } catch (error) {
    console.error('❌ Error in trending monitor:', error.message);
  }
}

// Chạy script
if (require.main === module) {
  monitorTrending();
}

module.exports = { monitorTrending }; 