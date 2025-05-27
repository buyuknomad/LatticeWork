// src/components/InteractiveDemo.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertTriangle, Lightbulb, Zap } from 'lucide-react';

interface InteractiveDemoProps {
  isTyping: boolean;
  category: 'business' | 'personal' | 'analysis' | 'default';
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ isTyping, category }) => {
  const getVisualization = () => {
    switch (category) {
      case 'business':
        return {
          models: ['First Principles', 'SWOT Analysis', 'Porter\'s Five Forces'],
          biases: ['Sunk Cost Fallacy', 'Confirmation Bias'],
          icon: <Zap className="h-6 w-6" />,
          color: 'from-purple-500 to-pink-500'
        };
      case 'personal':
        return {
          models: ['Eisenhower Matrix', 'Pareto Principle', 'Habit Loop'],
          biases: ['Present Bias', 'Planning Fallacy'],
          icon: <Brain className="h-6 w-6" />,
          color: 'from-blue-500 to-cyan-500'
        };
      case 'analysis':
        return {
          models: ['Systems Thinking', 'Occam\'s Razor', 'Inversion'],
          biases: ['Anchoring Bias', 'Availability Heuristic'],
          icon: <Lightbulb className="h-6 w-6" />,
          color: 'from-green-500 to-emerald-500'
        };
      default:
        return {
          models: ['Mental Model 1', 'Mental Model 2', 'Mental Model 3'],
          biases: ['Cognitive Bias 1', 'Cognitive Bias 2'],
          icon: <Brain className="h-6 w-6" />,
          color: 'from-[#00FFFF] to-[#8B5CF6]'
        };
    }
  };

  const visualization = getVisualization();

  return (
    <div className="relative h-48 md:h-56 rounded-lg bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#333333] overflow-hidden">
      <AnimatePresence mode="wait">
        {!isTyping ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-full"
          >
            <p className="text-gray-500 text-sm">Your pattern analysis will appear here...</p>
          </motion.div>
        ) : (
          <motion.div
            key="visualization"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="p-6 h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${visualization.color} opacity-20`}>
                  {visualization.icon}
                </div>
                <h4 className="text-white font-semibold">Pattern Analysis</h4>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-[#00FFFF] border-t-transparent rounded-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mental Models */}
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <Brain className="h-3 w-3" /> Mental Models
                </p>
                <div className="space-y-1">
                  {visualization.models.map((model, index) => (
                    <motion.div
                      key={model}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-xs text-[#00FFFF] bg-[#00FFFF]/10 px-2 py-1 rounded-md inline-block mr-2 mb-1"
                    >
                      {model}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cognitive Biases */}
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Cognitive Biases
                </p>
                <div className="space-y-1">
                  {visualization.biases.map((bias, index) => (
                    <motion.div
                      key={bias}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md inline-block mr-2 mb-1"
                    >
                      {bias}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveDemo;