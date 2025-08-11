// src/hooks/useSearchTracking.ts
// Enhanced search tracking hook with better debouncing and failed search detection

import { useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import { supabase } from '../lib/supabase';
import { SessionManager } from '../utils/sessionManager';
import { useAuth } from '../context/AuthContext';
import { MentalModelSummary } from '../types/mentalModels';

interface SearchTrackingData {
  user_id: string;
  search_query: string;
  search_query_normalized: string;
  results_count: number;
  search_location: 'library_main' | 'dashboard_widget' | 'modal' | 'quick_search';
  filters_applied: Record<string, any>;
  search_duration_ms: number;
  session_id: string;
  clicked_result_slug?: string;
  clicked_result_position?: number;
  failed_search: boolean;
  search_type: 'initial' | 'refined' | 'paginated';
  viewport_context: {
    width: number;
    height: number;
    scroll_position: number;
  };
}

interface SearchContext {
  category?: string | null;
  page?: number;
  sortBy?: string;
  [key: string]: any;
}

interface SearchMetrics {
  searchStartTime: number;
  searchEndTime: number;
  firstResultClickTime?: number;
  abandonmentTime?: number;
  refinementCount: number;
}

/**
 * Enhanced hook for comprehensive search tracking
 */
export function useSearchTracking(options = { debug: false }) {
  const { user } = useAuth();
  const location = useLocation();
  
  // Refs for tracking state
  const lastQueryRef = useRef<string>('');
  const lastQueryTimeRef = useRef<number>(0);
  const searchMetricsRef = useRef<SearchMetrics>({
    searchStartTime: 0,
    searchEndTime: 0,
    refinementCount: 0
  });
  const searchIdRef = useRef<string | null>(null);
  const lastResultsRef = useRef<MentalModelSummary[]>([]);
  
  // Debug logging
  const log = useCallback((...args: any[]) => {
    if (options.debug) {
      console.log('[SearchTracking]', ...args);
    }
  }, [options.debug]);

  /**
   * Determine search location based on current route
   */
  const getSearchLocation = useCallback((): SearchTrackingData['search_location'] => {
    const pathname = location.pathname;
    
    if (pathname === '/mental-models') return 'library_main';
    if (pathname === '/dashboard') return 'dashboard_widget';
    if (pathname.includes('/mental-models/')) return 'modal';
    
    return 'quick_search';
  }, [location.pathname]);

  /**
   * Determine search type (initial, refined, paginated)
   */
  const getSearchType = useCallback((
    currentQuery: string,
    previousQuery: string,
    context: SearchContext
  ): SearchTrackingData['search_type'] => {
    if (!previousQuery) return 'initial';
    
    // Check if it's pagination
    if (currentQuery === previousQuery && context.page && context.page > 1) {
      return 'paginated';
    }
    
    // Check if it's a refinement
    if (currentQuery.startsWith(previousQuery) || previousQuery.startsWith(currentQuery)) {
      return 'refined';
    }
    
    return 'initial';
  }, []);

  /**
   * Track failed searches (no results or very few results)
   */
  const detectFailedSearch = useCallback((
    results: any[],
    query: string
  ): boolean => {
    // Consider it failed if:
    // 1. No results at all
    // 2. Less than 3 results for queries longer than 3 chars
    // 3. Results don't match query intent (future ML enhancement)
    
    if (results.length === 0) return true;
    if (query.length > 3 && results.length < 3) return true;
    
    return false;
  }, []);

  /**
   * Core search tracking function with debouncing
   */
  const trackSearchInternal = useCallback(async (
    query: string,
    results: MentalModelSummary[],
    context: SearchContext = {}
  ) => {
    if (!user?.id || !query.trim()) {
      log('Skipping search tracking - no user or empty query');
      return null;
    }

    const now = Date.now();
    const normalizedQuery = query.toLowerCase().trim();
    
    // Determine search metadata
    const searchType = getSearchType(normalizedQuery, lastQueryRef.current, context);
    const isFailedSearch = detectFailedSearch(results, normalizedQuery);
    
    // Update metrics
    if (searchType === 'initial') {
      searchMetricsRef.current = {
        searchStartTime: now,
        searchEndTime: now,
        refinementCount: 0
      };
    } else if (searchType === 'refined') {
      searchMetricsRef.current.refinementCount++;
      searchMetricsRef.current.searchEndTime = now;
    }
    
    const searchDuration = searchMetricsRef.current.searchEndTime - searchMetricsRef.current.searchStartTime;
    
    // Store results for click tracking
    lastResultsRef.current = results;
    
    // Prepare tracking data
    const trackingData: SearchTrackingData = {
      user_id: user.id,
      search_query: query,
      search_query_normalized: normalizedQuery,
      results_count: results.length,
      search_location: getSearchLocation(),
      filters_applied: {
        category: context.category || null,
        page: context.page || 1,
        sortBy: context.sortBy || null,
        ...context
      },
      search_duration_ms: searchDuration,
      session_id: SessionManager.getSessionId(),
      failed_search: isFailedSearch,
      search_type: searchType,
      viewport_context: {
        width: window.innerWidth,
        height: window.innerHeight,
        scroll_position: window.scrollY
      }
    };

    try {
      log('Tracking search:', trackingData);
      
      const { data, error } = await supabase
        .from('mental_model_searches')
        .insert(trackingData)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to track search:', error);
        return null;
      }

      // Store search ID for click tracking
      searchIdRef.current = data.id;
      lastQueryRef.current = normalizedQuery;
      lastQueryTimeRef.current = now;
      
      log('Search tracked successfully:', data.id);
      
      // Track failed searches for content gap analysis
      if (isFailedSearch) {
        await trackFailedSearchInsight(query, context);
      }
      
      return data.id;
    } catch (error) {
      console.error('Error tracking search:', error);
      return null;
    }
  }, [user?.id, getSearchLocation, getSearchType, detectFailedSearch, log]);

  /**
   * Track insights for failed searches (for content gap analysis)
   */
  const trackFailedSearchInsight = useCallback(async (
    query: string,
    context: SearchContext
  ) => {
    // This could be a separate table or a special event
    // For now, we'll log it for analysis
    log('Failed search detected:', {
      query,
      context,
      timestamp: new Date().toISOString()
    });
    
    // You could send this to a separate analytics service or table
    // for content team to review and create missing content
  }, [log]);

  /**
   * Debounced search tracking function
   */
  const trackSearch = useCallback(
    debounce((query: string, results: MentalModelSummary[], context?: SearchContext) => {
      trackSearchInternal(query, results, context);
    }, 500),
    [trackSearchInternal]
  );

  /**
   * Track click on search result with enhanced metrics
   */
  const trackSearchClick = useCallback(async (
    modelSlug: string,
    position: number
  ) => {
    if (!user?.id || !searchIdRef.current) {
      log('Cannot track click - no user or search ID');
      return;
    }

    const clickTime = Date.now();
    const timeToClick = searchMetricsRef.current.searchEndTime 
      ? clickTime - searchMetricsRef.current.searchEndTime 
      : 0;

    try {
      log('Tracking search click:', {
        modelSlug,
        position,
        searchId: searchIdRef.current,
        timeToClick
      });

      // Update the search record with click data
      const { error } = await supabase
        .from('mental_model_searches')
        .update({
          clicked_result_slug: modelSlug,
          clicked_result_position: position,
          time_to_click_ms: timeToClick,
          updated_at: new Date().toISOString()
        })
        .eq('id', searchIdRef.current);

      if (error) {
        console.error('Failed to track search click:', error);
        return;
      }

      // Update metrics
      if (!searchMetricsRef.current.firstResultClickTime) {
        searchMetricsRef.current.firstResultClickTime = clickTime;
      }

      log('Search click tracked successfully');
    } catch (error) {
      console.error('Error tracking search click:', error);
    }
  }, [user?.id, log]);

  /**
   * Track search abandonment (user leaves without clicking)
   */
  const trackSearchAbandonment = useCallback(async () => {
    if (!user?.id || !searchIdRef.current || searchMetricsRef.current.firstResultClickTime) {
      return;
    }

    const abandonmentTime = Date.now();
    const dwellTime = abandonmentTime - searchMetricsRef.current.searchEndTime;

    try {
      log('Tracking search abandonment:', {
        searchId: searchIdRef.current,
        dwellTime
      });

      await supabase
        .from('mental_model_searches')
        .update({
          abandoned: true,
          abandonment_dwell_time_ms: dwellTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', searchIdRef.current);

      log('Search abandonment tracked');
    } catch (error) {
      console.error('Error tracking search abandonment:', error);
    }
  }, [user?.id, log]);

  /**
   * Get search suggestions based on partial query
   */
  const getSearchSuggestions = useCallback(async (
    partialQuery: string
  ): Promise<string[]> => {
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('mental_model_searches')
        .select('search_query')
        .ilike('search_query_normalized', `${partialQuery.toLowerCase()}%`)
        .eq('failed_search', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Failed to get search suggestions:', error);
        return [];
      }

      // Deduplicate and return unique suggestions
      const uniqueSuggestions = Array.from(new Set(data.map(d => d.search_query)));
      return uniqueSuggestions.slice(0, 5);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }, []);

  /**
   * Get search analytics for the current user
   */
  const getSearchAnalytics = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('mental_model_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Failed to get search analytics:', error);
        return null;
      }

      // Calculate metrics
      const totalSearches = data.length;
      const clickedSearches = data.filter(s => s.clicked_result_slug).length;
      const failedSearches = data.filter(s => s.failed_search).length;
      const avgTimeToClick = data
        .filter(s => s.time_to_click_ms)
        .reduce((acc, s) => acc + s.time_to_click_ms, 0) / clickedSearches || 0;

      return {
        totalSearches,
        clickThroughRate: clickedSearches / totalSearches,
        failedSearchRate: failedSearches / totalSearches,
        avgTimeToClick,
        recentSearches: data.slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return null;
    }
  }, [user?.id]);

  return {
    trackSearch,
    trackSearchClick,
    trackSearchAbandonment,
    getSearchSuggestions,
    getSearchAnalytics,
    currentQuery: lastQueryRef.current,
    isSearching: !!searchIdRef.current,
    searchMetrics: searchMetricsRef.current
  };
} 