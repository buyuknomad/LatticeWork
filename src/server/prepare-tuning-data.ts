// src/server/prepare-tuning-data.ts
import { writeFileSync } from 'fs';
import { getAllMentalModelsServer, getAllCognitiveBiasesServer } from './supabase-server';
import { MentalModel, CognitiveBias } from '../types/models';

async function prepareTuningData() {
  try {
    // Fetch all mental models and cognitive biases
    const allModels = await getAllMentalModelsServer();
    const allBiases = await getAllCognitiveBiasesServer();
    
    console.log(`Fetched ${allModels.length} mental models and ${allBiases.length} cognitive biases`);
    
    // Create sample scenarios (in a real application, these would be carefully crafted examples)
    const tuningExamples = createSampleTuningExamples(allModels, allBiases);
    
    // Format data according to Gemini's tuning format
    const formattedTuningData = formatForGeminiTuning(tuningExamples);
    
    // Save to a JSONL file
    writeFileSync('gemini-tuning-data.jsonl', formattedTuningData.join('\n'));
    
    console.log(`Successfully created tuning dataset with ${tuningExamples.length} examples`);
  } catch (error) {
    console.error('Error preparing tuning data:', error);
  }
}

function createSampleTuningExamples(models: MentalModel[], biases: CognitiveBias[]) {
  // Here we would normally create carefully crafted examples
  // For this demo, we'll create a few simplified examples
  
  return [
    {
      situation: "I keep procrastinating on important tasks until the last minute, even though I know it creates stress.",
      relevantModels: [
        models.find(m => m.id === 'time-boxing') || models[0],
        models.find(m => m.id === 'habit-formation') || models[1]
      ],
      relevantBiases: [
        biases.find(b => b.id === 'hyperbolic-discounting') || biases[0],
        biases.find(b => b.id === 'planning-fallacy') || biases[1]
      ],
      explanation: "Time-boxing helps manage procrastination by allocating specific time slots for tasks. Habit formation can establish better work routines. Hyperbolic discounting explains why immediate distractions seem more attractive than long-term goals, while the planning fallacy leads to underestimating how long tasks will take."
    },
    {
      situation: "My team and I spent months developing a product feature that customers aren't using.",
      relevantModels: [
        models.find(m => m.id === 'sunk-cost-fallacy') || models[2],
        models.find(m => m.id === 'confirmation-bias') || models[3]
      ],
      relevantBiases: [
        biases.find(b => b.id === 'commitment-bias') || biases[2],
        biases.find(b => b.id === 'availability-bias') || biases[3]
      ],
      explanation: "The sunk cost fallacy makes it hard to abandon a project after significant investment. Confirmation bias may have led to selectively noticing positive signals about the feature. Commitment bias keeps us attached to previous decisions, while availability bias might have overemphasized a few customer requests."
    },
    // Add more examples here...
  ];
}

function formatForGeminiTuning(examples: any[]) {
  return examples.map(example => {
    // Format according to Gemini's requirements
    const tuningExample = {
      messages: [
        {
          role: "user",
          content: `I need help understanding this situation: "${example.situation}" What mental models and cognitive biases might apply here?`
        },
        {
          role: "model",
          content: formatModelResponse(example)
        }
      ]
    };
    
    return JSON.stringify(tuningExample);
  });
}

function formatModelResponse(example: any) {
  const modelsList = example.relevantModels.map((model: MentalModel) => 
    `- ${model.name}: ${model.summary}`
  ).join('\n');
  
  const biasesList = example.relevantBiases.map((bias: CognitiveBias) => 
    `- ${bias.name}: ${bias.summary}`
  ).join('\n');
  
  return `I've analyzed your situation and identified relevant thinking tools that can help:

## Mental Models That Apply
${modelsList}

## Cognitive Biases To Watch For
${biasesList}

## Why These Apply
${example.explanation}

Understanding these concepts can help you navigate this situation more effectively. Would you like me to explain any of these in more detail?`;
}

// Run the script
prepareTuningData();