// src/pages/MentalModels/MentalModelDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Book, 
  Lightbulb, 
  AlertTriangle, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  Clock,
  Tag
} from 'lucide-react';
import { MentalModel, RelatedModel } from '../../types/mentalModels';

const MentalModelDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [model, setModel] = useState<MentalModel | null>(null);
  const [relatedModels, setRelatedModels] = useState<RelatedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['explanation']));

  // Mock data for now - will replace with real data in Step 2
  const mockModel: MentalModel = {
    id: '1',
    name: 'First Principles Thinking',
    slug: 'first-principles-thinking',
    category: 'fundamental-concepts',
    core_concept: 'Break down complex problems into their most basic, foundational elements to build understanding from the ground up.',
    detailed_explanation: 'First principles thinking is the practice of actively questioning every assumption you think you know about a given problem or scenario and then creating new knowledge and solutions from scratch. Rather than reasoning by analogy or building on top of existing solutions, first principles thinking requires you to break down complex problems into their most basic, foundational elements and rebuild from there.\n\nThis approach was famously used by Aristotle, who called it reasoning from "first principles" - the basic building blocks that cannot be deduced any further. In modern times, entrepreneurs like Elon Musk have popularized this approach for breakthrough innovation. The process involves identifying and examining the basic elements of a situation, questioning conventional wisdom, and reconstructing solutions from the ground up.',
    expanded_examples: [
      {
        title: 'SpaceX Rocket Cost Reduction',
        content: 'When Elon Musk wanted to reduce space travel costs, instead of accepting the conventional wisdom that rockets must cost hundreds of millions of dollars, he broke down the problem to first principles. He examined the raw materials needed to build a rocket: aluminum alloys, titanium, carbon fiber, and fuel. The material costs totaled only about 2% of a typical rocket\'s price. This analysis revealed that the high costs came from traditional aerospace manufacturing and supply chain practices, not fundamental physics or material constraints. By rebuilding the manufacturing process from scratch with first principles thinking, SpaceX reduced launch costs by over 90%.'
      },
      {
        title: 'Tesla Battery Innovation',
        content: 'When Tesla needed cheaper batteries for electric vehicles, instead of accepting existing battery prices, Musk applied first principles thinking. He asked: "What are the material constituents of batteries? What is the spot market value of those constituents?" Breaking down lithium-ion batteries to their fundamental materials - cobalt, nickel, aluminum, lithium, and separator materials - revealed the raw materials cost only about $80 per kWh. This was far below the $600 per kWh price Tesla was paying suppliers. This insight led Tesla to develop their own battery production capabilities and innovative battery chemistry, dramatically reducing costs.'
      }
    ],
    use_cases: [
      'Innovation and Product Development: When creating something new, strip away industry assumptions and rebuild from fundamental principles.',
      'Problem Solving: When stuck on a complex problem, deconstruct it into its most basic components. What are the irreducible facts, and what are assumptions that can be challenged?',
      'Learning and Education: Rather than memorizing facts or following procedures, understand the underlying principles that govern a domain. This enables transfer to new situations.',
      'Business Strategy: Question industry best practices and conventional wisdom. What fundamental economic or human psychology principles really drive success?',
      'Personal Decision Making: When facing major life decisions, identify your core values and goals rather than following social expectations or conventional paths.'
    ],
    common_pitfalls: [
      'Surface-Level Analysis: Stopping too early in the deconstruction process and accepting assumptions that could be further broken down.',
      'Ignoring Practical Constraints: Getting so focused on theoretical first principles that you ignore real-world implementation challenges or resource limitations.',
      'Paralysis by Analysis: Becoming so committed to questioning everything that you never move forward with solutions.',
      'Arrogance: Assuming that conventional wisdom is always wrong or that previous thinkers were incompetent. Sometimes existing approaches reflect wisdom gained through experience.'
    ],
    reflection_questions: [
      'What assumptions am I making that I haven\'t actually verified?',
      'If I were designing this solution from scratch with no constraints, what would it look like?',
      'What are the fundamental physics, economics, or human psychology governing this situation?',
      'What would someone with no experience in this domain see that I might miss?',
      'What evidence do I have that the conventional approach is actually the best approach?'
    ],
    related_model_slugs: ['second-order-thinking', 'inversion', 'scientific-method'],
    order_index: 1,
    batch_number: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  const mockRelatedModels: RelatedModel[] = [
    {
      name: 'Second-Order Thinking',
      slug: 'second-order-thinking',
      category: 'fundamental-concepts',
      core_concept: 'Consider not just the immediate effects of a decision, but the consequences of those consequences.'
    },
    {
      name: 'Inversion',
      slug: 'inversion', 
      category: 'fundamental-concepts',
      core_concept: 'Approach problems backwards by considering what you want to avoid rather than what you want to achieve.'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setModel(mockModel);
      setRelatedModels(mockRelatedModels);
      setLoading(false);
    }, 500);
  }, [slug]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded mb-4 w-1/3"></div>
            <div className="h-12 bg-gray-600 rounded mb-6"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded mb-6 w-3/4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Mental Model Not Found</h1>
          <p className="text-gray-400 mb-6">The mental model you're looking for doesn't exist.</p>
          <Link 
            to="/mental-models"
            className="inline-flex items-center px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mental Models
          </Link>
        </div>
      </div>
    );
  }

  const SectionHeader: React.FC<{
    id: string;
    icon: React.ReactNode;
    title: string;
    collapsible?: boolean;
  }> = ({ id, icon, title, collapsible = true }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div 
        className={`flex items-center justify-between mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => toggleSection(id) : undefined}
      >
        <div className="flex items-center">
          {icon}
          <h2 className="text-2xl font-bold ml-3">{title}</h2>
        </div>
        {collapsible && (
          <div className="text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1A1A1A] to-[#252525] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Link 
            to="/mental-models"
            className="inline-flex items-center text-[#00FFFF] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mental Models
          </Link>

          {/* Model Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                {model.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <button className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              {model.name}
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed">
              {model.core_concept}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Detailed Explanation */}
        <section className="mb-12">
          <SectionHeader 
            id="explanation"
            icon={<Book className="w-6 h-6 text-[#00FFFF]" />}
            title="Detailed Explanation"
            collapsible={false}
          />
          <div className="prose prose-invert max-w-none">
            {model.detailed_explanation.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <SectionHeader 
            id="examples"
            icon={<Lightbulb className="w-6 h-6 text-[#FFB84D]" />}
            title="Real-World Examples"
          />
          {expandedSections.has('examples') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {model.expanded_examples.map((example, index) => (
                <div key={index} className="bg-[#252525] rounded-lg p-6 border border-[#333333]">
                  <h3 className="text-xl font-semibold mb-3 text-[#FFB84D]">
                    {example.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {example.content}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <SectionHeader 
            id="use-cases"
            icon={<Tag className="w-6 h-6 text-[#00FFFF]" />}
            title="Use Cases"
          />
          {expandedSections.has('use-cases') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {model.use_cases.map((useCase, index) => (
                <div key={index} className="flex items-start bg-[#252525] rounded-lg p-4 border border-[#333333]">
                  <div className="w-2 h-2 bg-[#00FFFF] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-300 leading-relaxed">
                    {useCase}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Common Pitfalls */}
        <section className="mb-12">
          <SectionHeader 
            id="pitfalls"
            icon={<AlertTriangle className="w-6 h-6 text-[#FFB84D]" />}
            title="Common Pitfalls"
          />
          {expandedSections.has('pitfalls') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {model.common_pitfalls.map((pitfall, index) => (
                <div key={index} className="flex items-start bg-[#252525] rounded-lg p-4 border border-[#FFB84D]/30">
                  <div className="w-2 h-2 bg-[#FFB84D] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <p className="text-gray-300 leading-relaxed">
                    {pitfall}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Reflection Questions */}
        <section className="mb-12">
          <SectionHeader 
            id="questions"
            icon={<HelpCircle className="w-6 h-6 text-[#8B5CF6]" />}
            title="Questions to Ask Yourself"
          />
          {expandedSections.has('questions') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {model.reflection_questions.map((question, index) => (
                <div key={index} className="flex items-start bg-[#252525] rounded-lg p-4 border border-[#8B5CF6]/30">
                  <div className="text-[#8B5CF6] font-bold mr-4 flex-shrink-0">
                    {index + 1}.
                  </div>
                  <p className="text-gray-300 leading-relaxed italic">
                    {question}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Related Models */}
        {relatedModels.length > 0 && (
          <section className="mb-12">
            <SectionHeader 
              id="related"
              icon={<Book className="w-6 h-6 text-[#00FFFF]" />}
              title="Related Mental Models"
              collapsible={false}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedModels.map((relatedModel) => (
                <Link
                  key={relatedModel.slug}
                  to={`/mental-models/${relatedModel.slug}`}
                  className="block bg-[#252525] rounded-lg p-4 border border-[#333333] hover:border-[#00FFFF]/30 transition-all duration-300 group"
                >
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00FFFF] transition-colors">
                    {relatedModel.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {relatedModel.core_concept}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-[#333333]">
          <button className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous Model
          </button>
          <button className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Next Model
            <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalModelDetail;