// src/components/Dashboard/types.ts

// Existing types remain for backward compatibility
export interface RecommendedTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string;
  // isSurprise removed in v14.7
}

// New types for v14.7 narrative analysis
export interface Thread {
  id: number;
  type: 'opening' | 'pattern' | 'insight' | 'connection' | 'conclusion';
  content: string;
  tools: string[];
  emoji: string;
}

export interface ActionPlanSection {
  sectionName: string;
  actionItems: string[];
}

export interface ActionPlan {
  type: 'personal' | 'strategic' | 'awareness' | 'analytical';
  sections: ActionPlanSection[];
}

export interface NarrativeAnalysis {
  hook: string;
  threads: Thread[];
  bottomLine: string;
  actionPlan: ActionPlan;
}

export interface SearchGrounding {
  wasSearchUsed: boolean;
  searchQuery: string;
  sourcesCount: number;
  searchTimestamp: string;
}

// Updated main response interface
export interface LatticeInsightResponse {
  query_id?: string;
  recommendedTools: RecommendedTool[];
  relationshipsSummary?: string; // Deprecated in v14.7, kept for backward compatibility
  narrativeAnalysis?: NarrativeAnalysis; // New in v14.7, premium only
  keyLessons?: string[]; // New in v14.7, premium only
  searchGrounding?: SearchGrounding; // New in v14.7, when search was used
  error?: string;
  message?: string;
  metadata?: {
    queryType?: string;
    complexity?: number;
    themes?: string[];
    analysisQuality?: 'premium' | 'basic';
    // Verbose fields only when DEBUG_MODE=true
    totalToolsConsidered?: number;
    enhancedWithSearch?: boolean;
  };
}

// Legacy support type guard
export function isLegacyResponse(response: LatticeInsightResponse): boolean {
  return !!(response.relationshipsSummary && !response.narrativeAnalysis);
}

// New format type guard
export function isV14Response(response: LatticeInsightResponse): boolean {
  return !!(response.narrativeAnalysis || response.keyLessons);
}

// Other existing types
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

// Tab types for new UI
export type TabType = 'analysis' | 'deepDive';

export interface TabConfig {
  id: TabType;
  desktop: {
    icon: string;
    label: string;
  };
  mobile: {
    icon: string;
    label: string;
  };
}

export interface TrendingQuestion {
  id: string;
  question: string;
  category: string;
  topic_source: string;
  click_count?: number;
  created_at?: string;
  expires_at?: string;
  active?: boolean;
  pre_generated_analysis?: any;
  // New metadata fields
  metadata?: {
    engagement?: number; // Comments count from Reddit/HN
    score?: number; // Upvotes/points
    isHot?: boolean; // High engagement indicator
    recency?: 'now' | 'today' | 'yesterday' | 'recent';
    sourceType?: 'reddit' | 'hackernews' | 'news';
    url?: string; // Original source URL
  };
}

export interface LatticeInsightResponse {
  query_id?: string;
  recommendedTools: RecommendedTool[];
  relationshipsSummary?: string; // Deprecated in v14.7, kept for backward compatibility
  narrativeAnalysis?: NarrativeAnalysis; // New in v14.7, premium only
  keyLessons?: string[]; // New in v14.7, premium only
  searchGrounding?: SearchGrounding; // New in v14.7, when search was used
  error?: string;
  message?: string;
  metadata?: {
    queryType?: string;
    complexity?: number;
    themes?: string[];
    analysisQuality?: 'premium' | 'basic'; // CRITICAL: Determines what features to show
    // Verbose fields only when DEBUG_MODE=true
    totalToolsConsidered?: number;
    enhancedWithSearch?: boolean;
  };
  // Pre-generated analysis fields
  isPreGenerated?: boolean;
  generatedAt?: string;
}