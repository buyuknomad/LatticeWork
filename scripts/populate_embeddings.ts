import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType, GenerativeModel, EmbeddingResult } from '@google/generative-ai';
import * as fs from 'fs'; // For progress tracking
import * as dotenv from 'dotenv';

// Load environment variables from .env file in the project root
dotenv.config();

// --- Configuration ---
interface ScriptConfig {
  embeddingModelId: string;
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  targetEmbeddingDimensionality: number;
  delayBetweenRequestsMs: number;
  maxRetries: number;
  baseRetryDelayMs: number;
  progressFilePath: string;
  // Fields from Supabase to construct the text for embedding
  textSourceFields: Array<keyof DbRecord>; 
  // Column in Supabase where the embedding will be stored
  embeddingColumnName: string; 
}

// Default configuration values
const config: ScriptConfig = {
  embeddingModelId: process.env.EMBEDDING_MODEL_ID || "gemini-embedding-exp-03-07",
  geminiApiKey: process.env.VITE_GEMINI_API_KEY || '',
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  targetEmbeddingDimensionality: parseInt(process.env.EMBEDDING_DIMENSIONALITY || '1536', 10),
  delayBetweenRequestsMs: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '500', 10), // 0.5 second
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  baseRetryDelayMs: parseInt(process.env.BASE_RETRY_DELAY_MS || '3000', 10), // 3 seconds
  progressFilePath: process.env.PROGRESS_FILE_PATH || './db_embedding_progress.json',
  textSourceFields: ['name', 'category', 'summary'], // Fields from DB to combine for embedding
  embeddingColumnName: 'embedding', // Name of the vector column in your Supabase tables
};

// --- Type Definitions ---
interface DbRecord {
  id: string | number; // Assuming your ID is text or int
  name: string;
  category?: string;
  summary?: string;
  [key: string]: any; // Allow other properties from DB
}

interface ProcessingProgress {
  [tableName: string]: {
    lastSuccessfullyProcessedId: string | number | null;
    processedIds: (string | number)[];
    failedIds: Array<{ id: string | number; error: string }>;
    lastRanAt: string;
    configUsedSnapshot: Pick<ScriptConfig, 'embeddingModelId' | 'targetEmbeddingDimensionality' | 'textSourceFields' | 'embeddingColumnName'>;
  };
}

// --- Global Clients ---
let genAI: GoogleGenerativeAI;
let embeddingApi: GenerativeModel;
let supabase: SupabaseClient;

// --- Utility Functions ---
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

class ProgressTracker {
  private progress: ProcessingProgress = {};
  private progressPath: string;

  constructor(progressPath: string) {
    this.progressPath = progressPath;
    this.loadProgress();
  }

  private getDefaultTableProgress(): ProcessingProgress[string] {
    return {
      lastSuccessfullyProcessedId: null,
      processedIds: [],
      failedIds: [],
      lastRanAt: new Date().toISOString(),
      configUsedSnapshot: {
        embeddingModelId: config.embeddingModelId,
        targetEmbeddingDimensionality: config.targetEmbeddingDimensionality,
        textSourceFields: config.textSourceFields,
        embeddingColumnName: config.embeddingColumnName,
      }
    };
  }

  private loadProgress(): void {
    try {
      if (fs.existsSync(this.progressPath)) {
        const data = fs.readFileSync(this.progressPath, 'utf-8');
        this.progress = JSON.parse(data);
        console.log(`Loaded progress from ${this.progressPath}`);
      } else {
        console.log("No existing progress file found. Starting fresh for each table.");
      }
    } catch (error: any) {
      console.error('Error loading progress file, will start fresh for tables:', error.message);
      this.progress = {};
    }
  }

  private saveProgress(): void {
    try {
      fs.writeFileSync(this.progressPath, JSON.stringify(this.progress, null, 2));
    } catch (error: any) {
      console.error('Error saving progress:', error.message);
    }
  }
  
