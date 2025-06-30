// scripts/import-mental-models.js
// Run this script to import your markdown batches into the database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Utility function to create URL-friendly slugs
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Parse markdown content into structured data
function parseMarkdownBatch(content, batchNumber) {
  const models = [];
  
  // Split content by model headers (## 1. Model Name, ## 2. Model Name, etc.)
  const modelSections = content.split(/(?=^## \d+\. )/gm).filter(section => section.trim());
  
  modelSections.forEach((section, index) => {
    try {
      const lines = section.split('\n');
      
      // Extract model name from header (## 1. The Map Is Not the Territory)
      const headerMatch = lines[0].match(/^## \d+\. (.+)$/);
      if (!headerMatch) return;
      
      const name = headerMatch[1].trim();
      const slug = createSlug(name);
      
      // Find core concept
      const coreConceptMatch = section.match(/\*\*Core Concept\*\*: (.+?)(?=\n\n|\n####)/s);
      const coreConceptRaw = coreConceptMatch ? coreConceptMatch[1].trim() : '';
      const coreConcept = coreConceptRaw.replace(/\n/g, ' '); // Join lines
      
      // Extract detailed explanation
      const explanationMatch = section.match(/#### Detailed Explanation\s*\n(.*?)(?=\n#### |$)/s);
      const detailedExplanation = explanationMatch ? explanationMatch[1].trim() : '';
      
      // Extract expanded examples
      const examplesMatch = section.match(/#### Expanded Examples\s*\n(.*?)(?=\n#### |$)/s);
      const expandedExamples = [];
      if (examplesMatch) {
        const examplesText = examplesMatch[1];
        // Find example sections starting with **Title**:
        const exampleMatches = examplesText.match(/\*\*([^*]+)\*\*: ([^*]+?)(?=\*\*[^*]+\*\*:|$)/gs);
        if (exampleMatches) {
          exampleMatches.forEach(match => {
            const titleMatch = match.match(/\*\*([^*]+)\*\*: (.+)/s);
            if (titleMatch) {
              expandedExamples.push({
                title: titleMatch[1].trim(),
                content: titleMatch[2].trim()
              });
            }
          });
        }
      }
      
      // Extract use cases
      const useCasesMatch = section.match(/#### Use Cases\s*\n(.*?)(?=\n#### |$)/s);
      const useCases = [];
      if (useCasesMatch) {
        const useCasesText = useCasesMatch[1];
        const bulletPoints = useCasesText.match(/^\*\*([^*]+)\*\*: (.+?)(?=\n\*\*|$)/gm);
        if (bulletPoints) {
          bulletPoints.forEach(point => {
            const match = point.match(/^\*\*([^*]+)\*\*: (.+)/s);
            if (match) {
              useCases.push(`${match[1]}: ${match[2].trim().replace(/\n/g, ' ')}`);
            }
          });
        }
      }
      
      // Extract common pitfalls
      const pitfallsMatch = section.match(/#### Common Pitfalls\s*\n(.*?)(?=\n#### |$)/s);
      const commonPitfalls = [];
      if (pitfallsMatch) {
        const pitfallsText = pitfallsMatch[1];
        const bulletPoints = pitfallsText.match(/^\*\*([^*]+)\*\*: (.+?)(?=\n\*\*|$)/gm);
        if (bulletPoints) {
          bulletPoints.forEach(point => {
            const match = point.match(/^\*\*([^*]+)\*\*: (.+)/s);
            if (match) {
              commonPitfalls.push(`${match[1]}: ${match[2].trim().replace(/\n/g, ' ')}`);
            }
          });
        }
      }
      
      // Extract reflection questions
      const questionsMatch = section.match(/#### Questions to Ask Yourself\s*\n(.*?)(?=\n\*\*Related|$)/s);
      const reflectionQuestions = [];
      if (questionsMatch) {
        const questionsText = questionsMatch[1];
        const questions = questionsText.match(/^- (.+?)(?=\n-|$)/gm);
        if (questions) {
          questions.forEach(q => {
            const cleaned = q.replace(/^- /, '').trim().replace(/\n/g, ' ');
            if (cleaned) reflectionQuestions.push(cleaned);
          });
        }
      }
      
      // Extract related models
      const relatedMatch = section.match(/\*\*Related Models\*\*: (.+?)(?=\n\n|$)/s);
      const relatedModelSlugs = [];
      if (relatedMatch) {
        const relatedText = relatedMatch[1].trim();
        const modelNames = relatedText.split(',').map(name => name.trim());
        modelNames.forEach(name => {
          if (name) {
            relatedModelSlugs.push(createSlug(name));
          }
        });
      }
      
      // Determine category (you can enhance this logic)
      let category = 'General';
      const modelIndex = (batchNumber - 1) * 10 + index + 1;
      if (modelIndex <= 50) category = 'Fundamental Concepts';
      else if (modelIndex <= 100) category = 'Economics & Systems';
      else if (modelIndex <= 150) category = 'Decision Making & Analysis';
      else if (modelIndex <= 200) category = 'Technology & Problem Solving';
      else if (modelIndex <= 250) category = 'Strategy & Influence';
      else category = 'Organization & Psychology';
      
      models.push({
        name,
        slug,
        category,
        core_concept: coreConcept,
        detailed_explanation: detailedExplanation,
        expanded_examples: expandedExamples,
        use_cases: useCases,
        common_pitfalls: commonPitfalls,
        reflection_questions: reflectionQuestions,
        related_model_slugs: relatedModelSlugs,
        order_index: modelIndex,
        batch_number: batchNumber
      });
      
      console.log(`Parsed model ${modelIndex}: ${name} -> ${slug}`);
      
    } catch (error) {
      console.error(`Error parsing model in section ${index}:`, error);
    }
  });
  
  return models;
}

// Main import function
async function importBatch(batchNumber, filePath) {
  try {
    console.log(`\nImporting Batch ${batchNumber} from ${filePath}...`);
    
    // Read the markdown file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse the content
    const models = parseMarkdownBatch(content, batchNumber);
    
    console.log(`Parsed ${models.length} models from batch ${batchNumber}`);
    
    // Insert into database
    for (const model of models) {
      console.log(`Inserting: ${model.name}`);
      
      const { error } = await supabase
        .from('mental_models_library')
        .insert(model);
      
      if (error) {
        console.error(`Error inserting ${model.name}:`, error);
        console.error('Model data:', JSON.stringify(model, null, 2));
      } else {
        console.log(`✓ Inserted: ${model.name} (${model.slug})`);
      }
    }
    
    console.log(`✅ Batch ${batchNumber} import completed`);
    
  } catch (error) {
    console.error(`Error importing batch ${batchNumber}:`, error);
  }
}

// Script usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node import-mental-models.js <batch-number> <file-path>');
    console.log('Example: node import-mental-models.js 1 ./batches/batch-1.md');
    process.exit(1);
  }
  
  const batchNumber = parseInt(args[0]);
  const filePath = args[1];
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  await importBatch(batchNumber, filePath);
  process.exit(0);
}

// Run the script
main().catch(console.error);