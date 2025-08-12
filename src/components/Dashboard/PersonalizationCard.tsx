// src/components/Dashboard/PersonalizationCard.tsx
// Add this component to your Dashboard page to promote the new personalization features

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PersonalizationCardProps {
  className?: string;
}

const PersonalizationCard: React.FC<PersonalizationCardProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`bg-gradient-to-br from-[#252525] to-[#1A1A1A] rounded-lg p-6 border border-[#00FFFF]/20 relative overflow-hidden ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8B5CF6] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#00FFFF] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#00FFFF]/20 to-[#8B5CF6]/20 rounded-lg">
              <Brain className="w-6 h-6 text-[#00FFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Your Personalized Learning Journey
                <span className="px-2 py-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#00FFFF] text-white text-xs font-bold rounded-full animate-pulse">
                  NEW
                </span>
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                AI-powered recommendations based on your learning patterns
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#FFB84D]" />
              <span className="text-xs text-gray-400">Smart Recommendations</span>
            </div>
            <p className="text-sm text-white">Personalized model suggestions</p>
          </div>
          
          <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs text-gray-400">Learning Paths</span>
            </div>
            <p className="text-sm text-white">Curated progression tracks</p>
          </div>
          
          <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-xs text-gray-400">Achievements</span>
            </div>
            <p className="text-sm text-white">Track your progress & unlock badges</p>
          </div>
        </div>

        <motion.button
          onClick={() => navigate('/personalized')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#00FFFF]/20 transition-all"
        >
          <span>Explore My Learning Journey</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PersonalizationCard;

// ===== HOW TO USE THIS COMPONENT =====
// Add this component to your Dashboard.tsx page, preferably near the top after the header
// or in the user stats section. Here's an example of how to integrate it:

/*
// In src/pages/Dashboard.tsx, add this import at the top:
import PersonalizationCard from '../components/Dashboard/PersonalizationCard';

// Then add the component in your JSX, for example after the UserStats component:
<div className="container mx-auto px-4 md:px-8 py-8">
  {user && (
    <>
      <UserStats 
        modelsExplored={learningStats.modelsExplored}
        totalViews={learningStats.totalViews}
        favoriteCategory={learningStats.favoriteCategory}
        totalDuration={learningStats.totalDuration}
        lastViewed={learningStats.lastViewed}
        isLoading={statsLoading}
        onRefresh={fetchLearningStats}
      />
      
      {/* Add the Personalization Card here */}
      <PersonalizationCard className="mt-6" />
      
      {/* Rest of your dashboard content */}
    </>
  )}
</div>
*/