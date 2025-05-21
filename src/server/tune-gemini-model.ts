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

    // Instead of trying to list models, let's specify the model directly
    const baseModel = 'gemini-2.5-flash-preview-05-20';
    console.log(`Using base model for tuning: ${baseModel}`);

    // Start the tuning process
    console.log('Starting tuning process...');
    
    // Log the structure of the first example for debugging
    console.log('Example structure:', JSON.stringify(tuningExamples[0], null, 2).slice(0, 500) + '...');
    
    // Convert the data to the expected format if needed
    const tuningConfig = {
      baseModel,
      trainingData: tuningExamples,
      tuningOptions: {
        epochCount: 3,
        batchSize: 8,
        learningRate: 0.0001
      },
      displayName: "cognitive-cosmos-advisor"
    };
    
    console.log('Submitting tuning job with config...');
    const tuningJob = await ai.tunings.create(tuningConfig);

    console.log('Tuning job created successfully!');
    console.log(`Job details:`, tuningJob);
    
    // Monitor the job
    console.log('Setting up polling for job status...');
    const checkStatus = async () => {
      try {
        const jobStatus = await ai.tunings.get(tuningJob.name);
        console.log(`[${new Date().toISOString()}] Job status:`, jobStatus.state);
        
        if (jobStatus.state === 'SUCCEEDED') {
          console.log('Tuning completed successfully!');
          console.log('Tuned model:', jobStatus.tunedModel);
          clearInterval(intervalId);
        } else if (jobStatus.state === 'FAILED') {
          console.error('Tuning job failed:', jobStatus.error);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };
    
    // Check every 15 minutes
    const intervalId = setInterval(checkStatus, 15 * 60 * 1000);
    
    // Also check immediately
    setTimeout(checkStatus, 5000);

  } catch (error) {
    console.error('Error during tuning process:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the function
tuneGeminiModel();