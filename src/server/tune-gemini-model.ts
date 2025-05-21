// src/server/tune-gemini-model.ts
import dotenv from 'dotenv';
import { GoogleGenerativeAI, TuningState } from '@google/generative-ai';
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

    console.log('Setting up Gemini API client...');
    const genAI = new GoogleGenerativeAI(apiKey);

    // Load the tuning data
    console.log(`Reading tuning data from: ${tuningDataPath}`);
    const tuningDataRaw = readFileSync(tuningDataPath, 'utf-8');
    const tuningData = tuningDataRaw
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));

    console.log(`Loaded ${tuningData.length} tuning examples`);

    // Configure the tuning job
    console.log('Configuring tuning job...');
    const modelId = 'gemini-1.5-pro-latest'; // Use the appropriate model ID
    
    const tuningConfig = {
      model: modelId,
      displayName: 'cognitive-cosmos-advisor',
      trainingData: tuningData,
      hyperparameters: {
        batchSize: 16, // Adjust based on your data size
        learningRate: 1e-4,
        epochCount: 3
      },
      adapter: 'LORA', // Use LoRA for efficient fine-tuning
    };

    // Start the tuning job
    console.log('Submitting tuning job to Gemini API...');
    const tuningJob = await genAI.tuningModel.createTuningJob(tuningConfig);

    console.log('Tuning job created successfully!');
    console.log(`Job ID: ${tuningJob.id}`);
    console.log(`Initial state: ${tuningJob.state}`);
    console.log('');
    console.log('The tuning process may take several hours to complete.');
    console.log('You can check the status using the Google AI Studio interface');
    console.log('or by querying the job ID through the API.');

    // Optional: Set up a basic polling mechanism to check status
    console.log('Setting up status polling (will check every 15 minutes)...');
    const checkStatus = async () => {
      try {
        const jobDetails = await genAI.tuningModel.getTuningJob(tuningJob.id);
        console.log(`[${new Date().toISOString()}] Job status: ${jobDetails.state}`);
        
        if (jobDetails.state === TuningState.SUCCEEDED) {
          console.log('Tuning completed successfully!');
          console.log(`Tuned model ID: ${jobDetails.tunedModel.name}`);
          console.log('You can now use this model for predictions.');
          clearInterval(intervalId);
        } else if (jobDetails.state === TuningState.FAILED) {
          console.error('Tuning job failed:', jobDetails.error);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error checking job status:', error);
      }
    };

    // Check status every 15 minutes
    const intervalId = setInterval(checkStatus, 15 * 60 * 1000);

    // Also check immediately after submission
    setTimeout(checkStatus, 5000);

  } catch (error) {
    console.error('Error during tuning process:', error);
  }
}

// Run the tuning process
tuneGeminiModel();