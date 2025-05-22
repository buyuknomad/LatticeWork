import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType, GenerativeModel, EmbeddingResult } from '@google/generative-ai';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file in the project root
dotenv.config();

// --- Configuration Interface ---
interface ScriptConfig {
  embeddingModelId: string;
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  targetEmbeddingDimensionality: number;
  tablesToProcess: Array<{ tableName: 'mental_models' | 'cognitive_biases'; textSourceFields: Array<keyof DbRecord>; idColumn: string; embeddingColumn: string }>;
  delayBetweenRequestsMs: number;
  maxRetries: number;
  baseRetryDelayMs: number;
  batchSize: number; // How many records to fetch from Supabase at a time
  progressFilePath: string;
}

// --- Type Definitions ---
interface DbRecord {
  id: string | number; // Assuming your ID is text or int (adjust if it's always one type)
  name?: string;
  category?: string;
  summary?: string;
  // Add other fields if they are part of textSourceFields
  [key: string]: any; 
}

interface TableProgress {
  lastSuccessfullyProcessedOffset: number; // Use offset for robust pagination
  processedRecordIds: (string | number)[];
  failedRecordIds: Array<{ id: string | number; error: string; attempts: number }>;
  lastRanAt: string;
  configUsedSnapshot: Pick<ScriptConfig, 'embeddingModelId' | 'targetEmbeddingDimensionality'> & { textSourceFields: Array<keyof DbRecord>; embeddingColumnName: string }; // Per-table config snapshot
}

interface ProcessingProgress {
  [tableName: string]: TableProgress;
}

// --- Default Configuration Values ---
const config: ScriptConfig = {
  embeddingModelId: process.env.EMBEDDING_MODEL_ID || "gemini-embedding-exp-03-07",
  geminiApiKey: process.env.VITE_GEMINI_API_KEY || '',
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  targetEmbeddingDimensionality: parseInt(process.env.EMBEDDING_DIMENSIONALITY || '1536', 10),
  tablesToProcess: [
    { 
      tableName: 'mental_models', 
      textSourceFields: ['name', 'category', 'summary'], 
      idColumn: 'id', // Assuming 'id' is the primary key for mental_models
      embeddingColumn: 'embedding' 
    },
    { 
      tableName: 'cognitive_biases', 
      textSourceFields: ['name', 'category', 'summary'], 
      idColumn: 'id', // Assuming 'id' is the primary key for cognitive_biases
      embeddingColumn: 'embedding'
    }
  ],
  delayBetweenRequestsMs: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '500', 10), // 0.5 second
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  baseRetryDelayMs: parseInt(process.env.BASE_RETRY_DELAY_MS || '3000', 10),
  batchSize: parseInt(process.env.DB_BATCH_SIZE || '50', 10),
  progressFilePath: process.env.PROGRESS_FILE_PATH || './db_embedding_progress.json',
};

// --- Global Clients (initialized in main) ---
let genAI: GoogleGenerativeAI;
let embeddingApi: GenerativeModel; // API binding for the embedding model
let supabase: SupabaseClient;
let progressTracker: ProgressTracker;

// --- Utility Functions ---
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// --- Configuration Validation ---
function validateConfig(config: ScriptConfig): void {
  const requiredFields = [
    'embeddingModelId',
    'geminiApiKey', 
    'supabaseUrl',
    'supabaseServiceKey'
  ];
  
  for (const field of requiredFields) {
    if (!config[field as keyof ScriptConfig] || config[field as keyof ScriptConfig] === '') {
      throw new Error(`Missing required configuration: ${field}. Please check your .env file.`);
    }
  }
  
  if (config.targetEmbeddingDimensionality <= 0) {
    throw new Error('targetEmbeddingDimensionality must be greater than 0');
  }
  
  if (config.tablesToProcess.length === 0) {
    throw new Error('tablesToProcess cannot be empty');
  }
  
  console.log('✅ Configuration validation passed');
}

// --- Client Initialization ---
function initializeClients(): void {
  try {
    // Initialize Google Generative AI
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    embeddingApi = genAI.getGenerativeModel({ 
      model: config.embeddingModelId 
    });
    
    // Initialize Supabase client
    supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    
    console.log('✅ API clients initialized successfully');
  } catch (error: any) {
    throw new Error(`Failed to initialize clients: ${error.message}`);
  }
}

