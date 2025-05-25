// src/components/Dashboard/ExamplesSection.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';

interface ExamplesSectionProps {
  onExampleClick: (example: string) => void;
}

const EXAMPLE_PATTERNS = [
  {
    title: "Procrastination patterns",
    query: "Why do I procrastinate even when I know the consequences?",
  },
  {
    title: "Team dynamics",
    query: "Why do teams fall into predictable conflict patterns?",
  },
  {
    title: "Investment psychology", 
    query: "How do successful investors think differently about risk?",
  },
  {
    title: "Decision paralysis",
    query: "What causes analysis paralysis when making important decisions?",
  },
  {
    title: "Habit formation",
    query: "Why do some habits stick while others fail?",
  },
  {
    title: "Creative blocks",
    query: "What mental patterns lead to creative breakthroughs?",
  },
];

const ExamplesSection: React.FC<ExamplesSectionProps> = ({ onExampleClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Show fewer examples on mobile by default
  const visibleExamples = isExpanded ? EXAMPLE_PATTERNS : EXAMPLE_PATTERNS.slice(0, isMobile ? 3 : 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="px-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Common Patterns to Explore</span>
          </div>
          
          {EXAMPLE_PATTERNS.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors md:hidden"
            >
              {isExpanded ? 'Show less' : 'Show more'}
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {visibleExamples.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => onExampleClick(example.query)}
              className="group inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#252525]/50 rounded-lg transition-all duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-[#00FFFF] transition-colors" />
              <span>{example.title}</span>
            </motion.button>
          ))}
          
          {/* Desktop show more */}
          {!isExpanded && EXAMPLE_PATTERNS.length > 4 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span>+{EXAMPLE_PATTERNS.length - 4} more</span>
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default ExamplesSection;