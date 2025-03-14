# Semantic-Kanji

Ultra-efficient JavaScript compression for LLM communication.

This hybrid compression system combines semantic pattern recognition with character-level Kanji substitution to achieve maximum token efficiency when communicating with language models like Claude and GPT.

## Overview

Semantic-Kanji uses a two-level compression approach to reduce JavaScript code tokens by up to 80%:

1. **Level 1 - Semantic Compression**:
   - Common programming patterns (web scraping, API requests, error handling) are detected and replaced with special Unicode symbols
   - Each semantic symbol encodes entire blocks of functionality in a single token

2. **Level 2 - Kanji Compression**:
   - Remaining code elements are mapped to Kanji characters
   - Each Kanji character typically counts as a single token in LLM tokenizers

## Features

- **Semantic Pattern Recognition**: High-level programming patterns are replaced with single Unicode symbols
- **Kanji Character Mapping**: Individual JavaScript tokens are mapped to single Kanji characters
- **Reversible Compression**: Full decompression back to readable JavaScript
- **Up to 80% Token Reduction**: Significantly more efficient than ASCII-based approaches

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

**Compressed with Semantic-Kanji (~65 tokens):**
```
웎.웏(scrapeAndSave,url,filename,textContent,'body',cleanedText)
定websiteUrl='https://example.com';定outputFilename='output.txt';
scrapeAndSave(websiteUrl,outputFilename);
```

This represents a ~73% reduction in token usage!

## Usage

```javascript
const semanticKanji = require('semantic-kanji');

// Compress JavaScript code
const compressed = semanticKanji.compress(originalCode);

// Calculate statistics
const stats = semanticKanji.getStats(originalCode, compressed);
console.log(`Token reduction: ${stats.tokenSavingsPercent}%`);

// Decompress back to JavaScript
const decompressed = semanticKanji.decompress(compressed);
```

## Teaching LLMs to Understand Semantic-Kanji

To use this system with an LLM, include an instruction prompt that explains the compression system and how to interpret it. A sample prompt is provided in `llm-instruction-prompt.md`.

## Project Structure

- **semantic-kanji.js**: Core compression system
- **dictionaries/kanji-dict.js**: Character-level mappings
- **dictionaries/semantic-dict.js**: Semantic symbol mappings
- **dictionaries/semantic-patterns.js**: Pattern definitions
- **examples/**: Usage examples

## Benefits Over Other Approaches

- **More Efficient Than ASCII-Only**: Traditional abbreviation approaches (like JS-Mini) achieve ~50% reduction; Semantic-Kanji achieves 70-80%
- **Conceptual Compression**: Entire programming concepts are mapped to single tokens
- **Universal Patterns**: Common patterns across JavaScript are uniformly represented
- **Single-Token Efficiency**: Each Kanji and semantic symbol typically represents a single token to the model

## Future Improvements

### Smarter Pattern Recognition
- Implement AST-based pattern matching instead of regex
- Use JavaScript parsers like Esprima or Acorn for more robust code analysis

### Context-Aware Compression
- Add a context dictionary that builds during compression
- For repeatedly used variables or patterns, assign shorter symbols after first use

### Domain-Specific Dictionaries
- Create specialized dictionaries for different frameworks (React, Vue, Express, etc.)
- Allow users to import only the dictionaries relevant to their code
- Provide a mechanism for users to create custom dictionaries

### Token Optimization Analysis
- Add tooling to analyze which compression techniques save the most tokens for a specific codebase
- Focus dictionary expansion on the most valuable patterns

### Interactive Tools
- Build a CLI tool for interactive compression/decompression
- Create a web interface for visualizing the compression process
- Add a VS Code extension for in-editor compression

### Error Handling & Robustness
- Improve error detection during compression/decompression
- Add fallback strategies when pattern matching fails
- Implement validation to ensure decompressed code maintains functionality

### Token Bidding System
- Implement an algorithm that "bids" on which compression technique to use based on token savings
- Dynamically choose between semantic patterns and character substitution based on efficiency

### LLM API Integration
- Create direct integration with OpenAI, Anthropic APIs
- Automatically compress, send, receive, and decompress without manual steps

## Installation

```bash
npm install semantic-kanji
```

## Contributing

Contributions are welcome! Areas where you can help:

1. Additional semantic patterns for common programming tasks
2. Improved character mappings for higher efficiency
3. Better pattern matching algorithms
4. Domain-specific dictionaries
5. UI/UX improvements for developer tools

## License

MIT
