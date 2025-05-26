// src/pages/Refunds.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { BRAND } from '../constants/brand';

const Refunds: React.FC = () => {
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
                <RefreshCw className="h-8 w-8 text-[#00FFFF]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Refund Policy</h1>
                <p className="text-gray-400">Last Updated: January 2025</p>
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
            <div className="prose prose-invert max-w-none">
              <section className="mb-8">
                <p className="text-gray-300 leading-relaxed text-lg">
                  At Mind Lattice, we want you to be completely satisfied with your subscription. 
                  This policy outlines our refund terms and cancellation process.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Premium Subscription Refunds</h2>
                
                <div className="bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-medium text-[#00FFFF] mb-3">3-Day Money-Back Guarantee</h3>
                  <p className="text-gray-300 leading-relaxed">
                    First-time Premium subscribers are eligible for a full refund within 3 days of their initial purchase. 
                    This allows you to try our premium features risk-free.
                  </p>
                </div>
                
                <h3 className="text-xl font-medium text-white mb-3">Eligibility Requirements</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Must be your first Premium subscription</li>
                  <li>Request must be made within 3 days of purchase</li>
                  <li>Account must be in good standing (no violations of Terms of Service)</li>
                </ul>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">After 3 Days</h3>
                <p className="text-gray-300 leading-relaxed">
                  After the 3-day period, subscriptions are non-refundable except as required by law. 
                  However, you can cancel anytime to prevent future charges.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. How to Request a Refund</h2>
                
                <div className="bg-[#1A1A1A]/50 rounded-lg p-6 border border-[#333333]">
                  <ol className="list-decimal list-inside text-gray-300 space-y-3">
                    <li>
                      <strong>Email us</strong> at{' '}
                      <a href={`mailto:${BRAND.email}`} className="text-[#00FFFF] hover:underline">
                        {BRAND.email}
                      </a>
                    </li>
                    <li>
                      <strong>Include in your email:</strong>
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Your account email address</li>
                        <li>Date of purchase</li>
                        <li>Reason for refund (optional but helpful)</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Subject line:</strong> "Refund Request - [Your Email]"
                    </li>
                  </ol>
                </div>
                
                <p className="text-gray-300 leading-relaxed mt-4">
                  We aim to respond to all refund requests within 24 hours.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Refund Processing</h2>
                
                <h3 className="text-xl font-medium text-white mb-3">Processing Time</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Refunds are processed within 5-10 business days</li>
                  <li>Funds will be returned to your original payment method</li>
                  <li>You'll receive an email confirmation when the refund is processed</li>
                </ul>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">Bank Processing</h3>
                <p className="text-gray-300 leading-relaxed">
                  After we process the refund, it may take additional time for your bank or credit card company 
                  to reflect the credit on your account. This typically takes 3-5 business days but can vary by institution.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Cancellation</h2>
                
                <h3 className="text-xl font-medium text-white mb-3">How to Cancel</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You can cancel your Premium subscription at any time:
                </p>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
                  <li>Log in to your Mind Lattice account</li>
                  <li>Go to Settings → Subscription</li>
                  <li>Click "Cancel Subscription"</li>
                  <li>Confirm your cancellation</li>
                </ol>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">What Happens After Cancellation</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>You retain Premium access until the end of your current billing period</li>
                  <li>Your account reverts to Free tier after the period ends</li>
                  <li>Your data and query history remain accessible</li>
                  <li>You can resubscribe at any time</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Exceptions and Limitations</h2>
                
                <h3 className="text-xl font-medium text-white mb-3">No Refunds For:</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Partial month usage</li>
                  <li>Accounts terminated for Terms of Service violations</li>
                  <li>Renewal subscriptions (after the first subscription period)</li>
                  <li>Subscriptions older than 3 days (except as required by law)</li>
                </ul>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">Dispute Resolution</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you believe you've been incorrectly charged or have a billing dispute, 
                  please contact us immediately. We'll work with you to resolve the issue fairly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Free Tier</h2>
                <p className="text-gray-300 leading-relaxed">
                  The Free tier does not involve any payments and therefore is not eligible for refunds. 
                  Free users can upgrade to Premium at any time to access additional features.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Price Changes</h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to change our subscription prices. If we increase prices, 
                  we'll give you at least 30 days notice before the change affects your subscription. 
                  You can cancel before the price change takes effect.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">8. Questions or Concerns</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about our refund policy or need assistance with billing:
                </p>
                
                <div className="bg-[#1A1A1A]/50 rounded-lg p-6 border border-[#333333]">
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-semibold mb-1">Email Support</p>
                      <a href={`mailto:${BRAND.email}`} className="text-[#00FFFF] hover:underline">
                        {BRAND.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Response Time</p>
                      <p className="text-gray-300">We typically respond within 24 hours</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">9. Legal Rights</h2>
                <p className="text-gray-300 leading-relaxed">
                  This refund policy does not limit any legal rights you may have under applicable consumer protection laws. 
                  Some jurisdictions provide additional rights regarding refunds and cancellations.
                </p>
              </section>

              <div className="mt-12 pt-8 border-t border-[#333333]">
                <div className="bg-[#252525]/50 rounded-lg p-6 text-center">
                  <p className="text-white font-semibold mb-2">Our Commitment</p>
                  <p className="text-gray-300">
                    We're committed to your satisfaction. If you're not happy with Mind Lattice, 
                    we want to make it right.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Refunds;