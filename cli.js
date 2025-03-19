/**
 * Command Line Interface for JS Compression tools
 */

const fs = require('fs');
const path = require('path');
const jsKanji = require('./js-kanji-compressor');
const semanticKanji = require('./index');
const utils = require('./utils');

const USAGE = `
JS-Compression: Efficient JavaScript compression using Kanji characters

Usage:
  node cli.js kanji compress <input.js> [output.js]
  node cli.js kanji decompress <input.kanji.js> [output.js]
  node cli.js semantic compress <input.js> [output.js]
  node cli.js semantic decompress <input.semantic.js> [output.js]
  node cli.js compare <input.js> [output-prefix]
  node cli.js help                        Show this help message
  
Options:
  kanji     Use JS-Kanji (basic Kanji-based compression)
  semantic  Use Semantic-Kanji (enhanced semantic pattern compression)
  compare   Compare both compression methods on the same file
  help      Show this help message
  
Examples:
  node cli.js kanji compress server.js server.kanji.js
  node cli.js semantic compress server.js server.semantic.js
  node cli.js compare app.js
`;

/**
 * Run the CLI with provided arguments
 * 
 * @param {string[]} args - Command line arguments (defaults to process.argv)
 */
function runCLI(args = process.argv.slice(2)) {
  if (args.length < 1) {
    process.stdout.write(USAGE + "\n");
    return;
  }

  const method = args[0];
  
  if (method === 'help' || method === '--help' || method === '-h') {
    process.stdout.write(USAGE + "\n");
    return;
  } else if (method === 'compare') {
    handleCompare(args.slice(1));
  } else if (['kanji', 'semantic'].includes(method)) {
    handleCompression(method, args.slice(1));
  } else {
    process.stderr.write(`Error: Unknown method '${method}'\n`);
    process.stdout.write(USAGE + "\n");
  }
}

/**
 * Handle compression/decompression operation
 * 
 * @param {string} method - Compression method ('kanji' or 'semantic')
 * @param {string[]} args - Remaining command line arguments
 */
function handleCompression(method, args) {
  if (args.length < 2) {
    console.error('Error: Missing command or input file');
    console.log(USAGE);
    return;
  }

  const command = args[0];
  const inputFile = args[1];
  const outputFile = args[2];

  if (!['compress', 'decompress'].includes(command)) {
    console.error(`Error: Unknown command '${command}'`);
    console.log(USAGE);
    return;
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found`);
    return;
  }

  const code = fs.readFileSync(inputFile, 'utf8');
  
  if (command === 'compress') {
    let compressed;
    if (method === 'kanji') {
      compressed = jsKanji.compress(code);
    } else { // semantic
      compressed = semanticKanji.compress(code, 'semantic-kanji');
    }
    
    const stats = utils.getCompressionStats(code, compressed, true);
    
    if (outputFile) {
      fs.writeFileSync(outputFile, compressed);
      console.log(`Compressed code written to: ${outputFile}`);
    }
    
    console.log(`=== COMPRESSION STATISTICS ===`);
    console.log(`- Original: ${stats.originalChars} characters, ~${stats.originalTokens} tokens`);
    console.log(`- Compressed: ${stats.compressedChars} characters, ~${stats.compressedTokens} tokens`);
    console.log(`- Character reduction: ${stats.charReduction} (${stats.compressionRatio}% of original)`);
    console.log(`- Token reduction: ${stats.tokenReduction} tokens (${stats.tokenSavingsPercent}% savings)`);
    
  } else { // decompress
    let decompressed;
    if (method === 'kanji') {
      decompressed = jsKanji.decompress(code);
    } else { // semantic
      decompressed = semanticKanji.decompress(code, 'semantic-kanji');
    }
    
    if (outputFile) {
      fs.writeFileSync(outputFile, decompressed);
      console.log(`Decompressed code written to: ${outputFile}`);
    } else {
      console.log(`=== DECOMPRESSED CODE ===`);
      console.log(decompressed);
    }
  }
}

/**
 * Handle comparison between compression methods
 * 
 * @param {string[]} args - Remaining command line arguments
 */
function handleCompare(args) {
  if (args.length < 1) {
    console.error('Error: Missing input file');
    console.log(USAGE);
    return;
  }

  const inputFile = args[0];
  const outputPrefix = args[1];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found`);
    return;
  }

  const code = fs.readFileSync(inputFile, 'utf8');
  
  // Compare both compression methods
  const kanjiCompressed = jsKanji.compress(code);
  const semanticCompressed = semanticKanji.compress(code, 'semantic-kanji');
  
  const originalTokens = utils.estimateTokens(code, false);
  const kanjiStats = utils.getCompressionStats(code, kanjiCompressed, true);
  const semanticStats = utils.getCompressionStats(code, semanticCompressed, true);
  
  console.log(`=== COMPRESSION COMPARISON: ${path.basename(inputFile)} ===\n`);
  console.log(`Original code: ${code.length} chars, ~${originalTokens} tokens\n`);
  
  console.log('JS-Kanji:');
  console.log(`- ${kanjiStats.compressedChars} chars (${kanjiStats.compressionRatio}% of original)`);
  console.log(`- ~${kanjiStats.compressedTokens} tokens (${kanjiStats.tokenSavingsPercent}% savings)`);
  console.log(`- First 100 chars: ${kanjiCompressed.substring(0, 100)}...\n`);
  
  console.log('Semantic-Kanji:');
  console.log(`- ${semanticStats.compressedChars} chars (${semanticStats.compressionRatio}% of original)`);
  console.log(`- ~${semanticStats.compressedTokens} tokens (${semanticStats.tokenSavingsPercent}% savings)`);
  console.log(`- First 100 chars: ${semanticCompressed.substring(0, 100)}...\n`);
  
  // Calculate token efficiency comparison
  const tokenDiff = kanjiStats.compressedTokens - semanticStats.compressedTokens;
  const efficiencyImprovement = Math.round((tokenDiff / kanjiStats.compressedTokens) * 100);
  
  console.log('COMPARISON RESULT:');
  if (tokenDiff > 0) {
    console.log(`Semantic-Kanji saves ${tokenDiff} more tokens than JS-Kanji (${efficiencyImprovement}% more efficient)`);
  } else if (tokenDiff < 0) {
    console.log(`JS-Kanji saves ${-tokenDiff} more tokens than Semantic-Kanji (${-efficiencyImprovement}% more efficient)`);
  } else {
    console.log('Both methods have identical token efficiency for this code');
  }
  
  // Write output files if requested
  if (outputPrefix) {
    const kanjiOutput = `${outputPrefix}.kanji.js`;
    const semanticOutput = `${outputPrefix}.semantic.js`;
    
    fs.writeFileSync(kanjiOutput, kanjiCompressed);
    fs.writeFileSync(semanticOutput, semanticCompressed);
    
    console.log(`\nKanji output written to: ${kanjiOutput}`);
    console.log(`Semantic output written to: ${semanticOutput}`);
  }
}

module.exports = runCLI;
