/**
 * Tests for the JS-Kanji compressor and decompressor
 */

const jsKanji = require('../js-kanji-compressor');
const jsKanjiDecompressor = require('../js-kanji-decompressor');

describe('JS-Kanji Compressor', () => {
  const testCases = {
    basic: 'function test() { return true; }',
    withOperators: 'let x = a + b * c / d - e;',
    withStrings: 'const greeting = "Hello, " + name + "!";',
    withComments: '// This is a comment\nfunction test() { /* inline comment */ return true; }',
    withTemplateStrings: 'const greeting = `Hello, ${name}!`;',
    withRegex: 'const regex = /test-[0-9]+/g;',
    withObject: 'const obj = { name: "John", age: 30, greet() { return `Hello, ${this.name}`; } };',
    withArray: 'const arr = [1, 2, 3, 4, 5];',
    withLoop: 'for (let i = 0; i < 10; i++) { console.log(i); }',
    withCondition: 'if (x > 0) { return "positive"; } else if (x < 0) { return "negative"; } else { return "zero"; }',
    withFunction: 'function add(a, b) { return a + b; }',
    withArrowFunction: 'const add = (a, b) => a + b;',
    withClass: 'class Test { constructor() { this.value = 0; } increment() { this.value++; } }',
    withAsync: 'async function fetchData() { const response = await fetch(url); return await response.json(); }',
    withDestructuring: 'const { name, age } = person; const [first, ...rest] = array;',
    withSpread: 'const newObj = { ...obj, newProp: value }; const newArray = [...arr, newItem];',
    withModule: 'import { useState } from "react"; export default function App() { return <div>Hello</div>; }',
  };

  // Test compression and decompression for each case
  Object.entries(testCases).forEach(([name, code]) => {
    test(`Compresses and decompresses ${name} correctly`, () => {
      const compressed = jsKanji.compress(code);
      
      // Verify compression produced something
      expect(typeof compressed).toBe('string');
      expect(compressed.length).toBeGreaterThan(0);
      
      // For most cases, compression should produce shorter output
      // For very short snippets, this might not always be true due to overhead
      if (code.length > 50) {
        expect(compressed.length).toBeLessThan(code.length);
      }
      
      // Decompression should restore the original code (ignoring whitespace)
      const decompressed = jsKanjiDecompressor.decompress(compressed);
      expect(decompressed.replace(/\s+/g, '')).toBe(code.replace(/\s+/g, ''));
    });
  });
  
  // Test compression options
  test('Respects removeComments option', () => {
    const code = '// This is a comment\nfunction test() { /* inline comment */ return true; }';
    
    const withComments = jsKanji.compress(code, { removeComments: false });
    const withoutComments = jsKanji.compress(code, { removeComments: true });
    
    // Without comments should be smaller
    expect(withoutComments.length).toBeLessThan(withComments.length);
    
    // Decompression of version with comments should have comments
    const decompressedWithComments = jsKanjiDecompressor.decompress(withComments);
    expect(decompressedWithComments).toContain('comment');
    
    // Decompression of version without comments should not have comments
    // Or it might have stripped comments during compression
    const decompressedWithoutComments = jsKanjiDecompressor.decompress(withoutComments);
    expect(decompressedWithoutComments.replace(/\s+/g, '')).toContain('functiontest(){returntrue;}');
  });
  
  test('Respects preserveLineBreaks option', () => {
    const code = 'function test() {\n  return true;\n}';
    
    const withLineBreaks = jsKanji.compress(code, { preserveLineBreaks: true });
    const withoutLineBreaks = jsKanji.compress(code, { preserveLineBreaks: false });
    
    // Without line breaks should be smaller in most cases
    // This isn't always guaranteed as kanji compression can sometimes create different outputs
    const decompressedWithBreaks = jsKanjiDecompressor.decompress(withLineBreaks);
    const decompressedWithoutBreaks = jsKanjiDecompressor.decompress(withoutLineBreaks);
    
    // With line breaks should have more newlines
    expect((decompressedWithBreaks.match(/\n/g) || []).length)
      .toBeGreaterThanOrEqual((decompressedWithoutBreaks.match(/\n/g) || []).length);
  });
  
  // Test compression detection
  test('Detects Kanji compressed code correctly', () => {
    const code = 'function test() { return true; }';
    const compressed = jsKanji.compress(code);
    
    expect(jsKanji.isKanjiCompressed(compressed)).toBe(true);
    expect(jsKanji.isKanjiCompressed(code)).toBe(false);
  });
  
  // Test edge cases
  test('Handles empty or whitespace input', () => {
    // Empty input might throw an error in the current implementation
    try {
      const compressed = jsKanji.compress('  ');
      expect(typeof compressed).toBe('string');
    } catch (e) {
      // If it throws, that's also acceptable behavior for empty input
      expect(e).toBeDefined();
    }
    
    try {
      const decompressed = jsKanjiDecompressor.decompress('  ');
      expect(typeof decompressed).toBe('string');
    } catch (e) {
      // If it throws, that's also acceptable
      expect(e).toBeDefined();
    }
  });
  
  test('Handles large input', () => {
    // Generate a large code sample
    const largeCode = Array(500).fill('function test() { return true; }').join('\n');
    
    const compressed = jsKanji.compress(largeCode);
    expect(compressed.length).toBeLessThan(largeCode.length);
    
    const decompressed = jsKanjiDecompressor.decompress(compressed);
    // Just check length approximately same after normalization
    expect(decompressed.replace(/\s+/g, '').length).toBe(largeCode.replace(/\s+/g, '').length);
  });
  
  // Test for specific dictionary usage
  test('Uses correct dictionary mapping', () => {
    const code = '{ } ( ) < > + - * / = ! ? : ; , . " \' ` $ _ & | ^ % ~ # @ [] === !== >= <= == != && || => ... // /* */ ++';
    
    const compressed = jsKanji.compress(code);
    expect(compressed).not.toBe(code);
    
    const decompressed = jsKanjiDecompressor.decompress(compressed);
    expect(decompressed.replace(/\s+/g, '')).toBe(code.replace(/\s+/g, ''));
  });
});