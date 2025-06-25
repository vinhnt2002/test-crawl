const fetch = require('node-fetch');
const cheerio = require('cheerio');
const create_db_tiktokshop = require('../lib/db_tiktokshop');

class EtsyScraper {
  constructor() {
    this.apiKey = process.env.SCRAPERAPI_KEY || 'f7e71afbac6f3cb929b51fe6300e3045';
    this.baseUrl = 'https://api.scraperapi.com/';
    this.db = null;
  }

  async initDatabase() {
    if (!this.db) {
      this.db = await create_db_tiktokshop();
    }
    return this.db;
  }

  // Tạo URL với ScraperAPI
  buildScraperUrl(targetUrl, options = {}) {
    const defaultOptions = {
      api_key: this.apiKey,
      url: targetUrl,
      render: 'false',
      country_code: 'US',
      ultra_premium: 'true', // Required for Etsy search pages
      ...options
    };
    
    const params = new URLSearchParams(defaultOptions);
    return `${this.baseUrl}?${params.toString()}`;
  }

  // Crawl danh sách sản phẩm Etsy theo từ khóa
  async searchEtsyProducts(keyword, page = 1, limit = 20, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const searchUrl = `https://www.etsy.com/search?q=${encodeURIComponent(keyword)}&page=${page}`;
        const scraperUrl = this.buildScraperUrl(searchUrl, { 
          render: 'true',
          ultra_premium: 'true'
        });
        
        console.log(`🔍 Searching Etsy for: ${keyword} (Page ${page}) - Attempt ${attempt}`);
        
        const response = await fetch(scraperUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`⚠️ HTTP ${response.status} - ${errorText.substring(0, 200)}`);
          
          if (response.status === 500 && attempt < retries) {
            console.log(`🔄 Retrying in ${attempt * 2} seconds...`);
            await this.delay(attempt * 2000);
            continue;
          }
          
          throw new Error(`HTTP error! status: ${response.status} - ${errorText.substring(0, 100)}`);
        }

        const html = await response.text();
        console.log(`✅ Got response: ${html.length} characters`);
        
        // Debug: Check if we have expected content
        if (!html.includes('etsy') && !html.includes('search')) {
          console.log('⚠️ Response may not be from Etsy. First 300 chars:', html.substring(0, 300));
        }
        
