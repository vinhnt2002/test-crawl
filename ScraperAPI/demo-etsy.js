const EtsyScraper = require('./etsy-scraper');
require('dotenv').config();

async function demo() {
  const scraper = new EtsyScraper();
  
  console.log('🚀 Starting Etsy Scraper Demo with ScraperAPI');
  
  try {
    // Demo 1: Tìm kiếm sản phẩm theo từ khóa
    console.log('\n=== Demo 1: Search Products by Keyword ===');
    const searchResults = await scraper.searchEtsyProducts('handmade jewelry', 1, 10);
    console.log(`Found ${searchResults.length} products for "handmade jewelry"`);
    
    if (searchResults.length > 0) {
      console.log('Sample product:', searchResults[0]);
    }

    // Demo 2: Crawl chi tiết sản phẩm
    console.log('\n=== Demo 2: Get Product Details ===');
    if (searchResults.length > 0 && searchResults[0].product_url) {
      const productDetails = await scraper.getProductDetails(searchResults[0].product_url);
      if (productDetails) {
        console.log('Product details:', productDetails);
      }
    }

    // Demo 3: Crawl nhiều từ khóa
    console.log('\n=== Demo 3: Crawl Multiple Keywords ===');
    const keywords = ['vintage rings', 'handmade earrings'];
    const allProducts = await scraper.crawlMultipleKeywords(keywords, 2);
    console.log(`Total products from multiple keywords: ${allProducts.length}`);

    // Demo 4: Crawl trending products
    console.log('\n=== Demo 4: Crawl Trending Products ===');
    const trendingProducts = await scraper.crawlTrendingProducts('jewelry', 20);
    console.log(`Found ${trendingProducts.length} trending products`);

  } catch (error) {
    console.error('❌ Demo error:', error.message);
  }
}

// Chạy demo
if (require.main === module) {
  demo();
}

module.exports = { demo }; 