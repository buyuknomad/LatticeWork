import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// --- Configuration ---
// Map your .env variable names to the ones the script expects
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY; // Using SUPABASE_SERVICE_KEY as per your .env
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

// Choose your embedding model and its output dimension
// Option 1: Google's standard text-embedding-004 (768 dimensions)
// const EMBEDDING_MODEL_NAME = "text-embedding-004";
// const EMBEDDING_DIMENSION = 768;

// Option 2: The experimental 1536-dimension model you mentioned
const EMBEDDING_MODEL_NAME = "models/embedding-001"; // Official model name for recent text embeddings from Google
const EMBEDDING_DIMENSION = 768; // Standard output for embedding-001, if you meant a 1536 one, ensure correct model name

// If you specifically found a "gemini-embedding-exp-03-07" that outputs 1536,
// and it's available via the API key you have, you could use that:
// const EMBEDDING_MODEL_NAME = "gemini-embedding-exp-03-07"; // Or the specific accessible model ID
// const EMBEDDING_DIMENSION = 1536;


if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error("ERROR: Missing one or more required environment variables.");
  console.error("Please ensure your .env file defines:");
  console.error("  VITE_SUPABASE_URL");
  console.error("  SUPABASE_SERVICE_KEY (for the service_role key)");
  console.error("  VITE_GEMINI_API_KEY");
  process.exit(1);
}

console.log(`Using Supabase URL: ${SUPABASE_URL ? 'Loaded' : 'MISSING!'}`);
console.log(`Using Supabase Service Key: ${SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'MISSING!'}`);
console.log(`Using Gemini API Key: ${GEMINI_API_KEY ? 'Loaded' : 'MISSING!'}`);
console.log(`Using Embedding Model: ${EMBEDDING_MODEL_NAME} (Expected Dimension: ${EMBEDDING_DIMENSION})`);


// Initialize Supabase client with Service Role Key
const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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
          console.warn(`WARNING: Expected embedding dimension ${EMBEDDING_DIMENSION} but received ${embedding.values.length} for model ${EMBEDDING_MODEL_NAME}. Please check model and EMBEDDING_DIMENSION constant.`);
      }
      console.log(`Successfully generated embedding. Dimension: ${embedding.values.length}`);
      return embedding.values;
    } else {
      console.error("ERROR: Embedding generation returned no values.");
      return null;
    }
  } catch (error: any) {
    console.error(`ERROR: Failed to generate embedding for text "${text.substring(0, 50)}...":`, error.message);
    if (error.cause) {
        console.error("Error Cause:", error.cause);
    }
    return null;
  }
}

async function processTable(tableName: 'mental_models' | 'cognitive_biases') {
  console.log(`\n--- Processing table: ${tableName} ---`);

  const { data: records, error: fetchError } = await supabaseAdmin
    .from(tableName)
    .select('id, name, summary, category'); // Adjust if your columns are named differently

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
    // Ensure essential fields are present
    if (!record.name || !record.summary) {
        console.warn(`Skipping record ID ${record.id} in ${tableName} due to missing name or summary.`);
        continue;
    }

    const textToEmbed = `Tool Name: ${record.name}\nCategory: ${record.category || 'General'}\nSummary: ${record.summary}`;
    console.log(`\nProcessing record ID ${record.id} from ${tableName}: ${record.name}`);

    const embeddingVector = await generateEmbedding(textToEmbed);

    if (embeddingVector) {
      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update({ embedding: embeddingVector }) // Ensure your column is named 'embedding'
        .eq('id', record.id);

      if (updateError) {
        console.error(`ERROR: Failed to update record ID ${record.id} in ${tableName}:`, updateError.message);
      } else {
        console.log(`Successfully updated record ID ${record.id} in ${tableName} with new embedding.`);
      }
    } else {
        console.warn(`Skipping update for record ID ${record.id} due to embedding generation failure.`);
    }
    // Optional: Add a small delay to respect API rate limits if any
    // await new Promise(resolve => setTimeout(resolve, 250)); // 250ms delay
  }
  console.log(`--- Finished processing table: ${tableName} ---`);
}

async function main() {
  console.log("Starting embedding generation process (Node.js/tsx version)...");
  console.log("IMPORTANT: Ensure your Supabase tables have an 'embedding' column of type vector(DIMENSION) that matches your chosen EMBEDDING_DIMENSION below.");

  // Confirm chosen model and dimension:
  // If you decide on a 1536 dimension model like "gemini-embedding-exp-03-07" (if accessible and stable),
  // set EMBEDDING_MODEL_NAME and EMBEDDING_DIMENSION accordingly at the top of this script.
  // For now, using Google's standard "models/embedding-001" which is 768-dim.
  // If you use a different model, update EMBEDDING_MODEL_NAME and EMBEDDING_DIMENSION.

  if (EMBEDDING_MODEL_NAME === "gemini-embedding-exp-03-07" && EMBEDDING_DIMENSION !== 1536) {
    console.warn("Warning: EMBEDDING_MODEL_NAME is 'gemini-embedding-exp-03-07' but EMBEDDING_DIMENSION is not 1536.");
  }
  if (EMBEDDING_MODEL_NAME === "models/embedding-001" && EMBEDDING_DIMENSION !== 768) {
     console.warn("Warning: EMBEDDING_MODEL_NAME is 'models/embedding-001' but EMBEDDING_DIMENSION is not 768.");
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