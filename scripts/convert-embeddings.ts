import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// --- Configuration with Conservative Settings ---
interface ConversionConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  expectedEmbeddingDimension: number;
  tablesToConvert: Array<{
    tableName: 'mental_models' | 'cognitive_biases';
    idColumn: string;
    embeddingColumn: string;
  }>;
  batchSize: number;
  delayBetweenBatches: number; // ms
  delayBetweenRecords: number; // ms
  maxRetries: number;
  retryDelay: number; // ms
}

const config: ConversionConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  expectedEmbeddingDimension: parseInt(process.env.EMBEDDING_DIMENSIONALITY || '1536', 10),
  tablesToConvert: [
    {
      tableName: 'mental_models',
      idColumn: 'id',
      embeddingColumn: 'embedding'
    },
    {
      tableName: 'cognitive_biases',
      idColumn: 'id',
      embeddingColumn: 'embedding'
    }
  ],
  batchSize: 10, // Much smaller batches to avoid timeouts
  delayBetweenBatches: 3000, // 3 seconds between batches
  delayBetweenRecords: 200, // 200ms between individual records
  maxRetries: 3,
  retryDelay: 5000 // 5 seconds between retries
};

// --- Types ---
interface ConversionStats {
  tableName: string;
  totalRecords: number;
  stringEmbeddings: number;
  arrayEmbeddings: number;
  convertedSuccessfully: number;
  conversionFailed: number;
  networkErrors: number;
  retrySuccesses: number;
  skipped: number;
  failedRecords: Array<{ id: string | number; reason: string }>;
}

let supabase: SupabaseClient;

// --- Utility Functions ---
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

function validateConfig(): void {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Missing required Supabase configuration. Check VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file.');
  }
  console.log('✅ Configuration validation passed');
}

function initializeClient(): void {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: {
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'Connection': 'keep-alive'
        }
      }
    });
    console.log('✅ Supabase client initialized with optimized settings');
  } catch (error: any) {
    throw new Error(`Failed to initialize Supabase client: ${error.message}`);
  }
}

