// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

  // Removed pre-filled question logic - query bar should remain empty

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
      
      // Get query count from queries table
      // Note: Adjust table name and structure based on your actual database schema
      const { data: queriesData, error: queriesError } = await supabase
        .from('queries')  // Changed from 'trending_queries' and 'manual_queries'
        .select('id, query_type')
        .eq('user_id', user.id)
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (queriesError) {
        // If queries table doesn't exist, set default limits
        console.log('Queries table not found, using default limits');
        setQueryLimits({
          trendingUsed: 0,
          trendingLimit: 2,
          manualUsed: 0,
          manualLimit: 1,
          resetTime: new Date(twentyFourHoursAgo.getTime() + 24 * 60 * 60 * 1000)
        });
        return;
      }

      // Count queries by type
      const trendingCount = queriesData?.filter(q => q.query_type === 'trending').length || 0;
      const manualCount = queriesData?.filter(q => q.query_type === 'manual').length || 0;

      setQueryLimits({
        trendingUsed: trendingCount,
        trendingLimit: 2,
        manualUsed: manualCount,
        manualLimit: 1,
        resetTime: new Date(twentyFourHoursAgo.getTime() + 24 * 60 * 60 * 1000)
      });
    } catch (err) {
      console.error('Error calculating limits:', err);
      // Set default limits on error
      setQueryLimits({
        trendingUsed: 0,
        trendingLimit: 2,
        manualUsed: 0,
        manualLimit: 1,
        resetTime: null
      });
    }
  };

  const fetchTrendingQuestions = async () => {
    setLoadingTrending(true);
    try {
      const { data, error } = await supabase
        .from('trending_questions')
        .select('*')
        .eq('active', true)  // Changed from 'is_active' to 'active'
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      setTrendingQuestions(data || []);
    } catch (err) {
      console.error('Error fetching trending questions:', err);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Animation effect
  useEffect(() => {
    if (isTypingAnimation && !isResultsPage) {
      const currentQuery = EXAMPLE_QUERIES[currentExampleIndex];
      let charIndex = 0;
      let currentText = '';

      const typeInterval = setInterval(() => {
        if (charIndex < currentQuery.length) {
          currentText += currentQuery[charIndex];
          setAnimatedPlaceholder(currentText);
          charIndex++;
        } else {
          setTimeout(() => {
            let deleteIndex = currentText.length;
            const deleteInterval = setInterval(() => {
              if (deleteIndex > 0) {
                currentText = currentText.slice(0, -1);
                setAnimatedPlaceholder(currentText);
                deleteIndex--;
              } else {
                clearInterval(deleteInterval);
                setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
              }
            }, 30);
          }, 2000);
          clearInterval(typeInterval);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    }
  }, [currentExampleIndex, isTypingAnimation, isResultsPage]);

  const handleInputFocus = () => {
    setIsTypingAnimation(false);
    setAnimatedPlaceholder('');
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setError(null);
    if (value === '') {
      setQuerySource('manual');
    }
  };

  const handleTrendingClick = async (question: TrendingQuestion) => {
    setQuery(question.question);
    setQuerySource('trending');
    
    if (userTier === 'free' && queryLimits.trendingUsed >= queryLimits.trendingLimit) {
      setError(`You've used all ${queryLimits.trendingLimit} trending questions today. Try your own question or upgrade to Premium for unlimited access!`);
      return;
    }
    
    // Auto-submit after selection
    setTimeout(() => {
      handleQuerySubmit(question.question, 'trending');
    }, 100);
  };

  const handleQuerySubmit = async (submittedQuery?: string, source?: 'manual' | 'trending') => {
    const queryToSubmit = submittedQuery || query;
    const querySourceToUse = source || querySource;
    
    if (!queryToSubmit.trim()) {
      setError("Please enter a question to analyze");
      return;
    }

    // Check limits for free users
    if (userTier === 'free') {
      if (querySourceToUse === 'trending' && queryLimits.trendingUsed >= queryLimits.trendingLimit) {
        setError(`You've used all ${queryLimits.trendingLimit} trending questions today. Try your own question or upgrade to Premium!`);
        return;
      }
      if (querySourceToUse === 'manual' && queryLimits.manualUsed >= queryLimits.manualLimit) {
        setError(`You've used your daily custom question. Try a trending question or upgrade to Premium for unlimited access!`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const requestBody = {
        question: queryToSubmit,
        userId: user?.id || 'anonymous',
        tier: userTier,
        querySource: querySourceToUse
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-gemini`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 429) {
          if (userTier === 'free') {
            const limitType = querySourceToUse === 'trending' ? 
              `${queryLimits.trendingLimit} trending` : 
              `${queryLimits.manualLimit} custom`;
            throw new Error(`Daily limit reached! Free users get ${limitType} questions per day. Upgrade to Premium for unlimited access.`);
          } else {
            throw new Error("Rate limit reached. Please wait a moment before trying again.");
          }
        }
        
        throw new Error(errorData?.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.recommendedTools || !Array.isArray(data.recommendedTools)) {
        throw new Error("Invalid response format from server");
      }

      if (data.recommendedTools.length === 0) {
        throw new Error("No insights were generated. Please try rephrasing your question.");
      }

      setResults(data);
      setIsLoading(false);
      
      // Store the query and results
      if (isV14Response(data)) {
        navigate('/dashboard/results', { 
          state: { 
            results: data, 
            query: queryToSubmit 
          } 
        });
      } else {
        // Navigate to results page with the data
        navigate('/dashboard/results', { 
          state: { 
            results: data, 
            query: queryToSubmit 
          } 
        });
      }
      
      // Recalculate limits after successful query
      if (userTier === 'free') {
        setTimeout(() => calculateQueryLimits(), 100);
      }

    } catch (err: any) {
      setIsLoading(false);
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
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="relative">
      {/* BackgroundAnimation removed - now handled in App.tsx */}
      
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