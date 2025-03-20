/**
 * Jest configuration for Semantic-Kanji-JS test suite
 */

module.exports = {
  // The test environment
  testEnvironment: 'node',
  
  // The pattern Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Collect test coverage 
  collectCoverage: true,
  
  // Coverage collection targets
  collectCoverageFrom: [
    'index.js',
    'semantic-kanji.js',
    'semantic-kanji-module.js',
    'js-kanji-compressor.js',
    'js-kanji-decompressor.js',
    'utils.js',
    'prompt-generator.js',
    'semantic-patterns.js',
    'cli.js'
  ],
  
  // Coverage output directory
  coverageDirectory: 'coverage',
  
  // Coverage reports format
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Minimum test coverage thresholds
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 45,
      lines: 50
    }
  },
  
  // Verbose output
  verbose: true,
  
  // Show each test run
  bail: false,
  
  // Test timeout
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true
};