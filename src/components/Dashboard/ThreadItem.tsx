// src/components/Dashboard/ThreadItem.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  Link2, 
  Target, 
  Sparkles,
  Zap
} from 'lucide-react';
import { NarrativeThread } from './types';

interface ThreadItemProps {
  thread: NarrativeThread;
  index: number;
  totalThreads: number;
  onToolClick?: (toolName: string) => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ 
  thread, 
  index, 
  totalThreads,
  onToolClick 
}) => {
  // Get styling based on thread type
  const getThreadStyles = () => {
    const styles = {
      opening: {
        borderColor: 'border-gray-500',
        bgGradient: 'from-gray-500/10 to-gray-500/5',
        iconBg: 'bg-gray-500/20',
        textColor: 'text-gray-400',
        icon: Target,
        label: 'Setting the Scene'
      },
      pattern: {
        borderColor: 'border-purple-500',
        bgGradient: 'from-purple-500/10 to-purple-500/5',
        iconBg: 'bg-purple-500/20',
        textColor: 'text-purple-400',
        icon: Brain,
        label: 'Mental Model'
      },
      insight: {
        borderColor: 'border-amber-500',
        bgGradient: 'from-amber-500/10 to-amber-500/5',
        iconBg: 'bg-amber-500/20',
        textColor: 'text-amber-400',
        icon: Lightbulb,
        label: 'Cognitive Bias'
      },
      connection: {
        borderColor: 'border-emerald-500',
        bgGradient: 'from-emerald-500/10 to-emerald-500/5',
        iconBg: 'bg-emerald-500/20',
        textColor: 'text-emerald-400',
        icon: Link2,
        label: 'Pattern Connection'
      },
      synthesis: {
        borderColor: 'border-emerald-500',
        bgGradient: 'from-emerald-500/10 to-emerald-500/5',
        iconBg: 'bg-emerald-500/20',
        textColor: 'text-emerald-400',
        icon: Link2,
        label: 'Synthesis'
      },
      conclusion: {
        borderColor: 'border-cyan-500',
        bgGradient: 'from-cyan-500/10 to-cyan-500/5',
        iconBg: 'bg-cyan-500/20',
        textColor: 'text-cyan-400',
        icon: Sparkles,
        label: 'Moving Forward'
      }
    };
    
    return styles[thread.type] || styles.opening;
  };

  const styles = getThreadStyles();
  const Icon = styles.icon;

  // Animation variants
  const threadVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.3,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  // Highlight animation for surprise tools
  const highlightAnimation = thread.highlight ? {
    animate: {
      boxShadow: [
        "0 0 0 0 rgba(139, 92, 246, 0)",
        "0 0 0 10px rgba(139, 92, 246, 0.2)",
        "0 0 0 0 rgba(139, 92, 246, 0)"
      ]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <motion.div
      variants={threadVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Thread connector line (except for last thread) */}
      {index < totalThreads - 1 && (
        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-gray-600 to-gray-700" />
      )}

      {/* Thread card */}
      <motion.div
        className={`relative bg-[#1F1F1F]/80 backdrop-blur-xl rounded-xl border-2 ${styles.borderColor} overflow-hidden`}
        {...highlightAnimation}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.bgGradient} opacity-50`} />

        {/* Content */}
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-3">
            {/* Thread dot and icon */}
            <div className="relative flex-shrink-0">
              {/* Timeline dot */}
              <div className={`absolute -left-2 top-3 w-4 h-4 rounded-full ${styles.iconBg} border-2 border-[#1F1F1F]`} />
              
              {/* Icon container */}
              <div className={`p-2 ${styles.iconBg} rounded-lg`}>
                <Icon className={`h-5 w-5 ${styles.textColor}`} />
              </div>
            </div>

            {/* Thread info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${styles.textColor} uppercase tracking-wider`}>
                  {styles.label}
                </span>
                {thread.highlight && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="h-3 w-3 text-purple-400" />
                  </motion.div>
                )}
              </div>
              
              {/* Emoji and content */}
              <div className="flex items-start gap-2">
                {thread.emoji && (
                  <span className="text-2xl leading-none mt-0.5">{thread.emoji}</span>
                )}
                <p className="text-gray-300 text-sm leading-relaxed flex-1">
                  {thread.content}
                </p>
              </div>
            </div>
          </div>

          {/* Tool tags */}
          {thread.tools.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 ml-12">
              {thread.tools.map((tool, toolIndex) => (
                <motion.button
                  key={toolIndex}
                  onClick={() => onToolClick?.(tool)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles.textColor} bg-white/5 border border-white/10 hover:bg-white/10 transition-all`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tool}
                </motion.button>
              ))}
            </div>
          )}

          {/* Word count indicator (subtle, for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-600">
              {thread.content.split(' ').length} words
            </div>
          )}
        </div>

        {/* Surprise tool glow effect */}
        {thread.highlight && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(139, 92, 246, 0) 100%)',
                'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)',
                'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(139, 92, 246, 0) 100%)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ThreadItem;