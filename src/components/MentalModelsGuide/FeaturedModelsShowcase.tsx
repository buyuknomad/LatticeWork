// src/components/MentalModelsGuide/FeaturedModelsShowcase.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CategoryBadge from '../CategoryBadge';
import { MentalModelCategory } from '../../types/mentalModels';

interface FeaturedModel {
  name: string;
  slug: string;
  category: MentalModelCategory;
  description: string;
  example: string;
}

const FeaturedModelsShowcase: React.FC = () => {
  // Featured models representing different categories
  const featuredModels: FeaturedModel[] = [
    {
      name: "First Principles Thinking",
      slug: "first-principles-thinking",
      category: "general-thinking",
      description: "Break down complex problems into fundamental truths and build up from there.",
      example: "Elon Musk used this to revolutionize space travel by questioning why rockets cost so much."
    },
    {
      name: "Compound Interest",
      slug: "compound-interest",
      category: "economics-markets",
      description: "Small improvements accumulate exponentially over time, creating massive long-term results.",
      example: "Warren Buffett attributes most of his wealth to living in America, some lucky genes, and compound interest."
    },
    {
      name: "Pareto Principle",
      slug: "pareto-principle",
      category: "statistics-analysis",
      description: "Roughly 80% of effects come from 20% of causes - the vital few vs trivial many.",
      example: "In business, often 80% of revenue comes from 20% of customers."
    },
    {
      name: "Network Effects",
      slug: "network-effects",
      category: "systems-mathematics",
      description: "A product or service becomes more valuable as more people use it.",
      example: "Facebook becomes more valuable to each user as more of their friends join the platform."
    },
    {
      name: "Cognitive Biases",
      slug: "cognitive-biases",
      category: "psychology-behavior",
      description: "Systematic errors in thinking that affect our decisions and judgments.",
      example: "Confirmation bias leads us to seek information that confirms what we already believe."
    },
    {
      name: "Game Theory",
      slug: "game-theory",
      category: "strategy-conflict",
      description: "The study of strategic decision-making between rational actors.",
      example: "The prisoner's dilemma shows why two rational people might not cooperate even when it's in their best interest."
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Featured
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] ml-3">
              Mental Models
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Here are some of the most powerful mental models from our collection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredModels.map((model, index) => (
            <motion.div
              key={model.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/mental-models/${model.slug}`}
                className="block bg-[#252525] rounded-lg p-6 border border-[#333333] hover:border-[#00FFFF]/30 transition-all duration-300 h-full group"
              >
                <div className="mb-4">
                  <CategoryBadge category={model.category} size="sm" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-[#00FFFF] transition-colors">
                  {model.name}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4">
                  {model.description}
                </p>
                
                <div className="bg-[#1A1A1A] rounded-lg p-3 mb-4">
                  <p className="text-gray-400 text-sm italic">
                    <span className="text-[#00FFFF] font-semibold">Example:</span> {model.example}
                  </p>
                </div>
                
                <div className="flex items-center text-[#00FFFF] text-sm font-medium group-hover:text-white transition-colors">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 rounded-lg p-8 text-center border border-[#00FFFF]/20"
        >
          <h3 className="text-2xl font-semibold mb-4">
            Ready to Master Mental Models?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our complete library contains 298+ mental models across 15 categories. 
            Each model includes detailed explanations, real-world examples, and practical applications.
          </p>
          <Link
            to="/mental-models"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
          >
            Browse All Mental Models
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedModelsShowcase;