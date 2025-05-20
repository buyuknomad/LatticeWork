import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  delay: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, name, role, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className="bg-[#252525] rounded-lg p-6 border border-[#333333] transition-all duration-300 hover:border-[#00FFFF]/30 relative overflow-hidden group"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#00FFFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <p className="text-gray-300 mb-6 italic">"{quote}"</p>
      
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div className="ml-3">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 border border-[#00FFFF]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      quote: "This platform completely transformed how I approach complex decisions. The mental models have given me a structured way to think through problems.",
      name: "Alex Chen",
      role: "Product Manager"
    },
    {
      quote: "I've integrated these mental models into my daily workflow, and it's been revolutionary. My team now solves problems in half the time.",
      name: "Sarah Johnson",
      role: "Design Director"
    },
    {
      quote: "The personalized recommendations helped me overcome chronic indecision. Now I have a toolkit for any situation I encounter.",
      name: "Michael Rodriguez",
      role: "Entrepreneur"
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-[#1F1F1F]" id="testimonials">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Minds{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              Transformed
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            See how our platform has helped others enhance their decision-making abilities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              delay={index * 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;