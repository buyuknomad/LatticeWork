// src/components/MentalModelsGuide/CategoryOverview.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MENTAL_MODEL_CATEGORIES, 
  CATEGORY_METADATA,
  getCategoryColor 
} from '../../types/mentalModels';
import { CategoryIcon } from '../CategoryBadge';

const CategoryOverview: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section id="categories" className="py-20 px-4 bg-[#252525]">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            15 Categories of
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] ml-3">
              Mental Models
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our library is organized into 15 carefully curated categories, making it easy to find 
            the right mental model for any situation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MENTAL_MODEL_CATEGORIES.map((category, index) => {
            const metadata = CATEGORY_METADATA[category];
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={`/mental-models?category=${category}`}
                  className="block bg-[#1A1A1A] rounded-lg p-6 border-2 transition-all duration-300 h-full group"
                  style={{
                    borderColor: getCategoryColor(category, 0.3),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = metadata.color;
                    e.currentTarget.style.backgroundColor = getCategoryColor(category, 0.05);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = getCategoryColor(category, 0.3);
                    e.currentTarget.style.backgroundColor = '#1A1A1A';
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <CategoryIcon 
                      category={category} 
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-semibold mb-2 group-hover:text-white transition-colors"
                        style={{ color: metadata.color }}
                      >
                        {metadata.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {metadata.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            to="/mental-models"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
          >
            Explore All 298+ Mental Models
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryOverview;