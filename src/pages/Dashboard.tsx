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
  UserTier 
} from '../components/Dashboard/types';

const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LatticeInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Animation states
  const [isTypingAnimation, setIsTypingAnimation] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');

  // Trending questions states
  const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

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
    fetchTrendingQuestions();
  }, []);

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
  }, [isResultsPage, results, location.state, navigate]);

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

  const fetchTrendingQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('trending_questions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      
      setTrendingQuestions(data || []);
    } catch (error) {
      console.error('Error fetching trending questions:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Log pre-generated analysis to query history with duplicate prevention
  const logPreGeneratedAnalysis = async (question: string, analysis: LatticeInsightResponse, isTrending: boolean = false) => {
    if (!user?.id) return;
    
    try {
      // If it's a trending query, check if it already exists
      if (isTrending) {
        console.log('Checking if trending query already logged...');
        
        const { data: existingQuery, error: checkError } = await supabase
          .from('query_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('query_text', question)
          .eq('is_trending', true)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking for existing trending query:', checkError);
        }
        
        if (existingQuery) {
          console.log('Trending query already logged, skipping duplicate entry');
          return;
        }
      }
      
      console.log(`Logging ${isTrending ? 'trending' : 'regular'} pre-generated analysis to query history`);
      
      const llmSummary = analysis.recommendedTools?.map(t => t.name).join(', ') || "No tools";
      
      const { error: logError } = await supabase
        .from('query_history')
        .insert({
          user_id: user.id,
          query_text: question,
          llm_response_summary: llmSummary.substring(0, 250),
          recommended_tools: analysis.recommendedTools || [],
          relationships_summary: analysis.relationshipsSummary || null,
          full_response: analysis,
          created_at: new Date().toISOString(),
          tier_at_query: userTier,
          is_trending: isTrending
        });
        
      if (logError) {
        console.error('Error logging pre-generated analysis:', logError);
      } else {
        console.log('Successfully logged pre-generated analysis to history');
      }
    } catch (error) {
      console.error('Unexpected error logging pre-generated analysis:', error);
    }
  };

  const handleTrendingClick = async (question: TrendingQuestion) => {
    // Track the click
    await supabase
      .from('trending_questions')
      .update({ click_count: question.click_count + 1 })
      .eq('id', question.id);
    
    // Set the query
    setQuery(question.question);
    setError(null);
    setIsTypingAnimation(false);
    
    // Check if pre-generated analysis exists
    if (question.pre_generated_analysis) {
      // For both free and premium users with pre-generated analysis
      if (userTier === 'premium') {
        // Premium users get instant results without any checks
        console.log('Using pre-generated analysis for trending question (premium user)');
        const analysisResults = question.pre_generated_analysis as LatticeInsightResponse;
        setResults(analysisResults);
        await logPreGeneratedAnalysis(question.question, analysisResults, true);
        
        // Navigate to results page
        navigate('/dashboard/results', { 
          state: { 
            results: analysisResults, 
            query: question.question 
          } 
        });
      } else {
        // Free users need rate limit check first
        console.log('Checking rate limit for free user before showing pre-generated analysis');
        
        // Check if user has queries remaining
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error: queryCountError } = await supabase
          .from('query_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .gte('created_at', twentyFourHoursAgo);
        
        if (queryCountError) {
          console.error('Error checking query count:', queryCountError);
          setError('Could not verify query limits. Please try again.');
          return;
        }
        
        if (count !== null && count >= 1) {
          // User has already used their daily query
          setError('Query limit reached. Free tier allows 1 query per 24 hours. Upgrade to Premium for unlimited queries.');
          return;
        }
        
        // User has queries remaining, show pre-generated results
        console.log('Free user has queries remaining, showing pre-generated analysis');
        const analysisResults = question.pre_generated_analysis as LatticeInsightResponse;
        setResults(analysisResults);
        await logPreGeneratedAnalysis(question.question, analysisResults, true);
        
        // Navigate to results page
        navigate('/dashboard/results', { 
          state: { 
            results: analysisResults, 
            query: question.question 
          } 
        });
      }
    } else {
      // No pre-generated analysis available
      if (userTier === 'premium') {
        // Premium user - auto-submit for new analysis
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
          }
        }, 100);
      }
      // Free users will need to manually submit (respecting their 1/day limit)
    }
  };

  // Check for query parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam && !results && !isLoading && !isResultsPage) {
      const decodedQuery = decodeURIComponent(queryParam);
      setQuery(decodedQuery);
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
    setQuery(e.target.value);
    setError(null);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setError(null);
    setIsTypingAnimation(false);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResults(null);
    setError(null);

    if (!session?.access_token) {
      setError("Authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-lattice-insights`;
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query: query }),
      });

      setIsLoading(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: "An unexpected error occurred.", 
          details: response.statusText 
        }));
        
        // Check if it's a rate limit error and format consistently
        if (response.status === 429 || errorData.error?.includes('Query limit reached')) {
          setError('Query limit reached. Free tier allows 1 query per 24 hours. Upgrade to Premium for unlimited queries.');
        } else {
          setError(errorData.error || `Error: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data: LatticeInsightResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
        // Navigate to results page with the data
        navigate('/dashboard/results', { 
          state: { 
            results: data, 
            query: query 
          } 
        });
      }

    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Failed to fetch insights. Please try again.");
    }
  };

  const resetQuery = () => {
    setQuery('');
    setResults(null);
    setError(null);
    setIsLoading(false);
    setIsTypingAnimation(true);
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <BackgroundAnimation />
      
      
      <div className="relative z-10 min-h-screen">
        <EmailVerificationBanner />  {/* Add this line */}
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
                  onExampleClick={handleExampleClick}
                  onTrendingClick={handleTrendingClick}
                  shouldFocusAnalysis={shouldFocusAnalysis}
                  userId={user?.id}
                />
              )}

              {isLoading && <LoadingState />}

              {isResultsPage && results && !isLoading && (
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