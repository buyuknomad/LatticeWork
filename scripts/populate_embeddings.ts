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
  tablesToProcess: Array<{
    tableName: 'mental_models' | 'cognitive_biases';
    idColumn: string; // Name of the primary key column in this table
    textSourceFields: Array<keyof DbRecord>; // Fields from DB to construct text for embedding
    embeddingColumnName: string; // Column in Supabase where this combined embedding will be stored
  }>;
  delayBetweenRequestsMs: number;
  maxRetries: number;
  baseRetryDelayMs: number;
  dbQueryBatchSize: number; // How many records to fetch from Supabase at a time
  // Concurrency for Promise.all when processing a fetched batch from DB
  maxConcurrentEmbeddingsPerDbBatch: number; 
  progressFilePath: string;
  cachePath: string;
}

// --- Type Definitions ---
interface DbRecord {
  id: string | number; // Primary key type
  name?: string;
  category?: string;
  summary?: string;
  detailed_description?: string; // If you plan to embed this separately or combine it
  [key: string]: any; // Allow other properties from DB
}

interface TableProgress {
  lastSuccessfullyProcessedId: string | number | null; // Last ID for which embedding was successfully stored
  processedRecordIdsThisRun: (string | number)[]; // IDs processed in the current execution
  failedRecordIdsThisRun: Array<{ id: string | number; error: string; attempts: number }>; // IDs failed in current run
  totalSuccessfullyEmbeddedEver: number; // Count of all unique IDs ever embedded for this table
  configUsedSnapshot: Pick<ScriptConfig, 'embeddingModelId' | 'targetEmbeddingDimensionality' | 'tablesToProcess'>;
  lastRanAt: string;
}

interface ProcessingProgress {
  [tableName: string]: TableProgress;
}

interface EmbeddingCacheEntry {
  embedding: number[];
  generatedAt: string;
  modelUsed: string;
  textSample: string;
  actualDimension: number;
}
interface EmbeddingCache {
  [cacheKey: string]: EmbeddingCacheEntry;
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
      idColumn: 'id', // Assuming 'id' is the PK. Adjust if it's 'model_id'
      textSourceFields: ['name', 'category', 'summary'], 
      embeddingColumnName: 'embedding' 
    },
    { 
      tableName: 'cognitive_biases', 
      idColumn: 'id', // Assuming 'id' is the PK. Adjust if it's 'bias_id' or similar
      textSourceFields: ['name', 'category', 'summary'], 
      embeddingColumnName: 'embedding'
    }
  ],
  delayBetweenRequestsMs: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '500', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  baseRetryDelayMs: parseInt(process.env.BASE_RETRY_DELAY_MS || '3000', 10),
  dbQueryBatchSize: parseInt(process.env.DB_QUERY_BATCH_SIZE || '50', 10),
  maxConcurrentEmbeddingsPerDbBatch: parseInt(process.env.MAX_CONCURRENT_EMBEDDINGS || '5', 10),
  progressFilePath: process.env.PROGRESS_FILE_PATH || './db_embedding_v2_progress.json',
  cachePath: process.env.CACHE_PATH || './embedding_v2_cache.json',
};

// --- Global Clients (initialized in main) ---
let genAI: GoogleGenerativeAI;
let embeddingApi: GenerativeModel;
let supabase: SupabaseClient;
let progressTracker: ProgressTracker;
let embeddingCache: PersistentCache;


// --- Utility Functions ---
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

