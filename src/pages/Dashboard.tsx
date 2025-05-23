// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BackgroundAnimation from '../components/BackgroundAnimation';

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

  // State management
  const [actualUserTier, setActualUserTier] = useState<UserTier>('free');
  const [devTestTier, setDevTestTier] = useState<UserTier>('free');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LatticeInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTierToggle, setShowTierToggle] = useState(false);
  
  // Animation states
  const [isTypingAnimation, setIsTypingAnimation] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');

  // Trending questions states
  const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const shouldFocusAnalysis = new URLSearchParams(location.search).get('action') === 'analyze';
  const displayTier = showTierToggle ? devTestTier : actualUserTier;

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
      const tier = user.user_metadata.tier as UserTier;
      setActualUserTier(tier);
      setDevTestTier(tier);
    }
  }, [user]);

  // Fetch trending questions
  useEffect(() => {
    fetchTrendingQuestions();
  }, []);

  const fetchTrendingQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('trending_questions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setTrendingQuestions(data || []);
    } catch (error) {
      console.error('Error fetching trending questions:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Log pre-generated analysis to query history
  const logPreGeneratedAnalysis = async (question: string, analysis: LatticeInsightResponse) => {
    if (!user?.id) return;
    
    try {
      console.log('Logging pre-generated analysis to query history');
      
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
          tier_at_query: displayTier
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
    
    // For premium users with pre-generated analysis, show instant results
    if (displayTier === 'premium' && question.pre_generated_analysis) {
      console.log('Using pre-generated analysis for trending question');
      
      // Set results immediately
      setResults(question.pre_generated_analysis as LatticeInsightResponse);
      
      // Log to history
      await logPreGeneratedAnalysis(question.question, question.pre_generated_analysis as LatticeInsightResponse);
      
      // Clear URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (displayTier === 'premium') {
      // Premium user but no pre-generated analysis, auto-submit
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
      }, 100);
    }
    // Free users can now use their 1 query on trending questions
  };

  // Check for query parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam && !results && !isLoading) {
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

    // Clear URL parameter
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);

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
        setError(errorData.error || `Error: ${response.status} ${response.statusText}`);
        return;
      }

      const data: LatticeInsightResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
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
  };

  const toggleDevTier = () => {
    setDevTestTier(prev => prev === 'free' ? 'premium' : 'free');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative z-10 min-h-screen">
        <DashboardHeader
          user={user}
          displayTier={displayTier}
          showTierToggle={showTierToggle}
          devTestTier={devTestTier}
          onToggleTierToggle={() => setShowTierToggle(!showTierToggle)}
          onToggleDevTier={toggleDevTier}
        />

        <div className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {!results && !isLoading && (
                <QuerySection
                  query={query}
                  setQuery={setQuery}
                  error={error}
                  isLoading={isLoading}
                  isTypingAnimation={isTypingAnimation}
                  animatedPlaceholder={animatedPlaceholder}
                  trendingQuestions={trendingQuestions}
                  loadingTrending={loadingTrending}
                  displayTier={displayTier}
                  onSubmit={handleQuerySubmit}
                  onInputFocus={handleInputFocus}
                  onInputChange={handleInputChange}
                  onExampleClick={handleExampleClick}
                  onTrendingClick={handleTrendingClick}
                  shouldFocusAnalysis={shouldFocusAnalysis}
                />
              )}

              {isLoading && <LoadingState />}

              {results && !isLoading && (
                <ResultsSection
                  results={results}
                  query={query}
                  displayTier={displayTier}
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