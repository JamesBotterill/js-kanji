/**
 * Semantic-Kanji: A hybrid compression system for JavaScript
 * 
 * This system combines semantic pattern compression with character-level
 * JS-Kanji compression to achieve maximum token efficiency when communicating
 * with language models.
 */

const kanjiDict = require('./dictionaries/kanji-dict');
const semanticDict = require('./dictionaries/semantic-dict');
const semanticPatterns = require('./dictionaries/semantic-patterns');

/**
 * Compress JavaScript code using the hybrid Semantic-Kanji system
 * 
 * @param {string} code - Original JavaScript code
 * @return {string} - Compressed code
 */
function compress(code) {
  // Remove comments and unnecessary whitespace
  let compressed = code
    .replace(/\/\/.*$/gm, '')              // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')      // Remove multi-line comments
    .replace(/^\s*[\r\n]/gm, '')           // Remove empty lines
    .replace(/\s{2,}/g, ' ')               // Collapse multiple spaces
    .trim();
  
  // First apply semantic pattern compression for common programming patterns
  compressed = applySemanticPatterns(compressed);
  
  // Then apply character-level Kanji compression for remaining code
  compressed = applyKanjiCompression(compressed);
  
  // Additional space removal for maximum compression
  compressed = compressed
    .replace(/\s*([=+\-*/%&|^<>!?:;,{}[\]()])\s*/g, '$1')
    .replace(/([{([,;])\s+/g, '$1')        
    .replace(/\s+([})\]])/g, '$1')         
    .replace(/\s*\.\s*/g, '.')             
    .replace(/\)\s*\./g, ').')             
    .replace(/\r?\n/g, '')                 
    .replace(/\s{2,}/g, ' ')               
    .trim();
  
  return compressed;
}

/**
 * Apply semantic pattern compression to JavaScript code
 * 
 * @param {string} code - Preprocessed JavaScript code
 * @return {string} - Code with semantic patterns compressed
 */
function applySemanticPatterns(code) {
  let result = code;
  
  // Sort patterns by specificity (length) to avoid conflicts
  const sortedPatterns = Object.entries(semanticPatterns)
    .sort((a, b) => b[0].length - a[0].length);
  
  // Apply each semantic pattern
  for (const [pattern, replacement] of sortedPatterns) {
    // Create a regex that can capture various forms of the pattern
    // This is more sophisticated than simple string replacement
    // and can handle variations in whitespace, naming, etc.
    const patternRegex = createPatternRegex(pattern);
    
    if (patternRegex) {
      result = result.replace(patternRegex, (match, ...groups) => {
        // Process captured groups and apply the semantic replacement
        return processSemanticReplacement(replacement, groups);
      });
    }
  }
  
  return result;
}

/**
 * Create a regex pattern that can flexibly match code patterns
 * 
 * @param {string} pattern - Pattern to match
 * @return {RegExp|null} - Regex for the pattern or null if invalid
 */
function createPatternRegex(pattern) {
  try {
    // Replace placeholders with capture groups
    const processedPattern = pattern
      .replace(/\$\w+/g, '([\\w\\._\\\'\\\"\\`\\$\\{\\}]+)')  // Variables/expressions
      .replace(/\s+/g, '\\s*')                               // Flexible whitespace
      .replace(/\(/g, '\\(')                                 // Escape special chars
      .replace(/\)/g, '\\)')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\./g, '\\.');
    
    return new RegExp(processedPattern, 'g');
  } catch (error) {
    // Invalid regex pattern
    return null;
  }
}

/**
 * Process a semantic replacement using captured groups
 * 
 * @param {string} replacement - Replacement pattern
 * @param {string[]} groups - Captured groups
 * @return {string} - Processed replacement
 */
function processSemanticReplacement(replacement, groups) {
  // Replace $1, $2, etc. in the replacement with captured groups
  let result = replacement;
  groups.forEach((group, index) => {
    if (group !== undefined) {
      result = result.replace(new RegExp(`\\$${index+1}`, 'g'), group);
    }
  });
  return result;
}

/**
 * Apply character-level Kanji compression to code
 * 
 * @param {string} code - Code after semantic compression
 * @return {string} - Kanji-compressed code
 */
