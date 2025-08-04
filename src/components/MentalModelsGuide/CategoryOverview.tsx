// src/components/MentalModelsGuide/CategoryOverview.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Users, 
  Microscope, 
  Settings, 
  Shield, 
  Heart,
  ArrowRight
} from 'lucide-react';

const CategoryOverview: React.FC = () => {
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

  const categories = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Fundamental Thinking",
      description: "Core frameworks like First Principles, Systems Thinking, and Inversion that form the foundation of clear reasoning.",
      examples: ["First Principles", "Systems Thinking", "Second-Order Thinking"],
      color: "text-[#00FFFF]",
      bgColor: "bg-[#00FFFF]/10",
      borderColor: "border-[#00FFFF]/30"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Decision Making",
      description: "Tools for making better choices under uncertainty, including probability, risk assessment, and decision trees.",
      examples: ["Probabilistic Thinking", "Expected Value", "Decision Trees"], 
      color: "text-[#10B981]",
      bgColor: "bg-[#10B981]/10",
      borderColor: "border-[#10B981]/30"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Business & Strategy", 
      description: "Competitive dynamics, market forces, and strategic frameworks used by successful companies and investors.",
      examples: ["Competitive Moats", "Network Effects", "Economies of Scale"],
      color: "text-[#8B5CF6]",
      bgColor: "bg-[#8B5CF6]/10", 
      borderColor: "border-[#8B5CF6]/30"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Psychology & Biases",
      description: "Understanding human behavior, cognitive biases, and the psychological traps that lead to poor decisions.",
      examples: ["Confirmation Bias", "Anchoring", "Loss Aversion"],
      color: "text-[#EF4444]",
      bgColor: "bg-[#EF4444]/10",
      borderColor: "border-[#EF4444]/30"
    },
    {
      icon: <Microscope className="w-8 h-8" />,
      title: "Science & Analysis",
      description: "Scientific method, statistical thinking, and analytical frameworks for understanding cause and effect.",
      examples: ["Scientific Method", "Correlation vs Causation", "Statistical Significance"],
      color: "text-[#FFB84D]",
      bgColor: "bg-[#FFB84D]/10",
      borderColor: "border-[#FFB84D]/30"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Systems & Optimization",
      description: "Understanding complex systems, feedback loops, and how to optimize processes and outcomes.",
      examples: ["Feedback Loops", "Bottlenecks", "Pareto Principle"],
      color: "text-[#06B6D4]",
      bgColor: "bg-[#06B6D4]/10",
      borderColor: "border-[#06B6D4]/30"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Social & Group Dynamics",
      description: "How groups behave, social influence, and collective decision-making patterns.",
      examples: ["Social Proof", "Groupthink", "Incentive Structures"],
      color: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10",
      borderColor: "border-[#F59E0B]/30"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Risk & Uncertainty",
      description: "Managing risk, dealing with uncertainty, and preparing for unintended consequences.",
      examples: ["Margin of Safety", "Antifragility", "Black Swan Events"],
      color: "text-[#EC4899]",
      bgColor: "bg-[#EC4899]/10",
      borderColor: "border-[#EC4899]/30"
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <Settings className="w-12 h-12 text-[#00FFFF] mr-3" />
              <h2 className="text-4xl md:text-5xl font-bold">8 Core Categories</h2>
            </div>
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Our mental models are organized into 8 essential categories, making it easy to find the right 
            thinking tool for any situation you encounter.
          </motion.p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`bg-[#252525] rounded-xl p-6 border-2 ${category.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer group`}
            >
              <div className={`${category.bgColor} ${category.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                {category.title}
              </h3>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                {category.description}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Popular models:</h4>
                <div className="flex flex-wrap gap-2">
                  {category.examples.map((example, idx) => (
                    <span 
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${category.bgColor} ${category.color} border ${category.borderColor}`}
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center text-sm font-medium group-hover:text-[#00FFFF] transition-colors">
                <span>Explore Category</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* How to Choose */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-gradient-to-r from-[#252525] to-[#1A1A1A] rounded-2xl p-8 border border-[#333333]"
        >
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">How to Choose the Right Category</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Not sure where to start? Here's how to pick the mental models that will help you most:
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#1A1A1A] rounded-xl p-6 mb-4">
                <Target className="w-12 h-12 text-[#00FFFF] mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">For Better Decisions</h4>
                <p className="text-gray-300 text-sm">
                  Start with <strong>Decision Making</strong> and <strong>Psychology & Biases</strong> 
                  to avoid common traps and make clearer choices.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-[#1A1A1A] rounded-xl p-6 mb-4">
                <TrendingUp className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">For Business Success</h4>
                <p className="text-gray-300 text-sm">
                  Focus on <strong>Business & Strategy</strong> and <strong>Systems & Optimization</strong> 
                  to understand competitive advantages and growth.
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-[#1A1A1A] rounded-xl p-6 mb-4">
                <Brain className="w-12 h-12 text-[#8B5CF6] mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">For Clear Thinking</h4>
                <p className="text-gray-300 text-sm">
                  Begin with <strong>Fundamental Thinking</strong> and <strong>Science & Analysis</strong> 
                  to build a strong foundation for reasoning.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="text-center mt-8">
            <a
              href="/mental-models"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Browse All Categories
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryOverview;