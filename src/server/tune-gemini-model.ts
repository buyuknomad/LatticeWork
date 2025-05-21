// src/server/tune-gemini-model.ts
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Path to your formatted training data
const tuningDataPath = '/home/project/gemini-tuning-data.jsonl';

async function tuneGeminiModel() {
  try {
    // Check for API key
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
    }

    console.log('Setting up Google GenAI client...');
    const ai = new GoogleGenAI({ apiKey });

    // Load the tuning data
    console.log(`Reading tuning data from: ${tuningDataPath}`);
    const tuningDataRaw = readFileSync(tuningDataPath, 'utf-8');
    const tuningExamples = tuningDataRaw
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));

    console.log(`Loaded ${tuningExamples.length} tuning examples`);

    // List available models for tuning
    console.log('Checking which models are available for tuning...');
    const models = await ai.models.list();
    const tuningModels = models.filter(m => 
      m.supportedActions && m.supportedActions.includes('createTunedModel')
    );
    
    if (tuningModels.length === 0) {
      console.error('No models available for tuning. Verify your API key has tuning permissions.');
      return;
    }
    
    console.log('Models available for tuning:');
    tuningModels.forEach(m => console.log(`- ${m.name}`));
    
    // Select a base model for tuning (preferably Gemini 1.5)
    const baseModel = tuningModels.find(m => m.name.includes('gemini-1.5'))?.name || tuningModels[0].name;
    console.log(`Selected base model for tuning: ${baseModel}`);

    // Start the tuning process
    console.log('Starting tuning process...');
    const tuningJob = await ai.tunings.tune({
      baseModel,
      trainingData: tuningExamples,
      config: {
        epochCount: 3,
        batchSize: 16,
        learningRate: 0.0001,
        tunedModelDisplayName: "cognitive-cosmos-advisor"
      }
    });

    console.log('Tuning job created successfully!');
    console.log(`Job ID: ${tuningJob.name}`);
    console.log(`Tuned model: ${tuningJob.tunedModel.name}`);
    console.log('');
    console.log('The tuning process may take several hours to complete.');

  } catch (error) {
    console.error('Error during tuning process:', error);
  }
}

// Run the function
tuneGeminiModel();