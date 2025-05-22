import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables (assuming .env is in the parent directory of 'scripts')
dotenv.config( ); 

async function testSpecificEmbeddingOutput() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("ERROR: VITE_GEMINI_API_KEY not found. Check your .env file.");
    return;
  }

  // YOUR TARGET MODEL AND DIMENSIONALITY
  const modelId = "gemini-embedding-exp-03-07"; // The experimental model ID you mentioned
  const targetDimensionality = 1536; 

  console.log(`--- Testing Embedding Model ---`);
  console.log(`Model ID: ${modelId}`);
  console.log(`Attempting to set Output Dimensionality: ${targetDimensionality}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // IMPORTANT: For experimental models, the exact name might need to be models/gemini-embedding-exp-03-07
    // If "gemini-embedding-exp-03-07" alone fails, try "models/gemini-embedding-exp-03-07"
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
        console.warn(`WARNING: Model returned ${embedding.values.length} dimensions, but ${targetDimensionality} was requested.`);
        console.warn("This means either the model doesn't support overriding dimensionality, or this specific model ID has a fixed output size different from your target.");
      }
    } else {
      console.error("ERROR: Embedding generation returned no values in the embedding object.");
      console.log("Full API Response (if available):", JSON.stringify(result, null, 2));
    }
  } catch (e: any) {
    console.error("\n--- ERROR DURING EMBEDDING TEST ---");
    console.error("Message:", e.message);
    if (e.cause) {
        console.error("Cause:", e.cause);
    }
    // For more detailed error (e.g. if it's an API error with status code)
    if (e.error && e.error.details) { // Common structure for Google API errors
        console.error("API Error Details:", JSON.stringify(e.error.details, null, 2));
    } else {
        // console.error("Full error object:", e); // Uncomment for full error object if needed
    }
  }
}

testSpecificEmbeddingOutput();