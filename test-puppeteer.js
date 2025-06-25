const puppeteer = require('puppeteer');
const config = require('./config');

async function testPuppeteerConnection() {
  console.log('🧪 Testing Puppeteer Connection to FastMoss...');
  
  let browser;
  try {
    // Launch browser with proxy
    const proxyServer = `${config.fastmoss.proxy.host}:${config.fastmoss.proxy.port}`;
    console.log(`🔗 Using proxy: ${proxyServer}`);
    
    browser = await puppeteer.launch({
      headless: false, // Show browser for testing
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
    
    const page = await browser.newPage();
    
    // Set proxy authentication
    await page.authenticate({
      username: config.fastmoss.proxy.username,
      password: config.fastmoss.proxy.password
    });
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('🌐 Navigating to FastMoss...');
    
    // Navigate to FastMoss
    await page.goto('https://www.fastmoss.com', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check if page loaded successfully
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('FastMoss') || title.includes('FastMoss')) {
      console.log('✅ Successfully connected to FastMoss!');
    } else {
      console.log('⚠️  Page loaded but content unclear');
    }
    
    // Test search functionality
    console.log('🔍 Testing search functionality...');
    
    try {
      await page.goto('https://www.fastmoss.com/e-commerce/search?page=1&words=test', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      console.log('✅ Search page loaded successfully');
      
      // Extract some basic info
      const searchInfo = await page.evaluate(() => {
        return {
          url: window.location.href,
          hasProducts: document.querySelectorAll('.product-item, .product-card, [data-testid="product"]').length > 0,
          bodyLength: document.body.innerText.length
        };
      });
      
      console.log('📊 Search page info:', searchInfo);
      
    } catch (searchError) {
      console.log('⚠️  Search test failed:', searchError.message);
    }
    
    console.log('⏳ Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
    console.log('🎉 Puppeteer test completed successfully!');
    
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Run the test
testPuppeteerConnection().catch(console.error); 