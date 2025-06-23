// src/pages/ExampleDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from '../components/BackgroundAnimation';
import ResultsSection from '../components/Dashboard/ResultsSection';
import SEO from '../components/SEO';
import { 
  ChevronLeft, 
  Clock, 
  Share2, 
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';
import { LatticeInsightResponse } from '../components/Dashboard/types';

interface ExampleAnalysis {
  id: string;
  slug: string;
  question: string;
  title: string;
  category: string;
  pre_generated_analysis: LatticeInsightResponse;
  view_count: number;
}

const ExampleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [example, setExample] = useState<ExampleAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedExamples, setRelatedExamples] = useState<ExampleAnalysis[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchExample();
      incrementViewCount();
    }
  }, [slug]);

  const fetchExample = async () => {
    try {
      // Fetch the main example
      const { data, error } = await supabase
        .from('example_analyses')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      if (data) {
        setExample(data);
        
        // Fetch related examples from the same category
        const { data: related } = await supabase
          .from('example_analyses')
          .select('id, slug, question, title, category')
          .eq('category', data.category)
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(3);
          
        setRelatedExamples(related || []);
      }
    } catch (error) {
      console.error('Error fetching example:', error);
      navigate('/examples');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_example_view_count', { example_slug: slug });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: example?.title,
          text: example?.question,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleTryYourOwn = () => {
    if (user) {
      // Navigate to dashboard with the question pre-filled
      navigate('/dashboard', { state: { prefilledQuestion: example?.question } });
    } else {
      navigate('/signup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
      </div>
    );
  }

  if (!example) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <SEO
        title={`${example.title} - Mind Lattice Analysis`}
        description={example.question}
        keywords={`${example.category} analysis, mental models example, cognitive bias example`}
        url={`/examples/${slug}`}
      />
      
      <BackgroundAnimation />
      
      <div className="relative z-10 pt-24 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 max-w-6xl mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-gray-400"
          >
            <Link to="/examples" className="hover:text-[#00FFFF] transition-colors">
              Examples
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-gray-300">{example.title}</span>
          </motion.div>
        </div>

        {/* Header Section */}
        <div className="container mx-auto px-4 max-w-6xl mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#00FFFF]/10 to-[#8B5CF6]/10 border border-[#00FFFF]/30 rounded-xl p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{example.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="capitalize">{example.category}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {example.view_count} views
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-lg transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  {copySuccess ? 'Copied!' : 'Share'}
                </button>
                
                <button
                  onClick={handleTryYourOwn}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="h-4 w-4" />
                  Try Your Own
                </button>
              </div>
            </div>

            <div className="bg-[#1A1A1A]/50 rounded-lg p-4">
              <p className="text-lg text-gray-200">"{example.question}"</p>
            </div>
          </motion.div>
        </div>

        {/* Analysis Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ResultsSection
            results={example.pre_generated_analysis}
            query={example.question}
            displayTier="premium"
            onResetQuery={() => navigate('/examples')}
            isExampleView={true}
          />
        </motion.div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 max-w-6xl mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#252525] to-[#1F1F1F] border border-[#333333] rounded-xl p-8 text-center"
          >
            <Sparkles className="h-12 w-12 text-[#00FFFF] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              Ready to Analyze Your Own Questions?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              This example shows our premium analysis quality. Get personalized insights for your specific situations.
            </p>
            
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg"
              >
                Go to Dashboard <ArrowRight className="inline h-5 w-5 ml-2" />
              </button>
            ) : (
              <div>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] text-black font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-lg mb-3"
                >
                  Sign Up Now <ArrowRight className="inline h-5 w-5 ml-2" />
                </button>
                <p className="text-sm text-gray-400">
                  3 free analyses daily • No credit card required
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Examples */}
        {relatedExamples.length > 0 && (
          <div className="container mx-auto px-4 max-w-6xl mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold mb-6">Related Examples</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedExamples.map((related) => (
                  <Link
                    key={related.id}
                    to={`/examples/${related.slug}`}
                    className="block bg-[#252525] hover:bg-[#2A2A2A] border border-[#333333] rounded-lg p-6 transition-all hover:border-[#00FFFF]/30"
                  >
                    <h4 className="font-semibold mb-2 text-[#00FFFF]">{related.title}</h4>
                    <p className="text-gray-300 text-sm line-clamp-2">"{related.question}"</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExampleDetail;