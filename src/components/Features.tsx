import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpen, Lightbulb, Map } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className="bg-[#252525] rounded-lg p-6 border border-[#333333] transition-all duration-300 hover:border-[#00FFFF]/50 relative overflow-hidden group"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#00FFFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="text-[#00FFFF] mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>

      {/* Glowing border effect */}
      <div className="absolute inset-0 border border-[#00FFFF]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </motion.div>
  );
};

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <BookOpen size={28} />,
      title: "Vast Library of Mental Models",
      description: "Access a comprehensive collection of frameworks to enhance your thinking and decision-making capabilities."
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

  return (
    <section className="py-20 md:py-28" id="features">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
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
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;