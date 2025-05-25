// src/pages/History.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  Clock, 
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Menu,
  X,
  TrendingUp,
  Layers,
  Lock,
  Crown,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import BackgroundAnimation from '../components/BackgroundAnimation';
import ToolCard from '../components/Dashboard/ToolCard';
import { RecommendedTool } from '../components/Dashboard/types';

// Types
interface QueryHistoryItem {
  id: string;
  user_id: string;
  created_at: string;
  query_text: string;
  recommended_tools?: RecommendedTool[];
  relationships_summary?: string;
  full_response?: any;
  tier_at_query?: string;
  is_trending?: boolean;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [queries, setQueries] = useState<QueryHistoryItem[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<QueryHistoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get current user tier
  const currentUserTier = user?.user_metadata?.tier || 'free';

  // Process markdown text (same as in ResultsSection)
  const processMarkdown = (text: string): string => {
    if (!text) return text;
    
    let processed = text.replace(/\*\*/g, '%%DOUBLE%%');
    processed = processed.replace(/\*/g, '**');
    processed = processed.replace(/%%DOUBLE%%/g, '**');
    
    return processed;
  };

  // Fetch queries on mount
  useEffect(() => {
    if (user) {
      fetchQueries();
    }
  }, [user, dateFilter]);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('query_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setQueries(data || []);
      
      // Select first query by default if none selected
      if (data && data.length > 0 && !selectedQuery) {
        setSelectedQuery(data[0]);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuery = async (queryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this query?')) return;
    
    try {
      const { error } = await supabase
        .from('query_history')
        .delete()
        .eq('id', queryId);
        
      if (error) throw error;
      
      // Remove from local state
      setQueries(queries.filter(q => q.id !== queryId));
      
      // If deleted query was selected, clear selection
      if (selectedQuery?.id === queryId) {
        setSelectedQuery(null);
      }
    } catch (error) {
      console.error('Error deleting query:', error);
    }
  };

  const handleReanalyze = () => {
    if (selectedQuery) {
      navigate(`/dashboard?q=${encodeURIComponent(selectedQuery.query_text)}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const filteredQueries = queries.filter(query => 
    query.query_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResultsFromQuery = (query: QueryHistoryItem): RecommendedTool[] => {
    if (query.recommended_tools) {
      return query.recommended_tools;
    } else if (query.full_response?.recommendedTools) {
      return query.full_response.recommendedTools;
    }
    return [];
  };

  const getRelationshipsSummary = (query: QueryHistoryItem): string | null => {
    if (query.relationships_summary) {
      return query.relationships_summary;
    } else if (query.full_response?.relationshipsSummary) {
      return query.full_response.relationshipsSummary;
    }
    return null;
  };

  // Check if user can see relationships summary
  const canSeeRelationships = (query: QueryHistoryItem): boolean => {
    // If query was made when user was premium, they can see it
    if (query.tier_at_query === 'premium') return true;
    // If user is currently premium, they can see all relationships
    if (currentUserTier === 'premium') return true;
    // Otherwise, they can't
    return false;
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden">
      {/* Background Animation Layer */}
      <BackgroundAnimation />
      
      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#333333]">
          <h1 className="text-lg font-bold">Query History</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#252525] rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] relative">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Left Sidebar */}
          <div className={`
            fixed md:relative
            w-80 h-full
            bg-[#1F1F1F] border-r border-[#333333]
            flex flex-col
            transition-transform duration-300
            z-50 md:z-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <Link to="/dashboard" className="inline-flex items-center text-[#00FFFF] hover:underline">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
                
                {/* Close button for mobile */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden p-1 hover:bg-[#252525] rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <h1 className="text-xl font-bold mb-4">Query History</h1>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search queries..."
                  className="w-full bg-[#252525] text-white pl-10 pr-4 py-2 rounded-lg border border-[#333333] focus:border-[#00FFFF]/50 focus:outline-none text-sm"
                />
              </div>
              
              {/* Date Filter */}
              <div className="flex items-center gap-2 mt-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="flex-1 bg-[#252525] text-white px-3 py-1 rounded-lg border border-[#333333] focus:border-[#00FFFF]/50 focus:outline-none text-sm"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </div>
            </div>
            
            {/* Query List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FFFF]"></div>
                </div>
              ) : filteredQueries.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  {searchTerm ? 'No queries match your search' : 'No queries yet'}
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredQueries.map((query) => (
                    <motion.div
                      key={query.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 relative group ${
                        selectedQuery?.id === query.id
                          ? 'bg-[#252525] border border-[#00FFFF]/50'
                          : 'hover:bg-[#252525]/50 border border-transparent'
                      }`}
                      onClick={() => {
                        setSelectedQuery(query);
                        // Close sidebar on mobile after selection
                        if (window.innerWidth < 768) {
                          setIsSidebarOpen(false);
                        }
                      }}
                    >
                      <div className="pr-8">
                        {/* Trending Badge */}
                        {query.is_trending && (
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3 text-[#00FFFF]" />
                            <span className="text-xs text-[#00FFFF] font-medium">Trending</span>
                          </div>
                        )}
                        
                        <p className="text-sm text-white line-clamp-2 mb-1">
                          {query.query_text}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(query.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteQuery(query.id, e)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {selectedQuery ? (
              <div className="p-4 md:p-8">
                {/* Query Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedQuery.created_at).toLocaleString()}</span>
                      </div>
                      
                      {selectedQuery.is_trending && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#00FFFF]/10 rounded-full">
                          <TrendingUp className="h-3 w-3 text-[#00FFFF]" />
                          <span className="text-xs text-[#00FFFF] font-medium">Trending Query</span>
                        </div>
                      )}
                    </div>
                    
                    <motion.button
                      onClick={handleReanalyze}
                      className="flex items-center gap-2 px-4 py-2 bg-[#252525] border border-[#00FFFF]/30 rounded-lg text-sm hover:border-[#00FFFF]/50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RefreshCw className="h-4 w-4 text-[#00FFFF]" />
                      <span>Re-analyze</span>
                    </motion.button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Query:</h2>
                  <p className="text-lg text-gray-300 bg-[#252525]/50 p-4 rounded-lg">
                    {selectedQuery.query_text}
                  </p>
                </div>
                
                {/* Results */}
                <div>
                  <h3 className="text-xl font-semibold mb-6">Results</h3>
                  
                  {(() => {
                    const tools = getResultsFromQuery(selectedQuery);
                    const relationshipsSummary = getRelationshipsSummary(selectedQuery);
                    
                    if (tools.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500">
                          No results stored for this query
                        </div>
                      );
                    }
                    
                    const mentalModels = tools.filter(t => t.type === 'mental_model');
                    const cognitiveBiases = tools.filter(t => t.type === 'cognitive_bias');
                    
                    return (
                      <>
                        {/* Mental Models Section */}
                        {mentalModels.length > 0 && (
                          <div className="mb-8">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              Mental Models Applied
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {mentalModels.map((tool, index) => (
                                <ToolCard key={tool.id} tool={tool} index={index} />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Cognitive Biases Section */}
                        {cognitiveBiases.length > 0 && (
                          <div className="mb-8">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              Cognitive Biases Identified
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {cognitiveBiases.map((tool, index) => (
                                <ToolCard key={tool.id} tool={tool} index={index + mentalModels.length} />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Relationships Summary */}
                        {relationshipsSummary && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative overflow-hidden"
                          >
                            {canSeeRelationships(selectedQuery) ? (
                              // User can see relationships
                              <>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/5 via-[#8B5CF6]/10 to-[#8B5CF6]/5 animate-gradient-x"></div>
                                
                                <div className="relative bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#8B5CF6]/30">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-[#8B5CF6]/20 rounded-xl">
                                      <Layers className="h-6 w-6 text-[#8B5CF6]" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">
                                      How These Patterns Connect
                                    </h3>
                                    <span className="ml-auto text-xs px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full font-medium">
                                      Premium Insight
                                    </span>
                                  </div>
                                  
                                  <div className="relative">
                                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5CF6]/0 via-[#8B5CF6]/50 to-[#8B5CF6]/0"></div>
                                    <div className="pl-4 prose prose-sm max-w-none">
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }: any) => (
                                            <p className="text-gray-300 leading-relaxed mb-4 last:mb-0">{children}</p>
                                          ),
                                          strong: ({ children }: any) => (
                                            <strong className="font-semibold text-[#8B5CF6]">{children}</strong>
                                          ),
                                          em: ({ children }: any) => (
                                            <em className="text-gray-200 italic">{children}</em>
                                          ),
                                          code: ({ children }: any) => (
                                            <code className="px-1.5 py-0.5 bg-[#333333] text-[#8B5CF6] rounded text-xs font-mono">{children}</code>
                                          ),
                                          ul: ({ children }: any) => (
                                            <ul className="list-disc list-inside space-y-1 text-gray-300">{children}</ul>
                                          ),
                                          ol: ({ children }: any) => (
                                            <ol className="list-decimal list-inside space-y-1 text-gray-300">{children}</ol>
                                          ),
                                          li: ({ children }: any) => (
                                            <li className="text-gray-300">{children}</li>
                                          ),
                                        }}
                                      >
                                        {processMarkdown(relationshipsSummary || '')}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                  
                                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8B5CF6]/10 rounded-full filter blur-2xl"></div>
                                </div>
                              </>
                            ) : (
                              // User cannot see relationships - show locked state
                              <div className="relative bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#8B5CF6]/30">
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[#8B5CF6]/20 rounded-xl">
                                      <Lock className="h-6 w-6 text-[#8B5CF6]" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">
                                      How These Patterns Connect
                                    </h3>
                                  </div>
                                  <span className="text-xs px-3 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-full font-medium">
                                    Premium Feature
                                  </span>
                                </div>
                                
                                <div className="relative">
                                  {/* Blurred content preview */}
                                  <div className="filter blur-sm opacity-50 select-none pointer-events-none">
                                    <p className="text-gray-400 leading-relaxed mb-4">
                                      The selected mental models and cognitive biases work together to create a comprehensive understanding...
                                    </p>
                                    <p className="text-gray-400 leading-relaxed">
                                      By recognizing these patterns, you can develop strategies that address both the structural and psychological aspects...
                                    </p>
                                  </div>
                                  
                                  {/* Upgrade prompt overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                      <Crown className="h-12 w-12 text-[#8B5CF6] mx-auto mb-4" />
                                      <p className="text-white font-semibold mb-2">Premium Feature</p>
                                      <p className="text-gray-400 text-sm mb-4">
                                        Unlock pattern connections and deeper insights
                                      </p>
                                      <Link to="/pricing">
                                        <motion.button
                                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-lg text-white text-sm font-medium hover:from-[#7C3AED] hover:to-[#8B5CF6] transition-all"
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          <Crown size={16} />
                                          Upgrade to Premium
                                          <ArrowRight size={14} />
                                        </motion.button>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a query to view results</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Floating Action Button */}
        {selectedQuery && !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed bottom-6 left-6 p-3 bg-[#00FFFF] text-[#1A1A1A] rounded-full shadow-lg z-40"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default History;