  getTableProgress(tableName: string): ProcessingProgress[string] {
    if (!this.progress[tableName]) {
      this.progress[tableName] = this.getDefaultTableProgress();
    }
    // Check for config mismatch for this specific table
    const currentConfigSnapshot = {
        embeddingModelId: config.embeddingModelId,
        targetEmbeddingDimensionality: config.targetEmbeddingDimensionality,
        textSourceFields: config.textSourceFields,
        embeddingColumnName: config.embeddingColumnName,
    };
    if (JSON.stringify(this.progress[tableName].configUsedSnapshot) !== JSON.stringify(currentConfigSnapshot)) {
        console.warn(`WARNING: Configuration mismatch for table '${tableName}' between current script and saved progress.`);
        console.warn("Saved progress config:", this.progress[tableName].configUsedSnapshot);
        console.warn("Current script config:", currentConfigSnapshot);
        console.warn(`It's recommended to reset progress for table '${tableName}' or the entire file if critical embedding parameters have changed.`);
    }
    return this.progress[tableName];
  }

  markProcessed(tableName: string, recordId: string | number): void {
    const tableProgress = this.getTableProgress(tableName);
    if (!tableProgress.processedIds.includes(recordId)) {
      tableProgress.processedIds.push(recordId);
    }
    tableProgress.failedIds = tableProgress.failedIds.filter(item => item.id !== recordId);
    tableProgress.lastSuccessfullyProcessedId = recordId;
    tableProgress.lastRanAt = new Date().toISOString();
    this.saveProgress();
  }

  markFailed(tableName: string, recordId: string | number, errorMsg: string): void {
    const tableProgress = this.getTableProgress(tableName);
    if (!tableProgress.failedIds.some(item => item.id === recordId)) {
      tableProgress.failedIds.push({ id: recordId, error: errorMsg });
    }
    tableProgress.lastRanAt = new Date().toISOString();
    this.saveProgress();
  }

  isProcessed(tableName: string, recordId: string | number): boolean {
    return this.getTableProgress(tableName).processedIds.includes(recordId);
  }
  
  isFailed(tableName: string, recordId: string | number): boolean {
      return this.getTableProgress(tableName).failedIds.some(item => item.id === recordId);
  }

  reset(tableName?: string): void {
    if (tableName && this.progress[tableName]) {
      console.log(`Resetting progress for table: ${tableName}`);
      this.progress[tableName] = this.getDefaultTableProgress();
    } else if (!tableName) {
      console.log('Resetting all progress...');
      this.progress = {};
    } else {
        console.log(`No progress found for table ${tableName} to reset.`);
    }
    this.saveProgress();
  }
}

let progressTracker: ProgressTracker;

