// src/types/mentalModels.ts
export interface MentalModel {
  id: string;
  name: string;
  slug: string;
  category: string;
  core_concept: string;
  detailed_explanation: string;
  expanded_examples: ExpandedExample[];
  use_cases: string[];
  common_pitfalls: string[];
  reflection_questions: string[];
  related_model_slugs: string[];
  order_index: number;
  batch_number: number;
  created_at: string;
  updated_at: string;
}

export interface ExpandedExample {
  title: string;
  content: string;
}

export interface MentalModelSummary {
  name: string;
  slug: string;
  category: string;
  core_concept: string;
  order_index: number;
}

export interface RelatedModel {
  name: string;
  slug: string;
  category: string;
  core_concept: string;
}

export interface MentalModelFilters {
  searchQuery: string;
  selectedCategory: string | null;
  page: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Mental Model Categories - NEW 15-CATEGORY STRUCTURE
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

// Category metadata for UI display
export interface CategoryMetadata {
  slug: MentalModelCategory;
  displayName: string;
  icon: string;
  color: string;
  description: string;
  displayOrder: number;
}

export const CATEGORY_METADATA: Record<MentalModelCategory, CategoryMetadata> = {
  'general-thinking': {
    slug: 'general-thinking',
    displayName: 'General Thinking Concepts',
    icon: '🧠',
    color: '#00FFFF',
    description: 'Core reasoning and fundamental thinking tools',
    displayOrder: 1
  },
  'creative-communication': {
    slug: 'creative-communication',
    displayName: 'Creative & Communication',
    icon: '🎨',
    color: '#FF6B6B',
    description: 'Artistic, narrative, and communication models',
    displayOrder: 2
  },
  'physics-chemistry': {
    slug: 'physics-chemistry',
    displayName: 'Physics & Chemistry',
    icon: '⚛️',
    color: '#FFB84D',
    description: 'Physical laws and chemical principles',
    displayOrder: 3
  },
  'biology-evolution': {
    slug: 'biology-evolution',
    displayName: 'Biology & Evolution',
    icon: '🧬',
    color: '#10B981',
    description: 'Biological systems and evolutionary concepts',
    displayOrder: 4
  },
  'systems-mathematics': {
    slug: 'systems-mathematics',
    displayName: 'Systems & Mathematics',
    icon: '📊',
    color: '#8B5CF6',
    description: 'Systems thinking and mathematical models',
    displayOrder: 5
  },
  'economics-markets': {
    slug: 'economics-markets',
    displayName: 'Economics & Markets',
    icon: '💰',
    color: '#F59E0B',
    description: 'Economic principles and market dynamics',
    displayOrder: 6
  },
  'innovation-technology': {
    slug: 'innovation-technology',
    displayName: 'Innovation & Technology',
    icon: '💡',
    color: '#EC4899',
    description: 'Innovation, product development, and technology adoption',
    displayOrder: 7
  },
  'decision-making': {
    slug: 'decision-making',
    displayName: 'Decision Making',
    icon: '🎯',
    color: '#EF4444',
    description: 'Decision frameworks and judgment tools',
    displayOrder: 8
  },
  'statistics-analysis': {
    slug: 'statistics-analysis',
    displayName: 'Statistics & Analysis',
    icon: '📈',
    color: '#3B82F6',
    description: 'Statistical thinking and data analysis',
    displayOrder: 9
  },
  'problem-solving': {
    slug: 'problem-solving',
    displayName: 'Problem Solving',
    icon: '🧩',
    color: '#14B8A6',
    description: 'Problem-solving approaches and techniques',
    displayOrder: 10
  },
  'strategy-conflict': {
    slug: 'strategy-conflict',
    displayName: 'Strategy & Conflict',
    icon: '⚔️',
    color: '#6366F1',
    description: 'Strategic thinking, game theory, and conflict resolution',
    displayOrder: 11
  },
  'psychology-behavior': {
    slug: 'psychology-behavior',
    displayName: 'Psychology & Behavior',
    icon: '👥',
    color: '#10B981',
    description: 'Human psychology and cognitive biases',
    displayOrder: 12
  },
  'organizations-leadership': {
    slug: 'organizations-leadership',
    displayName: 'Organizations & Leadership',
    icon: '🏢',
    color: '#6B7280',
    description: 'Organizational dynamics and management',
    displayOrder: 13
  },
  'risk-uncertainty': {
    slug: 'risk-uncertainty',
    displayName: 'Risk & Uncertainty',
    icon: '⚠️',
    color: '#F59E0B',
    description: 'Risk assessment and uncertainty management',
    displayOrder: 14
  },
  'time-change': {
    slug: 'time-change',
    displayName: 'Time & Change',
    icon: '⏰',
    color: '#9333EA',
    description: 'Temporal dynamics and change management',
    displayOrder: 15
  }
};

// Helper function to get category display name
export const getCategoryDisplayName = (slug: string): string => {
  if (slug in CATEGORY_METADATA) {
    return CATEGORY_METADATA[slug as MentalModelCategory].displayName;
  }
  // Fallback for any unmapped categories during migration
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Helper function to get category color
export const getCategoryColor = (slug: string): string => {
  if (slug in CATEGORY_METADATA) {
    return CATEGORY_METADATA[slug as MentalModelCategory].color;
  }
  return '#6B7280'; // Default gray color
};

// Helper function to get category icon
export const getCategoryIcon = (slug: string): string => {
  if (slug in CATEGORY_METADATA) {
    return CATEGORY_METADATA[slug as MentalModelCategory].icon;
  }
  return '📚'; // Default book icon
};