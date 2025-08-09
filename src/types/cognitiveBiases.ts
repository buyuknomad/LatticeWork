// src/types/cognitiveBiases.ts

// Cognitive Bias Categories - 12 categories for organizing biases
export const COGNITIVE_BIAS_CATEGORIES = [
  'memory-biases',
  'attention-perception-biases',
  'pattern-recognition-biases',
  'decision-behavior-biases',
  'social-biases',
  'probability-judgment-biases',
  'self-perception-biases',
  'causal-interpretation-biases',
  'simplification-biases',
  'emotional-biases',
  'change-adaptation-biases',
  'research-methodology-biases'
] as const;

export type CognitiveBiasCategory = typeof COGNITIVE_BIAS_CATEGORIES[number];

// Category metadata interface
export interface CategoryMetadata {
  name: string;
  icon: string;
  color: string;
  description: string;
  slug: string;
}

// Category metadata with clear visual differentiation
export const CATEGORY_METADATA: Record<CognitiveBiasCategory, CategoryMetadata> = {
  'memory-biases': {
    name: 'Memory Biases',
    icon: '🧠',
    color: '#8B5CF6',
    description: 'Errors in how we recall, store, and reconstruct past experiences',
    slug: 'memory-biases'
  },
  'attention-perception-biases': {
    name: 'Attention & Perception',
    icon: '👁️',
    color: '#EF4444',
    description: 'Biases in what we notice and how we perceive information',
    slug: 'attention-perception-biases'
  },
  'pattern-recognition-biases': {
    name: 'Pattern Recognition',
    icon: '🔍',
    color: '#F59E0B',
    description: 'Finding patterns and connections where none exist',
    slug: 'pattern-recognition-biases'
  },
  'decision-behavior-biases': {
    name: 'Decision & Behavior',
    icon: '⚖️',
    color: '#10B981',
    description: 'Errors in judgment and choice-making processes',
    slug: 'decision-behavior-biases'
  },
  'social-biases': {
    name: 'Social Biases',
    icon: '👥',
    color: '#3B82F6',
    description: 'Biases affecting social interactions and group dynamics',
    slug: 'social-biases'
  },
  'probability-judgment-biases': {
    name: 'Probability & Risk',
    icon: '🎲',
    color: '#EC4899',
    description: 'Errors in assessing likelihood, risk, and uncertainty',
    slug: 'probability-judgment-biases'
  },
  'self-perception-biases': {
    name: 'Self-Perception',
    icon: '🪞',
    color: '#14B8A6',
    description: 'Biases in how we view ourselves and our abilities',
    slug: 'self-perception-biases'
  },
  'causal-interpretation-biases': {
    name: 'Causal Interpretation',
    icon: '🔗',
    color: '#6366F1',
    description: 'Errors in understanding cause and effect relationships',
    slug: 'causal-interpretation-biases'
  },
  'simplification-biases': {
    name: 'Simplification',
    icon: '📉',
    color: '#84CC16',
    description: 'Mental shortcuts that oversimplify complex situations',
    slug: 'simplification-biases'
  },
  'emotional-biases': {
    name: 'Emotional Influence',
    icon: '❤️',
    color: '#F97316',
    description: 'How emotions distort our thinking and decisions',
    slug: 'emotional-biases'
  },
  'change-adaptation-biases': {
    name: 'Change & Adaptation',
    icon: '🔄',
    color: '#9333EA',
    description: 'Resistance to change and new information',
    slug: 'change-adaptation-biases'
  },
  'research-methodology-biases': {
    name: 'Research & Methodology',
    icon: '📊',
    color: '#06B6D4',
    description: 'Biases in data collection, analysis, and research',
    slug: 'research-methodology-biases'
  }
};

// Duplicate tracking - maps duplicate CB IDs to their primary versions
export const DUPLICATE_MAPPINGS: Record<string, string> = {
  'CB068': 'CB023', // Anchoring
  'CB081': 'CB018', // Negativity bias
  'CB212': 'CB018', // Negativity bias
  'CB072': 'CB028', // Focusing effect
  'CB214': 'CB028', // Focusing effect
  'CB070': 'CB026', // Contrast effect
  'CB071': 'CB027', // Distinction bias
  'CB073': 'CB029', // Framing effect
  'CB074': 'CB030', // Weber-Fechner law
  'CB226': 'CB037', // Egocentric bias
  'CB197': 'CB038', // Generation effect
  'CB077': 'CB041', // Humor effect
  'CB080': 'CB047', // Self-relevance effect
  'CB078': 'CB055', // Von Restorff effect
  'CB216': 'CB061', // Mere exposure effect
  'CB205': 'CB094', // Backfire effect
  'CB238': 'CB100', // Trait ascription bias
  'CB235': 'CB101', // Actor-observer bias
  'CB122': 'CB102', // Group attribution error
  'CB217': 'CB203'  // Pseudocertainty effect
};

// Example structure for expanded_examples JSON
export interface ExpandedExample {
  title: string;
  content: string;
}

// Summary interface for list views
export interface CognitiveBiasSummary {
  id: string; // UUID
  cb_id: string; // CB001, CB002, etc.
  name: string;
  slug: string;
  category: CognitiveBiasCategory;
  core_concept: string;
  order_index: number;
  is_duplicate: boolean;
  duplicate_of_id?: string | null;
}

// Full interface matching database structure
export interface CognitiveBias extends CognitiveBiasSummary {
  detailed_explanation: string;
  expanded_examples: ExpandedExample[];
  recognition_strategies: string[];
  mitigation_approaches: string[];
  common_contexts: string[];
  reflection_questions: string[];
  related_bias_ids: string[]; // CB001, CB002, etc.
  related_bias_slugs: string[]; // peak-end-rule, anchoring, etc.
  batch_number: number;
  created_at: string;
  updated_at: string;
}

// Filters for search and browsing
export interface CognitiveBiasFilters {
  searchQuery: string;
  selectedCategory: string | null;
  page: number;
  showDuplicates?: boolean; // Admin only option
}

// Related bias for detail page
export interface RelatedBias {
  cb_id: string;
  name: string;
  slug: string;
  category: CognitiveBiasCategory;
  core_concept: string;
}

// Stats interface for tracking progress
export interface CognitiveBiasStats {
  total_biases: number;
  unique_biases: number;
  duplicate_biases: number;
  categories_count: number;
  batches_imported: number;
}

// Utility functions for categories (similar to mental models)
export const getCategoryMetadata = (category: CognitiveBiasCategory): CategoryMetadata => {
  return CATEGORY_METADATA[category];
};

export const isValidCategory = (category: string): category is CognitiveBiasCategory => {
  return COGNITIVE_BIAS_CATEGORIES.includes(category as CognitiveBiasCategory);
};

// Get category color with opacity
export const getCategoryColor = (category: CognitiveBiasCategory, opacity: number = 1): string => {
  const color = CATEGORY_METADATA[category].color;
  if (opacity === 1) return color;
  
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Category display helpers for consistent styling
export const getCategoryClasses = (category: CognitiveBiasCategory) => {
  const base = "transition-all duration-200";
  return {
    badge: `${base} bg-opacity-20 border`,
    card: `${base} hover:border-opacity-50`,
    filter: `${base} hover:bg-opacity-30`,
    icon: "text-lg"
  };
};

// Check if a CB ID is a duplicate
export const isDuplicate = (cbId: string): boolean => {
  return DUPLICATE_MAPPINGS.hasOwnProperty(cbId);
};

// Get the primary CB ID for a duplicate
export const getPrimaryCbId = (cbId: string): string | null => {
  return DUPLICATE_MAPPINGS[cbId] || null;
};