import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  notIncluded,
  buttonText, 
  buttonAction,
  isPrimary = false,
  delay = 0
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className={`rounded-2xl overflow-hidden ${isPrimary ? 'border-2 border-[#00FFFF]' : 'border border-[#333333]'}`}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Card Header */}
      <div className={`p-6 ${isPrimary ? 'bg-gradient-to-r from-[#252525] to-[#2A2A2A]' : 'bg-[#252525]'}`}>
        <h3 className={`text-xl font-bold mb-1 ${isPrimary ? 'text-[#00FFFF]' : 'text-white'}`}>{title}</h3>
        <div className="flex items-end gap-1 mb-3">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Free' && <span className="text-gray-400 mb-1">/month</span>}
        </div>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>

      {/* Card Body */}
      <div className="p-6 bg-[#1F1F1F]">
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-[#00FFFF] flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
          
          {notIncluded && notIncluded.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 opacity-50">
              <X className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-400">{feature}</span>
            </li>
          ))}
        </ul>

        <motion.button
          onClick={buttonAction}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            isPrimary 
              ? 'bg-[#00FFFF] text-[#1A1A1A] hover:bg-[#00FFFF]/90'
              : 'bg-[#2A2A2A] text-white border border-[#333333] hover:border-[#00FFFF]/30'
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {buttonText}
        </motion.button>
      </div>

      {/* Highlight for primary card */}
      {isPrimary && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#00FFFF]/20 -z-10 blur-sm"></div>
      )}
    </motion.div>
  );
};

const Pricing = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleFreeSignup = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };
  
  const handlePremiumSignup = () => {
    if (user) {
      // This would typically navigate to a checkout page
      navigate('/dashboard?upgrade=true');
    } else {
      navigate('/signup?plan=premium');
    }
  };

  return (
    <section className="py-20 md:py-28" id="pricing">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              Thinking Toolkit
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Unlock the power of mental models and cognitive biases at a level that fits your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <PricingCard
            title="Free"
            price="Free"
            description="Perfect for occasional use and getting started with mental models."
            features={[
              "1 query per day",
              "1 mental model and 1 bias per query",
              "Access to 75 models and 40 biases",
              "Basic application guidance"
            ]}
            notIncluded={[
              "Relationship visualization",
              "Advanced thinking depth",
              "Detailed application guidance"
            ]}
            buttonText={user ? "Go to Dashboard" : "Get Started"}
            buttonAction={handleFreeSignup}
            delay={0}
          />

          {/* Premium Tier */}
          <PricingCard
            title="Premium"
            price="$12.99"
            description="For those serious about enhanced decision-making and critical thinking."
            features={[
              "Unlimited queries",
              "3-4 models and 2-3 biases per query",
              "Full access to 300 models and 246 biases",
              "Relationship visualization feature",
              "Advanced thinking depth",
              "Detailed application guidance"
            ]}
            buttonText={user ? "Upgrade Now" : "Start Premium"}
            buttonAction={handlePremiumSignup}
            isPrimary={true}
            delay={0.2}
          />
        </div>

        {/* FAQ section could go here */}
        <div className="mt-20 text-center">
          <p className="text-gray-400">
            Have questions about our pricing? <a href="#" className="text-[#00FFFF] hover:underline">Check our FAQ</a> or <a href="#" className="text-[#00FFFF] hover:underline">contact support</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;