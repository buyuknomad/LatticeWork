// src/server/format-gemini-tuning-data.ts
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Path to your examples file
const examplesPath = '/home/project/examples.json';

async function formatGeminiTuningData() {
  try {
    // Read the examples file
    console.log(`Reading examples from: ${examplesPath}`);
    const rawData = readFileSync(examplesPath, 'utf-8');
    const examples = JSON.parse(rawData);
    
    console.log(`Found ${examples.length} examples to format`);
    
    // Format examples for Gemini
    const formattedExamples = examples.map(example => {
      // Format the model response
      const modelsText = example.relevantModels.map((model: any) => 
        `- **${model.name}**: ${model.summary}`
      ).join('\n\n');
      
      const biasesText = example.relevantBiases.map((bias: any) => 
        `- **${bias.name}**: ${bias.summary}`
      ).join('\n\n');
      
      // Create the formatted conversation example
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
    
    // Save the formatted examples to JSONL file
    const jsonlData = formattedExamples.map(example => JSON.stringify(example)).join('\n');
    const outputPath = path.join('/home/project', 'gemini-tuning-data.jsonl');
    writeFileSync(outputPath, jsonlData);
    
    console.log(`Successfully formatted ${examples.length} examples`);
    console.log(`Saved to: ${outputPath}`);
    
    // Also create a regular JSON file (easier to inspect)
    const jsonOutputPath = path.join('/home/project', 'gemini-tuning-data.json');
    writeFileSync(jsonOutputPath, JSON.stringify(formattedExamples, null, 2));
    console.log(`Also saved as JSON to: ${jsonOutputPath}`);
    
  } catch (error) {
    console.error('Error formatting tuning data:', error);
  }
}

// Run the function
formatGeminiTuningData();