// src/utils/sessionManager.ts
// Session management for analytics tracking

/**
 * SessionManager handles creating and managing analytics sessions
 * Sessions persist for the browser session (until tab/window closes)
 */
export class SessionManager {
  private static SESSION_KEY = 'analytics_session_id';
  private static session_id: string | null = null;

  /**
   * Get or create a session ID for analytics tracking
   * Session persists for the browser session
   */
  static getSessionId(): string {
    // Check in-memory cache first
    if (this.session_id) {
      return this.session_id;
    }

    // Check sessionStorage
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    
    if (!sessionId) {
      // Generate new session ID
      sessionId = this.generateSessionId();
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    
    // Cache in memory
    this.session_id = sessionId;
    return sessionId;
  }

  /**
   * Generate a unique session ID
   */
  private static generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const userAgent = navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `${timestamp}_${random}_${userAgent}`;
  }

  /**
   * Reset the current session (forces new session ID)
   */
  static resetSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.session_id = null;
  }

  /**
   * Get session metadata for analytics
   */
  static getSessionMetadata() {
    return {
      session_id: this.getSessionId(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      referrer: document.referrer || null,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if this is a new session (first page view)
   */
  static isNewSession(): boolean {
    return !sessionStorage.getItem(this.SESSION_KEY);
  }

  /**
   * Get session duration in seconds
   */
  static getSessionDuration(): number {
    const sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) return 0;
    
    // Extract timestamp from session ID
    const timestamp = parseInt(sessionId.split('_')[0]);
    if (isNaN(timestamp)) return 0;
    
    return Math.floor((Date.now() - timestamp) / 1000);
  }
}

/**
 * Utility to determine view source based on navigation
 */
export function determineViewSource(location: any): string {
  const pathname = location.pathname || '';
  const search = location.search || '';
  const state = location.state || {};
  
  // Check URL parameters
  const params = new URLSearchParams(search);
  const source = params.get('source');
  const ref = params.get('ref');
  
  // Priority order for determining source
  if (source) {
    return source as string;
  }
  
  if (ref) {
    switch (ref) {
      case 'search': return 'library_search';
      case 'trending': return 'trending_widget';
      case 'related': return 'related_model';
      case 'dashboard': return 'dashboard_link';
      case 'recommendation': return 'recommendation';
      default: return 'direct_url';
    }
  }
  
  // Check navigation state
  if (state.from === 'search') return 'library_search';
  if (state.from === 'trending') return 'trending_widget';
  if (state.from === 'related') return 'related_model';
  if (state.from === 'dashboard') return 'dashboard_link';
  
  // Check referrer path
  const referrer = document.referrer;
  if (referrer) {
    if (referrer.includes('/mental-models') && !referrer.includes('/mental-models/')) {
      return 'library_browse';
    }
    if (referrer.includes('/dashboard')) {
      return 'dashboard_link';
    }
    if (!referrer.includes(window.location.hostname)) {
      return 'external_link';
    }
  }
  
  // Check current path context
  if (pathname.includes('/mental-models/') && document.referrer.includes('/mental-models')) {
    return 'library_browse';
  }
  
  // Default
  return 'direct_url';
}

/**
 * Batch manager for analytics events
 */
export class AnalyticsBatcher {
  private static queue: any[] = [];
  private static flushTimer: NodeJS.Timeout | null = null;
  private static readonly BATCH_SIZE = 50;
  private static readonly FLUSH_INTERVAL = 10000; // 10 seconds

  /**
   * Add event to batch queue
   */
  static addEvent(event: any): void {
    this.queue.push(event);
    
    // Flush if batch size reached
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      // Set timer for automatic flush
      this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
    }
  }

  /**
   * Flush all queued events
   */
  static async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Events will be sent via the analytics service
    // This is handled by the useModelTracking hook
    return Promise.resolve();
  }

  /**
   * Get pending events without clearing queue
   */
  static getPendingEvents(): any[] {
    return [...this.queue];
  }

  /**
   * Clear all pending events
   */
  static clear(): void {
    this.queue = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    AnalyticsBatcher.flush();
  });
  
  // Also flush on visibility change (mobile browsers)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      AnalyticsBatcher.flush();
    }
  });
}