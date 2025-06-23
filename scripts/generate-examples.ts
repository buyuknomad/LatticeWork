// scripts/generate-examples.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const edgeFunctionUrl = process.env.VITE_SUPABASE_FUNCTIONS_URL!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define the examples to generate
const EXAMPLES = [
  {
    slug: "why-procrastinate-consequences",
    title: "Procrastination & Productivity",
    question: "Why do I procrastinate even when I know the consequences?",
    category: "personal"
  },
  {
    slug: "repeat-same-mistakes",
    title: "Behavioral Patterns",
    question: "What drives people to repeat the same mistakes?",
    category: "behavioral"
  },
  {
    slug: "investors-think-differently-risk",
    title: "Investment Psychology",
    question: "How do successful investors think differently about risk?",
    category: "business"
  },
  {
    slug: "teams-conflict-patterns",
    title: "Team Dynamics",
    question: "Why do teams fall into predictable conflict patterns?",
    category: "business"
  },
  {
    slug: "ignore-contradicting-evidence",
    title: "Cognitive Biases",
    question: "What causes us to ignore evidence that contradicts our beliefs?",
    category: "conceptual"
  },
  {
    slug: "underestimate-time-planning",
    title: "Time Management",
    question: "Why do we consistently underestimate how long things take?",
    category: "personal"
  }
];

// Function to call the edge function and get premium analysis
async function generatePremiumAnalysis(question: string) {
  try {
    console.log(`Generating analysis for: "${question}"...`);
    
    const response = await fetch(`${edgeFunctionUrl}/get-lattice-insights-narrative`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ 
        query: question,
        queryType: 'manual',
        // Simulate premium tier for generation
        userTier: 'premium'
      })
    });

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.status} ${response.statusText}`);
    }

    const analysis = await response.json();
    return analysis;
  } catch (error) {
    console.error(`Failed to generate analysis for "${question}":`, error);
    throw error;
  }
}

// Function to save example to database
async function saveExampleToDatabase(example: typeof EXAMPLES[0], analysis: any) {
  try {
    const { data, error } = await supabase
      .from('example_analyses')
      .upsert({
        slug: example.slug,
        question: example.question,
        title: example.title,
        category: example.category,
        pre_generated_analysis: analysis,
        is_active: true
      }, {
        onConflict: 'slug'
      });

    if (error) {
      throw error;
    }

    console.log(`✅ Saved example: ${example.slug}`);
    return data;
  } catch (error) {
    console.error(`Failed to save example ${example.slug}:`, error);
    throw error;
  }
}

// Main function to generate all examples
async function generateAllExamples() {
  console.log('🚀 Starting example generation...');
  console.log(`Total examples to generate: ${EXAMPLES.length}`);
  
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const example of EXAMPLES) {
    try {
      // Add delay between requests to avoid rate limiting
      if (results.successful > 0) {
        console.log('Waiting 5 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Generate the analysis
      const analysis = await generatePremiumAnalysis(example.question);
      
      // Verify the analysis has the expected structure
      if (!analysis.recommendedTools || !analysis.narrativeAnalysis) {
        throw new Error('Invalid analysis structure returned');
      }

      // Save to database
      await saveExampleToDatabase(example, analysis);
      
      results.successful++;
      console.log(`Progress: ${results.successful}/${EXAMPLES.length} completed`);
    } catch (error) {
      results.failed++;
      results.errors.push({
        example: example.slug,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error(`❌ Failed to process ${example.slug}:`, error);
    }
  }

  // Summary
  console.log('\n📊 Generation Summary:');
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(err => {
      console.log(`  - ${err.example}: ${err.error}`);
    });
  }

  return results;
}

// Function to verify generated examples
async function verifyExamples() {
  console.log('\n🔍 Verifying examples in database...');
  
  const { data, error } = await supabase
    .from('example_analyses')
    .select('slug, title, category, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching examples:', error);
    return;
  }

  console.log(`\nFound ${data?.length || 0} active examples:`);
  data?.forEach(example => {
    console.log(`  - ${example.slug} (${example.category}) - Created: ${example.created_at}`);
  });
}

// Run the script
async function main() {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey || !edgeFunctionUrl) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }

    // Generate examples
    await generateAllExamples();
    
    // Verify what's in the database
    await verifyExamples();
    
    console.log('\n✨ Example generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main();