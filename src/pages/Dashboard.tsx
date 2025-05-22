// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
        {/* Header Section */}
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              {/* Welcome Message */}
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

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Dev Mode Toggle - Hidden on mobile */}
                <motion.button
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#252525]/50 backdrop-blur-sm border border-[#333333] rounded-lg text-xs text-gray-400 hover:text-gray-300 hover:border-[#444444] transition-all"
                  onClick={() => setShowTierToggle(!showTierToggle)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Info size={14} />
                  <span>Dev Mode</span>
                </motion.button>

                {/* Settings Button */}
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

            {/* Tier Display */}
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

            {/* Dev Tier Toggle Panel */}
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

        {/* Placeholder for Query Section and Results - We'll add this in the next step */}
        <div className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <p className="text-gray-500">Query interface will be added in the next step...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Background Animation Component
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
    
    // Create initial particles
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