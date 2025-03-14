/**
 * Semantic-Kanji: Ultra-efficient JavaScript compression for LLM communication
 * 
 * This module provides a hybrid compression system that combines semantic pattern
 * recognition with character-level Kanji substitution to maximize token efficiency
 * when communicating JavaScript code with language models like Claude or GPT.
 */

const jsKanji = require('./js-kanji-compressor');
const semanticKanji = require('./semantic-kanji');
const utils = require('./utils');
const prompt = require('./prompt-generator');

/**
 * Compress JavaScript code using the specified method
 * 
 * @param {string} code - Original JavaScript code
 * @param {string} method - Compression method ('mini', 'kanji', or 'semantic-kanji')
 * @param {Object} options - Optional configuration options
 * @return {string} - Compressed code
 */
function compress(code, method = 'semantic-kanji', options = {}) {
  switch (method.toLowerCase()) {
    case 'mini':
      return jsMini.compress(code);
    case 'kanji':
      return jsKanji.compress(code);
    case 'semantic-kanji':
    case 'semantic':
      return semanticKanji.compress(code, options);
    default:
      throw new Error(`Unknown compression method: ${method}`);
  }
}

/**
 * Decompress code back to readable JavaScript
 * 
 * @param {string} code - Compressed code
 * @param {string} method - Compression method used ('mini', 'kanji', or 'semantic-kanji')
 * @param {Object} options - Optional configuration options
 * @return {string} - Decompressed JavaScript code
 */
function decompress(code, method = 'semantic-kanji', options = {}) {
  switch (method.toLowerCase()) {
    case 'mini':
      return jsMini.decompress(code);
    case 'kanji':
      return jsKanji.decompress(code);
    case 'semantic-kanji':
    case 'semantic':
      return semanticKanji.decompress(code, options);
    default:
      // Try to auto-detect method based on content
      if (containsKanji(code)) {
        if (containsSemanticSymbols(code)) {
          return semanticKanji.decompress(code, options);
        }
        return jsKanji.decompress(code);
      }
      return jsMini.decompress(code);
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
  const miniCompressed = jsMini.compress(code);
  const kanjiCompressed = jsKanji.compress(code);
  const semanticCompressed = semanticKanji.compress(code, options);
  
  const miniStats = utils.getCompressionStats(code, miniCompressed, false);
  const kanjiStats = utils.getCompressionStats(code, kanjiCompressed, true);
  const semanticStats = utils.getCompressionStats(code, semanticCompressed, true);
  
  return {
    original: {
      code: code,
      chars: code.length,
      tokens: miniStats.originalTokens
    },
    mini: {
      code: miniCompressed,
      chars: miniStats.compressedChars,
      tokens: miniStats.compressedTokens,
      reduction: miniStats.tokenReduction,
      savingsPercent: miniStats.tokenSavingsPercent
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
    }
  };
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
  mini: jsMini,
  kanji: jsKanji,
  semantic: semanticKanji,
  utils
};

// Run CLI if executed directly
if (require.main === module) {
  require('./cli')();
}