/**
 * Integration Examples for Semantic-Kanji Module
 * 
 * This file demonstrates various ways to integrate the Semantic-Kanji module
 * into Node.js applications, including Express.js servers, API clients,
 * and other JavaScript applications.
 */

const SemanticKanjiModule = require('../semantic-kanji-module');
const fs = require('fs');
const path = require('path');

// Example 1: Basic Usage
function basicUsageExample() {
  console.log('Example 1: Basic Usage');
  
  // Initialize the module
  const skm = new SemanticKanjiModule();
  
  // Some JavaScript code to compress
  const jsCode = `
  async function fetchUserData(userId) {
    try {
      const response = await fetch(\`https://api.example.com/users/\${userId}\`);
      if (!response.ok) {
        throw new Error(\`Failed to fetch user: \${response.status}\`);
      }
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
  `;
  
  // Compress to Semantic-Kanji format
  const kjsCode = skm.compress(jsCode);
  
  // Get compression statistics
  const stats = skm.getStats(jsCode, kjsCode);
  
  console.log('Original JavaScript:');
  console.log(jsCode);
  
  console.log('\nCompressed to Semantic-Kanji:');
  console.log(kjsCode);
  
  console.log('\nCompression Stats:');
  console.log(`- Original: ${stats.originalChars} chars, ~${stats.originalTokens} tokens`);
  console.log(`- Compressed: ${stats.compressedChars} chars, ~${stats.compressedTokens} tokens`);
  console.log(`- Token Reduction: ${stats.tokenReduction} (${stats.tokenSavingsPercent}% savings)`);
  
  // Decompress back to JavaScript
  const decompressedCode = skm.decompress(kjsCode);
  
  console.log('\nDecompressed back to JavaScript:');
  console.log(decompressedCode);
  
  console.log('\n' + '-'.repeat(80) + '\n');
}

// Example 2: Integration with Express.js
function expressIntegrationExample() {
  console.log('Example 2: Express.js Integration (Code Sample)');
  
  const expressCode = `
  const express = require('express');
  const SemanticKanjiModule = require('semantic-kanji-module');
  
  const app = express();
  const skm = new SemanticKanjiModule();
  
  // Parse JSON request bodies
  app.use(express.json());
  
  // Add Semantic-Kanji middleware
  app.use(skm.createMiddleware());
  
  // API endpoint to compress JavaScript code
  app.post('/api/compress', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    
    try {
      const compressedCode = skm.compress(code);
      const stats = skm.getStats(code, compressedCode);
      
      res.json({
        original: code,
        compressed: compressedCode,
        stats
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // API endpoint to decompress Semantic-Kanji code
  app.post('/api/decompress', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    
    try {
      const decompressedCode = skm.decompress(code);
      
      res.json({
        compressed: code,
        decompressed: decompressedCode
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // API endpoint to send code to LLM
  app.post('/api/analyze', async (req, res) => {
    const { code, prompt } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    
    try {
      // Prepare the message for the LLM
      const message = skm.prepareMessage(code, prompt);
      
      // Send to LLM (implementation not shown)
      const llmResponse = await sendToLLM(message);
      
      // Process the response to decompress any code
      const processedResponse = skm.processText(llmResponse);
      
      res.json({
        originalCode: code,
        compressedCode: message.compressedCode,
        response: processedResponse
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
  });
  `;
  
  console.log(expressCode);
  console.log('\n' + '-'.repeat(80) + '\n');
}

// Example 3: Integration with LLM API Client
function llmApiIntegrationExample() {
  console.log('Example 3: LLM API Client Integration (Code Sample)');
  
  const apiClientCode = `
  const SemanticKanjiModule = require('semantic-kanji-module');
  const { Anthropic } = require('@anthropic-ai/sdk');
  
  class SemanticKanjiLLMClient {
    constructor(config = {}) {
      this.skm = new SemanticKanjiModule(config.skmOptions);
      this.anthropic = new Anthropic({
        apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY
      });
      this.model = config.model || 'claude-3-opus-20240229';
    }
    
    /**
     * Send JavaScript code to the LLM with compression
     */
    async sendCode(code, prompt = '', options = {}) {
      // Prepare the message with compression
      const message = this.skm.prepareMessage(code, prompt);
      
      try {
        // Send to Anthropic API
        const response = await this.anthropic.messages.create({
          model: this.model,
          system: message.system,
          max_tokens: options.maxTokens || 4000,
          messages: [
            { role: 'user', content: message.user }
          ]
        });
        
        const responseText = response.content[0].text;
        
        // Process the response to decompress any code
        const processedResponse = this.skm.processText(responseText);
        
        return {
          original: {
            jsCode: code,
            prompt
          },
          compressed: message.compressedCode,
          response: {
            raw: responseText,
            processed: processedResponse
          },
          tokenUsage: {
            promptTokens: this.skm.estimateTokens(message.system) + this.skm.estimateTokens(message.user),
            responseTokens: this.skm.estimateTokens(responseText),
            totalTokens: this.skm.estimateTokens(message.system) + this.skm.estimateTokens(message.user) + this.skm.estimateTokens(responseText)
          }
        };
      } catch (error) {
        throw new Error(\`LLM API Error: \${error.message}\`);
      }
    }
    
    /**
     * Continue a conversation with code
     */
    async continueConversation(conversation, newCode, prompt = '') {
      // Extract previous messages
      const messages = conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Compress the new code
      const compressedCode = this.skm.compress(newCode);
      
      // Add the new user message
      const userContent = prompt ? 
        \`\${prompt}\\n\\nHere's the code in Semantic-Kanji format:\\n\\n\${compressedCode}\` :
        \`Here's some more code in Semantic-Kanji format:\\n\\n\${compressedCode}\`;
      
      messages.push({
        role: 'user',
        content: userContent
      });
      
      try {
        // Send to Anthropic API
        const response = await this.anthropic.messages.create({
          model: this.model,
          system: this.skm.generatePrompt('full'),
          max_tokens: 4000,
          messages: messages
        });
        
        const responseText = response.content[0].text;
        
        // Process the response to decompress any code
        const processedResponse = this.skm.processText(responseText);
        
        // Add to conversation
        messages.push({
          role: 'assistant',
          content: processedResponse
        });
        
        return {
          conversation: messages,
          latestResponse: processedResponse
        };
      } catch (error) {
        throw new Error(\`LLM API Error: \${error.message}\`);
      }
    }
  }
  `;
  
  console.log(apiClientCode);
  console.log('\n' + '-'.repeat(80) + '\n');
}

