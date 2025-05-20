import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractiveDemo from './InteractiveDemo'; // Assuming this exists

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
  
  // handleExampleClick is removed as the buttons are removed.

  const handleTryClick = () => {
    console.log("Processing query:", question);
  };

  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden" id="hero">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:space-x-12">
          {/* Left side: Title, Description, Get Started Button */}
          <motion.div 
            className="lg:w-1/2 mb-12 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Elevate Your Thinking with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                Mental Models
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Discover frameworks to make better decisions and solve complex problems.
              Transform chaotic thoughts into structured, actionable insights.
            </p>
            <motion.button
              className="bg-[#00FFFF] text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-[#00FFFF]/90 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </motion.div>

          {/* Right side: Try It Now box */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-[#252525] p-6 rounded-xl shadow-lg border border-[#333333]">
              <h3 className="text-xl font-semibold mb-4 text-center">Try It Now</h3>
              <div className="relative mb-6"> {/* Input and Try It button */}
                <input
                  id="hero-question-input"
                  type="text"
                  value={question}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  placeholder={!isTypingAnimationActive ? "What deserves clearer thinking today?" : ""}
                  className="w-full bg-[#333333] border border-[#444444] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF] placeholder-gray-500 transition-shadow duration-300"
                />
                {!isTypingAnimationActive && question.length > 0 && (
                  <motion.button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#00FFFF] text-[#1A1A1A] px-4 py-1 rounded-md font-medium"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleTryClick}
                  >
                    Try it
                  </motion.button>
                )}
              </div>
              
              {/* The section for displaying example buttons has been removed.
                <div className="mb-6"> ... </div> 
              */}

              <InteractiveDemo 
                isTyping={!isTypingAnimationActive && question.length > 0} 
                category={getCategoryFromQuestion(question)}
              />
            </div>
          </motion.div>
        </div>
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