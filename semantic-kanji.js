/**
 * Semantic-Kanji Module
 * 
 * This module provides a clean API for integrating Semantic-Kanji compression
 * into Node.js applications, web servers, or other JavaScript projects.
 * It incorporates all functionality from the original index.js implementation.
 */

const jsKanji = require('./js-kanji-compressor');
const decompressor = require('./js-kanji-decompressor');
const semanticPatterns = require('./semantic-patterns');
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
        removeComments: false, // Changed to preserve comments
        preserveLineBreaks: true, // Changed to maintain code structure
        matchPartialPatterns: true,
      },
      decompressOptions: {
        formatOutput: true,
        preserveComments: true, // Added to ensure comments are maintained
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
    // Check if method is an object (likely intended as options)
    if (method && typeof method === 'object') {
      options = method;
      method = this.config.defaultMethod;
    }
    
    const methodStr = String(method).toLowerCase();
    
    const opts = {
      ...this.config.compressOptions,
      ...options
    };
    
    switch (methodStr) {
      case 'kanji':
        return jsKanji.compress(code, opts);
      case 'semantic-kanji':
      case 'semantic':
        // Apply both semantic patterns and kanji compression
        return this.compressWithPatterns(code, opts);
      default:
        throw new Error(`Unknown compression method: ${methodStr}`);
    }
  }
  
  /**
   * Apply semantic pattern compression followed by standard Kanji compression
   * 
   * This method first looks for known code patterns that can be replaced with
   * special semantic symbols, then applies standard Kanji compression to the rest.
   * The combination provides significantly better compression for common patterns.
   * 
   * @param {string} code - Original JavaScript code
   * @param {Object} options - Compression options
   * @return {string} - Semantically compressed code with anchor symbol
   */
  compressWithPatterns(code, options = {}) {
    // First apply pattern matching from semantic-patterns.js
    let processedCode = code;
    
    // Apply the semantic patterns from most specific to least specific
    for (const [pattern, replacement] of Object.entries(semanticPatterns)) {
      // Skip pattern description comments
      if (pattern.startsWith('//')) continue;
      
      try {
        // Create a regex to match the pattern, preserving placeholder values
        // We escape all regex special chars except for placeholders
        const escapedPattern = pattern
          .replace(/\$/g, '\\$')                      // Escape $ signs
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')  // Escape regex special chars
          .replace(/\\\$(\d+)/g, '([\\s\\S]*?)');     // Replace \$1, \$2 etc with capture groups
        
        const regex = new RegExp(escapedPattern, 'g');
        
        // Replace pattern with its semantic symbol, preserving placeholders
        processedCode = processedCode.replace(regex, (match, ...args) => {
          // Extract capture groups and remove the last two elements (offset and input string)
          const captures = args.slice(0, args.length - 2);
          
          // Replace placeholders in the replacement string with captured values
          let result = replacement;
          captures.forEach((capture, index) => {
            result = result.replace(new RegExp(`\\$${index + 1}`, 'g'), capture);
          });
          
          return result;
        });
      } catch (error) {
        // If a pattern causes regex errors, skip it
        console.error(`Error with pattern: ${pattern.substring(0, 30)}...`, error.message);
      }
    }
    
    // Then apply standard Kanji compression on the remaining code
    let compressed = jsKanji.compress(processedCode, options);
    
    // Add a marker to indicate this is semantic compression
    compressed += "⚓"; // Anchor symbol as a marker
    
    return compressed;
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
    
    let methodStr = String(method).toLowerCase();
    
    if (methodStr === 'auto') {
      methodStr = this.detectCompressionMethod(code);
    }
    
    switch (methodStr) {
      case 'kanji':
        return decompressor.decompress(code, opts);
      case 'semantic-kanji':
      case 'semantic':
        // Remove semantic markers and then use regular decompression
        return this.decompressWithPatterns(code, opts);
      default:
        throw new Error(`Unknown compression method: ${methodStr}`);
    }
  }
  
  /**
   * Decompress code that was compressed with semantic patterns
   * 
   * This method first decompresses the kanji text, then applies reverse pattern
   * matching to expand semantic symbols back into their original code patterns.
   * 
   * @param {string} code - Compressed code with semantic markers
   * @param {Object} options - Decompression options
   * @return {string} - Fully decompressed JavaScript code
   */
  decompressWithPatterns(code, options = {}) {
    // Remove the semantic marker if present
    let processed = code.replace(/⚓$/, "");
    
    // Use the standard decompressor for the kanji part
    let decompressed = decompressor.decompress(processed, options);
    
    // Reverse semantic pattern replacements
    // This should be implemented with pattern dictionary lookups
    // For each semantic pattern symbol, replace it with the full pattern
    for (const [pattern, replacement] of Object.entries(semanticPatterns)) {
      // Skip pattern description comments
      if (pattern.startsWith('//')) continue;
      
      try {
        // Create a regex to match the special symbols in the decompressed code
        const symbolRegex = new RegExp(replacement.replace(/\$/g, '\\$').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\\\$(\d+)/g, '([\\s\\S]*?)'), 'g');
        
        // Replace symbols with their original patterns
        decompressed = decompressed.replace(symbolRegex, (match, ...args) => {
          // Extract capture groups and remove the last two elements (offset and input string)
          const captures = args.slice(0, args.length - 2);
          
          // Replace placeholders in the original pattern with captured values
          let result = pattern;
          captures.forEach((capture, index) => {
            result = result.replace(new RegExp(`\\$${index + 1}`, 'g'), capture);
          });
          
          return result;
        });
      } catch (error) {
        // If a pattern causes regex errors, skip it
        // This is less critical during decompression as we can still return partly decompressed code
        console.error(`Error decompressing pattern: ${replacement.substring(0, 30)}...`, error.message);
      }
    }
    
    return decompressed;
  }

  /**
   * Detect which compression method was used for the code
   * 
   * @param {string} code - Compressed code
   * @return {string} - Detected compression method
   */
  detectCompressionMethod(code) {
    if (this.isSemanticKanjiCompressed(code)) {
      return 'semantic-kanji';
    }
    
    if (jsKanji.isKanjiCompressed(code)) {
      return 'kanji';
    }
    
    throw new Error('Unable to determine compression method');
  }
  
  /**
   * Check if text appears to be compressed with Semantic-Kanji
   * 
   * @param {string} code - Code to analyze
   * @return {boolean} - True if the code appears to be compressed with Semantic-Kanji
   */
  isSemanticKanjiCompressed(code) {
    // Check for the anchor symbol we use to mark semantic compression
    return code.endsWith('⚓') || /[웎웏웒웓ႾႠႡᕮᕯᕾⲮ웃웋ꪂꮚꙮ]/.test(code);
  }

  /**
   * Compare different compression methods on the same code
   * 
   * @param {string} code - Original JavaScript code
   * @param {Object} options - Optional configuration options
   * @return {Object} - Comparison statistics
   */
  compare(code, options = {}) {
    // Input validation
    if (!code || typeof code !== 'string') {
      throw new Error('Code must be a non-empty string');
    }
    
    try {
      const kanjiCompressed = jsKanji.compress(code, options);
      const semanticCompressed = this.compress(code, 'semantic-kanji', options);
      
      const originalTokens = utils.estimateTokens(code, false);
      const kanjiStats = utils.getCompressionStats(code, kanjiCompressed, true);
      const semanticStats = utils.getCompressionStats(code, semanticCompressed, true);
      
      return {
        original: {
          code: code,
          chars: code.length,
          tokens: originalTokens
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
        bestMethod: this.determineBestMethod(kanjiStats, semanticStats)
      };
    } catch (error) {
      throw new Error(`Comparison failed: ${error.message}`);
    }
  }
  
  /**
   * Determine which method provides the best compression
   * 
   * @param {Object} kanjiStats - Stats for JS-Kanji
   * @param {Object} semanticStats - Stats for Semantic-Kanji
   * @return {string} - Name of the best method
   */
  determineBestMethod(kanjiStats, semanticStats) {
    const methods = [
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
      this.isSemanticKanjiCompressed(code) ||
      jsKanji.isKanjiCompressed(code)
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
        return this.isSemanticKanjiCompressed(code);
      case 'kanji':
        return jsKanji.isKanjiCompressed(code);
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
  get kanjiCompressor() {
    return jsKanji;
  }
  
  get semanticPatternsCompressor() {
    return semanticPatterns;
  }
}

// Add static methods for direct access (backward compatibility with index.js)
SemanticKanjiModule.compress = function(code, method = 'semantic-kanji', options = {}) {
  try {
    // Check if method is an object (likely intended as options)
    if (method && typeof method === 'object') {
      options = method;
      method = 'semantic-kanji';
    }
    
    const instance = new SemanticKanjiModule();
    return instance.compress(code, method, options);
  } catch (error) {
    console.error('Error in compress:', error);
    // Fallback to basic Kanji compression if there's an error
    return jsKanji.compress(code, options);
  }
};

SemanticKanjiModule.decompress = function(code, method = 'auto', options = {}) {
  try {
    const instance = new SemanticKanjiModule();
    return instance.decompress(code, method, options);
  } catch (error) {
    console.error('Error in decompress:', error);
    // Fallback to basic Kanji decompression if there's an error
    return decompressor.decompress(code, options);
  }
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

/**
 * Check if text appears to be compressed with Semantic-Kanji
 * 
 * @param {string} code - Code to analyze
 * @return {boolean} - True if the code appears to be compressed with Semantic-Kanji
 */
SemanticKanjiModule.isSemanticKanjiCompressed = function(code) {
  // Check for presence of Semantic-Kanji specific patterns
  // Look for pattern markers like 웎, 웏, 웒, 웓, Ⴞ, etc.
  const semanticPatternMarkers = /[웎웏웒웓ႾႠႡᕮᕯᕾⲮ웃웋ꪂꮚꙮ]/;
  return semanticPatternMarkers.test(code) || code.endsWith('⚓');
};

module.exports = SemanticKanjiModule;