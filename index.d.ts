/**
 * Semantic-Kanji TypeScript declarations
 */

/**
 * Compression options
 */
export interface CompressionOptions {
  removeComments?: boolean;
  preserveLineBreaks?: boolean;
  optimizationLevel?: number;
  [key: string]: any;
}

/**
 * Decompression options
 */
export interface DecompressionOptions {
  formatOutput?: boolean;
  [key: string]: any;
}

/**
 * Compression statistics
 */
export interface CompressionStats {
  originalChars: number;
  compressedChars: number;
  compressionRatio: number;
  originalTokens: number;
  compressedTokens: number;
  tokenReduction: number;
  tokenSavingsPercent: number;
}

/**
 * Comparison result between compression methods
 */
export interface ComparisonResult {
  original: {
    code: string;
    chars: number;
    tokens: number;
  };
  kanji: {
    code: string;
    chars: number;
    tokens: number;
    reduction: number;
    savingsPercent: number;
  };
  semantic: {
    code: string;
    chars: number;
    tokens: number;
    reduction: number;
    savingsPercent: number;
  };
}

/**
 * Compression module interface
 */
export interface CompressionModule {
  compress(code: string, options?: CompressionOptions): string;
  decompress(code: string, options?: DecompressionOptions): string;
}

/**
 * Prompt format types
 */
export type PromptFormat = 'full' | 'basic' | 'minimal';

/**
 * Compression method types
 */
export type CompressionMethod = 'kanji' | 'semantic-kanji' | 'semantic' | 'auto';

/**
 * Compress JavaScript code using the specified method
 */
export function compress(
  code: string, 
  method?: CompressionMethod, 
  options?: CompressionOptions
): string;

/**
 * Decompress code back to readable JavaScript
 */
export function decompress(
  code: string, 
  method?: CompressionMethod, 
  options?: DecompressionOptions
): string;

/**
 * Compare different compression methods on the same code
 */
export function compare(
  code: string, 
  options?: CompressionOptions
): ComparisonResult;

/**
 * Generate instruction prompts for LLMs
 */
export function generatePrompt(
  format?: PromptFormat, 
  method?: CompressionMethod, 
  options?: any
): string | string[];

/**
 * Get compression statistics
 */
export function getStats(
  original: string, 
  compressed: string, 
  isKanji?: boolean
): CompressionStats;

/**
 * Estimate token count for a string
 */
export function estimateTokens(
  text: string, 
  isKanji?: boolean
): number;

/**
 * JS-Kanji compression module
 */
export const kanji: CompressionModule;

/**
 * Semantic-Kanji compression module
 */
export const semantic: CompressionModule;

/**
 * Utility functions
 */
export const utils: {
  getCompressionStats(
    original: string, 
    compressed: string, 
    isKanji?: boolean
  ): CompressionStats;
  
  estimateTokens(
    text: string, 
    isKanji?: boolean
  ): number;
  
  [key: string]: any;
};