// src/pages/Contact.tsx - simplified version
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { BRAND } from '../constants/brand';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Mind Lattice",
    "description": "Get in touch with Mind Lattice support team",
    "mainEntity": {
      "@type": "Organization",
      "name": "Mind Lattice",
      "email": BRAND.email,
      "url": BRAND.url
    }
  };

  return (
    <>
      <SEO
        title="Contact Us - Get Help with Mind Lattice"
        description="Need help with Mind Lattice? Contact our support team for assistance with mental models, cognitive biases, or account questions."
        keywords="contact mind lattice, mental models support, help"
        url="/contact"
        schema={contactSchema}
      />
      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        
        <div className="relative z-10 pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link to="/" className="inline-flex items-center text-[#00FFFF] hover:underline mb-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#252525] rounded-xl">
                  <MessageSquare className="h-8 w-8 text-[#00FFFF]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Contact Us</h1>
                  <p className="text-gray-400">We're here to help</p>
                </div>
              </div>
            </motion.div>
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#333333]"
            >
              <div className="max-w-2xl mx-auto text-center">
                <Mail className="h-16 w-16 text-[#00FFFF] mx-auto mb-6" />
                
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Get in Touch
                </h2>
                
                <p className="text-gray-300 leading-relaxed mb-8">
                  Have a question about Mind Lattice? Need help with your account? 
                  We'd love to hear from you.
                </p>
                
                <motion.a
                  href={`mailto:${BRAND.email}`}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#00FFFF] text-[#1A1A1A] rounded-lg font-semibold text-lg hover:bg-[#00FFFF]/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="h-5 w-5" />
                  Send us an email
                </motion.a>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <p className="text-sm">We typically respond within 24 hours</p>
                </div>
                
                {/* Additional Contact Info */}
                <div className="mt-12 pt-8 border-t border-[#333333]">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Quick Links
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link 
                      to="/terms"
                      className="p-4 bg-[#1A1A1A]/50 rounded-lg hover:bg-[#1A1A1A]/70 transition-colors"
                    >
                      <p className="text-gray-300 hover:text-white transition-colors">
                        Terms of Service
                      </p>
                    </Link>
                    <Link 
                      to="/privacy"
                      className="p-4 bg-[#1A1A1A]/50 rounded-lg hover:bg-[#1A1A1A]/70 transition-colors"
                    >
                      <p className="text-gray-300 hover:text-white transition-colors">
                        Privacy Policy
                      </p>
                    </Link>
                    <Link 
                      to="/refunds"
                      className="p-4 bg-[#1A1A1A]/50 rounded-lg hover:bg-[#1A1A1A]/70 transition-colors"
                    >
                      <p className="text-gray-300 hover:text-white transition-colors">
                        Refund Policy
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;