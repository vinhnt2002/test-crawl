// Configuration file for FastMoss crawler

const config = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb+srv://bohubo2:bohubo2025@tts01.apczpp3.mongodb.net/",
    database: process.env.DATABASE_NAME || "tiktokshopV1"
  },

  // FastMoss Configuration
  fastmoss: {
    baseURL: "https://www.fastmoss.com",
    proxy: {
      host: "206.125.175.221",
      port: 31258,
      username: "muaproxy68592970ab862",
      password: "ums7i4xpnsasaug9"
    },
    region: process.env.FASTMOSS_REGION || "US",
    salt: "asjdfoaur3ur829322" // Encryption salt for API requests
  },

  // Rate Limiting
  delays: {
    requestDelay: parseInt(process.env.REQUEST_DELAY) || 5000, // 5 seconds between requests
    retryDelay: parseInt(process.env.RETRY_DELAY) || 60000,    // 1 minute retry delay
    maxRetries: 3
  },

  // Product Filtering
  filters: {
    minAge: 30 * 86400, // 30 days in seconds
    requiredKeywords: ['shirt', 'hoodie'],
    excludeKeywords: [] // Will be populated from trademark blacklist
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableDebug: process.env.NODE_ENV === 'development'
  }
};

module.exports = config; 