async function testConnection(): Promise<boolean> {
  console.log('🔍 Testing Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('mental_models')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Connection test exception:', error.message);
    return false;
  }
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = config.maxRetries
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️  ${operationName} failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
      
      if (attempt < maxRetries) {
        const delayMs = config.retryDelay * attempt; // Progressive backoff
        console.log(`⏱️  Waiting ${delayMs}ms before retry...`);
        await delay(delayMs);
      }
    }
  }
  
  throw new Error(`${operationName} failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

function parseStringEmbedding(embeddingStr: string): { success: boolean; embedding?: number[]; error?: string } {
  try {
    const parsed = JSON.parse(embeddingStr);
    
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Parsed data is not an array' };
    }
    
    if (parsed.length !== config.expectedEmbeddingDimension) {
      return { success: false, error: `Wrong dimension: ${parsed.length}, expected ${config.expectedEmbeddingDimension}` };
    }
    
    if (!parsed.every(val => typeof val === 'number' && !isNaN(val))) {
      return { success: false, error: 'Array contains non-numeric values' };
    }
    
    return { success: true, embedding: parsed };
  } catch (error: any) {
    return { success: false, error: `JSON parse error: ${error.message}` };
  }
}

async function convertSingleRecord(
  tableName: string,
  idColumn: string,
  embeddingColumn: string,
  record: any,
  stats: ConversionStats
): Promise<void> {
  const recordId = record[idColumn];
  const embedding = record[embeddingColumn];
  const recordName = record.name || 'N/A';
  
  try {
    if (Array.isArray(embedding)) {
      console.log(`✅ ${recordId} (${recordName}): Already array format`);
      stats.arrayEmbeddings++;
      stats.skipped++;
      return;
    }
    
    if (typeof embedding !== 'string') {
      console.log(`⚠️  ${recordId} (${recordName}): Unknown type (${typeof embedding})`);
      stats.skipped++;
      return;
    }
    
    stats.stringEmbeddings++;
    
    // Parse the string embedding
    const parseResult = parseStringEmbedding(embedding);
    
    if (!parseResult.success) {
      console.log(`❌ ${recordId} (${recordName}): Parse failed - ${parseResult.error}`);
      stats.conversionFailed++;
      stats.failedRecords.push({ id: recordId, reason: parseResult.error || 'Unknown parse error' });
      return;
    }
    
    // Update with retry logic
    const updateOperation = async () => {
      const { error } = await supabase
        .from(tableName)
        .update({ [embeddingColumn]: parseResult.embedding })
        .eq(idColumn, recordId);
      
      if (error) {
        throw new Error(error.message);
      }
    };
    
    await retryWithBackoff(
      updateOperation,
      `Update ${recordId}`,
      config.maxRetries
    );
    
    console.log(`✅ ${recordId} (${recordName}): Converted successfully`);
    stats.convertedSuccessfully++;
    
    // Small delay between records to be gentle on the API
    await delay(config.delayBetweenRecords);
    
  } catch (error: any) {
    console.log(`💥 ${recordId} (${recordName}): ${error.message}`);
    
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
      stats.networkErrors++;
    } else {
      stats.conversionFailed++;
    }
    
    stats.failedRecords.push({ id: recordId, reason: error.message });
  }
}

async function convertTableEmbeddings(tableConfig: ConversionConfig['tablesToConvert'][0]): Promise<ConversionStats> {
  const { tableName, idColumn, embeddingColumn } = tableConfig;
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🔄 Converting ${tableName.toUpperCase()}`);
  console.log(`${'='.repeat(50)}`);
  
  const stats: ConversionStats = {
    tableName,
    totalRecords: 0,
    stringEmbeddings: 0,
    arrayEmbeddings: 0,
    convertedSuccessfully: 0,
    conversionFailed: 0,
    networkErrors: 0,
    retrySuccesses: 0,
    skipped: 0,
    failedRecords: []
  };
  
  // Get total count with retry
  const countOperation = async () => {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .not(embeddingColumn, 'is', null);
    
    if (error) {
      throw new Error(`Failed to count records: ${error.message}`);
    }
    
    return count || 0;
  };
  
  try {
    stats.totalRecords = await retryWithBackoff(countOperation, `Count ${tableName} records`);
    console.log(`📊 Total records with embeddings: ${stats.totalRecords}`);
  } catch (error: any) {
    console.error(`❌ Could not get record count for ${tableName}: ${error.message}`);
    return stats;
  }
  
  if (stats.totalRecords === 0) {
    console.log('⚠️  No records with embeddings found');
    return stats;
  }
  
  // Process in small batches
  let offset = 0;
  let batchNumber = 1;
  
  while (offset < stats.totalRecords) {
    console.log(`\n--- Batch ${batchNumber} (Records ${offset + 1}-${Math.min(offset + config.batchSize, stats.totalRecords)}) ---`);
    
    // Fetch batch with retry
    const fetchOperation = async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select(`${idColumn}, name, ${embeddingColumn}`)
        .not(embeddingColumn, 'is', null)
        .order(idColumn, { ascending: true }) // Consistent ordering
        .range(offset, offset + config.batchSize - 1);
      
      if (error) {
        throw new Error(`Fetch failed: ${error.message}`);
      }
      
      return data || [];
    };
    
    let records: any[];
    try {
      records = await retryWithBackoff(fetchOperation, `Fetch batch ${batchNumber}`);
    } catch (error: any) {
      console.error(`❌ Failed to fetch batch ${batchNumber}: ${error.message}`);
      console.log('⏭️  Skipping to next batch...');
      offset += config.batchSize;
      batchNumber++;
      continue;
    }
    
    if (records.length === 0) {
      console.log('No more records to process');
      break;
    }
    
    console.log(`Processing ${records.length} records...`);
    
    // Process each record in the batch
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`[${i + 1}/${records.length}] Processing ${record[idColumn]}...`);
      
      await convertSingleRecord(tableName, idColumn, embeddingColumn, record, stats);
    }
    
    // Update offset and progress
    offset += config.batchSize;
    batchNumber++;
    
    const processed = Math.min(offset, stats.totalRecords);
    const percentComplete = (processed / stats.totalRecords * 100).toFixed(1);
    console.log(`\n📈 Progress: ${processed}/${stats.totalRecords} (${percentComplete}%)`);
    console.log(`✅ Converted: ${stats.convertedSuccessfully} | ❌ Failed: ${stats.conversionFailed} | 🌐 Network errors: ${stats.networkErrors}`);
    
    // Longer delay between batches
    if (offset < stats.totalRecords) {
      console.log(`⏱️  Waiting ${config.delayBetweenBatches}ms before next batch...`);
      await delay(config.delayBetweenBatches);
    }
  }
  
  return stats;
}