function validateConfig(cfg: ScriptConfig): void {
    const requiredFields: (keyof Pick<ScriptConfig, 'geminiApiKey' | 'supabaseUrl' | 'supabaseServiceKey'>)[] = 
        ['geminiApiKey', 'supabaseUrl', 'supabaseServiceKey'];
    const missingFields = requiredFields.filter(field => !cfg[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required configuration from .env or defaults: ${missingFields.join(', ')}`);
    }
    console.log("Configuration validated successfully.");
}

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

  get(textToEmbed: string, idForCacheKey: string | number, fieldName: string): number[] | undefined {
    const cacheKey = this.generateCacheKey(textToEmbed, idForCacheKey, fieldName);
    const entry = this.cache[cacheKey];
    if (entry && 
        entry.modelUsed === config.embeddingModelId && 
        entry.actualDimension === config.targetEmbeddingDimensionality) {
      return entry.embedding;
    }
    return undefined;
  }

  set(textToEmbed: string, idForCacheKey: string | number, fieldName: string, embedding: number[], actualDimension: number): void {
    const cacheKey = this.generateCacheKey(textToEmbed, idForCacheKey, fieldName);
    this.cache[cacheKey] = {
      embedding,
      generatedAt: new Date().toISOString(),
      modelUsed: config.embeddingModelId,
      textSample: textToEmbed.substring(0, 100),
      actualDimension: actualDimension
    };
    this.saveCache();
  }

  private generateCacheKey(text: string, id: string | number, fieldName: string): string {
    return `${id}_${fieldName}_${config.embeddingModelId}_dim${config.targetEmbeddingDimensionality}_len${text.length}_${text.substring(0,20)}_${text.slice(-20)}`;
  }
}

class ProgressTracker {
  private progressData: ProcessingProgress = {};
  private progressFilePath: string;

  constructor(filePath: string) {
    this.progressFilePath = filePath;
    this.loadProgress();
  }

  private getDefaultTableProgress(tableConfig: ScriptConfig['tablesToProcess'][0]): TableProgress {
    return {
      lastSuccessfullyProcessedOffset: 0,
      processedRecordIdsThisRun: [],
      failedRecordIdsThisRun: [],
      totalSuccessfullyEmbeddedEver: 0,
      lastRanAt: new Date().toISOString(),
      configUsedSnapshot: {
        embeddingModelId: config.embeddingModelId,
        targetEmbeddingDimensionality: config.targetEmbeddingDimensionality,
        textSourceFields: tableConfig.textSourceFields,
        embeddingColumnName: tableConfig.embeddingColumnName,
      }
    };
  }

  private loadProgress(): void {
    try {
      if (fs.existsSync(this.progressFilePath)) {
        const data = fs.readFileSync(this.progressFilePath, 'utf-8');
        this.progressData = JSON.parse(data);
        console.log(`Loaded progress from ${this.progressFilePath}.`);
        // Validate loaded progress against current table configs
        config.tablesToProcess.forEach(tc => {
            if (this.progressData[tc.tableName]) {
                const currentSnapshot = {
                    embeddingModelId: config.embeddingModelId,
                    targetEmbeddingDimensionality: config.targetEmbeddingDimensionality,
                    textSourceFields: tc.textSourceFields,
                    embeddingColumnName: tc.embeddingColumnName,
                };
                if (JSON.stringify(this.progressData[tc.tableName].configUsedSnapshot) !== JSON.stringify(currentSnapshot)) {
                    console.warn(`Config mismatch for table '${tc.tableName}' in progress file. Consider resetting.`);
                }
            }
        });

      } else {
        console.log("No progress file found. Starting fresh.");
      }
    } catch (error: any) {
      console.error("Error loading progress file:", error.message);
      this.progressData = {};
    }
  }

  private saveProgress(): void {
    try {
      fs.writeFileSync(this.progressFilePath, JSON.stringify(this.progressData, null, 2));
    } catch (error: any) {
      console.error("Error saving progress:", error.message);
    }
  }

  getTableProgress(tableConfig: ScriptConfig['tablesToProcess'][0]): TableProgress {
    if (!this.progressData[tableConfig.tableName]) {
      this.progressData[tableConfig.tableName] = this.getDefaultTableProgress(tableConfig);
    }
    return this.progressData[tableConfig.tableName];
  }

  markProcessed(tableName: string, recordId: string | number, newOffset: number): void {
    const tableP = this.progressData[tableName];
    if (!tableP.processedRecordIdsThisRun.includes(recordId)) {
      tableP.processedRecordIdsThisRun.push(recordId);
      tableP.totalSuccessfullyEmbeddedEver++;
    }
    tableP.failedRecordIdsThisRun = tableP.failedRecordIdsThisRun.filter(item => item.id !== recordId);
    tableP.lastSuccessfullyProcessedOffset = newOffset;
    tableP.lastRanAt = new Date().toISOString();
    this.saveProgress();
  }

  markFailed(tableName: string, recordId: string | number, errorMsg: string, attempts: number): void {
    const tableP = this.progressData[tableName];
    const existingFailure = tableP.failedRecordIdsThisRun.find(item => item.id === recordId);
    if (existingFailure) {
      existingFailure.error = errorMsg;
      existingFailure.attempts = attempts;
    } else {
      tableP.failedRecordIdsThisRun.push({ id: recordId, error: errorMsg, attempts });
    }
    tableP.lastRanAt = new Date().toISOString();
    this.saveProgress();
  }
  
  reset(tableName?: string): void {
    if (tableName) {
      const tableCfg = config.tablesToProcess.find(tc => tc.tableName === tableName);
      if (tableCfg && this.progressData[tableName]) {
        console.log(`Resetting progress for table: ${tableName}`);
        this.progressData[tableName] = this.getDefaultTableProgress(tableCfg);
      } else {
        console.log(`No progress or config found for table ${tableName} to reset.`);
      }
    } else {
      console.log('Resetting all progress...');
      this.progressData = {};
      config.tablesToProcess.forEach(tc => {
          this.progressData[tc.tableName] = this.getDefaultTableProgress(tc);
      });
    }
    this.saveProgress();
  }
}


async function generateEmbeddingWithRetries(
    text: string,
    recordIdForLog: string | number,
    contextDescription: string // e.g., "Combined text for mental_models"
): Promise<number[] | null> {
    if (!text || text.trim() === "") {
        console.warn(`Skipping embedding for ${contextDescription} of record ID ${recordIdForLog} as text is empty.`);
        return null;
    }

    const cachedEmbedding = embeddingCache.get(text, recordIdForLog, contextDescription);
    if (cachedEmbedding) {
        console.log(`Using cached embedding for ${contextDescription} of ID ${recordIdForLog}`);
        return cachedEmbedding;
    }

    let retries = 0;
    while (retries <= config.maxRetries) {
        try {
            console.log(`Attempt ${retries + 1}/${config.maxRetries + 1}: Generating embedding for ${contextDescription} of ID ${recordIdForLog} (Text len: ${text.length}, starts: "${text.substring(0, 70)}...")`);
            
            const result: EmbeddingResult = await embeddingApi.embedContent({
                content: { parts: [{ text }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                outputDimensionality: config.targetEmbeddingDimensionality,
            });

            const embeddingValues = result.embedding?.values;

            if (embeddingValues) {
                if (embeddingValues.length !== config.targetEmbeddingDimensionality) {
                    const errMsg = `CRITICAL DIMENSION MISMATCH for ID ${recordIdForLog}: Model ${config.embeddingModelId} returned ${embeddingValues.length} dimensions, but script expected ${config.targetEmbeddingDimensionality}.`;
                    console.error(errMsg);
                    throw new Error(errMsg);
                }
                console.log(`Successfully generated embedding for ID ${recordIdForLog}. Dimension: ${embeddingValues.length}.`);
                embeddingCache.set(text, recordIdForLog, contextDescription, embeddingValues, embeddingValues.length);
                return embeddingValues;
            } else {
                console.warn(`Warning: API returned no embedding values for ID ${recordIdForLog}. Response snippet: ${JSON.stringify(result).substring(0,200)}`);
                if (retries >= config.maxRetries) throw new Error("API returned no embedding values after max retries.");
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Unknown API error';
            const status = error.status || error.cause?.error?.status; // For Google API specific errors
            console.error(`Error generating embedding for ID ${recordIdForLog} (Attempt ${retries + 1}): ${errorMessage}`);
            
            const isRateLimitError = status === 429 || String(errorMessage).includes('RESOURCE_EXHAUSTED') || String(errorMessage).includes('rate limit') || String(errorMessage).includes('try again later');

            if (isRateLimitError && retries < config.maxRetries) {
                const currentDelay = config.baseRetryDelayMs * Math.pow(2, retries);
                console.log(`Rate limit or temporary server issue. Retrying in ${currentDelay / 1000}s...`);
                await delay(currentDelay);
                retries++;
                continue;
            } else {
                console.error(`Failed to generate embedding for ID ${recordIdForLog} after ${retries + 1} attempts. Last error: ${errorMessage}`);
                throw error; // Re-throw to be caught by processSingleRecord
            }
        }
         // Should not be reached if errors are thrown or success path taken
        retries++;
        if (retries <= config.maxRetries) await delay(config.baseRetryDelayMs * Math.pow(2, retries -1 ));
    }
    throw new Error(`Failed to generate embedding for ID ${recordIdForLog} after all retries.`);
}


async function processSingleRecord(
    record: DbRecord,
    tableConfigDetail: ScriptConfig['tablesToProcess'][0]
): Promise<boolean> {
    const { tableName, idColumn, textSourceFields, embeddingColumnName } = tableConfigDetail;
    const recordId = record[idColumn];

    if (progressTracker.isProcessed(tableName, recordId) || progressTracker.isPreviouslyFailed(tableName, recordId)) {
        // This check is somewhat redundant if fetching only NULL embeddings, but good for safety.
        console.log(`Skipping record ID ${recordId} from ${tableName} as it's already processed or was marked failed.`);
        return true; // Count as "handled" for batching purposes, but not newly processed
    }
    
    let textToEmbed = "";
    for (const field of textSourceFields) {
        if (record[field] && typeof record[field] === 'string') {
            textToEmbed += `${field.charAt(0).toUpperCase() + field.slice(1)}: ${record[field]}\n`;
        }
    }
    textToEmbed = textToEmbed.trim();

    if (!textToEmbed) {
        console.warn(`No text content to embed for record ID ${recordId} in ${tableName}. Marking as failed.`);
        progressTracker.markFailed(tableName, recordId, "No text content to embed", 0);
        return false;
    }

    try {
        const embeddingVector = await generateEmbeddingWithRetries(textToEmbed, recordId, `Combined text for ${tableName}`);
        if (embeddingVector) {
            const updatePayload: { [key: string]: any } = {};
            updatePayload[embeddingColumnName] = embeddingVector;

            const { error: updateError } = await supabase
                .from(tableName)
                .update(updatePayload)
                .eq(idColumn, recordId);

            if (updateError) {
                console.error(`ERROR updating Supabase for ID ${recordId} in ${tableName}: ${updateError.message}`);
                progressTracker.markFailed(tableName, recordId, `Supabase update error: ${updateError.message}`, config.maxRetries + 1);
                return false;
            } else {
                console.log(`Successfully embedded and stored for ID ${recordId} (${record.name || ''}) in ${tableName}.`);
                return true; // Success for this record
            }
        } else {
            progressTracker.markFailed(tableName, recordId, "Embedding generation returned null after retries", config.maxRetries + 1);
            return false;
        }
    } catch (error: any) {
        console.error(`Unhandled error during processing of record ID ${recordId} from ${tableName}: ${error.message}`);
        progressTracker.markFailed(tableName, recordId, `Outer error: ${error.message}`, config.maxRetries + 1);
        return false;
    }
}


async function processTable(tableConfigDetail: ScriptConfig['tablesToProcess'][0]) {
    const { tableName, idColumn, textSourceFields, embeddingColumnName } = tableConfigDetail;
    console.log(`\n--- Starting Batch Processing for Table: ${tableName} ---`);
    
    let processedInThisRunForTable = 0;
    let failedInThisRunForTable = 0;
    let currentDbOffset = 0; // We will fetch records where embedding is null, so offset is simpler here.

    while (true) {
        const tableProgress = progressTracker.getTableProgress(tableConfigDetail); // Get fresh progress state
        console.log(`\nFetching batch from ${tableName} where '${embeddingColumnName}' is NULL. Offset: ${currentDbOffset}, BatchSize: ${config.dbQueryBatchSize}`);
        console.log(progressTracker.getProgressStats()); // Show overall progress

        const selectFields = [idColumn, ...textSourceFields.filter(f => f !== idColumn)].join(', ');

        const { data: recordsToProcess, error: fetchError } = await supabase
            .from(tableName)
            .select(selectFields)
            .is(embeddingColumnName, null) // Fetch only records needing embedding
            .order(idColumn as string, { ascending: true }) // Consistent order
            .range(currentDbOffset, currentDbOffset + config.dbQueryBatchSize - 1);

        if (fetchError) {
            console.error(`ERROR fetching records from ${tableName}: ${fetchError.message}. Retrying after delay...`);
            await delay(config.baseRetryDelayMs * 2);
            continue;
        }

        if (!recordsToProcess || recordsToProcess.length === 0) {
            console.log(`No more records in ${tableName} require embedding based on NULL '${embeddingColumnName}' column and current offset.`);
            break; 
        }
        
        console.log(`Workspaceed ${recordsToProcess.length} records to process for ${tableName} in this DB batch.`);
        const recordsForConcurrentProcessing = recordsToProcess.filter(r => !progressTracker.isProcessed(tableName, r[idColumn]) && !progressTracker.isPreviouslyFailed(tableName, r[idColumn]));
        
        if (recordsForConcurrentProcessing.length === 0) {
            console.log("All records in this fetched batch were already processed or previously failed. Advancing DB offset.");
            currentDbOffset += recordsToProcess.length; // Advance offset by the number of records fetched
            if (recordsToProcess.length < config.dbQueryBatchSize) break; // Reached the end
            continue;
        }
        
        console.log(`Processing ${recordsForConcurrentProcessing.length} new/unfailed records concurrently (max: ${config.maxConcurrentEmbeddingsPerDbBatch}).`);

        for (let i = 0; i < recordsForConcurrentProcessing.length; i += config.maxConcurrentEmbeddingsPerDbBatch) {
            const concurrentBatch = recordsForConcurrentProcessing.slice(i, i + config.maxConcurrentEmbeddingsPerDbBatch);
            
            const processingPromises = concurrentBatch.map(async (recordUntyped) => {
                const record = recordUntyped as DbRecord;
                const recordId = record[idColumn];
                try {
                    const success = await processSingleRecord(record, tableConfigDetail);
                    if (success) {
                        progressTracker.markProcessed(tableName, recordId, currentDbOffset + recordsToProcess.indexOf(recordUntyped) + 1); // Use the overall offset
                        processedInThisRunForTable++;
                    } else {
                        // Failure is marked within processSingleRecord or generateEmbeddingWithRetries
                        failedInThisRunForTable++;
                    }
                } catch(e: any) {
                    console.error(`Unexpected error processing record ${recordId} in batch map: ${e.message}`);
                    progressTracker.markFailed(tableName, recordId, `Batch map error: ${e.message}`, 0);
                    failedInThisRunForTable++;
                }
            });
            await Promise.all(processingPromises);
            console.log(`Sub-batch of ${concurrentBatch.length} processed. Current table stats - Processed: ${processedInThisRunForTable}, Failed: ${failedInThisRunForTable}`);
        }
        
        currentDbOffset += recordsToProcess.length; // Advance offset based on initial fetch size

        if (recordsToProcess.length < config.dbQueryBatchSize) {
            console.log(`Likely reached end of records for ${tableName} needing embedding.`);
            break;
        }
        // No inter-DB-batch delay needed if Supabase handles pagination well
    }
    console.log(`--- Finished processing for Table: ${tableName}. Processed in this run: ${processedInThisRunForTable}, Failed in this run: ${failedInThisRunForTable} ---`);
}


async function main() {
  try {
    validateConfig(config);
    initializeClients();
    
    embeddingCache = new PersistentCache(config.cachePath);
    progressTracker = new ProgressTracker(config.progressFilePath);

    console.log(`\n=== Database Embedding Backfill Script (v1.2-node-db-from-scratch) ===`);
    console.log(`Embedding Model: ${config.embeddingModelId}`);
    console.log(`Target Dimension: ${config.targetEmbeddingDimensionality}`);
    console.log(`Progress file: ${config.progressFilePath}`);
    console.log(`Cache file: ${config.cachePath}`);
    console.log("-----------------------------------------------------\n");

    for (const tableConfigDetail of config.tablesToProcess) {
      await processTable(tableConfigDetail);
    }
    
    console.log("\n=== Full Backfill Script Finished ===");
    // Log final stats for all tables from progress tracker
    for (const tableConfigDetail of config.tablesToProcess) {
        const tableP = progressTracker.getTableProgress(tableConfigDetail);
        console.log(`\nStats for ${tableConfigDetail.tableName}:`);
        console.log(`  Total successfully embedded ever: ${tableP.totalSuccessfullyEmbeddedEver}`);
        console.log(`  Processed in last run (newly embedded or confirmed): ${tableP.processedRecordIdsThisRun.length}`);
        console.log(`  Failed in last run (newly failed or re-failed): ${tableP.failedRecordIdsThisRun.length}`);
        if (tableP.failedRecordIdsThisRun.length > 0) {
            console.warn(`  Failed IDs for ${tableConfigDetail.tableName}: ${tableP.failedRecordIdsThisRun.map(f=>f.id).join(', ')}`);
        }
    }

  } catch (error: any) {
    console.error('\n--- CRITICAL SCRIPT ERROR ---');
    console.error('Error:', error.message);
    if (error.stack) console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// --- Command Line Interface Options ---
// (Ensure progressTracker is initialized before CLI ops if they modify progress)
function handleCliArgs() {
    const args = process.argv.slice(2);
    let shouldExitAfterArgs = false;

    if (args.includes('--reset-progress')) {
        validateConfig(config); // Load config to get progressPath
        progressTracker = new ProgressTracker(config.progressFilePath); // Initialize for reset
        const targetTable = args.find(arg => arg.startsWith('--table='))?.split('=')[1];
        progressTracker.reset(targetTable);
        shouldExitAfterArgs = true;
    }
    
    if (args.includes('--reset-failed')) {
        validateConfig(config);
        progressTracker = new ProgressTracker(config.progressFilePath);
        const targetTable = args.find(arg => arg.startsWith('--table='))?.split('=')[1];
        if (targetTable && (targetTable === 'mental_models' || targetTable === 'cognitive_biases')) {
            progressTracker.resetFailed(targetTable as 'mental_models' | 'cognitive_biases');
        } else if (targetTable) {
             console.error("Invalid table for --reset-failed. Use 'mental_models' or 'cognitive_biases'.");
        } else {
            console.error("Please specify a table with --reset-failed using --table=<table_name>.");
        }
        shouldExitAfterArgs = true;
    }

    if (args.includes('--reset-cache')) {
        validateConfig(config); 
        if (fs.existsSync(config.cachePath)) {
            fs.unlinkSync(config.cachePath);
            console.log('Embedding cache file deleted.');
        } else {
            console.log('No embedding cache file found to delete.');
        }
        shouldExitAfterArgs = true;
    }

    if (shouldExitAfterArgs) {
        process.exit(0);
    }
}

// --- Initialize and Run ---
function initializeAndRun() {
    validateConfig(config); // Validate config first
    initializeClients();   // Then initialize clients that depend on config
    
    // Initialize these singletons after config is validated and potentially used by CLI args
    embeddingCache = new PersistentCache(config.cachePath);
    progressTracker = new ProgressTracker(config.progressFilePath); 
    
    main().catch(error => { // main() will re-validate and re-init, which is slightly redundant but okay
      console.error("Unhandled error in main execution:", error);
      process.exit(1);
    });
}

// Handle CLI arguments first, they might exit
handleCliArgs(); 
// If CLI args didn't cause an exit, run the main script logic
initializeAndRun();