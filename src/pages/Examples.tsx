// src/pages/Examples.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from '../components/BackgroundAnimation';
import SEO from '../components/SEO';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  Lightbulb, 
  Clock,
  Search,
  Filter,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ExampleAnalysis {
  id: string;
  slug: string;
  question: string;
  title: string;
  category: string;
  view_count: number;
  created_at: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  personal: <Brain className="h-5 w-5" />,
  business: <TrendingUp className="h-5 w-5" />,
  behavioral: <Users className="h-5 w-5" />,
  strategic: <Target className="h-5 w-5" />,
  conceptual: <Lightbulb className="h-5 w-5" />
};

const categoryColors: Record<string, string> = {
  personal: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  business: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  behavioral: 'from-green-500/20 to-green-600/20 border-green-500/30',
  strategic: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  conceptual: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30'
};

const Examples: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examples, setExamples] = useState<ExampleAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const { data, error } = await supabase
        .from('example_analyses')
        .select('id, slug, question, title, category, view_count, created_at')
        .eq('is_active', true)
        .order('view_count', { ascending: false });

      if (error) throw error;
      setExamples(data || []);
    } catch (error) {
      console.error('Error fetching examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExamples = examples.filter(example => {
    const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory;
    const matchesSearch = example.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'personal', 'business', 'behavioral', 'strategic', 'conceptual'];

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <SEO
        title="Example Analyses - See Mind Lattice in Action"
        description="Explore pre-generated analyses showcasing how Mind Lattice reveals mental models and cognitive biases in real-world scenarios."
        keywords="mental models examples, cognitive bias examples, decision analysis examples"
        url="/examples"
      />
      
      <BackgroundAnimation />
      
      <div className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              See{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
                Mind Lattice
              </span>
              {' '}in Action
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Explore real-world analyses that reveal hidden patterns and biases. 
              Each example demonstrates our premium insights before you commit.
            </p>
            
            {/* CTA for non-users */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 border border-[#00FFFF]/30 rounded-xl p-6 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-[#00FFFF]" />
                  <p className="text-lg font-semibold">Try Your Own Question</p>
                </div>
                <p className="text-gray-300 mb-4">
                  Impressed by these examples? Create your free account and get 3 analyses daily.
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Start Free <ArrowRight className="inline h-4 w-4 ml-1" />
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search examples..."
                className="w-full bg-[#252525] text-white pl-10 pr-4 py-3 rounded-lg border border-[#333333] focus:border-[#00FFFF]/50 focus:outline-none"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#00FFFF] text-black'
                      : 'bg-[#252525] text-gray-300 hover:bg-[#333333]'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : (
                    <span className="flex items-center gap-2">
                      {categoryIcons[category]}
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Examples Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredExamples.map((example, index) => (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/examples/${example.slug}`}
                    className="block h-full"
                  >
                    <div className={`
                      h-full p-6 rounded-xl border transition-all duration-300
                      bg-gradient-to-br ${categoryColors[example.category] || categoryColors.conceptual}
                      hover:shadow-lg hover:shadow-[#00FFFF]/10 hover:-translate-y-1
                      group cursor-pointer
                    `}>
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          {categoryIcons[example.category]}
                          <span className="text-gray-300 capitalize">{example.category}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {example.view_count} views
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-[#00FFFF] transition-colors">
                        {example.title}
                      </h3>

                      {/* Question */}
                      <p className="text-gray-300 mb-4 line-clamp-2">
                        "{example.question}"
                      </p>

                      {/* CTA */}
                      <div className="flex items-center text-[#00FFFF] text-sm font-medium group-hover:gap-2 transition-all">
                        View Analysis 
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && filteredExamples.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400 text-lg">No examples found matching your criteria.</p>
            </motion.div>
          )}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Analyze Your Own Questions?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands who use Mind Lattice to understand complex situations and make better decisions.
            </p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg"
            >
              {user ? 'Go to Dashboard' : 'Start Free Trial'}
              <ArrowRight className="inline h-5 w-5 ml-2" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Examples;