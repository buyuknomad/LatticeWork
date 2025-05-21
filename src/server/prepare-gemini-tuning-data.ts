// src/server/prepare-gemini-tuning-data.ts
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

async function convertToGeminiFormat() {
  try {
    // Load your examples JSON file
    const rawData = readFileSync('examples.json', 'utf-8');
    const examples = JSON.parse(rawData);
    
    console.log(`Loaded ${examples.length} examples from file`);
    
    // Convert to Gemini's fine-tuning format
    const geminiExamples = examples.map(example => {
      // Format the model response with mental models and biases
      const modelsText = example.relevantModels
        .map(model => `- **${model.name}**: ${model.summary}`)
        .join('\n');
      
      const biasesText = example.relevantBiases
        .map(bias => `- **${bias.name}**: ${bias.summary}`)
        .join('\n');
      
      // Create the chat format that Gemini expects
      return {
        messages: [
          {
            role: "user",
            content: `I need help understanding this situation: "${example.situation}" What mental models and cognitive biases might apply here?`
          },
          {
            role: "model",
            content: `I've analyzed your situation and identified relevant thinking tools that can help:

## Mental Models That Apply
${modelsText}

## Cognitive Biases To Watch For
${biasesText}

## Why These Apply
${example.explanation}

Understanding these concepts can help you navigate this situation more effectively. Would you like me to explain any of these in more detail?`
          }
        ]
      };
    });
    
    // Write to a JSONL file (one JSON object per line)
    const jsonlData = geminiExamples.map(example => JSON.stringify(example)).join('\n');
    writeFileSync('gemini-tuning-data.jsonl', jsonlData);
    
    console.log(`Successfully converted ${geminiExamples.length} examples to Gemini format`);
    console.log('Saved to gemini-tuning-data.jsonl');
  } catch (error) {
    console.error('Error converting data:', error);
  }
}

// Run the conversion
convertToGeminiFormat();