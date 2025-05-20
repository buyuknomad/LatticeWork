import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpen, Lightbulb, Map, AlertTriangle, Filter, Shield } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  type?: 'model' | 'bias';
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay, type = 'model' }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Determine border and glow color based on type
  const borderColor = type === 'model' ? 'border-[#00FFFF]/50' : 'border-[#FFBB00]/50';
  const iconColor = type === 'model' ? 'text-[#00FFFF]' : 'text-[#FFBB00]';
  const glowColor = type === 'model' ? 'from-[#00FFFF]/5' : 'from-[#FFBB00]/5';

  return (
    <motion.div
      ref={ref}
      className={`bg-[#252525] rounded-lg p-6 border border-[#333333] transition-all duration-300 hover:${borderColor} relative overflow-hidden group`}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className={`${iconColor} mb-4`}>{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>

      {/* Glowing border effect */}
      <div className={`absolute inset-0 border ${borderColor} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </motion.div>
  );
};

const Features = () => {
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [biasesRef, biasesInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const modelFeatures = [
    {
      icon: <BookOpen size={28} />,
      title: "Vast Library of Mental Models",
      description: "Access a comprehensive collection of 300+ frameworks to enhance your thinking and decision-making capabilities."
    },
    {
      icon: <Lightbulb size={28} />,
      title: "AI-Powered Recommendations",
      description: "Get tailored suggestions to tackle your unique challenges based on proven mental models and frameworks."
    },
    {
      icon: <Map size={28} />,
      title: "Personalized Learning Path",
      description: "Build a custom journey to master mental models that align with your specific goals and thinking style."
    }
  ];

  const biasFeatures = [
    {
      icon: <AlertTriangle size={28} />,
      title: "Cognitive Bias Library",
      description: "Discover and understand 246 cognitive biases that affect decision making across 9 key categories."
    },
    {
      icon: <Filter size={28} />,
      title: "Bias Recognition Patterns",
      description: "Learn to identify the subtle cues that signal when a cognitive bias might be affecting your judgment."
    },
    {
      icon: <Shield size={28} />,
      title: "Bias Mitigation Strategies",
      description: "Practice proven techniques to counter the effects of cognitive biases when making important decisions."
    }
  ];

  return (
    <>
      {/* Mental Models Section */}
      <section className="py-20 md:py-28" id="features">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            ref={featuresRef}
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tools for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                Clear Thinking
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Our platform provides everything you need to navigate complex problems with confidence and clarity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {modelFeatures.map((feature, index) => (
              <Feature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.2}
                type="model"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Biases & Fallacies Section */}
      <section className="py-20 md:py-28 bg-[#1F1F1F]" id="biases-fallacies">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            ref={biasesRef}
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={biasesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Recognize{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFBB00] to-[#FF8A00]">
                Biases & Fallacies
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Understand the hidden thinking traps that lead even smart people astray, and learn strategies to overcome them.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {biasFeatures.map((feature, index) => (
              <Feature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.2}
                type="bias"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28" id="benefits">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Transform{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                Your Thinking
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Experience powerful benefits when you apply the right mental models and avoid cognitive pitfalls.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Better Decisions",
                description: "Make choices with greater confidence using frameworks proven to improve decision quality"
              },
              {
                title: "Clearer Communication",
                description: "Express complex ideas more effectively by using shared mental models as reference points"
              },
              {
                title: "Improved Creativity",
                description: "Break through conventional thinking patterns to discover innovative solutions"
              },
              {
                title: "Reduced Errors",
                description: "Avoid the common pitfalls and biases that lead to systematic mistakes in judgment"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-[#252525] rounded-lg p-5 border border-[#333333] hover:border-[#8B5CF6]/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;