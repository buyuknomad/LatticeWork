import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType, GenerativeModel, EmbeddingResult } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path'; // Not strictly used in this version, but good for path manipulation if needed
import * as dotenv from 'dotenv';

// Load environment variables from .env file in the project root
dotenv.config();

// --- Configuration ---
interface BackfillConfig {
  embeddingModelId: string;
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string; // Changed from supabaseAnonKey
  jsonFilePath: string;
  supabaseTableName: string; // Will need to run script per table or adapt
  targetEmbeddingDimensionality: number; // The dimension you want and your DB is configured for
  delayBetweenRequestsMs: number; // Delay between individual embedding requests
  maxRetries: number;
  baseRetryDelayMs: number;
  maxConcurrentProcesses: number; // How many models to process "concurrently" (Promise.all)
  cachePath: string;
  progressPath: string;
  // New: Specify which text fields from JSON to embed and which Supabase columns to store them in
  embeddingFields: Array<{ jsonField: keyof MentalModelData; supabaseColumn: string; title?: string }>;
}

// Default configuration values
const config: BackfillConfig = {
  embeddingModelId: process.env.EMBEDDING_MODEL_ID || "gemini-embedding-exp-03-07", // Your target model
  geminiApiKey: process.env.VITE_GEMINI_API_KEY || '',
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '', // IMPORTANT: Use Service Role Key
  jsonFilePath: process.env.JSON_FILE_PATH || '/home/project/src/supabase/st6.json', // Default path to your JSON
  supabaseTableName: process.env.SUPABASE_TABLE_NAME || 'mental_models', // Change as needed or parameterize
  targetEmbeddingDimensionality: parseInt(process.env.EMBEDDING_DIMENSIONALITY || '1536', 10),
  delayBetweenRequestsMs: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '1000', 10), // 1 second default between API calls
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  baseRetryDelayMs: parseInt(process.env.BASE_RETRY_DELAY_MS || '5000', 10),
  maxConcurrentProcesses: parseInt(process.env.MAX_CONCURRENT_PROCESSES || '3', 10),
  cachePath: process.env.CACHE_PATH || './embedding_cache.json',
  progressPath: process.env.PROGRESS_PATH || './embedding_backfill_progress.json',
  embeddingFields: [ // Configure which fields to embed
    { jsonField: 'summary', supabaseColumn: 'embedding_summary', title: 'Summary' },
    { jsonField: 'detailed_description', supabaseColumn: 'embedding_description', title: 'Detailed Description' }
    // Add more fields here if needed, e.g., for a combined embedding:
    // { jsonField: 'combined_text', supabaseColumn: 'embedding_combined', title: 'Combined Content'}
  ]
};

