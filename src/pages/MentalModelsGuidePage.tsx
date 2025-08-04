// src/pages/MentalModelsGuidePage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import WhatAreMentalModels from '../components/MentalModelsGuide/WhatAreMentalModels';
import BenefitsSection from '../components/MentalModelsGuide/BenefitsSection';
import RealWorldExamples from '../components/MentalModelsGuide/RealWorldExamples';
import CategoryOverview from '../components/MentalModelsGuide/CategoryOverview';
import FeaturedModelsShowcase from '../components/MentalModelsGuide/FeaturedModelsShowcase';
import GetStartedCTA from '../components/MentalModelsGuide/GetStartedCTA';

const MentalModelsGuidePage: React.FC = () => {
  return (
    <>
      <SEO
        title="What are Mental Models? Complete Guide to Better Thinking | Mind Lattice"
        description="Discover what mental models are, why they matter, and how they can improve your decision-making. Learn from Charlie Munger, Warren Buffett, and other great thinkers."
        keywords="what are mental models, mental models guide, thinking frameworks, decision making tools, Charlie Munger mental models, cognitive frameworks"
        url="/mental-models-guide"
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "What are Mental Models? Complete Guide to Better Thinking",
          "description": "A comprehensive guide to understanding mental models and how they improve decision-making",
          "author": {
            "@type": "Organization",
            "name": "Mind Lattice"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Mind Lattice"
          }
        }}
      />
      
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <main>
          {/* Hero Section */}
          <section className="pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6">
                  What are
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] ml-4">
                    Mental Models?
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Discover the thinking tools that helped Warren Buffett, Charlie Munger, and other great minds 
                  make better decisions and understand the world more clearly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.a
                    href="#what-are-mental-models"
                    className="px-8 py-4 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Learn the Basics
                  </motion.a>
                  
                  <motion.a
                    href="/mental-models"
                    className="px-8 py-4 border border-[#00FFFF] text-[#00FFFF] font-semibold rounded-lg hover:bg-[#00FFFF] hover:text-black transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore 298+ Models
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Main Content Sections */}
          <WhatAreMentalModels />
          <BenefitsSection />
          <RealWorldExamples />
          <CategoryOverview />
          <FeaturedModelsShowcase />
          <GetStartedCTA />
        </main>
      </div>
    </>
  );
};

export default MentalModelsGuidePage;