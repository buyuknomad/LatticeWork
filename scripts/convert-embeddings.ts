import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// --- Configuration ---
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
  batchSize: 50, // Process 50 records at a time
  delayBetweenBatches: 1000 // 1 second delay between batches
};

// --- Types ---
interface ConversionStats {
  tableName: string;
  totalRecords: number;
  stringEmbeddings: number;
  arrayEmbeddings: number;
  convertedSuccessfully: number;
  conversionFailed: number;
  invalidEmbeddings: number;
  skipped: number;
  failedRecords: Array<{ id: string | number; reason: string }>;
}

interface ConversionReport {
  timestamp: string;
  overallStats: {
    totalProcessed: number;
    totalConverted: number;
    totalFailed: number;
    conversionRate: number;
  };
  tableStats: ConversionStats[];
}

// --- Global Variables ---
let supabase: SupabaseClient;

// --- Utility Functions ---
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

function validateConfig(): void {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Missing required Supabase configuration. Check VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file.');
  }
  
  if (config.expectedEmbeddingDimension <= 0) {
    throw new Error('expectedEmbeddingDimension must be greater than 0');
  }
  
  console.log('✅ Configuration validation passed');
}

function initializeClient(): void {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    console.log('✅ Supabase client initialized');
  } catch (error: any) {
    throw new Error(`Failed to initialize Supabase client: ${error.message}`);
  }
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
    
    // Check if all elements are numbers
    if (!parsed.every(val => typeof val === 'number' && !isNaN(val))) {
      return { success: false, error: 'Array contains non-numeric values' };
    }
    
    return { success: true, embedding: parsed };
  } catch (error: any) {
    return { success: false, error: `JSON parse error: ${error.message}` };
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
    invalidEmbeddings: 0,
    skipped: 0,
    failedRecords: []
  };
  
  // Get total count first
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .not(embeddingColumn, 'is', null);
  
  if (countError) {
    throw new Error(`Failed to count records in ${tableName}: ${countError.message}`);
  }
  
  stats.totalRecords = count || 0;
  console.log(`📊 Total records with embeddings: ${stats.totalRecords}`);
  
  if (stats.totalRecords === 0) {
    console.log('⚠️  No records with embeddings found');
    return stats;
  }
  
  // Process in batches
  let offset = 0;
  let batchNumber = 1;
  
  while (offset < stats.totalRecords) {
    console.log(`\n--- Batch ${batchNumber} (Records ${offset + 1}-${Math.min(offset + config.batchSize, stats.totalRecords)}) ---`);
    
    // Fetch batch
    const { data: records, error: fetchError } = await supabase
      .from(tableName)
      .select(`${idColumn}, name, ${embeddingColumn}`)
      .not(embeddingColumn, 'is', null)
      .range(offset, offset + config.batchSize - 1);
    
    if (fetchError) {
      console.error(`❌ Error fetching batch: ${fetchError.message}`);
      break;
    }
    
    if (!records || records.length === 0) {
      console.log('No more records to process');
      break;
    }
    
    console.log(`Processing ${records.length} records...`);
    
    // Process each record in the batch
    for (const record of records) {
      const recordId = record[idColumn];
      const embedding = record[embeddingColumn];
      const recordName = record.name || 'N/A';
      
      try {
        if (Array.isArray(embedding)) {
          console.log(`✅ ${recordId} (${recordName}): Already array format, skipping`);
          stats.arrayEmbeddings++;
          stats.skipped++;
          continue;
        }
        
        if (typeof embedding !== 'string') {
          console.log(`⚠️  ${recordId} (${recordName}): Unknown embedding type (${typeof embedding}), skipping`);
          stats.invalidEmbeddings++;
          stats.skipped++;
          continue;
        }
        
        stats.stringEmbeddings++;
        
        // Try to parse the string embedding
        const parseResult = parseStringEmbedding(embedding);
        
        if (!parseResult.success) {
          console.log(`❌ ${recordId} (${recordName}): Parse failed - ${parseResult.error}`);
          stats.conversionFailed++;
          stats.failedRecords.push({ id: recordId, reason: parseResult.error || 'Unknown parse error' });
          continue;
        }
        
        // Update with the parsed array
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ [embeddingColumn]: parseResult.embedding })
          .eq(idColumn, recordId);
        
        if (updateError) {
          console.log(`❌ ${recordId} (${recordName}): Update failed - ${updateError.message}`);
          stats.conversionFailed++;
          stats.failedRecords.push({ id: recordId, reason: `Update error: ${updateError.message}` });
        } else {
          console.log(`✅ ${recordId} (${recordName}): Converted successfully`);
          stats.convertedSuccessfully++;
        }
        
      } catch (error: any) {
        console.log(`💥 ${recordId} (${recordName}): Exception - ${error.message}`);
        stats.conversionFailed++;
        stats.failedRecords.push({ id: recordId, reason: `Exception: ${error.message}` });
      }
    }
    
    // Update offset and add delay
    offset += config.batchSize;
    batchNumber++;
    
    // Progress summary for this batch
    const processed = Math.min(offset, stats.totalRecords);
    const percentComplete = (processed / stats.totalRecords * 100).toFixed(1);
    console.log(`\n📈 Progress: ${processed}/${stats.totalRecords} (${percentComplete}%) | Converted: ${stats.convertedSuccessfully} | Failed: ${stats.conversionFailed}`);
    
    // Delay between batches to avoid overwhelming the database
    if (offset < stats.totalRecords) {
      console.log(`⏱️  Waiting ${config.delayBetweenBatches}ms before next batch...`);
      await delay(config.delayBetweenBatches);
    }
  }
  
  return stats;
}

