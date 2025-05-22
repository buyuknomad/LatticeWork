import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// --- Configuration ---
interface VerificationConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  expectedEmbeddingDimension: number;
  tablesToVerify: Array<{
    tableName: 'mental_models' | 'cognitive_biases';
    idColumn: string;
    embeddingColumn: string;
    textFields: string[];
  }>;
}

const config: VerificationConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  expectedEmbeddingDimension: parseInt(process.env.EMBEDDING_DIMENSIONALITY || '1536', 10),
  tablesToVerify: [
    {
      tableName: 'mental_models',
      idColumn: 'id',
      embeddingColumn: 'embedding',
      textFields: ['name', 'category', 'summary']
    },
    {
      tableName: 'cognitive_biases',
      idColumn: 'id',
      embeddingColumn: 'embedding',
      textFields: ['name', 'category', 'summary']
    }
  ]
};

// --- Types ---
interface EmbeddingRecord {
  id: string | number;
  name?: string;
  category?: string;
  summary?: string;
  embedding?: number[] | null;
  [key: string]: any;
}

interface TableStats {
  tableName: string;
  totalRecords: number;
  recordsWithEmbeddings: number;
  recordsWithoutEmbeddings: number;
  invalidEmbeddings: number;
  correctDimensionEmbeddings: number;
  wrongDimensionEmbeddings: number;
  emptyTextRecords: number;
  averageEmbeddingLength: number;
  sampleEmbeddingValues: number[];
  recordsWithoutEmbeddingsList: Array<{ id: string | number; name?: string; reason: string }>;
  wrongDimensionRecords: Array<{ id: string | number; name?: string; actualDimension: number }>;
}

interface VerificationReport {
  timestamp: string;
  config: VerificationConfig;
  tableStats: TableStats[];
  overallSummary: {
    totalTables: number;
    totalRecords: number;
    totalWithEmbeddings: number;
    totalWithoutEmbeddings: number;
    overallSuccessRate: number;
  };
  issues: string[];
  recommendations: string[];
}

// --- Global Client ---
let supabase: SupabaseClient;

// --- Validation Functions ---
function validateConfig(): void {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Missing required Supabase configuration. Check VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file.');
  }
  
  if (config.expectedEmbeddingDimension <= 0) {
    throw new Error('expectedEmbeddingDimension must be greater than 0');
  }
  
  console.log('✓ Configuration validation passed');
}

function initializeClient(): void {
  try {
    supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    console.log('✓ Supabase client initialized');
  } catch (error: any) {
    throw new Error(`Failed to initialize Supabase client: ${error.message}`);
  }
}

// --- Verification Functions ---
function isValidEmbedding(embedding: any): boolean {
  return Array.isArray(embedding) && 
         embedding.length > 0 && 
         embedding.every(val => typeof val === 'number' && !isNaN(val));
}

function hasTextContent(record: EmbeddingRecord, textFields: string[]): boolean {
  return textFields.some(field => 
    record[field] && 
    typeof record[field] === 'string' && 
    record[field].trim().length > 0
  );
}

function calculateEmbeddingStats(embeddings: (number[] | null)[]): { average: number; sample: number[] } {
  const validEmbeddings = embeddings.filter(emb => emb !== null) as number[][];
  const lengths = validEmbeddings.map(emb => emb.length);
  const averageLength = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  
  // Get a sample of the first valid embedding's first 5 values
  const sampleValues = validEmbeddings.length > 0 ? validEmbeddings[0].slice(0, 5) : [];
  
  return { average: averageLength, sample: sampleValues };
}

