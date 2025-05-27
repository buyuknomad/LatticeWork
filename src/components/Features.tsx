// src/components/Features.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeaturesTabs from './FeaturesTabs';

const Features = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20" id="features">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Everything You Need for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              Clear Thinking
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Master the art of decision-making with our comprehensive toolkit.
          </p>
        </div>

        {/* Tabbed Content */}
        <FeaturesTabs />

        {/* CTA remains the same */}
        <div className="text-center mt-20">
          <p className="text-xl text-gray-300 mb-8">
            Ready to think like the world's best decision-makers?
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-[#00FFFF] text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
          >
            {user ? 'Go to Dashboard' : 'Start Building Your Latticework'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;