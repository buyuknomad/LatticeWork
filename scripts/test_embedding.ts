import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables from .env file (assuming .env is in the parent directory of 'scripts', e.g. /home/project/.env)
// If your .env file is in the same directory as this script (e.g. /home/project/scripts/.env), use: dotenv.config();
// If your .env file is in /home/project/ and this script is in /home/project/scripts/, then '../.env' is correct.
dotenv.config(); 

async function testEmbedding() {
  const apiKey = process.env.VITE_GEMINI_API_KEY; // Using your .env variable name

  if (!apiKey) {
    console.error("ERROR: VITE_GEMINI_API_KEY not found in environment variables. Check your .env file.");
    console.error("Ensure the .env file is in the correct location (expected: /home/project/.env) and the variable is set.");
    return;
  }

  // YOUR CHOSEN MODEL and TARGET DIMENSIONALITY
  const modelId = "gemini-embedding-exp-03-07"; 
  const targetDimensionality = 1536; 

  console.log(`--- Testing Embedding Model ---`);
  console.log(`Model ID: ${modelId}`);
  console.log(`Attempting to set Output Dimensionality: ${targetDimensionality}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // For experimental or specific model versions, the exact string `modelId` is used.
    // If the API expects a "models/" prefix for this specific experimental ID, an error would occur here or in the API call.
    // Your successful test indicates "gemini-embedding-exp-03-07" is working as is.
    const model = genAI.getGenerativeModel({ model: modelId });

    const textToEmbed = 'Can this experimental model produce 1536 dimensions?';
    console.log(`Embedding text: "${textToEmbed}"`);

    const result = await model.embedContent({
      content: { parts: [{ text: textToEmbed }], role: "user" }, 
      taskType: TaskType.RETRIEVAL_DOCUMENT, 
      outputDimensionality: targetDimensionality // Explicitly setting the desired output dimension
    });

    const embedding = result.embedding;

    if (embedding && embedding.values) {
      console.log("\n--- Embedding Result ---");
      console.log("Embedding successful!");
      console.log("Total dimensions returned:", embedding.values.length);
      console.log("First 10 values:", embedding.values.slice(0, 10));

      if (embedding.values.length === targetDimensionality) {
        console.log(`SUCCESS: Model returned the target dimensionality of ${targetDimensionality}.`);
      } else {
        // This case should not have been hit given your successful output, but good to keep for debugging.
        console.warn(`WARNING: Model returned ${embedding.values.length} dimensions, but ${targetDimensionality} was requested.`);
        console.warn("This means either the model doesn't support overriding dimensionality to this specific value, or this specific model ID has a fixed output size different from your target.");
      }
    } else {
      console.error("ERROR: Embedding generation returned no values in the embedding object.");
      console.log("Full API Response (if available):", JSON.stringify(result, null, 2));
    }
  } catch (e: any) {
    console.error("\n--- ERROR DURING EMBEDDING TEST ---");
    console.error("Message:", e.message);
    if (e.cause) { // Some errors, especially from underlying fetch operations, might have a 'cause'
        console.error("Cause (if any):", e.cause);
    }
    // Attempt to log more specific details if it's a Google API error structure
    if (e.error && e.error.details) { 
        console.error("API Error Details:", JSON.stringify(e.error.details, null, 2));
    } else if (e.details) { // Sometimes the error object itself has 'details'
         console.error("Error Details:", JSON.stringify(e.details, null, 2));
    } else {
        // console.error("Full error object for debugging:", e); // Uncomment for the entire error structure
    }
  }
}

testEmbedding();