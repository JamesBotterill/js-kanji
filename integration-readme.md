# Semantic-Kanji Integration Guide

This guide explains how to integrate Semantic-Kanji compression into your Node.js applications, web servers, APIs, and more.

## Installation

```bash
npm install semantic-kanji-js
```

## Basic Module Usage

```javascript
const SemanticKanjiModule = require('semantic-kanji-js');

// Initialize with default options
const skm = new SemanticKanjiModule();

// Compress JavaScript code
const jsCode = 'function example() { console.log("Hello world"); }';
const kjsCode = skm.compress(jsCode);

// Decompress back to JavaScript
const decompressedCode = skm.decompress(kjsCode);

// Get compression statistics
const stats = skm.getStats(jsCode, kjsCode);
console.log(`Token reduction: ${stats.tokenSavingsPercent}%`);

// Check if code is compressed
const isCompressed = skm.isCompressed(someCode);

// Process text to decompress code blocks
const processedText = skm.processText(textWithCodeBlocks);
```

## Express.js Integration

The module provides middleware for Express.js applications to automatically handle compressed code in requests and responses:

```javascript
const express = require('express');
const SemanticKanjiModule = require('semantic-kanji-js');

const app = express();
const skm = new SemanticKanjiModule();

// Parse JSON request bodies
app.use(express.json());

// Add Semantic-Kanji middleware
app.use(skm.createMiddleware({
  compressRequestBody: true,   // Compress code in request bodies
  decompressResponseBody: true, // Decompress code in responses
  addPromptHeader: true        // Add instruction prompt header
}));

// API endpoints
app.post('/api/analyze-code', async (req, res) => {
  const { code } = req.body;
  // The middleware will have compressed the code if it wasn't already
  
  // Send to LLM API
  const llmResponse = await yourLLMFunction(req.body.code);
  
  // The middleware will automatically decompress any code in the response
  res.json({ analysis: llmResponse });
});
```

## LLM API Integration

For direct LLM API integration:

```javascript
const SemanticKanjiModule = require('semantic-kanji-js');
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize
const skm = new SemanticKanjiModule();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function analyzeCodWithLLM(jsCode, prompt = '') {
  // Prepare the message for LLM
  const message = skm.prepareMessage(jsCode, prompt);
  
  // Send to Anthropic API
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    system: message.system,
    max_tokens: 4000,
    messages: [
      { role: 'user', content: message.user }
    ]
  });
  
  // Process the response to decompress any code
  const processedResponse = skm.processText(response.content[0].text);
  
  return processedResponse;
}
```

## Browser Integration

The module can be bundled for browser use with Webpack or Browserify:

```javascript
// In your frontend code
const SemanticKanjiModule = require('semantic-kanji-js/browser');
const skm = new SemanticKanjiModule();

// Handle form submission
document.getElementById('code-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const code = document.getElementById('code-input').value;
  const compressed = skm.compress(code);
  
  // Send to your backend API
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Semantic-Kanji-Prompt': btoa(skm.generatePrompt('minimal'))
    },
    body: JSON.stringify({ code: compressed })
  });
  
  const result = await response.json();
  
  // Process the response
  const processedResponse = skm.processText(result.analysis);
  document.getElementById('result').textContent = processedResponse;
});
```

## Configuration Options

The module supports various configuration options:

```javascript
const skm = new SemanticKanjiModule({
  compressOptions: {
    removeComments: true,      // Remove comments during compression
    preserveLineBreaks: false, // Preserve line breaks or remove them
    matchPartialPatterns: true // Allow partial pattern matching
  },
  decompressOptions: {
    formatOutput: true         // Format the decompressed code
  }
});
```

## Advanced Usage: Custom Prompt Generation

Create customized instruction prompts for LLMs:

```javascript
// Generate instruction prompt with different levels of detail
const minimalPrompt = skm.generatePrompt('minimal');
const fullPrompt = skm.generatePrompt('full');

// Generate split prompts for larger conversations
const splitPrompts = skm.generatePrompt('full', { split: true });
// Returns an array of prompt segments
```

## Error Handling

The module uses standard error handling:

```javascript
try {
  const compressed = skm.compress(code);
  // Use compressed code
} catch (error) {
  console.error(`Compression failed: ${error.message}`);
  // Fall back to uncompressed code
}
```

## TypeScript Support

The module includes TypeScript type definitions:

```typescript
import SemanticKanjiModule from 'semantic-kanji-js';

interface CompressionOptions {
  removeComments?: boolean;
  preserveLineBreaks?: boolean;
  matchPartialPatterns?: boolean;
}

const skm = new SemanticKanjiModule();
const compressed: string = skm.compress(code, options);
```

## Further Examples

For more examples, see the `examples` directory in the package:

- Basic usage examples
- Express.js integration examples
- LLM API client integration
- Browser integration examples

## Performance Considerations

- Compression and decompression are CPU-intensive operations
- For high-traffic applications, consider caching compressed results
- The most significant performance gain comes from reduced token usage with LLMs

## Support

For issues or feature requests, please open an issue on GitHub or contact us at support@example.com.
