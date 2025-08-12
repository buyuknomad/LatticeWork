// src/components/Personalization/index.ts
// Export all personalization components for easy importing

export { default as PersonalizedDashboard } from './PersonalizedDashboard';
export { default as RecommendationWidget } from './RecommendationWidget';
export { default as LearningPath } from './LearningPath';

// Re-export types if needed
export type { 
  RecommendationWidgetProps 
} from './RecommendationWidget';

export type { 
  LearningPathProps 
} from './LearningPath';