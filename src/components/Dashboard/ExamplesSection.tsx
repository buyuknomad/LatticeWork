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
      <div className="bg-[#1A1A1A]/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[#333333]/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#333333]/50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Pattern Examples</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Common situations to explore
              </p>
            </div>
          </div>
          
          {EXAMPLE_PATTERNS.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1 transition-colors"
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
                className="group relative text-left p-4 bg-[#1F1F1F]/30 hover:bg-[#1F1F1F]/50 border border-[#333333]/30 hover:border-[#444444] rounded-lg transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Category Dot */}
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full opacity-60"
                    style={{ backgroundColor: getCategoryColor(example.category) }}
                  />
                  <span className="text-xs text-gray-600 capitalize">{example.category}</span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors mb-1">
                  {example.title}
                </h4>

                {/* Query Preview */}
                <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-2">
                  {example.query}
                </p>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default ExamplesSection;