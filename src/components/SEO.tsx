// src/components/SEO.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRAND } from '../constants/brand';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  schema
}) => {
  const siteUrl = BRAND.url;
  const defaultTitle = BRAND.meta.title;
  const defaultDescription = BRAND.meta.description;
  const defaultKeywords = BRAND.meta.keywords;
  const defaultImage = `${siteUrl}/og-image.png`; // You'll need to create this
  
  const seoTitle = title ? `${title} | ${BRAND.name}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const seoImage = image || defaultImage;
  const seoUrl = url ? `${siteUrl}${url}` : siteUrl;

  // Base schema for organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BRAND.name,
    "description": BRAND.description,
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": BRAND.email,
      "contactType": "customer support"
    },
    "sameAs": [
      `https://twitter.com/${BRAND.social.x.replace('@', '')}`
    ]
  };

  // Software application schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": BRAND.name,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": [
      {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier with 3 analyses per day"
      },
      {
        "@type": "Offer",
        "price": BRAND.pricing.premium.price,
        "priceCurrency": "USD",
        "description": "Premium tier with unlimited analyses"
      }
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={BRAND.name} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={BRAND.social.x} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoUrl} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;