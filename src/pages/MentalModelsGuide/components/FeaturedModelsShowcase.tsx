// src/components/MentalModelsGuide/FeaturedModelsShowcase.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ArrowRight, 
  Clock, 
  Users,
  TrendingUp,
  Lightbulb,
  Target,
  Eye
} from 'lucide-react';

const FeaturedModelsShowcase: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(0);

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

  const featuredModels = [
    {
      icon: <Target className="w-8 h-8" />,
      name: "First Principles Thinking",
      category: "Fundamental Thinking",
      readTime: "8 min",
      difficulty: "Beginner",
      concept: "Break down complex problems into their most basic, foundational elements and rebuild understanding from the ground up.",
      keyInsight: "Question every assumption and build knowledge from fundamental truths rather than analogies or conventions.",
      realWorldExample: {
        title: "Elon Musk's Rocket Revolution",
        description: "Instead of accepting that rockets cost $65M, Musk broke down the raw materials (2% of cost) and redesigned from first principles, reducing costs by 90%."
      },
      whenToUse: "When facing complex problems, challenging industry norms, or when conventional wisdom seems questionable.",
      color: "text-[#00FFFF]",
      bgColor: "bg-[#00FFFF]/10",
      borderColor: "border-[#00FFFF]/30"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      name: "Compound Interest",
      category: "Systems & Optimization", 
      readTime: "6 min",
      difficulty: "Beginner",
      concept: "Small, consistent improvements compound over time to create extraordinary results through the power of exponential growth.",
      keyInsight: "The most powerful force in the universe is compound interest—it applies to money, skills, relationships, and habits.",
      realWorldExample: {
        title: "Warren Buffett's $100B Fortune",
        description: "Buffett made 99% of his wealth after age 50 by consistently earning 20% returns and letting them compound for decades."
      },
      whenToUse: "For long-term planning, habit formation, skill development, and any situation where consistency matters more than intensity.",
      color: "text-[#10B981]",
      bgColor: "bg-[#10B981]/10",
      borderColor: "border-[#10B981]/30"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      name: "Confirmation Bias",
      category: "Psychology & Biases",
      readTime: "7 min", 
      difficulty: "Beginner",
      concept: "The tendency to search for, interpret, and recall information in ways that confirm our pre-existing beliefs while ignoring contradictory evidence.",
      keyInsight: "We don't see the world as it is; we see it as we are. Actively seeking disconfirming evidence is crucial for clear thinking.",
      realWorldExample: {
        title: "Investment Bubbles",
        description: "During the 2008 housing crisis, investors ignored warning signs and focused only on information that supported 'housing always goes up.'"
      },
      whenToUse: "Before making important decisions, when evaluating evidence, or when you find yourself strongly believing something.",
      color: "text-[#EF4444]",
      bgColor: "bg-[#EF4444]/10",
      borderColor: "border-[#EF4444]/30"
    },
    {
      icon: <Users className="w-8 h-8" />,
      name: "Network Effects",
      category: "Business & Strategy",
      readTime: "9 min",
      difficulty: "Intermediate", 
      concept: "A product or service becomes more valuable as more people use it, creating a powerful competitive advantage and barrier to entry.",
      keyInsight: "Winner-take-all markets often result from network effects—the first to reach critical mass becomes nearly impossible to displace.",
      realWorldExample: {
        title: "Facebook's Dominance",
        description: "Facebook became valuable because your friends were there. As more joined, it became even more valuable, making competitors irrelevant."
      },
      whenToUse: "When evaluating business models, understanding market dynamics, or identifying potential monopolies and competitive moats.",
      color: "text-[#8B5CF6]",
      bgColor: "bg-[#8B5CF6]/10",
      borderColor: "border-[#8B5CF6]/30"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#1A1A1A] to-[#252525]">
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
              <Star className="w-12 h-12 text-[#FFB84D] mr-3" />
              <h2 className="text-4xl md:text-5xl font-bold">Most Popular Mental Models</h2>
            </div>
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            These foundational mental models are used by successful people across every field. 
            Master these first, then explore the full library.
          </motion.p>
        </motion.div>

        {/* Model Selection Tabs */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {featuredModels.map((model, index) => (
              <motion.button
                key={index}
                variants={fadeInUp}
                onClick={() => setSelectedModel(index)}
                className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedModel === index
                    ? `${model.borderColor} ${model.bgColor}`
                    : 'bg-[#1A1A1A] border-[#333333] hover:border-[#00FFFF]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${selectedModel === index ? model.color : 'text-gray-400'}`}>
                    {model.icon}
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold ${selectedModel === index ? 'text-white' : 'text-gray-300'}`}>
                      {model.name}
                    </div>
                    <div className="text-sm text-gray-400">{model.category}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Active Model Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedModel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1A1A1A] rounded-2xl p-8 border-2 border-[#333333]"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Model Details */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`${featuredModels[selectedModel].bgColor} ${featuredModels[selectedModel].color} w-16 h-16 rounded-xl flex items-center justify-center`}>
                      {featuredModels[selectedModel].icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{featuredModels[selectedModel].name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredModels[selectedModel].readTime}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          featuredModels[selectedModel].difficulty === 'Beginner' 
                            ? 'bg-[#10B981]/20 text-[#10B981]' 
                            : 'bg-[#FFB84D]/20 text-[#FFB84D]'
                        }`}>
                          {featuredModels[selectedModel].difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-[#00FFFF]">What It Is:</h4>
                      <p className="text-gray-300 leading-relaxed">
                        {featuredModels[selectedModel].concept}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-[#FFB84D]">Key Insight:</h4>
                      <p className="text-gray-300 leading-relaxed">
                        {featuredModels[selectedModel].keyInsight}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-[#8B5CF6]">When to Use:</h4>
                      <p className="text-gray-300 leading-relaxed">
                        {featuredModels[selectedModel].whenToUse}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Real World Example */}
                <div>
                  <div className="bg-[#252525] rounded-xl p-6 h-full border border-[#333333]">
                    <div className="flex items-center mb-4">
                      <Lightbulb className="w-6 h-6 text-[#FFB84D] mr-2" />
                      <h4 className="font-semibold text-[#FFB84D]">Real-World Example</h4>
                    </div>
                    
                    <h5 className="text-xl font-semibold mb-3">
                      {featuredModels[selectedModel].realWorldExample.title}
                    </h5>
                    
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {featuredModels[selectedModel].realWorldExample.description}
                    </p>

                    <div className="flex flex-col gap-3">
                      <a 
                        href="/mental-models"
                        className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold rounded-lg hover:scale-105 transition-transform duration-200"
                      >
                        Read Full Model
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </a>
                      
                      <button className="flex items-center justify-center px-6 py-3 border border-[#333333] text-gray-300 rounded-lg hover:border-[#00FFFF]/50 transition-colors duration-200">
                        View More Examples
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <div className="bg-[#1A1A1A] rounded-xl p-8 border border-[#333333] max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Why Start With Featured Models?</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-[#00FFFF] mb-2">90%</div>
                <p className="text-gray-300">of successful decisions use these core models</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#10B981] mb-2">4</div>
                <p className="text-gray-300">essential models cover most situations</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#FFB84D] mb-2">30 min</div>
                <p className="text-gray-300">to read all four and start applying immediately</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedModelsShowcase;