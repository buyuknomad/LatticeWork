// src/constants/analytics.ts
/**
 * Google Analytics Event Constants
 * Centralized event names to ensure consistency across the app
 */

export const GA_EVENTS = {
  // Authentication Events
  AUTH: {
    SIGNUP_START: 'signup_start',
    SIGNUP_COMPLETE: 'signup_complete',
    LOGIN: 'login',
    LOGOUT: 'logout',
    PASSWORD_RESET_REQUEST: 'password_reset_request',
    PASSWORD_RESET_COMPLETE: 'password_reset_complete',
    EMAIL_VERIFIED: 'email_verified',
    DELETE_ACCOUNT: 'delete_account'
  },
  
  // Mental Models Library Events
  MENTAL_MODELS: {
    VIEW_LIBRARY: 'view_mental_models_library',
    VIEW_MODEL: 'view_mental_model',
    SEARCH: 'search_mental_models',
    FILTER_CATEGORY: 'filter_mental_models_category',
    CLICK_GUIDE: 'click_mental_models_guide',
    CLICK_LEARN_MORE: 'click_learn_more_model'
  },
  
  // Dashboard/Analysis Events
  ANALYSIS: {
    START: 'analysis_start',
    COMPLETE: 'analysis_complete',
    ERROR: 'analysis_error',
    VIEW_RESULTS: 'view_analysis_results',
    SAVE_TO_ARCHIVE: 'save_to_archive',
    COPY_RESULTS: 'copy_analysis_results',
    TOOL_SELECTED: 'analysis_tool_selected',
    EXAMPLE_USED: 'example_prompt_used'
  },
  
  // Premium/Payment Events
  PREMIUM: {
    VIEW_PRICING: 'view_pricing',
    CLICK_UPGRADE: 'click_upgrade_button',
    START_CHECKOUT: 'start_checkout',
    COMPLETE_PURCHASE: 'complete_purchase',
    CANCEL_SUBSCRIPTION: 'cancel_subscription',
    VIEW_UPGRADE_PROMPT: 'view_upgrade_prompt'
  },
  
  // User Engagement Events
  ENGAGEMENT: {
    TRENDING_CLICK: 'trending_question_click',
    EXAMPLE_VIEW: 'example_view',
    FAQ_EXPAND: 'faq_expand',
    FOOTER_LINK: 'footer_link_click',
    HEADER_NAV: 'header_navigation_click',
    DEMO_INTERACTION: 'demo_interaction',
    SHARE_CONTENT: 'share_content',
    CONTACT_FORM: 'contact_form_submit'
  },
  
  // Archive Events
  ARCHIVE: {
    VIEW_ARCHIVE: 'view_archive',
    VIEW_QUESTION: 'view_archived_question',
    DELETE_QUESTION: 'delete_archived_question',
    SEARCH_ARCHIVE: 'search_archive',
    FILTER_ARCHIVE: 'filter_archive'
  },
  
  // Settings Events
  SETTINGS: {
    UPDATE_PROFILE: 'update_profile',
    CHANGE_PASSWORD: 'change_password',
    UPDATE_PREFERENCES: 'update_preferences',
    EXPORT_DATA: 'export_data'
  },
  
  // Error Events
  ERROR: {
    API_ERROR: 'api_error',
    PAYMENT_ERROR: 'payment_error',
    AUTH_ERROR: 'auth_error',
    LOAD_ERROR: 'load_error'
  }
} as const;

/**
 * Event Categories for grouping in GA4
 */
export const GA_CATEGORIES = {
  AUTH: 'Authentication',
  MENTAL_MODELS: 'Mental Models',
  ANALYSIS: 'Analysis',
  PREMIUM: 'Premium',
  ENGAGEMENT: 'Engagement',
  ARCHIVE: 'Archive',
  SETTINGS: 'Settings',
  ERROR: 'Error',
  TIMING: 'Timing',
  SOCIAL: 'Social'
} as const;

/**
 * Helper function to create consistent event parameters
 */
export function createEventParams(
  category: keyof typeof GA_CATEGORIES,
  action: string,
  label?: string,
  value?: number
) {
  return {
    category: GA_CATEGORIES[category],
    action,
    label,
    value
  };
}