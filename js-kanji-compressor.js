/**
 * JS-Kanji: Ultra-efficient JavaScript compression using Kanji characters
 * 
 * This system provides character-level Kanji compression for JavaScript code
 * to achieve high token efficiency when communicating with language models.
 */

const kanjiDict = require('./dictionaries/kanji-dict');
const utils = require('./utils');

/**
 * Compress JavaScript code using Kanji characters
 * 
 * @param {string} code - Original JavaScript code
 * @param {Object} options - Compression options
 * @return {string} - Kanji-compressed code
 */
function compress(code, options = {}) {
  // Merge default options with provided options
  const opts = {
    removeComments: true,
    preserveLineBreaks: false,
    ...options
  };

  // Preprocess the code
  let compressed = preprocess(code, opts);
  
  // Apply Kanji character substitution
  compressed = applyKanjiSubstitution(compressed);
  
  // Apply whitespace and formatting optimization
  compressed = optimizeWhitespace(compressed, opts);
  
  return compressed;
}

/**
 * Preprocess JavaScript code to prepare for compression
 * 
 * @param {string} code - Original code
 * @param {Object} options - Processing options
 * @return {string} - Preprocessed code
 */
function preprocess(code, options) {
  let processed = code;
  
  // Remove comments if option is enabled
  if (options.removeComments) {
    processed = processed
      .replace(/\/\/.*$/gm, '')              // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '');     // Remove multi-line comments
  }
  
  // Remove empty lines
  processed = processed.replace(/^\s*[\r\n]/gm, '');
  
  // Collapse multiple spaces to single spaces
  processed = processed.replace(/\s{2,}/g, ' ');
  
  return processed.trim();
}

/**
 * Apply Kanji character substitution to JavaScript code
 * 
 * @param {string} code - Preprocessed code
 * @return {string} - Code with Kanji substitutions
 */
function applyKanjiSubstitution(code) {
  let result = code;
  
  // Sort dictionary entries by length (longest first) to avoid conflicts
  const sortedEntries = Object.entries(kanjiDict)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [pattern, replacement] of sortedEntries) {
    // Escape special regex characters in the pattern
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Use word boundaries to ensure we only replace whole words
    const regex = new RegExp(`\\b${escapedPattern}\\b`, 'g');
    result = result.replace(regex, replacement);
  }
  
  return result;
}

/**
 * Optimize whitespace and formatting for token efficiency
 * 
 * @param {string} code - Code with Kanji substitutions
 * @param {Object} options - Optimization options
 * @return {string} - Optimized code
 */
function optimizeWhitespace(code, options) {
  let optimized = code;
  
  // Remove whitespace around operators and punctuation
  optimized = optimized.replace(/\s*([=+\-*/%&|^<>!?:;,{}[\]()])\s*/g, '$1');
  
  // Remove space after opening punctuation
  optimized = optimized.replace(/([{([,;])\s+/g, '$1');
  
  // Remove space before closing punctuation
  optimized = optimized.replace(/\s+([})\]])/g, '$1');
  
  // Remove spaces around dots
  optimized = optimized.replace(/\s*\.\s*/g, '.');
  
  // Remove space after closing parenthesis before dot
  optimized = optimized.replace(/\)\s*\./g, ').');
  
  // Handle line breaks based on options
  if (!options.preserveLineBreaks) {
    optimized = optimized.replace(/\r?\n/g, '');
  }
  
  // Final cleanup of any multiple spaces
  optimized = optimized.replace(/\s{2,}/g, ' ').trim();
  
  return optimized;
}

/**
 * Decompress Kanji-compressed code back to JavaScript
 * 
 * @param {string} kanjiCode - Kanji-compressed code
 * @param {Object} options - Decompression options
 * @return {string} - Decompressed JavaScript code
 */