// Example 4: Browser Integration with Webpack/Browserify
function browserIntegrationExample() {
  console.log('Example 4: Browser Integration (Code Sample)');
  
  const browserCode = `
  // Browser-compatible version using webpack/browserify
  const SemanticKanjiModule = require('semantic-kanji-module/browser');
  
  // Create a Semantic-Kanji instance
  const skm = new SemanticKanjiModule();
  
  // DOM elements
  const codeInput = document.getElementById('code-input');
  const compressBtn = document.getElementById('compress-btn');
  const decompressBtn = document.getElementById('decompress-btn');
  const sendBtn = document.getElementById('send-btn');
  const resultOutput = document.getElementById('result-output');
  const statsOutput = document.getElementById('stats-output');
  
  // Compress button click handler
  compressBtn.addEventListener('click', () => {
    const jsCode = codeInput.value;
    
    if (!jsCode) {
      alert('Please enter some JavaScript code');
      return;
    }
    
    try {
      const kjsCode = skm.compress(jsCode);
      const stats = skm.getStats(jsCode, kjsCode);
      
      resultOutput.value = kjsCode;
      statsOutput.innerHTML = \`
        <p>Original: \${jsCode.length} chars, ~\${stats.originalTokens} tokens</p>
        <p>Compressed: \${kjsCode.length} chars, ~\${stats.compressedTokens} tokens</p>
        <p>Token Reduction: \${stats.tokenReduction} (\${stats.tokenSavingsPercent}% savings)</p>
      \`;
    } catch (error) {
      alert(\`Compression error: \${error.message}\`);
    }
  });
  
  // Decompress button click handler
  decompressBtn.addEventListener('click', () => {
    const kjsCode = codeInput.value;
    
    if (!kjsCode) {
      alert('Please enter some Semantic-Kanji code');
      return;
    }
    
    try {
      const jsCode = skm.decompress(kjsCode);
      resultOutput.value = jsCode;
      statsOutput.innerHTML = '<p>Decompression successful</p>';
    } catch (error) {
      alert(\`Decompression error: \${error.message}\`);
    }
  });
  
  // Send to LLM button click handler
  sendBtn.addEventListener('click', async () => {
    const code = codeInput.value;
    const prompt = document.getElementById('prompt-input').value;
    
    if (!code) {
      alert('Please enter some code');
      return;
    }
    
    try {
      // Determine if code is already compressed
      const isCompressed = skm.isCompressed(code);
      
      // Prepare the code and prompt
      const finalCode = isCompressed ? code : skm.compress(code);
      const message = prompt ? 
        \`\${prompt}\\n\\nHere's the code in Semantic-Kanji format:\\n\\n\${finalCode}\` :
        \`Here's JavaScript code in Semantic-Kanji format:\\n\\n\${finalCode}\`;
      
      // Update UI to show loading state
      sendBtn.disabled = true;
      resultOutput.value = 'Sending to LLM...';
      
      // Send to backend API (which forwards to LLM)
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Semantic-Kanji-Prompt': btoa(skm.generatePrompt('minimal'))
        },
        body: JSON.stringify({
          message,
          model: document.getElementById('model-select').value
        })
      });
      
      if (!response.ok) {
        throw new Error(\`API error: \${response.status}\`);
      }
      
      const data = await response.json();
      
      // Process the response to decompress any code
      const processedResponse = skm.processText(data.response);
      
      // Update UI with response
      resultOutput.value = processedResponse;
      statsOutput.innerHTML = \`
        <p>API call successful</p>
        <p>Token usage: \${data.tokenUsage}</p>
      \`;
    } catch (error) {
      resultOutput.value = \`Error: \${error.message}\`;
    } finally {
      sendBtn.disabled = false;
    }
  });
  `;
  
  console.log(browserCode);
  console.log('\n' + '-'.repeat(80) + '\n');
}

// Run all examples
function runAllExamples() {
  console.log('SEMANTIC-KANJI MODULE INTEGRATION EXAMPLES\n');
  
  // Run the basic usage example
  basicUsageExample();
  
  // Display other integration examples
  expressIntegrationExample();
  llmApiIntegrationExample();
  browserIntegrationExample();
  
  console.log('For more information, see the documentation in README.md');
}

// Run all examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  basicUsageExample,
  expressIntegrationExample,
  llmApiIntegrationExample,
  browserIntegrationExample,
  runAllExamples
};
