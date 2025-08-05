// src/components/MentalModelsGuide/GetStartedCTA.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, Sparkles } from 'lucide-react';

const GetStartedCTA: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#252525] to-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#00FFFF]/10 via-[#8B5CF6]/10 to-[#00FFFF]/10 rounded-2xl p-8 md:p-12 border border-[#00FFFF]/20 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00FFFF]/20 to-[#8B5CF6]/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#8B5CF6]/20 to-[#00FFFF]/20 rounded-full blur-3xl transform -translate-x-32 translate-y-32" />
          
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <Sparkles className="w-16 h-16 text-[#00FFFF] mx-auto mb-4" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Start Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] ml-3">
                Mental Models Journey
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of thinkers, entrepreneurs, and leaders who are using mental models 
              to make better decisions and achieve their goals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-[#1A1A1A]/50 backdrop-blur-sm rounded-lg p-4 border border-[#333333]">
                <BookOpen className="w-8 h-8 text-[#00FFFF] mx-auto mb-2" />
                <p className="text-sm text-gray-300">298+ Models</p>
              </div>
              <div className="bg-[#1A1A1A]/50 backdrop-blur-sm rounded-lg p-4 border border-[#333333]">
                <Brain className="w-8 h-8 text-[#8B5CF6] mx-auto mb-2" />
                <p className="text-sm text-gray-300">15 Categories</p>
              </div>
              <div className="bg-[#1A1A1A]/50 backdrop-blur-sm rounded-lg p-4 border border-[#333333]">
                <Sparkles className="w-8 h-8 text-[#FFB84D] mx-auto mb-2" />
                <p className="text-sm text-gray-300">Real Examples</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/mental-models"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-bold rounded-lg hover:scale-105 transition-transform duration-200 group"
              >
                Explore the Library
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#252525] text-white font-bold rounded-lg border border-[#333333] hover:border-[#00FFFF]/30 transition-colors duration-200"
              >
                Try Mind Lattice
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Free to explore • Learn at your own pace
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400">
            Questions? Check out our{' '}
            <Link to="/faq" className="text-[#00FFFF] hover:underline">
              FAQ
            </Link>
            {' '}or{' '}
            <Link to="/contact" className="text-[#00FFFF] hover:underline">
              contact us
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GetStartedCTA; 