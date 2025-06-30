const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Insert mental model function
async function insertMentalModel(model) {
  const { data, error } = await supabase
    .from('mental_models_library')
    .upsert({
      name: model.name,
      slug: model.slug,
      category: model.category,
      core_concept: model.core_concept,
      detailed_explanation: model.detailed_explanation,
      expanded_examples: model.expanded_examples || [],
      use_cases: model.use_cases || [],
      common_pitfalls: model.common_pitfalls || [],
      reflection_questions: model.reflection_questions || [],
      related_model_slugs: model.related_model_slugs || [],
      order_index: model.order_index,
      batch_number: model.batch_number
    }, {
      onConflict: 'slug',
      returning: 'minimal'
    });

  if (error) {
    throw new Error(`Error inserting ${model.name}: ${error.message}`);
  }

  return data;
}

// Main seeding function
async function seedMentalModels(jsonFilePath) {
  try {
    // Verify Supabase connection
    console.log('Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('mental_models_library')
      .select('count')
      .limit(1);
    
    if (testError) {
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }
    
    // Read JSON file
    console.log(`Reading data from ${jsonFilePath}...`);
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const mentalModels = JSON.parse(jsonData);
    
    // Validate that it's an array
    if (!Array.isArray(mentalModels)) {
      throw new Error('JSON file should contain an array of mental models');
    }
    
    console.log(`Found ${mentalModels.length} mental models to insert...`);
    
    // Insert each mental model
    let processedCount = 0;
    const errors = [];
    
    for (const model of mentalModels) {
      // Validate required fields
      if (!model.name || !model.slug || !model.core_concept || !model.detailed_explanation) {
        console.warn(`Skipping model with missing required fields:`, model.name || 'Unknown');
        continue;
      }
      
      try {
        await insertMentalModel(model);
        console.log(`✓ Processed: ${model.name} (${model.slug})`);
        processedCount++;
      } catch (error) {
        console.error(`✗ Error processing ${model.name}: ${error.message}`);
        errors.push({ model: model.name, error: error.message });
      }
    }
    
    console.log('\n🎉 Seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Attempted: ${mentalModels.length} models`);
    console.log(`   - Successfully processed: ${processedCount} models`);
    console.log(`   - Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(err => console.log(`   - ${err.model}: ${err.error}`));
    }
    
    // Get final count
    const { data: countData } = await supabase
      .from('mental_models_library')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   - Total in database: ${countData?.length || 'Unknown'}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    throw error;
  }
}

// Utility function to validate JSON structure
function validateMentalModel(model, index) {
  const required = ['name', 'slug', 'core_concept', 'detailed_explanation'];
  const missing = required.filter(field => !model[field]);
  
  if (missing.length > 0) {
    throw new Error(`Model at index ${index} is missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(model.slug)) {
    throw new Error(`Model "${model.name}" has invalid slug format: ${model.slug}`);
  }
  
  return true;
}

// Utility function to test connection and show table info
async function showTableInfo() {
  try {
    const { data, error, count } = await supabase
      .from('mental_models_library')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('Error accessing table:', error.message);
      return;
    }
    
    console.log(`\n📋 Table Info:`);
    console.log(`   - Total records: ${count}`);
    
    if (data && data.length > 0) {
      console.log(`   - Sample record: ${data[0].name} (${data[0].slug})`);
    }
    
  } catch (error) {
    console.error('Error getting table info:', error.message);
  }
}

// Main execution
async function main() {
  // Check environment variables
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.log('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
  
  const command = process.argv[2];
  
  if (command === 'info') {
    await showTableInfo();
    return;
  }
  
  const jsonFilePath = command || './Batch1.json';
  
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ JSON file not found: ${jsonFilePath}`);
    console.log('Usage:');
    console.log('  node supabase-seed.js [path-to-json-file]  # Seed data');
    console.log('  node supabase-seed.js info                 # Show table info');
    process.exit(1);
  }
  
  try {
    await seedMentalModels(jsonFilePath);
    console.log('\n✅ All done! Your mental models are now in Supabase.');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedMentalModels, validateMentalModel };