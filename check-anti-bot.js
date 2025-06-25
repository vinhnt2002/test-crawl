const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const crypto = require("crypto");
const config = require("./config");
const qs = require("qs");

class AntiBotChecker {
  constructor() {
    this.results = {
      rateLimiting: false,
      captchaDetected: false,
      ipBlocked: false,
      browserFingerprinting: false,
      successfulRequests: 0,
      failedRequests: 0,
      errorCodes: {},
      responseTimes: [],
      patterns: []
    };
  }

  // Encryption function like in main file
  encryptParams(params) {
    const sortedKeys = Object.keys(params).sort();
    let concatenatedString = "";
    sortedKeys.forEach((key) => {
      concatenatedString += key + params[key] + "asjdfoaur3ur829322";
    });

    let hash = crypto
        .createHash("md5")
        .update(concatenatedString)
        .digest("hex"),
      result = "",
      leftIndex = 0,
      rightIndex = hash.length - 1;

    for (
      ;
      leftIndex < hash.length && !(leftIndex >= rightIndex);
      leftIndex++, rightIndex--
    ) {
      const leftValue = parseInt(hash[leftIndex], 16);
      const rightValue = parseInt(hash[rightIndex], 16);
      result += (leftValue ^ rightValue).toString(16);
    }

    return result + hash.substring(leftIndex);
  }

  // Create axios instance with proxy
  createAxiosInstance() {
    const proxyUrl = `http://${config.fastmoss.proxy.username}:${config.fastmoss.proxy.password}@${config.fastmoss.proxy.host}:${config.fastmoss.proxy.port}`;
    
    const instance = axios.create({
      baseURL: config.fastmoss.baseURL,
      timeout: 30000,
      httpsAgent: new HttpsProxyAgent(proxyUrl),
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        cookie: "NEXT_LOCALE=en; region=US; utm_country=US; utm_south=google; utm_id=ggfm; fp_visid=ec10676ba005ba2ad0e322e9ea268396; _gcl_aw=GCL.1750676004.EAIaIQobChMIvoKkorCHjgMV-i1ECB2VGy-yEAAYASAAEgJixPD_BwE; _gcl_gs=2.1.k1$i1750675984$u14116896; _gcl_au=1.1.1799899988.1750676004; _ga=GA1.1.1612717656.1750676004; _fbp=fb.1.1750676004748.699180781851569929; _tt_enable_cookie=1; _ttp=01JYE6QS9T0K6JSTHFBWSHH24H_.tt.1; fd_id=uyjCF1iql7LU54GEJT3etNfY6raWAQxD; _ss_s_uid=1dbc9ee57fc6bff97a43791070f1615e; fd_tk_exp=1751972065; fd_tk=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTE5NzIwNjUsInN1YiI6ImM3NmU1N2VhYjNlMjBlMDA5MTY2Yzc3NWRhNDQ4N2JhIiwibmJmIjoxNzUwNjc2MDY1LCJhdWQiOnsib3Blbl9pZCI6IiIsIm5pY2tuYW1lIjoiRmFzdE1vc3PnlKjmiLciLCJwbGF0Zm9ybSI6MSwiZW1haWwiOiJ2aW5odXMyMDAyQGdtYWlsLmNvbSIsInJlZ2lvbiI6IlVTIiwic291cmNlIjoxLCJkb21haW4iOiJ3d3cuZmFzdG1vc3MuY29tIiwidWlkIjoxMDkxNjE2NiwiYmVoYXZpb3IiOjIsImxvZ2luX3NvdXJjZSI6InBjIiwidmlzaXRvcl9pZCI6ImVjMTA2NzZiYTAwNWJhMmFkMGUzMjJlOWVhMjY4Mzk2IiwiZnBfdmlzaWQiOiJhMWVmZGQ2Yjk1NDk0ZDhlYjhjNDI0ZmU3MWIyNGJjZiIsImNyZWF0ZV90aW1lIjoxNzUwNjc2MDY1fSwiaWF0IjoxNzUwNjc2MDY1LCJqdGkiOiJjNzZlNTdlYWIzZTIwZTAwOTE2NmM3NzVkYTQ0ODdiYSIsImlzcyI6Ind3dy5mYXN0bW9zcy5jb20iLCJzdGF0dXMiOjEsImRhdGEiOm51bGx9.v2saTpFZ7QOqUecskcv3gV2U14oh0cAR4BaTVqsLYck; ttcsid=1750676062184::FmPUTimykQb7xZy8fJir.1.1750676062184; _ga_J8P3E5KDGJ=GS2.1.s1750734183$o3$g1$t1750734219$j24$l0$h580045803; _ga_GD8ST04HB5=GS2.1.s1750734183$o3$g1$t1750734220$j23$l0$h449577075; ttcsid_CJOP1H3C77UDO397C3M0=1750734193257::LOeiAP3Yh3QGW96kD0RB.3.1750734220119; _uetsid=493cff50502011f0ab465d4ec662aeb9|1l7wg50|2|fx1|0|2000; _uetvid=493d3150502011f0a35059d89c96cb0e|ua6muh|1750734811801|5|1|bat.bing.com/p/insights/c/n",
        lang: "EN_US",
        priority: "u=1, i",
        referer: "https://www.fastmoss.com/e-commerce/search?page=1&words=T-shirt",
        region: "US",
        "sec-ch-ua": '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        source: "pc",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      },
    });

    instance.interceptors.request.use((config) => {
      const params = {
        ...config.params,
        _time: Math.floor(Date.now() / 1e3),
        cnonce: Math.floor(1e7 + 9e7 * Math.random()),
      };
      config.params = params;
      config.headers["fm-sign"] = this.encryptParams(params);
      return config;
    });

    return instance;
  }

