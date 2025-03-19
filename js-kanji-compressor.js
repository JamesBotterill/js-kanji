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
    removeComments: false, // Changed to false to preserve comments
    preserveLineBreaks: true, // Changed to true to maintain code structure
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
  
  // Handle comments based on options
  if (options.removeComments) {
    processed = processed
      .replace(/\/\/.*$/gm, '')              // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '');     // Remove multi-line comments
  } else {
    // Preserve comments but normalize them
    // Replace multiline comments with specially marked ones
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      // Convert multiline comment to specialized format that won't get broken by compression
      return '/*' + match.replace(/\*\//, '').substring(2).trim().replace(/\s+/g, ' ') + '*/';
    });
    
    // Keep but normalize single-line comments
    processed = processed.replace(/\/\/(.*)$/gm, '// $1');
  }
  
  // Handle empty lines based on preserveLineBreaks option
  if (!options.preserveLineBreaks) {
    processed = processed.replace(/^\s*[\r\n]/gm, '');
  }
  
  // Collapse multiple spaces to single spaces (but not inside comments)
  let inComment = false;
  let resultLines = processed.split('\n').map(line => {
    // If line has a single-line comment
    if (line.includes('//')) {
      const [code, comment] = line.split('//');
      return code.replace(/\s{2,}/g, ' ').trim() + ' // ' + comment.trim();
    } 
    // Otherwise just normalize spaces
    return line.replace(/\s{2,}/g, ' ').trim();
  });
  
  return resultLines.join('\n').trim();
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
  // Split the code into lines to handle comments separately
  const lines = code.split('\n');
  const optimizedLines = [];
  
  for (let line of lines) {
    let optimizedLine = line;
    
    // Check if the line contains a comment
    if (line.includes('//')) {
      // Split the line at the comment
      const [codePart, commentPart] = line.split('//');
      
      // Optimize only the code part
      let optimizedCodePart = codePart;
      
      // Remove whitespace around operators and punctuation
      optimizedCodePart = optimizedCodePart.replace(/\s*([=+\-*/%&|^<>!?:;,{}[\]()])\s*/g, '$1');
      
      // Remove space after opening punctuation
      optimizedCodePart = optimizedCodePart.replace(/([{([,;])\s+/g, '$1');
      
      // Remove space before closing punctuation
      optimizedCodePart = optimizedCodePart.replace(/\s+([})\]])/g, '$1');
      
      // Remove spaces around dots
      optimizedCodePart = optimizedCodePart.replace(/\s*\.\s*/g, '.');
      
      // Remove space after closing parenthesis before dot
      optimizedCodePart = optimizedCodePart.replace(/\)\s*\./g, ').');
      
      // Join the optimized code with the comment
      optimizedLine = optimizedCodePart + ' //' + commentPart;
    } 
    // If the line contains a multiline comment opening
    else if (line.includes('/*') && !line.includes('*/')) {
      // Don't optimize - just add to results
      optimizedLine = line;
    }
    // If the line contains a multiline comment closing
    else if (line.includes('*/')) {
      // Don't optimize - just add to results
      optimizedLine = line;
    }
    // If we're in a multiline comment
    else if (line.trimStart().startsWith('*')) {
      // Don't optimize - just add to results
      optimizedLine = line;
    }
    // Regular code line without comments
    else {
      // Remove whitespace around operators and punctuation
      optimizedLine = optimizedLine.replace(/\s*([=+\-*/%&|^<>!?:;,{}[\]()])\s*/g, '$1');
      
      // Remove space after opening punctuation
      optimizedLine = optimizedLine.replace(/([{([,;])\s+/g, '$1');
      
      // Remove space before closing punctuation
      optimizedLine = optimizedLine.replace(/\s+([})\]])/g, '$1');
      
      // Remove spaces around dots
      optimizedLine = optimizedLine.replace(/\s*\.\s*/g, '.');
      
      // Remove space after closing parenthesis before dot
      optimizedLine = optimizedLine.replace(/\)\s*\./g, ').');
    }
    
    optimizedLines.push(optimizedLine);
  }
  
  let result;
  
  // Join the lines according to options
  if (options.preserveLineBreaks) {
    result = optimizedLines.join('\n');
  } else {
    // For code without comments, join everything with no line breaks
    result = optimizedLines.join('');
  }
  
  // Final cleanup of any multiple spaces but preserve spaces in comments
  result = result.replace(/([^\/])\s{2,}([^\/])/g, '$1 $2').trim();
  
  return result;
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
  isKanjiCompressed,
  analyzeCode,
  dictionary: kanjiDict
};