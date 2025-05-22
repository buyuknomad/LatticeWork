import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI, TaskType } from 'https://esm.sh/@google/generative-ai';

// --- Configuration ---
// IMPORTANT: Use environment variables for sensitive keys, especially the service role key.
// For Deno, you might load these from a .env file or set them directly in your run command.
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY"); // Use Service Role Key for admin operations
const GEMINI_API_KEY = Deno.env.get("VITE_GEMINI_API_KEY");

const EMBEDDING_MODEL_NAME = "text-embedding-004"; // Google's embedding model

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error("ERROR: Missing one or more required environment variables (VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, VITE_GEMINI_API_KEY).");
  Deno.exit(1);
}

// Initialize Supabase client with Service Role Key for admin access
const supabaseAdmin: SupabaseClient = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false, // Optional: prevent saving session to localStorage
    autoRefreshToken: false, // Optional: prevent auto-refreshing token
  }
});

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(VITE_GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL_NAME });

interface DataRecord {
  id: string | number; // Assuming your ID is string or number
  name: string;
  summary: string;
  category?: string; // Optional, but good for creating combined text
  // Add any other fields you might want to include in the text-to-embed
  embedding?: number[]; // To store the fetched or generated embedding
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    console.log(`Generating embedding for text (first 50 chars): "${text.substring(0, 50)}..."`);
    const result = await embeddingModel.embedContent({
      content: { parts: [{ text }], role: "user" }, // Content to embed
      taskType: TaskType.RETRIEVAL_DOCUMENT, // or SEMANTIC_SIMILARITY, RETRIEVAL_QUERY etc.
      // title: "Optional title for the document" // if applicable
    });
    const embedding = result.embedding;
    if (embedding && embedding.values) {
      console.log(`Successfully generated embedding. Dimension: ${embedding.values.length}`);
      return embedding.values;
    } else {
      console.error("ERROR: Embedding generation returned no values.");
      return null;
    }
  } catch (error) {
    console.error(`ERROR: Failed to generate embedding for text "${text.substring(0, 50)}...":`, error.message);
    if (error.response?.data) {
        console.error("Gemini API Error Details:", error.response.data);
    }
    return null;
  }
}

async function processTable(tableName: 'mental_models' | 'cognitive_biases') {
  console.log(`\n--- Processing table: ${tableName} ---`);

  // 1. Fetch all records from the table
  const { data: records, error: fetchError } = await supabaseAdmin
    .from(tableName)
    .select('id, name, summary, category'); // Adjust columns as needed

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
    // 2. Create combined text for embedding
    // You can customize this. Including name, summary, and category is a good start.
    const textToEmbed = `Model Name: ${record.name}\nCategory: ${record.category || 'N/A'}\nSummary: ${record.summary}`;
    // const textToEmbed = `${record.name} - ${record.summary}`; // Simpler alternative

    console.log(`\nProcessing record ID ${record.id} from ${tableName}: ${record.name}`);

    // 3. Generate embedding
    const embeddingVector = await generateEmbedding(textToEmbed);

    if (embeddingVector) {
      // 4. Update the record with the new embedding
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
    // Optional: Add a small delay to avoid hitting API rate limits if processing many records rapidly
    // await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
  }
  console.log(`--- Finished processing table: ${tableName} ---`);
}

async function main() {
  console.log("Starting embedding generation process...");
  await processTable('mental_models');
  await processTable('cognitive_biases');
  console.log("\nEmbedding generation process completed.");
}

// Run the main function
main().catch(console.error);