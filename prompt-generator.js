/**
 * Prompt Generator for Semantic-Kanji
 * 
 * This module provides utilities for generating instruction prompts
 * for language models to understand and work with compressed JavaScript.
 */

const fs = require('fs');
const path = require('path');

// Prompt part file locations
const PROMPT_DIR = path.join(__dirname, 'prompts');
const PROMPT_PARTS = {
  part1: path.join(PROMPT_DIR, 'prompt-part1.txt'),
  part2: path.join(PROMPT_DIR, 'prompt-part2.txt'),
  part3: path.join(PROMPT_DIR, 'prompt-part3.txt'),
  part5: path.join(PROMPT_DIR, 'prompt-part5.txt'),
  part6: path.join(PROMPT_DIR, 'prompt-part6.txt'),
  part7: path.join(PROMPT_DIR, 'prompt-part7.txt')
};

/**
 * Get prompt part content from file
 * 
 * @param {string} partName - The prompt part name
 * @return {string} - The prompt part content
 */
function getPromptPart(partName) {
  try {
    if (PROMPT_PARTS[partName] && fs.existsSync(PROMPT_PARTS[partName])) {
      return fs.readFileSync(PROMPT_PARTS[partName], 'utf8');
    }
    // If file doesn't exist, return placeholder text
    return `[${partName} content not found]`;
  } catch (error) {
    console.error(`Error reading prompt part ${partName}:`, error.message);
    return `[Error reading ${partName}]`;
  }
}

/**
 * Generate instruction prompts for LLMs
 * 
 * @param {string} format - Format type ('full', 'basic', or 'minimal')
 * @param {string} method - Compression method ('mini', 'kanji', or 'semantic-kanji')
 * @param {Object} options - Optional configuration options 
 * @return {string|string[]} - Instruction prompt(s)
 */
function generate(format = 'full', method = 'semantic-kanji', options = {}) {
  format = format.toLowerCase();
  method = method.toLowerCase();
  
  // Determine method display name
  let methodName;
  switch (method) {
    case 'mini':
      methodName = 'JS-Mini';
      break;
    case 'kanji':
      methodName = 'JS-Kanji';
      break;
    case 'semantic-kanji':
    case 'semantic':
      methodName = 'Semantic-Kanji';
      break;
    default:
      methodName = method;
  }
  
  // Build prompt based on format
  let prompt = '';
  
  if (format === 'full') {
    // Full format includes all details
    prompt = [
      getPromptPart('part1'),
      getPromptPart('part2'),
      `# ${methodName} Instructions`,
      getPromptPart('part3'),
      getPromptPart('part5'),
      getPromptPart('part6'),
      getPromptPart('part7')
    ].join('\n\n');
  } else if (format === 'basic') {
    // Basic format with core instructions
    prompt = [
      `# ${methodName} Instructions`,
      getPromptPart('part3'),
      getPromptPart('part5')
    ].join('\n\n');
  } else if (format === 'minimal') {
    // Minimal format with just essentials
    prompt = [
      `# ${methodName} Instructions`,
      getPromptPart('part3')
    ].join('\n\n');
  } else {
    throw new Error(`Unknown prompt format: ${format}`);
  }
  
  // Handle prompt splitting if requested
  if (options.split && format === 'full') {
    return splitPrompt(prompt);
  }
  
  return prompt;
}

/**
 * Split a large prompt into smaller segments
 * 
 * @param {string} prompt - The full prompt to split
 * @return {string[]} - Array of prompt segments
 */
function splitPrompt(prompt) {
  // Simple split by main sections
  const segments = [];
  
  // First segment: Introduction and basics
  segments.push([
    getPromptPart('part1'),
    getPromptPart('part2')
  ].join('\n\n'));
  
  // Second segment: Core instructions
  segments.push([
    '# Semantic-Kanji Instructions (continued)',
    getPromptPart('part3')
  ].join('\n\n'));
  
  // Third segment: Advanced patterns
  segments.push([
    '# Semantic-Kanji Instructions (continued)',
    getPromptPart('part5'),
    getPromptPart('part6')
  ].join('\n\n'));
  
  // Fourth segment: Best practices
  segments.push([
    '# Semantic-Kanji Instructions (final part)',
    getPromptPart('part7')
  ].join('\n\n'));
  
  return segments;
}

// Export the generator function
module.exports = {
  generate
};