async function verifyTableEmbeddings(tableConfig: VerificationConfig['tablesToVerify'][0]): Promise<TableStats> {
  const { tableName, idColumn, embeddingColumn, textFields } = tableConfig;
  console.log(`\n--- Verifying Table: ${tableName} ---`);
  
  // Fetch all records with relevant fields
  const selectFields = [idColumn, embeddingColumn, ...textFields].join(', ');
  const { data: records, error } = await supabase
    .from(tableName)
    .select(selectFields);
  
  if (error) {
    throw new Error(`Failed to fetch records from ${tableName}: ${error.message}`);
  }
  
  if (!records) {
    throw new Error(`No data returned from ${tableName}`);
  }
  
  console.log(`Fetched ${records.length} records from ${tableName}`);
  
  // Initialize stats
  const stats: TableStats = {
    tableName,
    totalRecords: records.length,
    recordsWithEmbeddings: 0,
    recordsWithoutEmbeddings: 0,
    invalidEmbeddings: 0,
    correctDimensionEmbeddings: 0,
    wrongDimensionEmbeddings: 0,
    emptyTextRecords: 0,
    averageEmbeddingLength: 0,
    sampleEmbeddingValues: [],
    recordsWithoutEmbeddingsList: [],
    wrongDimensionRecords: []
  };
  
  const allEmbeddings: (number[] | null)[] = [];
  
  // Analyze each record
  for (const record of records as EmbeddingRecord[]) {
    const recordId = record[idColumn];
    const embedding = record[embeddingColumn];
    const hasText = hasTextContent(record, textFields);
    
    if (!hasText) {
      stats.emptyTextRecords++;
    }
    
    if (embedding === null || embedding === undefined) {
      stats.recordsWithoutEmbeddings++;
      stats.recordsWithoutEmbeddingsList.push({
        id: recordId,
        name: record.name,
        reason: !hasText ? 'No text content' : 'Missing embedding'
      });
      allEmbeddings.push(null);
    } else if (!isValidEmbedding(embedding)) {
      stats.recordsWithoutEmbeddings++;
      stats.invalidEmbeddings++;
      stats.recordsWithoutEmbeddingsList.push({
        id: recordId,
        name: record.name,
        reason: 'Invalid embedding format'
      });
      allEmbeddings.push(null);
    } else {
      stats.recordsWithEmbeddings++;
      allEmbeddings.push(embedding);
      
      // Check dimensions
      if (embedding.length === config.expectedEmbeddingDimension) {
        stats.correctDimensionEmbeddings++;
      } else {
        stats.wrongDimensionEmbeddings++;
        stats.wrongDimensionRecords.push({
          id: recordId,
          name: record.name,
          actualDimension: embedding.length
        });
      }
    }
  }
  
  // Calculate embedding statistics
  const embeddingStats = calculateEmbeddingStats(allEmbeddings);
  stats.averageEmbeddingLength = embeddingStats.average;
  stats.sampleEmbeddingValues = embeddingStats.sample;
  
  return stats;
}

