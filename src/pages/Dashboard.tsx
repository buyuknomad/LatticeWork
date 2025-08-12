// src/pages/Dashboard.tsx
// Minimalist, user-centered dashboard focused on the core experience

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import { analytics } from '../services/analytics';
import { GA_EVENTS, GA_CATEGORIES } from '../constants/analytics';
import { Sparkles, Brain } from 'lucide-react';

// Import Dashboard components
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import QuerySection from '../components/Dashboard/QuerySection';
import LoadingState from '../components/Dashboard/LoadingState';
import ResultsSection from '../components/Dashboard/ResultsSection';
import { 
  LatticeInsightResponse, 
  TrendingQuestion,
  UserTier,
  QueryLimits,
  isV14Response
} from '../components/Dashboard/types';

const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [query, setQuery] = useState('');
  const [querySource, setQuerySource] = useState<'manual' | 'trending'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LatticeInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);

  // Set page title
  useEffect(() => {
    document.title = 'Dashboard | Mind Lattice';
  }, []);
  
  // Animation states
  const [isTypingAnimation, setIsTypingAnimation] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');

  // Trending questions states
  const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // Query limits state
  const [queryLimits, setQueryLimits] = useState<QueryLimits>({
    trendingUsed: 0,
    trendingLimit: 2,
    manualUsed: 0,
    manualLimit: 1,
    resetTime: null
  });

  // Check if we're on the results page
  const isResultsPage = location.pathname === '/dashboard/results';
  const shouldFocusAnalysis = new URLSearchParams(location.search).get('action') === 'analyze';

  // Example queries for animation
  const EXAMPLE_QUERIES = [
    "Why do I procrastinate even when I know the consequences?",
    "What drives people to repeat the same mistakes?",
    "How do successful investors think differently about risk?",
    "Why do teams fall into predictable conflict patterns?",
    "What causes us to ignore evidence that contradicts our beliefs?",
    "Why do we consistently underestimate how long things take?"
  ];

  useEffect(() => {
    if (user?.user_metadata?.tier) {
      setUserTier(user.user_metadata.tier as UserTier);
    }
  }, [user]);

  // Track results view
  useEffect(() => {
    if (results && results.recommendedTools) {
      analytics.trackEvent(
        GA_CATEGORIES.ANALYSIS,
        GA_EVENTS.ANALYSIS.VIEW_RESULTS,
        results.recommendedTools.length ? `${results.recommendedTools.length}_tools` : 'no_tools'
      );
    }
  }, [results]);

  // Track successful upgrade
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const upgradeStatus = urlParams.get('upgrade');
    
    if (upgradeStatus === 'success') {
      // Track successful purchase
      analytics.trackEvent(
        GA_CATEGORIES.PREMIUM,
        GA_EVENTS.PREMIUM.COMPLETE_PURCHASE,
        'dashboard_upgrade'
      );
      
      // Show success message
      setSuccessMessage('🎉 Welcome to Premium! Your subscription is now active.');
      
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Refresh user data to get updated tier
      refreshUserTier();
      
      // Auto-hide message after 10 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
    }
  }, [location.search]);

  // Fetch trending questions
  useEffect(() => {
    fetchTrendingQuestions();
  }, []);

  // Calculate query limits for free users
  useEffect(() => {
    if (userTier === 'free' && user?.id) {
      calculateQueryLimits();
    }
  }, [userTier, user?.id, error]);

  const calculateQueryLimits = async () => {
    if (!user?.id) return;

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Get trending count
      const { count: trendingCount, error: trendingError } = await supabase
        .from('query_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('query_type', 'trending')
        .gte('created_at', twentyFourHoursAgo.toISOString());
      
      // Get manual count
      const { count: manualCount, error: manualError } = await supabase
        .from('query_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('query_type', 'manual')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (trendingError || manualError) {
        console.error('Error calculating query limits:', trendingError || manualError);
        return;
      }
      
      // Get reset time from first query
      let resetTime = null;
      try {
        const { data: firstQuery, error: firstQueryError } = await supabase
          .from('query_history')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();
        
        if (firstQueryError) {
          console.warn('Error fetching first query:', firstQueryError);
        } else if (firstQuery) {
          resetTime = new Date(new Date(firstQuery.created_at).getTime() + 24 * 60 * 60 * 1000);
        }
      } catch (error) {
        console.warn('Error calculating reset time:', error);
      }
      
      setQueryLimits({
        trendingUsed: trendingCount || 0,
        trendingLimit: 2,
        manualUsed: manualCount || 0,
        manualLimit: 1,
        resetTime
      });
    } catch (error) {
      console.error('Error calculating query limits:', error);
    }
  };

  const refreshUserTier = async () => {
    const { data: { user: updatedUser } } = await supabase.auth.getUser();
    if (updatedUser?.user_metadata?.tier) {
      setUserTier(updatedUser.user_metadata.tier as UserTier);
    }
  };

  const fetchTrendingQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('trending_questions')
        .select('id, question, category, topic_source, click_count, metadata, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      
      // Sort to prioritize hot topics
      const sortedQuestions = (data || []).sort((a, b) => {
        // Hot topics first
        const aIsHot = a.metadata?.isHot || false;
        const bIsHot = b.metadata?.isHot || false;
        if (aIsHot && !bIsHot) return -1;
        if (!aIsHot && bIsHot) return 1;
        
        // Then by engagement
        const aEngagement = a.metadata?.engagement || 0;
        const bEngagement = b.metadata?.engagement || 0;
        if (aEngagement !== bEngagement) return bEngagement - aEngagement;
        
        // Finally by recency
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setTrendingQuestions(sortedQuestions);
      
      // Log metadata stats for debugging
      const hotCount = sortedQuestions.filter(q => q.metadata?.isHot).length;
      const withEngagement = sortedQuestions.filter(q => q.metadata?.engagement > 0).length;
      console.log(`Trending questions loaded: ${sortedQuestions.length} total, ${hotCount} hot, ${withEngagement} with engagement`);
      
    } catch (error) {
      console.error('Error fetching trending questions:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  const handleTrendingClick = async (question: TrendingQuestion) => {
    // Track trending question click
    analytics.trackEvent(
      GA_CATEGORIES.ENGAGEMENT,
      GA_EVENTS.ENGAGEMENT.TRENDING_CLICK,
      question.question
    );
    
    // Update click count in background
    supabase
      .from('trending_questions')
      .update({ 
        click_count: (question.click_count || 0) + 1,
        metadata: {
          ...question.metadata,
          lastClickedAt: new Date().toISOString()
        }
      })
      .eq('id', question.id)
      .then(() => console.log('Click tracked'))
      .catch(err => console.error('Error tracking click:', err));
    
    // Set the query and mark source as trending
    setQuery(question.question);
    setQuerySource('trending');
    setError(null);
    setIsTypingAnimation(false);
    
    // Submit immediately
    handleQuerySubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  // Check for query parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam && !results && !isLoading && !isResultsPage) {
      const decodedQuery = decodeURIComponent(queryParam);
      setQuery(decodedQuery);
      setQuerySource('manual');
      setIsTypingAnimation(false);
      
      setTimeout(() => {
        handleQuerySubmit({ preventDefault: () => {} } as React.FormEvent);
      }, 500);
    }
  }, [location.search]);

  // Animated placeholder effect
  useEffect(() => {
    if (!isTypingAnimation) return;

    let timeoutId: number;
    let charIndex = 0;
    let isDeleting = false;

    const typeCharacter = () => {
      if (!isTypingAnimation) return;

      const currentExample = EXAMPLE_QUERIES[currentExampleIndex];

      if (!isDeleting && charIndex <= currentExample.length) {
        setAnimatedPlaceholder(currentExample.slice(0, charIndex));
        charIndex++;
        timeoutId = window.setTimeout(typeCharacter, 50);
      } else if (isDeleting && charIndex >= 0) {
        setAnimatedPlaceholder(currentExample.slice(0, charIndex));
        charIndex--;
        timeoutId = window.setTimeout(typeCharacter, 30);
      } else if (!isDeleting) {
        timeoutId = window.setTimeout(() => {
          isDeleting = true;
          typeCharacter();
        }, 2000);
      } else {
        timeoutId = window.setTimeout(() => {
          setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
        }, 300);
      }
    };

    timeoutId = window.setTimeout(typeCharacter, 100);

    return () => clearTimeout(timeoutId);
  }, [currentExampleIndex, isTypingAnimation]);

  const handleInputFocus = () => {
    setIsTypingAnimation(false);
    setAnimatedPlaceholder('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setError(null);
    
    // If user is typing/modifying, reset to manual
    if (newValue !== query && querySource === 'trending') {
      setQuerySource('manual');
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    // Track analysis start
    analytics.trackEvent(
      GA_CATEGORIES.ANALYSIS,
      GA_EVENTS.ANALYSIS.START,
      querySource === 'trending' ? 'trending_question' : 'manual_query'
    );
    
    // Start timing for performance tracking
    const startTime = Date.now();
    setAnalysisStartTime(startTime);

    // Use the stored source
    const queryType = querySource;

    setIsLoading(true);
    setResults(null);
    setError(null);

    if (!session?.access_token) {
      setError("Authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-lattice-insights-narrative`;
      
      console.log(`SUBMIT_DEBUG: Submitting ${queryType} query to edge function`);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          query: query,
          queryType: queryType
        }),
      });

      setIsLoading(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: "An unexpected error occurred.", 
          details: response.statusText 
        }));
        
        // Track analysis error
        analytics.trackEvent(
          GA_CATEGORIES.ERROR,
          GA_EVENTS.ERROR.API_ERROR,
          `analysis_failed: ${errorData.error || response.statusText}`
        );
        
        // Check if it's a rate limit error and format consistently
        if (response.status === 429 || errorData.error?.includes('limit reached')) {
          // Track rate limit
          analytics.trackEvent(
            GA_CATEGORIES.ANALYSIS,
            'rate_limit_reached',
            queryType
          );
          
          // Format error message based on query type
          if (errorData.error?.includes('trending')) {
            setError('Daily trending analysis limit reached (2 per day). Upgrade to Premium for unlimited queries.');
          } else if (errorData.error?.includes('manual')) {
            setError('Daily manual analysis limit reached (1 per day). Upgrade to Premium for unlimited queries.');
          } else {
            setError(errorData.error || 'Query limit reached. Upgrade to Premium for unlimited queries.');
          }
        } else {
          setError(errorData.error || `Error: ${response.status} ${response.statusText}`);
        }
        
        // Recalculate limits after an error (might be rate limit)
        if (userTier === 'free') {
          setTimeout(() => calculateQueryLimits(), 100);
        }
        return;
      }

      const data: LatticeInsightResponse = await response.json();

      // Track successful analysis
      const analysisTime = Date.now() - startTime;
      analytics.trackEvent(
        GA_CATEGORIES.ANALYSIS,
        GA_EVENTS.ANALYSIS.COMPLETE,
        querySource === 'trending' ? 'trending_question' : 'manual_query',
        Math.round(analysisTime / 1000) // Time in seconds
      );
      
      // Track timing
      analytics.trackTiming(
        GA_CATEGORIES.ANALYSIS,
        'analysis_duration',
        analysisTime,
        querySource
      );

      // Updated debug log for v14.7
      console.log('RESPONSE_DEBUG: Received from edge function:', {
        toolCount: data.recommendedTools?.length,
        tools: data.recommendedTools?.map(t => t.name),
        hasNarrative: !!data.narrativeAnalysis,
        hasKeyLessons: !!data.keyLessons,
        isV14: isV14Response(data),
        metadata: data.metadata
      });

      if (data.error) {
        setError(data.error);
      } else {
        console.log('RESPONSE_DEBUG: Received analysis with', data.recommendedTools?.length, 'tools');
        setResults(data);
        setQuerySource('manual'); // Reset after successful submission
        
        // Navigate to results page with the data
        navigate('/dashboard/results', { 
          state: { 
            results: data, 
            query: query 
          } 
        });
        
        // Recalculate limits after successful query
        if (userTier === 'free') {
          setTimeout(() => calculateQueryLimits(), 100);
        }
      }

    } catch (err: any) {
      setIsLoading(false);
      
      // Track error
      analytics.trackEvent(
        GA_CATEGORIES.ERROR,
        GA_EVENTS.ERROR.API_ERROR,
        `analysis_exception: ${err.message}`
      );
      
      setError(err.message || "Failed to fetch insights. Please try again.");
    }
  };

  const resetQuery = () => {
    setQuery('');
    setQuerySource('manual');
    setResults(null);
    setError(null);
    setIsLoading(false);
    setIsTypingAnimation(true);
    setAnalysisStartTime(null);
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="relative">
      <div className="relative z-10 min-h-screen">
        <EmailVerificationBanner />
        <DashboardHeader
          user={user}
          displayTier={userTier}
        />

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-4 mb-6"
          >
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-center font-medium">{successMessage}</p>
            </div>
          </motion.div>
        )}

        <div className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {!isResultsPage && !isLoading && (
                <>
                  {/* Elegant Learning Journey Card */}
                  {user && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="max-w-2xl mx-auto mb-8"
                    >
                      <motion.button
                        onClick={() => navigate('/personalized')}
                        className="group w-full relative overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Background gradient that animates on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF]/5 via-[#8B5CF6]/5 to-[#00FFFF]/5 group-hover:from-[#00FFFF]/10 group-hover:via-[#8B5CF6]/10 group-hover:to-[#00FFFF]/10 transition-all duration-500" />
                        
                        {/* Animated border */}
                        <div className="absolute inset-0 rounded-2xl">
                          <div className="absolute inset-0 rounded-2xl border border-[#333333]/50 group-hover:border-[#00FFFF]/30 transition-colors duration-300" />
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[inset_0_0_20px_rgba(0,255,255,0.1)]" />
                        </div>

                        {/* Content */}
                        <div className="relative px-6 py-4 rounded-2xl backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Icon with animated background */}
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/20 to-[#8B5CF6]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                                <div className="relative p-3 bg-gradient-to-br from-[#1A1A1A] to-[#252525] rounded-xl border border-[#333333]/50 group-hover:border-[#00FFFF]/30 transition-colors">
                                  <Brain className="w-6 h-6 text-[#00FFFF] group-hover:scale-110 transition-transform duration-300" />
                                </div>
                              </div>
                              
                              {/* Text content */}
                              <div className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-white font-semibold group-hover:text-[#00FFFF] transition-colors">
                                    Your Learning Journey
                                  </h3>
                                  {/* New badge with pulse */}
                                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#00FFFF] text-white text-[10px] font-bold rounded-full animate-pulse">
                                    NEW
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                  Track progress, unlock achievements, get personalized recommendations
                                </p>
                              </div>
                            </div>

                            {/* Arrow with animation */}
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-[#8B5CF6] opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-12" />
                              <div className="text-gray-400 group-hover:text-[#00FFFF] transition-all duration-300 group-hover:translate-x-1">
                                →
                              </div>
                            </div>
                          </div>

                          {/* Progress bar preview (optional - shows if user has activity) */}
                          <motion.div 
                            className="mt-3 h-1 bg-[#1A1A1A] rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          >
                            <motion.div
                              className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]"
                              initial={{ width: "0%" }}
                              whileHover={{ width: "60%" }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </motion.div>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Query Section - The Hero Element */}
                  <QuerySection
                    query={query}
                    setQuery={setQuery}
                    error={error}
                    isLoading={isLoading}
                    isTypingAnimation={isTypingAnimation}
                    animatedPlaceholder={animatedPlaceholder}
                    trendingQuestions={trendingQuestions}
                    loadingTrending={loadingTrending}
                    displayTier={userTier}
                    onSubmit={handleQuerySubmit}
                    onInputFocus={handleInputFocus}
                    onInputChange={handleInputChange}
                    onTrendingClick={handleTrendingClick}
                    shouldFocusAnalysis={shouldFocusAnalysis}
                    userId={user?.id}
                    limits={queryLimits}
                  />
                </>
              )}

              {isLoading && <LoadingState />}

              {isResultsPage && results && !isLoading && results.recommendedTools && (
                <ResultsSection
                  results={results}
                  query={query}
                  displayTier={userTier}
                  onResetQuery={resetQuery}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;