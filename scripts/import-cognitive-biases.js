#!/usr/bin/env node

/**
 * Cognitive Biases Database Seeder
 * Handles 227 unique biases from 245 total IDs (18 duplicates)
 * 
 * Prerequisites:
 * 1. npm install @supabase/supabase-js dotenv
 * 2. Ensure your .env file has SUPABASE_SERVICE_KEY and VITE_SUPABASE_URL
 * 3. Place CognitiveBiasesBatch[N].json files in the scripts directory
 * 
 * Usage: 
 * node scripts/import-cognitive-biases.js [batch-number] - Import specific batch
 * node scripts/import-cognitive-biases.js all - Import all batches
 * node scripts/import-cognitive-biases.js check-duplicates - Verify duplicate handling
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Duplicate mappings from your implementation plan
const DUPLICATE_MAPPINGS = {
  'CB068': 'CB023', // Anchoring
  'CB081': 'CB018', // Negativity bias
  'CB212': 'CB018',
  'CB072': 'CB028', // Focusing effect
  'CB214': 'CB028',
  'CB070': 'CB026', // Contrast effect
  'CB071': 'CB027', // Distinction bias
  'CB073': 'CB029', // Framing effect
  'CB074': 'CB030', // Weber-Fechner law
  'CB226': 'CB037', // Egocentric bias
  'CB197': 'CB038', // Generation effect
  'CB077': 'CB041', // Humor effect
  'CB080': 'CB047', // Self-relevance effect
  'CB078': 'CB055', // Von Restorff effect
  'CB216': 'CB061', // Mere exposure effect
  'CB205': 'CB094', // Backfire effect
  'CB238': 'CB100', // Trait ascription bias
  'CB235': 'CB101', // Actor-observer bias
  'CB122': 'CB102', // Group attribution error
  'CB217': 'CB203'  // Pseudocertainty effect
};

/**
 * Check if this is a duplicate CB ID
 */
function isDuplicate(cbId) {
  return DUPLICATE_MAPPINGS.hasOwnProperty(cbId);
}

/**
 * Get the primary CB ID for a duplicate
 */
function getPrimaryId(cbId) {
  return DUPLICATE_MAPPINGS[cbId] || null;
}

/**
 * Validate cognitive bias data structure
 */
function validateCognitiveBias(bias, index) {
  const required = ['cb_id', 'name', 'slug', 'category', 'core_concept'];
  const missing = required.filter(field => !bias[field]);
  
  if (missing.length > 0) {
    throw new Error(`Bias ${index + 1} missing required fields: ${missing.join(', ')}`);
  }
  
  // For duplicates, we only need minimal data
  if (isDuplicate(bias.cb_id)) {
    return true;
  }
  
  // For unique biases, check all fields
  if (!bias.detailed_explanation) {
    throw new Error(`Bias ${bias.cb_id} missing detailed_explanation (required for unique biases)`);
  }
  
  const arrayFields = [
    'recognition_strategies', 
    'mitigation_approaches', 
    'common_contexts', 
    'reflection_questions',
    'related_bias_ids'
  ];
  
  arrayFields.forEach(field => {
    if (bias[field] && !Array.isArray(bias[field])) {
      throw new Error(`Bias ${bias.cb_id}: ${field} must be an array`);
    }
  });
  
  if (bias.expanded_examples) {
    if (!Array.isArray(bias.expanded_examples)) {
      throw new Error(`Bias ${bias.cb_id}: expanded_examples must be an array`);
    }
    
    bias.expanded_examples.forEach((example, i) => {
      if (!example.title || !example.content) {
        throw new Error(`Bias ${bias.cb_id}: expanded_examples[${i}] missing title or content`);
      }
    });
  }
  
  return true;
}

/**
 * Insert or update a cognitive bias
 */
