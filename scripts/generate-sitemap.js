// scripts/generate-sitemap-advanced.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://mindlattice.app';

// Define all routes with their properties and associated component files
const routes = [
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
  { 
    path: '/mental-models', 
    priority: 0.9,
    files: ['src/pages/MentalModels.tsx'] // Future file
  },
  { 
    path: '/cognitive-biases', 
    priority: 0.9,
    files: ['src/pages/CognitiveBiases.tsx'] // Future file
  },
];

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
      // File doesn't exist yet (like future pages), use today
      console.log(`⚠️  File not found: ${file} - using today's date`);
      return today;
    }
  }
  
  return lastModified.toISOString().split('T')[0];
}

// Generate sitemap XML with smart lastmod dates
function generateSitemap() {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => {
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

// Generate a sitemap index file (useful for future expansion)
function generateSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];
  
  // For future use when you have multiple sitemaps
  const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  const indexPath = path.join(__dirname, '..', 'public', 'sitemap-index.xml');
  fs.writeFileSync(indexPath, sitemapIndexContent);
  console.log('✅ Sitemap index generated (for future use) at:', indexPath);
}

// Main execution
console.log('🔄 Starting sitemap generation...\n');
generateSitemap();
generateRobots();

// Only generate index if you plan to have multiple sitemaps
// generateSitemapIndex();

console.log('\n✨ All files generated successfully!');