#!/usr/bin/env node

/**
 * JS-Kanji Converter
 * 
 * A standalone utility to convert between JavaScript (.js) and Semantic-Kanji (.kjs) files.
 * This tool can be used both as a command-line utility and programmatically.
 */

const fs = require('fs');
const path = require('path');
const semanticKanji = require('./semantic-kanji');

/**
 * Convert a JS file to KJS format
 * 
 * @param {string} inputFile - Path to input JavaScript file
 * @param {string} outputFile - Path to output KJS file (optional)
 * @param {Object} options - Compression options
 * @returns {Object} - Result object with code and stats
 */
function convertJsToKjs(inputFile, outputFile = null, options = {}) {
  try {
    // Determine output filename if not provided
    if (!outputFile) {
      const inputExt = path.extname(inputFile);
      const baseName = path.basename(inputFile, inputExt);
      const dirName = path.dirname(inputFile);
      outputFile = path.join(dirName, `${baseName}.kjs`);
    }

    // Read input file
    const jsCode = fs.readFileSync(inputFile, 'utf8');
    
    // Compress the code
    const kjsCode = semanticKanji.compress(jsCode, options);
    
    // Get compression statistics
    const stats = semanticKanji.getStats(jsCode, kjsCode);
    
    // Write output file if requested
    if (outputFile) {
      fs.writeFileSync(outputFile, kjsCode);
    }
    
    return {
      original: jsCode,
      compressed: kjsCode,
      stats,
      outputFile
    };
  } catch (error) {
    throw new Error(`Conversion error: ${error.message}`);
  }
}

/**
 * Convert a KJS file to JS format
 * 
 * @param {string} inputFile - Path to input KJS file
 * @param {string} outputFile - Path to output JS file (optional)
 * @param {Object} options - Decompression options
 * @returns {Object} - Result object with code
 */
function convertKjsToJs(inputFile, outputFile = null, options = {}) {
  try {
    // Determine output filename if not provided
    if (!outputFile) {
      const inputExt = path.extname(inputFile);
      const baseName = path.basename(inputFile, inputExt);
      const dirName = path.dirname(inputFile);
      outputFile = path.join(dirName, `${baseName}.decompressed.js`);
    }

    // Read input file
    const kjsCode = fs.readFileSync(inputFile, 'utf8');
    
    // Decompress the code
    const jsCode = semanticKanji.decompress(kjsCode, options);
    
    // Write output file if requested
    if (outputFile) {
      fs.writeFileSync(outputFile, jsCode);
    }
    
    return {
      compressed: kjsCode,
      decompressed: jsCode,
      outputFile
    };
  } catch (error) {
    throw new Error(`Conversion error: ${error.message}`);
  }
}

/**
 * Determine if a file is likely a KJS file
 * 
 * @param {string} filename - File to check
 * @param {boolean} checkContent - Whether to also check file content
 * @returns {boolean} - True if file is likely KJS
 */
function isKjsFile(filename, checkContent = true) {
  // Check extension first
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.kjs') {
    return true;
  }
  
  // Check content if requested
  if (checkContent && fs.existsSync(filename)) {
    const content = fs.readFileSync(filename, 'utf8');
    return semanticKanji.isSemanticKanjiCompressed(content);
  }
  
  return false;
}

// Command line interface
function runCli() {
  const args = process.argv.slice(2);
  
  // Show usage if no arguments
  if (args.length === 0) {
    console.log(`
JS-Kanji Converter - Convert between JavaScript and Semantic-Kanji formats

Usage:
  js-kanji-converter <input-file> [output-file] [options]

Examples:
  js-kanji-converter script.js                  # Creates script.kjs
  js-kanji-converter script.kjs                 # Creates script.decompressed.js
  js-kanji-converter input.js output.kjs        # Specify output filename
  js-kanji-converter input.kjs output.js        # Specify output filename
  
Options:
  --format            Format the decompressed code (default: true)
  --no-format         Don't format the decompressed code
  --preserve-lines    Preserve line breaks in compressed code
  --stats             Show compression statistics
  --help              Show this help message
    `);
    return;
  }
  
  // Handle help
  if (args.includes('--help')) {
    return runCli();
  }
  
  // Extract options
  const options = {
    formatOutput: !args.includes('--no-format'),
    preserveLineBreaks: args.includes('--preserve-lines'),
    showStats: args.includes('--stats')
  };
  
  // Remove option arguments
  const cleanArgs = args.filter(arg => !arg.startsWith('--'));
  
  // Get input and output files
  const inputFile = cleanArgs[0];
  const outputFile = cleanArgs.length > 1 ? cleanArgs[1] : null;
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file "${inputFile}" not found.`);
    process.exit(1);
  }
  
  try {
    // Determine operation based on input file
    const isKjs = isKjsFile(inputFile);
    
    if (isKjs) {
      // KJS to JS conversion
      const result = convertKjsToJs(inputFile, outputFile, options);
      console.log(`Successfully decompressed to: ${result.outputFile}`);
      console.log(`Original size: ${result.compressed.length} characters`);
      console.log(`Decompressed size: ${result.decompressed.length} characters`);
    } else {
      // JS to KJS conversion
      const result = convertJsToKjs(inputFile, outputFile, options);
      console.log(`Successfully compressed to: ${result.outputFile}`);
      
      if (options.showStats) {
        const stats = result.stats;
        console.log(`Original: ${stats.originalChars} chars, ~${stats.originalTokens} tokens`);
        console.log(`Compressed: ${stats.compressedChars} chars, ~${stats.compressedTokens} tokens`);
        console.log(`Token reduction: ${stats.tokenReduction} (${stats.tokenSavingsPercent}% savings)`);
      } else {
        console.log(`Original size: ${result.original.length} characters`);
        console.log(`Compressed size: ${result.compressed.length} characters`);
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

// Run as CLI if called directly
if (require.main === module) {
  runCli();
}

// Export for programmatic use
module.exports = {
  convertJsToKjs,
  convertKjsToJs,
  isKjsFile
};
