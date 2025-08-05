// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BackgroundAnimation from '../components/BackgroundAnimation';
import EmailVerificationBanner from '../components/EmailVerificationBanner';

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

  // Add this to handle OAuth hash in URL
  useEffect(() => {
    // Check if there's a hash with access_token (OAuth redirect)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log('OAuth tokens detected in URL, cleaning up...');
      
      // Clean up the URL by removing the hash
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

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

  // Fetch trending questions
  useEffect(() => {
    if (user) {
      fetchTrendingQuestions();
    }
  }, [user]);

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
        
        if (!firstQueryError && firstQuery) {
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
        const isHotA = a.topic_source === 'hot_topic';
        const isHotB = b.topic_source === 'hot_topic';
        
        if (isHotA && !isHotB) return -1;
        if (!isHotA && isHotB) return 1;
        
        return b.click_count - a.click_count;
      });
      
      setTrendingQuestions(sortedQuestions);
    } catch (error) {
      console.error('Error fetching trending questions:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Handle navigation state for results
  useEffect(() => {
    // If we're on results page but have no results, redirect to dashboard
    if (isResultsPage && !results && !location.state?.results) {
      navigate('/dashboard');
    }
    
    // If we have results in location state (from navigation), use them
    if (location.state?.results && location.state?.query) {
      setResults(location.state.results);
      setQuery(location.state.query);
    }
    
    // Clear query when returning to main dashboard
    if (!isResultsPage && !location.search.includes('q=')) {
      // Only clear if we had results (meaning we're coming back from results page)
      if (results) {
        setQuery('');
        setQuerySource('manual');
        setResults(null);
        setError(null);
        setIsTypingAnimation(true);
      }
    }
  }, [isResultsPage, results, location.state, location.pathname, navigate]);

  // Handle upgrade success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const upgradeStatus = urlParams.get('upgrade');
    
    if (upgradeStatus === 'success') {
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

  // Function to refresh user tier
  const refreshUserTier = async () => {
    if (!user?.id) return;
    
    try {
      // Check subscription status from the view
      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .maybeSingle();
      
      if (subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing') {
        setUserTier('premium');
        
        // Update user metadata
        await supabase.auth.updateUser({
          data: { tier: 'premium' }
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

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
      } else if (!isDeleting && charIndex > currentExample.length) {
        // Pause at the end
        timeoutId = window.setTimeout(() => {
          isDeleting = true;
          typeCharacter();
        }, 2000);
      } else if (isDeleting && charIndex > 0) {
        setAnimatedPlaceholder(currentExample.slice(0, charIndex - 1));
        charIndex--;
        timeoutId = window.setTimeout(typeCharacter, 30);
      } else if (isDeleting && charIndex === 0) {
        // Move to next example
        setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
        isDeleting = false;
        timeoutId = window.setTimeout(typeCharacter, 500);
      }
    };

    typeCharacter();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentExampleIndex, isTypingAnimation]);

  const handleInputFocus = () => {
    setIsTypingAnimation(false);
    setAnimatedPlaceholder('');
  };

  const handleInputChange = (newQuery: string) => {
    setQuery(newQuery);
    setError(null);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the edge function with the query and source
      const { data, error: fetchError } = await supabase.functions.invoke('get-lattice-insights', {
        body: JSON.stringify({ 
          query: query.trim(),
          source: querySource
        })
      });
      
      if (fetchError) throw fetchError;
      
      // Check if we got a quality-based response (v1.4+)
      const isV14 = isV14Response(data);
      
      if (isV14 && data.error && data.status === 429) {
        // Handle rate limit from v1.4
        setError(data.error);
        
        // Refresh limits if we hit them
        if (userTier === 'free') {
          await calculateQueryLimits();
        }
        return;
      }
      
      if (!data || !data.recommendedTools) {
        throw new Error('Invalid response format');
      }
      
      setResults(data);
      
      // Navigate to results page
      navigate('/dashboard/results', { 
        state: { 
          results: data, 
          query: query.trim() 
        } 
      });
      
    } catch (error: any) {
      console.error('Error getting insights:', error);
      setError(error.message || 'Failed to analyze your query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendingClick = (question: TrendingQuestion) => {
    // Track click
    supabase
      .from('trending_questions')
      .update({ 
        click_count: question.click_count + 1,
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

  const resetQuery = () => {
    setQuery('');
    setQuerySource('manual');
    setResults(null);
    setError(null);
    setIsLoading(false);
    setIsTypingAnimation(true);
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  // Add a loading state while user is being loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF] mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <BackgroundAnimation />
      
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