async function insertCognitiveBias(bias, batchNumber) {
  const isDup = isDuplicate(bias.cb_id);
  const primaryId = getPrimaryId(bias.cb_id);
  
  const dataToInsert = {
    cb_id: bias.cb_id,
    name: bias.name,
    slug: bias.slug,
    category: bias.category,
    core_concept: bias.core_concept,
    is_duplicate: isDup,
    duplicate_of_id: primaryId,
    order_index: bias.order_index,
    batch_number: batchNumber
  };
  
  // Only add detailed fields for non-duplicates
  if (!isDup) {
    Object.assign(dataToInsert, {
      detailed_explanation: bias.detailed_explanation,
      expanded_examples: JSON.stringify(bias.expanded_examples || []),
      recognition_strategies: JSON.stringify(bias.recognition_strategies || []),
      mitigation_approaches: JSON.stringify(bias.mitigation_approaches || []),
      common_contexts: JSON.stringify(bias.common_contexts || []),
      reflection_questions: JSON.stringify(bias.reflection_questions || []),
      related_bias_ids: JSON.stringify(bias.related_bias_ids || [])
    });
  } else {
    // For duplicates, set empty arrays
    Object.assign(dataToInsert, {
      detailed_explanation: `See primary bias: ${primaryId}`,
      expanded_examples: JSON.stringify([]),
      recognition_strategies: JSON.stringify([]),
      mitigation_approaches: JSON.stringify([]),
      common_contexts: JSON.stringify([]),
      reflection_questions: JSON.stringify([]),
      related_bias_ids: JSON.stringify([])
    });
  }
  
  const { data, error } = await supabase
    .from('cognitive_biases_library')
    .insert([dataToInsert])
    .select();
  
  if (error) throw error;
  
  return data[0];
}

/**
 * Check if a bias already exists
 */
