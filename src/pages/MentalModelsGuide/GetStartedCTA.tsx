// src/components/MentalModelsGuide/GetStartedCTA.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BookOpen, 
  Target, 
  Zap, 
  CheckCircle,
  Clock,
  Users,
  Star
} from 'lucide-react';

const GetStartedCTA: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const benefits = [
    { icon: <BookOpen className="w-5 h-5" />, text: "298+ mental models with real examples" },
    { icon: <Target className="w-5 h-5" />, text: "Organized by category for easy finding" },
    { icon: <Clock className="w-5 h-5" />, text: "Quick reading times (5-10 minutes each)" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Practical applications for every model" }
  ];

  const pathways = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Quick Start",
      description: "Read the 4 featured models first",
      timeEstimate: "30 minutes",
      color: "text-[#FFB84D]",
      bgColor: "bg-[#FFB84D]/10"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Category Focus",
      description: "Choose one category and master it",
      timeEstimate: "2-3 hours",
      color: "text-[#00FFFF]",
      bgColor: "bg-[#00FFFF]/10"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Complete Library",
      description: "Explore all 298+ models systematically",
      timeEstimate: "Ongoing journey",
      color: "text-[#8B5CF6]",
      bgColor: "bg-[#8B5CF6]/10"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#252525] to-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-6">
              Ready to Think
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] ml-4">
                Better?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Join thousands of people who use mental models to make better decisions, 
              solve complex problems, and understand the world more clearly.
            </p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.a
                href="/mental-models"
                className="px-8 py-4 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-bold text-lg rounded-lg hover:scale-105 transition-transform duration-200 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore 298+ Mental Models
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.a>
              
              <motion.a
                href="#pathways"
                className="px-8 py-4 border-2 border-[#00FFFF] text-[#00FFFF] font-semibold text-lg rounded-lg hover:bg-[#00FFFF] hover:text-black transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Choose Your Path
              </motion.a>
            </motion.div>

            {/* Quick Benefits */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-6 text-sm">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <div className="text-[#00FFFF] mr-2">{benefit.icon}</div>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Learning Pathways */}
        <motion.div
          id="pathways"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Choose Your Learning Path</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Different approaches for different goals. All paths lead to better thinking.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pathways.map((pathway, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333] hover:border-[#00FFFF]/30 transition-all duration-300 text-center"
              >
                <div className={`${pathway.bgColor} ${pathway.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  {pathway.icon}
                </div>
                
                <h4 className="text-xl font-bold mb-3">{pathway.title}</h4>
                <p className="text-gray-300 mb-4 leading-relaxed">{pathway.description}</p>
                
                <div className="text-sm text-gray-400 mb-6">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {pathway.timeEstimate}
                </div>

                <a
                  href="/mental-models"
                  className="inline-flex items-center px-6 py-3 border border-[#333333] text-gray-300 rounded-lg hover:border-[#00FFFF]/50 hover:text-white transition-colors duration-200"
                >
                  Start This Path
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-[#1A1A1A] rounded-2xl p-8 border border-[#333333] text-center"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-[#00FFFF] mr-3" />
              <h3 className="text-2xl font-bold">Join the Mental Models Community</h3>
            </div>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Thousands of professionals, entrepreneurs, and lifelong learners use our mental models 
              library to improve their decision-making and problem-solving skills.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-3xl font-bold text-[#00FFFF] mb-2">10,000+</div>
              <p className="text-gray-400">Active users</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#10B981] mb-2">298+</div>
              <p className="text-gray-400">Mental models</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#FFB84D] mb-2">4.9/5</div>
              <div className="flex items-center justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#FFB84D] fill-current" />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <a
              href="/mental-models"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-bold text-lg rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Start Learning Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </motion.div>
        </motion.div>

        {/* Final Quote */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <blockquote className="text-2xl italic text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6">
            "The best thing a human being can do is to help another human being know more."
          </blockquote>
          <cite className="text-[#00FFFF] text-lg">— Charlie Munger</cite>
        </motion.div>
      </div>
    </section>
  );
};

export default GetStartedCTA;