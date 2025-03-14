/**
 * Semantic-Kanji Node.js Module
 * 
 * This module provides a clean API for integrating Semantic-Kanji compression
 * into Node.js applications, web servers, or other JavaScript projects.
 */

const semanticKanji = require('./semantic-kanji');
const promptGenerator = require('./prompt-generator');
const utils = require('./utils');

/**
 * SemanticKanji class for application integration
 */
class SemanticKanjiModule {
  /**
   * Create a new instance with optional configuration
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      compressOptions: {
        removeComments: true,
        preserveLineBreaks: false,
        matchPartialPatterns: true,
      },
      decompressOptions: {
        formatOutput: true,
      },
      ...config
    };
  }

  /**
   * Compress JavaScript code to Semantic-Kanji format
   * 
   * @param {string} code - JavaScript code to compress
   * @param {Object} options - Override compression options
   * @returns {string} - Compressed code
   */
  compress(code, options = {}) {
    return semanticKanji.compress(code, {
      ...this.config.compressOptions,
      ...options
    });
  }

  /**
   * Decompress Semantic-Kanji code to JavaScript
   * 
   * @param {string} code - Compressed code to decompress
   * @param {Object} options - Override decompression options
   * @returns {string} - Decompressed JavaScript code
   */
  decompress(code, options = {}) {
    return semanticKanji.decompress(code, {
      ...this.config.decompressOptions,
      ...options
    });
  }

  /**
   * Get compression statistics
   * 
   * @param {string} originalCode - Original JavaScript code
   * @param {string} compressedCode - Compressed Semantic-Kanji code
   * @returns {Object} - Compression statistics
   */
  getStats(originalCode, compressedCode) {
    return semanticKanji.getStats(originalCode, compressedCode);
  }

  /**
   * Check if text appears to be Semantic-Kanji compressed
   * 
   * @param {string} code - Code to analyze
   * @returns {boolean} - True if the code appears to be compressed
   */
  isCompressed(code) {
    return semanticKanji.isSemanticKanjiCompressed(code);
  }

  /**
   * Estimate token count for a string
   * 
   * @param {string} text - Input text
   * @returns {number} - Estimated token count
   */
  estimateTokens(text) {
    return semanticKanji.estimateTokens(text);
  }

  /**
   * Generate instruction prompt for LLMs
   * 
   * @param {string} format - Prompt format ('full', 'basic', 'minimal')
   * @param {Object} options - Prompt generation options
   * @returns {string|string[]} - Generated prompt(s)
   */
  generatePrompt(format = 'full', options = {}) {
    return promptGenerator.generate(format, 'semantic-kanji', options);
  }

  /**
   * Process text to find and decompress any Semantic-Kanji code blocks
   * 
   * @param {string} text - Text that may contain compressed code blocks
   * @returns {string} - Text with decompressed code blocks
   */
  processText(text) {
    // Look for code blocks that might contain Semantic-Kanji code
    return text.replace(/```(?:js|javascript)?\s*([\s\S]*?)```/g, (match, codeBlock) => {
      if (this.isCompressed(codeBlock)) {
        try {
          const decompressed = this.decompress(codeBlock);
          return "```javascript\n" + decompressed + "\n```";
        } catch (error) {
          // If decompression fails, return the original code block
          return match;
        }
      }
      return match;
    });
  }

  /**
   * Prepare message for sending to an LLM
   * 
   * @param {string} javascriptCode - Original JavaScript code
   * @param {string} prompt - Additional prompt text
   * @returns {Object} - Prepared message with system and user components
   */
  prepareMessage(javascriptCode, prompt = '') {
    const compressedCode = this.compress(javascriptCode);
    const systemPrompt = this.generatePrompt('full');
    
    let userMessage = prompt ? 
      `${prompt}\n\nHere's the code in Semantic-Kanji format:\n\n${compressedCode}` :
      `Here's JavaScript code in Semantic-Kanji format:\n\n${compressedCode}`;
    
    return {
      system: systemPrompt,
      user: userMessage,
      originalCode: javascriptCode,
      compressedCode
    };
  }

  /**
   * Create Express middleware for handling Semantic-Kanji in requests/responses
   * 
   * @param {Object} options - Middleware options
   * @returns {Function} - Express middleware function
   */
  createMiddleware(options = {}) {
    const opts = {
      compressRequestBody: true,
      decompressResponseBody: true,
      addPromptHeader: true,
      ...options
    };

    return (req, res, next) => {
      // Store original methods
      const originalJson = res.json;
      const originalSend = res.send;
      
      // Process request body if it contains code and option is enabled
      if (opts.compressRequestBody && req.body && req.body.code) {
        try {
          // Check if already compressed
          if (!this.isCompressed(req.body.code)) {
            req.body.originalCode = req.body.code;
            req.body.code = this.compress(req.body.code);
            req.body.isCompressed = true;
          }
        } catch (error) {
          // Ignore compression errors and proceed with original code
        }
      }
      
      // Add prompt to headers if option is enabled
      if (opts.addPromptHeader) {
        const prompt = this.generatePrompt('minimal');
        req.headers['x-semantic-kanji-prompt'] = Buffer.from(prompt).toString('base64');
      }
      
      // Override response methods to process any code in the response
      if (opts.decompressResponseBody) {
        // Override json method
        res.json = (body) => {
          if (body && typeof body === 'object') {
            // Process code fields in the response
            if (body.code && typeof body.code === 'string' && this.isCompressed(body.code)) {
              try {
                body.decompressedCode = this.decompress(body.code);
              } catch (error) {
                // If decompression fails, ignore and continue
              }
            }
            
            // Process any message fields that may contain code blocks
            if (body.message && typeof body.message === 'string') {
              body.message = this.processText(body.message);
            }
          }
          
          return originalJson.call(res, body);
        };
        
        // Override send method
        res.send = (body) => {
          if (typeof body === 'string') {
            body = this.processText(body);
          }
          
          return originalSend.call(res, body);
        };
      }
      
      next();
    };
  }
}

module.exports = SemanticKanjiModule;
