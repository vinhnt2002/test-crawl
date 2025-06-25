const puppeteer = require('puppeteer');
const { ObjectId } = require("mongodb");
const config = require("./config");
const create_db_tiktokshop = require("./lib/db_tiktokshop");
const { oneDayAgo, timeNow } = require("./data/constant");
const { sleep } = require("./old_/src/status_product");
const { get_trademark } = require("./lib/helps");
const striptags = require("striptags");

class PuppeteerFastMossCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.db = null;
    this.BLACK_TM = null;
    this.regex = null;
    this.isLoggedIn = false;
    this.sessionActive = false;
  }

  async init() {
    console.log('🚀 Initializing Puppeteer FastMoss Crawler...');
    
    // Initialize database
    this.db = await create_db_tiktokshop();
    this.BLACK_TM = await get_trademark(this.db.settings, true);
    this.regex = new RegExp(this.BLACK_TM, "im");
    
    // Launch browser with proxy
    const proxyServer = `${config.fastmoss.proxy.host}:${config.fastmoss.proxy.port}`;
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      args: [
        `--proxy-server=${proxyServer}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set proxy authentication
    await this.page.authenticate({
      username: config.fastmoss.proxy.username,
      password: config.fastmoss.proxy.password
    });
    
    // Set user agent and viewport
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized with proxy');
  }

  async navigateToFastMoss() {
    console.log('🌐 Navigating to FastMoss...');
    
    try {
      await this.page.goto('https://www.fastmoss.com', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });
      
      console.log('✅ Successfully loaded FastMoss');
      return true;
    } catch (error) {
      console.error('❌ Failed to load FastMoss:', error.message);
      return false;
    }
  }

  async checkLoginStatus() {
    try {
      // Check if login elements exist
      const loginButton = await this.page.$('[data-testid="login"], .login-btn, a[href*="login"]');
      const userProfile = await this.page.$('.user-profile, .user-menu, [data-testid="user-menu"]');
      
      if (userProfile && !loginButton) {
        this.isLoggedIn = true;
        console.log('✅ Already logged in');
        return true;
      }
      
      this.isLoggedIn = false;
      console.log('❌ Not logged in');
      return false;
    } catch (error) {
      console.log('⚠️  Could not determine login status');
      return false;
    }
  }

  async attemptLogin() {
    console.log('🔐 Attempting to login...');
    
    try {
      // Look for login button/link
      const loginSelectors = [
        'a[href*="login"]',
        '.login-btn',
        '[data-testid="login"]',
        'button:contains("Login")',
        'a:contains("Login")',
        'a:contains("Sign")'
      ];
      
      let loginElement = null;
      for (const selector of loginSelectors) {
        try {
          loginElement = await this.page.$(selector);
          if (loginElement) break;
        } catch (e) {}
      }
      
      if (loginElement) {
        await loginElement.click();
        await this.page.waitForTimeout(3000);
        
        console.log('🔄 Login page opened. Please login manually...');
        console.log('⏳ Waiting 60 seconds for manual login...');
        
        // Wait for user to login manually
        await this.page.waitForTimeout(60000);
        
        // Check if login was successful
        return await this.checkLoginStatus();
      } else {
        console.log('❌ Could not find login button');
        return false;
      }
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      return false;
    }
  }

  async setupSession() {
    const success = await this.navigateToFastMoss();
    if (!success) return false;
    
    await this.page.waitForTimeout(3000);
    
    const isLoggedIn = await this.checkLoginStatus();
    if (!isLoggedIn) {
      console.log('🔐 Need to login first...');
      const loginSuccess = await this.attemptLogin();
      if (!loginSuccess) {
        console.log('❌ Failed to login. Continuing without authentication...');
      }
    }
    
    this.sessionActive = true;
    return true;
  }

  async interceptAPIRequests() {
    // Enable request interception
    await this.page.setRequestInterception(true);
    
    const apiResponses = [];
    
    this.page.on('response', async (response) => {
      const url = response.url();
      
      // Capture API responses we're interested in
      if (url.includes('/api/goods/V2/search') || url.includes('/api/shop/v2/goods')) {
        try {
          const data = await response.json();
          apiResponses.push({
            url,
            status: response.status(),
            data
          });
          console.log(`📡 API Response: ${url} - Status: ${response.status()}`);
        } catch (error) {
          console.log(`⚠️  Could not parse API response from ${url}`);
        }
      }
    });
    
    return apiResponses;
  }

  async searchProducts(keyword, page = 1) {
    console.log(`🔍 Searching for: ${keyword} (page ${page})`);
    
    try {
      // Navigate to search page
      const searchUrl = `https://www.fastmoss.com/e-commerce/search?page=${page}&words=${encodeURIComponent(keyword)}`;
      await this.page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await this.page.waitForTimeout(2000);
      
      // Wait for products to load
      await this.page.waitForSelector('.product-item, .product-card, [data-testid="product"]', { 
        timeout: 10000 
      }).catch(() => {
        console.log('⚠️  Product selector not found, continuing...');
      });
      
      // Extract product data from the page
      const products = await this.page.evaluate(() => {
        const productElements = document.querySelectorAll('.product-item, .product-card, [data-testid="product"]');
        const products = [];
        
        productElements.forEach(element => {
          try {
            const titleElement = element.querySelector('.title, .product-title, h3, h4');
            const salesElement = element.querySelector('.sales, .sold-count, .week-sold');
            const idElement = element.querySelector('[data-product-id]');
            
            if (titleElement) {
              products.push({
                title: titleElement.textContent?.trim(),
                sales: salesElement?.textContent?.trim() || '0',
                id: idElement?.getAttribute('data-product-id') || Math.random().toString(),
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.log('Error extracting product:', error);
          }
        });
        
        return products;
      });
      
      console.log(`📦 Found ${products.length} products`);
      return products;
      
    } catch (error) {
      console.error(`❌ Search failed for ${keyword}:`, error.message);
      return [];
    }
  }

  async crawlSellerProducts(sellerId, page = 1) {
    console.log(`🏪 Crawling seller: ${sellerId} (page ${page})`);
    
    try {
      // Navigate to seller page
      const sellerUrl = `https://www.fastmoss.com/shop/${sellerId}?page=${page}`;
      await this.page.goto(sellerUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await this.page.waitForTimeout(2000);
      
      // Extract seller products
      const products = await this.page.evaluate(() => {
        const productElements = document.querySelectorAll('.product-item, .shop-product, [data-testid="shop-product"]');
        const products = [];
        
        productElements.forEach(element => {
          try {
            const titleElement = element.querySelector('.title, .product-title, h3, h4');
            const salesElement = element.querySelector('.sales, .sold-count, .week-sold');
            
            if (titleElement) {
              products.push({
                title: titleElement.textContent?.trim(),
                sales: salesElement?.textContent?.trim() || '0',
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.log('Error extracting seller product:', error);
          }
        });
        
        return products;
      });
      
      console.log(`🏪 Found ${products.length} seller products`);
      return products;
      
    } catch (error) {
      console.error(`❌ Seller crawl failed for ${sellerId}:`, error.message);
      return [];
    }
  }

  async processProducts(products, source = 'fastmoss') {
    let successfulInserts = 0;
    
    for (const productData of products) {
      if (this.shouldSkipProduct(productData)) continue;
      
      const product = this.createProductObject(productData, source);
      
      try {
        await this.db.tiktoks.insertOne(product);
        successfulInserts++;
        console.log(`✅ Inserted: ${product.product_id} - ${product.week_sold_count} sales`);
      } catch (error) {
        // Update existing product
        await this.updateExistingProduct(productData);
      }
    }
    
    return successfulInserts;
  }

  shouldSkipProduct(product) {
    const title = product.title || '';
    return (
      title.search(/shirt|hoodie/gim) === -1 ||
      title.search(this.regex) > -1
    );
  }

  createProductObject(productData, source) {
    const title = productData.title || '';
    const status = this.regex.test(title) ? "black" : null;
    const salesText = productData.sales || '0';
    const weekSoldCount = parseInt(salesText.replace(/[^\d]/g, '')) || 0;
    
    return {
      product_id: productData.id || Math.random().toString(),
      title: striptags(title),
      week_sold_count: weekSoldCount,
      source,
      createTime: productData.timestamp || timeNow(),
      seller_id: productData.sellerId || '',
      status,
    };
  }

  async updateExistingProduct(productData) {
    const salesText = productData.sales || '0';
    const weekSoldCount = parseInt(salesText.replace(/[^\d]/g, '')) || 0;
    
    await this.db.tiktoks.updateOne(
      { product_id: productData.id },
      {
        $set: {
          week_sold_count: Math.max(weekSoldCount, 0),
        },
      }
    );
  }

  async runKeywordCrawler() {
    console.log('🔄 Starting keyword crawler...');
    
    while (true) {
      try {
        const keywords = await this.db.keywords
          .find({
            $or: [
              { fastmoss: null },
              { fastmoss: { $lt: oneDayAgo + 86400 } },
            ],
          })
          .sort("fastmoss", 1)
          .limit(1)
          .toArray();
        
        if (keywords.length === 0) {
          console.log('⏳ No keywords to process, waiting...');
          await sleep(3600 * 1000);
          continue;
        }
        
        for (const keyword of keywords) {
          console.log(`🎯 Processing keyword: ${keyword.keyword}`);
          
          let totalInserts = 0;
          let page = 1;
          
          while (page <= 5) { // Limit to 5 pages
            const products = await this.searchProducts(keyword.keyword, page);
            
            if (products.length === 0) break;
            
            const inserts = await this.processProducts(products);
            totalInserts += inserts;
            
            console.log(`📄 Page ${page}: ${inserts} products inserted`);
            
            // Random delay between pages
            await sleep(Math.random() * 5000 + 3000);
            page++;
          }
          
          // Update keyword status
          await this.db.keywords.updateOne(
            { _id: keyword._id },
            {
              $set: { fastmoss: timeNow() },
              $inc: { fastmoss_count: totalInserts },
            }
          );
          
          console.log(`✅ Completed keyword: ${keyword.keyword} (${totalInserts} total products)`);
        }
        
      } catch (error) {
        console.error('❌ Keyword crawler error:', error.message);
        await sleep(30000); // Wait 30 seconds on error
      }
    }
  }

  async runSellerCrawler() {
    console.log('🏪 Starting seller crawler...');
    
    while (true) {
      try {
        const sellers = await this.db.seller_ids
          .find({
            $or: [
              { fastmoss: null },
              { fastmoss: { $lt: oneDayAgo + 86400 } },
            ],
          })
          .sort("fastmoss", 1)
          .limit(1)
          .toArray();
        
        if (sellers.length === 0) {
          console.log('⏳ No sellers to process, waiting...');
          await sleep(3600 * 1000);
          continue;
        }
        
        for (const seller of sellers) {
          console.log(`🏪 Processing seller: ${seller.seller_id}`);
          
          let totalInserts = 0;
          let page = 1;
          
          while (page <= 10) { // Limit to 10 pages
            const products = await this.crawlSellerProducts(seller.seller_id, page);
            
            if (products.length === 0) break;
            
            const inserts = await this.processProducts(products);
            totalInserts += inserts;
            
            console.log(`📄 Seller page ${page}: ${inserts} products inserted`);
            
            // Random delay between pages
            await sleep(Math.random() * 5000 + 3000);
            page++;
          }
          
          // Update seller status
          await this.db.seller_ids.updateOne(
            { _id: seller._id },
            {
              $set: { fastmoss: timeNow() },
              $inc: { fastmoss_count: totalInserts },
            }
          );
          
          console.log(`✅ Completed seller: ${seller.seller_id} (${totalInserts} total products)`);
        }
        
      } catch (error) {
        console.error('❌ Seller crawler error:', error.message);
        await sleep(30000); // Wait 30 seconds on error
      }
    }
  }

  async run() {
    try {
      await this.init();
      await this.setupSession();
      
      console.log('🚀 Starting crawlers...');
      
      // Run both crawlers in parallel
      await Promise.all([
        this.runKeywordCrawler(),
        this.runSellerCrawler()
      ]);
      
    } catch (error) {
      console.error('❌ Crawler failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the crawler
(async () => {
  const crawler = new PuppeteerFastMossCrawler();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await crawler.cleanup();
    process.exit(0);
  });
  
  await crawler.run();
})(); 