// src/components/Differentiators.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X, ArrowRight, MessageSquare, Brain } from 'lucide-react';

interface ComparisonRow {
  genericAI: string;
  mindLattice: string;
}

const comparisons: ComparisonRow[] = [
  {
    genericAI: "Generic responses about mental models",
    mindLattice: "Pattern-specific analysis for YOUR situation"
  },
  {
    genericAI: "No structured framework",
    mindLattice: "300+ curated mental models & 246 biases"
  },
  {
    genericAI: "One-size-fits-all advice",
    mindLattice: "Tailored application guidance"
  },
  {
    genericAI: "Text walls of information",
    mindLattice: "Visual relationship mapping (Premium)"
  },
  {
    genericAI: "No bias detection",
    mindLattice: "Identifies cognitive traps in your thinking"
  },
  {
    genericAI: "Start from scratch each time",
    mindLattice: "Query history & pattern tracking"
  }
];

const Differentiators = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" id="differentiators">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F1F1F]/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Yes, You Could Ask ChatGPT About Mental Models...
            </h2>
            <p className="text-xl text-gray-300">
              But Here's What You'd Be{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] font-semibold">
                Missing
              </span>
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Generic AI Column */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-[#1F1F1F]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300">Generic AI Tools</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {comparisons.map((row, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <X className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-400 text-sm">{row.genericAI}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mind Lattice Column */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-[#252525] to-[#1F1F1F] rounded-2xl p-6 border border-[#00FFFF]/30 shadow-lg shadow-[#00FFFF]/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-[#00FFFF]/20 to-[#00FFFF]/10 rounded-lg">
                      <Brain className="h-6 w-6 text-[#00FFFF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Mind Lattice</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {comparisons.map((row, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <Check className="h-5 w-5 text-[#00FFFF] mt-0.5 flex-shrink-0" />
                        <p className="text-gray-200 text-sm font-medium">{row.mindLattice}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFFF]/20 to-[#8B5CF6]/20 rounded-2xl blur-xl opacity-50"></div>
              </motion.div>
            </div>

            {/* Bottom Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <div className="inline-block bg-[#252525]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#333333]">
                <p className="text-2xl font-bold mb-3">
                  <span className="text-[#00FFFF]">ChatGPT</span> knows about mental models.
                </p>
                <p className="text-2xl font-bold mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                    Mind Lattice
                  </span>{' '}
                  knows which ones apply to YOUR specific situation.
                </p>
                <p className="text-gray-400 text-sm">
                  It's the difference between a Wikipedia article and a personal thinking coach.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Differentiators;