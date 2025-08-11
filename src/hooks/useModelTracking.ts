// src/hooks/useModelTracking.ts
// React hook for tracking mental model views and interactions

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MentalModel } from '../types/mentalModels';
import { supabase } from '../lib/supabase';
import { SessionManager, determineViewSource } from '../utils/sessionManager';

// Get auth context - adjust import based on your auth setup
import { useAuth } from '../context/AuthContext';

interface TrackingOptions {
  enabled?: boolean;
  trackDuration?: boolean;
  trackInteractions?: boolean;
  debug?: boolean;
}

interface ViewTrackingData {
  user_id: string;
  model_slug: string;
  model_name: string;
  category: string;
  view_source: string;
  referrer_path: string | null;
  session_id: string;
  viewport_width: number;
  viewport_height: number;
}

/**
 * Hook to track mental model views and user interactions
 */
export function useModelTracking(
  model: MentalModel | null,
  options: TrackingOptions = {}
) {
  const {
    enabled = true,
    trackDuration = true,
    trackInteractions = false,
    debug = false
  } = options;

  const { user } = useAuth();
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const trackingIdRef = useRef<string | null>(null);
  const hasTrackedRef = useRef(false);
  const interactionCountRef = useRef(0);

  // Debug logging
  const log = useCallback((...args: any[]) => {
    if (debug) {
      console.log('[Analytics]', ...args);
    }
  }, [debug]);

  /**
   * Track the initial view
   */
  const trackView = useCallback(async () => {
    if (!model || !user?.id || !enabled) {
      log('Skipping view tracking:', { model: !!model, user: !!user?.id, enabled });
      return null;
    }

    // Prevent duplicate tracking
    if (hasTrackedRef.current) {
      log('View already tracked for this model');
      return trackingIdRef.current;
    }

    const viewData: ViewTrackingData = {
      user_id: user.id,
      model_slug: model.slug,
      model_name: model.name,
      category: model.category,
      view_source: determineViewSource(location),
      referrer_path: document.referrer || null,
      session_id: SessionManager.getSessionId(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    };

    try {
      log('Tracking view:', viewData);
      
      const { data, error } = await supabase
        .from('mental_model_views')
        .insert(viewData)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to track view:', error);
        return null;
      }

      hasTrackedRef.current = true;
      trackingIdRef.current = data.id;
      log('View tracked successfully:', data.id);
      
      return data.id;
    } catch (error) {
      console.error('Error tracking view:', error);
      return null;
    }
  }, [model, user?.id, enabled, location, log]);

  /**
   * Update view duration when component unmounts or model changes
   */
  const updateDuration = useCallback(async () => {
    if (!trackDuration || !model || !user?.id) {
      return;
    }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // Only update if duration is meaningful (> 1 second)
    if (duration <= 1) {
      log('Duration too short, skipping update:', duration);
      return;
    }

    try {
      log('Updating view duration:', duration, 'seconds');
      
      // Call the update_view_duration function
      const { error } = await supabase.rpc('update_view_duration', {
        p_model_slug: model.slug,
        p_session_id: SessionManager.getSessionId(),
        p_duration: duration
      });

      if (error) {
        console.error('Failed to update duration:', error);
      } else {
        log('Duration updated successfully');
      }
    } catch (error) {
      console.error('Error updating duration:', error);
    }
  }, [model, user?.id, trackDuration, log]);

  /**
   * Track user interactions (optional)
   */
  const trackInteraction = useCallback((interactionType: string, metadata?: any) => {
    if (!trackInteractions || !model || !user?.id) {
      return;
    }

    interactionCountRef.current++;
    
    log('Interaction tracked:', {
      type: interactionType,
      count: interactionCountRef.current,
      metadata
    });

    // You can extend this to send interaction events to a separate table
    // For now, we're just counting interactions
  }, [trackInteractions, model, user?.id, log]);

  // Track view on mount or when model changes
  useEffect(() => {
    if (model && user?.id && enabled) {
      // Reset tracking state for new model
      hasTrackedRef.current = false;
      trackingIdRef.current = null;
      startTimeRef.current = Date.now();
      interactionCountRef.current = 0;
      
      // Track the view
      trackView();
    }
  }, [model?.slug, user?.id, enabled]); // Only re-run when model slug changes

  // Update duration on unmount or model change
  useEffect(() => {
    return () => {
      if (hasTrackedRef.current) {
        updateDuration();
      }
    };
  }, [model?.slug]); // Clean up when model changes

  // Also update duration when user leaves the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasTrackedRef.current) {
        updateDuration();
      }
    };

    const handleBeforeUnload = () => {
      if (hasTrackedRef.current) {
        updateDuration();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateDuration]);

  return {
    trackInteraction,
    isTracking: hasTrackedRef.current,
    sessionId: SessionManager.getSessionId(),
    viewDuration: Math.floor((Date.now() - startTimeRef.current) / 1000),
    interactionCount: interactionCountRef.current
  };
}

/**
 * Hook to track search queries
 */
export function useSearchTracking() {
  const { user } = useAuth();
  const location = useLocation();
  const lastQueryRef = useRef<string>('');
  const lastQueryTimeRef = useRef<number>(0);

  const trackSearch = useCallback(async (
    query: string,
    results: any[],
    filters?: any
  ) => {
    if (!user?.id || !query.trim()) {
      return;
    }

    // Debounce: Don't track if same query within 1 second
    const now = Date.now();
    if (query === lastQueryRef.current && now - lastQueryTimeRef.current < 1000) {
      return;
    }

    lastQueryRef.current = query;
    lastQueryTimeRef.current = now;

    const searchData = {
      user_id: user.id,
      search_query: query,
      search_query_normalized: query.toLowerCase().trim(),
      results_count: results.length,
      search_location: location.pathname.includes('/mental-models') ? 'library_main' : 'dashboard_widget',
      filters_applied: filters || {},
      search_duration_ms: 0, // Will be updated when results load
      session_id: SessionManager.getSessionId()
    };

    try {
      const { error } = await supabase
        .from('mental_model_searches')
        .insert(searchData);

      if (error) {
        console.error('Failed to track search:', error);
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [user?.id, location]);

  const trackSearchClick = useCallback(async (
    modelSlug: string,
    position: number
  ) => {
    if (!user?.id || !lastQueryRef.current) {
      return;
    }

    // Update the last search with click data
    try {
      const { error } = await supabase
        .from('mental_model_searches')
        .update({
          clicked_result_slug: modelSlug,
          clicked_result_position: position
        })
        .eq('user_id', user.id)
        .eq('search_query', lastQueryRef.current)
        .eq('session_id', SessionManager.getSessionId())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Failed to track search click:', error);
      }
    } catch (error) {
      console.error('Error tracking search click:', error);
    }
  }, [user?.id]);

  return {
    trackSearch,
    trackSearchClick
  };
}