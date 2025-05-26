// src/components/Footer.tsx
import React from 'react';
import { Brain, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND } from '../constants/brand';

const Footer = () => {
  return (
    <footer className="py-12 bg-[#151515] border-t border-[#333333]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-[#00FFFF]" />
              <span className="font-bold text-lg">{BRAND.name}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {BRAND.tagline}. Transform your thinking and decision-making.
            </p>
            <div className="flex space-x-4">
              <a 
                href={`https://x.com/${BRAND.social.x.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300"
                aria-label="Follow us on X"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Product Section */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#features" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal Section */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company Section */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#333333] text-center text-gray-500 text-sm">
          <p>{BRAND.company.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;