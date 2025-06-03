// src/constants/brand.ts
export const BRAND = {
  // Core brand information
  name: "Mind Lattice",
  domain: "mindlattice.app",
  tagline: "Mental Models for Modern Minds",
  description: "Understand patterns through mental models and cognitive biases. Make better decisions with Mind Lattice.",
  
  // Name variations for different contexts
  shortName: "MindLattice",
  slug: "mind-lattice",
  constant: "MIND_LATTICE",
  camelCase: "mindLattice",
  
  // URLs
  url: "https://mindlattice.app",
  
  // Contact information
  email: "hello@mindlattice.app", // Single email for all purposes
  supportEmail: "hello@mindlattice.app",
  contactEmail: "hello@mindlattice.app",
  
  // Social media
  social: {
    x: "@thinkinmodels" // X (formerly Twitter)
  },
  
  // Legal/Company info
  company: {
    name: "Mind Lattice",
    legalName: "Mind Lattice", // Update with actual legal entity when established
    foundedYear: 2025,
    copyright: `© ${new Date().getFullYear()} Mind Lattice. All rights reserved.`
  },
  
  // Meta descriptions for SEO
  meta: {
    title: "Mind Lattice | Mental Models for Modern Minds",
    description: "Understand patterns through mental models and cognitive biases. Make better decisions with Mind Lattice - your framework for clearer thinking.",
    keywords: "mental models, cognitive biases, decision making, critical thinking, problem solving, pattern recognition"
  },
  
  // Feature descriptions
  features: {
    mentalModels: "300+ mental models",
    cognitiveBiases: "200+ cognitive biases",
    freeQueries: "3 analyses per day",
    premiumQueries: "Unlimited analyses"
  },
  
  // Pricing
  pricing: {
    free: {
      name: "Free",
      price: "Free",
      currency: "$"
    },
    premium: {
      name: "Premium",
      price: "9.99",
      currency: "$",
      period: "month"
    }
  }
} as const;

// Type for the brand object
export type Brand = typeof BRAND;