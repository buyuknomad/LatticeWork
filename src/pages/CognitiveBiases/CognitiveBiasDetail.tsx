// src/pages/CognitiveBiases/CognitiveBiasDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  Target,
  Shield,
  HelpCircle,
  BookOpen,
  ExternalLink,
  Eye,
  Info,
  Sparkles,
  Share2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import BackgroundAnimation from '../../components/BackgroundAnimation';
import SEO from '../../components/SEO';
import { 
  getCognitiveBiasByIdentifier,
  getNavigationBiases 
} from '../../lib/cognitiveBiasesService';
import { 
  CognitiveBias,
  RelatedBias,
  getCategoryMetadata
} from '../../types/cognitiveBiases';
import { 
  formatCbId,
  generateBreadcrumbs,
  calculateReadingTime,
  markBiasAsViewed,
  isBiasViewed,
  createBiasShareUrl,
  generateMetaDescription
} from '../../lib/cognitiveBiasesUtils';

const CognitiveBiasDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // State
  const [bias, setBias] = useState<CognitiveBias | null>(null);
  const [relatedBiases, setRelatedBiases] = useState<RelatedBias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<{
    previous: { slug: string; name: string } | null;
    next: { slug: string; name: string } | null;
  }>({ previous: null, next: null });
  const [expandedExample, setExpandedExample] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [viewed, setViewed] = useState(false);

  // Fetch bias data
  useEffect(() => {
    const fetchBias = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await getCognitiveBiasByIdentifier(slug);
        
        // Handle redirect for duplicates
        if (result.redirectTo) {
          navigate(`/cognitive-biases/${result.redirectTo}`, { replace: true });
          return;
        }
        
        if (!result.bias) {
          setError('Bias not found');
          setLoading(false);
          return;
        }
        
        setBias(result.bias);
        setRelatedBiases(result.relatedBiases);
        
        // Mark as viewed
        markBiasAsViewed(result.bias.cb_id);
        setViewed(isBiasViewed(result.bias.cb_id));
        
        // Fetch navigation
        const nav = await getNavigationBiases(result.bias.order_index);
        setNavigation({
          previous: nav.previous ? { slug: nav.previous.slug, name: nav.previous.name } : null,
          next: nav.next ? { slug: nav.next.slug, name: nav.next.name } : null
        });
        
      } catch (err) {
        console.error('Error fetching bias:', err);
        setError('Failed to load bias');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBias();
  }, [slug, navigate]);

  // Share functionality
  const handleShare = async () => {
    if (!bias) return;
    
    const url = createBiasShareUrl(bias.slug);
    const text = `Check out this cognitive bias: ${bias.name} - ${bias.core_concept}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: bias.name, text, url });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate reading time
  const readingTime = bias ? calculateReadingTime(
    bias.detailed_explanation + 
    bias.expanded_examples.map(e => e.content).join(' ')
  ) : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        <div className="relative z-10 pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-[#333333] rounded w-32 mb-8" />
              <div className="h-12 bg-[#333333] rounded w-3/4 mb-4" />
              <div className="h-6 bg-[#333333] rounded w-1/2 mb-8" />
              <div className="space-y-4">
                <div className="h-32 bg-[#333333] rounded" />
                <div className="h-48 bg-[#333333] rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !bias) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        <div className="relative z-10 pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">
              {error || 'Bias Not Found'}
            </h1>
            <p className="text-gray-400 mb-8">
              The cognitive bias you're looking for doesn't exist or has been moved.
            </p>
            <Link
              to="/cognitive-biases"
              className="inline-flex items-center text-amber-400 hover:underline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Cognitive Biases Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryMeta = getCategoryMetadata(bias.category as any);
  const breadcrumbs = generateBreadcrumbs(bias.name, bias.category);

  return (
    <>
      <SEO
        title={`${bias.name} - Cognitive Bias Explained | Mind Lattice`}
        description={generateMetaDescription(bias.name, bias.core_concept)}
        keywords={`${bias.name}, cognitive bias, ${categoryMeta.name}, thinking errors, decision making`}
        url={`/cognitive-biases/${bias.slug}`}
      />

      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        
        <div className="relative z-10 pt-24 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />}
                    {crumb.href === '#' ? (
                      <span className="text-gray-400">{crumb.name}</span>
                    ) : (
                      <Link to={crumb.href} className="text-[#00FFFF] hover:underline">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-mono text-amber-400">
                      {formatCbId(bias.cb_id)}
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: `${categoryMeta.color}20`,
                        color: categoryMeta.color 
                      }}
                    >
                      {categoryMeta.icon} {categoryMeta.name}
                    </span>
                    {viewed && (
                      <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Viewed
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-3">{bias.name}</h1>
                  <p className="text-xl text-gray-300">{bias.core_concept}</p>
                </div>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-[#252525] hover:bg-[#333333] transition-colors"
                  title="Share this bias"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Share2 className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {readingTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Category: {categoryMeta.name}
                </span>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="space-y-8">
              {/* Detailed Explanation */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-xl p-6 border border-[#333333]"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Brain className="h-6 w-6 mr-2 text-amber-400" />
                  Understanding {bias.name}
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {bias.detailed_explanation}
                  </p>
                </div>
              </motion.section>

              {/* Expanded Examples */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-amber-400" />
                  Real-World Examples
                </h2>
                <AnimatePresence>
                  {bias.expanded_examples.map((example, index) => (
                    <motion.div
                      key={index}
                      layout
                      className="bg-[#252525]/50 backdrop-blur-sm rounded-xl border border-[#333333] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedExample(expandedExample === index ? null : index)}
                        className="w-full p-6 text-left hover:bg-[#333333]/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">
                            {example.title}
                          </h3>
                          <ChevronRight 
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              expandedExample === index ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedExample === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 pb-6"
                          >
                            <p className="text-gray-300 leading-relaxed">
                              {example.content}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.section>

              {/* Recognition Strategies */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-xl p-6 border border-[#333333]"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Eye className="h-6 w-6 mr-2 text-amber-400" />
                  How to Recognize This Bias
                </h2>
                <ul className="space-y-3">
                  {bias.recognition_strategies.map((strategy, index) => (
                    <li key={index} className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Mitigation Approaches */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-xl p-6 border border-[#333333]"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-amber-400" />
                  How to Overcome This Bias
                </h2>
                <ul className="space-y-3">
                  {bias.mitigation_approaches.map((approach, index) => (
                    <li key={index} className="flex items-start">
                      <Target className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{approach}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Common Contexts */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-[#252525]/50 backdrop-blur-sm rounded-xl p-6 border border-[#333333]"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Info className="h-6 w-6 mr-2 text-amber-400" />
                  Where You'll Encounter This Bias
                </h2>
                <div className="flex flex-wrap gap-2">
                  {bias.common_contexts.map((context, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[#1A1A1A] rounded-lg text-sm text-gray-300 border border-[#333333]"
                    >
                      {context}
                    </span>
                  ))}
                </div>
              </motion.section>

              {/* Reflection Questions */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-gradient-to-r from-amber-400/10 to-orange-400/10 rounded-xl p-6 border border-amber-400/30"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <HelpCircle className="h-6 w-6 mr-2 text-amber-400" />
                  Questions for Self-Reflection
                </h2>
                <ul className="space-y-3">
                  {bias.reflection_questions.map((question, index) => (
                    <li key={index} className="flex items-start">
                      <Sparkles className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 italic">{question}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Related Biases */}
              {relatedBiases.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Related Biases</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedBiases.map((related) => {
                      const relatedCategoryMeta = getCategoryMetadata(related.category as any);
                      return (
                        <Link
                          key={related.cb_id}
                          to={`/cognitive-biases/${related.slug}`}
                          className="bg-[#252525]/50 backdrop-blur-sm rounded-lg p-4 border border-[#333333] hover:border-amber-400/50 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {related.name}
                            </h3>
                            <span className="text-xs font-mono text-gray-500">
                              {formatCbId(related.cb_id)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {related.core_concept}
                          </p>
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${relatedCategoryMeta.color}20`,
                              color: relatedCategoryMeta.color 
                            }}
                          >
                            {relatedCategoryMeta.icon} {relatedCategoryMeta.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-12 pt-8 border-t border-[#333333]"
            >
              <div className="flex justify-between items-center">
                {navigation.previous ? (
                  <Link
                    to={`/cognitive-biases/${navigation.previous.slug}`}
                    className="flex items-center text-[#00FFFF] hover:underline group"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    <div>
                      <div className="text-xs text-gray-500">Previous</div>
                      <div>{navigation.previous.name}</div>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                
                {navigation.next ? (
                  <Link
                    to={`/cognitive-biases/${navigation.next.slug}`}
                    className="flex items-center text-[#00FFFF] hover:underline group text-right"
                  >
                    <div>
                      <div className="text-xs text-gray-500">Next</div>
                      <div>{navigation.next.name}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-12 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-xl p-8 border border-amber-400/30 text-center"
            >
              <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">
                Ready to Master Your Biases?
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Understanding {bias.name} is just the beginning. Take our comprehensive assessment 
                to discover all the cognitive biases that influence your thinking.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-amber-400 text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-amber-400/90 transition-colors"
              >
                Start Your Assessment
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CognitiveBiasDetail;