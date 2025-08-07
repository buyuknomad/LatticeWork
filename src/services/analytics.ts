// src/services/analytics.ts
import ReactGA from 'react-ga4';

interface EventParams {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

class AnalyticsService {
  private initialized = false;
  private eventsInProgress = new Map<string, number>();
  private userId: string | null = null;

  /**
   * Initialize Google Analytics
   * Only call this once in your app
   */
  initialize() {
    // Prevent double initialization
    if (this.initialized) {
      console.warn('Analytics already initialized');
      return;
    }

    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    // Skip initialization if no measurement ID or in debug mode
    if (!measurementId || measurementId === 'G-DEBUG_MODE' || measurementId === '') {
      console.log('📊 Analytics disabled (no measurement ID or debug mode)');
      return;
    }

    try {
      ReactGA.initialize(measurementId, {
        gaOptions: {
          // Let GA4 handle page views automatically with Enhanced Measurement
          send_page_view: true, // Let Enhanced Measurement handle this for SPAs
        }
      });

      this.initialized = true;
      console.log('📊 Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Check if analytics is initialized and ready
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Track custom events with automatic deduplication
   * Prevents the same event from being sent multiple times within 1 second
   */
  trackEvent(category: string, action: string, label?: string, value?: number) {
    if (!this.initialized) {
      console.log('Analytics not initialized, skipping event:', { category, action, label });
      return;
    }

    // Create a unique key for this event
    const eventKey = `${category}-${action}-${label || 'none'}`;
    const now = Date.now();

    // Check for duplicate events (within 1 second)
    if (this.eventsInProgress.has(eventKey)) {
      const lastTime = this.eventsInProgress.get(eventKey)!;
      if (now - lastTime < 1000) {
        console.log('Skipping duplicate event:', eventKey);
        return;
      }
    }

    try {
      // Send event to GA4
      ReactGA.event({
        category,
        action,
        label,
        value,
        // Include user ID if set
        user_id: this.userId
      });

      // Store timestamp to prevent duplicates
      this.eventsInProgress.set(eventKey, now);

      // Clean up after 1 second
      setTimeout(() => {
        this.eventsInProgress.delete(eventKey);
      }, 1000);

      console.log('📊 Event tracked:', { category, action, label, value });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Set user ID for tracking logged-in users
   */
  setUserId(userId: string | null) {
    if (!this.initialized) return;
    
    this.userId = userId;
    
    if (userId) {
      ReactGA.set({ userId });
      console.log('📊 User ID set:', userId);
    }
  }

  /**
   * Set user properties for segmentation
   */
  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized) return;
    
    try {
      ReactGA.set(properties);
      console.log('📊 User properties set:', properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Track exceptions/errors
   */
  trackException(description: string, fatal: boolean = false) {
    if (!this.initialized) return;

    try {
      ReactGA.event({
        category: 'Exception',
        action: description,
        label: fatal ? 'fatal' : 'non-fatal'
      });
      console.log('📊 Exception tracked:', description);
    } catch (error) {
      console.error('Failed to track exception:', error);
    }
  }

  /**
   * Track timing events (e.g., how long something takes)
   */
  trackTiming(category: string, variable: string, value: number, label?: string) {
    if (!this.initialized) return;

    try {
      ReactGA.event({
        category: `Timing_${category}`,
        action: variable,
        value: Math.round(value),
        label
      });
      console.log('📊 Timing tracked:', { category, variable, value, label });
    } catch (error) {
      console.error('Failed to track timing:', error);
    }
  }

  /**
   * Create a debounced event tracker
   * Useful for search inputs or rapidly fired events
   */
  createDebouncedTracker(
    category: string,
    action: string,
    delay: number = 500
  ): (label?: string, value?: number) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (label?: string, value?: number) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        this.trackEvent(category, action, label, value);
        timeoutId = null;
      }, delay);
    };
  }

  /**
   * Track social interactions
   */
  trackSocial(network: string, action: string, target?: string) {
    if (!this.initialized) return;

    try {
      ReactGA.event({
        category: 'Social',
        action: `${network}_${action}`,
        label: target
      });
      console.log('📊 Social interaction tracked:', { network, action, target });
    } catch (error) {
      console.error('Failed to track social interaction:', error);
    }
  }

  /**
   * Track e-commerce purchase
   */
  trackPurchase(transactionId: string, value: number, currency: string = 'USD', items?: any[]) {
    if (!this.initialized) return;

    try {
      ReactGA.event({
        category: 'Ecommerce',
        action: 'purchase',
        value,
        label: transactionId,
        currency,
        transaction_id: transactionId,
        items
      });
      console.log('📊 Purchase tracked:', { transactionId, value, currency });
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export types for use in components
export type { EventParams };