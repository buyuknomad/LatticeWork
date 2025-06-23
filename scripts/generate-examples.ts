// scripts/generate-examples.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase clients
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const edgeFunctionUrl = 'https://auth.mindlattice.app/functions/v1';

// Client for user authentication
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for database operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

// Function to authenticate as a premium user
async function authenticateUser() {
  // You'll need to provide credentials for a premium user account
  const email = process.env.PREMIUM_USER_EMAIL;
  const password = process.env.PREMIUM_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Please set PREMIUM_USER_EMAIL and PREMIUM_USER_PASSWORD in your .env file');
  }

  console.log('🔐 Authenticating as premium user...');
  
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  if (!data.session) {
    throw new Error('No session returned from authentication');
  }

  console.log('✅ Authenticated successfully');
  return data.session;
}

// Function to call the edge function and get premium analysis
async function generatePremiumAnalysis(question: string, session: any) {
  try {
    console.log(`Generating analysis for: "${question}"...`);
    
    const response = await fetch(`${edgeFunctionUrl}/get-lattice-insights-narrative`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ 
        query: question,
        queryType: 'manual'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const analysis = await response.json();
    return analysis;
  } catch (error) {
    console.error(`Failed to generate analysis for "${question}":`, error);
    throw error;
  }
}

// Function to save example to database using admin client
async function saveExampleToDatabase(example: typeof EXAMPLES[0], analysis: any) {
  try {
    const { data, error } = await supabaseAdmin
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
async function generateAllExamples(session: any) {
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
      const analysis = await generatePremiumAnalysis(example.question, session);
      
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
  
  const { data, error } = await supabaseAdmin
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
  let session = null;
  
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }

    // Authenticate as a premium user
    session = await authenticateUser();

    // Generate examples
    await generateAllExamples(session);
    
    // Verify what's in the database
    await verifyExamples();
    
    console.log('\n✨ Example generation complete!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    // Sign out if we were signed in
    if (session) {
      await supabaseClient.auth.signOut();
      console.log('🔒 Signed out');
    }
    process.exit(0);
  }
}

// Run the main function
main();