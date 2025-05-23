// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Search,
  Zap,
  Crown,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  X,
  Info,
  ChevronDown,
  AlertCircle,
  Sparkles,
  Brain,
  Eye,
  ChevronUp,
  ExternalLink,
  Layers,
  Clock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BackgroundAnimation from '../components/BackgroundAnimation';

// --- Type Definitions ---
interface RecommendedTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string;
}

interface LatticeInsightResponse {
  recommendedTools: RecommendedTool[];
  relationshipsSummary?: string;
  error?: string;
  message?: string;
  query_id?: string;
}

// Example queries for animation
const EXAMPLE_QUERIES = [
  "How do I overcome procrastination?",
  "Why do I keep making the same mistakes?",
  "How can I make better investment decisions?",
  "What causes team conflicts?",
  "How to avoid confirmation bias in research?",
  "Why do projects always take longer than expected?"
];

const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const location = useLocation();

  const [actualUserTier, setActualUserTier] = useState<'free' | 'premium'>('free');
  const [devTestTier, setDevTestTier] = useState<'free' | 'premium'>('free');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LatticeInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTierToggle, setShowTierToggle] = useState(false);
  
  // Animation states
  const [isTypingAnimation, setIsTypingAnimation] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const shouldFocusAnalysis = new URLSearchParams(location.search).get('action') === 'analyze';

  useEffect(() => {
    if (user?.user_metadata?.tier) {
      const tier = user.user_metadata.tier as 'free' | 'premium';
      setActualUserTier(tier);
      setDevTestTier(tier);
    }
  }, [user]);

  const displayTier = showTierToggle ? devTestTier : actualUserTier;

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.user_metadata?.username) return user.user_metadata.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  // Check for query parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get('q');
    const actionParam = urlParams.get('action');
    
    if (queryParam && !results && !isLoading) {
      // Set the query from URL parameter
      const decodedQuery = decodeURIComponent(queryParam);
      setQuery(decodedQuery);
      setIsTypingAnimation(false);
      
      // Auto-submit the query after a brief delay to ensure everything is loaded
      setTimeout(() => {
        // Create a synthetic form event to trigger the submit
        const form = document.createElement('form');
        const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true });
        Object.defineProperty(syntheticEvent, 'preventDefault', {
          value: () => {},
          writable: true
        });
        handleQuerySubmit(syntheticEvent as any);
      }, 500);
    } else if (actionParam === 'analyze') {
      // Just focus the input if action=analyze without a query
      // This is handled by the autoFocus prop
    }
  }, [location.search]); // Only run when location.search changes

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

  const toggleCardExpansion = (toolId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedCards(newExpanded);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    // Clear the query parameter from URL to prevent re-submission on page refresh
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);

    setIsLoading(true);
    setResults(null);
    setError(null);
    setExpandedCards(new Set());

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
    setExpandedCards(new Set());
  };

  const toggleDevTier = () => {
    setDevTestTier(prev => prev === 'free' ? 'premium' : 'free');
  };

  const renderToolCard = (tool: RecommendedTool, index: number) => {
    const isMentalModel = tool.type === 'mental_model';
    const isExpanded = expandedCards.has(tool.id);
    
    return (
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="group"
      >
        <div
          className={`relative bg-[#252525]/80 backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-hidden ${
            isMentalModel 
              ? 'border-[#00FFFF]/20 hover:border-[#00FFFF]/40 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]' 
              : 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
          }`}
        >
          {/* Card Glow Effect */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isMentalModel 
              ? 'bg-gradient-to-br from-[#00FFFF]/5 via-transparent to-[#00FFFF]/5' 
              : 'bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5'
          }`}></div>

          {/* Card Content */}
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isMentalModel ? (
                    <div className="p-2 bg-[#00FFFF]/10 rounded-lg">
                      <Brain className="h-5 w-5 text-[#00FFFF]" />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isMentalModel 
                      ? 'bg-[#00FFFF]/10 text-[#00FFFF]' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {tool.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isMentalModel ? 'Mental Model' : 'Cognitive Bias'}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {tool.summary}
            </p>

            {/* Explanation Section */}
            <div className="border-t border-[#333333] pt-4">
              <button
                onClick={() => toggleCardExpansion(tool.id)}
                className={`w-full flex items-center justify-between p-3 -m-3 rounded-lg transition-colors ${
                  isMentalModel 
                    ? 'hover:bg-[#00FFFF]/5' 
                    : 'hover:bg-amber-500/5'
                }`}
              >
                <span className={`text-sm font-medium flex items-center gap-2 ${
                  isMentalModel ? 'text-[#00FFFF]' : 'text-amber-500'
                }`}>
                  <Eye size={16} />
                  How this applies to your situation
                </span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-1">
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {tool.explanation || "No specific explanation provided."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Learn More Button */}
            <div className="mt-4 flex justify-end">
              <button className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all ${
                isMentalModel 
                  ? 'text-[#00FFFF] hover:bg-[#00FFFF]/10' 
                  : 'text-amber-500 hover:bg-amber-500/10'
              }`}>
                Learn More
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      {/* Background Animation Layer */}
      <BackgroundAnimation />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header Section */}
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
                    {getDisplayName()}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Let's explore your thinking patterns today
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* History Button */}
                <Link to="/history">
                  <motion.button
                    className="p-2.5 bg-[#252525]/50 backdrop-blur-sm border border-[#333333] rounded-lg hover:border-[#00FFFF]/30 transition-all group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Clock className="h-5 w-5 text-gray-400 group-hover:text-[#00FFFF] transition-colors" />
                  </motion.button>
                </Link>

                <motion.button
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#252525]/50 backdrop-blur-sm border border-[#333333] rounded-lg text-xs text-gray-400 hover:text-gray-300 hover:border-[#444444] transition-all"
                  onClick={() => setShowTierToggle(!showTierToggle)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Info size={14} />
                  <span>Dev Mode</span>
                </motion.button>

                <Link to="/settings">
                  <motion.button
                    className="p-2.5 bg-[#252525]/50 backdrop-blur-sm border border-[#333333] rounded-lg hover:border-[#00FFFF]/30 transition-all group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="h-5 w-5 text-gray-400 group-hover:text-[#00FFFF] transition-colors" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 inline-flex items-center gap-2"
            >
              {displayTier === 'premium' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8B5CF6]/20 to-[#8B5CF6]/10 backdrop-blur-sm border border-[#8B5CF6]/30 rounded-full">
                  <Crown size={16} className="text-[#8B5CF6]" />
                  <span className="text-sm font-medium text-[#8B5CF6]">Premium Member</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FFFF]/20 to-[#00FFFF]/10 backdrop-blur-sm border border-[#00FFFF]/30 rounded-full">
                  <Sparkles size={16} className="text-[#00FFFF]" />
                  <span className="text-sm font-medium text-[#00FFFF]">Free Tier</span>
                </div>
              )}
            </motion.div>

            {showTierToggle && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 p-4 bg-[#252525]/80 backdrop-blur-sm border border-[#333333] rounded-lg"
              >
                <p className="text-sm text-gray-400 mb-3">Developer Mode: Test different tier experiences</p>
                <div className="flex gap-2">
                  <button
                    onClick={toggleDevTier}
                    disabled={devTestTier === 'free'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      devTestTier === 'free'
                        ? 'bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/50'
                        : 'bg-[#252525] text-gray-400 border border-[#333333] hover:border-[#444444]'
                    }`}
                  >
                    Free Tier
                  </button>
                  <button
                    onClick={toggleDevTier}
                    disabled={devTestTier === 'premium'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      devTestTier === 'premium'
                        ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/50'
                        : 'bg-[#252525] text-gray-400 border border-[#333333] hover:border-[#444444]'
                    }`}
                  >
                    Premium Tier
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Query Section */}
        <div className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {!results && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-3xl mx-auto"
                >
                  {/* Main Query Card */}
                  <div className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#333333] relative overflow-hidden">
                    {/* Glowing corner accents */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#00FFFF]/10 to-transparent rounded-tl-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#8B5CF6]/10 to-transparent rounded-br-2xl pointer-events-none"></div>
                    
                    <div className="relative">
                      <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                        What's on your mind?
                      </h2>
                      <p className="text-gray-400 text-sm sm:text-base mb-6">
                        Describe a situation, decision, or challenge you're facing
                      </p>

                      {/* Search Input */}
                      <form onSubmit={handleQuerySubmit}>
                        <div className="relative group">
                          {/* Glowing border effect */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
                          
                          <div className="relative flex items-center">
                            <Search className="absolute left-4 text-gray-500 h-5 w-5 pointer-events-none" />
                            <input
                              type="text"
                              value={query}
                              onChange={handleInputChange}
                              onFocus={handleInputFocus}
                              placeholder={isTypingAnimation ? '' : "Ask me anything..."}
                              className="w-full bg-[#1A1A1A]/80 text-white pl-12 pr-12 py-4 rounded-xl border border-[#444444] focus:border-[#00FFFF]/50 focus:outline-none transition-all duration-300"
                              autoFocus={shouldFocusAnalysis}
                            />
                            {query && (
                              <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-12 text-gray-500 hover:text-gray-300 transition-colors"
                              >
                                <X size={18} />
                              </button>
                            )}
                            <button
                              type="submit"
                              disabled={!query.trim() || isLoading}
                              className={`absolute right-3 p-1.5 rounded-lg transition-all ${
                                query.trim() 
                                  ? 'text-[#00FFFF] hover:bg-[#00FFFF]/10' 
                                  : 'text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              <ArrowRight size={20} />
                            </button>
                          </div>

                          {/* Animated placeholder */}
                          {isTypingAnimation && !query && (
                            <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="text-gray-500">{animatedPlaceholder}</span>
                              <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse"></span>
                            </div>
                          )}
                        </div>
                      </form>

                      {/* Error Message */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-red-400 text-sm">{error}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Example Queries */}
                      <div className="mt-8">
                        <p className="text-sm text-gray-400 mb-3">Try asking about:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {EXAMPLE_QUERIES.slice(0, 4).map((example, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleExampleClick(example)}
                              className="text-left px-4 py-3 bg-[#1A1A1A]/50 hover:bg-[#1A1A1A]/80 border border-[#333333] hover:border-[#00FFFF]/30 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="line-clamp-1">{example}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-3xl mx-auto text-center py-20"
                >
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 rounded-full border-t-2 border-b-2 border-[#00FFFF] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#252525]"></div>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-400">Analyzing your query with Cosmic Lattice...</p>
                  <p className="mt-2 text-sm text-gray-500">This might take a moment</p>
                </motion.div>
              )}

              {/* Results Section */}
              {results && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Results Header */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                          Lattice Insights
                        </span>
                      </h2>
                      <p className="text-gray-400 text-sm sm:text-base mb-6">
                        For: "{query}"
                      </p>
                      
                      {/* Enhanced New Query Button */}
                      <motion.div className="inline-block relative group">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-lg blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                        
                        {/* Button */}
                        <motion.button
                          onClick={resetQuery}
                          className="relative inline-flex items-center gap-3 px-6 py-3 bg-[#252525] border border-[#00FFFF]/30 rounded-lg font-medium transition-all duration-300 hover:border-[#00FFFF]/50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Search className="w-5 h-5 text-[#00FFFF] relative z-10" />
                          <span className="text-white relative z-10">New Query</span>
                          <ArrowRight className="w-4 h-4 text-[#00FFFF] relative z-10" />
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Tools Grid */}
                  {results.recommendedTools && results.recommendedTools.length > 0 ? (
                    <div>
                      {/* Mental Models Section */}
                      {results.recommendedTools.filter(t => t.type === 'mental_model').length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Brain className="h-5 w-5 text-[#00FFFF]" />
                            Mental Models to Apply
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.recommendedTools
                              .filter(tool => tool.type === 'mental_model')
                              .map((tool, index) => renderToolCard(tool, index))}
                          </div>
                        </div>
                      )}

                      {/* Cognitive Biases Section */}
                      {results.recommendedTools.filter(t => t.type === 'cognitive_bias').length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Cognitive Biases to Watch For
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.recommendedTools
                              .filter(tool => tool.type === 'cognitive_bias')
                              .map((tool, index) => renderToolCard(tool, index))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No specific tools found for this query. Try rephrasing your question.</p>
                    </div>
                  )}

                  {/* Relationships Summary - Premium Feature */}
                  {displayTier === 'premium' && results.relationshipsSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 backdrop-blur-sm rounded-xl p-6 border border-[#8B5CF6]/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#8B5CF6]/20 rounded-lg">
                          <Layers className="h-5 w-5 text-[#8B5CF6]" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          How These Connect
                        </h3>
                        <span className="ml-auto text-xs px-2 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full">
                          Premium Insight
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {results.relationshipsSummary}
                      </p>
                    </motion.div>
                  )}

                  {/* Premium Upgrade Prompt - Free Users */}
                  {displayTier === 'free' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-gradient-to-r from-[#252525] to-[#2A2A2A] rounded-xl p-8 border border-[#333333] relative overflow-hidden"
                    >
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full filter blur-3xl"></div>
                      
                      <div className="relative flex flex-col md:flex-row items-center gap-6">
                        <div className="p-4 bg-[#8B5CF6]/10 rounded-full">
                          <Crown className="h-12 w-12 text-[#8B5CF6]" />
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-2xl font-bold mb-3">
                            Unlock Deeper Insights
                          </h3>
                          <p className="text-gray-300 mb-4">
                            Get 3-4 mental models, 2-3 biases per query, relationship analysis, and interactive visualizations with Premium.
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="text-xs px-3 py-1 bg-[#333333] rounded-full text-gray-300">
                              Unlimited Queries
                            </span>
                            <span className="text-xs px-3 py-1 bg-[#333333] rounded-full text-gray-300">
                              300+ Mental Models
                            </span>
                            <span className="text-xs px-3 py-1 bg-[#333333] rounded-full text-gray-300">
                              246 Cognitive Biases
                            </span>
                          </div>
                        </div>
                        
                        <Link to="/pricing">
                          <motion.button
                            className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Upgrade Now
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;