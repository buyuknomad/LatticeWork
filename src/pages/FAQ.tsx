// src/pages/FAQ.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { BRAND } from '../constants/brand';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'technical' | 'account';
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs: FAQItem[] = [
    // General Questions
    {
      category: 'general',
      question: 'What is Mind Lattice?',
      answer: `Mind Lattice is an AI-powered tool that helps you understand patterns in situations, decisions, and behaviors by recommending relevant mental models and cognitive biases. Think of it as your personal thinking assistant that reveals the frameworks behind any situation.`
    },
    {
      category: 'general',
      question: 'Why is it called Mind Lattice?',
      answer: `The name is inspired by Charlie Munger's concept of a "latticework of mental models" - the idea that the best thinkers don't rely on just one or two models, but instead have a broad array of models from multiple disciplines that interconnect like a lattice. Mind Lattice helps you build and apply this interconnected framework of thinking tools.`
    },
    {
      category: 'general',
      question: 'How does Mind Lattice work?',
      answer: `Simply describe any situation, decision, or pattern you're trying to understand. Our AI analyzes your input and identifies the most relevant mental models and cognitive biases at play. You'll get clear explanations of how these concepts apply to your specific situation.`
    },
    {
      category: 'general',
      question: 'What are mental models?',
      answer: `Mental models are thinking frameworks that help explain how things work. They're like lenses through which we can view and understand complex situations. Examples include First Principles Thinking, the Pareto Principle (80/20 rule), and Systems Thinking.`
    },
    {
      category: 'general',
      question: 'What are cognitive biases?',
      answer: `Cognitive biases are systematic errors in thinking that affect our decisions and judgments. Understanding them helps you recognize when your thinking might be skewed. Examples include Confirmation Bias, Anchoring Bias, and the Dunning-Kruger Effect.`
    },
    
    // Pricing Questions
    {
      category: 'pricing',
      question: 'What\'s the difference between Free and Premium?',
      answer: `Free users get 1 analysis per day with 1 mental model and 1 bias per query. Premium users ($${BRAND.pricing.premium.price}/month) get unlimited analyses, 3-4 models and 2-3 biases per query, plus advanced AI insights and pattern connections.`
    },
    {
      category: 'pricing',
      question: 'Is there a free trial?',
      answer: `We offer a generous free tier with 1 analysis per day, so you can experience Mind Lattice before upgrading. Premium subscribers also get a 3-day money-back guarantee if they're not satisfied.`
    },
    {
      category: 'pricing',
      question: 'Can I cancel my subscription anytime?',
      answer: `Yes! You can cancel your Premium subscription anytime from your account settings. You'll retain access to Premium features until the end of your current billing period.`
    },
    {
      category: 'pricing',
      question: 'What payment methods do you accept?',
      answer: `We accept all major credit cards and debit cards through our secure payment processor, Stripe. Your payment information is never stored on our servers.`
    },
    
    // Technical Questions
    {
      category: 'technical',
      question: 'What AI model powers Mind Lattice?',
      answer: `We use Google's advanced Gemini AI models, fine-tuned specifically for mental model and cognitive bias analysis. Premium users get access to our most powerful model for deeper, more nuanced insights.`
    },
    {
      category: 'technical',
      question: 'Is my data private and secure?',
      answer: `Absolutely. We take privacy seriously. Your queries are processed securely, and we never sell your data. All connections are encrypted, and you can delete your query history anytime. See our Privacy Policy for full details.`
    },
    {
      category: 'technical',
      question: 'Do you use my queries to train your AI?',
      answer: `We may use anonymized, aggregated data to improve our service, but your personal queries are never shared or used to train models without explicit consent. You always retain ownership of your data.`
    },
    
    // Account Questions
    {
      category: 'account',
      question: 'How do I upgrade to Premium?',
      answer: `Click any "Upgrade" button in the app or visit the Pricing page. The process takes less than a minute, and you'll have instant access to all Premium features.`
    },
    {
      category: 'account',
      question: 'Can I export my query history?',
      answer: `While we don't currently offer a one-click export, you can view and copy all your past queries and analyses from the History page. We're working on adding a proper export feature.`
    },
    {
      category: 'account',
      question: 'What happens to my data if I cancel?',
      answer: `Your account and query history remain accessible even after cancellation. You can always log back in to view your past analyses or reactivate your subscription.`
    },
    {
      category: 'account',
      question: 'How do I delete my account?',
      answer: `You can request account deletion by contacting us at ${BRAND.email}. We'll process your request within 5 business days and permanently delete all your personal data.`
    }
  ];

  const categories = [
    { id: 'general', label: 'General', icon: '🧠' },
    { id: 'pricing', label: 'Pricing & Billing', icon: '💳' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '👤' }
  ];

  return (
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
                <HelpCircle className="h-8 w-8 text-[#00FFFF]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Frequently Asked Questions</h1>
                <p className="text-gray-400">Everything you need to know about {BRAND.name}</p>
              </div>
            </div>
          </motion.div>
          
          {/* FAQ Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                
                  key={category.id}
                  href={`#${category.id}`}
                  className="px-4 py-2 bg-[#252525]/50 hover:bg-[#252525]/80 rounded-lg text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
          
          {/* FAQ Items */}
          <div className="space-y-6">
            {categories.map((category) => (
              <motion.section
                key={category.id}
                id={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </h2>
                
                <div className="space-y-3">
                  {faqs
                    .filter(faq => faq.category === category.id)
                    .map((faq, index) => {
                      const globalIndex = faqs.indexOf(faq);
                      const isOpen = openItems.includes(globalIndex);
                      
                      return (
                        <motion.div
                          key={globalIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-[#252525]/50 backdrop-blur-sm rounded-lg border border-[#333333] overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#252525]/80 transition-colors"
                          >
                            <span className="text-white font-medium pr-4">{faq.question}</span>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0"
                            >
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            </motion.div>
                          </button>
                          
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="px-6 pb-4 text-gray-300 leading-relaxed">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.section>
            ))}
          </div>
          
          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#333333]"
          >
            <h3 className="text-xl font-semibold text-white mb-3">Still have questions?</h3>
            <p className="text-gray-300 mb-6">
              We're here to help. Reach out to our support team for personalized assistance.
            </p>
            <Link to="/contact">
              <motion.button
                className="bg-[#00FFFF] text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;