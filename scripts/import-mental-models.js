#!/usr/bin/env node

/**
 * Mental Models Database Seeder
 * 
 * This script reads mental models from Batch1.json and inserts them into the 
 * mental_models_library table in Supabase.
 * 
 * Prerequisites:
 * 1. npm install @supabase/supabase-js dotenv
 * 2. Ensure your .env file has SUPABASE_SERVICE_KEY and VITE_SUPABASE_URL
 * 3. Place Batch1.json in the same directory as this script
 * 
 * Usage: node insert-mental-models.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '❌')
  console.error('   - SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '❌')
  process.exit(1)
}

// Create Supabase client with service key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Generate a URL-friendly slug from a model name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Validate mental model data structure
 */
function validateMentalModel(model, index) {
  const required = ['name', 'slug', 'category', 'core_concept', 'detailed_explanation']
  const missing = required.filter(field => !model[field])
  
  if (missing.length > 0) {
    throw new Error(`Model ${index + 1} missing required fields: ${missing.join(', ')}`)
  }
  
  // Validate array fields
  const arrayFields = ['expanded_examples', 'use_cases', 'common_pitfalls', 'reflection_questions', 'related_model_slugs']
  arrayFields.forEach(field => {
    if (model[field] && !Array.isArray(model[field])) {
      throw new Error(`Model ${index + 1}: ${field} must be an array`)
    }
  })
  
  // Validate expanded_examples structure
  if (model.expanded_examples) {
    model.expanded_examples.forEach((example, i) => {
      if (!example.title || !example.content) {
        throw new Error(`Model ${index + 1}: expanded_examples[${i}] missing title or content`)
      }
    })
  }
  
  return true
}

/**
 * Insert a mental model into the database
 */
async function insertMentalModel(model) {
  const { data, error } = await supabase
    .from('mental_models_library')
    .insert([{
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
    }])
    .select()
  
  if (error) {
    throw error
  }
  
  return data[0]
}

/**
 * Check if a mental model already exists
 */
async function checkExistingModel(slug) {
  const { data, error } = await supabase
    .from('mental_models_library')
    .select('id, name')
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw error
  }
  
  return data
}

/**
 * Main function to process the batch file
 */
async function processBatch() {
  console.log('🧠 Mental Models Database Seeder')
  console.log('================================')
  
  // Read the JSON file
  const filePath = path.join(__dirname, 'Batch3.json')
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    console.log('💡 Make sure Batch1.json is in the same directory as this script')
    process.exit(1)
  }
  
  let mentalModels
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    mentalModels = JSON.parse(fileContent)
  } catch (error) {
    console.error('❌ Error reading or parsing Batch1.json:', error.message)
    process.exit(1)
  }
  
  if (!Array.isArray(mentalModels)) {
    console.error('❌ Batch1.json should contain an array of mental models')
    process.exit(1)
  }
  
  console.log(`📁 Found ${mentalModels.length} mental models in Batch1.json`)
  
  // Validate all models first
  console.log('🔍 Validating data structure...')
  try {
    mentalModels.forEach((model, index) => {
      validateMentalModel(model, index)
    })
    console.log('✅ All mental models are valid')
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    process.exit(1)
  }
  
  // Test database connection
  console.log('🔌 Testing database connection...')
  try {
    const { data, error } = await supabase
      .from('mental_models_library')
      .select('count')
      .limit(1)
    
    if (error) throw error
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
  
  // Process each mental model
  console.log('\n🚀 Starting import process...')
  const results = {
    inserted: 0,
    skipped: 0,
    errors: 0
  }
  
  for (let i = 0; i < mentalModels.length; i++) {
    const model = mentalModels[i]
    const progress = `[${i + 1}/${mentalModels.length}]`
    
    try {
      // Check if model already exists
      const existing = await checkExistingModel(model.slug)
      
      if (existing) {
        console.log(`⏭️  ${progress} Skipped "${model.name}" (already exists)`)
        results.skipped++
        continue
      }
      
      // Insert the model
      const inserted = await insertMentalModel(model)
      console.log(`✅ ${progress} Inserted "${model.name}" (ID: ${inserted.id})`)
      results.inserted++
      
    } catch (error) {
      console.error(`❌ ${progress} Failed to insert "${model.name}":`, error.message)
      results.errors++
    }
  }
  
  // Summary
  console.log('\n📊 Import Summary')
  console.log('=================')
  console.log(`✅ Inserted: ${results.inserted}`)
  console.log(`⏭️  Skipped: ${results.skipped}`)
  console.log(`❌ Errors: ${results.errors}`)
  console.log(`📱 Total: ${mentalModels.length}`)
  
  if (results.errors > 0) {
    console.log('\n⚠️  Some models failed to import. Check the errors above.')
    process.exit(1)
  } else {
    console.log('\n🎉 Import completed successfully!')
  }
}

// Run the script
processBatch().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})