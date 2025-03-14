/**
 * Test of Semantic-Kanji compression on the web scraper example
 * 
 * This file tests the compression and decompression of the web scraper
 * code to validate that the conversion works as expected.
 */

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

// Test semantic compression
const semanticCompressed = semanticKanji.compress(originalCode);
console.log("\nSemantic-Kanji Compressed Result:");
console.log(semanticCompressed);

// Test decompression
const decompressed = semanticKanji.decompress(semanticCompressed);
console.log("\nDecompressed Result (first 200 chars):");
console.log(decompressed.substring(0, 200) + "...");

// Calculate token savings
const stats = semanticKanji.getStats(originalCode, semanticCompressed);
console.log("\nCompression Statistics:");
console.log(`- Original tokens: ~${stats.originalTokens}`);
console.log(`- Compressed tokens: ~${stats.compressedTokens}`);
console.log(`- Token reduction: ${stats.tokenReduction} (${stats.tokenSavingsPercent}%)`);

// Create a version that would be sent to an LLM
// This includes removing unnecessary whitespace and line breaks
const llmVersion = semanticCompressed.replace(/\s+/g, ' ').trim();
console.log("\nLLM-Ready Version:");
console.log(llmVersion);
console.log(`\nLLM version token count: ~${semanticKanji.estimateTokens(llmVersion)}`);
console.log(`Total token reduction: ${stats.originalTokens - semanticKanji.estimateTokens(llmVersion)} tokens (${Math.round(((stats.originalTokens - semanticKanji.estimateTokens(llmVersion)) / stats.originalTokens) * 100)}%)`);
