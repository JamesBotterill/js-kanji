#!/usr/bin/env node

/**
 * JS-Kanji CLI
 * 
 * A command-line interface for the Semantic-Kanji compression system.
 * This tool allows you to compress, decompress, and analyze JavaScript files.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const jsCompression = require('../index');

// Define CLI version from package.json
const packageJson = require('../package.json');
const VERSION = packageJson.version;

// Setup CLI program
program
  .name('js-kanji')
  .description('Ultra-efficient JavaScript compression for LLM communication')
  .version(VERSION);

// Compress command
program
  .command('compress <file>')
  .description('Compress JavaScript code')
  .option('-o, --output <file>', 'Output file (defaults to input.min.js)')
  .option('-m, --method <method>', 'Compression method (mini, kanji, semantic-kanji)', 'semantic-kanji')
  .option('-p, --print', 'Print the compressed code to console')
  .option('-s, --stats', 'Show compression statistics', true)
  .action((file, options) => {
    try {
      // Validate input file
      if (!fs.existsSync(file)) {
        console.error(chalk.red(`Error: File '${file}' not found`));
        process.exit(1);
      }

      // Read input file
      const originalCode = fs.readFileSync(file, 'utf8');
      
      // Generate output filename if not specified
      const outputFile = options.output || getDefaultOutputName(file, options.method);
      
      // Compress code using specified method
      const compressedCode = jsCompression.compress(originalCode, options.method);
      
      // Write compressed output
      fs.writeFileSync(outputFile, compressedCode);
      console.log(chalk.green(`Compressed code written to: ${outputFile}`));
      
      // Print code if requested
      if (options.print) {
        console.log('\nCompressed code:');
        console.log(chalk.cyan(compressedCode));
      }
      
      // Show statistics if requested
      if (options.stats) {
        const stats = jsCompression.getStats(originalCode, compressedCode, options.method !== 'mini');
        displayStats(stats);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Decompress command
program
  .command('decompress <file>')
  .description('Decompress JS-Kanji code')
  .option('-o, --output <file>', 'Output file (defaults to input.expanded.js)')
  .option('-m, --method <method>', 'Decompression method (mini, kanji, semantic-kanji, auto)', 'auto')
  .option('-p, --print', 'Print the decompressed code to console')
  .action((file, options) => {
    try {
      // Validate input file
      if (!fs.existsSync(file)) {
        console.error(chalk.red(`Error: File '${file}' not found`));
        process.exit(1);
      }

      // Read input file
      const compressedCode = fs.readFileSync(file, 'utf8');
      
      // Generate output filename if not specified
      const outputFile = options.output || file.replace(/\.(min|kanji|semantic)\.js$/, '') + '.expanded.js';
      
      // Decompress code
      const method = options.method === 'auto' ? null : options.method;
      const decompressedCode = jsCompression.decompress(compressedCode, method);
      
      // Write decompressed output
      fs.writeFileSync(outputFile, decompressedCode);
      console.log(chalk.green(`Decompressed code written to: ${outputFile}`));
      
      // Print code if requested
      if (options.print) {
        console.log('\nDecompressed code:');
        console.log(chalk.cyan(decompressedCode.substring(0, 500) + (decompressedCode.length > 500 ? '...' : '')));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Compare command
program
  .command('compare <file>')
  .description('Compare different compression methods')
  .option('-o, --output <prefix>', 'Output files prefix for all formats')
  .option('-p, --print', 'Print the compressed code to console')
  .action((file, options) => {
    try {
      // Validate input file
      if (!fs.existsSync(file)) {
        console.error(chalk.red(`Error: File '${file}' not found`));
        process.exit(1);
      }

      // Read input file
      const originalCode = fs.readFileSync(file, 'utf8');
      
      // Compare all methods
      const comparison = jsCompression.compare(originalCode);
      
      // Display comparison
      displayComparison(comparison);
      
      // Write output files if prefix is provided
      if (options.output) {
        const outputPrefix = options.output;
        const miniFile = `${outputPrefix}.mini.js`;
        const kanjiFile = `${outputPrefix}.kanji.js`;
        const semanticFile = `${outputPrefix}.semantic.js`;
        
        fs.writeFileSync(miniFile, comparison.mini.code);
        fs.writeFileSync(kanjiFile, comparison.kanji.code);
        fs.writeFileSync(semanticFile, comparison.semantic.code);
        
        console.log(chalk.green(`\nOutput files written to:`));
        console.log(`- JS-Mini: ${miniFile}`);
        console.log(`- JS-Kanji: ${kanjiFile}`);
        console.log(`- Semantic-Kanji: ${semanticFile}`);
      }
      
      // Print code if requested
      if (options.print) {
        console.log('\nJS-Mini:');
        console.log(chalk.cyan(comparison.mini.code));
        
        console.log('\nJS-Kanji:');
        console.log(chalk.cyan(comparison.kanji.code));
        
        console.log('\nSemantic-Kanji:');
        console.log(chalk.cyan(comparison.semantic.code));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Generate prompt command
program
  .command('prompt')
  .description('Generate LLM instruction prompts')
  .option('-m, --method <method>', 'Compression method (mini, kanji, semantic-kanji)', 'semantic-kanji')
  .option('-f, --format <format>', 'Prompt format (full, basic, minimal)', 'full')
  .option('-o, --output <file>', 'Save prompts to file')
  .option('-s, --split', 'Generate split prompts for large conversations', false)
  .action((options) => {
    try {
      const prompts = jsCompression.generatePrompt(
        options.format, 
        options.method, 
        { split: options.split }
      );
      
      if (options.split && Array.isArray(prompts)) {
        console.log(chalk.green(`Generated ${prompts.length} prompt segments`));
        
        if (options.output) {
          // Write each prompt segment to a separate file
          for (let i = 0; i < prompts.length; i++) {
            const segmentFile = options.output.replace(/(\.\w+)?$/, `-part${i+1}$1`);
            fs.writeFileSync(segmentFile, prompts[i]);
            console.log(`Prompt segment ${i+1} written to: ${segmentFile}`);
          }
        } else {
          // Print each segment
          prompts.forEach((prompt, i) => {
            console.log(chalk.cyan(`\n--- PROMPT SEGMENT ${i+1} ---`));
            console.log(prompt);
          });
        }
      } else {
        // Single prompt
        const prompt = Array.isArray(prompts) ? prompts[0] : prompts;
        
        if (options.output) {
          fs.writeFileSync(options.output, prompt);
          console.log(chalk.green(`Prompt written to: ${options.output}`));
        } else {
          console.log(chalk.cyan('\n--- LLM INSTRUCTION PROMPT ---'));
          console.log(prompt);
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Helper function to determine default output filename
function getDefaultOutputName(inputFile, method) {
  const ext = path.extname(inputFile);
  const base = path.basename(inputFile, ext);
  const dir = path.dirname(inputFile);
  
  switch (method) {
    case 'mini':
      return path.join(dir, `${base}.mini${ext}`);
    case 'kanji':
      return path.join(dir, `${base}.kanji${ext}`);
    case 'semantic-kanji':
    case 'semantic':
      return path.join(dir, `${base}.semantic${ext}`);
    default:
      return path.join(dir, `${base}.min${ext}`);
  }
}

// Helper function to display compression statistics
function displayStats(stats) {
  console.log(chalk.cyan('\nCompression Statistics:'));
  console.log(`- Original: ${stats.originalChars} characters, ~${stats.originalTokens} tokens`);
  console.log(`- Compressed: ${stats.compressedChars} characters, ~${stats.compressedTokens} tokens`);
  console.log(`- Character reduction: ${stats.charReduction} (${stats.compressionRatio}% of original)`);
  console.log(chalk.green(`- Token reduction: ${stats.tokenReduction} tokens (${stats.tokenSavingsPercent}% savings)`));
}

// Helper function to display compression comparison
function displayComparison(comparison) {
  console.log(chalk.cyan('\nCompression Comparison:'));
  console.log(`Original code: ${comparison.original.chars} characters, ~${comparison.original.tokens} tokens\n`);
  
  console.log('JS-Mini:');
  console.log(`- ${comparison.mini.chars} characters, ~${comparison.mini.tokens} tokens`);
  console.log(`- Token reduction: ${comparison.mini.reduction} (${comparison.mini.savingsPercent}% savings)`);
  
  console.log('\nJS-Kanji:');
  console.log(`- ${comparison.kanji.chars} characters, ~${comparison.kanji.tokens} tokens`);
  console.log(`- Token reduction: ${comparison.kanji.reduction} (${comparison.kanji.savingsPercent}% savings)`);
  
  console.log('\nSemantic-Kanji:');
  console.log(`- ${comparison.semantic.chars} characters, ~${comparison.semantic.tokens} tokens`);
  console.log(chalk.green(`- Token reduction: ${comparison.semantic.reduction} (${comparison.semantic.savingsPercent}% savings)`));
  
  // Determine the best method
  const methods = [
    { name: 'JS-Mini', savings: comparison.mini.savingsPercent },
    { name: 'JS-Kanji', savings: comparison.kanji.savingsPercent },
    { name: 'Semantic-Kanji', savings: comparison.semantic.savingsPercent }
  ];
  
  const bestMethod = methods.reduce((best, current) => 
    current.savings > best.savings ? current : best
  );
  
  console.log(chalk.yellow(`\nMost efficient method: ${bestMethod.name} (${bestMethod.savings}% token savings)`));
}

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}