        return this.parseSearchResults(html, keyword);
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for ${keyword}:`, error.message);
        
        if (attempt === retries) {
          console.error(`❌ All ${retries} attempts failed for keyword: ${keyword}`);
          return [];
        }
        
        await this.delay(attempt * 1000);
      }
    }
    
    return [];
  }

  // Parse kết quả tìm kiếm
  parseSearchResults(html, keyword) {
    const $ = cheerio.load(html);
    const products = [];

    // Multiple selectors to try - Etsy changes their structure frequently
    const possibleSelectors = [
      '[data-test-id="search-results"] .v2-listing-card',
      '.listing-link',
      '[data-test-id="listing-card"]',
      '.search-listing-card',
      'a[href*="/listing/"]'
    ];

    let foundProducts = false;
    
    for (const selector of possibleSelectors) {
      const $items = $(selector);
      console.log(`🔍 Trying selector "${selector}" - found ${$items.length} elements`);
      
      if ($items.length > 0) {
        $items.each((index, element) => {
          try {
            const $item = $(element);
            
            // Try different ways to extract data
            const product = {
              title: this.extractText($item, [
                '.v2-listing-card__title',
                'h3',
                '[data-test-id="listing-title"]',
                '.listing-card-title'
              ]),
              price: this.extractText($item, [
                '.currency-value',
                '.price',
                '[data-test-id="price"]'
              ]),
              shop_name: this.extractText($item, [
                '.v2-listing-card__shop',
                '.shop-name',
                '[data-test-id="shop-name"]'
              ]),
              image_url: this.extractAttribute($item, [
                '.listing-link img',
                'img',
                '[data-test-id="listing-image"] img'
              ], 'src'),
              product_url: this.extractAttribute($item, [
                '.listing-link',
                'a[href*="/listing/"]',
                ''
              ], 'href') || $item.attr('href'),
              rating: this.extractAttribute($item, [
                '.shop2-review-review',
                '[data-test-id="rating"]'
              ], 'aria-label'),
              keyword_searched: keyword,
              scraped_at: new Date(),
              source: 'etsy'
            };

            // Tạo product_id từ URL
            if (product.product_url) {
              const urlMatch = product.product_url.match(/listing\/(\d+)/);
              product.product_id = urlMatch ? urlMatch[1] : null;
              
              // Đảm bảo URL đầy đủ
              if (!product.product_url.startsWith('http')) {
                product.product_url = 'https://www.etsy.com' + product.product_url;
              }
            }

            // Only add if we have essential data
            if ((product.title || product.product_url) && product.product_id) {
              products.push(product);
              foundProducts = true;
            }
          } catch (error) {
            console.error('Error parsing product:', error.message);
          }
        });
        
        if (foundProducts) break; // Stop trying other selectors
      }
    }

    console.log(`📦 Found ${products.length} products for keyword: ${keyword}`);
    
    // Debug information
    if (products.length === 0) {
      console.log('🔍 Debug: No products found. Checking HTML structure...');
      console.log('Available links:', $('a[href*="listing"]').length);
      console.log('Available images:', $('img').length);
      console.log('Page title:', $('title').text());
      
      // Save HTML for debugging
      if (html.length > 1000) {
        console.log('💾 Saving HTML snippet for analysis...');
        console.log('HTML snippet (first 1000 chars):', html.substring(0, 1000));
      }
    }
    
    return products;
  }
  
  // Helper function to extract text with multiple selectors
  extractText($element, selectors) {
    for (const selector of selectors) {
      const text = $element.find(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  }
  
  // Helper function to extract attributes with multiple selectors
  extractAttribute($element, selectors, attribute) {
    for (const selector of selectors) {
      const value = selector ? $element.find(selector).first().attr(attribute) : $element.attr(attribute);
      if (value) return value;
    }
    return '';
  }

  // Crawl chi tiết sản phẩm
  async getProductDetails(productUrl) {
    try {
      const scraperUrl = this.buildScraperUrl(productUrl, { render: 'true' });
      
      console.log(`🔍 Getting product details: ${productUrl}`);
      
      const response = await fetch(scraperUrl);
      const html = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return this.parseProductDetails(html, productUrl);
    } catch (error) {
      console.error(`❌ Error getting product details:`, error.message);
      return null;
    }
  }

  // Parse chi tiết sản phẩm
  parseProductDetails(html, productUrl) {
    const $ = cheerio.load(html);
    
    try {
      const details = {
        title: $('#listing-page-cart h1').text().trim(),
        price: $('[data-test-id="price"] .currency-value').text().trim(),
        description: $('#listing-page-cart [data-test-id="description-text"]').text().trim(),
        shop_name: $('[data-test-id="shop-name"]').text().trim(),
        shop_url: $('[data-test-id="shop-name"]').attr('href'),
        images: [],
        tags: [],
        category: $('[data-test-id="breadcrumb"] a').last().text().trim(),
        reviews_count: $('[data-test-id="review-count"]').text().trim(),
        rating: $('[data-test-id="star-rating"]').attr('aria-label'),
        product_url: productUrl,
        scraped_at: new Date(),
        source: 'etsy'
      };

      // Lấy tất cả hình ảnh
      $('[data-test-id="listing-page-image"] img').each((index, img) => {
        const src = $(img).attr('src');
        if (src) {
          details.images.push(src);
        }
      });

      // Lấy tags
      $('[data-test-id="tags"] a').each((index, tag) => {
        details.tags.push($(tag).text().trim());
      });

      // Tạo product_id
      const urlMatch = productUrl.match(/listing\/(\d+)/);
      details.product_id = urlMatch ? urlMatch[1] : null;

      return details;
    } catch (error) {
      console.error('Error parsing product details:', error.message);
      return null;
    }
  }

  // Lưu sản phẩm vào database
  async saveProducts(products, collection = 'etsyProducts') {
    try {
      await this.initDatabase();
      
      if (!products || products.length === 0) {
        console.log('📝 No products to save');
        return;
      }

      // Sử dụng collection etsy hoặc tạo mới
      // Access the MongoDB database through the tiktoks collection's db property
      const database = this.db.tiktoks.db || this.db.tiktoks.s.db;
      const etsyCollection = database.collection(collection);
      
      let savedCount = 0;
      let updatedCount = 0;

      for (const product of products) {
        if (!product.product_id) continue;

        try {
          const result = await etsyCollection.updateOne(
            { product_id: product.product_id },
            { $set: product },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) {
            savedCount++;
          } else if (result.modifiedCount > 0) {
            updatedCount++;
          }
        } catch (error) {
          console.error(`Error saving product ${product.product_id}:`, error.message);
        }
      }

      console.log(`💾 Saved: ${savedCount} new products, Updated: ${updatedCount} products`);
    } catch (error) {
      console.error('❌ Error saving products to database:', error.message);
    }
  }

  // Crawl nhiều từ khóa
  async crawlMultipleKeywords(keywords, pagesPerKeyword = 3) {
    const allProducts = [];
    
    for (const keyword of keywords) {
      console.log(`\n🚀 Starting crawl for keyword: ${keyword}`);
      
      for (let page = 1; page <= pagesPerKeyword; page++) {
        const products = await this.searchEtsyProducts(keyword, page);
        allProducts.push(...products);
        
        // Nghỉ giữa các request để tránh rate limit
        await this.delay(2000);
      }
      
      // Nghỉ giữa các từ khóa
      await this.delay(3000);
    }

    // Lưu tất cả sản phẩm
    await this.saveProducts(allProducts);
    
    console.log(`\n✅ Crawl completed! Total products: ${allProducts.length}`);
    return allProducts;
  }

  // Utility function để delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Crawl trending products
  async crawlTrendingProducts(category = '', limit = 50) {
    try {
      const trendingUrl = category 
        ? `https://www.etsy.com/c/${category}?ref=pagination&explicit=1&order=most_relevant`
        : 'https://www.etsy.com/trending?ref=pagination&explicit=1';
        
      const scraperUrl = this.buildScraperUrl(trendingUrl, { render: 'true' });
      
      console.log(`🔥 Crawling trending products from: ${category || 'all categories'}`);
      
      const response = await fetch(scraperUrl);
      const html = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const products = this.parseSearchResults(html, `trending_${category || 'all'}`);
      await this.saveProducts(products);
      
      return products;
    } catch (error) {
      console.error('❌ Error crawling trending products:', error.message);
      return [];
    }
  }
}

module.exports = EtsyScraper; 