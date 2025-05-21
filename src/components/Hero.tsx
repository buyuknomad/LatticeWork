import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractiveDemo from './InteractiveDemo';

// Define examples OUTSIDE the component for a stable reference
const EXAMPLES_LIST = [
  "How do I prioritize my tasks?",
  "Why did Elon's SpaceX strategy succeed?",
  "How can I evaluate this investment opportunity?",
  "What biases affect climate change debates?",
  "Why did the recent tech layoffs happen?",
  "How should I approach my career transition?"
];

const Hero = () => {
  const [question, setQuestion] = useState('');
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

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

      if (!isDeleting && charIndex <= currentExample.length) { // Typing phase
        setQuestion(currentExample.slice(0, charIndex));
        charIndex++;
        timeoutId = window.setTimeout(typeCharacter, 70);
      } else if (isDeleting && charIndex >= 0) { // Deleting phase
        setQuestion(currentExample.slice(0, charIndex));
        charIndex--;
        timeoutId = window.setTimeout(typeCharacter, 40);
      } else if (!isDeleting) { // Done typing, pause then start deleting
        timeoutId = window.setTimeout(() => {
          isDeleting = true;
          typeCharacter(); 
        }, 2000); // Pause after typing
      } else { // Done deleting, pause then move to next example
        timeoutId = window.setTimeout(() => {
          setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLES_LIST.length);
        }, 500); // Pause before switching to next
      }
    };

    charIndex = 0; 
    isDeleting = false;
    timeoutId = window.setTimeout(typeCharacter, 100); // Initial delay

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

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden" id="hero">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Headline and Description - Full Width */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-14"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Better Thinking,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              Better Decisions
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            A toolkit of mental models and cognitive biases that helps you see problems clearly, 
            recognize thinking traps, and find solutions that others miss.
          </p>
        </motion.div>

        {/* Interactive Demo Container - Full Width */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-[#252525] p-8 rounded-xl shadow-lg border border-[#333333] relative">
            {/* Glowing corner accents for visual interest */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#00FFFF]/20 to-transparent rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#8B5CF6]/20 to-transparent rounded-br-xl"></div>
            
            {/* Input Field */}
            <div className="relative mb-8">
              <input
                id="hero-question-input"
                type="text"
                value={question}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder={!isTypingAnimationActive ? "What deserves clearer thinking today?" : ""}
                className="w-full bg-[#333333] border border-[#444444] text-white px-5 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF] placeholder-gray-500 transition-shadow duration-300 text-lg"
              />
            </div>
            
            {/* Interactive Visualization */}
            <InteractiveDemo 
              isTyping={!isTypingAnimationActive && question.length > 0} 
              category={getCategoryFromQuestion(question)}
            />
            
            {/* Inline Styles Traveling Glow Button */}
            <div className="mt-8 text-center">
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
                  className="relative bg-[#1A1A1A] text-[#00FFFF] font-bold py-4 px-10 rounded-lg z-10"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                </motion.button>
              </div>
              
         
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const getCategoryFromQuestion = (question: string): 'business' | 'personal' | 'analysis' | 'default' => {
  const lowercase = question.toLowerCase();
  if (lowercase.includes('business') || lowercase.includes('strategy') || lowercase.includes('company') || lowercase.includes('elon')) {
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