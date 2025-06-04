// scripts/generate-sitemap.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://mindlattice.app';

// Define all routes with their properties
const routes = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/login', changefreq: 'monthly', priority: 0.8 },
  { path: '/signup', changefreq: 'monthly', priority: 0.9 },
  { path: '/about', changefreq: 'monthly', priority: 0.7 },
  { path: '/faq', changefreq: 'weekly', priority: 0.8 },
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
  { path: '/terms', changefreq: 'quarterly', priority: 0.5 },
  { path: '/privacy', changefreq: 'quarterly', priority: 0.5 },
  { path: '/refunds', changefreq: 'quarterly', priority: 0.5 },
  { path: '/mental-models', changefreq: 'weekly', priority: 0.9 },
  { path: '/cognitive-biases', changefreq: 'weekly', priority: 0.9 },
];

// Generate sitemap XML
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write to public directory
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xmlContent);
  console.log('✅ Sitemap generated successfully at:', sitemapPath);
}

// Generate robots.txt
function generateRobots() {
  const robotsContent = `# Robots.txt for ${SITE_URL}
# Allow all web crawlers

User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /settings
Disallow: /history
Disallow: /api/
Disallow: /auth/

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (in seconds)
Crawl-delay: 1`;

  const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✅ Robots.txt generated successfully at:', robotsPath);
}

// Run generators
generateSitemap();
generateRobots();