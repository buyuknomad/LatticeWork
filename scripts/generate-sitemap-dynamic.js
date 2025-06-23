// scripts/generate-sitemap-dynamic.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
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

// Define static routes with their properties and associated component files
const staticRoutes = [
  { 
    path: '/', 
    priority: 1.0,
    files: ['src/components/Hero.tsx', 'src/components/Pricing.tsx'] 
  },
  { 
    path: '/login', 
    priority: 0.8,
    files: ['src/pages/LoginPage.tsx'] 
  },
  { 
    path: '/signup', 
    priority: 0.9,
    files: ['src/pages/SignupPage.tsx'] 
  },
  { 
    path: '/examples', 
    priority: 0.9,
    files: ['src/pages/Examples.tsx'] 
  },
  { 
    path: '/mental-models', 
    priority: 0.9,
    files: ['src/pages/MentalModels.tsx'] 
  },
  { 
    path: '/cognitive-biases', 
    priority: 0.9,
    files: ['src/pages/CognitiveBiases.tsx'] 
  },
  { 
    path: '/about', 
    priority: 0.7,
    files: ['src/pages/About.tsx'] 
  },
  { 
    path: '/faq', 
    priority: 0.8,
    files: ['src/pages/FAQ.tsx'] 
  },
  { 
    path: '/contact', 
    priority: 0.6,
    files: ['src/pages/Contact.tsx'] 
  },
  { 
    path: '/terms', 
    priority: 0.5,
    files: ['src/pages/Terms.tsx'] 
  },
  { 
    path: '/privacy', 
    priority: 0.5,
    files: ['src/pages/Privacy.tsx'] 
  },
  { 
    path: '/refunds', 
    priority: 0.5,
    files: ['src/pages/Refunds.tsx'] 
  },
];

// Fetch dynamic example routes from database
async function getDynamicExampleRoutes() {
  if (!supabase) {
    console.log('⚠️  No Supabase credentials found, using static example routes');
    // Return static example routes as fallback
    return [
      { path: '/examples/why-procrastinate-consequences', priority: 0.8 },
      { path: '/examples/repeat-same-mistakes', priority: 0.8 },
      { path: '/examples/investors-think-differently-risk', priority: 0.8 },
      { path: '/examples/teams-conflict-patterns', priority: 0.8 },
      { path: '/examples/ignore-contradicting-evidence', priority: 0.8 },
      { path: '/examples/underestimate-time-planning', priority: 0.8 },
    ];
  }

  try {
    const { data: examples, error } = await supabase
      .from('example_analyses')
      .select('slug')
      .eq('is_active', true)
      .order('view_count', { ascending: false });

    if (error) throw error;

    return examples.map(example => ({
      path: `/examples/${example.slug}`,
      priority: 0.8,
      files: ['src/pages/ExampleDetail.tsx']
    }));
  } catch (error) {
    console.error('❌ Error fetching examples from database:', error);
    console.log('⚠️  Falling back to static example routes');
    // Return static routes as fallback
    return [
      { path: '/examples/why-procrastinate-consequences', priority: 0.8 },
      { path: '/examples/repeat-same-mistakes', priority: 0.8 },
      { path: '/examples/investors-think-differently-risk', priority: 0.8 },
      { path: '/examples/teams-conflict-patterns', priority: 0.8 },
      { path: '/examples/ignore-contradicting-evidence', priority: 0.8 },
      { path: '/examples/underestimate-time-planning', priority: 0.8 },
    ].map(route => ({ ...route, files: ['src/pages/ExampleDetail.tsx'] }));
  }
}

// Get the last modified date for a route based on its associated files
function getLastModified(route) {
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

// Generate sitemap XML with smart lastmod dates
async function generateSitemap() {
  // Get dynamic example routes
  const exampleRoutes = await getDynamicExampleRoutes();
  
  // Combine static and dynamic routes
  const allRoutes = [...staticRoutes, ...exampleRoutes];
  
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
  
  console.log('✅ Sitemap generated successfully at:', sitemapPath);
  console.log('📝 Using actual file modification dates for lastmod');
  console.log('🚀 Google-compliant: no changefreq tags included');
  console.log(`📊 Total URLs: ${allRoutes.length}`);
  console.log(`   - Static routes: ${staticRoutes.length}`);
  console.log(`   - Example routes: ${exampleRoutes.length}`);
}

// Generate robots.txt with additional directives
function generateRobots() {
  const robotsContent = `# Robots.txt for ${SITE_URL}
# Last updated: ${new Date().toISOString().split('T')[0]}

# Allow all web crawlers
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /settings
Disallow: /history
Disallow: /api/
Disallow: /auth/
Disallow: /reset-password
Disallow: /confirm-email

# Specific bot rules
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (Google ignores this, but Bing uses it)
Crawl-delay: 1`;

  const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✅ Robots.txt generated successfully at:', robotsPath);
}

// Main execution
async function main() {
  console.log('🔄 Starting sitemap generation...\n');
  
  if (supabase) {
    console.log('📡 Connected to Supabase - will fetch dynamic examples');
  } else {
    console.log('📝 No Supabase connection - using static examples');
  }
  
  await generateSitemap();
  generateRobots();
  
  console.log('\n✨ All files generated successfully!');
  
  // Exit the process
  process.exit(0);
}

// Run the generator
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});