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

// Mental Model Categories (based on project knowledge)
export const MENTAL_MODEL_CATEGORIES = [
  'advanced-decision-tools',
  'analysis-decision-tools', 
  'business-strategy',
  'cognitive-frameworks',
  'cognitive-social-models',
  'collective-intelligence',
  'competitive-dynamics',
  'creative-communication-models',
  'decision-frameworks',
  'decision-making',
  'decision-making-analysis',
  'decision-making-optimization',
  'decision-making-strategic',
  'economic-concepts',
  'economics-governance',
  'economics-systems',
  'energy-focus-systems',
  'fundamental-concepts', 
  'group-dynamics',
  'influence-social-psychology',
  'information-aggregation',
  'market-dynamics',
  'mathematical-concepts',
  'modeling-analysis',
  'optimization',
  'organizational-excellence', 
  'technology-problem-solving',
  'thinking-methods',
  'information-aggregation',

  
  
] as const;

export type MentalModelCategory = typeof MENTAL_MODEL_CATEGORIES[number];