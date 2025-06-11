// src/pages/DashboardTest.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BackgroundAnimation from '../components/BackgroundAnimation';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import { Settings, Clock, Crown, Sparkles } from 'lucide-react';

// Import Dashboard components - test versions
import QuerySectionTest from '../components/Dashboard/QuerySectionTest';
import LoadingStateTest from '../components/Dashboard/LoadingStateTest';
import ResultsSectionWrapper from '../components/Dashboard/ResultsSectionWrapper';
import { 
  LatticeInsightNarrativeResponse, 
  TrendingQuestion,
  UserTier,
  isThreadedNarrative 
} from '../components/Dashboard/types';

// Add QueryLimits interface
interface QueryLimits {
  trendingUsed: number;
  trendingLimit: number;
  manualUsed: number;
  manualLimit: number;
  resetTime: Date | null;
}

const DashboardTest: React.FC = () => {
  const { user, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [query, setQuery] = useState('');
  const [querySource, setQuerySource] = useState<'manual' | 'trending'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LatticeInsightNarrativeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Test mode controls
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  const [allowSearchInTest, setAllowSearchInTest] = useState(true); // Default to true for v14.3
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  const [testTier, setTestTier] = useState<UserTier>('premium');

  // Set page title
  useEffect(() => {
    document.title = 'Dashboard Test (v14.3 Thread System) | Mind Lattice';
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
  const isResultsPage = location.pathname === '/dashboard-test/results';
  const shouldFocusAnalysis = new URLSearchParams(location.search).get('action') === 'analyze';

  // Debug logging
  useEffect(() => {
    console.log('DashboardTest Debug:', {
      isResultsPage,
      hasResults: !!results,
      isLoading,
      resultsType: results ? typeof results : 'undefined',
      pathname: location.pathname,
      resultsStructure: results ? Object.keys(results) : null
    });
  }, [isResultsPage, results, isLoading, location.pathname]);

  // Example queries for animation - including search-worthy examples
  const EXAMPLE_QUERIES = [
    "Why do I procrastinate even when I know the consequences?",
    "What drives people to repeat the same mistakes?",
    "How do successful investors think differently about risk?",
    "Why do teams fall into predictable conflict patterns?",
    "What causes us to ignore evidence that contradicts our beliefs?",
    "Why do we consistently underestimate how long things take?",
    "Latest on Elon Musk and Trump situation?", // Search-worthy
    "What's happening with AI regulation in Europe?", // Search-worthy
    "Current state of climate technology breakthroughs", // Search-worthy
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

  // Calculate query limits for free users
  useEffect(() => {
    if (userTier === 'free' && user?.id && !testModeEnabled) {
      calculateQueryLimits();
    }
  }, [userTier, user?.id, error, testModeEnabled]);

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
      const { data: firstQuery } = await supabase
        .from('query_history')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
      const resetTime = firstQuery 
        ? new Date(new Date(firstQuery.created_at).getTime() + 24 * 60 * 60 * 1000)
        : null;
      
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

  // Handle navigation state for results
  useEffect(() => {
    if (isResultsPage && !results && !location.state?.results) {
      navigate('/dashboard-test');
    }
    
    if (location.state?.results && location.state?.query) {
      setResults(location.state.results);
      setQuery(location.state.query);
    }
    
    if (!isResultsPage && !location.search.includes('q=')) {
      if (results) {
        setQuery('');
        setQuerySource('manual');
        setResults(null);
        setError(null);
        setIsTypingAnimation(true);
      }
    }
  }, [isResultsPage, results, location.state, location.pathname, navigate]);

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

  const handleTrendingClick = async (question: TrendingQuestion) => {
    // Update click count in background
    supabase
      .from('trending_questions')
      .update({ click_count: question.click_count + 1 })
      .eq('id', question.id)
      .then(() => console.log('Click tracked'))
      .catch(err => console.error('Error tracking click:', err));
    
    setQuery(question.question);
    setQuerySource('trending');
    setError(null);
    setIsTypingAnimation(false);
    
    handleQuerySubmit({ preventDefault: () => {} } as React.FormEvent);
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
    
    if (newValue !== query && querySource === 'trending') {
      setQuerySource('manual');
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setQuerySource('manual');
    setError(null);
    setIsTypingAnimation(false);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

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
      // Use the v14.3 narrative edge function
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-lattice-insights-narrative`;
      
      console.log(`TEST_DEBUG: Submitting ${queryType} query to v14.3 narrative edge function`);
      
      // Build request body with test parameters
      const requestBody: any = { 
        query: query,
        queryType: queryType
      };
      
      // Add test parameters if in test mode with service role
      const isServiceRole = session.access_token.includes(import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'service_role_key_not_set');
      
      if (testModeEnabled && isServiceRole) {
        requestBody.testTier = testTier;
        requestBody.allowSearchInTest = allowSearchInTest;
        console.log('TEST_DEBUG: Including test parameters:', { testTier, allowSearchInTest });
      }
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      setIsLoading(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: "An unexpected error occurred.", 
          details: response.statusText 
        }));
        
        if (response.status === 429 || errorData.error?.includes('limit reached')) {
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
        
        if (userTier === 'free' && !testModeEnabled) {
          setTimeout(() => calculateQueryLimits(), 100);
        }
        return;
      }

      const data: LatticeInsightNarrativeResponse = await response.json();

      // Enhanced debug logging
      console.log('TEST_DEBUG: Received from v14.3 narrative edge function:', {
        toolCount: data.recommendedTools?.length,
        tools: data.recommendedTools?.map(t => ({ name: t.name, isSurprise: t.isSurprise })),
        hasRelationships: !!data.relationshipsSummary,
        hasNarrative: !!data.narrativeAnalysis,
        isThreadedNarrative: data.narrativeAnalysis ? isThreadedNarrative(data.narrativeAnalysis) : false,
        threadCount: data.narrativeAnalysis && isThreadedNarrative(data.narrativeAnalysis) 
          ? (data.narrativeAnalysis as any).threads?.length 
          : 0,
        keyLessonsCount: data.keyLessons?.length,
        searchPerformed: data.metadata?.searchPerformed,
        searchConfidence: data.metadata?.searchConfidence,
        metadata: data.metadata
      });

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
        setQuerySource('manual');
        
        navigate('/dashboard-test/results', { 
          state: { 
            results: data, 
            query: query 
          } 
        });
        
        if (userTier === 'free' && !testModeEnabled) {
          setTimeout(() => calculateQueryLimits(), 100);
        }
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
    
    navigate('/dashboard-test');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative z-10 min-h-screen">
        <EmailVerificationBanner />
        
        {/* Custom header with integrated test controls */}
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                    Welcome back,
                  </span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                    {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Let's decode the patterns shaping your world
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Test Mode Controls - Compact Design */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                >
                  <span className="text-xs font-semibold text-purple-300 hidden sm:inline">🧪 Test</span>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowSearchInTest}
                        onChange={(e) => setAllowSearchInTest(e.target.checked)}
                        className="w-3 h-3 rounded text-purple-500 focus:ring-purple-500 focus:ring-1"
                      />
                      <span className="text-xs text-gray-300">Search</span>
                    </label>
                    
                    <div className="w-px h-4 bg-gray-600" />
                    
                    <select
                      value={testTier}
                      onChange={(e) => setTestTier(e.target.value as UserTier)}
                      className="text-xs bg-[#252525] text-gray-300 px-2 py-0.5 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                    
                    <div className="w-px h-4 bg-gray-600" />
                    
                    <button
                      onClick={() => setShowDebugInfo(!showDebugInfo)}
                      className="text-xs text-gray-400 hover:text-purple-300 transition-colors px-1"
                      title={showDebugInfo ? 'Hide Debug' : 'Show Debug'}
                    >
                      {showDebugInfo ? '🐛' : '👁️'}
                    </button>
                  </div>
                </motion.div>

                {/* History Button */}
                <Link to="/history">
                  <motion.button
                    className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[#252525]/50 backdrop-blur-sm border border-[#333333] rounded-lg hover:border-[#00FFFF]/30 hover:bg-[#252525]/80 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Clock className="h-5 w-5 text-gray-400 group-hover:text-[#00FFFF] transition-colors" />
                    <span className="hidden sm:inline text-sm font-medium text-gray-400 group-hover:text-[#00FFFF] transition-colors">
                      History
                    </span>
                  </motion.button>
                </Link>

                {/* Settings Button */}
                <Link to="/settings">
                  <motion.button
                    className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[#252525]/50 backdrop-blur-sm border border-[#333333] rounded-lg hover:border-[#00FFFF]/30 hover:bg-[#252525]/80 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="h-5 w-5 text-gray-400 group-hover:text-[#00FFFF] transition-colors" />
                    <span className="hidden sm:inline text-sm font-medium text-gray-400 group-hover:text-[#00FFFF] transition-colors">
                      Settings
                    </span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Tier Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 inline-flex items-center gap-2"
            >
              {testTier === 'premium' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8B5CF6]/20 to-[#8B5CF6]/10 backdrop-blur-sm border border-[#8B5CF6]/30 rounded-full">
                  <Crown size={16} className="text-[#8B5CF6]" />
                  <span className="text-sm font-medium text-[#8B5CF6]">Premium Member</span>
                  <span className="text-xs text-[#8B5CF6]/60">(Test Mode)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FFFF]/20 to-[#00FFFF]/10 backdrop-blur-sm border border-[#00FFFF]/30 rounded-full">
                  <Sparkles size={16} className="text-[#00FFFF]" />
                  <span className="text-sm font-medium text-[#00FFFF]">Free Tier</span>
                  <span className="text-xs text-[#00FFFF]/60">(Test Mode)</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

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
                <QuerySectionTest
                  query={query}
                  setQuery={setQuery}
                  error={error}
                  isLoading={isLoading}
                  isTypingAnimation={isTypingAnimation}
                  animatedPlaceholder={animatedPlaceholder}
                  trendingQuestions={trendingQuestions}
                  loadingTrending={loadingTrending}
                  displayTier={testModeEnabled ? testTier : userTier}
                  onSubmit={handleQuerySubmit}
                  onInputFocus={handleInputFocus}
                  onInputChange={handleInputChange}
                  onExampleClick={handleExampleClick}
                  onTrendingClick={handleTrendingClick}
                  shouldFocusAnalysis={shouldFocusAnalysis}
                  userId={user?.id}
                  limits={queryLimits}
                  showDebugInfo={showDebugInfo}
                  testModeEnabled={testModeEnabled}
                />
              )}

              {isLoading && <LoadingStateTest />}

              {isResultsPage && !isLoading && (
                <ResultsSectionWrapper
                  results={results}
                  query={query}
                  displayTier={testModeEnabled ? testTier : userTier}
                  onResetQuery={resetQuery}
                  showDebugInfo={showDebugInfo}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;