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
  Brain,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw,
  Filter,
  Menu,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BackgroundAnimation from '../components/BackgroundAnimation';

// Types
interface QueryHistoryItem {
  id: string;
  user_id: string;
  created_at: string;
  query_text: string;
  recommended_tools?: any[];
  relationships_summary?: string;
  full_response?: any;
}

interface RecommendedTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string;
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  const toggleCardExpansion = (toolId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedCards(newExpanded);
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

  // Tool card component (reused from Dashboard)
  const renderToolCard = (tool: RecommendedTool, index: number) => {
    const isMentalModel = tool.type === 'mental_model';
    const isExpanded = expandedCards.has(tool.id);
    
    return (
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="group"
      >
        <div
          className={`relative bg-[#252525]/80 backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-hidden ${
            isMentalModel 
              ? 'border-[#00FFFF]/20 hover:border-[#00FFFF]/40 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]' 
              : 'border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
          }`}
        >
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isMentalModel ? (
                    <div className="p-2 bg-[#00FFFF]/10 rounded-lg">
                      <Brain className="h-5 w-5 text-[#00FFFF]" />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isMentalModel 
                      ? 'bg-[#00FFFF]/10 text-[#00FFFF]' 
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {tool.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {tool.summary}
            </p>

            <div className="border-t border-[#333333] pt-4">
              <button
                onClick={() => toggleCardExpansion(tool.id)}
                className={`w-full flex items-center justify-between p-3 -m-3 rounded-lg transition-colors ${
                  isMentalModel 
                    ? 'hover:bg-[#00FFFF]/5' 
                    : 'hover:bg-amber-500/5'
                }`}
              >
                <span className={`text-sm font-medium flex items-center gap-2 ${
                  isMentalModel ? 'text-[#00FFFF]' : 'text-amber-500'
                }`}>
                  <Eye size={16} />
                  How this applies to your situation
                </span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-1">
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {tool.explanation || "No specific explanation provided."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] pt-20 relative overflow-hidden">
      {/* Background Animation Layer */}
      <HistoryBackground />
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
      
              <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] relative pt-20 md:pt-20">
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
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedQuery.created_at).toLocaleString()}</span>
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
                            <Brain className="h-5 w-5 text-[#00FFFF]" />
                            Mental Models Applied
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {mentalModels.map((tool, index) => renderToolCard(tool, index))}
                          </div>
                        </div>
                      )}
                      
                      {/* Cognitive Biases Section */}
                      {cognitiveBiases.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Cognitive Biases Identified
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {cognitiveBiases.map((tool, index) => renderToolCard(tool, index))}
                          </div>
                        </div>
                      )}
                      
                      {/* Relationships Summary */}
                      {relationshipsSummary && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 backdrop-blur-sm rounded-xl p-6 border border-[#8B5CF6]/30"
                        >
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            How These Connect
                          </h4>
                          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                            {relationshipsSummary}
                          </p>
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

export default History;