// Validate configuration
function validateConfig(cfg: BackfillConfig): void {
  const requiredFields: (keyof Pick<BackfillConfig, 'geminiApiKey' | 'supabaseUrl' | 'supabaseServiceKey'>)[] = ['geminiApiKey', 'supabaseUrl', 'supabaseServiceKey'];
  const missingFields = requiredFields.filter(field => !cfg[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration from .env or defaults: ${missingFields.join(', ')}`);
  }

  if (!fs.existsSync(cfg.jsonFilePath)) {
    throw new Error(`JSON file does not exist at the configured path: ${cfg.jsonFilePath}`);
  }
  console.log("Configuration validated successfully.");
}


// --- Types ---
// Simplified version of your MentalModel, focusing on what's needed for embedding
interface MentalModelData {
  model_id: string; // Assuming this is the primary key in your JSON and Supabase table
  name: string;
  summary?: string;
  detailed_description?: string;
  // Add other fields from your JSON that might be part of textToEmbed
  [key: string]: any; // Allow other properties
}

interface ProcessingProgress {
  lastSuccessfullyProcessedModelId: string | null;
  processedModelIds: string[]; // IDs of models successfully processed AND updated in DB
  failedModelIds: string[];   // IDs of models that failed after retries
  lastRanAt: string;
  totalModelsInJson: number;
}

interface EmbeddingCacheEntry {
  embedding: number[];
  generatedAt: string;
  modelUsed: string;
  textSample: string; // Store a snippet of the text that was embedded
}
interface EmbeddingCache {
  [cacheKey: string]: EmbeddingCacheEntry;
}

// --- Initialize Clients ---
let genAI: GoogleGenerativeAI;
let embeddingModelGen: GenerativeModel;
let supabase: SupabaseClient;

function initializeClients() {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    embeddingModelGen = genAI.getGenerativeModel({ model: config.embeddingModelId });
    supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
    console.log(`Clients initialized. Embedding Model: ${config.embeddingModelId}`);
}


// --- Utility Functions ---
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

class PersistentCache {
  private cache: EmbeddingCache = {};
  private cachePath: string;

  constructor(cachePath: string) {
    this.cachePath = cachePath;
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(this.cachePath)) {
        const data = fs.readFileSync(this.cachePath, 'utf-8');
        this.cache = JSON.parse(data);
        console.log(`Loaded cache with ${Object.keys(this.cache).length} entries from ${this.cachePath}`);
      } else {
        console.log("No existing cache file found. Starting with an empty cache.");
      }
    } catch (error: any) {
      console.error('Error loading cache:', error.message);
      this.cache = {};
    }
  }

  private saveCache(): void {
    try {
      fs.writeFileSync(this.cachePath, JSON.stringify(this.cache, null, 2));
    } catch (error: any) {
      console.error('Error saving cache:', error.message);
    }
  }

  get(textToEmbed: string, modelIdForCache: string, fieldName: string): number[] | undefined {
    const cacheKey = this.generateCacheKey(textToEmbed, modelIdForCache, fieldName);
    const entry = this.cache[cacheKey];
    if (entry && entry.modelUsed === config.embeddingModelId) { // Ensure cache is for the same model
      // Optional: Add TTL for cache entries if desired
      // const age = Date.now() - new Date(entry.generatedAt).getTime();
      // if (age < 30 * 24 * 60 * 60 * 1000) { // 30 days
        return entry.embedding;
      // }
    }
    return undefined;
  }

  set(textToEmbed: string, modelIdForCache: string, fieldName: string, embedding: number[]): void {
    const cacheKey = this.generateCacheKey(textToEmbed, modelIdForCache, fieldName);
    this.cache[cacheKey] = {
      embedding,
      generatedAt: new Date().toISOString(),
      modelUsed: config.embeddingModelId,
      textSample: textToEmbed.substring(0, 100) // Store a sample for easier cache inspection
    };
    this.saveCache(); // Save immediately or batch saves for performance
  }

  private generateCacheKey(text: string, modelId: string, fieldName: string): string {
    // Simple cache key; for very long texts, consider hashing the text
    return `${modelId}_${fieldName}_${config.embeddingModelId}_${text.length}_${text.substring(0,50)}_${text.substring(text.length-50)}`;
  }
}

class ProgressTracker {
  private progress: ProcessingProgress;
  private progressPath: string;

  constructor(progressPath: string) {
    this.progressPath = progressPath;
    this.loadProgress();
  }

  private loadProgress(): void {
    const defaultProgress: ProcessingProgress = {
      lastSuccessfullyProcessedModelId: null,
      processedModelIds: [],
      failedModelIds: [],
      lastRanAt: new Date().toISOString(),
      totalModelsInJson: 0
    };
    try {
      if (fs.existsSync(this.progressPath)) {
        const data = fs.readFileSync(this.progressPath, 'utf-8');
        this.progress = JSON.parse(data);
        console.log(`Loaded progress from ${this.progressPath} - Processed: ${this.progress.processedModelIds.length}, Failed: ${this.progress.failedModelIds.length}, Last processed ID: ${this.progress.lastSuccessfullyProcessedModelId}`);
      } else {
        this.progress = defaultProgress;
        console.log("No existing progress file found. Starting fresh.");
      }
    } catch (error: any) {
      console.error('Error loading progress file, starting fresh:', error.message);
      this.progress = defaultProgress;
    }
  }

  saveProgress(): void { // Made public to allow saving total models count initially
    try {
      this.progress.lastRanAt = new Date().toISOString();
      fs.writeFileSync(this.progressPath, JSON.stringify(this.progress, null, 2));
    } catch (error: any) {
      console.error('Error saving progress:', error.message);
    }
  }

  markProcessed(modelId: string): void {
    if (!this.progress.processedModelIds.includes(modelId)) {
      this.progress.processedModelIds.push(modelId);
    }
    // Remove from failed if it was there
    this.progress.failedModelIds = this.progress.failedModelIds.filter(id => id !== modelId);
    this.progress.lastSuccessfullyProcessedModelId = modelId;
    this.saveProgress();
  }

  markFailed(modelId: string): void {
    if (!this.progress.failedModelIds.includes(modelId) && !this.progress.processedModelIds.includes(modelId)) {
      this.progress.failedModelIds.push(modelId);
      this.saveProgress();
    }
  }

  isProcessed(modelId: string): boolean {
    return this.progress.processedModelIds.includes(modelId);
  }
  
  isFailed(modelId: string): boolean {
      return this.progress.failedModelIds.includes(modelId);
  }

  setTotalModels(count: number): void {
    this.progress.totalModelsInJson = count;
    this.saveProgress();
  }

  getProgressStats(): string {
    return `Progress: ${this.progress.processedModelIds.length} processed, ${this.progress.failedModelIds.length} failed (out of ${this.progress.totalModelsInJson || 'N/A'} total). Last success: ${this.progress.lastSuccessfullyProcessedModelId || 'None'}`;
  }

  getUnprocessedModels(allModels: MentalModelData[]): MentalModelData[] {
    return allModels.filter(model => !this.isProcessed(model.model_id) && !this.isFailed(model.model_id));
  }

  reset(): void {
    this.progress = {
        lastSuccessfullyProcessedModelId: null,
        processedModelIds: [],
        failedModelIds: [],
        lastRanAt: new Date().toISOString(),
        totalModelsInJson: this.progress.totalModelsInJson // Retain total count if available
    };
    this.saveProgress();
    console.log("Progress tracker has been reset.");
  }
}

const embeddingCache = new PersistentCache(config.cachePath);
const progressTracker = new ProgressTracker(config.progressPath);


async function generateEmbeddingWithRetries(
    text: string,
    modelIdForLog: string,
    fieldName: string
): Promise<number[] | null> {
    if (!text || text.trim() === "") {
        console.log(`Skipping embedding for ${fieldName} of ${modelIdForLog} as text is empty or whitespace.`);
        return null;
    }

    const cachedEmbedding = embeddingCache.get(text, modelIdForLog, fieldName);
    if (cachedEmbedding) {
        console.log(`Using cached embedding for ${fieldName} of ${modelIdForLog}`);
        return cachedEmbedding;
    }

    let retries = 0;
    while (retries <= config.maxRetries) {
        try {
            console.log(`Attempt ${retries + 1}/${config.maxRetries + 1}: Generating ${fieldName} embedding for ${modelIdForLog} (Text starts: "${text.substring(0, 50)}...")`);
            
            const result: EmbeddingResult = await embeddingModelGen.embedContent({
                content: { parts: [{ text }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT, // Appropriate for embedding documents for later retrieval
                outputDimensionality: config.targetEmbeddingDimensionality, // Requesting specific dimension
            });

            const embeddingValues = result.embedding?.values;

            if (embeddingValues) {
                if (embeddingValues.length !== config.targetEmbeddingDimensionality) {
                    console.warn(`WARNING for ${modelIdForLog}, field ${fieldName}: Embedding dimension mismatch. Expected ${config.targetEmbeddingDimensionality}, Got ${embeddingValues.length}. Model: ${config.embeddingModelId}`);
                    // Depending on strictness, you might throw an error or try to handle (e.g. pad/truncate, though not recommended)
                    // For now, we'll still cache and return it, but the warning is important.
                }
                console.log(`Successfully generated ${fieldName} embedding for ${modelIdForLog}. Dimension: ${embeddingValues.length}.`);
                embeddingCache.set(text, modelIdForLog, fieldName, embeddingValues);
                return embeddingValues;
            } else {
                console.warn(`Warning: ${fieldName} embedding generation returned no values for ${modelIdForLog}. Full response: ${JSON.stringify(result)}`);
                // This case might indicate an issue with the response structure or an empty embedding.
                // Retry if appropriate, or mark as failed after retries.
                if (retries >= config.maxRetries) {
                    console.error(`Failed to get embedding values for ${fieldName} of ${modelIdForLog} after max retries (no values in response).`);
                    return null; 
                }
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Unknown error';
            const status = error.status || error.cause?.error?.status; // Attempt to get a status code

            console.error(`Error generating ${fieldName} embedding for ${modelIdForLog} (Attempt ${retries + 1}): ${errorMessage}`);
            
            // Check for rate limiting or other retryable errors
            const isRateLimitError = status === 429 || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('rate limit');

            if (isRateLimitError && retries < config.maxRetries) {
                const currentDelay = config.baseRetryDelayMs * Math.pow(2, retries);
                console.log(`Rate limit hit. Retrying in ${currentDelay / 1000}s...`);
                await delay(currentDelay);
                retries++;
                continue; // Continue to next retry attempt
            } else if (retries >= config.maxRetries) {
                console.error(`Max retries reached for ${fieldName} of ${modelIdForLog}. Last error: ${errorMessage}`);
                return null; // Failed after all retries
            } else {
                // For other types of errors, or if it's the last retry
                console.error(`Non-retryable error or final attempt failed for ${fieldName} of ${modelIdForLog}. Error: ${errorMessage}`);
                return null; // Failed
            }
        }
        // If we fall through here, it's an unexpected state, likely an empty embedding that wasn't an error.
        // This path should ideally not be hit if API errors or empty values are handled above.
        retries++; 
        if (retries <= config.maxRetries) {
            const currentDelay = config.baseRetryDelayMs * Math.pow(2, retries -1); // Use delay for next attempt
            console.log(`Unexpected empty embedding, retrying in ${currentDelay / 1000}s...`);
            await delay(currentDelay);
        }
    }
    console.error(`Failed to generate embedding for ${fieldName} of ${modelIdForLog} after all retries and checks.`);
    return null;
}


async function processModel(modelData: MentalModelData, supabaseTableName: string): Promise<boolean> {
    const { model_id, name } = modelData;
    console.log(`\nProcessing item: ${name} (ID: ${model_id}) for table ${supabaseTableName}`);

    if (progressTracker.isProcessed(model_id)) {
        console.log(`ID ${model_id} (${name}) already processed successfully. Skipping.`);
        return true;
    }
    if (progressTracker.isFailed(model_id)) {
        console.log(`ID ${model_id} (${name}) was marked as failed in previous runs. Skipping. (Use --reset-progress to retry failed items)`);
        return false;
    }
    
    const updates: { [key: string]: number[] } = {};
    let atLeastOneEmbeddingGenerated = false;

    for (const fieldConfig of config.embeddingFields) {
        const textToEmbed = modelData[fieldConfig.jsonField] as string | undefined;
        const supabaseColumn = fieldConfig.supabaseColumn;

        if (textToEmbed && textToEmbed.trim() !== "") {
            console.log(`Attempting to generate embedding for field '${fieldConfig.jsonField}' -> column '${supabaseColumn}'`);
            const embeddingVector = await generateEmbeddingWithRetries(textToEmbed, model_id, fieldConfig.jsonField);
            if (embeddingVector) {
                updates[supabaseColumn] = embeddingVector;
                atLeastOneEmbeddingGenerated = true;
            } else {
                console.warn(`Failed to generate embedding for field '${fieldConfig.jsonField}' for model ID ${model_id}. This field will not be updated.`);
                // No need to mark the whole model as failed yet, other fields might succeed.
            }
        } else {
            console.log(`Field '${fieldConfig.jsonField}' is empty for model ID ${model_id}. Skipping embedding for this field.`);
        }
        // Small delay between embedding different fields of the same item
        if (config.embeddingFields.length > 1) await delay(config.delayBetweenRequestsMs / 2 || 500);
    }

    if (atLeastOneEmbeddingGenerated && Object.keys(updates).length > 0) {
        console.log(`Updating Supabase for ID ${model_id} (${name}) with ${Object.keys(updates).length} new embedding(s)...`);
        const { error: updateError } = await supabase
            .from(supabaseTableName)
            .update(updates)
            .eq('model_id', model_id); // Ensure your primary key column is 'model_id'

        if (updateError) {
            console.error(`ERROR: Failed to update Supabase for ID ${model_id} (${name}): ${updateError.message}`);
            progressTracker.markFailed(model_id);
            return false;
        } else {
            console.log(`Successfully updated Supabase for ID ${model_id} (${name}).`);
            progressTracker.markProcessed(model_id);
            return true;
        }
    } else if (!atLeastOneEmbeddingGenerated && Object.keys(updates).length === 0) {
        console.log(`No new embeddings were generated for ID ${model_id} (${name}). Marking as processed if no prior failure.`);
        if(!progressTracker.isFailed(model_id)) progressTracker.markProcessed(model_id); // If nothing to do, mark as processed to avoid retrying
        return true; 
    } else {
         console.warn(`No embeddings were generated or updated for ID ${model_id} (${name}). Marking as failed.`);
         progressTracker.markFailed(model_id);
         return false;
    }
}


async function main() {
    try {
        validateConfig(config);
        initializeClients(); // Initialize after config validation
        console.log(`\n=== Embedding Backfill Script v1.1 ===`);
        console.log(`Target Table: ${config.supabaseTableName}`);
        console.log(`Embedding Model: ${config.embeddingModelId}`);
        console.log(`Target Dimension: ${config.targetEmbeddingDimensionality}`);
        console.log(`Input JSON: ${config.jsonFilePath}`);
        console.log(`Max Concurrent Processes: ${config.maxConcurrentProcesses}`);
        console.log(`Progress will be saved to: ${config.progressPath}`);
        console.log(`Embeddings will be cached in: ${config.cachePath}`);
        console.log("---------------------------------------\n");

        const fileContent = fs.readFileSync(config.jsonFilePath, 'utf-8');
        const allModelsInJson: MentalModelData[] = JSON.parse(fileContent);

        if (!Array.isArray(allModelsInJson)) {
            throw new Error("JSON file content is not an array.");
        }
        progressTracker.setTotalModels(allModelsInJson.length); // Save total count
        console.log(`Found ${allModelsInJson.length} total models in ${config.jsonFilePath}.`);

        const modelsToProcess = progressTracker.getUnprocessedModels(allModelsInJson);

        if (modelsToProcess.length === 0) {
            console.log("All models have already been processed or marked as failed. Check progress file or use --reset-progress.");
            console.log(progressTracker.getProgressStats());
            return;
        }

        console.log(`Attempting to process ${modelsToProcess.length} new or previously unattempted models.`);
        
        let successfulUpdates = 0;
        let failedUpdates = 0;

        for (let i = 0; i < modelsToProcess.length; i += config.maxConcurrentProcesses) {
            const batch = modelsToProcess.slice(i, i + config.maxConcurrentProcesses);
            console.log(`\nProcessing batch ${Math.floor(i / config.maxConcurrentProcesses) + 1}/${Math.ceil(modelsToProcess.length / config.maxConcurrentProcesses)} (Size: ${batch.length})`);
            
            const batchPromises = batch.map(model => 
                processModel(model, config.supabaseTableName)
                .then(success => {
                    if (success) successfulUpdates++; else failedUpdates++;
                })
                .catch(err => {
                    console.error(`Unhandled error in processModel for ${model.model_id}: ${err.message}`);
                    progressTracker.markFailed(model.model_id);
                    failedUpdates++;
                })
            );
            
            await Promise.all(batchPromises);

            console.log(`Batch complete. Current stats: ${progressTracker.getProgressStats()}`);
            if (i + config.maxConcurrentProcesses < modelsToProcess.length) {
                console.log(`Waiting ${config.delayBetweenRequestsMs / 1000}s before next batch to respect rate limits...`);
                await delay(config.delayBetweenRequestsMs);
            }
        }

        console.log('\n=== Backfill Run Complete ===');
        console.log(progressTracker.getProgressStats());
        console.log(`Models attempted in this run: ${modelsToProcess.length}`);
        console.log(`Successful updates in this run: ${successfulUpdates}`);
        console.log(`Failed attempts in this run: ${failedUpdates}`);

        const finalProgress = progressTracker.getProgress();
        if (finalProgress.failedModelIds.length > 0) {
            console.warn('\n--- Models Marked as Failed (require attention or --reset-progress to retry) ---');
            finalProgress.failedModelIds.forEach(id => console.warn(`- ${id}`));
        }

    } catch (error: any) {
        console.error('\nCRITICAL ERROR in main execution:', error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

// --- Command Line Interface ---
const args = process.argv.slice(2);
if (args.includes('--reset-progress')) {
    try {
        validateConfig(config); // Validate first to get paths
        const tempProgressTracker = new ProgressTracker(config.progressPath); // Use temp for reset
        tempProgressTracker.reset();
        console.log('Progress reset. You can now run the script normally to reprocess all items.');
    } catch(e: any) {
        console.error("Error during progress reset:", e.message);
    }
    process.exit(0);
}

if (args.includes('--reset-cache')) {
    try {
        validateConfig(config); // Validate first to get paths
        if (fs.existsSync(config.cachePath)) {
            fs.unlinkSync(config.cachePath);
            console.log('Embedding cache reset.');
        } else {
            console.log('No embedding cache file found to reset.');
        }
    } catch (e: any) {
        console.error("Error during cache reset:", e.message);
    }
    process.exit(0);
}


// --- Run the Script ---
main();