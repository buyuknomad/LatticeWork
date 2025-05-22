import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

const handleAuthClick = async () => {
  if (user) {
    try {
      await signOut();
      // Navigate to home page after successful logout
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, navigate to home
      navigate('/');
    }
  } else {
    navigate('/login');
  }
};

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 py-4 transition-colors duration-300 bg-[#1A1A1A]/90 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center">
              <Brain className="h-7 w-7 text-[#00FFFF]" />
              <span className="font-bold text-lg ml-2">Cosmic Lattice</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Show Features/Pricing only for non-authenticated users */}
            {!user && (
              <>
                <a href="#features" className="text-white hover:text-[#00FFFF] transition-colors">Features</a>
                <a href="#pricing" className="text-white hover:text-[#00FFFF] transition-colors">Pricing</a>
              </>
            )}
            
            {/* Dashboard Link - Only visible when user is logged in */}
            {user && (
              <Link 
                to="/dashboard" 
                className="text-white hover:text-[#00FFFF] transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
            
            {/* Login/Logout Button */}
            <motion.button
              className="bg-[#252525] border border-[#00FFFF]/30 text-[#00FFFF] px-5 py-2 rounded-lg transition-all duration-300 relative group overflow-hidden shadow-sm"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px 1px rgba(0, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAuthClick}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">{user ? 'Logout' : 'Login'}</span>
            </motion.button>
            
            {/* Show Sign Up button if not logged in */}
            {!user && (
              <motion.button
                className="bg-[#00FFFF] text-[#1A1A1A] px-5 py-2 rounded-lg font-medium transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px 1px rgba(0, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </motion.button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white p-1 rounded-md focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden mt-4 bg-[#212327] rounded-lg p-4 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-3">
              {/* Show Features/Pricing only for non-authenticated users */}
              {!user && (
                <>
                  <a 
                    href="#features" 
                    className="text-white hover:text-[#00FFFF] transition-colors py-2 px-3 rounded-md hover:bg-[#2A2D35]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-white hover:text-[#00FFFF] transition-colors py-2 px-3 rounded-md hover:bg-[#2A2D35]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </a>
                </>
              )}
              
              {/* Dashboard Link - Only visible when user is logged in */}
              {user && (
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-[#00FFFF] transition-colors font-medium py-2 px-3 rounded-md hover:bg-[#2A2D35]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              <div className="pt-2 flex flex-col space-y-2">
                {/* Login/Logout Button */}
                <button
                  className="bg-[#252525] border border-[#00FFFF]/30 text-[#00FFFF] py-2 px-3 rounded-lg transition-all duration-300 relative overflow-hidden shadow-sm text-center"
                  onClick={() => {
                    handleAuthClick();
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="relative z-10">{user ? 'Logout' : 'Login'}</span>
                </button>
                
                {/* Show Sign Up button if not logged in */}
                {!user && (
                  <button
                    className="bg-[#00FFFF] text-[#1A1A1A] py-2 px-3 rounded-lg font-medium transition-all duration-300 text-center"
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;