// src/pages/MentalModels/MentalModelDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
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
import SEO from '../../components/SEO';
import { getMentalModelBySlug, getNavigationModels } from '../../lib/mentalModelsService';
import { formatCategoryName } from '../../lib/mentalModelsUtils';

// ADD THESE IMPORTS
import { useModelTracking } from '../../hooks/useModelTracking';
import { SessionManager } from '../../utils/sessionManager';

const MentalModelDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [model, setModel] = useState<MentalModel | null>(null);
  const [relatedModels, setRelatedModels] = useState<RelatedModel[]>([]);
  const [navigation, setNavigation] = useState<{ previous: any; next: any }>({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['explanation']));

  // ADD ANALYTICS TRACKING
  const { 
    trackInteraction, 
    isTracking, 
    viewDuration,
    sessionId 
  } = useModelTracking(model, {
    enabled: true,
    trackDuration: true,
    trackInteractions: true,
    debug: import.meta.env.DEV // Debug in development
  });

  useEffect(() => {
    if (slug) {
      fetchModelData();
    }
  }, [slug]);

  const fetchModelData = async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { model: fetchedModel, relatedModels: fetchedRelated } = await getMentalModelBySlug(slug);
      
      if (!fetchedModel) {
        setError('Mental model not found');
        return;
      }
      
      setModel(fetchedModel);
      setRelatedModels(fetchedRelated);
      
      // Fetch navigation models
      const navModels = await getNavigationModels(fetchedModel.order_index);
      setNavigation(navModels);
      
    } catch (err) {
      console.error('Error fetching mental model:', err);
      setError('Failed to load mental model. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // TRACK SECTION EXPANSIONS
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
        trackInteraction('section_collapsed', { section: sectionId });
      } else {
        newSet.add(sectionId);
        trackInteraction('section_expanded', { section: sectionId });
      }
      return newSet;
    });
  };

  // TRACK SHARE BUTTON
  const handleShare = async () => {
    trackInteraction('share_clicked', { model: model?.slug });
    
    const url = window.location.href;
    const title = `${model?.name} - Mental Model | Mind Lattice`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: model?.core_concept,
          url
        });
        trackInteraction('share_completed', { method: 'native' });
      } catch (err) {
        // User cancelled or error occurred
        if (err instanceof Error && err.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      trackInteraction('share_completed', { method: 'clipboard' });
      console.log('URL copied to clipboard');
    }).catch(() => {
      console.log('Failed to copy URL');
    });
  };

  // TRACK RELATED MODEL CLICKS
  const handleRelatedModelClick = (relatedModel: RelatedModel) => {
    trackInteraction('related_model_click', { 
      from: model?.slug,
      to: relatedModel.slug 
    });
    
    // Navigate with tracking source
    navigate(`/mental-models/${relatedModel.slug}?ref=related`, {
      state: { from: 'related' }
    });
  };

  // TRACK NAVIGATION CLICKS
  const handleNavigationClick = (targetModel: any, direction: 'previous' | 'next') => {
    trackInteraction('navigation_click', { 
      from: model?.slug,
      to: targetModel.slug,
      direction 
    });
    
    navigate(`/mental-models/${targetModel.slug}?ref=navigation`, {
      state: { from: 'navigation' }
    });
  };

  // SHOW TRACKING STATUS IN DEV MODE
  if (import.meta.env.DEV && model) {
    console.log('📊 Analytics Status:', {
      tracking: isTracking,
      duration: viewDuration,
      session: sessionId,
      model: model.slug
    });
  }

  if (loading) {
    return (
      <>
        <SEO
          title="Loading Mental Model | Mind Lattice"
          description="Loading mental model details..."
          url={`/mental-models/${slug}`}
        />
        <div className="min-h-screen bg-[#1A1A1A] text-white">
          <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
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
      </>
    );
  }

  if (error || !model) {
    return (
      <>
        <SEO
          title="Mental Model Not Found | Mind Lattice"
          description="The mental model you're looking for doesn't exist."
          url={`/mental-models/${slug}`}
        />
        <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {error || 'Mental Model Not Found'}
            </h1>
            <p className="text-gray-400 mb-6">
              {error ? 'Please try again later.' : "The mental model you're looking for doesn't exist."}
            </p>
            <div className="space-x-4">
              <Link 
                to="/mental-models"
                className="inline-flex items-center px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mental Models
              </Link>
              {error && (
                <button
                  onClick={fetchModelData}
                  className="inline-flex items-center px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors border border-[#333333]"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </>
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
    <>
      <SEO
        title={`${model.name} - Mental Model Explained | Mind Lattice`}
        description={`Learn about ${model.name}: ${model.core_concept} Includes real-world examples, use cases, and practical applications.`}
        keywords={`${model.name}, mental model, ${model.category}, thinking framework, decision making`}
        url={`/mental-models/${model.slug}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": model.name,
          "description": model.core_concept,
          "author": {
            "@type": "Organization",
            "name": "Mind Lattice"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Mind Lattice"
          },
          "datePublished": model.created_at,
          "dateModified": model.updated_at
        }}
      />
      
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        {/* Add tracking badge in development */}
        {import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded text-xs z-50">
            Tracking: {viewDuration}s | Session: {sessionId?.slice(0, 8)}
          </div>
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#252525] pt-20 pb-8 px-4">
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
                  {formatCategoryName(model.category)}
                </span>
                <button 
                  onClick={handleShare}
                  className="flex items-center px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
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

          {/* Related Models - Updated with tracking */}
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
                  <motion.button
                    key={relatedModel.slug}
                    onClick={() => handleRelatedModelClick(relatedModel)}
                    className="text-left block bg-[#252525] rounded-lg p-4 border border-[#333333] hover:border-[#00FFFF]/30 transition-all duration-300 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00FFFF] transition-colors">
                      {relatedModel.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {relatedModel.core_concept}
                    </p>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Navigation - Updated with tracking */}
          <div className="flex justify-between items-center pt-8 border-t border-[#333333]">
            {navigation.previous ? (
              <button
                onClick={() => handleNavigationClick(navigation.previous, 'previous')}
                className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors group text-left"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Previous</div>
                  <div className="text-sm">{navigation.previous.name}</div>
                </div>
              </button>
            ) : (
              <div></div>
            )}
            
            {navigation.next ? (
              <button
                onClick={() => handleNavigationClick(navigation.next, 'next')}
                className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors group text-right"
              >
                <div className="text-right">
                  <div className="text-xs text-gray-500">Next</div>
                  <div className="text-sm">{navigation.next.name}</div>
                </div>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MentalModelDetail;