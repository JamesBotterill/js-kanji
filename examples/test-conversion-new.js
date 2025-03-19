/**
 * Test of Semantic-Kanji compression on the web scraper example
 * 
 * This file tests the compression and decompression of the web scraper
 * code to validate that the conversion works as expected.
 */

const jsKanji = require('../js-kanji-compressor');
const semanticKanji = require('../semantic-kanji');

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

// Expected semantic pattern matching for this specific code
console.log("Testing pattern matching for web scraper code...");

// Test regular kanji compression
const kanjiCompressed = jsKanji.compress(originalCode);
console.log("\nJS-Kanji Compressed Result:");
console.log(kanjiCompressed);

// Test semantic compression
const semanticCompressed = semanticKanji.compress(originalCode);
console.log("\nSemantic-Kanji Compressed Result:");
console.log(semanticCompressed);

// Test decompression
const decompressed = semanticKanji.decompress(semanticCompressed);
console.log("\nDecompressed Result (first 200 chars):");
console.log(decompressed.substring(0, 200) + "...");

// Calculate token savings for js-kanji
const kanjiStats = semanticKanji.getStats(originalCode, kanjiCompressed, 'kanji');
console.log("\nJS-Kanji Compression Statistics:");
console.log(`- Original tokens: ~${kanjiStats.originalTokens}`);
console.log(`- Compressed tokens: ~${kanjiStats.compressedTokens}`);
console.log(`- Token reduction: ${kanjiStats.tokenReduction} (${kanjiStats.tokenSavingsPercent}%)`);

// Calculate token savings for semantic-kanji
const semanticStats = semanticKanji.getStats(originalCode, semanticCompressed);
console.log("\nSemantic-Kanji Compression Statistics:");
console.log(`- Original tokens: ~${semanticStats.originalTokens}`);
console.log(`- Compressed tokens: ~${semanticStats.compressedTokens}`);
console.log(`- Token reduction: ${semanticStats.tokenReduction} (${semanticStats.tokenSavingsPercent}%)`);

// Compare the difference between methods
const improvement = semanticStats.tokenSavingsPercent - kanjiStats.tokenSavingsPercent;
console.log(`\nImprovement with Semantic-Kanji: ${improvement.toFixed(2)}% better token reduction`);

// Create LLM-ready versions (removing whitespace and line breaks)
const kanjiLLMVersion = kanjiCompressed.replace(/\s+/g, ' ').trim();
const semanticLLMVersion = semanticCompressed.replace(/\s+/g, ' ').trim();

// Calculate final token counts
const kanjiLLMTokens = semanticKanji.estimateTokens(kanjiLLMVersion, 'kanji');
const semanticLLMTokens = semanticKanji.estimateTokens(semanticLLMVersion, 'semantic-kanji');
const originalTokens = semanticStats.originalTokens;

console.log("\nFinal LLM-Ready Version Token Comparison:");
console.log(`- Original code: ~${originalTokens} tokens`);
console.log(`- JS-Kanji: ~${kanjiLLMTokens} tokens (${Math.round(((originalTokens - kanjiLLMTokens) / originalTokens) * 100)}% reduction)`);
console.log(`- Semantic-Kanji: ~${semanticLLMTokens} tokens (${Math.round(((originalTokens - semanticLLMTokens) / originalTokens) * 100)}% reduction)`);
