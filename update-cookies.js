const fs = require('fs');
const path = require('path');

function updateCookies(newCookies) {
  const filePath = path.join(__dirname, 'fassmost_seller_v2.js');
  
  try {
    // Read the current file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find and replace the cookie line
    const cookieRegex = /cookie:\s*"[^"]*"/;
    const newCookieLine = `cookie: "${newCookies}"`;
    
    if (cookieRegex.test(content)) {
      content = content.replace(cookieRegex, newCookieLine);
      
      // Write back to file
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log('✅ Cookies updated successfully!');
      console.log('🔧 New cookies length:', newCookies.length, 'characters');
      
      // Also update debug file
      const debugPath = path.join(__dirname, 'debug-api.js');
      let debugContent = fs.readFileSync(debugPath, 'utf8');
      debugContent = debugContent.replace(cookieRegex, newCookieLine);
      fs.writeFileSync(debugPath, debugContent, 'utf8');
      console.log('✅ Debug file cookies updated too!');
      
    } else {
      console.error('❌ Could not find cookie line in file');
    }
    
  } catch (error) {
    console.error('❌ Error updating cookies:', error.message);
  }
}

// Check if cookies provided as argument
const newCookies = process.argv[2];

if (!newCookies) {
  console.log(`
🍪 Cookie Updater for FastMoss Crawler

📋 Instructions:
1. Open FastMoss in browser and login
2. Open Developer Tools (F12)
3. Go to Network tab
4. Search for "t shirt" on the site
5. Find API request and copy the Cookie header value
6. Run: node update-cookies.js "YOUR_COOKIE_STRING"

Example:
node update-cookies.js "fd_id=xxx; _ga=xxx; fd_tk=xxx; ..."

Current cookies in file:
`);

  // Show current cookies
  const filePath = path.join(__dirname, 'fassmost_seller_v2.js');
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/cookie:\s*"([^"]*)"/);
  if (match) {
    const currentCookies = match[1];
    console.log('📄 Length:', currentCookies.length, 'characters');
    console.log('📄 Preview:', currentCookies.substring(0, 100) + '...');
    
    // Check if fd_tk exists and when it expires
    const fdTkMatch = currentCookies.match(/fd_tk=([^;]+)/);
    if (fdTkMatch) {
      try {
        const tokenPart = fdTkMatch[1].split('.')[1];
        const decoded = JSON.parse(Buffer.from(tokenPart, 'base64').toString());
        const expiry = new Date(decoded.exp * 1000);
        console.log('⏰ Token expires:', expiry.toLocaleString());
        console.log('⏰ Is expired:', expiry < new Date() ? '❌ YES' : '✅ NO');
      } catch (e) {
        console.log('⚠️  Could not decode token expiry');
      }
    }
  }
  
} else {
  updateCookies(newCookies);
} 