  // Single request test
  async makeRequest(endpoint, params, testName) {
    const startTime = Date.now();
    try {
      const instance = this.createAxiosInstance();
      const response = await instance.get(endpoint, { params });
      const responseTime = Date.now() - startTime;
      
      this.results.responseTimes.push(responseTime);
      this.results.successfulRequests++;
      
      const result = {
        testName,
        status: response.status,
        responseTime,
        data: response.data,
        headers: response.headers
      };
      
      this.analyzeResponse(result);
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.results.failedRequests++;
      
      const errorCode = error.response?.status || error.code;
      this.results.errorCodes[errorCode] = (this.results.errorCodes[errorCode] || 0) + 1;
      
      const result = {
        testName,
        status: errorCode,
        responseTime,
        error: error.message,
        data: error.response?.data,
        headers: error.response?.headers
      };
      
      this.analyzeResponse(result);
      return result;
    }
  }

  // Analyze response for anti-bot patterns
  analyzeResponse(result) {
    const { data, status, headers } = result;
    
    // Check for captcha patterns
    if (typeof data === 'string') {
      if (data.includes('captcha') || data.includes('hCaptcha') || data.includes('reCAPTCHA')) {
        this.results.captchaDetected = true;
        this.results.patterns.push(`CAPTCHA detected in ${result.testName}`);
      }
      
      if (data.includes('rate limit') || data.includes('too many requests')) {
        this.results.rateLimiting = true;
        this.results.patterns.push(`Rate limiting detected in ${result.testName}`);
      }
      
      if (data.includes('blocked') || data.includes('forbidden')) {
        this.results.ipBlocked = true;
        this.results.patterns.push(`IP blocking detected in ${result.testName}`);
      }
    }
    
    // Check API response codes
    if (data && typeof data === 'object') {
      if (data.code === 408 && data.ext?.is_login === 0) {
        this.results.patterns.push(`Login required in ${result.testName}`);
      }
      
      if (data.code === 403) {
        this.results.ipBlocked = true;
        this.results.patterns.push(`403 Forbidden in ${result.testName}`);
      }
      
      if (data.code === 429) {
        this.results.rateLimiting = true;
        this.results.patterns.push(`429 Too Many Requests in ${result.testName}`);
      }
    }
    
    // Check HTTP status codes
    if (status === 429) {
      this.results.rateLimiting = true;
    }
    if (status === 403) {
      this.results.ipBlocked = true;
    }
    
    // Check headers for anti-bot signals
    if (headers) {
      if (headers['cf-ray']) {
        this.results.patterns.push(`Cloudflare detected in ${result.testName}`);
      }
      if (headers['server']?.includes('cloudflare')) {
        this.results.patterns.push(`Cloudflare server in ${result.testName}`);
      }
    }
  }

