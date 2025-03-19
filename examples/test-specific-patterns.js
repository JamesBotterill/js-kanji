/**
 * Test of Semantic-Kanji compression on specific semantic patterns
 * 
 * This file tests the compression and decompression specifically focusing
 * on common pattern replacements.
 */

const jsKanji = require('../js-kanji-compressor');
const semanticKanji = require('../semantic-kanji');

// Create code examples that match specific patterns from semantic-patterns.js
const webScraperPattern = `
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
async function scrapeAndSave(url, filename) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const textContent = $('body').text();
    const cleanText = textContent.replace(/\\s+/g, ' ').trim();
    fs.writeFileSync(filename, cleanText);
    console.log(\`Content saved to \${filename}\`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}`;

const expressPattern = `
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom middleware here

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

const expressRoutePattern = `
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find({});
    return res.status(200).json(items);
  } catch (error) {
    console.error('Fetch error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});`;

const errorHandlerPattern = `
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}`;

const asyncTryPattern = `
async function fetchData(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error.message);
    throw error;
  }
}`;

const mapOperation = `
function processItems(items) {
  return items.map(item => {
    // Transform the item
    const processed = {
      id: item.id,
      name: item.name.toUpperCase(),
      value: item.value * 2
    };
    return processed;
  });
}`;

// Combine patterns into a comprehensive test
const patternExamples = [
  { name: "Web Scraper", code: webScraperPattern },
  { name: "Express Server", code: expressPattern },
  { name: "Express Route", code: expressRoutePattern },
  { name: "Error Handler", code: errorHandlerPattern },
  { name: "Async Try", code: asyncTryPattern },
  { name: "Map Operation", code: mapOperation }
];

// Test each pattern
for (const example of patternExamples) {
  console.log(`\n=== TESTING PATTERN: ${example.name} ===`);
  
  // Compare regular Kanji vs Semantic Kanji
  const kanjiCompressed = jsKanji.compress(example.code);
  const semanticCompressed = semanticKanji.compress(example.code);
  
  // Calculate stats
  const kanjiStats = semanticKanji.getStats(example.code, kanjiCompressed, 'kanji');
  const semanticStats = semanticKanji.getStats(example.code, semanticCompressed);
  
  console.log(`\nOriginal Code (${example.code.length} chars):`);
  console.log(example.code);
  
  console.log(`\nKanji Compressed (${kanjiCompressed.length} chars):`);
  console.log(kanjiCompressed);
  
  console.log(`\nSemantic Compressed (${semanticCompressed.length} chars):`);
  console.log(semanticCompressed);
  
  // Compare compression metrics
  const improvement = semanticStats.tokenSavingsPercent - kanjiStats.tokenSavingsPercent;
  
  console.log(`\nCompression Statistics:`);
  console.log(`- Original tokens: ~${semanticStats.originalTokens}`);
  console.log(`- JS-Kanji tokens: ~${kanjiStats.compressedTokens} (${kanjiStats.tokenSavingsPercent}% reduction)`);
  console.log(`- Semantic-Kanji tokens: ~${semanticStats.compressedTokens} (${semanticStats.tokenSavingsPercent}% reduction)`);
  console.log(`- Improvement: ${improvement.toFixed(2)}% better token reduction with Semantic-Kanji`);
}

// Overall statistics across all patterns
console.log(`\n=== OVERALL IMPROVEMENT ===`);
const allCode = patternExamples.map(ex => ex.code).join('\n\n');

// Compare overall compression
const kanjiCompressed = jsKanji.compress(allCode);
const semanticCompressed = semanticKanji.compress(allCode);

// Calculate overall stats
const kanjiStats = semanticKanji.getStats(allCode, kanjiCompressed, 'kanji');
const semanticStats = semanticKanji.getStats(allCode, semanticCompressed);

// Create LLM-ready versions (removing whitespace and line breaks)
const kanjiLLMVersion = kanjiCompressed.replace(/\s+/g, ' ').trim();
const semanticLLMVersion = semanticCompressed.replace(/\s+/g, ' ').trim();

// Calculate final token counts
const kanjiLLMTokens = semanticKanji.estimateTokens(kanjiLLMVersion, 'kanji');
const semanticLLMTokens = semanticKanji.estimateTokens(semanticLLMVersion, 'semantic-kanji');
const originalTokens = semanticStats.originalTokens;

// Overall improvement percentage
const overallImprovement = semanticStats.tokenSavingsPercent - kanjiStats.tokenSavingsPercent;

console.log(`Original content: ${allCode.length} chars, ~${originalTokens} tokens`);
console.log(`JS-Kanji compression: ${kanjiLLMVersion.length} chars, ~${kanjiLLMTokens} tokens (${Math.round(((originalTokens - kanjiLLMTokens) / originalTokens) * 100)}% reduction)`);
console.log(`Semantic-Kanji compression: ${semanticLLMVersion.length} chars, ~${semanticLLMTokens} tokens (${Math.round(((originalTokens - semanticLLMTokens) / originalTokens) * 100)}% reduction)`);
console.log(`\nOverall token reduction improvement: ${overallImprovement.toFixed(2)}%`);