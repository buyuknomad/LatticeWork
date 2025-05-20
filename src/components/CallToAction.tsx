import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const CallToAction = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 md:py-28" id="cta">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          className="bg-gradient-to-r from-[#1F1F1F] to-[#252525] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-40 h-40 rounded-full bg-[#00FFFF]/5"
                style={{
                  left: `${10 + i * 20}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Unlock the Power of
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                Clearer Thinking Today
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-10">
              Join thousands who have transformed their decision-making ability and problem-solving skills with our mental model platform.
            </p>
            
            <motion.button
              className="bg-[#00FFFF] text-[#1A1A1A] font-bold py-3 px-10 rounded-lg hover:bg-[#00FFFF]/90 transition-colors duration-300 shadow-lg shadow-[#00FFFF]/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
            
            <p className="mt-6 text-sm text-gray-400">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
          
          {/* Border glow effect */}
          <div className="absolute inset-0 border border-[#00FFFF]/20 rounded-2xl"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;