  // Test rate limiting
  async testRateLimiting() {
    console.log('\n🔄 Testing Rate Limiting...');
    const results = [];
    
    // Send 10 requests rapidly
    for (let i = 0; i < 10; i++) {
      console.log(`  Request ${i + 1}/10...`);
      const result = await this.makeRequest(
        '/api/goods/V2/search',
        { page: 1, pagesize: 10, order: '2,2', region: 'US', words: 'test' },
        `Rate_Test_${i + 1}`
      );
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Test different endpoints
  async testEndpoints() {
    console.log('\n🎯 Testing Different Endpoints...');
    const tests = [
      {
        endpoint: '/api/goods/V2/search',
        params: { page: 1, pagesize: 10, order: '2,2', region: 'US', words: 'shirt' },
        name: 'Search_Endpoint'
      },
      {
        endpoint: '/api/shop/v2/goods/',
        params: { id: '123456789', page: 1, pagesize: 10, date_type: -1, order: '3,2' },
        name: 'Shop_Endpoint'
      },
      {
        endpoint: '/api/user/profile',
        params: {},
        name: 'Profile_Endpoint'
      }
    ];
    
    const results = [];
    for (const test of tests) {
      console.log(`  Testing ${test.name}...`);
      const result = await this.makeRequest(test.endpoint, test.params, test.name);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }

  // Test with different user agents
  async testUserAgents() {
    console.log('\n🤖 Testing Different User Agents...');
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      'python-requests/2.28.1',
      'curl/7.68.0'
    ];
    
    const results = [];
    for (let i = 0; i < userAgents.length; i++) {
      console.log(`  Testing User Agent ${i + 1}/${userAgents.length}...`);
      
      const instance = this.createAxiosInstance();
      instance.defaults.headers['user-agent'] = userAgents[i];
      
      try {
        const response = await instance.get('/api/goods/V2/search', {
          params: { page: 1, pagesize: 10, order: '2,2', region: 'US', words: 'test' }
        });
        
        results.push({
          userAgent: userAgents[i],
          status: response.status,
          success: true,
          data: response.data
        });
        
      } catch (error) {
        results.push({
          userAgent: userAgents[i],
          status: error.response?.status || error.code,
          success: false,
          error: error.message
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return results;
  }

  // Generate comprehensive report
  generateReport() {
    const avgResponseTime = this.results.responseTimes.length > 0 
      ? this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length 
      : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('🛡️  FASTMOSS ANTI-BOT ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    console.log('\n📊 REQUEST STATISTICS:');
    console.log(`  ✅ Successful Requests: ${this.results.successfulRequests}`);
    console.log(`  ❌ Failed Requests: ${this.results.failedRequests}`);
    console.log(`  ⏱️  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
    console.log('\n🚫 ANTI-BOT MECHANISMS DETECTED:');
    console.log(`  🤖 Rate Limiting: ${this.results.rateLimiting ? '❌ DETECTED' : '✅ NOT DETECTED'}`);
    console.log(`  🧩 Captcha: ${this.results.captchaDetected ? '❌ DETECTED' : '✅ NOT DETECTED'}`);
    console.log(`  🚧 IP Blocking: ${this.results.ipBlocked ? '❌ DETECTED' : '✅ NOT DETECTED'}`);
    console.log(`  🖥️  Browser Fingerprinting: ${this.results.browserFingerprinting ? '❌ DETECTED' : '✅ NOT DETECTED'}`);
    
    if (Object.keys(this.results.errorCodes).length > 0) {
      console.log('\n🔢 ERROR CODE FREQUENCY:');
      Object.entries(this.results.errorCodes).forEach(([code, count]) => {
        console.log(`  ${code}: ${count} occurrences`);
      });
    }
    
    if (this.results.patterns.length > 0) {
      console.log('\n🔍 DETECTED PATTERNS:');
      this.results.patterns.forEach(pattern => {
        console.log(`  • ${pattern}`);
      });
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    if (this.results.rateLimiting) {
      console.log('  • Implement request delays (5-10 seconds between requests)');
      console.log('  • Use request queuing system');
    }
    if (this.results.captchaDetected) {
      console.log('  • Consider using captcha solving services');
      console.log('  • Implement browser automation (Selenium/Puppeteer)');
    }
    if (this.results.ipBlocked) {
      console.log('  • Rotate IP addresses/proxies');
      console.log('  • Use residential proxies');
    }
    if (!this.results.rateLimiting && !this.results.captchaDetected && !this.results.ipBlocked) {
      console.log('  • Current setup appears viable for crawling');
      console.log('  • Monitor for gradual restrictions');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  // Main test runner
  async runFullTest() {
    console.log('🚀 Starting FastMoss Anti-Bot Detection Test...');
    
    try {
      // Test different endpoints
      await this.testEndpoints();
      
      // Test rate limiting
      await this.testRateLimiting();
      
      // Test user agents
      await this.testUserAgents();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Run the test
(async () => {
  const checker = new AntiBotChecker();
  await checker.runFullTest();
})(); 