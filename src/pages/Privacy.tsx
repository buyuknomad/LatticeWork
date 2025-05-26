// src/pages/Privacy.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';

const Privacy: React.FC = () => {
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
                <Shield className="h-8 w-8 text-[#00FFFF]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
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
                  At Mind Lattice, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-white mb-3">1.1 Information You Provide</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Email address, username, and password</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store card details)</li>
                  <li><strong>Query Data:</strong> Questions and situations you submit for analysis</li>
                  <li><strong>Profile Information:</strong> Optional display name and preferences</li>
                </ul>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">1.2 Information We Collect Automatically</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Features used, query frequency, and interaction patterns</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, and device type</li>
                  <li><strong>Log Data:</strong> IP address, access times, and pages viewed</li>
                  <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-300 leading-relaxed mb-3">We use your information to:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide and maintain our Service</li>
                  <li>Process your queries and deliver personalized insights</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send service-related emails (account confirmation, password resets)</li>
                  <li>Improve our algorithms and recommendation quality</li>
                  <li>Respond to customer support requests</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
                <p className="text-gray-300 leading-relaxed mb-3">We do not sell your personal information. We share your information only in these situations:</p>
                
                <h3 className="text-xl font-medium text-white mb-3">3.1 Service Providers</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                  <li><strong>Stripe:</strong> Payment processing</li>
                  <li><strong>Google Cloud:</strong> AI/ML services (Gemini API)</li>
                  <li><strong>Analytics:</strong> Anonymous usage statistics</li>
                </ul>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">3.2 Legal Requirements</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may disclose information if required by law, court order, or government request.
                </p>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">3.3 Business Transfers</h3>
                <p className="text-gray-300 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                <p className="text-gray-300 leading-relaxed mb-3">We implement security measures to protect your information:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Encryption in transit (HTTPS/SSL)</li>
                  <li>Encryption at rest for sensitive data</li>
                  <li>Regular security audits</li>
                  <li>Limited access to personal information</li>
                  <li>Secure password hashing</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights and Choices</h2>
                
                <h3 className="text-xl font-medium text-white mb-3">5.1 Access and Update</h3>
                <p className="text-gray-300 leading-relaxed">
                  You can access and update your account information through your dashboard settings.
                </p>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">5.2 Data Portability</h3>
                <p className="text-gray-300 leading-relaxed">
                  You can request an export of your data by contacting us at thinkinmodels@gmail.com.
                </p>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">5.3 Deletion</h3>
                <p className="text-gray-300 leading-relaxed">
                  You can request account deletion by contacting us. We'll delete your personal information, 
                  except what we need to retain for legal purposes.
                </p>
                
                <h3 className="text-xl font-medium text-white mb-3 mt-4">5.4 Marketing Communications</h3>
                <p className="text-gray-300 leading-relaxed">
                  You can opt out of marketing emails using the unsubscribe link in any marketing message.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
                <p className="text-gray-300 leading-relaxed mb-3">We use cookies for:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Analytics Cookies:</strong> Understand how users interact with our service</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  You can control cookies through your browser settings, but disabling cookies may limit functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
                <p className="text-gray-300 leading-relaxed">We retain your information for as long as necessary to:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  Query history is retained for your reference but can be deleted upon request.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
                <p className="text-gray-300 leading-relaxed">
                  Mind Lattice is not intended for users under 16 years of age. We do not knowingly collect 
                  information from children under 16. If we learn we've collected information from a child under 16, 
                  we will delete it promptly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your information may be processed in countries other than your own. We ensure appropriate 
                  safeguards are in place for international transfers in compliance with applicable laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">10. California Privacy Rights</h2>
                <p className="text-gray-300 leading-relaxed mb-3">
                  California residents have additional rights under CCPA:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Right to know what personal information we collect</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of sale (we don't sell personal information)</li>
                  <li>Right to non-discrimination for exercising privacy rights</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">11. European Privacy Rights</h2>
                <p className="text-gray-300 leading-relaxed mb-3">
                  If you're in the European Economic Area, you have rights under GDPR including:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to This Policy</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We'll notify you of material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
                  <li>Posting the new policy on this page</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending an email notification for significant changes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-[#1A1A1A]/50 rounded-lg p-4 border border-[#333333]">
                  <p className="text-white font-semibold mb-2">Mind Lattice</p>
                  <p className="text-gray-300">Email: <a href="mailto:thinkinmodels@gmail.com" className="text-[#00FFFF] hover:underline">thinkinmodels@gmail.com</a></p>
                  <p className="text-gray-300 mt-2">Data Protection Officer: <a href="mailto:thinkinmodels@gmail.com" className="text-[#00FFFF] hover:underline">thinkinmodels@gmail.com</a></p>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-[#333333]">
                <p className="text-gray-400 text-center">
                  By using Mind Lattice, you agree to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;