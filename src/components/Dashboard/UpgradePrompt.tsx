// src/components/Dashboard/UpgradePrompt.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Brain, Layers, Zap, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../stripe-config';

const UpgradePrompt: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleUpgradeClick = async () => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden"
    >
      {/* Main container with glassmorphism effect */}
      <div className="relative bg-gradient-to-r from-[#1A1A1A]/90 via-[#252525]/90 to-[#1A1A1A]/90 backdrop-blur-xl rounded-2xl p-8 md:p-10 border border-[#333333]/50">
        
        {/* Error Message */}
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{checkoutError}</p>
            </div>
          </motion.div>
        )}
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {/* Gradient orbs */}
          <motion.div 
            className="absolute -top-24 -right-24 w-64 h-64 bg-[#8B5CF6]/20 rounded-full filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#00FFFF]/20 rounded-full filter blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#8B5CF6]/50 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: 100 + '%'
              }}
              animate={{
                y: -20 + '%',
                x: Math.random() * 100 + '%',
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 2
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Icon Section */}
            <motion.div 
              className="relative"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative p-5 bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/10 rounded-2xl">
                <Crown className="h-14 w-14 text-[#8B5CF6]" />
                
                {/* Sparkles around crown */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5
                  }}
                >
                  <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-1"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1.5
                  }}
                >
                  <Sparkles className="h-3 w-3 text-[#00FFFF]" />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Text Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8B5CF6] to-[#00FFFF]">
                  Unlock Deeper Pattern Analysis
                </span>
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Discover 3-4 mental models, 2-3 biases per pattern, see how they interconnect, and gain deeper understanding with Premium.
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-[#333333]/50 backdrop-blur-sm rounded-full border border-[#444444]/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                >
                  <Brain className="h-4 w-4 text-[#8B5CF6]" />
                  <span className="text-xs text-gray-300">3-4 Mental Models</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-[#333333]/50 backdrop-blur-sm rounded-full border border-[#444444]/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.3)' }}
                >
                  <Layers className="h-4 w-4 text-[#00FFFF]" />
                  <span className="text-xs text-gray-300">Pattern Connections</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-[#333333]/50 backdrop-blur-sm rounded-full border border-[#444444]/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(245, 158, 11, 0.3)' }}
                >
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-gray-300">Unlimited Analysis</span>
                </motion.div>
              </div>
            </div>
            
            {/* CTA Button */}
            <motion.button
              onClick={handleUpgradeClick}
              disabled={isLoadingCheckout}
              className="relative group w-full md:w-auto px-8 py-4 overflow-hidden rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoadingCheckout ? 1 : 1.05 }}
              whileTap={{ scale: isLoadingCheckout ? 1 : 0.95 }}
            >
              {/* Button gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] transition-all duration-300 group-hover:from-[#7C3AED] group-hover:to-[#8B5CF6]"></div>
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              >
                <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              </motion.div>
              
              {/* Button content */}
              <span className="relative flex items-center justify-center gap-2 text-white">
                {isLoadingCheckout ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade to Premium
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </div>
          
          {/* Bottom accent line */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default UpgradePrompt;