/**
 * Command Line Interface for JS Compression tools
 */

const fs = require('fs');
const path = require('path');
const jsKanji = require('./js-kanji');
const utils = require('./utils');

const USAGE = `
JS-Compression: Token-efficient JavaScript compression for LLM communication

Usage:
  node js-compress.js mini compress <input.js> [output.js]
  node js-compress.js mini decompress <input.mini.js> [output.js]
  node js-compress.js kanji compress <input.js> [output.js]
  node js-compress.js kanji decompress <input.kanji.js> [output.js]
  node js-compress.js compare <input.js> [output-prefix]
  
Options:
  mini     Use JS-Mini (ASCII-based compression, more human-readable)
  kanji    Use JS-Kanji (Kanji-based compression, maximum token efficiency)
  compare  Compare both compression methods on the same file
  
Examples:
  node js-compress.js mini compress server.js server.mini.js
  node js-compress.js kanji compress server.js server.kanji.js
  node js-compress.js compare app.js
`;

/**
 * Run the CLI with provided arguments
 * 
 * @param {string[]} args - Command line arguments (defaults to process.argv)
 */
function runCLI(args = process.argv.slice(2)) {
  if (args.length < 1) {
    console.log(USAGE);
    return;
  }

  const method = args[0];
  
  if (method === 'compare') {
    handleCompare(args.slice(1));
  } else if (['mini', 'kanji'].includes(method)) {
    handleCompression(method, args.slice(1));
  } else {
    console.error(`Error: Unknown method '${method}'`);
    console.log(USAGE);
  }
}

/**
 * Handle compression/decompression operation
 * 
 * @param {string} method - Compression method ('mini' or 'kanji')
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
    if (method === 'mini') {
      compressed = jsMini.compress(code);
    } else {
      compressed = jsKanji.compress(code);
    }
    
    const stats = utils.getCompressionStats(code, compressed, method === 'kanji');
    
    if (outputFile) {
      fs.writeFileSync(outputFile, compressed);
      console.log(`Compressed code written to: ${outputFile}`);
    }
    
    console.log(utils.formatCompressionResult(stats, method));
    
  } else { // decompress
    let decompressed;
    if (method === 'mini') {
      decompressed = jsMini.decompress(code);
    } else {
      decompressed = jsKanji.decompress(code);
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
  const miniCompressed = jsMini.compress(code);
  const kanjiCompressed = jsKanji.compress(code);
  
  const miniStats = utils.getCompressionStats(code, miniCompressed, false);
  const kanjiStats = utils.getCompressionStats(code, kanjiCompressed, true);
  
  console.log(`=== COMPRESSION COMPARISON: ${path.basename(inputFile)} ===\n`);
  console.log(`Original code: ${miniStats.originalChars} chars, ~${miniStats.originalTokens} tokens\n`);
  
  console.log('JS-Mini (ASCII):');
  console.log(`- ${miniStats.compressedChars} chars (${miniStats.compressionRatio}% of original)`);
  console.log(`- ~${miniStats.compressedTokens} tokens (${miniStats.tokenSavingsPercent}% savings)`);
  console.log(`- First 100 chars: ${miniCompressed.substring(0, 100)}...\n`);
  
  console.log('JS-Kanji:');
  console.log(`- ${kanjiStats.compressedChars} chars (${kanjiStats.compressionRatio}% of original)`);
  console.log(`- ~${kanjiStats.compressedTokens} tokens (${kanjiStats.tokenSavingsPercent}% savings)`);
  console.log(`- First 100 chars: ${kanjiCompressed.substring(0, 100)}...\n`);
  
  // Calculate token efficiency comparison
  const tokenDiff = miniStats.compressedTokens - kanjiStats.compressedTokens;
  const efficiencyImprovement = Math.round((tokenDiff / miniStats.compressedTokens) * 100);
  
  console.log('COMPARISON RESULT:');
  if (tokenDiff > 0) {
    console.log(`JS-Kanji saves ${tokenDiff} more tokens than JS-Mini (${efficiencyImprovement}% more efficient)`);
  } else if (tokenDiff < 0) {
    console.log(`JS-Mini saves ${-tokenDiff} more tokens than JS-Kanji (${-efficiencyImprovement}% more efficient)`);
  } else {
    console.log('Both methods have identical token efficiency for this code');
  }
  
  // Write output files if requested
  if (outputPrefix) {
    const miniOutput = `${outputPrefix}.mini.js`;
    const kanjiOutput = `${outputPrefix}.kanji.js`;
    
    fs.writeFileSync(miniOutput, miniCompressed);
    fs.writeFileSync(kanjiOutput, kanjiCompressed);
    
    console.log(`\nMini output written to: ${miniOutput}`);
    console.log(`Kanji output written to: ${kanjiOutput}`);
  }
}

module.exports = runCLI;
