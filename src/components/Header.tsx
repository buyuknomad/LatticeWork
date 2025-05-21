import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/login');
    }
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
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
        <Link to="/">
              <Brain className="h-8 w-8 text-[#00FFFF]" />
              <span className="font-bold text-xl md:text-2xl">Cosmic Lattice</span>
            </Link>
          </motion.div>

          <nav className="flex items-center space-x-8">
            {/* Show Features/Pricing only for non-authenticated users */}
            {!user && (
              <>
                <Link to="/features" className="text-white hover:text-[#00FFFF] transition-colors">Features</Link>
                <Link to="/pricing" className="text-white hover:text-[#00FFFF] transition-colors">Pricing</Link>
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
        </div>
      </div>
    </motion.header>
  );
};

export default Header;