/**
 * Test of Semantic-Kanji compression on a complex code example
 * 
 * This file tests the compression and decompression of code that 
 * contains semantic patterns that should be optimized.
 */

const jsKanji = require('../js-kanji-compressor');
const semanticKanji = require('../semantic-kanji');

// Original code with patterns that match semantic-patterns.js
const originalCode = `
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeWebsite(url, outputFile) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const content = $('body').text();
    const cleanContent = content.replace(/\\s+/g, ' ').trim();
    fs.writeFileSync(outputFile, cleanContent);
    console.log(\`Content saved to \${outputFile}\`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Express server setup
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle GET requests
app.get('/api/scrape', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const tempFile = \`./temp-\${Date.now()}.txt\`;
    await scrapeWebsite(url, tempFile);
    
    const data = fs.readFileSync(tempFile, 'utf8');
    fs.unlinkSync(tempFile);
    
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Scraping error:', error.message);
    return res.status(500).json({ error: 'Failed to scrape website' });
  }
});

// Database operations
async function findAllItems(query) {
  try {
    const items = await Item.find(query).sort({ createdAt: -1 });
    return items;
  } catch (error) {
    console.error('Database error:', error.message);
    throw error;
  }
}

async function createItem(data) {
  try {
    const item = new Item(data);
    await item.save();
    return item;
  } catch (error) {
    console.error('Item creation error:', error.message);
    throw error;
  }
}

function processData(data, transformFn) {
  return data.map(item => {
    const processed = transformFn(item);
    return processed;
  });
}

// Error handling middleware
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

// Test regular kanji compression
const kanjiCompressed = jsKanji.compress(originalCode);
console.log("\nJS-Kanji Compressed Result:");
console.log(kanjiCompressed);

// Test semantic compression
const semanticCompressed = semanticKanji.compress(originalCode);
console.log("\nSemantic-Kanji Compressed Result:");
console.log(semanticCompressed);

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