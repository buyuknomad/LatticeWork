import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai'; // Corrected package name
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// --- Configuration ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

// Your chosen embedding model and its output dimension
const EMBEDDING_MODEL_NAME = "models/text-embedding-004"; // Fallback to a known model, see note below
// const EMBEDDING_MODEL_NAME = "YOUR_SPECIFIC_1536_DIM_MODEL_ID"; // e.g., "gemini-embedding-exp-03-07" IF it's the correct API ID
const EMBEDDING_DIMENSION = 768; // Defaulting to 768 for "models/text-embedding-004"
                                   // If using a 1536 model, set this to 1536

// IMPORTANT NOTE ON MODEL NAME:
// The public documentation for Google AI Studio / Gemini API embeddings
// lists "models/embedding-001" (which replaced "models/text-embedding-004") as the standard model, outputting 768 dimensions.
// "gemini-embedding-exp-03-07" sounds like an experimental or specific internal ID.
// Please ensure "gemini-embedding-exp-03-07" is the EXACT, ACCESSIBLE model ID for API calls.
// Often, model IDs available through the SDK are prefixed, e.g., "models/gemini-embedding-exp-03-07".
// For this script, I'll use "models/text-embedding-004" as a known working default.
// **You will need to change EMBEDDING_MODEL_NAME to the correct API identifier for "gemini-embedding-exp-03-07"
// AND set EMBEDDING_DIMENSION = 1536 if that's your target.**

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error("ERROR: Missing one or more required environment variables.");
  console.error("Please ensure your .env file defines:");
  console.error("  VITE_SUPABASE_URL");
  console.error("  SUPABASE_SERVICE_KEY");
  console.error("  VITE_GEMINI_API_KEY");
  process.exit(1);
}

console.log(`Using Supabase URL: ${SUPABASE_URL ? 'Loaded' : 'MISSING!'}`);
console.log(`Using Supabase Service Key: ${SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'MISSING!'}`);
console.log(`Using Gemini API Key: ${GEMINI_API_KEY ? 'Loaded' : 'MISSING!'}`);
console.log(`Attempting to use Embedding Model: ${EMBEDDING_MODEL_NAME} (Target Dimension: ${EMBEDDING_DIMENSION})`);


const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Ensure the model name here is the correct one for API access
const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });


interface DataRecord {
  id: string | number;
  name: string;
  summary: string;
  category?: string;
  embedding?: number[];
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    console.log(`Generating embedding for text (first 50 chars): "${text.substring(0, 50)}..."`);
    const result = await embeddingModel.embedContent({
      content: { parts: [{ text }], role: "user" },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });
    const embedding = result.embedding;

    if (embedding && embedding.values) {
      if (embedding.values.length !== EMBEDDING_DIMENSION) {
          console.warn(`WARNING: Expected embedding dimension ${EMBEDDING_DIMENSION} for model ${EMBEDDING_MODEL_NAME} but received ${embedding.values.length}.`);
          // If this happens, the EMBEDDING_DIMENSION constant or your SQL vector(DIMENSION) needs to be adjusted.
      }
      console.log(`Successfully generated embedding. Dimension: ${embedding.values.length}`);
      return embedding.values;
    } else {
      console.error("ERROR: Embedding generation returned no values from the API.");
      return null;
    }
  } catch (error: any) {
    console.error(`ERROR: Failed to generate embedding for text "${text.substring(0, 50)}...":`, error.message);
    // Attempt to log more detailed API error if available
    if (error.cause?.error?.message) { // Structure from some Google API errors
        console.error("Underlying API Error:", error.cause.error.message);
    } else if (error.cause) {
        console.error("Error Cause:", error.cause);
    }
    return null;
  }
}

async function processTable(tableName: 'mental_models' | 'cognitive_biases') {
  console.log(`\n--- Processing table: ${tableName} ---`);

  const { data: records, error: fetchError } = await supabaseAdmin
    .from(tableName)
    .select('id, name, summary, category');

  if (fetchError) {
    console.error(`ERROR: Failed to fetch records from ${tableName}:`, fetchError.message);
    return;
  }

  if (!records || records.length === 0) {
    console.log(`No records found in ${tableName}. Skipping.`);
    return;
  }

  console.log(`Found ${records.length} records in ${tableName}.`);

  for (const record of records as DataRecord[]) {
    if (!record.name || !record.summary) {
        console.warn(`Skipping record ID ${record.id} in ${tableName} due to missing name or summary.`);
        continue;
    }

    const textToEmbed = `Tool Name: ${record.name}\nCategory: ${record.category || 'General'}\nSummary: ${record.summary}`;
    console.log(`\nProcessing record ID ${record.id} from ${tableName}: ${record.name}`);

    const embeddingVector = await generateEmbedding(textToEmbed);

    if (embeddingVector) {
      // Ensure the vector dimension here matches your SQL column, e.g., vector(1536)
      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({ embedding: embeddingVector })
        .eq('id', record.id);

      if (updateError) {
        console.error(`ERROR: Failed to update record ID ${record.id} in ${tableName}:`, updateError.message);
      } else {
        console.log(`Successfully updated record ID ${record.id} in ${tableName} with new embedding.`);
      }
    } else {
        console.warn(`Skipping update for record ID ${record.id} due to embedding generation failure.`);
    }
    // await new Promise(resolve => setTimeout(resolve, 250)); 
  }
  console.log(`--- Finished processing table: ${tableName} ---`);
}

async function main() {
  console.log("Starting embedding generation process (Node.js/tsx version)...");
  console.log("IMPORTANT: Ensure your Supabase tables have an 'embedding' column of type vector(DIMENSION) that matches your chosen EMBEDDING_DIMENSION in this script.");

  // *** ACTION REQUIRED: Set your desired model and dimension here ***
  // If you want to use "gemini-embedding-exp-03-07" for 1536 dimensions:
  // const EMBEDDING_MODEL_NAME = "models/gemini-embedding-exp-03-07"; // This might be the actual ID, confirm with Google documentation
  // const EMBEDDING_DIMENSION = 1536;
  // For now, the script defaults to "models/text-embedding-004" (768 dim) at the top.
  // Update those constants if you are sure about the 1536 model name.

  if (EMBEDDING_MODEL_NAME.includes("exp") && EMBEDDING_DIMENSION !== 1536){
      console.warn(`Warning: Using an experimental model name but dimension is not 1536. Current dimension: ${EMBEDDING_DIMENSION}`);
  }


  await processTable('mental_models');
  await processTable('cognitive_biases');
  console.log("\nEmbedding generation process completed.");
}

main().catch(error => {
  console.error("Unhandled error in main execution:", error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});