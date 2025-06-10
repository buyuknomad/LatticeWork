// src/components/Dashboard/types.ts

export interface RecommendedTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string;
  isSurprise?: boolean; // NEW: For premium surprising tool selection
}

// Original interface for backward compatibility
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

// NEW: Enhanced response for v14.2 narrative edge function
export interface LatticeInsightNarrativeResponse extends LatticeInsightResponse {
  narrativeAnalysis?: string; // 400-600 word narrative for premium
  keyLessons?: string[]; // 3-5 actionable lessons for premium
  searchGrounding?: { // NEW: Search metadata
    wasSearchUsed: boolean;
    searchQuery?: string;
    sourcesCount?: number;
    searchTimestamp?: string;
  };
  metadata?: {
    queryType?: string;
    complexity?: number;
    themes?: string[];
    analysisQuality?: 'premium' | 'basic';
    totalToolsConsidered?: number;
    usingGeminiCache?: boolean;
    geminiCacheName?: string;
    searchPerformed?: boolean; // NEW
    searchConfidence?: number; // NEW: 0.0-1.0
    searchSkipped?: string; // NEW: Reason why search wasn't performed
    enhancedWithSearch?: boolean; // NEW
    hasSurpriseElement?: boolean; // NEW: For premium
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

// NEW: Search usage tracking
export interface SearchUsage {
  dailyLimit: number;
  used: number;
  softLimit: number;
  resetTime?: Date;
}