class ProgressTracker {
  private progress: ProcessingProgress = {};
  private progressPath: string;

  constructor(progressPath: string) {
    this.progressPath = progressPath;
    this.loadProgress();
  }

  private getDefaultTableProgress(textSourceFields: Array<keyof DbRecord>, embeddingColumnName: string): TableProgress {
    return {
      lastSuccessfullyProcessedOffset: 0,
      processedRecordIds: [],
      failedRecordIds: [],
      lastRanAt: new Date().toISOString(),
      configUsedSnapshot: { // Snapshot for the specific table config
        embeddingModelId: config.embeddingModelId,
        targetEmbeddingDimensionality: config.targetEmbeddingDimensionality,
        textSourceFields: textSourceFields,
        embeddingColumnName: embeddingColumnName
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
      console.error('Error loading progress file, will start fresh if tables are new:', error.message);
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
  
  getTableProgress(tableName: string, textSourceFields: Array<keyof DbRecord>, embeddingColumnName: string): TableProgress {
    if (!this.progress[tableName]) {
      console.log(`Initializing new progress for table: ${tableName}`);
      this.progress[tableName] = this.getDefaultTableProgress(textSourceFields, embeddingColumnName);
    }
    // Check for config mismatch
    const currentConfigSnapshot = {
        embeddingModelId: config.embeddingModelId,
        targetEmbeddingDimensionality: config.targetEmbeddingDimensionality,
        textSourceFields: textSourceFields,
        embeddingColumnName: embeddingColumnName
    };
    if (JSON.stringify(this.progress[tableName].configUsedSnapshot) !== JSON.stringify(currentConfigSnapshot)) {
        console.warn(`WARNING: Configuration mismatch for table '${tableName}' between current script and saved progress.`);
        console.warn("Saved progress config:", this.progress[tableName].configUsedSnapshot);
        console.warn("Current script config for table:", currentConfigSnapshot);
        console.warn(`Consider resetting progress for table '${tableName}' using --reset-progress --table=${tableName} if parameters changed.`);
    }
    return this.progress[tableName];
  }

  markProcessed(tableName: string, recordId: string | number, currentOffset: number): void {
    const tableProgress = this.getTableProgress(tableName, [], ''); // Pass dummy values, already loaded
    if (!tableProgress.processedRecordIds.includes(recordId)) {
      tableProgress.processedRecordIds.push(recordId);
    }
    tableProgress.failedRecordIds = tableProgress.failedRecordIds.filter(item => item.id !== recordId);
    tableProgress.lastSuccessfullyProcessedOffset = currentOffset;
    tableProgress.lastRanAt = new Date().toISOString();
    this.saveProgress();
  }

  markFailed(tableName: string, recordId: string | number, errorMsg: string, attemptCount: number): void {
    const tableProgress = this.getTableProgress(tableName, [], '');
    const existingFailure = tableProgress.failedRecordIds.find(item => item.id === recordId);
    if (existingFailure) {
        existingFailure.error = errorMsg;
        existingFailure.attempts = attemptCount;
    } else {
        tableProgress.failedRecordIds.push({ id: recordId, error: errorMsg, attempts: attemptCount });
    }
    tableProgress.lastRanAt = new Date().toISOString();
    this.saveProgress();
  }

  isProcessed(tableName: string, recordId: string | number): boolean {
    return this.getTableProgress(tableName, [], '').processedRecordIds.includes(recordId);
  }
  
  isPreviouslyFailed(tableName: string, recordId: string | number): boolean {
      return this.getTableProgress(tableName, [], '').failedRecordIds.some(item => item.id === recordId);
  }

  getStartOffset(tableName: string, textSourceFields: Array<keyof DbRecord>, embeddingColumnName: string): number {
    return this.getTableProgress(tableName, textSourceFields, embeddingColumnName).lastSuccessfullyProcessedOffset;
  }

  getProgressStats(): string {
    const tables = Object.keys(this.progress);
    if (tables.length === 0) {
      return "No progress data available.";
    }
    
    let stats = "\n=== Progress Summary ===\n";
    for (const tableName of tables) {
      const tableProgress = this.progress[tableName];
      stats += `Table: ${tableName}\n`;
      stats += `  Processed: ${tableProgress.processedRecordIds.length}\n`;
      stats += `  Failed: ${tableProgress.failedRecordIds.length}\n`;
      stats += `  Last offset: ${tableProgress.lastSuccessfullyProcessedOffset}\n`;
      stats += `  Last run: ${tableProgress.lastRanAt}\n\n`;
    }
    return stats;
  }

  reset(tableName?: string): void {
    if (tableName && this.progress[tableName]) {
      console.log(`Resetting progress for table: ${tableName}`);
      // Re-initialize with current config for that table
      const tableConfig = config.tablesToProcess.find(t => t.tableName === tableName);
      if(tableConfig){
          this.progress[tableName] = this.getDefaultTableProgress(tableConfig.textSourceFields, tableConfig.embeddingColumn);
      } else {
          delete this.progress[tableName]; // Should not happen if called correctly
      }
    } else if (!tableName) {
      console.log('Resetting all progress in progress file...');
      this.progress = {};
    } else {
        console.log(`No progress found for table ${tableName} to reset, or table not configured.`);
    }
    this.saveProgress();
  }

  resetFailed(tableName: string): void {
    if (this.progress[tableName]) {
        console.log(`Clearing failed IDs for table: ${tableName}...`);
        this.progress[tableName].failedRecordIds = [];
        this.saveProgress();
        console.log(`Failed IDs cleared for ${tableName}. They will be re-attempted on the next run if not already processed.`);
    } else {
        console.log(`No progress found for table ${tableName} to reset failed IDs.`);
    }
  }
}

async function generateEmbeddingWithRetries(
    text: string,
    recordIdForLog: string | number,
    fieldNameForLog: string // e.g., "Combined Text"
): Promise<number[] | null> {
    if (!text || text.trim() === "") {
        console.warn(`Skipping embedding for ${fieldNameForLog} of record ID ${recordIdForLog} as text is empty.`);
        return null;
    }

    // Caching is omitted in this version for simplicity, but can be re-added if processing very large datasets or for cost optimization.

    let retries = 0;
    while (retries <= config.maxRetries) {
        try {
            console.log(`Attempt ${retries + 1}/${config.maxRetries + 1}: Generating embedding for ${fieldNameForLog} of record ID ${recordIdForLog} (Text len: ${text.length}, starts: "${text.substring(0, 70)}...")`);
            
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
                    // This error will be caught by the calling function and the item marked as failed.
                    throw new Error(errMsg); 
                }
                console.log(`Successfully generated embedding for ${recordIdForLog}. Dimension: ${embeddingValues.length}.`);
                return embeddingValues;
            } else {
                console.warn(`Warning: Embedding API returned no values for record ID ${recordIdForLog}. Response: ${JSON.stringify(result).substring(0,200)}`);
                if (retries >= config.maxRetries) {
                    console.error(`Failed to get embedding values for ${recordIdForLog} after max retries (API returned no embedding values).`);
                    return null; 
                }
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Unknown API error';
            const status = error.status || error.cause?.error?.status;
            console.error(`Error generating embedding for record ID ${recordIdForLog} (Attempt ${retries + 1}): ${errorMessage}`);
            
            const isRateLimitError = status === 429 || String(errorMessage).includes('RESOURCE_EXHAUSTED') || String(errorMessage).includes('rate limit') || String(errorMessage).includes('try again later');

            if (isRateLimitError && retries < config.maxRetries) {
                const currentDelay = config.baseRetryDelayMs * Math.pow(2, retries);
                console.log(`Rate limit or temporary server issue. Retrying in ${currentDelay / 1000}s...`);
                await delay(currentDelay);
                retries++;
                continue; 
            } else {
                // Non-retryable error or max retries reached for a retryable one
                console.error(`Failed to generate embedding for ${recordIdForLog} after ${retries + 1} attempts. Last error: ${errorMessage}`);
                return null; 
            }
        }
        // If we fall through (e.g. API returned no values but didn't error, and it's not the last retry)
        retries++; 
        if (retries <= config.maxRetries) {
            const currentDelay = config.baseRetryDelayMs * Math.pow(2, retries - 1);
            console.log(`Retrying due to missing embedding values in ${currentDelay / 1000}s...`);
            await delay(currentDelay);
        }
    }
    console.error(`Ultimately failed to generate embedding for record ID ${recordIdForLog} after all retries.`);
    return null;
}

async function processTableBackfill(
    tableName: 'mental_models' | 'cognitive_biases',
    idColumn: string,
    textSourceFields: Array<keyof DbRecord>,
    embeddingColumn: string
) {
    console.log(`\n--- Starting Backfill for Table: ${tableName} ---`);
    let currentOffset = progressTracker.getStartOffset(tableName, textSourceFields, embeddingColumn);
    let itemsProcessedInThisRun = 0;
    let itemsFailedInThisRun = 0;

    while (true) {
        console.log(`\nFetching records from ${tableName}. Current offset: ${currentOffset}, Batch size: ${config.batchSize}`);
        
        const selectString = `${idColumn}, ${textSourceFields.join(', ')}`; // Select ID and source fields
        const { data: records, error: fetchError } = await supabase
            .from(tableName)
            .select(selectString)
            .is(embeddingColumn, null) // Fetch only records where the embedding column IS NULL
            .order(idColumn as string, { ascending: true }) // Order by ID to process consistently
            .range(0, config.batchSize - 1); // Fetch a batch of items that need embedding

        if (fetchError) {
            console.error(`ERROR fetching records from ${tableName} (targeting NULL embeddings):`, fetchError.message);
            await delay(config.baseRetryDelayMs * 2); // Wait longer before retrying DB fetch
            continue; // Retry fetching
        }

        if (!records || records.length === 0) {
            console.log(`No more records in ${tableName} require embedding (or all remaining failed previously and were not reset).`);
            break;
        }

        console.log(`Fetched ${records.length} records for this batch from ${tableName} that need embedding.`);

        const batchPromises = records.map(async (recordUntyped) => {
            const record = recordUntyped as DbRecord; // Cast to known type
            const recordId = record[idColumn];

            if (progressTracker.isProcessed(tableName, recordId) || progressTracker.isPreviouslyFailed(tableName, recordId)) {
                // This check is mostly redundant if .is(embeddingColumn, null) works perfectly,
                // but good as a safeguard if progress file is more up-to-date or for items that failed before getting embedding set to null.
                console.log(`Skipping ID ${recordId} (${record.name || 'N/A'}) as it's already processed or marked failed (and not reset).`);
                return;
            }

            let textToEmbed = "";
            for (const field of textSourceFields) {
                if (record[field] && typeof record[field] === 'string') {
                    // Simple concatenation; can be made more sophisticated (e.g., "Title: X Summary: Y")
                    textToEmbed += `${record[field]}\n`; 
                }
            }
            textToEmbed = textToEmbed.trim();

            if (!textToEmbed) {
                console.warn(`No text content to embed for record ID ${recordId} (${record.name}). Marking as failed.`);
                progressTracker.markFailed(tableName, recordId, "No text content to embed", 0);
                itemsFailedInThisRun++;
                return;
            }
            
            const embeddingVector = await generateEmbeddingWithRetries(textToEmbed, recordId, "Combined Source Text");

            if (embeddingVector) {
                console.log(`🔍 About to store embedding for ${recordId}:`);
                console.log(`   Type: ${typeof embeddingVector}`);
                console.log(`   Is Array: ${Array.isArray(embeddingVector)}`);
                console.log(`   Length: ${embeddingVector.length}`);
                console.log(`   Sample: [${embeddingVector.slice(0, 3).map(v => v.toFixed(6)).join(', ')}...]`);

                const updatePayload: { [key: string]: any } = {};
                updatePayload[embeddingColumn] = embeddingVector; // Store raw array

                const { error: updateError } = await supabase
                    .from(tableName)
                    .update(updatePayload)
                    .eq(idColumn, recordId);

                if (updateError) {
                    console.error(`ERROR updating Supabase for ID ${recordId} in ${tableName}: ${updateError.message}`);
                    progressTracker.markFailed(tableName, recordId, updateError.message, config.maxRetries + 1);
                    itemsFailedInThisRun++;
                } else {
                    console.log(`✅ Successfully generated and stored embedding for ID ${recordId} (${record.name}) in ${tableName}.`);
                    
                    // Quick verification of what was stored
                    const { data: verifyData, error: verifyError } = await supabase
                        .from(tableName)
                        .select(`${idColumn}, ${embeddingColumn}`)
                        .eq(idColumn, recordId)
                        .single();
                    
                    if (verifyData && !verifyError) {
                        const storedEmbedding = verifyData[embeddingColumn];
                        console.log(`🔍 Verification - Stored as: ${typeof storedEmbedding}, Is Array: ${Array.isArray(storedEmbedding)}`);
                    }
                    
                    progressTracker.markProcessed(tableName, recordId, currentOffset + records.indexOf(record) + 1); // Update offset based on actual position
                    itemsProcessedInThisRun++;
                }
            } else {
                console.warn(`Failed to generate embedding for ID ${recordId} (${record.name}) after retries.`);
                progressTracker.markFailed(tableName, recordId, "Embedding generation failed after retries", config.maxRetries + 1);
                itemsFailedInThisRun++;
            }
            // Delay between processing each record within a batch
            await delay(config.delayBetweenRequestsMs); 
        });
        
        await Promise.all(batchPromises);
        currentOffset += records.length; // Advance offset by the number of records fetched and attempted

        console.log(`Batch for ${tableName} complete. Processed in this run so far: ${itemsProcessedInThisRun}, Failed in this run so far: ${itemsFailedInThisRun}`);
        console.log(progressTracker.getProgressStats());

        // No need for outer delay if batching from Supabase correctly handles new items
    }
    console.log(`--- Finished Backfill for Table: ${tableName} ---`);
}

async function main() {
    try {
        validateConfig(config);
        initializeClients();
        
        progressTracker = new ProgressTracker(config.progressFilePath);

        console.log(`\n=== Database Embedding Backfill Script (v1.1-node-db) ===`);
        console.log(`Embedding Model: ${config.embeddingModelId}`);
        console.log(`Target Dimension: ${config.targetEmbeddingDimensionality}`);
        console.log(`Progress file: ${config.progressFilePath}`);
        console.log("-----------------------------------------------------\n");

        for (const tableConfig of config.tablesToProcess) {
            await processTableBackfill(
                tableConfig.tableName, 
                tableConfig.idColumn, 
                tableConfig.textSourceFields, 
                tableConfig.embeddingColumn
            );
        }
        
        console.log("\n=== Full Backfill Script Finished ===");
        console.log(progressTracker.getProgressStats()); // Show final stats if needed (will be per-table)

    } catch (error: any) {
        console.error('\n--- CRITICAL SCRIPT ERROR ---');
        console.error('Error:', error.message);
        if (error.stack) console.error("Stack:", error.stack);
        process.exit(1);
    }
}

// --- Command Line Interface Options ---
const args = process.argv.slice(2);
const resetProgressArg = args.find(arg => arg.startsWith('--reset-progress'));
const resetFailedArg = args.find(arg => arg.startsWith('--reset-failed'));
const tableArg = args.find(arg => arg.startsWith('--table='))?.split('=')[1];

if (resetProgressArg) {
    validateConfig(config); // Load config to get progressPath
    progressTracker = new ProgressTracker(config.progressFilePath); // Initialize for reset
    const targetTable = tableArg || args.find(arg => !arg.startsWith('--')) ; // Allow --table=X or just X after --reset-progress
    
    if (targetTable && (targetTable === 'mental_models' || targetTable === 'cognitive_biases')) {
        progressTracker.reset(targetTable as 'mental_models' | 'cognitive_biases');
    } else if (targetTable) {
        console.warn(`Invalid table name "${targetTable}" for reset. Use 'mental_models' or 'cognitive_biases', or no table name to reset all.`);
    } else {
        progressTracker.reset(); // Reset all if no table specified
    }
    process.exit(0);
}

if (resetFailedArg) {
    validateConfig(config);
    progressTracker = new ProgressTracker(config.progressFilePath);
    const targetTable = tableArg || args.find(arg => !arg.startsWith('--')) ;
    if (targetTable && (targetTable === 'mental_models' || targetTable === 'cognitive_biases')) {
        progressTracker.resetFailed(targetTable as 'mental_models' | 'cognitive_biases');
    } else {
         console.error("To reset failed progress, please specify a valid table using --table=<table_name> (e.g., mental_models).");
         process.exit(1);
    }
    process.exit(0);
}

// --- Run the Main Script ---
main();