async function checkExistingBias(cbId) {
  const { data, error } = await supabase
    .from('cognitive_biases_library')
    .select('id, name, cb_id')
    .eq('cb_id', cbId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  return data;
}

/**
 * Process a single batch file
 */
async function processBatch(batchNumber) {
  const fileName = `CognitiveBiasesBatch${batchNumber}.json`;
  const filePath = path.join(__dirname, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return { inserted: 0, skipped: 0, duplicates: 0, errors: 0, total: 0 };
  }
  
  let cognitiveBiases;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    cognitiveBiases = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Error reading ${fileName}:`, error.message);
    return { inserted: 0, skipped: 0, duplicates: 0, errors: 0, total: 0 };
  }
  
  console.log(`\n📁 Processing Batch ${batchNumber}: ${cognitiveBiases.length} biases`);
  
  // Validate all biases first
  try {
    cognitiveBiases.forEach((bias, index) => {
      validateCognitiveBias(bias, index);
    });
    console.log('✅ Validation passed for all biases');
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return { inserted: 0, skipped: 0, duplicates: 0, errors: 0, total: cognitiveBiases.length };
  }
  
  const results = {
    inserted: 0,
    skipped: 0,
    duplicates: 0,
    errors: 0,
    total: cognitiveBiases.length
  };
  
  for (let i = 0; i < cognitiveBiases.length; i++) {
    const bias = cognitiveBiases[i];
    const progress = `[${i + 1}/${cognitiveBiases.length}]`;
    
    try {
      // Check if bias already exists
      const existing = await checkExistingBias(bias.cb_id);
      
      if (existing) {
        console.log(`⏭️  ${progress} Skipped ${bias.cb_id} "${bias.name}" (already exists)`);
        results.skipped++;
        continue;
      }
      
      // Insert the bias
      const inserted = await insertCognitiveBias(bias, batchNumber);
      
      if (isDuplicate(bias.cb_id)) {
        console.log(`✅ ${progress} Inserted duplicate ${bias.cb_id} "${bias.name}" (references ${getPrimaryId(bias.cb_id)})`);
        results.duplicates++;
      } else {
        console.log(`✅ ${progress} Inserted ${bias.cb_id} "${bias.name}"`);
      }
      results.inserted++;
      
    } catch (error) {
      console.error(`❌ ${progress} Failed ${bias.cb_id} "${bias.name}":`, error.message);
      results.errors++;
    }
  }
  
  return results;
}

/**
 * Update all related bias slugs after import
 */
async function updateAllRelatedSlugs() {
  console.log('\n🔗 Updating related bias slugs...');
  
  try {
    // Call the database function to update slugs
    const { error } = await supabase.rpc('update_related_bias_slugs');
    
    if (error) {
      console.error('❌ Error updating related slugs:', error);
      return;
    }
    
    console.log('✅ Related bias slugs updated successfully');
  } catch (error) {
    console.error('❌ Error in updateAllRelatedSlugs:', error);
  }
}

/**
 * Verify duplicate handling
 */
async function checkDuplicates() {
  console.log('\n🔍 Checking duplicate handling...');
  
  const { data: duplicates, error } = await supabase
    .from('cognitive_biases_library')
    .select('cb_id, name, duplicate_of_id')
    .eq('is_duplicate', true);
  
  if (error) {
    console.error('Error checking duplicates:', error);
    return;
  }
  
  console.log(`\nFound ${duplicates.length} duplicate entries:`);
  duplicates.forEach(dup => {
    console.log(`  ${dup.cb_id} "${dup.name}" → references ${dup.duplicate_of_id}`);
  });
  
  // Verify all expected duplicates are marked
  const expectedDuplicates = Object.keys(DUPLICATE_MAPPINGS);
  const foundDuplicates = duplicates.map(d => d.cb_id);
  const missing = expectedDuplicates.filter(id => !foundDuplicates.includes(id));
  
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing duplicate entries: ${missing.join(', ')}`);
  } else {
    console.log('\n✅ All expected duplicates are properly marked');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧠 Cognitive Biases Database Seeder');
  console.log('====================================');
  console.log('Total: 245 IDs | Unique: 227 | Duplicates: 18');
  
  const arg = process.argv[2];
  
  // Test database connection
  console.log('\n🔌 Testing database connection...');
  try {
    const { error } = await supabase
      .from('cognitive_biases_library')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your Supabase credentials in .env file');
    process.exit(1);
  }
  
  let totalResults = {
    inserted: 0,
    skipped: 0,
    duplicates: 0,
    errors: 0,
    total: 0
  };
  
  if (arg === 'all') {
    console.log('\n🚀 Processing all batches...');
    
    for (let batch = 1; batch <= 25; batch++) {
      const results = await processBatch(batch);
      totalResults.inserted += results.inserted;
      totalResults.skipped += results.skipped;
      totalResults.duplicates += results.duplicates;
      totalResults.errors += results.errors;
      totalResults.total += results.total;
    }
    
    // Update all related slugs after full import
    await updateAllRelatedSlugs();
    
  } else if (arg === 'check-duplicates') {
    await checkDuplicates();
    return;
    
  } else if (arg && !isNaN(parseInt(arg))) {
    const batchNumber = parseInt(arg);
    if (batchNumber < 1 || batchNumber > 25) {
      console.error('❌ Batch number must be between 1 and 25');
      process.exit(1);
    }
    console.log(`\n🚀 Processing batch ${batchNumber}...`);
    totalResults = await processBatch(batchNumber);
    
  } else {
    console.log('\n📖 Usage:');
    console.log('  node scripts/import-cognitive-biases.js [batch]   - Import specific batch (1-25)');
    console.log('  node scripts/import-cognitive-biases.js all       - Import all batches');
    console.log('  node scripts/import-cognitive-biases.js check-duplicates - Verify duplicates');
    console.log('\n💡 Starting with batch 1 by default...');
    totalResults = await processBatch(1);
  }
  
  // Summary
  console.log('\n📊 Import Summary');
  console.log('=================');
  console.log(`✅ Inserted: ${totalResults.inserted}`);
  if (totalResults.duplicates > 0) {
    console.log(`   Including ${totalResults.duplicates} duplicate references`);
  }
  console.log(`⏭️  Skipped: ${totalResults.skipped}`);
  console.log(`❌ Errors: ${totalResults.errors}`);
  console.log(`📱 Total Processed: ${totalResults.total}`);
  
  // Get and display current stats
  try {
    const { data: stats } = await supabase.rpc('get_cognitive_bias_stats');
    if (stats && stats[0]) {
      console.log('\n📈 Database Statistics:');
      console.log(`   Total Biases: ${stats[0].total_biases}`);
      console.log(`   Unique Biases: ${stats[0].unique_biases}`);
      console.log(`   Duplicate References: ${stats[0].duplicate_biases}`);
      console.log(`   Categories: ${stats[0].categories_count}`);
      console.log(`   Batches Imported: ${stats[0].batches_imported}`);
    }
  } catch (error) {
    console.error('Could not fetch stats:', error.message);
  }
  
  if (totalResults.errors > 0) {
    console.log('\n⚠️  Some biases failed to import. Check the errors above.');
    process.exit(1);
  } else if (totalResults.inserted > 0) {
    console.log('\n🎉 Import completed successfully!');
  } else {
    console.log('\n✅ No new biases to import.');
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});