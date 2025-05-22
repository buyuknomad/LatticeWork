import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

async function debugVectorStorage() {
  console.log('🔍 Debugging Vector Storage with Vector Column Type...\n');

  // 1. Confirm column types
  console.log('--- Step 1: Checking Column Types ---');
  const { data: columns, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('table_name, column_name, data_type, udt_name')
    .in('table_name', ['mental_models', 'cognitive_biases'])
    .eq('column_name', 'embedding');

  if (schemaError) {
    console.error('Error checking schema:', schemaError);
  } else {
    columns?.forEach(col => {
      console.log(`📋 ${col.table_name}.embedding:`);
      console.log(`   Data type: ${col.data_type}`);
      console.log(`   UDT name: ${col.udt_name}`);
    });
  }

  // 2. Test direct vector insertion
  console.log('\n--- Step 2: Testing Direct Vector Insertion ---');
  
  // Create a test embedding
  const testEmbedding = Array.from({length: 1536}, (_, i) => Math.random() - 0.5);
  console.log(`Test embedding type: ${typeof testEmbedding}`);
  console.log(`Test embedding is array: ${Array.isArray(testEmbedding)}`);
  console.log(`Test embedding length: ${testEmbedding.length}`);
  console.log(`Sample values: [${testEmbedding.slice(0, 5).map(v => v.toFixed(6)).join(', ')}...]`);

  // Try inserting into mental_models (adjust table/fields as needed)
  const testInsert = {
    name: 'DEBUG_TEST_RECORD',
    category: 'test',
    summary: 'This is a test record for debugging vector storage',
    embedding: testEmbedding
  };

  console.log('\n🧪 Attempting test insert...');
  const { data: insertData, error: insertError } = await supabase
    .from('mental_models')
    .insert(testInsert)
    .select('id, name, embedding');

  if (insertError) {
    console.error('❌ Insert failed:', insertError.message);
    console.error('Full error:', insertError);
  } else {
    console.log('✅ Insert successful!');
    const record = insertData?.[0];
    if (record) {
      console.log(`Inserted record ID: ${record.id}`);
      console.log(`Retrieved embedding type: ${typeof record.embedding}`);
      console.log(`Retrieved embedding is array: ${Array.isArray(record.embedding)}`);
      
      if (typeof record.embedding === 'string') {
        console.log('⚠️  ISSUE: Retrieved as string even with vector column!');
        console.log(`String preview: ${record.embedding.substring(0, 100)}...`);
        
        // Try parsing it
        try {
          const parsed = JSON.parse(record.embedding);
          console.log(`Can parse: ${Array.isArray(parsed)}, length: ${parsed?.length}`);
        } catch (e) {
          console.log(`Cannot parse as JSON: ${e.message}`);
        }
      } else if (Array.isArray(record.embedding)) {
        console.log('✅ Retrieved as proper array!');
        console.log(`Length: ${record.embedding.length}`);
      }

      // Clean up test record
      await supabase.from('mental_models').delete().eq('id', record.id);
      console.log('🧹 Test record cleaned up');
    }
  }

  // 3. Check existing data
  console.log('\n--- Step 3: Checking Existing Data ---');
  const { data: existingRecords, error: fetchError } = await supabase
    .from('mental_models')
    .select('id, name, embedding')
    .not('embedding', 'is', null)
    .limit(3);

  if (fetchError) {
    console.error('Error fetching existing records:', fetchError);
  } else {
    console.log(`Found ${existingRecords?.length || 0} existing records with embeddings`);
    
    existingRecords?.forEach((record, i) => {
      console.log(`\nRecord ${i + 1} (ID: ${record.id}):`);
      console.log(`  Type: ${typeof record.embedding}`);
      console.log(`  Is Array: ${Array.isArray(record.embedding)}`);
      
      if (typeof record.embedding === 'string') {
        console.log(`  ⚠️  String format detected`);
        console.log(`  Preview: ${record.embedding.substring(0, 50)}...`);
      } else if (Array.isArray(record.embedding)) {
        console.log(`  ✅ Array format, length: ${record.embedding.length}`);
      }
    });
  }

  // 4. Check Supabase client version
  console.log('\n--- Step 4: Environment Info ---');
  console.log(`Node.js version: ${process.version}`);
  
  // Try to get package versions
  try {
    const pkg = await import('../package.json');
    console.log(`@supabase/supabase-js version: ${pkg.dependencies?.['@supabase/supabase-js'] || 'Not found'}`);
  } catch (e) {
    console.log('Could not read package.json for version info');
  }

  console.log('\n--- Diagnosis ---');
  console.log(`
🔍 POSSIBLE CAUSES:

1️⃣ **Old Data**: Embeddings inserted before column was converted to vector type
   → Check if new test insert works correctly vs old data

2️⃣ **Supabase Client Issue**: Client serializing vectors to strings
   → Update @supabase/supabase-js to latest version

3️⃣ **Vector Extension Issue**: pgvector not handling arrays correctly
   → May need to explicitly cast or use different insert method

4️⃣ **TypeScript/JSON Serialization**: Data being auto-serialized somewhere
   → Check network tab or enable Supabase debug mode
  `);
}

// Run the debug
debugVectorStorage().catch(console.error);