function applyKanjiCompression(code) {
  let result = code;
  
  // Apply character-level Kanji substitutions
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
 * Decompress Semantic-Kanji code back to JavaScript
 * 
 * @param {string} compressedCode - Compressed code
 * @return {string} - Decompressed JavaScript code
 */
function decompress(compressedCode) {
  // First decompress Kanji characters
  let result = decompressKanji(compressedCode);
  
  // Then decompress semantic patterns
  result = decompressSemantics(result);
  
  // Basic formatting to improve readability
  result = formatCode(result);
  
  return result;
}

/**
 * Decompress Kanji-compressed code
 * 
 * @param {string} code - Kanji-compressed code
 * @return {string} - Code with Kanji decompressed
 */
function decompressKanji(code) {
  let result = code;
  
  // Create reverse dictionary for decompression
  const reverseDict = Object.fromEntries(
    Object.entries(kanjiDict).map(([key, value]) => [value, key])
  );
  
  // Apply reverse dictionary (shortest first to avoid conflicts)
  const sortedEntries = Object.entries(reverseDict)
    .sort((a, b) => a[0].length - b[0].length);
  
  for (const [kanji, original] of sortedEntries) {
    // Escape special regex characters
    const escapedKanji = kanji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escapedKanji, 'g'), original);
  }
  
  return result;
}

/**
 * Decompress semantic patterns
 * 
 * @param {string} code - Code with Kanji decompressed
 * @return {string} - Fully decompressed code
 */
function decompressSemantics(code) {
  let result = code;
  
  // Create reverse dictionary for semantic patterns
  const reverseSemantic = Object.fromEntries(
    Object.entries(semanticDict).map(([key, value]) => [value, key])
  );
  
  // Apply semantic expansions (most specific first)
  const sortedEntries = Object.entries(reverseSemantic)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [symbol, expansion] of sortedEntries) {
    // Find the symbol and its arguments
    const symbolRegex = new RegExp(
      `${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\(([^)]+)\\)`, 
      'g'
    );
    
    result = result.replace(symbolRegex, (match, args) => {
      // Expand the semantic symbol with its arguments
      return expandSemanticSymbol(expansion, args.split(',').map(arg => arg.trim()));
    });
  }
  
  return result;
}

/**
 * Expand a semantic symbol with its arguments
 * 
 * @param {string} template - Semantic expansion template
 * @param {string[]} args - Arguments to insert
 * @return {string} - Expanded code
 */
function expandSemanticSymbol(template, args) {
  let result = template;
  
  // Replace placeholders with actual arguments
  args.forEach((arg, index) => {
    result = result.replace(new RegExp(`\\$${index+1}`, 'g'), arg);
  });
  
  return result;
}

/**
 * Format decompressed code for readability
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
 * Calculate estimated token count for a string
 * 
 * @param {string} text - Input text
 * @return {number} - Estimated token count
 */
function estimateTokens(text) {
  // Count standard characters (ASCII)
  const latinChars = text.replace(/[^\x00-\xFF]/g, '');
  const latinTokens = Math.ceil(latinChars.length / 4);
  
  // Count CJK characters (each is likely one token)
  const kanjiChars = text.replace(/[\x00-\xFF]/g, '');
  const kanjiTokens = kanjiChars.length;
  
  // Count semantic symbols (special handling for multi-character symbols)
  const semanticSymbols = Object.values(semanticDict);
  let semanticTokenCount = 0;
  
  for (const symbol of semanticSymbols) {
    const regex = new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = text.match(regex);
    if (matches) {
      semanticTokenCount += matches.length;
    }
  }
  
  // Subtract semantic token count from Latin/Kanji counts to avoid double counting
  return latinTokens + kanjiTokens - semanticTokenCount;
}

/**
 * Get compression statistics
 * 
 * @param {string} original - Original code
 * @param {string} compressed - Compressed code
 * @return {Object} - Compression statistics
 */
function getStats(original, compressed) {
  const originalTokens = Math.ceil(original.length / 4);
  const compressedTokens = estimateTokens(compressed);
  
  return {
    originalChars: original.length,
    compressedChars: compressed.length,
    charReduction: original.length - compressed.length,
    compressionRatio: Math.round((compressed.length / original.length) * 100),
    originalTokens,
    compressedTokens,
    tokenReduction: originalTokens - compressedTokens,
    tokenSavingsPercent: Math.round(((originalTokens - compressedTokens) / originalTokens) * 100)
  };
}

module.exports = {
  compress,
  decompress,
  estimateTokens,
  getStats
};
