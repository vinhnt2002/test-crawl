const fetch = require('node-fetch');
require('dotenv').config();

async function testScraperAPI() {
  const apiKey = process.env.SCRAPERAPI_KEY || 'f7e71afbac6f3cb929b51fe6300e3045';
  
  console.log('🔍 Testing ScraperAPI Connection...');
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  
  // Test 1: Simple request to httpbin
  console.log('\n=== Test 1: Simple HTTP Request ===');
  try {
    const testUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=https://httpbin.org/ip`;
    console.log(`Request URL: ${testUrl}`);
    
    const response = await fetch(testUrl);
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log(`Response: ${text}`);
    
    if (response.status === 200) {
      console.log('✅ ScraperAPI working correctly');
    } else {
      console.log('❌ ScraperAPI error');
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }
  
  // Test 2: Check account status
  console.log('\n=== Test 2: Account Status ===');
  try {
    const accountUrl = `https://api.scraperapi.com/account?api_key=${apiKey}`;
    const response = await fetch(accountUrl);
    const account = await response.json();
    
    console.log('Account info:', account);
    
    if (account.requestCount !== undefined) {
      console.log(`✅ Requests used: ${account.requestCount}/${account.requestLimit}`);
      console.log(`✅ Concurrent requests: ${account.concurrentRequests}`);
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
  
  // Test 3: Simple Etsy request without rendering
  console.log('\n=== Test 3: Simple Etsy Request (No Rendering) ===');
  try {
    const etsyUrl = 'https://www.etsy.com/';
    const scraperUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(etsyUrl)}`;
    console.log(`Request URL: ${scraperUrl}`);
    
    const response = await fetch(scraperUrl);
    console.log(`Status: ${response.status}`);
    
    const html = await response.text();
    console.log(`Response length: ${html.length} characters`);
    console.log(`Contains "Etsy": ${html.includes('Etsy')}`);
    
    if (response.status === 200 && html.includes('Etsy')) {
      console.log('✅ Basic Etsy access working');
    } else {
      console.log('❌ Etsy access failed');
      console.log('First 500 chars:', html.substring(0, 500));
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }
  
  // Test 4: Etsy search with different parameters
  console.log('\n=== Test 4: Etsy Search (Various Parameters) ===');
  const testConfigs = [
    { render: 'false', premium: 'false' },
    { render: 'true', premium: 'false' },
    { render: 'false', premium: 'true', country_code: 'US' }
  ];
  
  for (let i = 0; i < testConfigs.length; i++) {
    const config = testConfigs[i];
    console.log(`\nTest 4.${i + 1}: Config ${JSON.stringify(config)}`);
    
    try {
      const searchUrl = 'https://www.etsy.com/search?q=ring';
      const params = new URLSearchParams({
        api_key: apiKey,
        url: searchUrl,
        ...config
      });
      
      const scraperUrl = `https://api.scraperapi.com/?${params.toString()}`;
      console.log(`Request URL: ${scraperUrl.substring(0, 100)}...`);
      
      const response = await fetch(scraperUrl);
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        const html = await response.text();
        console.log(`✅ Config ${i + 1} works - Response: ${html.length} chars`);
        
        // Check if we have search results
        if (html.includes('search-results') || html.includes('listing')) {
          console.log('✅ Search results detected');
          break; // Found working config
        } else {
          console.log('⚠️ No search results detected');
        }
      } else {
        console.log(`❌ Config ${i + 1} failed - Status: ${response.status}`);
        const error = await response.text();
        console.log(`Error: ${error.substring(0, 200)}`);
      }
      
      // Delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Test 4.${i + 1} failed:`, error.message);
    }
  }
}

// Run test
if (require.main === module) {
  testScraperAPI();
}

module.exports = { testScraperAPI }; 