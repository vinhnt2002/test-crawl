// Configuration for Etsy Scraper using ScraperAPI

const config = {
  // ScraperAPI settings
  scraperapi: {
    apiKey: process.env.SCRAPERAPI_KEY || 'f7e71afbac6f3cb929b51fe6300e3045',
    baseUrl: 'https://api.scraperapi.com/',
    defaultOptions: {
      render: 'true',
      country_code: 'US',
      device_type: 'desktop',
      session_number: '1'
    }
  },

  // Etsy scraping settings
  etsy: {
    baseUrl: 'https://www.etsy.com',
    searchEndpoint: '/search',
    defaultParams: {
      explicit: 1,
      order: 'most_relevant'
    },
    categories: {
      jewelry: 'jewelry',
      clothing: 'clothing',
      home: 'home-and-living',
      art: 'art-and-collectibles',
      vintage: 'vintage',
      weddings: 'weddings',
      toys: 'toys-and-games',
      supplies: 'craft-supplies-and-tools'
    }
  },

  // Crawling behavior
  crawling: {
    delayBetweenRequests: 2000, // ms
    delayBetweenKeywords: 3000, // ms
    maxRetries: 3,
    timeout: 30000, // ms
    maxProductsPerKeyword: 100,
    maxPagesPerKeyword: 5
  },

  // Database settings
  database: {
    collections: {
      products: 'etsyProducts',
      keywords: 'etsyKeywords',
      shops: 'etsyShops',
      categories: 'etsyCategories'
    }
  },

  // Selectors for parsing (có thể cần update khi Etsy thay đổi giao diện)
  selectors: {
    searchResults: {
      container: '[data-test-id="search-results"]',
      productCard: '.v2-listing-card, .listing-link',
      title: '.v2-listing-card__title, h3',
      price: '.currency-value',
      shopName: '.v2-listing-card__shop, .shop-name',
      image: '.listing-link img, .listing-card-image img',
      url: '.listing-link',
      rating: '.shop2-review-review, [data-test-id="rating"]'
    },
    productDetails: {
      title: '#listing-page-cart h1, h1[data-test-id="listing-title"]',
      price: '[data-test-id="price"] .currency-value',
      description: '[data-test-id="description-text"], .listing-page-description',
      shopName: '[data-test-id="shop-name"]',
      shopUrl: '[data-test-id="shop-name"]',
      images: '[data-test-id="listing-page-image"] img, .listing-image img',
      tags: '[data-test-id="tags"] a, .shop2-tag-tag',
      category: '[data-test-id="breadcrumb"] a',
      reviewsCount: '[data-test-id="review-count"]',
      rating: '[data-test-id="star-rating"]'
    }
  },

  // Popular keywords để test
  popularKeywords: [
    'handmade jewelry',
    'vintage clothing',
    'wall art',
    'wedding decorations',
    'baby clothes',
    'custom portrait',
    'home decor',
    'earrings',
    'necklace',
    'rings',
    'bracelet',
    'art prints',
    'gift ideas',
    'personalized gifts',
    'boho style',
    'minimalist jewelry',
    'vintage rings',
    'handmade bags',
    'candles',
    'plant pots'
  ]
};

module.exports = config; 