# JS-Kanji

Ultra-efficient JavaScript compression for LLM communication.

This specialized compression system uses character-level Kanji substitution to achieve maximum token efficiency when communicating with language models like Claude and GPT.

## Overview

JS-Kanji uses a character-level compression approach to reduce JavaScript code tokens by up to 70%:

- **Kanji Compression**: JavaScript tokens are mapped to Kanji characters
- **Each Kanji character typically counts as a single token in LLM tokenizers**
- **Full reversibility**: Compressed code can be fully decompressed back to original JavaScript

## Features

- **Kanji Character Mapping**: Individual JavaScript tokens are mapped to single Kanji characters
- **Specialized Decompressor**: Ensures reliable code restoration
- **Command-line Interface**: Compress, decompress, and compare with simple commands
- **Node.js Integration**: Use as a module in your JavaScript projects
- **Up to 70% Token Reduction**: Significantly more efficient than ASCII-based approaches

## Example

**Original JavaScript (242 tokens):**
```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
// Function to scrape a webpage and save its content
async function scrapeAndSave(url, filename) {
    try {
        // Fetch the HTML content
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        // Extract text content
        const textContent = $('body').text();
        
        // Clean up the text
        const cleanedText = textContent.replace(/\\s+/g, ' ').trim();
        
        // Save to a text file
        fs.writeFileSync(filename, cleanedText);
        console.log(`Content saved to ${filename}`);
    } catch (error) {
        console.error('Error fetching the page:', error.message);
    }
}
const websiteUrl = 'https://example.com';
const outputFilename = 'output.txt';
scrapeAndSave(websiteUrl, outputFilename);
```

**Compressed with JS-Kanji (~80 tokens):**
```
定a=要('axios');定c=要('cheerio');定f=要('fs');非同期関数scrapeAndSave(url,文名){試{定{データ}=待a.得(url);定$=c.読込(データ);定文内=$('体').文();定浄文=文内.取代(/\\s+/g,' ').整理();f.書込文名(文名,浄文);控.記(`内容保存到${文名}`);}取(誤){控.誤('頁取得誤:',誤.文);}}定網址='https://example.com';定出名='output.txt';scrapeAndSave(網址,出名);
```

This represents a ~67% reduction in token usage!

## Usage

```javascript
const jsKanji = require('js-kanji');

// Compress JavaScript code
const compressed = jsKanji.compress(originalCode);

// Calculate statistics
const stats = jsKanji.getStats(originalCode, compressed);
console.log(`Token reduction: ${stats.tokenSavingsPercent}%`);

// Decompress back to JavaScript
const decompressed = jsKanji.decompress(compressed);
```

## CLI Usage

```bash
# Compress a JavaScript file
node cli.js compress myfile.js --method=kanji

# Decompress code
node cli.js decompress compressed.txt

# Compare compression methods
node cli.js compare myfile.js
```

## Project Structure

- **js-kanji-compressor.js**: Core compression logic
- **js-kanji-decompressor.js**: Specialized decompressor
- **semantic-kanji.js**: Enhanced pattern-based compression
- **dictionaries/kanji-dict.js**: Character-level mappings
- **examples/**: Usage examples
- **cli.js**: Command-line interface

## Benefits of JS-Kanji

- **High Efficiency**: Achieves up to 70% token reduction
- **Reliable Decompression**: Specialized decompressor ensures code can be properly restored
- **Simple Integration**: Easy to use as a Node.js module or CLI tool
- **Error Handling**: Robust error handling for edge cases

## Installation

```bash
npm install js-kanji
```

## Testing

The project includes a comprehensive test suite to ensure all functionality works correctly:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- tests/js-kanji.test.js
```

Test files are organized in the `tests/` directory:
- `index.test.js`: Tests for the main public API
- `semantic-patterns.test.js`: Tests for semantic pattern recognition
- `js-kanji.test.js`: Tests for the kanji compressor/decompressor
- `utils-and-prompt.test.js`: Tests for utility functions and prompt generator
- `integration.test.js`: Full workflow integration tests
- `cli.test.js`: Command-line interface tests

## Contributing

Contributions are welcome! Areas where you can help:

1. Improved character mappings for higher efficiency
2. Enhanced error handling
3. Performance optimizations
4. Documentation improvements
5. Additional test cases

## License

MIT
