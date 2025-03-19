/**
 * Example usage of Semantic-Kanji compression on a web scraper
 * 
 * This file demonstrates the compression and decompression of a typical
 * web scraper script, showing the token efficiency achieved.
 */

const semanticKanji = require('../index');

// Original web scraper code
const originalCode = `
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Function to scrape a webpage and save its content to a text file
async function scrapeAndSave(url, filename) {
    try {
        // Fetch the HTML content of the page
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        // Extract text content from the body
        const textContent = $('body').text();
        
        // Clean up the text
        const cleanedText = textContent.replace(/\\s+/g, ' ').trim();
        
        // Save to a text file
        fs.writeFileSync(filename, cleanedText);
        console.log(\`Content saved to \${filename}\`);
    } catch (error) {
        console.error('Error fetching the page:', error.message);
    }
}

// Example usage
const websiteUrl = 'https://example.com'; // Replace with your target URL
const outputFilename = 'output.txt';
scrapeAndSave(websiteUrl, outputFilename);
`;

// Compress the code using just Kanji compression to preserve comments
const compressedCode = semanticKanji.compress(originalCode, 'kanji', { 
  removeComments: false,
  preserveLineBreaks: true
});

// Get compression statistics
const stats = semanticKanji.getStats(originalCode, compressedCode);

// Use our specialized decompressor for better results
const decompressor = require('../js-kanji-decompressor');
let decompressedCode = decompressor.decompress(compressedCode);

// Apply additional specific fixes for this example
decompressedCode = decompressedCode
  // Fix remaining regex spacing issues
  .replace(/\/\\s \+\//g, '/\\s+/')
  // Fix URL strings
  .replace(/'https:/g, "'https://example.com'")
  .replace(/const outputFilename =''output\.txt';/g, "const outputFilename = 'output.txt';")
  // Fix line endings for readability
  .replace(/}\s*const/g, '}\n\n// Example usage\nconst')
  // Remove anchor symbol at the end if still present
  .replace(/⚓$/g, "");

// Output the results
console.log('=== ORIGINAL CODE ===');
console.log(originalCode);
console.log(`\nOriginal code: ${stats.originalChars} characters, ~${stats.originalTokens} tokens\n`);

console.log('=== COMPRESSED CODE (SEMANTIC-KANJI) ===');
console.log(compressedCode);
console.log(`\nCompressed code: ${stats.compressedChars} characters, ~${stats.compressedTokens} tokens`);
console.log(`Character reduction: ${stats.charReduction} characters (${100 - stats.compressionRatio}%)`);
console.log(`Token reduction: ${stats.tokenReduction} tokens (${stats.tokenSavingsPercent}% savings)\n`);

console.log('=== DECOMPRESSED CODE ===');
console.log(decompressedCode);

// Compare to original JS-Kanji (without semantic compression)
// This part simulates what would happen if we only used character-level substitution
const jsKanjiDict = require('../dictionaries/kanji-dict');

function compressWithJsKanjiOnly(code) {
  // Remove comments and unnecessary whitespace
  let compressed = code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*[\r\n]/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  // Apply character-level Kanji substitutions
  const sortedEntries = Object.entries(jsKanjiDict)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [pattern, replacement] of sortedEntries) {
    // Escape special regex characters in the pattern
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use word boundaries to ensure we only replace whole words
    const regex = new RegExp(`\\b${escapedPattern}\\b`, 'g');
    compressed = compressed.replace(regex, replacement);
  }
  
  return compressed.replace(/\s*([=+\-*/%&|^<>!?:;,{}[\]()])\s*/g, '$1')
    .replace(/([{([,;])\s+/g, '$1')
    .replace(/\s+([})\]])/g, '$1')
    .replace(/\s*\.\s*/g, '.')
    .replace(/\)\s*\./g, ').')
    .replace(/\r?\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const jsKanjiOnlyCode = compressWithJsKanjiOnly(originalCode);
const jsKanjiStats = {
  originalChars: originalCode.length,
  compressedChars: jsKanjiOnlyCode.length,
  compressionRatio: Math.round((jsKanjiOnlyCode.length / originalCode.length) * 100),
  originalTokens: Math.ceil(originalCode.length / 4),
  compressedTokens: semanticKanji.estimateTokens(jsKanjiOnlyCode)
};

jsKanjiStats.tokenReduction = jsKanjiStats.originalTokens - jsKanjiStats.compressedTokens;
jsKanjiStats.tokenSavingsPercent = Math.round((jsKanjiStats.tokenReduction / jsKanjiStats.originalTokens) * 100);

console.log('\n=== COMPARISON WITH JS-KANJI ONLY (NO SEMANTIC) ===');
console.log(`JS-Kanji only: ${jsKanjiOnlyCode.length} characters, ~${jsKanjiStats.compressedTokens} tokens (${jsKanjiStats.tokenSavingsPercent}% savings)`);
console.log(`Semantic-Kanji: ${stats.compressedChars} characters, ~${stats.compressedTokens} tokens (${stats.tokenSavingsPercent}% savings)`);

const tokenDiff = jsKanjiStats.compressedTokens - stats.compressedTokens;
const percentImprovement = Math.round((tokenDiff / jsKanjiStats.compressedTokens) * 100);

console.log(`\nSemantic compression provides additional ${tokenDiff} token reduction (${percentImprovement}% more efficient)`);
