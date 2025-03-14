#!/usr/bin/env node

/**
 * LLM Interaction Script
 * 
 * This script provides a simplified interface for communicating with LLMs
 * using Semantic-Kanji compression. It handles:
 * 1. Converting JavaScript files to Semantic-Kanji format
 * 2. Sending to LLM API (Claude or OpenAI)
 * 3. Receiving responses and decompressing any code
 * 4. Saving results
 */

const fs = require('fs');
const path = require('path');
const semanticKanji = require('./semantic-kanji');
const promptGenerator = require('./prompt-generator');
const converter = require('./js-kanji-converter');
const { program } = require('commander');
const readline = require('readline');

// Use appropriate API libraries based on availability
let anthropic, openai;
try {
  anthropic = require('@anthropic-ai/sdk');
} catch (e) {
  // Anthropic SDK not installed
}

try {
  openai = require('openai');
} catch (e) {
  // OpenAI SDK not installed
}

// CLI setup
program
  .name('llm-interaction')
  .description('Interact with LLMs using Semantic-Kanji compression')
  .version('1.0.0');

program
  .command('send')
  .description('Send JavaScript to LLM and get response')
  .argument('<file>', 'JavaScript file to send')
  .option('-p, --prompt <file>', 'Additional prompt file')
  .option('-o, --output <file>', 'Output file for response')
  .option('-m, --model <model>', 'LLM model to use', 'claude-3-opus-20240229')
  .option('-s, --service <service>', 'LLM service (anthropic/openai)', 'anthropic')
  .option('-i, --interactive', 'Interactive mode')
  .option('-c, --compress-only', 'Only compress the file and show result')
  .action(async (file, options) => {
    try {
      // Read and compress the JavaScript file
      const jsCode = fs.readFileSync(file, 'utf8');
      const kjsCode = semanticKanji.compress(jsCode);
      
      // If compress-only mode, just show the result
      if (options.compressOnly) {
        const stats = semanticKanji.getStats(jsCode, kjsCode);
        console.log(`\nOriginal JavaScript (${jsCode.length} chars, ~${stats.originalTokens} tokens):`);
        console.log(jsCode.substring(0, 200) + (jsCode.length > 200 ? '...' : ''));
        
        console.log(`\nSemantic-Kanji (${kjsCode.length} chars, ~${stats.compressedTokens} tokens):`);
        console.log(kjsCode);
        
        console.log(`\nToken reduction: ${stats.tokenReduction} tokens (${stats.tokenSavingsPercent}% savings)\n`);
        return;
      }
      
      // Generate or read the instruction prompt
      let instructionPrompt;
      if (options.prompt && fs.existsSync(options.prompt)) {
        instructionPrompt = fs.readFileSync(options.prompt, 'utf8');
      } else {
        instructionPrompt = promptGenerator.generate('full', 'semantic-kanji');
      }
      
      // Prepare user message
      let userMessage = options.prompt ? 
        fs.readFileSync(options.prompt, 'utf8') + "\n\nHere's the code in Semantic-Kanji format:\n\n" + kjsCode :
        "Here's JavaScript code in Semantic-Kanji format. Please translate it to regular JavaScript and then help me understand what it does:\n\n" + kjsCode;
      
      // Interactive mode or API mode
      if (options.interactive) {
        await runInteractiveSession(instructionPrompt, userMessage, options);
      } else {
        const response = await sendToLLM(instructionPrompt, userMessage, options);
        processResponse(response, options);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('interactive')
  .description('Start interactive session with LLM')
  .option('-p, --prompt <file>', 'Initial prompt file')
  .option('-m, --model <model>', 'LLM model to use', 'claude-3-opus-20240229')
  .option('-s, --service <service>', 'LLM service (anthropic/openai)', 'anthropic')
  .action(async (options) => {
    try {
      // Generate or read the instruction prompt
      let instructionPrompt;
      if (options.prompt && fs.existsSync(options.prompt)) {
        instructionPrompt = fs.readFileSync(options.prompt, 'utf8');
      } else {
        instructionPrompt = promptGenerator.generate('full', 'semantic-kanji');
      }
      
      await runInteractiveSession(instructionPrompt, "Let's start our conversation. I'll share JavaScript code using Semantic-Kanji compression when needed.", options);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Send messages to LLM
 * 
 * @param {string} systemPrompt - System instructions
 * @param {string} userMessage - User message
 * @param {Object} options - Command options
 * @returns {string} - LLM response
 */
async function sendToLLM(systemPrompt, userMessage, options) {
  if (options.service === 'anthropic' && anthropic) {
    return sendToAnthropic(systemPrompt, userMessage, options.model);
  } else if (options.service === 'openai' && openai) {
    return sendToOpenAI(systemPrompt, userMessage, options.model);
  } else {
    throw new Error(`Service ${options.service} not available. Please install the appropriate SDK.`);
  }
}

/**
 * Send message to Anthropic API
 */
async function sendToAnthropic(systemPrompt, userMessage, model) {
  const client = new anthropic.Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  
  console.log("Sending to Anthropic API...");
  
  const response = await client.messages.create({
    model: model,
    system: systemPrompt,
    max_tokens: 4000,
    messages: [
      { role: "user", content: userMessage }
    ]
  });
  
  return response.content[0].text;
}

/**
 * Send message to OpenAI API
 */
async function sendToOpenAI(systemPrompt, userMessage, model) {
  const client = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  console.log("Sending to OpenAI API...");
  
  const response = await client.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    max_tokens: 4000
  });
  
  return response.choices[0].message.content;
}

/**
 * Process and save LLM response
 */
function processResponse(response, options) {
  console.log("\n=== LLM RESPONSE ===\n");
  console.log(response);
  
  // Check for Semantic-Kanji code in response
  const kjsCodeMatches = response.match(/```(?:js|javascript)?\s*(定.*?)```/gs);
  
  if (kjsCodeMatches) {
    console.log("\n=== DETECTED COMPRESSED CODE IN RESPONSE ===\n");
    
    kjsCodeMatches.forEach((match, index) => {
      const kjsCode = match.replace(/```(?:js|javascript)?\s*(.*?)```/s, '$1').trim();
      const jsCode = semanticKanji.decompress(kjsCode);
      
      console.log(`\n--- DECOMPRESSED CODE ${index + 1} ---\n`);
      console.log(jsCode);
      
      // Save to file if output option provided
      if (options.output) {
        const outputBase = path.basename(options.output, path.extname(options.output));
        const outputDir = path.dirname(options.output);
        const outputFile = path.join(outputDir, `${outputBase}_decompressed${index > 0 ? `_${index}` : ''}.js`);
        
        fs.writeFileSync(outputFile, jsCode);
        console.log(`\nDecompressed code saved to: ${outputFile}`);
      }
    });
  }
  
  // Save full response if output option provided
  if (options.output) {
    fs.writeFileSync(options.output, response);
    console.log(`\nFull response saved to: ${options.output}`);
  }
}

/**
 * Run interactive session with LLM
 */
async function runInteractiveSession(systemPrompt, initialMessage, options) {
  console.log("Starting interactive session. Type 'exit' to end the session.");
  console.log("Type 'file:filename.js' to compress and send a JavaScript file.");
  console.log("Type 'save:filename.txt' to save the conversation.");
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const conversation = [
    { role: "system", content: systemPrompt },
    { role: "user", content: initialMessage }
  ];
  
  // Send initial message
  try {
    const response = await sendToLLM(systemPrompt, initialMessage, options);
    console.log("\n=== LLM RESPONSE ===\n");
    console.log(response);
    conversation.push({ role: "assistant", content: response });
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    return rl.close();
  }
  
  // Interactive loop
  const askQuestion = () => {
    rl.question("\nYou: ", async (input) => {
      if (input.toLowerCase() === 'exit') {
        return rl.close();
      }
      
      // Handle file command
      if (input.startsWith('file:')) {
        const filename = input.substring(5).trim();
        if (fs.existsSync(filename)) {
          try {
            const jsCode = fs.readFileSync(filename, 'utf8');
            const kjsCode = semanticKanji.compress(jsCode);
            const stats = semanticKanji.getStats(jsCode, kjsCode);
            
            console.log(`\nCompressed ${filename} (${stats.tokenSavingsPercent}% token reduction)`);
            input = `Here's some JavaScript code in Semantic-Kanji format from file ${filename}:\n\n${kjsCode}\n\nPlease translate this to regular JavaScript and explain what it does.`;
          } catch (error) {
            console.error(`Error reading file: ${error.message}`);
            return askQuestion();
          }
        } else {
          console.error(`File not found: ${filename}`);
          return askQuestion();
        }
      }
      
      // Handle save command
      if (input.startsWith('save:')) {
        const filename = input.substring(5).trim();
        try {
          const conversationText = conversation.map(msg => 
            `${msg.role.toUpperCase()}:\n${msg.content}\n\n`
          ).join('---\n\n');
          
          fs.writeFileSync(filename, conversationText);
          console.log(`Conversation saved to ${filename}`);
          return askQuestion();
        } catch (error) {
          console.error(`Error saving conversation: ${error.message}`);
          return askQuestion();
        }
      }
      
      // Normal message
      conversation.push({ role: "user", content: input });
      
      try {
        // For Anthropic
        if (options.service === 'anthropic' && anthropic) {
          const client = new anthropic.Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
          });
          
          const messages = conversation.slice(1); // Remove system message
          
          const response = await client.messages.create({
            model: options.model,
            system: systemPrompt,
            max_tokens: 4000,
            messages: messages
          });
          
          const responseText = response.content[0].text;
          console.log("\n=== LLM RESPONSE ===\n");
          console.log(responseText);
          conversation.push({ role: "assistant", content: responseText });
        } 
        // For OpenAI
        else if (options.service === 'openai' && openai) {
          const client = new openai.OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
          });
          
          const response = await client.chat.completions.create({
            model: options.model,
            messages: conversation,
            max_tokens: 4000
          });
          
          const responseText = response.choices[0].message.content;
          console.log("\n=== LLM RESPONSE ===\n");
          console.log(responseText);
          conversation.push({ role: "assistant", content: responseText });
        }
      } catch (error) {
        console.error(`API Error: ${error.message}`);
      }
      
      askQuestion();
    });
  };
  
  askQuestion();
}

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.help();
}
