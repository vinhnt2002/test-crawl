// Helper functions for trademark and filtering

/**
 * Get trademark patterns from settings collection
 * @param {Object} settingsCollection - MongoDB settings collection
 * @param {boolean} asRegexString - Whether to return as regex string
 * @returns {string|Array} - Trademark patterns
 */
const get_trademark = async (settingsCollection, asRegexString = false) => {
  try {
    // Get trademark settings from database
    const trademarkSettings = await settingsCollection.findOne({ 
      type: 'trademark_blacklist' 
    });
    
    let trademarks = [];
    
    if (trademarkSettings && trademarkSettings.patterns) {
      trademarks = trademarkSettings.patterns;
    } else {
      // Default trademark patterns if none found in database
      trademarks = [
        'nike',
        'adidas',
        'supreme',
        'gucci',
        'louis vuitton',
        'chanel',
        'prada',
        'versace',
        'balenciaga',
        'off-white',
        'yeezy',
        'jordan',
        'converse',
        'vans',
        'champion',
        'tommy hilfiger',
        'calvin klein',
        'polo ralph lauren',
        'lacoste',
        'fendi',
        'burberry',
        'armani',
        'dolce gabbana',
        'valentino',
        'givenchy',
        'moschino',
        'kenzo',
        'bape',
        'stone island',
        'moncler'
      ];
    }
    
    if (asRegexString) {
      // Return as regex string for use with RegExp constructor
      return trademarks
        .map(tm => tm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
        .join('|');
    }
    
    return trademarks;
  } catch (error) {
    console.error('Error getting trademark patterns:', error);
    
    // Return default patterns on error
    const defaultTrademarks = [
      'nike', 'adidas', 'supreme', 'gucci', 'louis vuitton', 'chanel'
    ];
    
    if (asRegexString) {
      return defaultTrademarks
        .map(tm => tm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    }
    
    return defaultTrademarks;
  }
};

/**
 * Check if a title contains blacklisted trademarks
 * @param {string} title - Product title to check
 * @param {RegExp} regex - Trademark regex pattern
 * @returns {boolean} - Whether title contains blacklisted content
 */
const isBlacklisted = (title, regex) => {
  return regex.test(title);
};

/**
 * Clean and normalize product title
 * @param {string} title - Raw product title
 * @returns {string} - Cleaned title
 */
const cleanTitle = (title) => {
  if (!title) return '';
  
  return title
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .toLowerCase();
};

/**
 * Extract keywords from product title
 * @param {string} title - Product title
 * @returns {Array} - Array of keywords
 */
const extractKeywords = (title) => {
  if (!title) return [];
  
  const cleaned = cleanTitle(title);
  const words = cleaned.split(/\s+/);
  
  // Filter out common stop words and short words
  const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  return words
    .filter(word => word.length > 2)
    .filter(word => !stopWords.includes(word))
    .slice(0, 10); // Limit to first 10 keywords
};

/**
 * Generate search variations for a keyword
 * @param {string} keyword - Base keyword
 * @returns {Array} - Array of keyword variations
 */
const generateKeywordVariations = (keyword) => {
  const variations = [keyword];
  
  // Add plural/singular variations
  if (keyword.endsWith('s')) {
    variations.push(keyword.slice(0, -1)); // Remove 's' for singular
  } else {
    variations.push(keyword + 's'); // Add 's' for plural
  }
  
  // Add common variations
  variations.push(keyword + ' shirt');
  variations.push(keyword + ' hoodie');
  variations.push(keyword + ' tshirt');
  
  return [...new Set(variations)]; // Remove duplicates
};

module.exports = {
  get_trademark,
  isBlacklisted,
  cleanTitle,
  extractKeywords,
  generateKeywordVariations
}; 