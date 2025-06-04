// src/pages/About.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Brain, Target, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { BRAND } from '../constants/brand';
import SEO from '../components/SEO';

const About: React.FC = () => {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Mind Lattice",
    "description": "Learn about Mind Lattice - inspired by Charlie Munger's latticework concept, we make mental models accessible for better decision-making.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Mind Lattice",
      "description": BRAND.description,
      "foundingDate": "2025",
      "url": BRAND.url
    }
  };

  return (
    <>
      <SEO
        title="About Mind Lattice - Mental Models for Better Thinking"
        description="Inspired by Charlie Munger's latticework of mental models. Learn how Mind Lattice helps you understand thinking patterns and make better decisions."
        keywords="about mind lattice, charlie munger mental models, latticework thinking, decision making tool story"
        url="/about"
        schema={aboutSchema}
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
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#252525] rounded-xl">
                  <Brain className="h-8 w-8 text-[#00FFFF]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">About Mind Lattice</h1>
                  <p className="text-gray-400">Mental Models for Modern Minds</p>
                </div>
              </div>
            </motion.div>
            
            {/* Content Sections */}
            <div className="space-y-12">
              {/* Our Story */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Our Story</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Mind Lattice was born from a simple observation: despite having access to more information than 
                    ever before, people struggle to make clear decisions and understand complex situations.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    We realized that what's missing isn't more data—it's better thinking tools. The same mental models 
                    that help elite performers, successful entrepreneurs, and renowned scientists can transform how anyone 
                    approaches problems and decisions.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    So we built Mind Lattice: an intelligent system that analyzes your specific situations and reveals 
                    the mental models and cognitive biases at play, making expert-level thinking accessible to everyone.
                  </p>
                </div>
              </motion.section>

              {/* The Inspiration - Charlie Munger Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">The Latticework Concept</h2>
                <div className="prose prose-invert max-w-none">
                  <blockquote className="border-l-4 border-[#00FFFF] pl-6 mb-6 italic text-gray-300">
                    "You've got to have models in your head. And you've got to array your experience—both vicarious 
                    and direct—on this latticework of models."
                    <footer className="text-sm text-gray-400 mt-2">— Charlie Munger</footer>
                  </blockquote>
                  
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Mind Lattice is inspired by Charlie Munger's revolutionary concept of building a "latticework of 
                    mental models." Munger, the legendary investor and Warren Buffett's partner, advocates that the 
                    secret to better thinking isn't specialization—it's developing a broad array of mental models from 
                    multiple disciplines.
                  </p>
                  
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Just as a lattice gains strength from its interconnected structure, your thinking becomes more 
                    robust when you can apply models from psychology, physics, economics, biology, and other fields 
                    to any situation. This multidisciplinary approach helps you see patterns others miss and avoid 
                    cognitive blind spots.
                  </p>
                  
                  <p className="text-gray-300 leading-relaxed">
                    Mind Lattice makes this powerful approach accessible by automatically identifying which mental 
                    models apply to your specific situations, helping you build your own latticework of understanding—one 
                    decision at a time.
                  </p>
                </div>
              </motion.section>

              {/* Our Mission */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-6 w-6 text-[#00FFFF]" />
                  <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">
                  To democratize advanced thinking by making mental models and cognitive awareness accessible, 
                  practical, and personalized for every decision maker in the modern world.
                </p>
              </motion.section>

              {/* How It Works */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6 text-[#00FFFF]" />
                  <h2 className="text-2xl font-semibold text-white">How Mind Lattice Works</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-6">
                    <div className="text-[#00FFFF] text-2xl font-bold mb-3">1</div>
                    <h3 className="text-white font-medium mb-2">Describe Your Situation</h3>
                    <p className="text-gray-400 text-sm">
                      Share any decision, behavior, or pattern you want to understand better.
                    </p>
                  </div>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-6">
                    <div className="text-[#00FFFF] text-2xl font-bold mb-3">2</div>
                    <h3 className="text-white font-medium mb-2">AI Analysis</h3>
                    <p className="text-gray-400 text-sm">
                      Our AI analyzes your situation against 300+ mental models and 200+ cognitive biases.
                    </p>
                  </div>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-6">
                    <div className="text-[#00FFFF] text-2xl font-bold mb-3">3</div>
                    <h3 className="text-white font-medium mb-2">Get Clear Insights</h3>
                    <p className="text-gray-400 text-sm">
                      Receive relevant models and biases with practical explanations for your specific context.
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Who It's For */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-[#00FFFF]" />
                  <h2 className="text-2xl font-semibold text-white">Who Uses Mind Lattice</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-medium mb-3">Professionals & Leaders</h3>
                    <p className="text-gray-400 text-sm">
                      Make better strategic decisions, understand team dynamics, and navigate complex business situations.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-3">Students & Learners</h3>
                    <p className="text-gray-400 text-sm">
                      Develop critical thinking skills, improve problem-solving abilities, and accelerate learning.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-3">Entrepreneurs</h3>
                    <p className="text-gray-400 text-sm">
                      Validate ideas, understand market dynamics, and make decisions with limited information.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-3">Anyone Seeking Clarity</h3>
                    <p className="text-gray-400 text-sm">
                      From personal decisions to professional challenges, gain the thinking tools for any situation.
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Our Values */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
              >
                <h2 className="text-2xl font-semibold text-white mb-6">Our Values</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00FFFF] mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Clarity Above All</h3>
                      <p className="text-gray-400 text-sm">
                        We believe clear thinking leads to better outcomes. Every feature we build serves this purpose.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00FFFF] mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Practical Application</h3>
                      <p className="text-gray-400 text-sm">
                        Mental models are only valuable when applied. We focus on real-world relevance, not theory.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00FFFF] mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Accessible Intelligence</h3>
                      <p className="text-gray-400 text-sm">
                        Advanced thinking tools shouldn't be exclusive. We make them available to everyone.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#00FFFF] mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Continuous Learning</h3>
                      <p className="text-gray-400 text-sm">
                        As the world evolves, so do thinking patterns. We constantly update and improve our models.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Join Us */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Join the Mind Lattice Community
                </h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Start your journey toward clearer thinking today. Join thousands of modern minds 
                  who are transforming how they understand and navigate the world.
                </p>
                <Link to="/signup">
                  <motion.button
                    className="bg-[#00FFFF] text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Free
                  </motion.button>
                </Link>
              </motion.section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;