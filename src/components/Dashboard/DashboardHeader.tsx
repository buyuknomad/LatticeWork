// src/components/Dashboard/DashboardHeader.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Crown, Sparkles, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { UserTier } from './types';

interface DashboardHeaderProps {
  user: User | null;
  displayTier: UserTier;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  displayTier,
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
      </div>
    </div>
  );
};

export default DashboardHeader;