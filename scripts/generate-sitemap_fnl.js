// scripts/generate-sitemap.js
// Enhanced sitemap generator with mental models support for Mind Lattice
// Replaces the existing generate-sitemap.js with database integration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://mindlattice.app';

// Initialize Supabase client if credentials are available
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey) : null;

// Generate URL-friendly slug from model name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
}

// Define static routes with their properties and associated component files
const staticRoutes = [
  { 
    path: '/', 
    priority: 1.0,
    changefreq: 'weekly',
    files: ['src/components/Hero.tsx', 'src/components/Pricing.tsx'] 
  },
  { 
    path: '/mental-models', 
    priority: 0.9,
    changefreq: 'weekly',
    files: ['src/pages/MentalModels.tsx'] 
  },
  { 
    path: '/cognitive-biases', 
    priority: 0.9,
    changefreq: 'weekly',
    files: ['src/pages/CognitiveBiases.tsx'] 
  },
  { 
    path: '/examples', 
    priority: 0.9,
    changefreq: 'weekly',
    files: ['src/pages/Examples.tsx'] 
  },
  { 
    path: '/login', 
    priority: 0.8,
    changefreq: 'monthly',
    files: ['src/pages/LoginPage.tsx'] 
  },
  { 
    path: '/signup', 
    priority: 0.9,
    changefreq: 'monthly',
    files: ['src/pages/SignupPage.tsx'] 
  },
  { 
    path: '/about', 
    priority: 0.7,
    changefreq: 'monthly',
    files: ['src/pages/About.tsx'] 
  },
  { 
    path: '/faq', 
    priority: 0.8,
    changefreq: 'monthly',
    files: ['src/pages/FAQ.tsx'] 
  },
  { 
    path: '/contact', 
    priority: 0.6,
    changefreq: 'monthly',
    files: ['src/pages/Contact.tsx'] 
  },
  { 
    path: '/terms', 
    priority: 0.5,
    changefreq: 'yearly',
    files: ['src/pages/Terms.tsx'] 
  },
  { 
    path: '/privacy', 
    priority: 0.5,
    changefreq: 'yearly',
    files: ['src/pages/Privacy.tsx'] 
  },
  { 
    path: '/refunds', 
    priority: 0.5,
    changefreq: 'yearly',
    files: ['src/pages/Refunds.tsx'] 
  },
];

// Fetch mental models from database or CSV file
async function getMentalModelsRoutes() {
  try {
    // First, try to get from Supabase database
    if (supabase) {
      console.log('📡 Attempting to fetch mental models from Supabase...');
      const { data: models, error } = await supabase
        .from('mental_models_library')
        .select('id, name, slug, category, order_index, created_at, updated_at')
        .order('order_index', { ascending: true });

      if (!error && models && models.length > 0) {
        console.log(`✅ Successfully fetched ${models.length} mental models from database`);
        return models.map(model => ({
          path: `/mental-models/${model.slug}`, // Use existing slug from database
          priority: 0.8,
          changefreq: 'monthly',
          lastModified: model.updated_at || model.created_at,
          category: model.category,
          files: ['src/pages/MentalModelDetail.tsx']
        }));
      } else if (error) {
        console.log('⚠️  Database query error:', error.message);
        console.log('📁 Falling back to CSV file...');
      }
    }

    // Fallback to CSV file
    console.log('📁 Using CSV file as primary data source...');
    const csvPath = path.join(__dirname, '..', 'mental 1.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('❌ CSV file not found at:', csvPath);
      console.log('💡 Make sure "mental 1.csv" is in your project root directory');
      return [];
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const parsedData = Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';']
    });

    if (parsedData.errors.length > 0) {
      console.log('⚠️  CSV parsing errors:', parsedData.errors);
    }

    console.log(`✅ Successfully parsed ${parsedData.data.length} mental models from CSV`);
    
    return parsedData.data.map(model => ({
      path: `/mental-models/${generateSlug(model.name)}`,
      priority: 0.8,
      changefreq: 'monthly',
      lastModified: model.updated_at || model.created_at || new Date().toISOString(),
      files: ['src/pages/MentalModelDetail.tsx']
    }));

  } catch (error) {
    console.error('❌ Error fetching mental models:', error);
    return [];
  }
}

