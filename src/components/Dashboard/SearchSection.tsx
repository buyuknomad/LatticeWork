// src/components/Dashboard/SearchSection.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight, AlertCircle, Clock, Crown, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserTier } from './types';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../stripe-config';

interface SearchSectionProps {
  query: string;
  error: string | null;
  isLoading: boolean;
  isTypingAnimation: boolean;
  animatedPlaceholder: string;
  displayTier: UserTier;
  remainingQueries?: number;
  queryResetTime?: Date;
  onSubmit: (e: React.FormEvent) => void;
  onInputFocus: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearQuery: () => void;
  shouldFocusAnalysis: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  query,
  error,
  isLoading,
  isTypingAnimation,
  animatedPlaceholder,
  displayTier,
  remainingQueries,
  queryResetTime,
  onSubmit,
  onInputFocus,
  onInputChange,
  onClearQuery,
  shouldFocusAnalysis,
}) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const isRateLimitError = error?.includes('Query limit reached');

  const formatTimeUntilReset = () => {
    if (!queryResetTime) return '';
    const now = new Date();
    const diff = queryResetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-[#333333]/50">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
            What pattern are you trying to understand?
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Describe a situation, behavior, or decision you want to analyze
          </p>
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

        {/* Query Limit Indicator for Free Users */}
        {displayTier === 'free' && remainingQueries !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex justify-center"
          >
            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${
              remainingQueries > 0 
                ? 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span>
                  {remainingQueries > 0 
                    ? `${remainingQueries} analysis left today`
                    : 'Daily limit reached'
                  }
                </span>
                {queryResetTime && remainingQueries === 0 && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Resets in {formatTimeUntilReset()}
                    </span>
                  </>
                )}
              </div>
              
              {/* Fixed Upgrade Button - Only show when limit is reached */}
              {remainingQueries === 0 && (
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
              )}
            </div>
          </motion.div>
        )}

        {/* Search Input */}
        <form onSubmit={onSubmit}>
          <div className="relative group">
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
            
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-500 h-5 w-5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={onInputChange}
                onFocus={onInputFocus}
                placeholder={isTypingAnimation ? '' : "Describe what you're observing or experiencing..."}
                className="w-full bg-[#1A1A1A]/90 text-white pl-12 pr-12 py-4 rounded-xl border border-[#444444] focus:border-[#00FFFF]/50 focus:outline-none transition-all duration-300 text-base"
                autoFocus={shouldFocusAnalysis}
                disabled={displayTier === 'free' && remainingQueries === 0}
              />
              {query && (
                <button
                  type="button"
                  onClick={onClearQuery}
                  className="absolute right-14 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                disabled={!query.trim() || isLoading || (displayTier === 'free' && remainingQueries === 0)}
                className={`absolute right-3 p-2 rounded-lg transition-all ${
                  query.trim() && (displayTier === 'premium' || remainingQueries! > 0)
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
            className="mt-4"
          >
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm">{error}</p>
                  {isRateLimitError && (
                    <motion.button
                      type="button"
                      onClick={handleUpgradeClick}
                      disabled={isLoadingCheckout}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-lg text-white text-sm font-medium hover:from-[#7C3AED] hover:to-[#8B5CF6] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: isLoadingCheckout ? 1 : 1.02 }}
                      whileTap={{ scale: isLoadingCheckout ? 1 : 0.98 }}
                    >
                      {isLoadingCheckout ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Upgrade to Premium
                          <ArrowRight size={14} />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default SearchSection;  