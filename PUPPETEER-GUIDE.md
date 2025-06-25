# 🤖 FastMoss Puppeteer Crawler Guide

## 📋 Overview
This guide covers the **Browser Automation** solution for FastMoss crawling using Puppeteer to maintain sessions and avoid authentication issues.

## 🚀 Quick Start

### 1. Test Connection
```bash
npm run test-puppeteer
```
- Opens browser window with proxy
- Navigates to FastMoss
- Shows page for manual inspection

### 2. Quick Background Test
```bash
node quick-puppeteer-test.js
```
- Runs headless test
- Verifies proxy connection
- Shows IP and title

### 3. Run Full Crawler
```bash
npm run puppeteer
```
- Starts full browser automation crawler
- Handles login automatically
- Crawls keywords and sellers

## 🔧 Configuration

### Browser Settings
- **Headless**: Set to `false` for testing, `true` for production
- **Proxy**: Automatically uses config.js proxy settings
- **User Agent**: Chrome 136 Windows
- **Viewport**: 1920x1080

### Session Management
- Auto-detects login status
- Waits for manual login if needed
- Maintains session throughout crawling

## 📖 How It Works

### 1. **Session Setup**
```javascript
await crawler.setupSession();
```
- Opens browser with proxy
- Navigates to FastMoss
- Checks if already logged in
- Prompts for manual login if needed

### 2. **Keyword Crawling**
```javascript
await crawler.runKeywordCrawler();
```
- Processes keywords from database
- Navigates to search pages
- Extracts product information
- Updates database with results

### 3. **Seller Crawling**
```javascript
await crawler.runSellerCrawler();
```
- Processes sellers from database
- Navigates to seller pages
- Extracts product information
- Updates database with results

## 🎯 Features

### ✅ **Advantages**
- **Real Browser**: Maintains cookies and session
- **No Authentication Issues**: Uses actual login session
- **Dynamic Content**: Handles JavaScript rendering
- **Anti-Bot Resistance**: Appears as normal user
- **Visual Debugging**: Can see what's happening

### ⚠️ **Considerations**
- **Resource Heavy**: Uses more CPU/RAM
- **Slower**: Takes longer than HTTP requests
- **Manual Login**: May require user intervention
- **Browser Dependency**: Needs Chrome/Chromium

## 🔍 Debugging

### Enable Visual Mode
```javascript
headless: false  // in puppeteer-crawler.js
```

### Monitor Network Requests
```javascript
await this.interceptAPIRequests();
```

### Console Logging
All actions are logged with emojis:
- 🚀 Initialization
- 🌐 Navigation
- 🔍 Searching
- ✅ Success
- ❌ Errors

## 📊 Performance

### Expected Speeds
- **Page Load**: 2-5 seconds
- **Product Extraction**: 1-2 seconds
- **Between Pages**: 3-8 seconds (random delay)

### Resource Usage
- **RAM**: ~200-500MB per browser instance
- **CPU**: Moderate during page loads
- **Network**: Same as manual browsing

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Browser Won't Start**
```bash
# Install Chromium dependencies
npm install puppeteer --force
```

#### 2. **Proxy Authentication Failed**
- Check proxy credentials in config.js
- Verify proxy is active

#### 3. **Login Required**
- Script will pause for 60 seconds
- Login manually in opened browser
- Script continues automatically

#### 4. **Page Load Timeout**
- Increase timeout in config
- Check internet connection
- Verify proxy stability

### Debug Commands
```bash
# Test proxy connection
npm run test-proxy

# Test browser connection
npm run test-puppeteer

# Quick connection test
node quick-puppeteer-test.js
```

## 🔄 Workflow

### Development Workflow
1. Test proxy: `npm run test-proxy`
2. Test browser: `npm run test-puppeteer`
3. Run crawler: `npm run puppeteer`

### Production Workflow
1. Set `headless: true`
2. Setup auto-login mechanism
3. Monitor logs
4. Handle errors gracefully

## 📈 Optimization Tips

### 1. **Reduce Resource Usage**
```javascript
args: [
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--disable-gpu'
]
```

### 2. **Faster Page Loads**
```javascript
await page.setRequestInterception(true);
page.on('request', (req) => {
  if(req.resourceType() == 'image'){
    req.abort();
  } else {
    req.continue();
  }
});
```

### 3. **Session Persistence**
- Save cookies to file
- Restore on restart
- Avoid re-login

## 🚨 Security Notes

### Login Security
- Never hardcode credentials
- Use environment variables
- Consider OAuth if available

### Proxy Security
- Use HTTPS proxies when possible
- Rotate proxy IPs regularly
- Monitor for IP bans

## 📋 Next Steps

### Immediate Actions
1. ✅ Test basic connection
2. ✅ Verify login process
3. ✅ Run sample crawl
4. ⏳ Monitor results
5. ⏳ Optimize performance

### Future Enhancements
- [ ] Auto-login with saved credentials
- [ ] Multiple browser instances
- [ ] Cookie persistence
- [ ] Captcha solving integration
- [ ] Headless screenshot debugging

---

## 🆘 Support

If you encounter issues:
1. Check logs for error messages
2. Verify proxy connection
3. Test with headless: false
4. Check database connectivity
5. Monitor FastMoss for changes

**Happy Crawling!** 🕷️✨ 