function generateReport(tableStats: TableStats[]): VerificationReport {
  const totalRecords = tableStats.reduce((sum, stat) => sum + stat.totalRecords, 0);
  const totalWithEmbeddings = tableStats.reduce((sum, stat) => sum + stat.recordsWithEmbeddings, 0);
  const totalWithoutEmbeddings = tableStats.reduce((sum, stat) => sum + stat.recordsWithoutEmbeddings, 0);
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze issues and generate recommendations
  for (const stat of tableStats) {
    if (stat.recordsWithoutEmbeddings > 0) {
      issues.push(`${stat.tableName}: ${stat.recordsWithoutEmbeddings} records missing embeddings`);
    }
    
    if (stat.wrongDimensionEmbeddings > 0) {
      issues.push(`${stat.tableName}: ${stat.wrongDimensionEmbeddings} records have wrong embedding dimensions`);
    }
    
    if (stat.invalidEmbeddings > 0) {
      issues.push(`${stat.tableName}: ${stat.invalidEmbeddings} records have invalid embedding format`);
    }
    
    if (stat.emptyTextRecords > 0) {
      issues.push(`${stat.tableName}: ${stat.emptyTextRecords} records have no text content to embed`);
    }
    
    // Generate recommendations
    if (stat.recordsWithoutEmbeddings > 0) {
      recommendations.push(`Re-run embedding script for ${stat.tableName} to process ${stat.recordsWithoutEmbeddings} missing embeddings`);
    }
    
    if (stat.wrongDimensionEmbeddings > 0) {
      recommendations.push(`Check embedding model configuration for ${stat.tableName} - expected ${config.expectedEmbeddingDimension} dimensions`);
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    config,
    tableStats,
    overallSummary: {
      totalTables: tableStats.length,
      totalRecords,
      totalWithEmbeddings,
      totalWithoutEmbeddings,
      overallSuccessRate: totalRecords > 0 ? (totalWithEmbeddings / totalRecords) * 100 : 0
    },
    issues,
    recommendations
  };
}

function printReport(report: VerificationReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('           EMBEDDING VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log(`Report Generated: ${report.timestamp}`);
  console.log(`Expected Embedding Dimension: ${report.config.expectedEmbeddingDimension}`);
  
  // Overall Summary
  console.log('\n📊 OVERALL SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Total Tables Verified: ${report.overallSummary.totalTables}`);
  console.log(`Total Records: ${report.overallSummary.totalRecords}`);
  console.log(`Records with Embeddings: ${report.overallSummary.totalWithEmbeddings}`);
  console.log(`Records without Embeddings: ${report.overallSummary.totalWithoutEmbeddings}`);
  console.log(`Overall Success Rate: ${report.overallSummary.overallSuccessRate.toFixed(2)}%`);
  
  // Table Details
  console.log('\n📋 TABLE DETAILS');
  console.log('-'.repeat(40));
  
  for (const stat of report.tableStats) {
    const successRate = stat.totalRecords > 0 ? (stat.recordsWithEmbeddings / stat.totalRecords) * 100 : 0;
    
    console.log(`\n🔸 ${stat.tableName.toUpperCase()}`);
    console.log(`   Total Records: ${stat.totalRecords}`);
    console.log(`   ✅ With Embeddings: ${stat.recordsWithEmbeddings}`);
    console.log(`   ❌ Without Embeddings: ${stat.recordsWithoutEmbeddings}`);
    console.log(`   ⚠️  Invalid Embeddings: ${stat.invalidEmbeddings}`);
    console.log(`   📏 Correct Dimensions: ${stat.correctDimensionEmbeddings}`);
    console.log(`   📐 Wrong Dimensions: ${stat.wrongDimensionEmbeddings}`);
    console.log(`   📝 Empty Text Records: ${stat.emptyTextRecords}`);
    console.log(`   📊 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`   📏 Avg Embedding Length: ${stat.averageEmbeddingLength.toFixed(1)}`);
    
    if (stat.sampleEmbeddingValues.length > 0) {
      console.log(`   🔢 Sample Values: [${stat.sampleEmbeddingValues.map(v => v.toFixed(4)).join(', ')}...]`);
    }
    
    // Show problematic records (limited to first 10)
    if (stat.recordsWithoutEmbeddingsList.length > 0) {
      console.log(`   \n   Records without embeddings (showing first 10):`);
      stat.recordsWithoutEmbeddingsList.slice(0, 10).forEach(record => {
        console.log(`     - ID: ${record.id}, Name: "${record.name || 'N/A'}", Reason: ${record.reason}`);
      });
      if (stat.recordsWithoutEmbeddingsList.length > 10) {
        console.log(`     ... and ${stat.recordsWithoutEmbeddingsList.length - 10} more`);
      }
    }
    
    if (stat.wrongDimensionRecords.length > 0) {
      console.log(`   \n   Records with wrong dimensions:`);
      stat.wrongDimensionRecords.forEach(record => {
        console.log(`     - ID: ${record.id}, Name: "${record.name || 'N/A'}", Actual: ${record.actualDimension}, Expected: ${config.expectedEmbeddingDimension}`);
      });
    }
  }
  
  // Issues
  if (report.issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND');
    console.log('-'.repeat(40));
    report.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ NO ISSUES FOUND');
    console.log('-'.repeat(40));
    console.log('All embeddings appear to be properly generated and stored!');
  }
  
  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-'.repeat(40));
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

// --- Main Function ---
async function main(): Promise<void> {
  try {
    console.log('🔍 Starting Embedding Verification...\n');
    
    validateConfig();
    initializeClient();
    
    const tableStats: TableStats[] = [];
    
    // Verify each table
    for (const tableConfig of config.tablesToVerify) {
      const stats = await verifyTableEmbeddings(tableConfig);
      tableStats.push(stats);
    }
    
    // Generate and print report
    const report = generateReport(tableStats);
    printReport(report);
    
    // Save report to file
    const fs = await import('fs');
    const reportPath = `./embedding_verification_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    const hasIssues = report.issues.length > 0;
    if (hasIssues) {
      console.log('\n❌ Verification completed with issues. See report above.');
      process.exit(1);
    } else {
      console.log('\n✅ Verification completed successfully!');
      process.exit(0);
    }
    
  } catch (error: any) {
    console.error('\n💥 VERIFICATION ERROR');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// --- CLI Options ---
const args = process.argv.slice(2);
const helpArg = args.includes('--help') || args.includes('-h');

if (helpArg) {
  console.log(`
🔍 Embedding Verification Script

This script verifies that embeddings have been correctly generated and stored
in your Supabase database tables.

Usage:
  npm run verify-embeddings
  node verify-embeddings.js

The script will:
  ✓ Check all configured tables for embedding completeness
  ✓ Validate embedding dimensions match expected values  
  ✓ Identify records with missing or invalid embeddings
  ✓ Generate a comprehensive verification report
  ✓ Save detailed results to a JSON file

Environment Variables Required:
  - VITE_SUPABASE_URL: Your Supabase project URL
  - SUPABASE_SERVICE_KEY: Your Supabase service role key
  - EMBEDDING_DIMENSIONALITY: Expected embedding dimension (default: 1536)

Exit Codes:
  0: All embeddings verified successfully
  1: Issues found or verification error
  `);
  process.exit(0);
}

// Run the verification
main();