// src/components/SeeItWork.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, AlertTriangle, ArrowRight, Play, Zap, TrendingUp } from 'lucide-react';

interface Example {
  id: string;
  category: string;
  question: string;
  situation: string;
  mentalModels: Array<{ name: string; description: string }>;
  biases: Array<{ name: string; description: string }>;
  insight: string;
  icon: React.ReactNode;
}

const examples: Example[] = [
  {
    id: 'layoffs',
    category: 'Current Event',
    question: "Why are profitable tech companies doing mass layoffs?",
    situation: "Major tech companies with record profits are laying off thousands of employees while their stock prices often rise.",
    mentalModels: [
      { 
        name: "Incentive Theory", 
        description: "CEOs are rewarded for stock performance, not employee welfare" 
      },
      { 
        name: "Herd Behavior", 
        description: "Companies copy competitors to avoid looking inefficient" 
      }
    ],
    biases: [
      { 
        name: "Short-term Bias", 
        description: "Prioritizing immediate stock gains over long-term innovation" 
      }
    ],
    insight: "The pattern reveals how market incentives can override logical business decisions, creating industry-wide mimicry.",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: 'procrastination',
    category: 'Personal',
    question: "Why do I keep putting off important tasks?",
    situation: "I have a crucial project deadline approaching, but I keep finding myself doing less important tasks instead.",
    mentalModels: [
      { 
        name: "Temporal Discounting", 
        description: "We value immediate rewards over future benefits" 
      },
      { 
        name: "Path of Least Resistance", 
        description: "Humans naturally gravitate toward easier tasks" 
      }
    ],
    biases: [
      { 
        name: "Present Bias", 
        description: "Overvaluing immediate comfort vs. future satisfaction" 
      },
      { 
        name: "Planning Fallacy", 
        description: "Underestimating time needed for complex tasks" 
      }
    ],
    insight: "Understanding these patterns helps you design systems that make important tasks feel more immediate and manageable.",
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: 'startup',
    category: 'Business',
    question: "Why did my competitor succeed where I failed?",
    situation: "My startup had better features and pricing, but a competitor with an inferior product captured the market.",
    mentalModels: [
      { 
        name: "First-Mover Advantage", 
        description: "Being first often matters more than being best" 
      },
      { 
        name: "Network Effects", 
        description: "Value increases as more people use the product" 
      }
    ],
    biases: [
      { 
        name: "Superiority Bias", 
        description: "Overvaluing product features vs. market dynamics" 
      },
      { 
        name: "Survivorship Bias", 
        description: "Focusing on what succeeded, not why others failed" 
      }
    ],
    insight: "Success often depends more on timing and network dynamics than product quality alone.",
    icon: <Zap className="h-5 w-5" />
  }
];

const SeeItWork: React.FC = () => {
  const [activeExample, setActiveExample] = useState(examples[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleExampleChange = (example: Example) => {
    if (example.id === activeExample.id) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveExample(example);
      setIsAnimating(false);
    }, 300);
  };

  const handleAnalyzeClick = () => {
    if (user) {
      // If logged in, go to dashboard
      navigate('/dashboard');
    } else {
      // If not logged in, go to signup
      navigate('/signup');
    }
  };

  return (
    <section className="py-16 md:py-20" id="see-it-work">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/10 backdrop-blur-sm rounded-full border border-[#8B5CF6]/30 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Play className="h-4 w-4 text-[#8B5CF6]" />
              <span className="text-sm font-medium text-[#8B5CF6]">See It Work</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Watch Mental Models{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                Decode Real Situations
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              See exactly how our AI identifies patterns in actual scenarios - from current events to personal challenges
            </p>
          </div>

          {/* Example Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {examples.map((example) => (
              <motion.button
                key={example.id}
                onClick={() => handleExampleChange(example)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeExample.id === example.id
                    ? 'bg-[#00FFFF]/20 border-[#00FFFF] text-[#00FFFF]'
                    : 'bg-[#252525]/50 border-[#333333] text-gray-300 hover:border-[#00FFFF]/50'
                } border`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {example.icon}
                <span className="text-sm font-medium">{example.category}</span>
              </motion.button>
            ))}
          </div>

          {/* Split Screen Demo */}
          <motion.div
            className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl border border-[#333333] overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Input/Situation */}
              <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[#333333]">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">The Situation</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <span className="px-2 py-1 bg-[#333333] rounded text-xs">
                      {activeExample.category}
                    </span>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeExample.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-[#1A1A1A]/50 rounded-lg p-4 mb-4">
                      <p className="text-[#00FFFF] font-medium mb-2">
                        "{activeExample.question}"
                      </p>
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed">
                      {activeExample.situation}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Side - Analysis Results */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Pattern Analysis</h3>
                  <p className="text-sm text-gray-400">AI-identified patterns in action</p>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeExample.id + '-analysis'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Mental Models */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-4 w-4 text-[#00FFFF]" />
                        <span className="text-sm font-medium text-[#00FFFF]">Mental Models</span>
                      </div>
                      <div className="space-y-2">
                        {activeExample.mentalModels.map((model, index) => (
                          <motion.div
                            key={model.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg p-3"
                          >
                            <h4 className="text-[#00FFFF] font-medium text-sm mb-1">
                              {model.name}
                            </h4>
                            <p className="text-gray-300 text-xs">
                              {model.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Cognitive Biases */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-amber-400">Cognitive Biases</span>
                      </div>
                      <div className="space-y-2">
                        {activeExample.biases.map((bias, index) => (
                          <motion.div
                            key={bias.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-3"
                          >
                            <h4 className="text-amber-400 font-medium text-sm mb-1">
                              {bias.name}
                            </h4>
                            <p className="text-gray-300 text-xs">
                              {bias.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Key Insight */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-r from-[#252525] to-[#2A2A2A] rounded-lg p-4 border border-[#333333]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-[#8B5CF6]" />
                        <span className="text-sm font-medium text-white">Key Insight</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {activeExample.insight}
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom CTA Bar */}
            <div className="bg-[#1A1A1A]/50 border-t border-[#333333] p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-400">
                  This is just one example. Try it with your own situation!
                </p>
                <motion.button
                  className="flex items-center gap-2 bg-[#00FFFF] text-[#1A1A1A] px-4 py-2 rounded-lg font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnalyzeClick}
                >
                  Analyze Your Situation
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SeeItWork;