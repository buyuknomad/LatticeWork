// src/pages/Terms.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { BRAND } from '../constants/brand';
import SEO from '../components/SEO';

const Terms: React.FC = () => {
  return (
    <>
      <SEO
        title="Terms of Service - Mind Lattice Usage Agreement"
        description="Terms of Service for Mind Lattice. Understand your rights and responsibilities when using our mental models and cognitive bias analysis platform."
        keywords="mind lattice terms of service, usage agreement, terms and conditions"
        url="/terms"
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
                  <FileText className="h-8 w-8 text-[#00FFFF]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
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
                  <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
                  <p className="text-gray-300 leading-relaxed">
                    By accessing or using Mind Lattice ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                    If you disagree with any part of these terms, you do not have permission to access the Service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                  <p className="text-gray-300 leading-relaxed mb-3">Mind Lattice provides:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Mental model and cognitive bias recommendations</li>
                    <li>Pattern analysis tools</li>
                    <li>AI-powered insights for decision-making</li>
                    <li>Educational content about thinking frameworks</li>
                  </ul>
                  <p className="text-gray-300 leading-relaxed mt-3">
                    The Service is provided on both free and paid subscription basis.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
                  
                  <h3 className="text-xl font-medium text-white mb-3">3.1 Account Creation</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>You must be at least 16 years old to use this Service</li>
                    <li>One person or legal entity may not maintain more than one free account</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-white mb-3 mt-4">3.2 Account Responsibilities</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">You are responsible for:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Maintaining the confidentiality of your account</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payment Terms</h2>
                  
                  <h3 className="text-xl font-medium text-white mb-3">4.1 Free Tier</h3>
  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
    <li>Limited to 3 analyses per day (2 trending + 1 custom)</li>
    <li>Premium quality on first trending analysis</li>
    <li>Access to basic features as described on our pricing page</li>
    <li>Subject to fair use policies</li>
  </ul>
                  
                  <h3 className="text-xl font-medium text-white mb-3 mt-4">4.2 Premium Subscription</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Billed monthly at $9.99 USD (prices subject to change)</li>
                    <li>Automatic renewal unless cancelled</li>
                    <li>Prices exclude applicable taxes</li>
                     <li>Subject to fair use policies</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-white mb-3 mt-4">4.3 Billing</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Payment processed through Stripe</li>
                    <li>You authorize us to charge your payment method on a recurring basis</li>
                    <li>No refunds for partial months</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Cancellation and Refund Policy</h2>
                  
                  <h3 className="text-xl font-medium text-white mb-3">5.1 Cancellation</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Cancel anytime through your account settings</li>
                    <li>Cancellation takes effect at the end of the current billing period</li>
                    <li>You retain access to Premium features until period ends</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-white mb-3 mt-4">5.2 Refunds</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>3-day money-back guarantee for first-time Premium subscribers</li>
                    <li>No refunds after 3 days except as required by law</li>
                    <li>Refunds processed within 5-10 business days</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property Rights</h2>
                  
                  <h3 className="text-xl font-medium text-white mb-3">6.1 Our Content</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    All content provided through Mind Lattice, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Mental model descriptions</li>
                    <li>Analysis algorithms</li>
                    <li>Website design and graphics</li>
                    <li>Educational content</li>
                  </ul>
                  <p className="text-gray-300 leading-relaxed mt-3">
                    Is owned by Mind Lattice and protected by intellectual property laws.
                  </p>
                  
                  <h3 className="text-xl font-medium text-white mb-3 mt-4">6.2 Your Content</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>You retain ownership of your queries and personal data</li>
                    <li>You grant us license to process your queries to provide the Service</li>
                    <li>We may use anonymized, aggregated data to improve our Service</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy and Data Protection</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Your use of our Service is also governed by our Privacy Policy. By using Mind Lattice, 
                    you consent to our collection and use of data as outlined in the Privacy Policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">8. Acceptable Use Policy</h2>
                  <p className="text-gray-300 leading-relaxed mb-3">You agree NOT to:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Use the Service for any illegal purposes</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the Service</li>
                    <li>Use automated systems or software to extract data</li>
                    <li>Resell or redistribute our Service without permission</li>
                    <li>Use the Service to harass, abuse, or harm others</li>
                    <li>Upload malicious code or viruses</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimers</h2>
                  
                  <h3 className="text-xl font-medium text-white mb-3">9.1 Service Disclaimer</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Mind Lattice provides educational and analytical tools</li>
                    <li>We are NOT providing professional psychological, medical, financial, or legal advice</li>
                    <li>The Service is provided "as is" without warranties</li>
                    <li>We do not guarantee specific outcomes from using our tools</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-white mb-3 mt-4">9.2 AI-Generated Content</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Our AI may produce inaccurate or biased information</li>
                    <li>Always verify important decisions with qualified professionals</li>
                    <li>We are not responsible for decisions made based on our analysis</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
                  <p className="text-gray-300 leading-relaxed mb-3">To the maximum extent permitted by law:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Mind Lattice shall not be liable for any indirect, incidental, or consequential damages</li>
                    <li>Our total liability shall not exceed the amount paid by you in the past 12 months</li>
                    <li>Some jurisdictions do not allow these limitations, so they may not apply to you</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">11. Indemnification</h2>
                  <p className="text-gray-300 leading-relaxed mb-3">
                    You agree to defend, indemnify, and hold harmless Mind Lattice from any claims, damages, or expenses arising from:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
                  <p className="text-gray-300 leading-relaxed mb-3">
                    We reserve the right to modify these terms at any time. We will notify users of material changes via:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Email notification</li>
                    <li>Prominent notice on our website</li>
                    <li>In-app notification</li>
                  </ul>
                  <p className="text-gray-300 leading-relaxed mt-3">
                    Continued use after changes constitutes acceptance of new terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">13. Termination</h2>
                  <p className="text-gray-300 leading-relaxed mb-3">
                    We may terminate or suspend your account immediately, without notice, for:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>Violation of these Terms</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Non-payment (for Premium accounts)</li>
                  </ul>
                  <p className="text-gray-300 leading-relaxed mt-3">
                    Upon termination, your right to use the Service ceases immediately.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    For questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                    <p className="text-white font-semibold mb-2">Mind Lattice</p>
                    <p className="text-gray-300">Email: <a href={`mailto:${BRAND.email}`} className="text-[#00FFFF] hover:underline">{BRAND.email}</a></p>
                  </div>
                </section>

                <div className="mt-12 pt-8 border-t border-[#333333]">
                  <p className="text-gray-400 text-center">
                    By using Mind Lattice, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;