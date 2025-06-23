// src/components/ExamplesSection.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ExamplePreview {
  id: string;
  slug: string;
  question: string;
  title: string;
  category: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  personal: <Brain className="h-5 w-5" />,
  business: <TrendingUp className="h-5 w-5" />,
  behavioral: <Users className="h-5 w-5" />
};

const ExamplesSection: React.FC = () => {
  const [examples, setExamples] = useState<ExamplePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const { data } = await supabase
        .from('example_analyses')
        .select('id, slug, question, title, category')
        .eq('is_active', true)
        .order('view_count', { ascending: false })
        .limit(3);

      if (data) {
        setExamples(data);
      }
    } catch (error) {
      console.error('Error fetching examples:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || examples.length === 0) return null;

  return (
    <section className="py-16 md:py-20" id="examples">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-[#00FFFF]" />
            <span className="text-[#00FFFF] font-medium">SEE IT IN ACTION</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Explore Real{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
              Analysis Examples
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            See how Mind Lattice reveals hidden patterns and biases in everyday situations. 
            Each example showcases our premium insights.
          </p>
        </motion.div>

        {/* Examples Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {examples.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/examples/${example.slug}`}
                className="block h-full bg-gradient-to-br from-[#252525] to-[#1F1F1F] border border-[#333333] rounded-xl p-6 hover:border-[#00FFFF]/30 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  {categoryIcons[example.category]}
                  <span className="capitalize">{example.category}</span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-[#00FFFF] transition-colors">
                  {example.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  "{example.question}"
                </p>
                
                <div className="flex items-center text-[#00FFFF] text-sm font-medium">
                  View Analysis
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA to Examples Page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/examples"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#252525] hover:bg-[#333333] text-white rounded-lg font-medium transition-colors"
          >
            View All Examples
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ExamplesSection;