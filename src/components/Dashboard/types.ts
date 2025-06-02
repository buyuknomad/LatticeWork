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
  metadata?: {
    queryType?: string;
    complexity?: number;
    themes?: string[];
    analysisQuality?: 'premium' | 'basic';
  };
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

export interface QueryLimits {
  trendingUsed: number;
  trendingLimit: number;
  manualUsed: number;
  manualLimit: number;
  resetTime: Date | null;
}