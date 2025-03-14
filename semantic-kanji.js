/**
 * Semantic-Kanji Module
 * 
 * This module provides a clean API for integrating Semantic-Kanji compression
 * into Node.js applications, web servers, or other JavaScript projects.
 * It incorporates all functionality from the original index.js implementation.
 */

const semanticKanji = require('./semantic-kanji');
const jsKanji = require('./js-kanji');
const promptGenerator = require('./prompt-generator');
const utils = require('./utils');

/**
 * SemanticKanjiModule class for application integration
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
      defaultMethod: 'semantic-kanji',
      ...config
    };
  }

  /**
   * Compress JavaScript code using the specified method
   * 
   * @param {string} code - Original JavaScript code
   * @param {string} method - Compression method ('mini', 'kanji', or 'semantic-kanji')
   * @param {Object} options - Override compression options
   * @return {string} - Compressed code
   */
  compress(code, method = this.config.defaultMethod, options = {}) {
    method = method.toLowerCase();
    
    const opts = {
      ...this.config.compressOptions,
      ...options
    };
    
    switch (method) {
      case 'mini':
        return jsMini.compress(code);
      case 'kanji':
        return jsKanji.compress(code, opts);
      case 'semantic-kanji':
      case 'semantic':
        return semanticKanji.compress(code, opts);
      default:
        throw new Error(`Unknown compression method: ${method}`);
    }
  }

  /**
   * Decompress code back to readable JavaScript
   * 
   * @param {string} code - Compressed code
   * @param {string} method - Compression method used ('mini', 'kanji', 'semantic-kanji', or 'auto')
   * @param {Object} options - Override decompression options
   * @return {string} - Decompressed JavaScript code
   */
  decompress(code, method = 'auto', options = {}) {
    const opts = {
      ...this.config.decompressOptions,
      ...options
    };
    
    if (method === 'auto') {
      method = this.detectCompressionMethod(code);
    } else {
      method = method.toLowerCase();
    }
    
    switch (method) {
      case 'mini':
        return jsMini.decompress(code);
      case 'kanji':
        return jsKanji.decompress(code, opts);
      case 'semantic-kanji':
      case 'semantic':
        return semanticKanji.decompress(code, opts);
      default:
        throw new Error(`Unknown compression method: ${method}`);
    }
  }

  /**
   * Detect which compression method was used for the code
   * 
   * @param {string} code - Compressed code
   * @return {string} - Detected compression method
   */
  detectCompressionMethod(code) {
    if (semanticKanji.isSemanticKanjiCompressed(code)) {
      return 'semantic-kanji';
    }
    
    if (jsKanji.isKanjiCompressed(code)) {
      return 'kanji';
    }
    
    // Default to mini if no specific markers are detected
    return 'mini';
  }

  /**
   * Compare different compression methods on the same code
   * 
   * @param {string} code - Original JavaScript code
   * @param {Object} options - Optional configuration options
   * @return {Object} - Comparison statistics
   */
  compare(code, options = {}) {
    const miniCompressed = jsMini.compress(code);
    const kanjiCompressed = jsKanji.compress(code, options);
    const semanticCompressed = semanticKanji.compress(code, options);
    
    const miniStats = utils.getCompressionStats(code, miniCompressed, false);
    const kanjiStats = utils.getCompressionStats(code, kanjiCompressed, true);
    const semanticStats = utils.getCompressionStats(code, semanticCompressed, true);
    
    return {
      original: {
        code: code,
        chars: code.length,
        tokens: miniStats.originalTokens
      },
      mini: {
        code: miniCompressed,
        chars: miniStats.compressedChars,
        tokens: miniStats.compressedTokens,
        reduction: miniStats.tokenReduction,
        savingsPercent: miniStats.tokenSavingsPercent
      },
      kanji: {
        code: kanjiCompressed,
        chars: kanjiStats.compressedChars,
        tokens: kanjiStats.compressedTokens,
        reduction: kanjiStats.tokenReduction,
        savingsPercent: kanjiStats.tokenSavingsPercent
      },
      semantic: {
        code: semanticCompressed,
        chars: semanticStats.compressedChars,
        tokens: semanticStats.compressedTokens,
        reduction: semanticStats.tokenReduction,
        savingsPercent: semanticStats.tokenSavingsPercent
      },
      bestMethod: this.determineBestMethod(miniStats, kanjiStats, semanticStats)
    };
  }
  
  /**
   * Determine which method provides the best compression
   * 
   * @param {Object} miniStats - Stats for JS-Mini
   * @param {Object} kanjiStats - Stats for JS-Kanji
   * @param {Object} semanticStats - Stats for Semantic-Kanji
   * @return {string} - Name of the best method
   */
  determineBestMethod(miniStats, kanjiStats, semanticStats) {
    const methods = [
      { name: 'mini', savings: miniStats.tokenSavingsPercent },
      { name: 'kanji', savings: kanjiStats.tokenSavingsPercent },
      { name: 'semantic-kanji', savings: semanticStats.tokenSavingsPercent }
    ];
    
    return methods.reduce((best, current) => 
      current.savings > best.savings ? current : best, methods[0]).name;
  }

  /**
   * Get compression statistics
   * 
   * @param {string} originalCode - Original JavaScript code
   * @param {string} compressedCode - Compressed code
   * @param {string} method - Compression method used
   * @return {Object} - Compression statistics
   */
  getStats(originalCode, compressedCode, method = 'auto') {
    if (method === 'auto') {
      method = this.detectCompressionMethod(compressedCode);
    }
    
    const isKanji = method === 'kanji' || method === 'semantic-kanji' || method === 'semantic';
    
    return utils.getCompressionStats(originalCode, compressedCode, isKanji);
  }

  /**
   * Check if text appears to be compressed (any method)
   * 
   * @param {string} code - Code to analyze
   * @return {boolean} - True if the code appears to be compressed
   */
  isCompressed(code) {
    return (
      semanticKanji.isSemanticKanjiCompressed(code) ||
      jsKanji.isKanjiCompressed(code) ||
      this.detectCompressionMethod(code) !== 'mini'
    );
  }

  /**
   * Check if text appears to be compressed with a specific method
   * 
   * @param {string} code - Code to analyze
   * @param {string} method - Method to check for
   * @return {boolean} - True if compressed with the specified method
   */
  isCompressedWith(code, method) {
    method = method.toLowerCase();
    
    switch (method) {
      case 'semantic-kanji':
      case 'semantic':
        return semanticKanji.isSemanticKanjiCompressed(code);
      case 'kanji':
        return jsKanji.isKanjiCompressed(code);
      case 'mini':
        // Hard to detect mini specifically, so use process of elimination
        return this.isCompressed(code) && 
               !semanticKanji.isSemanticKanjiCompressed(code) && 
               !jsKanji.isKanjiCompressed(code);
      default:
        return false;
    }
  }

  /**
   * Estimate token count for a string
   * 
   * @param {string} text - Input text
   * @param {string} method - Method used for compression (for accurate counting)
   * @return {number} - Estimated token count
   */
  estimateTokens(text, method = 'auto') {
    if (method === 'auto') {
      method = this.detectCompressionMethod(text);
    }
    
    const isKanji = method === 'kanji' || method === 'semantic-kanji' || method === 'semantic';
    
    return utils.estimateTokens(text, isKanji);
  }

  /**
   * Generate instruction prompt for LLMs
   * 
   * @param {string} format - Prompt format ('full', 'basic', 'minimal')
   * @param {string} method - Method to generate prompt for
   * @param {Object} options - Prompt generation options
   * @return {string|string[]} - Generated prompt(s)
   */
  generatePrompt(format = 'full', method = this.config.defaultMethod, options = {}) {
    return promptGenerator.generate(format, method, options);
  }

  /**
   * Process text to find and decompress any compressed code blocks
   * 
   * @param {string} text - Text that may contain compressed code blocks
   * @return {string} - Text with decompressed code blocks
   */
  processText(text) {
    // Look for code blocks that might contain compressed code
    return text.replace(/```(?:js|javascript)?\s*([\s\S]*?)```/g, (match, codeBlock) => {
      if (this.isCompressed(codeBlock)) {
        try {
          const method = this.detectCompressionMethod(codeBlock);
          const decompressed = this.decompress(codeBlock, method);
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
   * @param {string} method - Compression method to use
   * @return {Object} - Prepared message with system and user components
   */
  prepareMessage(javascriptCode, prompt = '', method = this.config.defaultMethod) {
    const compressedCode = this.compress(javascriptCode, method);
    const systemPrompt = this.generatePrompt('full', method);
    
    let userMessage = prompt ? 
      `${prompt}\n\nHere's the code in ${this.getMethodDisplayName(method)} format:\n\n${compressedCode}` :
      `Here's JavaScript code in ${this.getMethodDisplayName(method)} format:\n\n${compressedCode}`;
    
    return {
      system: systemPrompt,
      user: userMessage,
      originalCode: javascriptCode,
      compressedCode,
      method
    };
  }
  
  /**
   * Get display name for a compression method
   * 
   * @param {string} method - Method name
   * @return {string} - Display name
   */
  getMethodDisplayName(method) {
    switch (method.toLowerCase()) {
      case 'mini':
        return 'JS-Mini';
      case 'kanji':
        return 'JS-Kanji';
      case 'semantic-kanji':
      case 'semantic':
        return 'Semantic-Kanji';
      default:
        return method;
    }
  }

  /**
   * Create Express middleware for handling compressed code in requests/responses
   * 
   * @param {Object} options - Middleware options
   * @return {Function} - Express middleware function
   */
  createMiddleware(options = {}) {
    const opts = {
      compressRequestBody: true,
      decompressResponseBody: true,
      addPromptHeader: true,
      method: this.config.defaultMethod,
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
            req.body.code = this.compress(req.body.code, opts.method);
            req.body.isCompressed = true;
            req.body.compressionMethod = opts.method;
          } else {
            req.body.compressionMethod = this.detectCompressionMethod(req.body.code);
          }
        } catch (error) {
          // Ignore compression errors and proceed with original code
        }
      }
      
      // Add prompt to headers if option is enabled
      if (opts.addPromptHeader) {
        const prompt = this.generatePrompt('minimal', opts.method);
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
                const method = body.compressionMethod || this.detectCompressionMethod(body.code);
                body.decompressedCode = this.decompress(body.code, method);
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
  
  /**
   * Access to the underlying compression modules
   */
  get miniCompressor() {
    return jsMini;
  }
  
  get kanjiCompressor() {
    return jsKanji;
  }
  
  get semanticCompressor() {
    return semanticKanji;
  }
}

// Add static methods for direct access (backward compatibility with index.js)
SemanticKanjiModule.compress = function(code, method = 'semantic-kanji', options = {}) {
  const instance = new SemanticKanjiModule();
  return instance.compress(code, method, options);
};

SemanticKanjiModule.decompress = function(code, method = 'auto', options = {}) {
  const instance = new SemanticKanjiModule();
  return instance.decompress(code, method, options);
};

SemanticKanjiModule.compare = function(code, options = {}) {
  const instance = new SemanticKanjiModule();
  return instance.compare(code, options);
};

SemanticKanjiModule.estimateTokens = function(text, method = 'auto') {
  const instance = new SemanticKanjiModule();
  return instance.estimateTokens(text, method);
};

SemanticKanjiModule.getStats = function(originalCode, compressedCode, method = 'auto') {
  const instance = new SemanticKanjiModule();
  return instance.getStats(originalCode, compressedCode, method);
};

SemanticKanjiModule.generatePrompt = function(format = 'full', method = 'semantic-kanji', options = {}) {
  const instance = new SemanticKanjiModule();
  return instance.generatePrompt(format, method, options);
};

SemanticKanjiModule.isCompressed = function(code) {
  const instance = new SemanticKanjiModule();
  return instance.isCompressed(code);
};

module.exports = SemanticKanjiModule;