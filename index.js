/**
 * Semantic-Kanji: Ultra-efficient JavaScript compression for code sharing
 * 
 * This module provides a hybrid compression system that combines semantic pattern
 * recognition with character-level Kanji substitution to maximize efficiency
 * when communicating JavaScript code.
 */

const jsKanji = require('./js-kanji-compressor');
const semanticKanji = require('./semantic-kanji');
const utils = require('./utils');
const prompt = require('./prompt-generator');
const decompressor = require('./js-kanji-decompressor');

/**
 * Compress JavaScript code using the specified method
 * 
 * @param {string} code - Original JavaScript code
 * @param {string} method - Compression method ('kanji' or 'semantic-kanji')
 * @param {Object} options - Optional configuration options
 * @return {string} - Compressed code
 */
function compress(code, method = 'semantic-kanji', options = {}) {
  // Check if method is an object (likely intended as options)
  if (method && typeof method === 'object') {
    options = method;
    method = 'semantic-kanji';
  }

  // Set default options that preserve comments and structure
  const defaultOptions = {
    removeComments: false,  // Preserve comments by default
    preserveLineBreaks: true, // Preserve code structure by default
    ...options
  };
  
  switch (String(method).toLowerCase()) {
    case 'kanji':
      return jsKanji.compress(code, defaultOptions);
    case 'semantic-kanji':
    case 'semantic':
      return semanticKanji.compress(code, defaultOptions);
    default:
      throw new Error(`Unknown compression method: ${method}`);
  }
}

/**
 * Decompress code back to readable JavaScript
 * 
 * @param {string} code - Compressed code
 * @param {string} method - Compression method used ('kanji' or 'semantic-kanji')
 * @param {Object} options - Optional configuration options
 * @return {string} - Decompressed JavaScript code
 */
function decompress(code, method = 'auto', options = {}) {
  if (method === 'auto') {
    // Auto-detect method based on content
    if (containsKanji(code)) {
      if (containsSemanticSymbols(code)) {
        return semanticKanji.decompress(code, options);
      }
      return decompressor.decompress(code, options);
    }
    throw new Error('Unable to determine compression method');
  }
  
  switch (method.toLowerCase()) {
    case 'kanji':
      return decompressor.decompress(code, options);
    case 'semantic-kanji':
    case 'semantic':
      return semanticKanji.decompress(code, options);
    default:
      throw new Error(`Unknown compression method: ${method}`);
  }
}

/**
 * Check if a string contains Kanji characters
 * 
 * @param {string} text - Text to check
 * @return {boolean} - True if contains Kanji
 */
function containsKanji(text) {
  // Check for CJK Unified Ideographs range
  return /[\u4E00-\u9FFF]/.test(text);
}

/**
 * Check if a string contains semantic pattern symbols
 * 
 * @param {string} text - Text to check
 * @return {boolean} - True if contains semantic symbols
 */
function containsSemanticSymbols(text) {
  // Check for specific Unicode blocks used for semantic symbols
  // Includes Hangul, Tibetan, Georgian, and various other blocks
  return /[\u1100-\u11FF]|[\u0F00-\u0FFF]|[\u10A0-\u10FF]|[\uAA00-\uAADF]|[\uA900-\uA92F]/.test(text);
}

/**
 * Compare different compression methods on the same code
 * 
 * @param {string} code - Original JavaScript code
 * @param {Object} options - Optional configuration options
 * @return {Object} - Comparison statistics
 */
function compare(code, options = {}) {
  // Input validation
  if (!code || typeof code !== 'string') {
    throw new Error('Code must be a non-empty string');
  }
  
  try {
    // For semantic compression, ensure we're using proper pattern matching
    const semanticOptions = {
      ...options,
      usePatternMatching: true // Ensure pattern matching is enabled for semantic compression
    };
    
    // For kanji compression, we use the standard options
    const kanjiCompressed = jsKanji.compress(code, options);
    
    // For semantic-kanji, explicitly specify the method and add pattern matching
    const semanticCompressed = semanticKanji.compress(code, 'semantic-kanji', semanticOptions);
    
    const originalTokens = utils.estimateTokens(code, false);
    const kanjiStats = utils.getCompressionStats(code, kanjiCompressed, true);
    const semanticStats = utils.getCompressionStats(code, semanticCompressed, true);
    
    // Make sure we're properly comparing the two methods
    if (semanticStats.tokenSavingsPercent < kanjiStats.tokenSavingsPercent) {
      console.warn('Warning: Semantic compression is less efficient than Kanji compression. This may indicate an issue with pattern matching.');
    }
    
    // Determine which method had better compression
    const bestMethod = kanjiStats.tokenSavingsPercent >= semanticStats.tokenSavingsPercent ? 
      'kanji' : 'semantic';
    
    return {
      original: {
        code: code,
        chars: code.length,
        tokens: originalTokens
      },
      kanji: {
        code: kanjiCompressed,
        chars: kanjiStats.compressedChars,
        tokens: kanjiStats.compressedTokens,
        reduction: kanjiStats.tokenReduction,
        savingsPercent: kanjiStats.tokenSavingsPercent
      },
      semantic: {
        code: semanticCompressed,
        chars: semanticStats.compressedChars,
        tokens: semanticStats.compressedTokens,
        reduction: semanticStats.tokenReduction,
        savingsPercent: semanticStats.tokenSavingsPercent
      },
      bestMethod: bestMethod
    };
  } catch (error) {
    throw new Error(`Comparison failed: ${error.message}`);
  }
}

/**
 * Generate instruction prompts for LLMs
 * 
 * @param {string} format - Format type ('full', 'basic', or 'minimal')
 * @param {string} method - Compression method ('mini', 'kanji', or 'semantic-kanji')
 * @param {Object} options - Optional configuration options 
 * @return {string|string[]} - Instruction prompt(s)
 */
function generatePrompt(format = 'full', method = 'semantic-kanji', options = {}) {
  return prompt.generate(format, method, options);
}

/**
 * Get compression statistics
 * 
 * @param {string} original - Original code
 * @param {string} compressed - Compressed code
 * @param {boolean} isKanji - Whether the compression used Kanji
 * @return {Object} - Compression statistics
 */
function getStats(original, compressed, isKanji = false) {
  return utils.getCompressionStats(original, compressed, isKanji);
}

/**
 * Estimate token count for a string
 * 
 * @param {string} text - Input text
 * @param {boolean} isKanji - Whether the text contains Kanji
 * @return {number} - Estimated token count
 */
function estimateTokens(text, isKanji = false) {
  return utils.estimateTokens(text, isKanji);
}

// Export public API
module.exports = {
  compress,
  decompress,
  compare,
  generatePrompt,
  getStats,
  estimateTokens,
  kanji: jsKanji,
  semantic: semanticKanji,
  utils
};

// Run CLI if executed directly
if (require.main === module) {
  require('./cli')();
}