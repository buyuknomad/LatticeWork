// src/types/mentalModels.ts

// Mental Model Categories - 15 optimized categories
export const MENTAL_MODEL_CATEGORIES = [
  'general-thinking',
  'creative-communication',
  'physics-chemistry',
  'biology-evolution',
  'systems-mathematics',
  'economics-markets',
  'innovation-technology',
  'decision-making',
  'statistics-analysis',
  'problem-solving',
  'strategy-conflict',
  'psychology-behavior',
  'organizations-leadership',
  'risk-uncertainty',
  'time-change'
] as const;

export type MentalModelCategory = typeof MENTAL_MODEL_CATEGORIES[number];

// Category metadata interface
export interface CategoryMetadata {
  name: string;
  icon: string;
  color: string;
  description: string;
  slug: string;
}

// Category metadata with icons, colors, and descriptions
export const CATEGORY_METADATA: Record<MentalModelCategory, CategoryMetadata> = {
  'general-thinking': {
    name: 'General Thinking Concepts',
    icon: '🧠',
    color: '#00FFFF',
    description: 'Core reasoning and fundamental thinking tools that apply across all domains',
    slug: 'general-thinking'
  },
  'creative-communication': {
    name: 'Creative & Communication',
    icon: '🎨',
    color: '#FF6B6B',
    description: 'Tools for creative thinking, effective communication, and expression',
    slug: 'creative-communication'
  },
  'physics-chemistry': {
    name: 'Physics & Chemistry',
    icon: '⚛️',
    color: '#FFB84D',
    description: 'Principles from physical sciences that explain how the world works',
    slug: 'physics-chemistry'
  },
  'biology-evolution': {
    name: 'Biology & Evolution',
    icon: '🧬',
    color: '#10B981',
    description: 'Insights from life sciences about adaptation, growth, and survival',
    slug: 'biology-evolution'
  },
  'systems-mathematics': {
    name: 'Systems & Mathematics',
    icon: '📊',
    color: '#8B5CF6',
    description: 'Mathematical concepts and systems thinking for understanding complexity',
    slug: 'systems-mathematics'
  },
  'economics-markets': {
    name: 'Economics & Markets',
    icon: '💰',
    color: '#F59E0B',
    description: 'Economic principles and market dynamics that drive human behavior',
    slug: 'economics-markets'
  },
  'innovation-technology': {
    name: 'Innovation & Technology',
    icon: '💡',
    color: '#EC4899',
    description: 'Frameworks for innovation, technological change, and creative disruption',
    slug: 'innovation-technology'
  },
  'decision-making': {
    name: 'Decision Making',
    icon: '🎯',
    color: '#EF4444',
    description: 'Tools and frameworks for making better choices and judgments',
    slug: 'decision-making'
  },
  'statistics-analysis': {
    name: 'Statistics & Analysis',
    icon: '📈',
    color: '#3B82F6',
    description: 'Statistical thinking and analytical tools for interpreting data',
    slug: 'statistics-analysis'
  },
  'problem-solving': {
    name: 'Problem Solving',
    icon: '🧩',
    color: '#14B8A6',
    description: 'Strategies and techniques for effectively solving complex problems',
    slug: 'problem-solving'
  },
  'strategy-conflict': {
    name: 'Strategy & Conflict',
    icon: '⚔️',
    color: '#6366F1',
    description: 'Strategic thinking and understanding competitive dynamics',
    slug: 'strategy-conflict'
  },
  'psychology-behavior': {
    name: 'Psychology & Behavior',
    icon: '👥',
    color: '#10B981',
    description: 'Understanding human psychology and behavioral patterns',
    slug: 'psychology-behavior'
  },
  'organizations-leadership': {
    name: 'Organizations & Leadership',
    icon: '🏢',
    color: '#6B7280',
    description: 'Principles for building and leading effective organizations',
    slug: 'organizations-leadership'
  },
  'risk-uncertainty': {
    name: 'Risk & Uncertainty',
    icon: '⚠️',
    color: '#F59E0B',
    description: 'Tools for navigating uncertainty and managing risk',
    slug: 'risk-uncertainty'
  },
  'time-change': {
    name: 'Time & Change',
    icon: '⏰',
    color: '#9333EA',
    description: 'Understanding temporal dynamics and managing change',
    slug: 'time-change'
  }
};

// Mental Model interfaces
export interface MentalModelSummary {
  name: string;
  slug: string;
  category: MentalModelCategory;
  core_concept: string;
  order_index: number;
}

export interface MentalModel extends MentalModelSummary {
  detailed_explanation: string;
  expanded_examples: {
    title: string;
    content: string;
  }[];
  use_cases: string[];
  common_pitfalls: string[];
  reflection_questions: string[];
  related_model_slugs: string[];
  created_at: string;
  updated_at: string;
}

export interface RelatedModel {
  name: string;
  slug: string;
  category: MentalModelCategory;
  core_concept: string;
}

export interface MentalModelFilters {
  searchQuery: string;
  selectedCategory: string | null;
  page: number;
}

// Utility functions for categories
export const getCategoryMetadata = (category: MentalModelCategory): CategoryMetadata => {
  return CATEGORY_METADATA[category];
};

export const isValidCategory = (category: string): category is MentalModelCategory => {
  return MENTAL_MODEL_CATEGORIES.includes(category as MentalModelCategory);
};

// Get category color with opacity
export const getCategoryColor = (category: MentalModelCategory, opacity: number = 1): string => {
  const color = CATEGORY_METADATA[category].color;
  if (opacity === 1) return color;
  
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Category display helpers
export const getCategoryClasses = (category: MentalModelCategory) => {
  const base = "transition-all duration-200";
  return {
    badge: `${base} bg-opacity-20 border`,
    card: `${base} hover:border-opacity-50`,
    filter: `${base} hover:bg-opacity-30`,
    icon: "text-lg"
  };
};