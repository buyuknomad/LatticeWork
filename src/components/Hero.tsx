// src/components/Hero.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Zap, HelpCircle, ArrowRight } from 'lucide-react';
import InteractiveDemo from './InteractiveDemo';

// Define examples OUTSIDE the component for a stable reference
const EXAMPLES_LIST = [
  "Should I accept this job offer?",
  "Why do I keep procrastinating on important tasks?",
  "Why did my product launch fail?",
  "Why does my team miss deadlines?",
  "Why are companies doing mass layoffs while reporting profits?",
  "What drives countries to implement new tariffs?",
  "Why do AI companies keep acquiring smaller startups?",
  "Why do tech bubbles keep happening?"
];

const Hero = () => {
  const [question, setQuestion] = useState('');
  const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(true);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [typingProgress, setTypingProgress] = useState(0);
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
        // Calculate typing progress (0 to 1)
        setTypingProgress(charIndex / currentExample.length);
        charIndex++;
        timeoutId = window.setTimeout(typeCharacter, 30); // Faster typing speed (was 70)
      } else if (isDeleting && charIndex >= 0) {
        setQuestion(currentExample.slice(0, charIndex));
        setTypingProgress(charIndex / currentExample.length);
        charIndex--;
        timeoutId = window.setTimeout(typeCharacter, 20); // Faster deleting speed (was 40)
      } else if (!isDeleting) {
        timeoutId = window.setTimeout(() => {
          isDeleting = true;
          typeCharacter(); 
        }, 1500); // Shorter pause before deleting (was 2000)
      } else {
        setTypingProgress(0); // Reset progress when switching examples
        timeoutId = window.setTimeout(() => {
          setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLES_LIST.length);
        }, 300); // Shorter pause before next example (was 500)
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
    setTypingProgress(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTypingAnimationActive) {
      setIsTypingAnimationActive(false); 
    }
    setQuestion(e.target.value);
    // Calculate typing progress for manual typing
    setTypingProgress(e.target.value.length > 0 ? Math.min(e.target.value.length / 30, 1) : 0);
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
    <section className="pt-32 pb-12 md:pb-16 lg:pb-20 overflow-hidden" id="hero">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Headline and Description - Full Width */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-10 md:mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Supporting Badge and Guide Link Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {/* Supporting Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FFFF]/10 backdrop-blur-sm rounded-full border border-[#00FFFF]/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Zap className="h-4 w-4 text-[#00FFFF]" />
              <span className="text-sm font-medium text-[#00FFFF]">Real Analysis, Not Theory</span>
            </motion.div>
            
            {/* Mental Models Guide Link */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link 
                to="/mental-models-guide"
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 overflow-hidden rounded-full transition-all duration-300 hover:scale-105"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/15 to-[#00FFFF]/15 group-hover:from-[#8B5CF6]/25 group-hover:to-[#00FFFF]/25 transition-all duration-300" />
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-[#8B5CF6]/50 to-[#00FFFF]/50 opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '1px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                
                {/* Content */}
                <div className="relative flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-sm font-medium text-white group-hover:text-[#00FFFF] transition-colors">
                    New Here? Start with our Guide
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#00FFFF] opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
                </div>
              </Link>
            </motion.div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 md:mb-4 leading-tight">
            See Mental Models{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              in Action
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-6 leading-relaxed">
            Drop in any decision, problem, or situation. Watch our AI reveal the exact thinking patterns 
            at play. Get practical steps to think clearer - all in under 30 seconds.
          </p>
        </motion.div>

        {/* Interactive Demo Container - Full Width */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-[#252525] p-6 md:p-8 rounded-xl shadow-lg border border-[#333333] relative">
            {/* Glowing corner accents for visual interest */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#00FFFF]/20 to-transparent rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#8B5CF6]/20 to-transparent rounded-br-xl"></div>
            
            {/* Input Field */}
            <div className="relative mb-6 md:mb-8">
              <input
                id="hero-question-input"
                type="text"
                value={question}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyPress={handleKeyPress}
                placeholder={!isTypingAnimationActive ? "What situation do you want to see analyzed?" : ""}
                className="w-full bg-[#333333] border border-[#444444] text-white px-5 py-3 md:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF] placeholder-gray-500 transition-shadow duration-300 text-base md:text-lg"
              />
            </div>
            
            {/* Interactive Visualization */}
            <InteractiveDemo 
              isTyping={isTypingAnimationActive || question.length > 0} 
              category={getCategoryFromQuestion(question)}
              typingProgress={typingProgress}
            />
            
            {/* Inline Styles Traveling Glow Button */}
            <div className="mt-6 md:mt-8 text-center">
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
                  className="relative bg-[#1A1A1A] text-[#00FFFF] font-bold py-3 px-8 md:py-4 md:px-10 rounded-lg z-10"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                >
                  {user ? (question.trim() ? 'Start Free' : 'Go to Dashboard') : 'Sign Up Now'}
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
    question.trim() ? 'Press Enter or click to see the analysis' : 'Free: 3 analyses daily (2 trending + 1 custom) • See thinking patterns instantly'
  ) : (
    'Free: 3 analyses daily (2 trending + 1 custom) • See thinking patterns instantly'
  )}
</motion.p>
            </div>
          </div>
        </motion.div>

        {/* Trending Topics Feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FFFF]/10 backdrop-blur-sm rounded-full border border-[#00FFFF]/30 mb-6">
            <TrendingUp className="h-4 w-4 text-[#00FFFF]" />
            <span className="text-sm font-medium text-[#00FFFF]">New: Current Events Analysis</span>
          </div>
          
          <p className="text-xl text-gray-300 mb-6">
            Understand trending news through timeless mental models
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <motion.span 
              className="px-4 py-2 bg-[#252525]/50 backdrop-blur-sm rounded-full text-gray-300 border border-[#333333]"
              whileHover={{ scale: 1.05, borderColor: '#00FFFF' }}
              transition={{ duration: 0.2 }}
            >
              🌍 Global Events
            </motion.span>
            <motion.span 
              className="px-4 py-2 bg-[#252525]/50 backdrop-blur-sm rounded-full text-gray-300 border border-[#333333]"
              whileHover={{ scale: 1.05, borderColor: '#00FFFF' }}
              transition={{ duration: 0.2 }}
            >
              💼 Business Trends
            </motion.span>
            <motion.span 
              className="px-4 py-2 bg-[#252525]/50 backdrop-blur-sm rounded-full text-gray-300 border border-[#333333]"
              whileHover={{ scale: 1.05, borderColor: '#00FFFF' }}
              transition={{ duration: 0.2 }}
            >
              🚀 Tech Innovations
            </motion.span>
            <motion.span 
              className="px-4 py-2 bg-[#252525]/50 backdrop-blur-sm rounded-full text-gray-300 border border-[#333333]"
              whileHover={{ scale: 1.05, borderColor: '#00FFFF' }}
              transition={{ duration: 0.2 }}
            >
              🧠 Psychology Insights
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const getCategoryFromQuestion = (question: string): 'business' | 'personal' | 'analysis' | 'default' => {
  const lowercase = question.toLowerCase();
  if (lowercase.includes('business') || lowercase.includes('strategy') || lowercase.includes('company') || lowercase.includes('startup') || lowercase.includes('product') || lowercase.includes('team')) {
    return 'business';
  }
  if (lowercase.includes('i') || lowercase.includes('my') || lowercase.includes('me') || lowercase.includes('career') || lowercase.includes('should i')) {
    return 'personal';
  }
  if (lowercase.includes('why') || lowercase.includes('how') || lowercase.includes('what') || lowercase.includes('bias')) {
    return 'analysis';
  }
  return 'default';
};

export default Hero;