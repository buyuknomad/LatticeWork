// src/components/Hero.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InteractiveDemo from './InteractiveDemo';

// Define examples OUTSIDE the component for a stable reference
const EXAMPLES_LIST = [
  "How do I prioritize my tasks effectively?",
  "Why did this startup's strategy succeed?",
  "How can I evaluate this investment opportunity?",
  "What biases affect my hiring decisions?",
  "Why do projects always take longer than expected?",
  "How should I approach this career transition?"
];

const Hero = () => {
  const [question, setQuestion] = useState('');
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isTypingAnimationActive) {
      return; 
    }

    let timeoutId: number;
    let charIndex = 0;
    let isDeleting = false;

    const typeCharacter = () => {
      if (!isTypingAnimationActive) {
        clearTimeout(timeoutId);
        return;
      }

      const currentExample = EXAMPLES_LIST[currentExampleIndex];

      if (!isDeleting && charIndex <= currentExample.length) {
        setQuestion(currentExample.slice(0, charIndex));
        charIndex++;
        timeoutId = window.setTimeout(typeCharacter, 70);
      } else if (isDeleting && charIndex >= 0) {
        setQuestion(currentExample.slice(0, charIndex));
        charIndex--;
        timeoutId = window.setTimeout(typeCharacter, 40);
      } else if (!isDeleting) {
        timeoutId = window.setTimeout(() => {
          isDeleting = true;
          typeCharacter(); 
        }, 2000);
      } else {
        timeoutId = window.setTimeout(() => {
          setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLES_LIST.length);
        }, 500);
      }
    };

    charIndex = 0; 
    isDeleting = false;
    timeoutId = window.setTimeout(typeCharacter, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentExampleIndex, isTypingAnimationActive]); 

  const handleInputFocus = () => {
    setIsTypingAnimationActive(false); 
    setQuestion(''); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTypingAnimationActive) {
      setIsTypingAnimationActive(false); 
    }
    setQuestion(e.target.value);
  };

  const handleGetStarted = () => {
    if (user) {
      // If user is logged in and has a question, pass it to dashboard
      if (question.trim()) {
        navigate(`/dashboard?q=${encodeURIComponent(question.trim())}`);
      } else {
        // No question entered, just go to dashboard
        navigate('/dashboard');
      }
    } else {
      // If not logged in, take them to signup
      navigate('/signup');
    }
  };

  // Handle Enter key press in the input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && question.trim()) {
      handleGetStarted();
    }
  };

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 2xl:pt-32 2xl:pb-20 overflow-hidden" id="hero">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Headline and Description - Full Width */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-14 md:mb-10 2xl:mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-5xl font-bold mb-6 md:mb-4 leading-tight">
            Mental Models for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              Modern Minds
            </span>
          </h1>
          <p className="text-lg md:text-xl 2xl:text-lg text-gray-300 mb-8 md:mb-6 leading-relaxed">
            Decode patterns in any situation. Mind Lattice analyzes your challenges and reveals 
            the mental models and cognitive biases at play, helping you think clearer and decide better.
          </p>
        </motion.div>

        {/* Interactive Demo Container - Full Width */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-[#252525] p-8 2xl:p-6 rounded-xl shadow-lg border border-[#333333] relative">
            {/* Glowing corner accents for visual interest */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#00FFFF]/20 to-transparent rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#8B5CF6]/20 to-transparent rounded-br-xl"></div>
            
            {/* Input Field */}
            <div className="relative mb-8 2xl:mb-6">
              <input
                id="hero-question-input"
                type="text"
                value={question}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyPress={handleKeyPress}
                placeholder={!isTypingAnimationActive ? "Describe a situation, decision, or behavior you want to understand..." : ""}
                className="w-full bg-[#333333] border border-[#444444] text-white px-5 py-4 2xl:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF] placeholder-gray-500 transition-shadow duration-300 text-lg 2xl:text-base"
              />
            </div>
            
            {/* Interactive Visualization */}
            <InteractiveDemo 
              isTyping={!isTypingAnimationActive && question.length > 0} 
              category={getCategoryFromQuestion(question)}
            />
            
            {/* Inline Styles Traveling Glow Button */}
            <div className="mt-8 2xl:mt-6 text-center">
              <div className="relative inline-block group">
                {/* Button background with gradient border */}
                <div 
                  className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    animation: 'glow-travel 4s linear infinite',
                    backgroundSize: '400% 400%'
                  }}
                ></div>
                
                {/* Button itself */}
                <motion.button
                  className="relative bg-[#1A1A1A] text-[#00FFFF] font-bold py-4 px-10 2xl:py-3 2xl:px-8 rounded-lg z-10"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                >
                  {user ? (question.trim() ? 'Analyze Pattern' : 'Go to Dashboard') : 'Get Started Free'}
                </motion.button>
              </div>
              
              {/* Helper text */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm text-gray-400"
              >
                {user ? (
                  question.trim() ? 'Press Enter or click to analyze this pattern' : 'Start with 1 free analysis per day'
                ) : (
                  'No credit card required • 1 free analysis per day'
                )}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const getCategoryFromQuestion = (question: string): 'business' | 'personal' | 'analysis' | 'default' => {
  const lowercase = question.toLowerCase();
  if (lowercase.includes('business') || lowercase.includes('strategy') || lowercase.includes('company') || lowercase.includes('startup')) {
    return 'business';
  }
  if (lowercase.includes('i') || lowercase.includes('my') || lowercase.includes('me') || lowercase.includes('career')) {
    return 'personal';
  }
  if (lowercase.includes('why') || lowercase.includes('how') || lowercase.includes('what') || lowercase.includes('bias')) {
    return 'analysis';
  }
  return 'default';
};

export default Hero;