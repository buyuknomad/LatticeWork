// src/utils/searchAnalytics.ts
// Utility functions for search analytics and insights

import { supabase } from '../lib/supabase';

export interface SearchInsight {
  date: string;
  search_location: string;
  total_searches: number;
  unique_users: number;
  searches_with_clicks: number;
  failed_searches: number;
  avg_results_count: number;
  avg_time_to_click: number;
  click_through_rate: number;
  failure_rate: number;
}

export interface PopularSearch {
  search_query: string;
  search_count: number;
  unique_users: number;
  click_through_rate: number;
  avg_results: number;
}

export interface ContentGap {
  search_query: string;
  failure_count: number;
  unique_users: number;
  last_searched: string;
  sample_filters: any;
}

export interface SearchFunnelStage {
  funnel_stage: string;
  count: number;
  percentage: number;
}

/**
 * Get search insights for analytics dashboard
 */
export async function getSearchInsights(
  startDate?: Date,
  endDate?: Date
): Promise<SearchInsight[]> {
  try {
    let query = supabase
      .from('search_insights')
      .select('*')
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('date', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching search insights:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSearchInsights:', error);
    return [];
  }
}

/**
 * Get popular searches for the last N days
 */
export async function getPopularSearches(
  limit: number = 10,
  days: number = 7
): Promise<PopularSearch[]> {
  try {
    const { data, error } = await supabase.rpc('get_popular_searches', {
      p_limit: limit,
      p_days: days
    });

    if (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPopularSearches:', error);
    return [];
  }
}

/**
 * Get content gaps (failed searches) for content creation
 */
export async function getContentGaps(
  limit: number = 20,
  days: number = 30
): Promise<ContentGap[]> {
  try {
    const { data, error } = await supabase.rpc('get_content_gaps', {
      p_limit: limit,
      p_days: days
    });

    if (error) {
      console.error('Error fetching content gaps:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getContentGaps:', error);
    return [];
  }
}

/**
 * Get search funnel metrics
 */
export async function getSearchFunnel(
  startDate?: Date,
  endDate?: Date
): Promise<SearchFunnelStage[]> {
  try {
    const params: any = {};
    if (startDate) params.p_start_date = startDate.toISOString().split('T')[0];
    if (endDate) params.p_end_date = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase.rpc('get_search_funnel', params);

    if (error) {
      console.error('Error fetching search funnel:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSearchFunnel:', error);
    return [];
  }
}

/**
 * Refresh search insights materialized view
 */
export async function refreshSearchInsights(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('refresh_search_insights');

    if (error) {
      console.error('Error refreshing search insights:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in refreshSearchInsights:', error);
    return false;
  }
}

/**
 * Calculate search quality score
 */
export function calculateSearchQuality(metrics: {
  clickThroughRate: number;
  avgTimeToClick: number;
  failureRate: number;
  avgResultsCount: number;
}): number {
  // Weighted scoring algorithm
  const weights = {
    ctr: 0.4,        // 40% - Click-through rate
    speed: 0.2,      // 20% - Speed to click
    success: 0.3,    // 30% - Success rate (inverse of failure)
    relevance: 0.1   // 10% - Result count relevance
  };

  // Normalize metrics to 0-100 scale
  const ctrScore = Math.min(metrics.clickThroughRate, 100);
  const speedScore = Math.max(0, 100 - (metrics.avgTimeToClick / 100)); // Lower is better
  const successScore = 100 - metrics.failureRate;
  const relevanceScore = Math.min(metrics.avgResultsCount / 10 * 100, 100); // 10+ results = 100%

  // Calculate weighted score
  const qualityScore = 
    (ctrScore * weights.ctr) +
    (speedScore * weights.speed) +
    (successScore * weights.success) +
    (relevanceScore * weights.relevance);

  return Math.round(qualityScore);
}

/**
 * Get search performance by category
 */
export async function getSearchPerformanceByCategory(
  days: number = 30
): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from('mental_model_searches')
      .select('filters_applied, clicked_result_slug, time_to_click_ms, failed_search')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching category performance:', error);
      return {};
    }

    // Process data by category
    const categoryMetrics: Record<string, any> = {};

    data?.forEach(search => {
      const category = search.filters_applied?.category || 'all';
      
      if (!categoryMetrics[category]) {
        categoryMetrics[category] = {
          searches: 0,
          clicks: 0,
          failures: 0,
          totalTimeToClick: 0,
          clickCount: 0
        };
      }

      categoryMetrics[category].searches++;
      
      if (search.clicked_result_slug) {
        categoryMetrics[category].clicks++;
      }
      
      if (search.failed_search) {
        categoryMetrics[category].failures++;
      }
      
      if (search.time_to_click_ms) {
        categoryMetrics[category].totalTimeToClick += search.time_to_click_ms;
        categoryMetrics[category].clickCount++;
      }
    });

    // Calculate final metrics
    Object.keys(categoryMetrics).forEach(category => {
      const metrics = categoryMetrics[category];
      categoryMetrics[category] = {
        totalSearches: metrics.searches,
        clickThroughRate: Math.round((metrics.clicks / metrics.searches) * 100),
        failureRate: Math.round((metrics.failures / metrics.searches) * 100),
        avgTimeToClick: metrics.clickCount > 0 
          ? Math.round(metrics.totalTimeToClick / metrics.clickCount)
          : 0,
        qualityScore: calculateSearchQuality({
          clickThroughRate: (metrics.clicks / metrics.searches) * 100,
          avgTimeToClick: metrics.clickCount > 0 
            ? metrics.totalTimeToClick / metrics.clickCount
            : 0,
          failureRate: (metrics.failures / metrics.searches) * 100,
          avgResultsCount: 10 // Default assumption
        })
      };
    });

    return categoryMetrics;
  } catch (error) {
    console.error('Error in getSearchPerformanceByCategory:', error);
    return {};
  }
}

/**
 * Track search quality issues for monitoring
 */
export async function trackSearchQualityIssue(
  issue: {
    type: 'slow_results' | 'no_results' | 'poor_relevance' | 'high_abandonment';
    query: string;
    details: any;
  }
): Promise<void> {
  // This could be sent to a monitoring service or logged
  console.warn('Search Quality Issue:', issue);
  
  // You could also store this in a dedicated table for analysis
  try {
    await supabase
      .from('search_quality_issues')
      .insert({
        issue_type: issue.type,
        search_query: issue.query,
        details: issue.details,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    // Table might not exist yet, log for now
    console.error('Could not track search quality issue:', error);
  }
}

/**
 * Export search analytics data for reporting
 */
export async function exportSearchAnalytics(
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
): Promise<string | null> {
  try {
    const insights = await getSearchInsights(startDate, endDate);
    const popularSearches = await getPopularSearches(20, 
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const contentGaps = await getContentGaps(50, 
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const funnel = await getSearchFunnel(startDate, endDate);

    const data = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      insights,
      popularSearches,
      contentGaps,
      funnel
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV format (simplified)
      const csvLines = ['Category,Metric,Value'];
      
      insights.forEach(insight => {
        csvLines.push(`Insights,Total Searches,${insight.total_searches}`);
        csvLines.push(`Insights,CTR,${insight.click_through_rate}`);
        csvLines.push(`Insights,Failure Rate,${insight.failure_rate}`);
      });
      
      popularSearches.forEach(search => {
        csvLines.push(`Popular Search,"${search.search_query}",${search.search_count}`);
      });
      
      contentGaps.forEach(gap => {
        csvLines.push(`Content Gap,"${gap.search_query}",${gap.failure_count}`);
      });
      
      return csvLines.join('\n');
    }
  } catch (error) {
    console.error('Error exporting search analytics:', error);
    return null;
  }
}