function decompress(kanjiCode, options = {}) {
  // Merge default options with provided options
  const opts = {
    formatOutput: true,
    ...options
  };

  // Create reverse dictionary for decompression
  const reverseDict = Object.fromEntries(
    Object.entries(kanjiDict).map(([key, value]) => [value, key])
  );
  
  // Apply reverse dictionary (shortest first to avoid conflicts)
  const sortedEntries = Object.entries(reverseDict)
    .sort((a, b) => a[0].length - b[0].length);
  
  let decompressed = kanjiCode;
  
  for (const [kanji, original] of sortedEntries) {
    // Escape special regex characters
    const escapedKanji = kanji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    decompressed = decompressed.replace(new RegExp(escapedKanji, 'g'), original);
  }
  
  // Format the decompressed code if option is enabled
  if (opts.formatOutput) {
    decompressed = formatCode(decompressed);
  }
  
  return decompressed;
}

/**
 * Format JavaScript code for readability
 * 
 * @param {string} code - Decompressed code
 * @return {string} - Formatted code
 */
function formatCode(code) {
  return code
    .replace(/;/g, ';\n')                  // Add newline after semicolons
    .replace(/{/g, ' {\n')                 // Format opening braces
    .replace(/}/g, '\n}')                  // Format closing braces
    .replace(/}\n(else|catch)/g, '} $1')   // Fix else/catch blocks
    .replace(/\n\s*\n/g, '\n')             // Remove empty lines
    
    // Add spaces around operators for readability
    .replace(/([a-zA-Z0-9_])([\+\-\*\/\%\=\>\<\!\&\|\^\?])/g, '$1 $2')
    .replace(/([\+\-\*\/\%\=\>\<\!\&\|\^\?])([a-zA-Z0-9_])/g, '$1 $2')
    
    // Fix spacing after keywords
    .replace(/\b(if|for|while|switch|catch)\(/g, '$1 (')
    .replace(/\)\s*{/g, ') {')
    
    .trim();
}

/**
 * Check if text appears to be Kanji-compressed
 * 
 * @param {string} text - Text to check
 * @return {boolean} - True if text appears to be Kanji-compressed
 */
function isKanjiCompressed(text) {
  // Check for presence of Kanji characters used in our dictionary
  const kanjiChars = Object.values(kanjiDict).join('');
  const kanjiRegex = new RegExp(`[${kanjiChars}]`);
  return kanjiRegex.test(text);
}

/**
 * Analyze code to determine optimal compression approaches
 * 
 * @param {string} code - JavaScript code to analyze
 * @return {Object} - Analysis report with optimization suggestions
 */
function analyzeCode(code) {
  // Count occurrences of each potential dictionary term
  const wordCounts = {};
  const words = code.match(/\b\w+\b/g) || [];
  
  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }
  
  // Find most common terms that aren't in our dictionary yet
  const dictionaryTerms = new Set(Object.keys(kanjiDict));
  const potentialNewTerms = Object.entries(wordCounts)
    .filter(([word]) => !dictionaryTerms.has(word) && word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Calculate current potential savings
  const totalChars = code.length;
  const compressedCode = compress(code);
  const compressedChars = compressedCode.length;
  const savings = totalChars - compressedChars;
  const savingsPercent = Math.round((savings / totalChars) * 100);
  
  // Estimate token counts
  const originalTokens = utils.estimateTokens(code, false);
  const compressedTokens = utils.estimateTokens(compressedCode, true);
  const tokenSavings = originalTokens - compressedTokens;
  const tokenSavingsPercent = Math.round((tokenSavings / originalTokens) * 100);
  
  return {
    originalLength: totalChars,
    compressedLength: compressedChars,
    charSavings: savings,
    savingsPercent,
    originalTokens,
    compressedTokens,
    tokenSavings,
    tokenSavingsPercent,
    potentialNewTerms,
    mostFrequentTerms: potentialNewTerms.map(([term, count]) => ({ 
      term, 
      count, 
      potential: term.length * count 
    }))
  };
}

// Export public API
module.exports = {
  compress,
  decompress,
  isKanjiCompressed,
  analyzeCode,
  dictionary: kanjiDict
};