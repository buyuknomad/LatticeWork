// src/components/MentalModelsGuide/RealWorldExamples.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Briefcase, 
  Heart, 
  Lightbulb, 
  ArrowRight, 
  Building,
  TrendingUp,
  Users
} from 'lucide-react';

const RealWorldExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0);

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

  const examples = [
    {
      icon: <Building className="w-8 h-8" />,
      category: "Business Strategy",
      title: "Netflix's Second-Order Thinking",
      model: "Second-Order Thinking",
      description: "While competitors focused on improving DVDs, Netflix thought deeper about what customers really wanted.",
      story: "In 2007, Netflix made a controversial decision that seemed crazy: they invested heavily in streaming while their DVD business was still profitable. Blockbuster and others focused on first-order thinking—'How do we make better DVD stores?' Netflix used second-order thinking: 'What will customers want after DVDs?' They anticipated that internet speeds would improve, content would digitize, and convenience would trump ownership. This deeper thinking led them to dominate streaming before competitors realized DVDs were dying.",
      outcome: "Netflix grew from $1B to $240B+ market cap while Blockbuster went bankrupt.",
      color: "text-[#00FFFF]",
      bgColor: "bg-[#00FFFF]/10"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      category: "Investment", 
      title: "Warren Buffett's Circle of Competence",
      model: "Circle of Competence",
      description: "Buffett only invests in businesses he truly understands, avoiding complex tech stocks for decades.",
      story: "During the dot-com boom of the late 1990s, Warren Buffett was heavily criticized for missing out on tech stocks. While others invested in companies they didn't understand, Buffett stuck to his Circle of Competence—consumer goods, insurance, and simple businesses. He famously said he didn't understand what Microsoft or Intel actually did well enough to value them. When the tech bubble burst in 2000-2002, Buffett's 'boring' stocks held their value while tech investors lost trillions.",
      outcome: "Berkshire Hathaway outperformed the market by staying within Buffett's expertise zone.",
      color: "text-[#10B981]",
      bgColor: "bg-[#10B981]/10"
    },
    {
      icon: <Users className="w-8 h-8" />,
      category: "Leadership",
      title: "Amazon's Inversion Thinking", 
      model: "Inversion",
      description: "Instead of asking 'How do we succeed?', Bezos asked 'How do we avoid failure?' and built accordingly.",
      story: "Jeff Bezos used inversion thinking when building Amazon's culture. Instead of asking 'How do we build the best company?', he asked 'What would make us fail?' This led to Amazon's famous principles like 'Customer Obsession' (don't lose customers to competitors), 'Long-term Thinking' (don't sacrifice future for short-term profits), and 'High Hiring Bar' (don't let bad hires destroy culture). By systematically avoiding failure modes, Amazon built resilient systems that scale.",
      outcome: "Amazon became one of the world's most valuable companies with this failure-prevention mindset.",
      color: "text-[#FFB84D]",
      bgColor: "bg-[#FFB84D]/10"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      category: "Personal Life", 
      title: "The 80/20 Rule in Relationships",
      model: "Pareto Principle (80/20 Rule)",
      description: "Most relationship satisfaction comes from a small number of key behaviors and interactions.",
      story: "Research shows that 80% of relationship satisfaction comes from about 20% of interactions—daily small gestures, how conflicts are handled, and quality time together. Successful couples focus intensively on these high-impact areas rather than trying to be perfect in everything. They prioritize consistent appreciation, constructive conflict resolution, and meaningful connection over trying to optimize every aspect of their relationship.",
      outcome: "Couples who apply the 80/20 rule report higher satisfaction and longer-lasting relationships.",
      color: "text-[#EF4444]",
      bgColor: "bg-[#EF4444]/10"
    }
  ];

  return (
    <section id="real-world-examples" className="py-20 px-4 bg-gradient-to-b from-[#252525] to-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Globe className="w-12 h-12 text-[#00FFFF] mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold">Mental Models in Action</h2>
          </motion.div>
          
          <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            See how successful people and companies use mental models to make breakthrough decisions 
            and avoid common pitfalls.
          </motion.p>
        </motion.div>

        {/* Example Tabs */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {examples.map((example, index) => (
              <motion.button
                key={index}
                variants={fadeInUp}
                onClick={() => setActiveExample(index)}
                className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                  activeExample === index
                    ? 'bg-[#00FFFF] text-black border-[#00FFFF]'
                    : 'bg-[#252525] text-gray-300 border-[#333333] hover:border-[#00FFFF]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {example.icon}
                  <span className="font-medium">{example.category}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Active Example Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeExample}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1A1A1A] rounded-2xl p-8 border border-[#333333]"
            >
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className={`${examples[activeExample].bgColor} ${examples[activeExample].color} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                    {examples[activeExample].icon}
                  </div>
                  
                  <div className="mb-4">
                    <span className={`text-sm font-medium ${examples[activeExample].color}`}>
                      {examples[activeExample].model}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-4">{examples[activeExample].title}</h3>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {examples[activeExample].description}
                  </p>

                  <div className="bg-[#252525] rounded-lg p-4 border border-[#333333]">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="w-5 h-5 text-[#FFB84D] mr-2" />
                      <span className="font-semibold text-[#FFB84D]">Key Insight</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {examples[activeExample].outcome}
                    </p>
                  </div>
                </div>

                <div className="bg-[#252525] rounded-xl p-6">
                  <h4 className="font-semibold mb-4 text-[#00FFFF]">The Full Story</h4>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {examples[activeExample].story}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Key Takeaway */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-[#252525] to-[#1A1A1A] rounded-xl p-8 border border-[#333333] max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <ArrowRight className="w-8 h-8 text-[#00FFFF] mr-3" />
              <h3 className="text-2xl font-bold">The Pattern</h3>
            </div>
            
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              Notice how these successful people didn't just work harder—they thought differently. 
              They used mental models to see opportunities others missed and avoid traps others fell into.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-[#00FFFF] mb-2">1.</div>
                <p className="text-gray-300">Apply the mental model</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#00FFFF] mb-2">2.</div>
                <p className="text-gray-300">See what others miss</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#00FFFF] mb-2">3.</div>
                <p className="text-gray-300">Make better decisions</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RealWorldExamples;