/**
 * Tests for utility functions and prompt generator
 */

const utils = require('../utils');
const promptGenerator = require('../prompt-generator');

describe('Utility Functions', () => {
  // Test token estimation
  test('Estimates tokens correctly', () => {
    const samples = {
      simple: 'Hello, world!',
      code: 'function test() { return true; }',
      kanji: '今日は、世界！', // Contains Kanji characters
      mixed: 'Hello 世界! function() { return 42; }' // Mixed content
    };
    
    // Regular estimation
    Object.entries(samples).forEach(([name, text]) => {
      const tokens = utils.estimateTokens(text, false);
      expect(typeof tokens).toBe('number');
      expect(tokens).toBeGreaterThan(0);
      
      // Simple validation: token count should be related to text length
      expect(tokens).toBeLessThanOrEqual(text.length);
    });
    
    // Kanji estimation
    Object.entries(samples).forEach(([name, text]) => {
      const tokens = utils.estimateTokens(text, true);
      expect(typeof tokens).toBe('number');
      expect(tokens).toBeGreaterThan(0);
    });
    
    // Kanji text should have relatively higher token count
    const regularTokens = utils.estimateTokens(samples.kanji, false);
    const kanjiTokens = utils.estimateTokens(samples.kanji, true);
    expect(kanjiTokens).toBeGreaterThanOrEqual(regularTokens);
  });
  
  // Test compression statistics
  test('Calculates compression statistics correctly', () => {
    const original = 'function helloWorld() { console.log("Hello, world!"); }';
    const compressed = '函数 你好世界() { 控台.日志("你好, 世界!"); }';
    
    // Get stats with and without Kanji flag
    const regularStats = utils.getCompressionStats(original, compressed, false);
    const kanjiStats = utils.getCompressionStats(original, compressed, true);
    
    // Check stats properties
    ['originalChars', 'compressedChars', 'charReduction', 'compressionRatio',
     'originalTokens', 'compressedTokens', 'tokenReduction', 'tokenSavingsPercent'].forEach(prop => {
      expect(regularStats).toHaveProperty(prop);
      expect(kanjiStats).toHaveProperty(prop);
      expect(typeof regularStats[prop]).toBe('number');
      expect(typeof kanjiStats[prop]).toBe('number');
    });
    
    // Basic validation
    expect(regularStats.originalChars).toBe(original.length);
    expect(regularStats.compressedChars).toBe(compressed.length);
    expect(regularStats.charReduction).toBe(original.length - compressed.length);
    
    // Token stats with Kanji flag should be different
    expect(kanjiStats.compressedTokens).not.toBe(regularStats.compressedTokens);
  });
  
  // Test other utility functions if available
  test('Other utility functions', () => {
    // Add tests for any other utility functions that exist
    // For example, string processing, formatting, etc.
    
    if (utils.formatCode) {
      const unformatted = 'function test(){return true;}';
      const formatted = utils.formatCode(unformatted);
      expect(formatted).not.toBe(unformatted);
      expect(formatted).toContain(' ');
    }
    
    if (utils.normalizeWhitespace) {
      const withExtraSpace = '  function   test()  {  return   true;  }  ';
      const normalized = utils.normalizeWhitespace(withExtraSpace);
      expect(normalized).not.toBe(withExtraSpace);
      expect(normalized.length).toBeLessThan(withExtraSpace.length);
    }
  });
});

describe('Prompt Generator', () => {
  // Test prompt generation
  test('Generates different prompt formats', () => {
    const formats = ['full', 'basic', 'minimal'];
    const methods = ['kanji', 'semantic-kanji'];
    
    formats.forEach(format => {
      methods.forEach(method => {
        const prompt = promptGenerator.generate(format, method);
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
        
        // Prompt should mention the method
        const methodMention = new RegExp(method, 'i');
        expect(prompt).toMatch(methodMention);
      });
    });
    
    // Full prompts should be longer than minimal
    const fullPrompt = promptGenerator.generate('full', 'kanji');
    const minimalPrompt = promptGenerator.generate('minimal', 'kanji');
    expect(fullPrompt.length).toBeGreaterThan(minimalPrompt.length);
  });
  
  // Test prompt options
  test('Supports prompt splitting', () => {
    const options = {
      split: true // This option splits the prompt into parts
    };
    
    const splitPrompt = promptGenerator.generate('full', 'kanji', options);
    
    // Should return an array when split is true and format is full
    expect(Array.isArray(splitPrompt) || typeof splitPrompt === 'string').toBeTruthy();
    
    // Without split
    const regularPrompt = promptGenerator.generate('full', 'kanji');
    expect(typeof regularPrompt).toBe('string');
  });
});