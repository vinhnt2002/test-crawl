// Utility functions for product status and timing

/**
 * Sleep function to pause execution for a specified amount of time
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after the specified time
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Sleep for a random amount of time between min and max milliseconds
 * @param {number} min - Minimum milliseconds
 * @param {number} max - Maximum milliseconds
 * @returns {Promise} - Promise that resolves after the random time
 */
const randomSleep = (min, max) => {
  const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;
  return sleep(randomMs);
};

/**
 * Sleep with exponential backoff for retries
 * @param {number} attempt - Current attempt number (starts from 1)
 * @param {number} baseMs - Base milliseconds for first attempt
 * @returns {Promise} - Promise that resolves after the calculated time
 */
const exponentialBackoffSleep = (attempt, baseMs = 1000) => {
  const ms = baseMs * Math.pow(2, attempt - 1);
  return sleep(ms);
};

/**
 * Check if a product is active based on various criteria
 * @param {Object} product - Product object
 * @returns {boolean} - Whether the product is considered active
 */
const isProductActive = (product) => {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
  
  // Product is active if it's newer than 30 days or has sales
  return product.createTime > thirtyDaysAgo || product.week_sold_count > 0;
};

/**
 * Get product status based on various criteria
 * @param {Object} product - Product object
 * @returns {string} - Product status (active, inactive, blacklisted, etc.)
 */
const getProductStatus = (product) => {
  if (product.status === 'black') {
    return 'blacklisted';
  }
  
  if (isProductActive(product)) {
    return 'active';
  }
  
  return 'inactive';
};

module.exports = {
  sleep,
  randomSleep,
  exponentialBackoffSleep,
  isProductActive,
  getProductStatus
}; 