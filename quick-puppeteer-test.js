const puppeteer = require('puppeteer');
const config = require('./config');

async function quickTest() {
  console.log('⚡ Quick Puppeteer Test...');
  
  let browser;
  try {
    const proxyServer = `${config.fastmoss.proxy.host}:${config.fastmoss.proxy.port}`;
    
    browser = await puppeteer.launch({
      headless: true, // Run in background
      args: [`--proxy-server=${proxyServer}`, '--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.authenticate({
      username: config.fastmoss.proxy.username,
      password: config.fastmoss.proxy.password
    });
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');
    
    // Quick test to FastMoss
    await page.goto('https://www.fastmoss.com', { timeout: 30000 });
    
    const title = await page.title();
    console.log(`✅ Connected! Title: ${title.substring(0, 50)}...`);
    
    // Test IP
    await page.goto('https://httpbin.org/ip', { timeout: 15000 });
    const ipInfo = await page.evaluate(() => document.body.innerText);
    console.log(`🌍 Proxy IP: ${JSON.parse(ipInfo).origin}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

quickTest(); 