// Fetch dynamic example routes from database
async function getDynamicExampleRoutes() {
  if (!supabase) {
    console.log('⚠️  No Supabase credentials found, using static example routes');
    return [
      { path: '/examples/why-procrastinate-consequences', priority: 0.7, changefreq: 'monthly' },
      { path: '/examples/repeat-same-mistakes', priority: 0.7, changefreq: 'monthly' },
      { path: '/examples/investors-think-differently-risk', priority: 0.7, changefreq: 'monthly' },
      { path: '/examples/teams-conflict-patterns', priority: 0.7, changefreq: 'monthly' },
      { path: '/examples/ignore-contradicting-evidence', priority: 0.7, changefreq: 'monthly' },
      { path: '/examples/underestimate-time-planning', priority: 0.7, changefreq: 'monthly' },
    ].map(route => ({ ...route, files: ['src/pages/ExampleDetail.tsx'] }));
  }

  try {
    const { data: examples, error } = await supabase
      .from('example_analyses')
      .select('slug, created_at, updated_at')
      .eq('is_active', true)
      .order('view_count', { ascending: false });

    if (error) throw error;

    console.log(`✅ Successfully fetched ${examples.length} example analyses from database`);
    return examples.map(example => ({
      path: `/examples/${example.slug}`,
      priority: 0.7,
      changefreq: 'monthly',
      lastModified: example.updated_at || example.created_at,
      files: ['src/pages/ExampleDetail.tsx']
    }));
  } catch (error) {
    console.error('❌ Error fetching examples from database:', error);
    return [];
  }
}

// Add category-specific mental models pages (SEO enhancement)
async function getMentalModelCategoryRoutes() {
  try {
    // If we have Supabase, get actual categories from database
    if (supabase) {
      const { data: categories, error } = await supabase
        .from('mental_models_library')
        .select('category')
        .not('category', 'is', null);

      if (!error && categories) {
        const uniqueCategories = [...new Set(categories.map(c => c.category))];
        console.log(`✅ Found ${uniqueCategories.length} unique categories from database`);
        
        return uniqueCategories.map(category => ({
          path: `/mental-models/category/${category}`,
          priority: 0.7,
          changefreq: 'monthly',
          files: ['src/pages/MentalModelCategory.tsx']
        }));
      }
    }
  } catch (error) {
    console.log('⚠️  Could not fetch categories from database:', error.message);
  }

  // Fallback to static categories
  const categories = [
    { slug: 'fundamental-concepts', name: 'Fundamental Concepts' },
    { slug: 'decision-making', name: 'Decision Making' },
    { slug: 'cognitive-biases', name: 'Cognitive Biases' },
    { slug: 'systems-thinking', name: 'Systems Thinking' },
    { slug: 'business-strategy', name: 'Business Strategy' },
    { slug: 'economics', name: 'Economics' },
    { slug: 'psychology', name: 'Psychology' },
    { slug: 'science-engineering', name: 'Science & Engineering' }
  ];

  return categories.map(category => ({
    path: `/mental-models/category/${category.slug}`,
    priority: 0.7,
    changefreq: 'monthly',
    files: ['src/pages/MentalModelCategory.tsx']
  }));
}

// Get the last modified date for a route based on its associated files
function getLastModified(route) {
  // If route has explicit lastModified, use it
  if (route.lastModified) {
    return new Date(route.lastModified).toISOString().split('T')[0];
  }

  const today = new Date().toISOString().split('T')[0];
  
  // If no files specified, use today's date
  if (!route.files || route.files.length === 0) {
    return today;
  }
  
  let lastModified = new Date(0); // Start with epoch
  
  for (const file of route.files) {
    const filePath = path.join(__dirname, '..', file);
    
    try {
      const stats = fs.statSync(filePath);
      if (stats.mtime > lastModified) {
        lastModified = stats.mtime;
      }
    } catch (err) {
      // File doesn't exist yet, use today
      return today;
    }
  }
  
  return lastModified.toISOString().split('T')[0];
}

