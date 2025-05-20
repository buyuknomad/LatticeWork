import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Optional: detect active section based on scroll position
      const sections = ['features', 'pricing'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      } else if (window.scrollY < 100) {
        setActiveSection(''); // At the top of the page
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-colors duration-300 ${
        isScrolled ? 'bg-[#1A1A1A]/90 backdrop-blur-md' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Brain className="h-8 w-8 text-[#00FFFF]" />
            <span className="font-bold text-xl md:text-2xl">Cognitive Cosmos</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['Features', 'Pricing'].map((item) => {
              const isActive = activeSection === item.toLowerCase();
              return (
                <motion.div
                  key={item}
                  className="relative"
                  whileHover="hover"
                  initial="initial"
                  animate={isActive ? "hover" : "initial"}
                >
                  <motion.a
                    href={`#${item.toLowerCase()}`}
                    className={`text-white font-medium text-lg px-3 py-2 rounded-md transition-all duration-300 relative z-10 ${
                      isActive ? 'text-[#00FFFF]' : 'hover:text-[#00FFFF]'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    {item}
                  </motion.a>
                  
                  {/* Hover background effect */}
                  <motion.div
                    className="absolute inset-0 bg-[#00FFFF]/5 rounded-md -z-0"
                    variants={{
                      initial: { opacity: 0, scale: 0.9 },
                      hover: { opacity: 1, scale: 1 }
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  
                  {/* Animated underline effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-full"
                    variants={{
                      initial: { width: 0, left: "50%", translateX: "-50%" },
                      hover: { width: "calc(100% - 16px)", left: "50%", translateX: "-50%" }
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              );
            })}
            
            {/* Login Button */}
            <motion.button
              className="bg-[#252525] border border-[#00FFFF]/30 text-[#00FFFF] px-5 py-2 rounded-lg transition-all duration-300 relative group overflow-hidden shadow-sm"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px 1px rgba(0, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background glow effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Text */}
              <span className="relative z-10">Login</span>
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none relative overflow-hidden rounded-md p-1"
              whileHover={{ boxShadow: "0 0 15px rgba(0, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute inset-0 bg-[#00FFFF]/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md" />
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden mt-4 bg-[#202020]/95 backdrop-blur-md rounded-lg p-4 border border-[#333333] shadow-lg shadow-black/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              {['Features', 'Pricing'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-white hover:text-[#00FFFF] hover:bg-[#00FFFF]/5 py-3 px-4 rounded-md transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ x: 5 }}
                >
                  {item}
                </motion.a>
              ))}
              <motion.button 
                className="bg-gradient-to-r from-[#00FFFF]/20 to-[#8B5CF6]/20 border border-[#00FFFF]/30 text-[#00FFFF] px-4 py-3 rounded-lg mt-2 transition-all duration-300 font-medium"
                whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0, 255, 255, 0.15)" }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;