function printConversionReport(report: ConversionReport): void {
  console.log('\n' + '='.repeat(70));
  console.log('                EMBEDDING CONVERSION REPORT');
  console.log('='.repeat(70));
  console.log(`📅 Conversion completed: ${report.timestamp}`);
  
  // Overall Summary
  console.log('\n📊 OVERALL SUMMARY');
  console.log('-'.repeat(50));
  console.log(`Total Records Processed: ${report.overallStats.totalProcessed}`);
  console.log(`Successfully Converted: ${report.overallStats.totalConverted}`);
  console.log(`Conversion Failed: ${report.overallStats.totalFailed}`);
  console.log(`Success Rate: ${report.overallStats.conversionRate.toFixed(2)}%`);
  
  // Table Details
  console.log('\n📋 TABLE BREAKDOWN');
  console.log('-'.repeat(50));
  
  for (const stats of report.tableStats) {
    const tableSuccessRate = stats.stringEmbeddings > 0 
      ? (stats.convertedSuccessfully / stats.stringEmbeddings * 100).toFixed(2)
      : '0.00';
    
    console.log(`\n🔸 ${stats.tableName.toUpperCase()}`);
    console.log(`   Total Records: ${stats.totalRecords}`);
    console.log(`   📝 String Embeddings Found: ${stats.stringEmbeddings}`);
    console.log(`   📦 Already Array Format: ${stats.arrayEmbeddings}`);
    console.log(`   ✅ Converted Successfully: ${stats.convertedSuccessfully}`);
    console.log(`   ❌ Conversion Failed: ${stats.conversionFailed}`);
    console.log(`   ⚠️  Invalid/Skipped: ${stats.invalidEmbeddings + stats.skipped - stats.arrayEmbeddings}`);
    console.log(`   📊 Conversion Success Rate: ${tableSuccessRate}%`);
    
    // Show failed records (limit to first 10)
    if (stats.failedRecords.length > 0) {
      console.log(`\n   ❌ Failed conversions (showing first 10):`);
      stats.failedRecords.slice(0, 10).forEach(failure => {
        console.log(`      - ID: ${failure.id}, Reason: ${failure.reason}`);
      });
      if (stats.failedRecords.length > 10) {
        console.log(`      ... and ${stats.failedRecords.length - 10} more`);
      }
    }
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(50));
  
  if (report.overallStats.totalConverted > 0) {
    console.log('✅ Run the verification script again to confirm embeddings are now recognized as arrays');
    console.log('✅ Your similarity searches should now perform better');
  }
  
  if (report.overallStats.totalFailed > 0) {
    console.log('⚠️  Review failed conversions above');
    console.log('⚠️  Consider re-running embedding generation for failed records');
  }
  
  console.log('\n' + '='.repeat(70));
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting Embedding Format Conversion...\n');
    
    validateConfig();
    initializeClient();
    
    console.log(`📋 Configuration:`);
    console.log(`   Expected Dimension: ${config.expectedEmbeddingDimension}`);
    console.log(`   Batch Size: ${config.batchSize}`);
    console.log(`   Tables to Convert: ${config.tablesToConvert.map(t => t.tableName).join(', ')}`);
    
    // Confirm before proceeding
    console.log('\n⚠️  WARNING: This will modify your database!');
    console.log('📝 This script will convert string embeddings to array format.');
    console.log('💾 Consider backing up your database before proceeding.\n');
    
    // For safety, require manual confirmation in production
    const args = process.argv.slice(2);
    const forceMode = args.includes('--force') || args.includes('-f');
    
    if (!forceMode) {
      console.log('🛡️  Safety Check: Add --force flag to run the conversion:');
      console.log('   npx tsx convert-embeddings.ts --force');
      console.log('\nThis ensures you intentionally want to modify your database.');
      process.exit(0);
    }
    
    console.log('🔄 Starting conversion process...\n');
    
    const tableStats: ConversionStats[] = [];
    
    // Convert each table
    for (const tableConfig of config.tablesToConvert) {
      const stats = await convertTableEmbeddings(tableConfig);
      tableStats.push(stats);
    }
    
    // Generate report
    const totalProcessed = tableStats.reduce((sum, stat) => sum + stat.stringEmbeddings, 0);
    const totalConverted = tableStats.reduce((sum, stat) => sum + stat.convertedSuccessfully, 0);
    const totalFailed = tableStats.reduce((sum, stat) => sum + stat.conversionFailed, 0);
    
    const report: ConversionReport = {
      timestamp: new Date().toISOString(),
      overallStats: {
        totalProcessed,
        totalConverted,
        totalFailed,
        conversionRate: totalProcessed > 0 ? (totalConverted / totalProcessed) * 100 : 0
      },
      tableStats
    };
    
    // Print and save report
    printConversionReport(report);
    
    // Save detailed report to file
    const fs = await import('fs');
    const reportPath = `./embedding_conversion_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Final message
    if (totalConverted > 0) {
      console.log('\n🎉 Conversion completed successfully!');
      console.log('✨ Your embeddings are now stored as proper arrays for better performance.');
      console.log('🔍 Run your verification script again to see the improved results.');
    } else {
      console.log('\n🤷 No string embeddings found to convert.');
      console.log('🎯 Your embeddings may already be in the correct format.');
    }
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n💥 CONVERSION ERROR');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// --- CLI Help ---
const args = process.argv.slice(2);
const helpArg = args.includes('--help') || args.includes('-h');

if (helpArg) {
  console.log(`
🔄 Embedding Format Conversion Script

This script converts string-stored embeddings to proper array format 
for better performance and compatibility.

Usage:
  npx tsx convert-embeddings.ts --force

Options:
  --force, -f    Required flag to confirm you want to modify the database
  --help, -h     Show this help message

What this script does:
  ✅ Finds all embeddings stored as JSON strings
  ✅ Parses them into proper number arrays
  ✅ Updates the database with array format
  ✅ Provides detailed conversion report
  ✅ Handles errors gracefully with batch processing

Safety Features:
  🛡️  Requires --force flag to prevent accidental runs
  📊 Processes in batches to avoid database overload
  ⏱️  Adds delays between batches
  📝 Detailed logging and error reporting
  💾 Saves conversion report to file

Environment Variables Required:
  - VITE_SUPABASE_URL: Your Supabase project URL
  - SUPABASE_SERVICE_KEY: Your Supabase service role key
  - EMBEDDING_DIMENSIONALITY: Expected dimension (default: 1536)

Example:
  npx tsx convert-embeddings.ts --force
  `);
  process.exit(0);
}

// Run the conversion
main();