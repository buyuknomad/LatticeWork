import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeft, Construction } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';
import SEO from '../components/SEO';

const CognitiveBiases: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="200+ Cognitive Biases - Complete Guide to Thinking Errors | Mind Lattice"
        description="Comprehensive guide to cognitive biases that affect decisions. Learn to recognize and overcome mental traps in thinking."
        keywords="cognitive biases list, thinking errors, decision biases, behavioral psychology, confirmation bias, anchoring bias"
        url="/cognitive-biases"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Cognitive Biases Collection",
          "description": "Complete collection of cognitive biases and thinking errors",
          "numberOfItems": 200,
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
                  <AlertTriangle className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Cognitive Biases Collection</h1>
                  <p className="text-gray-400">200+ thinking errors to recognize and overcome</p>
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
                <Construction className="h-16 w-16 text-amber-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Complete Cognitive Biases Guide Coming Soon
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                  We're creating a comprehensive, searchable guide to 200+ cognitive biases. 
                  Each bias will include detailed explanations, real-world examples, and 
                  strategies to recognize and mitigate their effects.
                </p>
                
                {/* Preview of what's coming */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                    <h3 className="text-amber-400 font-semibold mb-2">Decision-Making Biases</h3>
                    <p className="text-sm text-gray-400">Anchoring, Availability Heuristic, Framing Effect...</p>
                  </div>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                    <h3 className="text-amber-400 font-semibold mb-2">Social Biases</h3>
                    <p className="text-sm text-gray-400">Bandwagon Effect, Authority Bias, In-group Bias...</p>
                  </div>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                    <h3 className="text-amber-400 font-semibold mb-2">Memory Biases</h3>
                    <p className="text-sm text-gray-400">Hindsight Bias, Rosy Retrospection, Recency Effect...</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="bg-amber-400 text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-amber-400/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Discover Your Biases Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CognitiveBiases;