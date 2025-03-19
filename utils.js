/**
 * Utility functions for JS compression systems
 */

/**
 * Calculate estimated token count for a string
 * 
 * @param {string} text - Input text
 * @param {boolean} isKanji - Whether the text contains Kanji
 * @return {number} - Estimated token count
 */
function estimateTokens(text, isKanji = false) {
  if (!isKanji) {
    // For ASCII-only text, roughly 4 chars per token on average
    return Math.ceil(text.length / 4);
  }
  
  // For text with Kanji, we need to count differently
  // Most tokenizers count each Kanji as a single token
  const latinChars = text.replace(/[^\x00-\xFF]/g, '');
  const latinTokens = Math.ceil(latinChars.length / 4);
  
  // Count CJK characters (each is likely one token)
  const kanjiChars = text.replace(/[\x00-\xFF]/g, '');
  const kanjiTokens = kanjiChars.length;
  
  return latinTokens + kanjiTokens;
}

/**
 * Calculate compression statistics
 * 
 * @param {string} original - Original code
 * @param {string} compressed - Compressed code
 * @param {boolean} isKanji - Whether compression used Kanji
 * @return {Object} - Compression statistics
 */
function getCompressionStats(original, compressed, isKanji = false) {
  // Input validation
  if (!original || typeof original !== 'string') {
    throw new Error('Original code must be a non-empty string');
  }
  
  if (!compressed || typeof compressed !== 'string') {
    throw new Error('Compressed code must be a non-empty string');
  }
  
  const originalChars = original.length;
  const compressedChars = compressed.length;
  const charReduction = originalChars - compressedChars;
  
  // Handle potential zero division
  const compressionRatio = originalChars === 0 ? 0 : 
    Math.round((compressedChars / originalChars) * 100);
  
  const originalTokens = estimateTokens(original, false);  // Original is ASCII only
  const compressedTokens = estimateTokens(compressed, isKanji);
  const tokenReduction = originalTokens - compressedTokens;
  
  // Handle potential zero division or negative values
  const tokenSavingsPercent = originalTokens === 0 ? 0 : 
    Math.max(0, Math.round((tokenReduction / originalTokens) * 100));
  
  return {
    originalChars,
    compressedChars,
    charReduction,
    compressionRatio,
    originalTokens,
    compressedTokens,
    tokenReduction,
    tokenSavingsPercent
  };
}

/**
 * Format a compression result for display
 * 
 * @param {Object} stats - Compression statistics from getCompressionStats()
 * @param {string} method - Compression method name
 * @return {string} - Formatted output
 */
function formatCompressionResult(stats, method) {
  return `
${method.toUpperCase()} COMPRESSION RESULTS:
- Original: ${stats.originalChars} chars, ~${stats.originalTokens} tokens
- Compressed: ${stats.compressedChars} chars, ~${stats.compressedTokens} tokens
- Reduction: ${stats.tokenReduction} tokens (${stats.tokenSavingsPercent}% savings)
`;
}

module.exports = {
  estimateTokens,
  getCompressionStats,
  formatCompressionResult
};