function printConversionReport(tableStats: ConversionStats[]): void {
  console.log('\n' + '='.repeat(70));
  console.log('                CONVERSION RESULTS');
  console.log('='.repeat(70));
  
  for (const stats of tableStats) {
    console.log(`\n🔸 ${stats.tableName.toUpperCase()}`);
    console.log(`   Total Records: ${stats.totalRecords}`);
    console.log(`   📝 String Embeddings: ${stats.stringEmbeddings}`);
    console.log(`   📦 Already Arrays: ${stats.arrayEmbeddings}`);
    console.log(`   ✅ Converted: ${stats.convertedSuccessfully}`);
    console.log(`   ❌ Failed: ${stats.conversionFailed}`);
    console.log(`   🌐 Network Errors: ${stats.networkErrors}`);
    
    if (stats.failedRecords.length > 0) {
      console.log(`\n   Failed Records (first 5):`);
      stats.failedRecords.slice(0, 5).forEach(failure => {
        console.log(`     - ${failure.id}: ${failure.reason}`);
      });
    }
  }
  
  const totalConverted = tableStats.reduce((sum, stat) => sum + stat.convertedSuccessfully, 0);
  const totalFailed = tableStats.reduce((sum, stat) => sum + stat.conversionFailed + stat.networkErrors, 0);
  
  console.log('\n💡 NEXT STEPS:');
  if (totalConverted > 0) {
    console.log('✅ Run your verification script to see improved results');
  }
  if (totalFailed > 0) {
    console.log('⚠️  Some conversions failed - consider re-running or checking your connection');
  }
  
  console.log('\n' + '='.repeat(70));
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting Robust Embedding Conversion...\n');
    
    validateConfig();
    initializeClient();
    
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without a working connection to Supabase');
      process.exit(1);
    }
    
    console.log(`📋 Conservative Settings:`);
    console.log(`   Batch Size: ${config.batchSize} (small to avoid timeouts)`);
    console.log(`   Delay Between Batches: ${config.delayBetweenBatches}ms`);
    console.log(`   Delay Between Records: ${config.delayBetweenRecords}ms`);
    console.log(`   Max Retries: ${config.maxRetries}`);
    
    // Safety check
    const args = process.argv.slice(2);
    const forceMode = args.includes('--force') || args.includes('-f');
    
    if (!forceMode) {
      console.log('\n🛡️  Add --force flag to start conversion:');
      console.log('   npx tsx robust-convert.ts --force');
      process.exit(0);
    }
    
    console.log('\n🔄 Starting conversion with network-friendly settings...\n');
    
    const tableStats: ConversionStats[] = [];
    
    // Convert each table
    for (const tableConfig of config.tablesToConvert) {
      const stats = await convertTableEmbeddings(tableConfig);
      tableStats.push(stats);
      
      // Pause between tables
      if (config.tablesToConvert.indexOf(tableConfig) < config.tablesToConvert.length - 1) {
        console.log('\n⏸️  Pausing 5 seconds between tables...');
        await delay(5000);
      }
    }
    
    printConversionReport(tableStats);
    
    const totalConverted = tableStats.reduce((sum, stat) => sum + stat.convertedSuccessfully, 0);
    
    if (totalConverted > 0) {
      console.log('\n🎉 Some conversions completed successfully!');
    } else {
      console.log('\n🤷 No conversions completed - check network connectivity');
    }
    
  } catch (error: any) {
    console.error('\n💥 CONVERSION ERROR');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// CLI help
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔄 Robust Embedding Conversion Script

Handles network issues and fetch failures with:
✅ Small batch sizes (10 records)
✅ Retry logic with backoff
✅ Long delays between operations
✅ Connection testing
✅ Progressive error handling

Usage:
  npx tsx robust-convert.ts --force

This version is much more conservative and should handle
"fetch failed" errors better.
  `);
  process.exit(0);
}

main();