async function generateEmbeddingWithRetries(
    text: string,
    recordIdForLog: string | number,
    fieldNameForLog: string // e.g., "Combined Text"
): Promise<number[] | null> {
    if (!text || text.trim() === "") {
        console.warn(`Skipping embedding for ${fieldNameForLog} of record ID ${recordIdForLog} as text is empty.`);
        return null;
    }

    // Caching is omitted for this simpler "from scratch" version, but can be added back if needed.

    let retries = 0;
    while (retries <= config.maxRetries) {
        try {
            console.log(`Attempt ${retries + 1}/${config.maxRetries + 1}: Generating embedding for ${fieldNameForLog} of record ID ${recordIdForLog} (Text starts: "${text.substring(0, 70)}...")`);
            
            const result: EmbeddingResult = await embeddingApi.embedContent({
                content: { parts: [{ text }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                outputDimensionality: config.targetEmbeddingDimensionality,
            });

            const embeddingValues = result.embedding?.values;

            if (embeddingValues) {
                if (embeddingValues.length !== config.targetEmbeddingDimensionality) {
                    const errMsg = `CRITICAL DIMENSION MISMATCH for record ID ${recordIdForLog}: Model ${config.embeddingModelId} returned ${embeddingValues.length} dimensions, but script expected ${config.targetEmbeddingDimensionality}.`;
                    console.error(errMsg);
                    throw new Error(errMsg); // Critical error, stop for this item
                }
                console.log(`Successfully generated embedding for ${recordIdForLog}. Dimension: ${embeddingValues.length}.`);
                return embeddingValues;
            } else {
                console.warn(`Warning: Embedding generation returned no values in API response for record ID ${recordIdForLog}.`);
                if (retries >= config.maxRetries) {
                    console.error(`Failed to get embedding values for ${recordIdForLog} after max retries (API returned no values).`);
                    return null; 
                }
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Unknown API error';
             const status = error.status || error.cause?.error?.status;
            console.error(`Error generating embedding for record ID ${recordIdForLog} (Attempt ${retries + 1}): ${errorMessage}`);
            
            const isRateLimitError = status === 429 || String(errorMessage).includes('RESOURCE_EXHAUSTED') || String(errorMessage).includes('rate limit');

            if (isRateLimitError && retries < config.maxRetries) {
                const currentDelay = config.baseRetryDelayMs * Math.pow(2, retries);
                console.log(`Rate limit or temporary server issue. Retrying in ${currentDelay / 1000}s...`);
                await delay(currentDelay);
                retries++;
                continue; 
            } else {
                console.error(`Failed to generate embedding for ${recordIdForLog} after ${retries + 1} attempts. Last error: ${errorMessage}`);
                return null; 
            }
        }
        // Fallthrough for "no values" without error, retry
        retries++;
        if (retries <= config.maxRetries) {
            const currentDelay = config.baseRetryDelayMs * Math.pow(2, retries - 1);
            console.log(`Retrying due to no embedding values in ${currentDelay / 1000}s...`);
            await delay(currentDelay);
        }
    }
    console.error(`Ultimately failed to generate embedding for record ID ${recordIdForLog} after all retries.`);
    return null;
}

async function processTable(tableName: 'mental_models' | 'cognitive_biases') {
    console.log(`\n--- Starting Backfill for Table: ${tableName} ---`);
    const tableProgress = progressTracker.getTableProgress(tableName);

    let lastProcessedId = tableProgress.lastSuccessfullyProcessedId;
    let offset = tableProgress.processedIds.length; // Start offset based on already processed items
    const batchSize = 50; // How many records to fetch from Supabase at a time

    while (true) {
        console.log(`Workspaceing records from ${tableName} starting after ID: ${lastProcessedId || 'beginning'}, offset: ${offset}, limit: ${batchSize}`);
        
        // Fetch records that haven't been processed or failed, ordering by ID
        // This query needs to be robust to pagination if not using ID-based cursors
        // A simpler approach for now: fetch in batches by ID if IDs are sequential numbers.
        // If IDs are UUIDs or non-sequential, a purely offset-based approach might miss items if new data is inserted during the script.
        // For simplicity, assuming IDs are somewhat ordered for this basic paginated fetch.
        // A more robust way is to fetch IDs not in processedIds and failedIds.
        
        const query = supabase
            .from(tableName)
            .select('id, name, category, summary') // Adjust fields as needed
            .order('id', { ascending: true })
            .range(offset, offset + batchSize - 1);

        const { data: records, error: fetchError } = await query;

        if (fetchError) {
            console.error(`ERROR fetching records from ${tableName} (offset ${offset}):`, fetchError.message);
            await delay(config.baseRetryDelayMs); // Wait before retrying fetch
            continue;
        }

        if (!records || records.length === 0) {
            console.log(`No more records to process in ${tableName} from offset ${offset}.`);
            break;
        }

        console.log(`Workspaceed ${records.length} records for this batch from ${tableName}.`);

        for (const record of records as DbRecord[]) {
            if (progressTracker.isProcessed(tableName, record.id) || progressTracker.isFailed(tableName, record.id)) {
                console.log(`Skipping ID ${record.id} (${record.name}) as it's already processed or marked failed.`);
                offset++; // Increment offset even if skipped to maintain correct range for next fetch
                continue;
            }

            let textToEmbed = "";
            for (const field of config.textSourceFields) {
                if (record[field] && typeof record[field] === 'string') {
                    textToEmbed += `${field.charAt(0).toUpperCase() + field.slice(1)}: ${record[field]}\n`;
                }
            }
            textToEmbed = textToEmbed.trim();

            if (!textToEmbed) {
                console.warn(`No text content to embed for record ID ${record.id} (${record.name}). Marking as failed.`);
                progressTracker.markFailed(tableName, record.id, "No text content to embed");
                offset++;
                continue;
            }
            
            const embeddingVector = await generateEmbeddingWithRetries(textToEmbed, record.id, "Combined Text");

            if (embeddingVector) {
                const updatePayload: { [key: string]: any } = {};
                updatePayload[config.embeddingColumnName] = embeddingVector;

                const { error: updateError } = await supabase
                    .from(tableName)
                    .update(updatePayload)
                    .eq('id', record.id);

                if (updateError) {
                    console.error(`ERROR updating Supabase for ID ${record.id} in ${tableName}: ${updateError.message}`);
                    progressTracker.markFailed(tableName, record.id, updateError.message);
                } else {
                    console.log(`Successfully generated and stored embedding for ID ${record.id} (${record.name}) in ${tableName}.`);
                    progressTracker.markProcessed(tableName, record.id);
                    lastProcessedId = record.id; // For the next batch query, if using ID-based cursoring
                }
            } else {
                console.warn(`Failed to generate embedding for ID ${record.id} (${record.name}) after retries.`);
                progressTracker.markFailed(tableName, record.id, "Embedding generation failed after retries");
            }
            offset++; // Increment offset for the next record in the overall set
            await delay(config.delayBetweenRequestsMs); // Delay between processing each record
        }
        
        // If we fetched fewer records than batchSize, we've likely reached the end
        if (records.length < batchSize) {
            console.log(`Processed the last batch for ${tableName}.`);
            break;
        }
    }
    console.log(`--- Finished Backfill for Table: ${tableName} ---`);
    console.log(progressTracker.getProgressStats());
}


async function main() {
    try {
        validateConfig(config);
        initializeClients(); // Initialize clients after config is validated

        progressTracker = new ProgressTracker(config.progressFilePath);

        console.log(`\n=== Database Embedding Backfill Script (v1.0-node) ===`);
        console.log(`Target Supabase Table: ${config.supabaseTableName}`);
        console.log(`Embedding Model: ${config.embeddingModelId}`);
        console.log(`Target Dimension: ${config.targetEmbeddingDimensionality}`);
        console.log(`Embedding Column: ${config.embeddingColumnName}`);
        console.log(`Text sources for embedding: ${config.textSourceFields.join(', ')}`);
        console.log(`Progress file: ${config.progressFilePath}`);
        console.log("-----------------------------------------------------\n");

        // Determine which table to process based on config or arguments
        const tableToProcess = config.supabaseTableName as 'mental_models' | 'cognitive_biases';
        if (tableToProcess !== 'mental_models' && tableToProcess !== 'cognitive_biases') {
            throw new Error(`Invalid SUPABASE_TABLE_NAME: "${tableToProcess}". Must be 'mental_models' or 'cognitive_biases'.`);
        }
        
        await processTable(tableToProcess);
        
        // To process the other table, you would typically change SUPABASE_TABLE_NAME in .env and rerun.
        // Or adapt this script to loop through a list of tables.
        console.log(`\nTo process the other table, update SUPABASE_TABLE_NAME in your .env and re-run.`);


    } catch (error: any) {
        console.error('\n--- CRITICAL SCRIPT ERROR ---');
        console.error('Error:', error.message);
        if (error.stack) console.error("Stack:", error.stack);
        process.exit(1);
    }
}

// --- Command Line Interface Options ---
const args = process.argv.slice(2);
const tableArg = args.find(arg => arg.startsWith('--table='))?.split('=')[1];
const resetArg = args.includes('--reset-progress');
const resetFailedArg = args.includes('--reset-failed');

if (resetArg && tableArg) {
    progressTracker = new ProgressTracker(config.progressFilePath); // Initialize for reset
    console.log(`Resetting progress for table: ${tableArg}...`);
    progressTracker.reset(tableArg);
    process.exit(0);
} else if (resetArg) {
    progressTracker = new ProgressTracker(config.progressFilePath);
    console.log('Resetting all progress in progress file...');
    progressTracker.reset();
    process.exit(0);
}

if (resetFailedArg && tableArg) {
    progressTracker = new ProgressTracker(config.progressFilePath);
    console.log(`Clearing failed IDs for table: ${tableArg}...`);
    const tableProgress = progressTracker.getTableProgress(tableArg);
    tableProgress.failedIds = [];
    progressTracker.saveProgress(); // Save the modified progress
    console.log(`Failed IDs cleared for ${tableArg}. They will be re-attempted on the next run.`);
    process.exit(0);
} else if (resetFailedArg) {
     console.log("To reset failed progress, please also specify --table=<table_name>");
     process.exit(1);
}


// --- Run the Main Script ---
main();