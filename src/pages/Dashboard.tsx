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
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
      {/* Background Animation Layer */}
      <DashboardBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header Section - Keep the same as before */}
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
            </AnimatePresence>

            {/* Results will be added in the next step */}
            {results && !isLoading && (
              <div className="text-center py-20">
                <p className="text-gray-500">Results section will be added in the next step...</p>
                <button onClick={resetQuery} className="mt-4 text-[#00FFFF] hover:underline">
                  New Query
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep the same DashboardBackground component from before
const DashboardBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '#00FFFF' : '#8B5CF6'
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(26, 26, 26, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default Dashboard;