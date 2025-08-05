// src/components/MentalModelsGuide/WhatAreMentalModels.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Target, Zap } from 'lucide-react';

const WhatAreMentalModels: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section id="what-are-mental-models" className="py-20 px-4 bg-gradient-to-b from-[#1A1A1A] to-[#252525]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="flex items-center justify-center mb-6">
            <Brain className="w-12 h-12 text-[#00FFFF] mr-4" />
            <h2 className="text-4xl md:text-5xl font-bold">Mental Models Explained</h2>
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Mental Models serve as cognitive aids that assist individuals in comprehending the world, 
            making decisions, and tackling problems by simplifying intricate concepts into practical frameworks.
          </motion.p>
        </motion.div>

        {/* Core Definition */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-12 items-center mb-20"
        >
          <motion.div variants={fadeInUp}>
            <h3 className="text-3xl font-bold mb-6 text-[#00FFFF]">Think of Them as Your Mental Toolkit</h3>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Just like a carpenter has different tools for different jobs, mental models are thinking tools 
                that help you approach different types of problems and decisions.
              </p>
              <p>
                They act as unique lenses, providing diverse viewpoints and uncovering essential information, 
                aiding in cognition, reasoning, and decision-making processes.
              </p>
              <p>
                <strong className="text-white">The key insight:</strong> By having multiple mental models, 
                you can look at the same situation from different angles and make better decisions.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-[#252525] rounded-2xl p-8 border border-[#333333]">
            <div className="text-center mb-6">
              <Lightbulb className="w-16 h-16 text-[#FFB84D] mx-auto mb-4" />
              <h4 className="text-2xl font-semibold">Charlie Munger's Wisdom</h4>
            </div>
            <blockquote className="text-lg italic text-gray-300 text-center leading-relaxed">
              "You must have multiple models—because if you just have one or two that you're using, 
              the nature of human psychology is such that you'll torture reality to fit your models."
            </blockquote>
            <cite className="block text-[#00FFFF] text-center mt-4">— Charlie Munger, Warren Buffett's Partner</cite>
          </motion.div>
        </motion.div>

        {/* Key Characteristics */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.h3 variants={fadeInUp} className="text-3xl font-bold text-center mb-12">
            Key Characteristics of Mental Models
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={fadeInUp} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
              <Target className="w-12 h-12 text-[#00FFFF] mb-4" />
              <h4 className="text-xl font-semibold mb-3">Simplify Complexity</h4>
              <p className="text-gray-300">
                They break down complex situations into understandable patterns and principles, 
                making difficult decisions more manageable.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
              <Brain className="w-12 h-12 text-[#8B5CF6] mb-4" />
              <h4 className="text-xl font-semibold mb-3">Improve Predictions</h4>
              <p className="text-gray-300">
                By understanding how systems work, mental models help you anticipate consequences 
                and make better forecasts about outcomes.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
              <Zap className="w-12 h-12 text-[#FFB84D] mb-4" />
              <h4 className="text-xl font-semibold mb-3">Speed Up Decisions</h4>
              <p className="text-gray-300">
                Instead of starting from scratch each time, mental models provide tested frameworks 
                for making faster, more reliable decisions.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Simple Example */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-gradient-to-r from-[#252525] to-[#1A1A1A] rounded-2xl p-8 border border-[#333333]"
        >
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">A Simple Example</h3>
            <p className="text-xl text-gray-300">Here's how mental models work in everyday life:</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <h4 className="text-xl font-semibold mb-3 text-[#FFB84D]">🎯 The 80/20 Rule (Pareto Principle)</h4>
              <p className="text-gray-300 mb-4">
                <strong>The Model:</strong> 80% of effects come from 20% of causes.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-[#00FFFF] mb-2">In Business:</h5>
                  <p className="text-gray-300 text-sm">80% of revenue often comes from 20% of customers</p>
                </div>
                <div>
                  <h5 className="font-semibold text-[#00FFFF] mb-2">In Personal Life:</h5>
                  <p className="text-gray-300 text-sm">80% of happiness comes from 20% of activities</p>
                </div>
              </div>
              <p className="text-gray-300 mt-4 italic">
                This mental model helps you focus on what matters most instead of getting lost in busy work.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatAreMentalModels;  