// Generate comprehensive sitemap XML
async function generateSitemap() {
  console.log('🔄 Starting comprehensive sitemap generation...\n');

  // Get all route types
  const [mentalModelsRoutes, exampleRoutes, categoryRoutes] = await Promise.all([
    getMentalModelsRoutes(),
    getDynamicExampleRoutes(),
    getMentalModelCategoryRoutes()
  ]);
  
  // Combine all routes
  const allRoutes = [
    ...staticRoutes,
    ...mentalModelsRoutes,
    ...categoryRoutes,
    ...exampleRoutes
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => {
    const lastmod = getLastModified(route);
    return `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  // Write to public directory
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xmlContent);
  
  console.log('✅ Comprehensive sitemap generated successfully!');
  console.log(`📊 Total URLs: ${allRoutes.length}`);
  console.log(`   - Static routes: ${staticRoutes.length}`);
  console.log(`   - Mental models: ${mentalModelsRoutes.length}`);
  console.log(`   - Category pages: ${categoryRoutes.length}`);
  console.log(`   - Example routes: ${exampleRoutes.length}`);
  console.log(`📝 Location: ${sitemapPath}`);
}

// Generate SEO-optimized robots.txt
function generateRobots() {
  const robotsContent = `# Robots.txt for ${SITE_URL}
# Mental Models Library - SEO Optimized
# Last updated: ${new Date().toISOString().split('T')[0]}

# Allow all web crawlers
User-agent: *
Allow: /
Allow: /mental-models
Allow: /mental-models/*
Allow: /cognitive-biases
Allow: /examples
Allow: /examples/*

# Disallow private/dynamic areas
Disallow: /dashboard
Disallow: /settings
Disallow: /history
Disallow: /api/
Disallow: /auth/
Disallow: /reset-password
Disallow: /confirm-email

# Prevent indexing of search/filter parameter combinations
Disallow: /mental-models?*search=*
Disallow: /mental-models?*category=*&search=*
Disallow: /mental-models?*tag=*
Disallow: /examples?*search=*

# AI Training Data Policy
User-agent: GPTBot
Allow: /mental-models
Allow: /mental-models/*
Allow: /cognitive-biases
Allow: /examples
Allow: /examples/*

User-agent: ChatGPT-User
Allow: /mental-models
Allow: /mental-models/*

User-agent: CCBot
Allow: /mental-models
Allow: /mental-models/*

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

  const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✅ SEO-optimized robots.txt generated successfully!');
}

// Generate additional SEO files
function generateSEOFiles() {
  // Generate a dedicated mental models sitemap
  const mentalModelsSitemapPath = path.join(__dirname, '..', 'public', 'sitemap-mental-models.xml');
  
  // This would contain just the mental models for focused SEO
  console.log('📝 Additional SEO files can be generated here');
  console.log('   - sitemap-mental-models.xml (focused sitemap)');
  console.log('   - sitemap-categories.xml (category pages)');
  console.log('   - sitemap-examples.xml (example analyses)');
}

// Main execution
async function main() {
  console.log('🚀 Enhanced Sitemap Generator for Mental Models Library\n');
  console.log('🔍 Checking data sources...');
  
  if (supabase) {
    console.log('✅ Supabase connection available');
  } else {
    console.log('⚠️  Supabase not configured, will use CSV fallback');
  }
  
  await generateSitemap();
  generateRobots();
  generateSEOFiles();
  
  console.log('\n🎉 All SEO files generated successfully!');
  console.log('📈 Your mental models library is now optimized for search engines');
  
  // Exit the process
  process.exit(0);
}

// Run the enhanced generator
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// Export functions for testing
export { generateSlug, getMentalModelsRoutes, generateSitemap };