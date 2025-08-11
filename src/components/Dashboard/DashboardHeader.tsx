// src/components/Dashboard/DashboardHeader.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Crown, Sparkles, Archive, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { UserTier } from './types';

// ADD TRENDING WIDGET IMPORT
import { TrendingModels } from '../Analytics/TrendingModels';

interface DashboardHeaderProps {
  user: User | null;
  displayTier: UserTier;
  showTrending?: boolean; // Optional prop to control trending display
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  displayTier,
  showTrending = true, // Default to showing trending
}) => {
  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.user_metadata?.username) return user.user_metadata.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Header Section */}
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
              Let's decode the patterns shaping your world
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Archive Link - Premium Only */}
            {displayTier === 'premium' && (
              <Link to="/archive">
                <motion.button
                  className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6]/20 to-[#8B5CF6]/10 backdrop-blur-sm border border-[#8B5CF6]/30 rounded-lg hover:border-[#8B5CF6]/50 hover:from-[#8B5CF6]/30 hover:to-[#8B5CF6]/20 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Archive className="h-5 w-5 text-[#8B5CF6] transition-colors" />
                  <span className="hidden sm:inline text-sm font-medium text-[#8B5CF6] transition-colors">
                    Archive
                  </span>
                </motion.button>
              </Link>
            )}

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

        {/* ADD TRENDING MODELS SECTION */}
        {showTrending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main content area - takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              {/* Quick Stats or Welcome Message */}
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333333]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00FFFF]" />
                  Your Learning Journey
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <motion.div 
                    className="bg-[#252525] rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400">Models Explored</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-[#252525] rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400">Questions Asked</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-[#252525] rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400">Insights Gained</p>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/mental-models">
                    <motion.button
                      className="px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 transition-colors font-medium text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore Mental Models
                    </motion.button>
                  </Link>
                  
                  <Link to="/mental-models-guide">
                    <motion.button
                      className="px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors border border-[#333333] font-medium text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Read the Guide
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Trending Widget - takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <TrendingModels 
                limit={5} 
                variant="compact" 
                showStats={true}
                refreshInterval={60000}
              />
            </div>
          </motion.div>
        )}

        {/* Alternative layout for mobile - Trending below stats */}
        {showTrending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 lg:hidden"
          >
            <TrendingModels 
              limit={5} 
              variant="compact" 
              showStats={true}
              refreshInterval={60000}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;