import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ChevronLeft, Construction } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';
import SEO from '../components/SEO';

const MentalModels: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="300+ Mental Models - Complete List & Explanations | Mind Lattice"
        description="Comprehensive list of mental models for better thinking. From first principles to decision trees, master the frameworks that improve decisions."
        keywords="mental models list, thinking frameworks, decision models, Charlie Munger models, first principles, mental model examples"
        url="/mental-models"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Mental Models Collection",
          "description": "Complete collection of mental models for better thinking and decision making",
          "numberOfItems": 300,
          "publisher": {
            "@type": "Organization",
            "name": "Mind Lattice"
          }
        }}
      />

      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        
        <div className="relative z-10 pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link to="/" className="inline-flex items-center text-[#00FFFF] hover:underline mb-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#252525] rounded-xl">
                  <Brain className="h-8 w-8 text-[#00FFFF]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Mental Models Collection</h1>
                  <p className="text-gray-400">300+ thinking frameworks for better decisions</p>
                </div>
              </div>
            </motion.div>
            
            {/* Coming Soon Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
            >
              <div className="text-center">
                <Construction className="h-16 w-16 text-[#00FFFF] mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Complete Mental Models Library Coming Soon
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                  We're building a comprehensive, searchable collection of 300+ mental models 
                  organized by category. Each model will include explanations, examples, and 
                  practical applications.
                </p>
                
                {/* Preview of what's coming */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                    <h3 className="text-[#00FFFF] font-semibold mb-2">Decision Making</h3>
                    <p className="text-sm text-gray-400">First Principles, Opportunity Cost, Sunk Cost Fallacy...</p>
                  </div>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                    <h3 className="text-[#00FFFF] font-semibold mb-2">Systems Thinking</h3>
                    <p className="text-sm text-gray-400">Feedback Loops, Emergence, Network Effects...</p>
                  </div>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                    <h3 className="text-[#00FFFF] font-semibold mb-2">Psychology</h3>
                    <p className="text-sm text-gray-400">Social Proof, Reciprocity, Loss Aversion...</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#00FFFF] text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Mind Lattice Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentalModels;