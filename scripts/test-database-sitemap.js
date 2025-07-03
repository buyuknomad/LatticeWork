// scripts/test-database-sitemap.js
// Test script to verify database-based sitemap generation works

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

async function testDatabaseSitemap() {
  console.log('🧪 Testing database-based sitemap generation...\n');

  // Check environment variables
  console.log('🔧 Environment check:');
  console.log(`   - VITE_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Not set'}`);
  console.log(`   - SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? 'Set' : 'Not set'}`);
  console.log(`   - VITE_APP_URL: ${process.env.VITE_APP_URL || 'Not set'}`);

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n⚠️  Supabase credentials not found - will use CSV fallback');
    console.log('💡 To test database mode, add your Supabase credentials to .env file');
    return false;
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('\n✅ Supabase client initialized');

  try {
    // Test database connection and fetch mental models
    console.log('\n📡 Testing database connection...');
    const { data: models, error } = await supabase
      .from('mental_models_library')
      .select('id, name, slug, category, order_index, created_at, updated_at')
      .order('order_index', { ascending: true })
      .limit(10); // Just get first 10 for testing

    if (error) {
      console.error('❌ Database query error:', error.message);
      return false;
    }

    if (!models || models.length === 0) {
      console.log('⚠️  No mental models found in database');
      return false;
    }

    console.log(`✅ Successfully fetched ${models.length} mental models (showing first 10)`);

    // Test data structure
    console.log('\n📊 Sample mental models data:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. "${model.name}" → slug: "${model.slug}" → category: "${model.category}"`);
    });

    // Test category extraction
    console.log('\n📂 Testing category extraction...');
    const { data: allModels, error: categoryError } = await supabase
      .from('mental_models_library')
      .select('category')
      .not('category', 'is', null);

    if (categoryError) {
      console.error('❌ Category query error:', categoryError.message);
      return false;
    }

    const uniqueCategories = [...new Set(allModels.map(m => m.category))];
    console.log(`✅ Found ${uniqueCategories.length} unique categories:`);
    uniqueCategories.forEach(category => {
      console.log(`   - ${category}`);
    });

    // Test total count
    const { count, error: countError } = await supabase
      .from('mental_models_library')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count query error:', countError.message);
      return false;
    }

    console.log(`\n📈 Total mental models in database: ${count}`);

    // Generate sample URLs
    console.log('\n🌐 Sample URLs that will be generated:');
    models.forEach(model => {
      console.log(`   https://mindlattice.app/mental-models/${model.slug}`);
    });

    console.log('\n🎯 Category URLs that will be generated:');
    uniqueCategories.slice(0, 5).forEach(category => {
      console.log(`   https://mindlattice.app/mental-models/category/${category}`);
    });

    console.log('\n🎉 Database sitemap test completed successfully!');
    console.log(`✅ Ready to generate sitemap with ${count} mental models from database`);
    
    return true;

  } catch (error) {
    console.error('❌ Error testing database sitemap:', error);
    return false;
  }
}

// Run the test
testDatabaseSitemap().catch(console.error);