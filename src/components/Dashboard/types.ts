// src/components/Dashboard/types.ts

export interface RecommendedTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string;
}

export interface LatticeInsightResponse {
  recommendedTools: RecommendedTool[];
  relationshipsSummary?: string;
  error?: string;
  message?: string;
  query_id?: string;
}

export interface TrendingQuestion {
  id: string;
  question: string;
  topic_source: string;
  category: string;
  click_count: number;
  created_at: string;
  pre_generated_analysis?: any;
}

export type UserTier = 'free' | 'premium';