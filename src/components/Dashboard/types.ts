// src/components/Dashboard/types.ts

export interface RecommendedTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string;
  isSurprise?: boolean; // For premium surprising tool selection
}

// NEW: Thread interfaces for v14.3
export interface NarrativeThread {
  id: number;
  type: 'opening' | 'pattern' | 'insight' | 'connection' | 'synthesis' | 'conclusion';
  content: string; // 50-80 words
  tools: string[]; // Tool names referenced
  emoji?: string;
  highlight?: boolean; // For surprise tools
}

export interface ThreadedNarrative {
  hook: string; // 15-20 words
  threads: NarrativeThread[];
  bottomLine: string; // 15-20 words
  actionPlan: {
    type: 'personal' | 'strategic' | 'awareness' | 'analytical';
    sections: {
      [key: string]: string[]; // Dynamic sections with action items
    };
  };
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

// Enhanced response for v14.3 with threaded narrative
export interface LatticeInsightNarrativeResponse extends LatticeInsightResponse {
  narrativeAnalysis?: string | ThreadedNarrative; // Changed to support both types
  keyLessons?: string[]; // 3-5 actionable lessons for premium
  searchGrounding?: { // Search metadata
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
    searchPerformed?: boolean;
    searchConfidence?: number; // 0.0-1.0
    searchSkipped?: string; // Reason why search wasn't performed
    enhancedWithSearch?: boolean;
    hasSurpriseElement?: boolean; // For premium
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

// Search usage tracking
export interface SearchUsage {
  dailyLimit: number;
  used: number;
  softLimit: number;
  resetTime?: Date;
}

// Type guard to check if narrative is threaded
export function isThreadedNarrative(narrative: any): narrative is ThreadedNarrative {
  return narrative && 
    typeof narrative === 'object' && 
    'hook' in narrative &&
    'threads' in narrative &&
    'bottomLine' in narrative &&
    'actionPlan' in narrative &&
    Array.isArray(narrative.threads);
}