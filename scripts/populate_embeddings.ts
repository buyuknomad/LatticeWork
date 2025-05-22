import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables from .env file (assuming .env is in /home/project/)
dotenv.config({ path: '/.env' }); // Adjust path if .env is elsewhere relative to this script

async function testEmbedding() {
  const apiKey = process.env.VITE_GEMINI_API_KEY; // Using your .env variable name

  if (!apiKey) {
    console.error("ERROR: VITE_GEMINI_API_KEY not found in environment variables. Check your .env file.");
    return;
  }

  // *** YOUR CHOSEN MODEL ***
  // Ensure this is the exact model identifier that supports 1536 dimensions
  // and is accessible with your API key.
  // The SDK often expects models to be prefixed with "models/", e.g., "models/gemini-embedding-exp-03-07"
  // However, since "gemini-embedding-exp-03-07" is experimental, let's try it as is first.
  // If that fails, try "models/gemini-embedding-exp-03-07".
  // If both fail, this specific model ID might not be correct for API use or your key doesn't have access.
  const modelId = "gemini-embedding-exp-03-07";
  // const modelId = "models/text-embedding-004"; // A known working 768-dim model for comparison

  console.log(`Attempting to use embedding model: ${modelId}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });

    const textToEmbed = 'What is the meaning of life?';
    console.log(`Embedding text: "${textToEmbed}"`);

    const result = await model.embedContent({
      content: { parts: [{ text: textToEmbed }], role: "user" }, // Correct content structure
      taskType: TaskType.RETRIEVAL_DOCUMENT, // Or appropriate task type
    });

    const embedding = result.embedding;

    if (embedding && embedding.values) {
      console.log("Embedding successful!");
      console.log("Embedding values (first 10 dimensions):", embedding.values.slice(0, 10));
      console.log("Total dimensions:", embedding.values.length);
      if (embedding.values.length !== 1536 && modelId === "gemini-embedding-exp-03-07") {
        console.warn(`WARNING: Expected 1536 dimensions for ${modelId} but received ${embedding.values.length}.`);
      }
    } else {
      console.error("ERROR: Embedding generation returned no values in the embedding object.");
      console.log("Full API Response:", JSON.stringify(result, null, 2));
    }
  } catch (e: any) {
    console.error("ERROR during embedding test:", e.message);
    if (e.cause) {
        console.error("Cause:", e.cause);
    }
    // console.error("Full error object:", e); // For more detailed debugging
  }
}

testEmbedding();