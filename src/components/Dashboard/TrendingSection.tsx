// src/components/Dashboard/TrendingSection.tsx v2.2
// Updated to remove arrow and enhance hover states
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ChevronDown, Globe, Lock, Sparkles, Clock, Crown, Loader,
  MessageCircle, ArrowUp, Flame, Zap, AlertCircle, Users, Archive, ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingQuestion, UserTier, QueryLimits } from './types';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../stripe-config';

// Extended type for trending questions with new metadata
interface ExtendedTrendingQuestion extends TrendingQuestion {
  metadata?: {
    engagement?: number;
    score?: number;
    isHot?: boolean;
    recency?: 'now' | 'today' | 'yesterday' | 'recent';
    sourceType?: 'reddit' | 'hackernews' | 'news';
  };
}

interface TrendingSectionProps {
  trendingQuestions: ExtendedTrendingQuestion[];
  loadingTrending: boolean;
  displayTier: UserTier;
  onTrendingClick: (question: TrendingQuestion) => void;
  limits?: QueryLimits;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
  trendingQuestions,
  loadingTrending,
  displayTier,
  onTrendingClick,
  limits,
}) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  // Sort questions to show hot topics first
  const sortedQuestions = [...trendingQuestions].sort((a, b) => {
    const aIsHot = a.metadata?.isHot || (a.metadata?.engagement && a.metadata.engagement > 500);
    const bIsHot = b.metadata?.isHot || (b.metadata?.engagement && b.metadata.engagement > 500);
    
    if (aIsHot && !bIsHot) return -1;
    if (!aIsHot && bIsHot) return 1;
    
    // Secondary sort by engagement
    const aEngagement = a.metadata?.engagement || 0;
    const bEngagement = b.metadata?.engagement || 0;
    
    return bEngagement - aEngagement;
  });
  
  const questionsToShow = showAll ? sortedQuestions : sortedQuestions.slice(0, 6);

  const getCategoryColor = (category: string) => {
    const colors = {
      business: '#10B981',
      technology: '#8B5CF6',
      personal: '#F59E0B', 
      society: '#3B82F6',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'technology': return '💻';
      case 'business': return '💰';
      case 'personal': return '🧠';
      case 'society': return '🌍';
      default: return '🔍';
    }
  };

  const getSourceIcon = (source: string) => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('r/')) return '🔗';
    if (sourceLower.includes('hn') || sourceLower.includes('hacker')) return '🔶';
    if (sourceLower.includes('ask')) return '💭';
    return '📰';
  };

  const getRecencyBadge = (question: ExtendedTrendingQuestion) => {
    const metadata = question.metadata;
    if (!metadata) return null;

    // Check for viral content first
    if (metadata.engagement && metadata.engagement > 2000) {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full">
          <Zap className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-400 font-medium">Viral</span>
        </div>
      );
    }

    if (metadata.isHot || metadata.engagement > 500) {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full">
          <Flame className="w-3 h-3 text-orange-500" />
          <span className="text-xs text-orange-400 font-medium">Hot</span>
        </div>
      );
    }

    if (metadata.recency === 'now') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full">
          <Zap className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-400 font-medium">Breaking</span>
        </div>
      );
    }

    if (metadata.recency === 'today') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#00FFFF]/20 rounded-full">
          <Clock className="w-3 h-3 text-[#00FFFF]" />
          <span className="text-xs text-[#00FFFF] font-medium">Today</span>
        </div>
      );
    }

    return null;
  };

  // Helper function to format time until reset
  const formatTimeUntilReset = () => {
    if (!limits?.resetTime) return '';
    const now = new Date();
    const diff = limits.resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleUpgradeClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!session) {
      navigate('/signup?plan=premium');
      return;
    }

    setIsLoadingCheckout(true);
    setCheckoutError(null);

    try {
      const premiumProduct = products[0];
      
      if (!premiumProduct || !premiumProduct.priceId) {
        throw new Error('Premium product not configured');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: premiumProduct.priceId,
          mode: premiumProduct.mode,
          success_url: `${window.location.origin}/dashboard?upgrade=success`,
          cancel_url: `${window.location.origin}/dashboard`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Failed to start checkout. Please try again.');
      setIsLoadingCheckout(false);
    }
  };

  // Check if questions are locked (rate limit reached)
  const isLocked = displayTier === 'free' && limits && limits.trendingUsed >= 2;

  if (loadingTrending) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full"
      >
        <div className="bg-[#1F1F1F]/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#00FFFF]/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#00FFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">What's Trending Now</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time analysis of what people are talking about
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-[#252525]/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  if (trendingQuestions.length === 0) {
    return null;
  }

  // Count hot topics (handle missing metadata)
  const hotTopicsCount = trendingQuestions.filter(q => 
    q.metadata?.isHot || (q.metadata?.engagement && q.metadata.engagement > 500)
  ).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <div className="bg-[#1F1F1F]/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500/20 to-[#00FFFF]/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#00FFFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">What's Trending Now</h3>
                {hotTopicsCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-400 font-medium">{hotTopicsCount} hot</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time insights from Reddit, Hacker News & trending news
              </p>
            </div>
          </div>
          
          {sortedQuestions.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-[#00FFFF] hover:text-[#00FFFF]/80 flex items-center gap-1 transition-colors"
            >
              {showAll ? 'Show Less' : `View All (${sortedQuestions.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Checkout Error */}
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{checkoutError}</p>
            </div>
          </motion.div>
        )}

        {/* Quality messaging indicators for free users */}
        {displayTier === 'free' && limits && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex justify-center"
          >
            {limits.trendingUsed === 0 && (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>First trending analysis includes premium insights!</span>
                  <span className="text-xs text-[#00FFFF]/80">(3-4 models, 2-3 biases)</span>
                </div>
              </div>
            )}
            
            {limits.trendingUsed === 1 && (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium bg-[#252525]/50 text-gray-300 border border-[#333333]">
                <div className="flex items-center gap-2">
                  <span className="text-base">📊</span>
                  <span>1 basic trending analysis remaining today</span>
                </div>
              </div>
            )}
            
            {limits.trendingUsed >= 2 && (
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔒</span>
                  <span>Trending analysis limit reached</span>
                  {limits.resetTime && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Resets in {formatTimeUntilReset()}
                      </span>
                    </>
                  )}
                </div>
                
                <>
                  <div className="h-4 w-px bg-gray-600" />
                  <motion.button
                    type="button"
                    onClick={handleUpgradeClick}
                    disabled={isLoadingCheckout}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-full text-white text-xs font-medium hover:from-[#7C3AED] hover:to-[#8B5CF6] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isLoadingCheckout ? 1 : 1.05 }}
                    whileTap={{ scale: isLoadingCheckout ? 1 : 0.95 }}
                  >
                    {isLoadingCheckout ? (
                      <>
                        <Loader size={12} className="animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Crown size={12} />
                        <span>Upgrade</span>
                      </>
                    )}
                  </motion.button>
                </>
              </div>
            )}
          </motion.div>
        )}

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {questionsToShow.map((question, index) => {
              const isHot = question.metadata?.isHot || (question.metadata?.engagement && question.metadata.engagement > 500);
              const isViral = question.metadata?.engagement && question.metadata.engagement > 2000;
              
              return (
                <motion.button
                  key={question.id}
                  onClick={() => !isLocked && onTrendingClick(question)}
                  disabled={isLocked}
                  className={`group relative text-left p-4 rounded-xl transition-all duration-300 overflow-hidden flex flex-col ${
                    isLocked
                      ? 'bg-[#1A1A1A]/50 border border-[#333333]/50 opacity-60 cursor-not-allowed'
                      : isViral
                        ? 'bg-gradient-to-br from-orange-900/30 to-red-900/20 border-2 border-orange-400/50 hover:border-orange-400/70 shadow-lg shadow-orange-500/20'
                        : isHot
                          ? 'bg-gradient-to-br from-[#2A2A2A]/50 to-[#252525]/50 border border-orange-500/30 hover:border-orange-500/50'
                          : 'bg-[#252525]/50 hover:bg-[#252525]/80 border border-[#333333] hover:border-[#00FFFF]/30'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={!isLocked ? { scale: 1.02 } : {}}
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                >
                  {/* Top Row: Category and Recency */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(question.category)}</span>
                      <span className="text-xs text-gray-500 capitalize">{question.category}</span>
                    </div>
                    {getRecencyBadge(question)}
                  </div>

                  {/* Question Text */}
                  <p className={`text-sm transition-colors flex-1 mb-3 leading-relaxed ${
                    isLocked 
                      ? 'text-gray-500' 
                      : isViral
                        ? 'text-gray-100 group-hover:text-white font-semibold'
                        : isHot
                          ? 'text-gray-200 group-hover:text-white font-medium'
                          : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {question.question}
                  </p>

                  {/* Bottom Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <div className="flex items-center gap-2">
                      <span>{getSourceIcon(question.topic_source)}</span>
                      <span className="truncate max-w-[100px]" title={question.topic_source}>
                        {question.topic_source}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {question.metadata?.engagement !== undefined && question.metadata.engagement > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{formatNumber(question.metadata.engagement)}</span>
                        </div>
                      )}
                      {question.metadata?.score !== undefined && question.metadata.score > 0 && (
                        <div className="flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" />
                          <span>{formatNumber(question.metadata.score)}</span>
                        </div>
                      )}
                      {(question.click_count !== undefined && question.click_count > 0) && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{formatNumber(question.click_count)}</span>
                        </div>
                      )}
                      {/* Show a placeholder if no metadata */}
                      {(!question.metadata || Object.keys(question.metadata).length === 0) && (
                        <span className="text-gray-600 italic text-xs">No engagement data</span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced hover effect with glow */}
                  <motion.div
                    className={`absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none ${
                      isViral 
                        ? 'bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10' 
                        : isHot
                          ? 'bg-gradient-to-br from-orange-500/5 via-transparent to-transparent'
                          : 'bg-gradient-to-br from-[#00FFFF]/5 via-transparent to-transparent'
                    }`}
                  />

                  {/* Border glow on hover */}
                  {!isLocked && (
                    <motion.div
                      className={`absolute inset-0 rounded-xl pointer-events-none ${
                        isViral
                          ? 'shadow-[inset_0_0_20px_rgba(251,146,60,0.3)]'
                          : isHot
                            ? 'shadow-[inset_0_0_15px_rgba(251,146,60,0.2)]'
                            : 'shadow-[inset_0_0_15px_rgba(0,255,255,0.15)]'
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                  )}

                  {/* Viral pulse animation */}
                  {isViral && !isLocked && (
                    <motion.div
                      className="absolute -inset-[2px] bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl pointer-events-none"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  {/* Locked overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-[#1A1A1A]/50 flex items-center justify-center backdrop-blur-sm">
                      <Lock className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {displayTier === 'free' && limits ? (
              <>
                {limits.trendingUsed < 2 && (
                  <span className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    {2 - limits.trendingUsed} trending analyses remaining today
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-3 h-3 text-[#00FFFF]" />
                Click any trending topic for deep mental model analysis
              </span>
            )}
          </p>
          
          {/* Archive Link for All Users - Made More Prominent */}
          <div className="mt-6 pt-4 border-t border-[#333333]/30">
            <Link 
              to="/archive"
              className="block group"
            >
              <motion.div
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  displayTier === 'premium'
                    ? 'bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 border-[#8B5CF6]/30 hover:border-[#8B5CF6]/50'
                    : 'bg-gradient-to-r from-[#8B5CF6]/5 to-[#00FFFF]/5 border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 hover:from-[#8B5CF6]/10 hover:to-[#00FFFF]/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      displayTier === 'premium' 
                        ? 'bg-[#8B5CF6]/20' 
                        : 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#00FFFF]/20'
                    }`}>
                      <Archive className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          displayTier === 'premium' ? 'text-[#8B5CF6]' : 'text-white group-hover:text-[#8B5CF6]'
                        } transition-colors`}>
                          {displayTier === 'premium' 
                            ? 'Browse Trending Questions Archive'
                            : 'Unlock Trending Questions Archive'
                          }
                        </span>
                        {displayTier === 'free' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#8B5CF6]/20 rounded-full border border-[#8B5CF6]/30">
                            <Crown className="w-3 h-3 text-[#8B5CF6]" />
                            <span className="text-xs text-[#8B5CF6] font-medium">Premium</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {displayTier === 'premium' 
                          ? 'Full analysis with 3-4 mental models & cognitive biases'
                          : 'Access archived questions with complete premium analysis'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight className={`w-5 h-5 transition-all group-hover:translate-x-1 ${
                    displayTier === 'premium' ? 'text-[#8B5CF6]' : 'text-gray-400 group-hover:text-[#8B5CF6]'
                  }`} />
                </div>
                
                {/* Glow effect for free users */}
                {displayTier === 'free' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-[#00FFFF]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    animate={{
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TrendingSection;