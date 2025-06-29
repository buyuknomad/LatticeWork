// src/pages/ArchiveQuestionPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Star, Crown,
  AlertCircle, Loader, ExternalLink, Share2, Bookmark,
  ChevronLeft, ChevronRight, Archive, ArrowRight
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from '../components/BackgroundAnimation';
import ResultsSection from '../components/Dashboard/ResultsSection';
import { LatticeInsightResponse, UserTier } from '../components/Dashboard/types';

interface ArchiveQuestion {
  id: string;
  question: string;
  topic_source: string;
  category: string;
  created_at: string;
  updated_at: string;
  click_count: number;
  vote_count: number;
  evergreen_score: number;
  quality_score: number;
  generation_batch_id: string;
  pre_generated_analysis: LatticeInsightResponse | null;
  display_metadata: {
    hasAnalysis: boolean;
    analysisQuality: 'premium' | 'basic';
    complexity: number;
    themes: string[];
    isHot: boolean;
    engagement: number;
    score: number;
  };
  metadata: {
    engagement?: number;
    score?: number;
    isHot?: boolean;
    recency?: string;
    sourceType?: string;
    url?: string;
  };
}

const ArchiveQuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  
  // State
  const [question, setQuestion] = useState<ArchiveQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<UserTier>('free');

  // Set page title
  useEffect(() => {
    if (question) {
      document.title = `${question.question.slice(0, 50)}... | Archive | Mind Lattice`;
    } else {
      document.title = 'Archive Question | Mind Lattice';
    }
  }, [question]);

  // Check user tier
  useEffect(() => {
    if (user?.user_metadata?.tier) {
      setUserTier(user.user_metadata.tier as UserTier);
    }
  }, [user]);

  // Load question
  useEffect(() => {
    if (id && session?.access_token) {
      fetchQuestion();
    }
  }, [id, session?.access_token]);

  const fetchQuestion = async () => {
    if (!id || !session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trending-archive?action=question&id=${id}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Premium subscription required to access archived questions');
        } else if (response.status === 404) {
          setError('Question not found in archive');
        } else {
          throw new Error(data.error || 'Failed to fetch question');
        }
        return;
      }

      setQuestion(data.data);
    } catch (err: any) {
      console.error('Fetch question error:', err);
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      business: '#10B981',
      technology: '#8B5CF6',
      personal: '#F59E0B',
      society: '#3B82F6',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  const getQualityBadge = (qualityScore: number, metadata: any) => {
    if (qualityScore >= 0.8 || metadata.analysisQuality === 'premium') {
      return (
        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#8B5CF6]/20 to-[#8B5CF6]/10 rounded-full border border-[#8B5CF6]/30">
          <Crown className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-sm text-[#8B5CF6] font-medium">Premium Analysis</span>
        </div>
      );
    } else if (qualityScore >= 0.6) {
      return (
        <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/30">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-400 font-medium">High Quality</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 rounded-full border border-gray-500/30">
        <span className="text-sm text-gray-400 font-medium">Standard Quality</span>
      </div>
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleShare = async () => {
    if (navigator.share && question) {
      try {
        await navigator.share({
          title: 'Mind Lattice Archive Question',
          text: question.question,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Premium check for free users
  if (userTier === 'free') {
    return (
      <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
        <BackgroundAnimation />
        
        <div className="relative z-10 min-h-screen">
          <div className="pt-20 pb-8 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <Link 
                  to="/archive"
                  className="p-2 hover:bg-[#333333]/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Archive Question</h1>
                  <p className="text-gray-400 mt-1">Premium access required</p>
                </div>
              </motion.div>

              {/* Premium Required */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#8B5CF6]/5 rounded-2xl p-8 border border-[#8B5CF6]/30 text-center"
              >
                <Archive className="w-16 h-16 text-[#8B5CF6] mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-3">
                  Premium Archive Access Required
                </h2>
                <p className="text-gray-300 mb-6">
                  This archived question and its full analysis are available to premium subscribers only.
                </p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-lg text-white font-medium hover:from-[#7C3AED] hover:to-[#8B5CF6] transition-all"
                >
                  Upgrade to Premium
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative z-10 min-h-screen">
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center gap-4">
                <Link 
                  to="/archive"
                  className="flex items-center gap-2 p-2 hover:bg-[#333333]/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm">Back to Archive</span>
                </Link>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-[#252525]/50 hover:bg-[#252525]/80 border border-[#333333] rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-[#252525]/50 hover:bg-[#252525]/80 border border-[#333333] rounded-lg transition-colors text-gray-400 hover:text-white">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-sm">Save</span>
                </button>
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Loader className="w-8 h-8 text-[#00FFFF] animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading archived question...</p>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-1">Error Loading Question</h3>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Question Content */}
            {question && !loading && !error && (
              <div className="space-y-8">
                {/* Question Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#252525]/50 rounded-2xl p-6 md:p-8 border border-[#333333]/50"
                >
                  {/* Category and Quality */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span 
                      className="text-sm px-3 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: `${getCategoryColor(question.category)}20`,
                        color: getCategoryColor(question.category),
                        border: `1px solid ${getCategoryColor(question.category)}30`
                      }}
                    >
                      {question.category}
                    </span>
                    
                    {getQualityBadge(question.quality_score, question.display_metadata)}
                    
                    {question.metadata?.isHot && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30">
                        <span className="text-sm text-orange-400 font-medium">🔥 Hot Topic</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 px-3 py-1 bg-[#333333]/50 rounded-full">
                      <Archive className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">Archived</span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
                    {question.question}
                  </h1>

                  {/* Source and Dates */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 border-t border-[#333333]/50 pt-6">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Source: {question.topic_source}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Trending: {new Date(question.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Archived: {new Date(question.updated_at).toLocaleDateString()}</span>
                    </div>

                    {question.metadata?.url && (
                      <a 
                        href={question.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#00FFFF] hover:text-[#00FFFF]/80 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Original</span>
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* Analysis Section */}
                {question.pre_generated_analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-3">
                        <Archive className="w-6 h-6 text-[#00FFFF]" />
                        Archived Analysis
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#333333]/50 rounded-full">
                          <span className="text-xs text-gray-400">
                            Generated {new Date(question.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </h2>
                      <p className="text-gray-400 text-sm">
                        This analysis was generated when the question was trending and has been preserved in the archive.
                      </p>
                    </div>
                    
                    <ResultsSection
                      results={question.pre_generated_analysis}
                      query={question.question}
                      displayTier={userTier}
                      onResetQuery={() => navigate('/archive')}
                    />
                  </motion.div>
                )}

                {/* No Analysis Available */}
                {!question.pre_generated_analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#252525]/50 rounded-2xl p-8 border border-[#333333]/50 text-center"
                  >
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No Analysis Available</h3>
                    <p className="text-gray-500 mb-6">
                      This question was archived before analysis was generated. You can create a new analysis by asking this question again.
                    </p>
                    <Link
                      to={`/dashboard?q=${encodeURIComponent(question.question)}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 border border-[#00FFFF]/30 rounded-lg text-[#00FFFF] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Analyze This Question
                    </Link>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveQuestionPage;