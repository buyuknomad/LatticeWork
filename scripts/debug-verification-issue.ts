import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

async function debugVerificationIssue() {
  console.log('🔍 Debugging why verification script shows "invalid format"...\n');

  // Get a few records that the verification script claims are "invalid"
  const tables = ['mental_models', 'cognitive_biases'];
  
  for (const tableName of tables) {
    console.log(`--- Checking ${tableName} ---`);
    
    const { data: records, error } = await supabase
      .from(tableName)
      .select('id, name, embedding')
      .not('embedding', 'is', null)
      .limit(3);

    if (error) {
      console.error(`Error: ${error.message}`);
      continue;
    }

    if (!records || records.length === 0) {
      console.log('❌ No records with embeddings found!');
      continue;
    }

    console.log(`Found ${records.length} records with embeddings:`);
    
    for (const record of records) {
      console.log(`\n🔸 ${record.id} (${record.name})`);
      console.log(`   Type: ${typeof record.embedding}`);
      console.log(`   Is Array: ${Array.isArray(record.embedding)}`);
      
      if (record.embedding) {
        if (typeof record.embedding === 'string') {
          console.log(`   String preview: ${record.embedding.substring(0, 100)}...`);
          try {
            const parsed = JSON.parse(record.embedding);
            console.log(`   ✅ Can parse as JSON: ${Array.isArray(parsed)}`);
            if (Array.isArray(parsed)) {
              console.log(`   Length: ${parsed.length}`);
              console.log(`   All numbers: ${parsed.every(v => typeof v === 'number')}`);
            }
          } catch (e) {
            console.log(`   ❌ Cannot parse as JSON`);
          }
        } else if (Array.isArray(record.embedding)) {
          console.log(`   ✅ Proper array format!`);
          console.log(`   Length: ${record.embedding.length}`);
          console.log(`   All numbers: ${record.embedding.every(v => typeof v === 'number')}`);
          console.log(`   Sample: [${record.embedding.slice(0, 5).map(v => v.toFixed(6)).join(', ')}...]`);
        } else {
          console.log(`   ❌ Unknown format: ${JSON.stringify(record.embedding).substring(0, 100)}`);
        }
      }
      
      // Test the verification logic manually
      console.log('\n   🧪 Manual Verification Test:');
      const embedding = record.embedding;
      
      // This is what your verification script might be checking
      const isArray = Array.isArray(embedding);
      const hasLength = embedding && embedding.length > 0;
      const allNumbers = embedding && embedding.every && embedding.every((val: any) => typeof val === 'number' && !isNaN(val));
      
      console.log(`     Is Array: ${isArray}`);
      console.log(`     Has Length: ${hasLength}`);
      console.log(`     All Numbers: ${allNumbers}`);
      console.log(`     Should be Valid: ${isArray && hasLength && allNumbers}`);
    }
  }
  
  // Check if embedding generation is actually running
  console.log('\n--- Checking Recent Activity ---');
  
  const { data: recentRecords, error: recentError } = await supabase
    .from('mental_models')
    .select('id, name, embedding, created_at')
    .not('embedding', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (recentError) {
    console.error('Could not check recent records:', recentError.message);
  } else if (recentRecords && recentRecords.length > 0) {
    console.log('Recent records with embeddings:');
    recentRecords.forEach(record => {
      console.log(`  ${record.id}: ${typeof record.embedding} (${Array.isArray(record.embedding) ? 'array' : 'not array'})`);
    });
  }
}

// Run the debug
debugVerificationIssue().catch(console.error);