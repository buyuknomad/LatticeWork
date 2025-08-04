// src/components/MentalModelsGuide/BenefitsSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  TrendingUp, 
  Shield, 
  Lightbulb, 
  Target, 
  Brain,
  Clock,
  Eye
} from 'lucide-react';

const BenefitsSection: React.FC = () => {
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
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Enhanced Decision-Making",
      description: "Make wiser decisions by weighing options thoroughly and considering various outcomes and potential consequences.",
      color: "text-[#00FFFF]",
      bgColor: "bg-[#00FFFF]/10"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Improved Problem-Solving", 
      description: "Structure your approach systematically and gain fresh insights into challenging situations with tested frameworks.",
      color: "text-[#FFB84D]",
      bgColor: "bg-[#FFB84D]/10"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Reduced Blind Spots",
      description: "Uncover essential information that may have been overlooked by viewing situations from multiple perspectives.",
      color: "text-[#8B5CF6]",
      bgColor: "bg-[#8B5CF6]/10"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Better Understanding",
      description: "Develop a deeper comprehension of how systems, relationships, and markets function in the real world.",
      color: "text-[#10B981]",
      bgColor: "bg-[#10B981]/10"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Faster Decisions",
      description: "Speed up decision-making by using proven frameworks instead of starting from scratch every time.",
      color: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Risk Mitigation",
      description: "Identify potential pitfalls and mitigate risks proactively by understanding common failure patterns.",
      color: "text-[#EF4444]",
      bgColor: "bg-[#EF4444]/10"
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
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold">Why Mental Models Matter</h2>
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Mental models provide concrete advantages that compound over time, helping you make better decisions 
            and understand complex situations more clearly.
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#252525] rounded-xl p-6 border border-[#333333] hover:border-opacity-50 hover:border-[#00FFFF] transition-all duration-300"
            >
              <div className={`${benefit.bgColor} ${benefit.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Success Story */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-gradient-to-r from-[#252525] to-[#1A1A1A] rounded-2xl p-8 border border-[#333333]"
        >
          <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-[#00FFFF] mr-3" />
                <h3 className="text-2xl font-bold">Real Impact</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Warren Buffett and Charlie Munger built Berkshire Hathaway into a $600+ billion company 
                by consistently applying mental models like:
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#00FFFF] rounded-full mr-3"></div>
                  <span className="text-gray-300"><strong className="text-white">Circle of Competence:</strong> Only investing in businesses they understand</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#00FFFF] rounded-full mr-3"></div>
                  <span className="text-gray-300"><strong className="text-white">Margin of Safety:</strong> Buying undervalued assets to limit downside risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#00FFFF] rounded-full mr-3"></div>
                  <span className="text-gray-300"><strong className="text-white">Compound Interest:</strong> Letting profits reinvest over long periods</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-[#00FFFF] mb-2">50+ Years</div>
                <p className="text-gray-400">of consistent outperformance</p>
              </div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-[#10B981] mb-2">20%</div>
                <p className="text-gray-400">average annual returns vs 10% market average</p>
              </div>
              <p className="text-sm text-gray-400 text-center italic">
                "The difference between good and great investors is their mental models."
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Call to Action Preview */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <div className="bg-[#252525] rounded-xl p-8 border border-[#333333] max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your Mental Toolkit?</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Our library contains 298+ mental models, each with real-world examples, practical applications, 
              and clear explanations of when and how to use them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#real-world-examples"
                className="px-6 py-3 border border-[#00FFFF] text-[#00FFFF] rounded-lg hover:bg-[#00FFFF] hover:text-black transition-colors duration-200"
              >
                See Examples First
              </a>
              <a
                href="/mental-models"
                className="px-6 py-3 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
              >
                Explore the Library
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;