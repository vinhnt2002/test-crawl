const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const config = require("./config");

async function testProxy() {
  console.log("🔍 Testing proxy connection...");
  
  try {
    // Create proxy URL with authentication
    const proxyUrl = `http://${config.fastmoss.proxy.username}:${config.fastmoss.proxy.password}@${config.fastmoss.proxy.host}:${config.fastmoss.proxy.port}`;
    console.log("Proxy URL:", `http://${config.fastmoss.proxy.username}:****@${config.fastmoss.proxy.host}:${config.fastmoss.proxy.port}`);
    
    // Test with httpbin to check IP
    const testInstance = axios.create({
      httpsAgent: new HttpsProxyAgent(proxyUrl),
      timeout: 30000
    });
    
    console.log("📡 Testing IP address through proxy...");
    const ipResponse = await testInstance.get('https://httpbin.org/ip');
    console.log("✅ Proxy IP:", ipResponse.data.origin);
    
    console.log("📡 Testing FastMoss connection...");
    const fastmossInstance = axios.create({
      baseURL: config.fastmoss.baseURL,
      httpsAgent: new HttpsProxyAgent(proxyUrl),
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    
    const fastmossResponse = await fastmossInstance.get('/');
    console.log("✅ FastMoss connection successful, status:", fastmossResponse.status);
    
    console.log("\n🎉 Proxy test completed successfully!");
    console.log("✅ Your proxy is working correctly");
    console.log("✅ FastMoss is accessible through the proxy");
    
  } catch (error) {
    console.error("❌ Proxy test failed:");
    
    if (error.code === 'ECONNREFUSED') {
      console.error("   Connection refused - check proxy host and port");
    } else if (error.code === 'ENOTFOUND') {
      console.error("   Host not found - check proxy host");
    } else if (error.code === 'ECONNRESET') {
      console.error("   Connection reset - proxy may be down");
    } else if (error.response?.status === 407) {
      console.error("   Proxy authentication failed - check username/password");
    } else if (error.code === 'ETIMEDOUT') {
      console.error("   Connection timeout - proxy may be slow or blocked");
    } else {
      console.error("   Error:", error.message);
    }
    
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Verify proxy credentials are correct");
    console.log("2. Check if proxy server is online");
    console.log("3. Ensure firewall allows outbound connections");
    console.log("4. Try testing proxy with another tool");
    
    process.exit(1);
  }
}

// Run the test
testProxy(); 