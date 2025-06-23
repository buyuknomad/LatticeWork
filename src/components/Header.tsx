// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Mental Models', href: '/mental-models' },
    { name: 'Cognitive Biases', href: '/cognitive-biases' },
    { name: 'Examples', href: '/examples' }, // Added Examples navigation
    { name: 'Pricing', href: '/#pricing' },
    { name: 'FAQ', href: '/FAQ' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.substring(1);
    }
    return location.pathname === href;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#333333]' : 'bg-transparent'
    }`}>
      <div className="max-w-[1600px] mx-auto">
        <nav className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-[#00FFFF] transition-colors">
                Mind Lattice
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-[#00FFFF] ${
                    isActive(item.href) ? 'text-[#00FFFF]' : 'text-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-gray-300 hover:text-[#00FFFF] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/history"
                    className="text-sm font-medium text-gray-300 hover:text-[#00FFFF] transition-colors"
                  >
                    History
                  </Link>
                  <Link
                    to="/settings"
                    className="text-sm font-medium text-gray-300 hover:text-[#00FFFF] transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-300 hover:text-[#00FFFF] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-300 hover:text-[#00FFFF] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Start Free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white hover:text-[#00FFFF] transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-4 pb-6 space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-base font-medium transition-colors hover:text-[#00FFFF] ${
                        isActive(item.href) ? 'text-[#00FFFF]' : 'text-gray-300'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <div className="pt-4 border-t border-[#333333]">
                    {user ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-base font-medium text-gray-300 hover:text-[#00FFFF] transition-colors mb-4"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-base font-medium text-gray-300 hover:text-[#00FFFF] transition-colors mb-4"
                        >
                          History
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-base font-medium text-gray-300 hover:text-[#00FFFF] transition-colors mb-4"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left text-base font-medium text-gray-300 hover:text-[#00FFFF] transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-base font-medium text-gray-300 hover:text-[#00FFFF] transition-colors mb-4"
                        >
                          Log In
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-center bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                          Start Free
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
};

export default Header;