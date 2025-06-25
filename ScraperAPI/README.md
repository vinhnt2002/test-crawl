# Etsy Scraper using ScraperAPI

Hệ thống crawl dữ liệu Etsy sử dụng ScraperAPI để tránh bị block và có hiệu suất cao.

## 🚀 Tính năng

- ✅ Tìm kiếm sản phẩm theo từ khóa
- ✅ Crawl chi tiết sản phẩm
- ✅ Crawl sản phẩm trending
- ✅ Crawl nhiều từ khóa cùng lúc
- ✅ Lưu dữ liệu vào MongoDB
- ✅ Retry mechanism và error handling
- ✅ Rate limiting để tránh bị ban
- ✅ Support proxy và rendering JS

## 📦 Cài đặt

```bash
# Cài đặt dependencies
npm install node-fetch cheerio dotenv

# Hoặc nếu chưa có trong package.json
npm install node-fetch@2.6.7 cheerio@1.0.0-rc.12 dotenv
```

## ⚙️ Cấu hình

1. **Tạo file `.env`** trong thư mục gốc:
```env
SCRAPERAPI_KEY=f7e71afbac6f3cb929b51fe6300e3045
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=etsyData
```

2. **Lấy API Key từ ScraperAPI:**
   - Đăng ký tại: https://www.scraperapi.com/
   - Free plan: 1000 requests/month
   - Paid plans: nhiều features và requests hơn

## 🎯 Cách sử dụng

### 1. Sử dụng cơ bản

```javascript
const EtsyScraper = require('./ScraperAPI/etsy-scraper');

async function main() {
  const scraper = new EtsyScraper();
  
  // Tìm kiếm sản phẩm
  const products = await scraper.searchEtsyProducts('handmade jewelry', 1, 20);
  console.log(`Found ${products.length} products`);
  
  // Lưu vào database
  await scraper.saveProducts(products);
}

main();
```

### 2. Crawl nhiều từ khóa

```javascript
const scraper = new EtsyScraper();

const keywords = [
  'vintage rings',
  'handmade earrings',
  'custom necklace'
];

const allProducts = await scraper.crawlMultipleKeywords(keywords, 3);
console.log(`Total: ${allProducts.length} products`);
```

### 3. Crawl trending products

```javascript
const scraper = new EtsyScraper();

// Crawl trending theo category
const jewelry = await scraper.crawlTrendingProducts('jewelry');
const allTrending = await scraper.crawlTrendingProducts(); // All categories
```

### 4. Crawl chi tiết sản phẩm

```javascript
const productUrl = 'https://www.etsy.com/listing/123456789/example-product';
const details = await scraper.getProductDetails(productUrl);
console.log(details);
```

## 🔧 Configuration

Xem file `config.js` để tùy chỉnh:

- **Delays**: Thời gian nghỉ giữa các requests
- **Selectors**: CSS selectors để parse dữ liệu
- **Categories**: Danh mục Etsy
- **Keywords**: Từ khóa phổ biến

## 📊 Dữ liệu thu thập

### Product Data Structure
```javascript
{
  product_id: "123456789",
  title: "Handmade Silver Ring",
  price: "$45.00",
  shop_name: "ArtisanJewelry",
  image_url: "https://...",
  product_url: "https://www.etsy.com/listing/...",
  rating: "4.8 stars",
  keyword_searched: "handmade jewelry",
  scraped_at: new Date(),
  source: "etsy"
}
```

### Detailed Product Data
```javascript
{
  // ... basic data ...
  description: "Beautiful handcrafted ring...",
  images: ["url1", "url2", "url3"],
  tags: ["handmade", "jewelry", "ring"],
  category: "Jewelry",
  reviews_count: "150 reviews",
  shop_url: "/shop/ArtisanJewelry"
}
```

## 🚀 Chạy Demo

```bash
node ScraperAPI/demo-etsy.js
```

## 📝 Ví dụ Scripts

### Script 1: Crawl by Keywords
```javascript
// crawl-keywords.js
const EtsyScraper = require('./ScraperAPI/etsy-scraper');
const config = require('./ScraperAPI/config');

async function crawlKeywords() {
  const scraper = new EtsyScraper();
  
  // Sử dụng keywords từ config
  const results = await scraper.crawlMultipleKeywords(
    config.popularKeywords.slice(0, 5), // Chỉ crawl 5 keywords đầu
    2 // 2 pages per keyword
  );
  
  console.log(`✅ Crawled ${results.length} products`);
}

crawlKeywords();
```

### Script 2: Monitor Trending
```javascript
// monitor-trending.js
const EtsyScraper = require('./ScraperAPI/etsy-scraper');

async function monitorTrending() {
  const scraper = new EtsyScraper();
  
  const categories = ['jewelry', 'clothing', 'home', 'art'];
  
  for (const category of categories) {
    console.log(`\n📈 Crawling trending: ${category}`);
    const products = await scraper.crawlTrendingProducts(category);
    console.log(`Found ${products.length} trending products in ${category}`);
    
    await scraper.delay(5000); // 5s delay between categories
  }
}

monitorTrending();
```

## ⚠️ Lưu ý quan trọng

1. **Rate Limiting**: Luôn có delay giữa các requests
2. **ScraperAPI Credits**: Theo dõi usage để không vượt quá limit
3. **Selectors**: Etsy có thể thay đổi HTML structure, cần update selectors
4. **Error Handling**: Luôn có try-catch cho các network requests
5. **Data Quality**: Validate dữ liệu trước khi lưu vào database

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **403/429 Errors**: 
   - Tăng delay giữa requests
   - Sử dụng rotating proxies
   - Check ScraperAPI credit

2. **Parsing Errors**:
   - Etsy đã thay đổi HTML structure
   - Update selectors trong config.js

3. **Database Errors**:
   - Check MongoDB connection
   - Verify collection permissions

## 📈 Performance Tips

1. **Parallel Processing**: Crawl nhiều keywords song song (cẩn thận với rate limit)
2. **Caching**: Cache kết quả để tránh crawl lặp
3. **Incremental Updates**: Chỉ crawl sản phẩm mới
4. **Data Compression**: Compress large text fields

## 💡 Ý tưởng mở rộng

- 🔄 Scheduled crawling với cron jobs
- 📊 Analytics và reporting dashboard  
- 🔔 Alert system cho trending products
- 🎯 Price monitoring và tracking
- 🔍 Advanced search filters
- 📱 API endpoint cho frontend
- 🤖 AI-powered product categorization

## 🆘 Support

Nếu gặp vấn đề:
1. Check logs để identify error
2. Verify ScraperAPI account status
3. Test với single product trước
4. Check Etsy website changes

---

**Happy Scraping! 🎉** 