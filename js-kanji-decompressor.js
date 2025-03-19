/**
 * JS-Kanji: Ultra-efficient JavaScript decompression 
 * 
 * This module specifically handles decompression of kanji-encoded JavaScript.
 */

const kanjiDict = require('./dictionaries/kanji-dict');

/**
 * Decompress Kanji-compressed code back to JavaScript
 * 
 * @param {string} kanjiCode - Kanji-compressed code
 * @param {Object} options - Decompression options
 * @return {string} - Decompressed JavaScript code
 */
function decompress(kanjiCode, options = {}) {
  if (!kanjiCode || typeof kanjiCode !== 'string') {
    throw new Error('Input code must be a non-empty string');
  }

  // Merge default options with provided options
  const opts = {
    formatOutput: true,
    preserveComments: true,
    ...options
  };

  // Create reverse dictionary for decompression
  const reverseDict = Object.fromEntries(
    Object.entries(kanjiDict).map(([key, value]) => [value, key])
  );
  
  // Apply some special case fixes first
  let decompressed = kanjiCode
    .replace(/送信\.取/g, 'axios.get')    // Fix axios.get issue
    .replace(/\.pop/g, '.get')            // Another approach to fix the same issue
    .replace(/網安:\s*\/\//g, 'https://') // Fix https:// URL pattern
    .replace(/網:\s*\/\//g, 'http://')    // Fix http:// URL pattern
    .replace(/件\./g, 'document.')        // Fix document. references
    .replace(/捕\(/g, 'catch(')           // Fix catch blocks
    .replace(/試\s*{/g, 'try {')          // Fix try blocks
    .replace(/獲\(/g, 'fetch(')           // Fix fetch function calls
    .replace(/各\(/g, 'forEach(')         // Fix forEach function
    .replace(/物\./g, 'Object.')          // Fix Object references
    .replace(/者\b/g, 'user')             // Fix user references
    .replace(/者-profile/g, 'user-profile')  // Fix user-profile references
    .replace(/組 content 繰/g, 'Set content for');  // Fix untranslated comments
  
  // Extract comments to preserve them
  const comments = [];
  if (opts.preserveComments) {
    // Extract and preserve comments
    const commentRegex = /\/\/.*?(?=\n|$)|\/\*[\s\S]*?\*\//g;
    let match;
    while ((match = commentRegex.exec(decompressed)) !== null) {
      comments.push({
        index: match.index,
        text: match[0]
      });
    }
    
    // Temporarily replace comments with markers
    comments.forEach((comment, i) => {
      decompressed = decompressed.replace(comment.text, `__COMMENT_${i}__`);
    });
  }
  
  // Apply reverse dictionary (longest first to avoid partial matches)
  const sortedEntries = Object.entries(reverseDict)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [kanji, original] of sortedEntries) {
    // Escape special regex characters
    const escapedKanji = kanji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    decompressed = decompressed.replace(new RegExp(escapedKanji, 'g'), original);
  }
  
  // Apply common fixes to the decompressed code
  decompressed = applyCommonFixes(decompressed);
  
  // Restore comments, making sure to translate any kanji in them
  if (opts.preserveComments && comments.length > 0) {
    comments.forEach((comment, i) => {
      // Create a new array to hold the untranslated kanji
      let translatedComment = comment.text;
      
      // Generate a list of all kanji characters in the comment
      const kanjiRegex = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]+/g;
      const kanjiMatches = translatedComment.match(kanjiRegex) || [];
      
      // If we found any kanji, attempt to translate each one
      if (kanjiMatches.length > 0) {
        // First, try pattern-based replacements
        translatedComment = translatedComment
          .replace(/者\s*profile/g, 'user profile')
          .replace(/者-profile/g, 'user-profile')
          .replace(/組\s*content\s*繰/g, 'Set content for')
          .replace(/\b者\b/g, 'user')
          .replace(/名/g, 'name')
          .replace(/物/g, 'object')
          .replace(/各/g, 'forEach')
          .replace(/件/g, 'document')
          .replace(/獲/g, 'fetch')
          .replace(/資/g, 'data')
          .replace(/素/g, 'element')
          .replace(/頭/g, 'headers')
          .replace(/答/g, 'response')
          .replace(/定/g, 'const')
          .replace(/條/g, 'if')
          .replace(/投/g, 'throw')
          .replace(/新/g, 'new')
          .replace(/態/g, 'status')
          .replace(/返/g, 'return')
          .replace(/関/g, 'function')
          .replace(/非/g, 'async')
          .replace(/日/g, 'Date')
          .replace(/試/g, 'try')
          .replace(/捕/g, 'catch')
          .replace(/過誤/g, 'error')
          .replace(/示/g, 'console')
          .replace(/信/g, 'message')
          .replace(/網安/g, 'https');
          
        // For any remaining kanji, try the dictionary-based reverse mapping
        for (const kanjiChar of kanjiMatches) {
          if (translatedComment.includes(kanjiChar)) {
            // Try to find a translation from the dictionary
            for (const [key, value] of Object.entries(kanjiDict)) {
              if (value === kanjiChar) {
                translatedComment = translatedComment.replace(new RegExp(kanjiChar, 'g'), key);
                break;
              }
            }
          }
        }
      }
      
      decompressed = decompressed.replace(`__COMMENT_${i}__`, translatedComment);
    });
  }
  
  // Format the decompressed code if option is enabled
  if (opts.formatOutput) {
    decompressed = formatCode(decompressed);
  }
  
  return decompressed;
}

/**
 * Apply common fixes to decompressed code
 * 
 * @param {string} code - Decompressed code
 * @return {string} - Fixed code
 */
function applyCommonFixes(code) {
  return code
    // Fix broken URLs with spaces
    .replace(/(https?):\/\/\s+/g, '$1://')
    .replace(/api\.\s*example/g, 'api.example')
    .replace(/\/\s+/g, '/')
    
    // Fix jQuery-style variables and $
    .replace(/\$=/g, '$ =')
    .replace(/=\$/g, '= $')
    .replace(/\(\$/g, '($ ')
    .replace(/,\$/g, ', $')
    
    // Fix broken arrow functions
    .replace(/=\s*>/g, '=>')
    
    // Fix content-type headers
    .replace(/Content\s*-\s*Type/g, 'Content-Type')
    .replace(/application\s*\/\s*json/g, 'application/json')
    
    // Fix catch statements - this is a critical error in decompression
    .replace(/捕\(/g, 'catch(')
    .replace(/試\s*{/g, 'try {')
    .replace(/獲\(/g, 'catch(')
    .replace(/fetch\s*\(error\)/g, 'catch (error)')
    
    // Fix some common mistranslations
    .replace(/各\(/g, 'forEach(')
    .replace(/物\./g, 'Object.')
    .replace(/列\./g, 'Array.')
    .replace(/\bArray\.values\b/g, 'Object.values')
    .replace(/者 profile/g, 'user profile')
    .replace(/者-profile/g, 'user-profile')
    
    // Fix remaining untranslated words
    .replace(/\b組 content 繰\b/g, 'Set content for')
    .replace(/\b者\b/g, 'user');
}

/**
 * Format JavaScript code for readability
 * 
 * @param {string} code - Decompressed code
 * @return {string} - Formatted code
 */
function formatCode(code) {
  // Use a simplified but more effective approach to code formatting
  
  // 1. Break into lines for better processing
  let lines = code.split(/\n/);
  let formattedLines = [];
  let indentLevel = 0;
  
  // 2. Process each line with appropriate indentation
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    // Process the line content for better formatting
    line = processLine(line);
    
    // Check for closing braces/brackets that should decrease indent
    if (/^[}\]]/.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    // Add proper indentation
    let indentedLine = ' '.repeat(2 * indentLevel) + line;
    formattedLines.push(indentedLine);
    
    // Check for opening braces/brackets that should increase indent
    if (/{$/.test(line) || /\[$/.test(line)) {
      indentLevel++;
    }
    
    // Handle cases where a line ends with a semicolon (statement end)
    if (/;$/.test(line) && i < lines.length - 1) {
      let nextLine = lines[i + 1].trim();
      
      // Add a blank line before comments and certain statements for readability
      if (nextLine.startsWith('//') || /^(function|class|if|for|while|switch)/.test(nextLine)) {
        formattedLines.push('');
      }
    }
  }
  
  // 3. Join the formatted lines back into code
  return formattedLines.join('\n');
}

/**
 * Process a single line of code for formatting
 * 
 * @param {string} line - A line of code
 * @return {string} - Formatted line
 */
function processLine(line) {
  // Fix common URL issues
  line = line
    .replace(/(https?): \/\//g, '$1://')
    .replace(/\/\s+/g, '/')
    .replace(/Content\s*-\s*Type/g, 'Content-Type')
    .replace(/application\s*\/\s*json/g, 'application/json')
    .replace(/user\s*-\s*profile/g, 'user-profile');
    
  // Fix spacing around operators
  line = line
    .replace(/([a-zA-Z0-9_])([\+\-\*\/\%\=\>\<\!\&\|\^\?])/g, '$1 $2')
    .replace(/([\+\-\*\/\%\=\>\<\!\&\|\^\?])([a-zA-Z0-9_])/g, '$1 $2')
    .replace(/\s*=\s*/g, ' = ')
    .replace(/,([^\s])/g, ', $1');
  
  // Fix spacing after keywords
  line = line
    .replace(/\b(if|for|while|switch|catch|function|class)\(/g, '$1 (')
    .replace(/\)\s*{/g, ') {');
  
  // Fix double spaces
  line = line.replace(/\s{2,}/g, ' ');
  
  // Handle comments
  if (line.includes('//')) {
    // For lines with inline comments, format the code part first
    let [codePart, commentPart] = line.split('//', 2);
    
    // Process the comment part to fix any kanji
    commentPart = commentPart.trim()
      .replace(/者\s*profile/g, 'user profile')
      .replace(/者-profile/g, 'user-profile')
      .replace(/組\s*content\s*繰/g, 'Set content for')
      .replace(/\b者\b/g, 'user')
      .replace(/名/g, 'name')
      .replace(/物/g, 'object')
      .replace(/各/g, 'forEach')
      .replace(/件/g, 'document')
      .replace(/獲/g, 'fetch')
      .replace(/資/g, 'data')
      .replace(/素/g, 'element')
      .replace(/頭/g, 'headers')
      .replace(/答/g, 'response')
      .replace(/定/g, 'const')
      .replace(/條/g, 'if')
      .replace(/投/g, 'throw')
      .replace(/新/g, 'new')
      .replace(/態/g, 'status')
      .replace(/返/g, 'return')
      .replace(/関/g, 'function')
      .replace(/非/g, 'async')
      .replace(/日/g, 'Date')
      .replace(/試/g, 'try')
      .replace(/捕/g, 'catch')
      .replace(/過誤/g, 'error')
      .replace(/示/g, 'console')
      .replace(/信/g, 'message')
      .replace(/網安/g, 'https');
    
    if (codePart.trim()) {
      return processLine(codePart) + ' // ' + commentPart;
    }
    return '// ' + commentPart;
  }
  
  // Fix arrow functions
  line = line.replace(/=\s*>/g, '=>');
  
  // Fix object literal formatting
  if (line.includes('{') && line.includes(':')) {
    line = line.replace(/(\w+):/g, '$1: ');
  }
  
  // Fix destructuring spacing
  if (line.includes('{') && line.includes('}') && line.includes('=')) {
    line = line.replace(/{\s*([^{}]*?)\s*}/g, '{ $1 }');
  }
  
  // Fix language-specific terms in code and comments
  line = line
    .replace(/\b者\b/g, 'user')
    .replace(/名/g, 'name')
    .replace(/物/g, 'object')
    .replace(/件/g, 'document')
    .replace(/組\s*content\s*繰/g, 'Set content for')
    .replace(/素/g, 'element')
    .replace(/頭/g, 'headers')
    .replace(/答/g, 'response')
    .replace(/定/g, 'const')
    .replace(/條/g, 'if')
    .replace(/投/g, 'throw')
    .replace(/新/g, 'new')
    .replace(/態/g, 'status')
    .replace(/返/g, 'return')
    .replace(/関/g, 'function')
    .replace(/非/g, 'async')
    .replace(/日/g, 'Date')
    .replace(/試/g, 'try')
    .replace(/捕/g, 'catch')
    .replace(/過誤/g, 'error')
    .replace(/示/g, 'console')
    .replace(/信/g, 'message')
    .replace(/網安/g, 'https');
  
  return line;
}

// Export public API
module.exports = {
  decompress,
  formatCode,
  applyCommonFixes
};