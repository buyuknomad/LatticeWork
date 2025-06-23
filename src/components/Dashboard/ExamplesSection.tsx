// src/components/Dashboard/ExamplesSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';

interface ExamplesSectionProps {
  onExampleClick: (example: string) => void;
}

const EXAMPLE_PATTERNS = [
  {
    title: "Procrastination & Productivity",
    query: "Why do I procrastinate even when I know the consequences?",
    category: "personal",
  },
  {
    title: "Team Dynamics",
    query: "Why do teams fall into predictable conflict patterns?",
    category: "business",
  },
  {
    title: "Investment Psychology", 
    query: "How do successful investors think differently about risk?",
    category: "business",
  },
  {
    title: "Decision Paralysis",
    query: "What causes analysis paralysis when making important decisions?",
    category: "personal",
  },
  {
    title: "Habit Formation",
    query: "Why do some habits stick while others fail?",
    category: "personal",
  },
  {
    title: "Creative Blocks",
    query: "What mental patterns lead to creative breakthroughs?",
    category: "personal",
  },
];

const ExamplesSection: React.FC<ExamplesSectionProps> = ({ onExampleClick }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleExamples = showAll ? EXAMPLE_PATTERNS : EXAMPLE_PATTERNS.slice(0, 6);

  const getCategoryColor = (category: string) => {
    const colors = {
      business: '#10B981',
      personal: '#F59E0B',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="bg-gradient-to-br from-[#252525]/80 to-[#1F1F1F]/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/40 hover:border-[#333333]/60 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#333333]/60 to-[#333333]/40 rounded-lg">
              <Lightbulb className="h-5 w-5 text-[#00FFFF]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Examples</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Common situations to explore
              </p>
            </div>
          </div>
          
          {EXAMPLE_PATTERNS.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              {showAll ? 'Show Less' : `View All (${EXAMPLE_PATTERNS.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {visibleExamples.map((example, index) => (
              <motion.button
                key={index}
                onClick={() => onExampleClick(example.query)}
                className="group relative text-left p-4 bg-[#2A2A2A]/50 hover:bg-[#2A2A2A]/80 border border-[#444444]/40 hover:border-[#00FFFF]/30 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00FFFF]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Category Dot */}
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(example.category) }}
                  />
                  <span className="text-xs text-gray-400 capitalize">{example.category}</span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors mb-1">
                  {example.title}
                </h4>

                {/* Query Preview */}
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-2">
                  {example.query}
                </p>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00FFFF]/0 to-[#00FFFF]/0 group-hover:from-[#00FFFF]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default ExamplesSection;