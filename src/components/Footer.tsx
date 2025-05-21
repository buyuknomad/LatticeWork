import React from 'react';
import { Brain, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-12 bg-[#151515] border-t border-[#333333]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
              <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-[#00FFFF]" />
              <span className="font-bold text-lg">Cosmic Lattice</span>
            </div>
            <p className="text-gray-400 mb-4">
              Transforming chaotic thoughts into structured, actionable insights.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Integrations', 'Case Studies', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {['Blog', 'Documentation', 'Community', 'Support', 'Mental Models'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Press', 'Contact', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-[#00FFFF] transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#333333] text-center text-gray-500 text-sm">
         <p>© {new Date().getFullYear()} Cosmic Lattice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;