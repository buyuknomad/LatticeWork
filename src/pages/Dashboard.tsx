import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Search, 
  Zap, 
  Crown, 
  Lightbulb, 
  AlertTriangle, 
  ArrowRight,
  X,
  Info
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// Mock data for testing
const EXAMPLE_QUERIES = [
  "How do I prioritize my competing tasks?",
  "Should I trust my intuition or analyze data?",
  "Why do team decisions often take so long?",
  "How can I avoid confirmation bias in research?"
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showTierToggle, setShowTierToggle] = useState(false);
  
  // Check if we should automatically focus on analysis (from landing page)
  const shouldFocusAnalysis = new URLSearchParams(location.search).get('action') === 'analyze';
  
  // Extract username from either metadata or email
  const getDisplayName = () => {
    if (!user) return 'User';
    
    if (user.user_metadata?.username) {
      return user.user_metadata.username;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call timing
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const resetQuery = () => {
    setQuery('');
    setShowResults(false);
  };

  const toggleTier = () => {
    setUserTier(userTier === 'free' ? 'premium' : 'free');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with User Welcome and Settings */}
        <div className="bg-[#212327] rounded-xl p-6 md:p-8 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome, {getDisplayName()}!
            </h1>
            <div className="flex items-center gap-3">
              {/* Dev-only tier toggle button */}
              <motion.button
                className="hidden md:flex items-center gap-1 text-xs bg-[#2D2D3A] px-2 py-1 rounded text-gray-400 hover:text-gray-300"
                onClick={() => setShowTierToggle(!showTierToggle)}
                whileHover={{ scale: 1.05 }}
                title="Developer Toggle"
              >
                <Info size={12} />
                <span>Dev</span>
              </motion.button>
              
              <Link 
                to="/settings" 
                className="bg-[#2A2D35] p-2 rounded-lg hover:bg-[#333740] transition-colors"
                title="Profile Settings"
              >
                <Settings className="h-5 w-5 text-[#00FFFF]" />
              </Link>
            </div>
          </div>
          
          {/* Dev Mode Tier Toggle */}
          {showTierToggle && (
            <div className="mb-4 p-3 bg-[#2D2D3A] rounded-lg border border-[#444]">
              <p className="text-sm text-gray-300 mb-2">Developer Mode: Toggle user tier for testing</p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleTier}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    userTier === 'free' 
                      ? 'bg-cyan-700/30 text-cyan-300 border border-cyan-700' 
                      : 'bg-[#333] text-gray-400 hover:bg-[#444]'
                  }`}
                >
                  Free Tier
                </button>
                <button 
                  onClick={toggleTier}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    userTier === 'premium' 
                      ? 'bg-purple-700/30 text-purple-300 border border-purple-700' 
                      : 'bg-[#333] text-gray-400 hover:bg-[#444]'
                  }`}
                >
                  Premium Tier
                </button>
              </div>
            </div>
          )}
          
          {/* Current User Tier */}
          <div className="flex items-center gap-2 mb-4">
            {userTier === 'premium' ? (
              <div className="flex items-center gap-2 text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1 rounded-full text-sm border border-[#8B5CF6]/30">
                <Crown size={14} />
                <span>Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#00FFFF] bg-[#00FFFF]/10 px-3 py-1 rounded-full text-sm border border-[#00FFFF]/30">
                <Zap size={14} />
                <span>Free Tier • 2 queries/day</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-300 mb-6">
            Use your mental models toolkit to analyze situations, make better decisions, and avoid cognitive biases.
          </p>
          
          {/* Query form */}
          {!showResults && (
            <div className="space-y-6">
              <form onSubmit={handleQuerySubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What's on your mind? Ask any question..."
                    value={query}
                    onChange={handleQueryChange}
                    className="w-full bg-[#2A2D35] text-white rounded-xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] transition-shadow duration-300"
                    autoFocus={shouldFocusAnalysis}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  
                  {query && (
                    <button
                      type="button"
                      className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      onClick={() => setQuery('')}
                    >
                      <X size={18} />
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                      query.trim() && !isLoading 
                        ? 'text-[#00FFFF] hover:text-[#00CCCC]' 
                        : 'text-gray-600 cursor-not-allowed'
                    } transition-colors`}
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
              
              {/* Example queries */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Try asking about:</h3>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_QUERIES.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="bg-[#2A2D35] text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-[#333740] transition-colors truncate max-w-[200px] sm:max-w-[250px]"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-[#00FFFF] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-[#212327]"></div>
                </div>
              </div>
              <p className="mt-4 text-gray-400">Analyzing your query...</p>
            </div>
          )}
          
          {/* Results Display */}
          {showResults && !isLoading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Results for your query</h2>
                <button
                  onClick={resetQuery}
                  className="text-sm text-[#00FFFF] hover:underline flex items-center gap-1"
                >
                  <X size={14} /> 
                  New Query
                </button>
              </div>
              
              <div className="p-3 bg-[#2A2D35]/50 rounded-lg border border-[#444] mb-6">
                <p className="text-gray-300 italic">"{query}"</p>
              </div>
              
              {/* Mental Models Section */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-medium text-[#00FFFF]">
                  <Lightbulb className="h-5 w-5" />
                  Mental Models
                  <span className="text-sm font-normal text-gray-400">
                    ({userTier === 'premium' ? '3 of 300' : '1 of 75'} available)
                  </span>
                </h3>
                
                {/* Premium Tier: 3 models */}
                {userTier === 'premium' ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div 
                        key={item}
                        className="bg-[#2A2D35] p-4 rounded-lg border border-[#00FFFF]/20 hover:border-[#00FFFF]/40 transition-colors"
                      >
                        <h4 className="font-medium text-white mb-2">First Principles Thinking</h4>
                        <p className="text-gray-300 text-sm">Breaking down complex problems into their most fundamental truths and building solutions from the ground up.</p>
                        <div className="mt-3 flex justify-end gap-2">
                          <button className="text-xs bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 text-[#00FFFF] px-3 py-1 rounded transition-colors">
                            Learn More
                          </button>
                          <button className="text-xs bg-[#00FFFF]/20 hover:bg-[#00FFFF]/30 text-[#00FFFF] px-3 py-1 rounded transition-colors">
                            How to Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Free Tier: 1 model
                  <div className="space-y-3">
                    <div className="bg-[#2A2D35] p-4 rounded-lg border border-[#00FFFF]/20 hover:border-[#00FFFF]/40 transition-colors">
                      <h4 className="font-medium text-white mb-2">First Principles Thinking</h4>
                      <p className="text-gray-300 text-sm">Breaking down complex problems into their most fundamental truths and building solutions from the ground up.</p>
                      <div className="mt-3 flex justify-end gap-2">
                        <button className="text-xs bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 text-[#00FFFF] px-3 py-1 rounded transition-colors">
                          Learn More
                        </button>
                        <button className="text-xs bg-[#00FFFF]/20 hover:bg-[#00FFFF]/30 text-[#00FFFF] px-3 py-1 rounded transition-colors">
                          How to Apply
                        </button>
                      </div>
                    </div>
                    
                    {/* Premium Teaser */}
                    <div className="bg-[#2A2D35]/50 p-4 rounded-lg border border-[#8B5CF6]/20 border-dashed">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-[#8B5CF6]" />
                        <h4 className="font-medium text-[#8B5CF6]">Premium Models</h4>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Upgrade to Premium to access 3-4 mental models per query and our full library of 300 models.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Cognitive Biases Section */}
              <div className="space-y-4 mt-8">
                <h3 className="flex items-center gap-2 text-lg font-medium text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  Cognitive Biases
                  <span className="text-sm font-normal text-gray-400">
                    ({userTier === 'premium' ? '2 of 246' : '1 of 40'} available)
                  </span>
                </h3>
                
                {/* Premium Tier: 2 biases */}
                {userTier === 'premium' ? (
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div 
                        key={item}
                        className="bg-[#2A2D35] p-4 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
                      >
                        <h4 className="font-medium text-white mb-2">Confirmation Bias</h4>
                        <p className="text-gray-300 text-sm">The tendency to search for, interpret, favor, and recall information in a way that confirms one's preexisting beliefs or hypotheses.</p>
                        <div className="mt-3 flex justify-end gap-2">
                          <button className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded transition-colors">
                            How to Recognize
                          </button>
                          <button className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded transition-colors">
                            How to Mitigate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Free Tier: 1 bias
                  <div className="space-y-3">
                    <div className="bg-[#2A2D35] p-4 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                      <h4 className="font-medium text-white mb-2">Confirmation Bias</h4>
                      <p className="text-gray-300 text-sm">The tendency to search for, interpret, favor, and recall information in a way that confirms one's preexisting beliefs or hypotheses.</p>
                      <div className="mt-3 flex justify-end gap-2">
                        <button className="text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded transition-colors">
                          How to Recognize
                        </button>
                        <button className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded transition-colors">
                          How to Mitigate
                        </button>
                      </div>
                    </div>
                    
                    {/* Premium Teaser */}
                    <div className="bg-[#2A2D35]/50 p-4 rounded-lg border border-[#8B5CF6]/20 border-dashed">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-[#8B5CF6]" />
                        <h4 className="font-medium text-[#8B5CF6]">Premium Biases</h4>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Upgrade to Premium to access 2-3 cognitive biases per query and our full library of 246 biases.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Visualization Section (Premium only) */}
              {userTier === 'premium' && (
                <div className="mt-8 p-4 bg-[#2A2D35] rounded-lg border border-[#8B5CF6]/30">
                  <h3 className="flex items-center gap-2 text-lg font-medium text-[#8B5CF6] mb-3">
                    <Crown className="h-5 w-5" /> 
                    Relationships Visualization
                  </h3>
                  <div className="bg-[#1F1F1F] rounded-lg h-40 flex items-center justify-center">
                    <p className="text-gray-400">Premium visualization will appear here</p>
                  </div>
                </div>
              )}
              
              {/* Premium Upgrade CTA (Free tier only) */}
              {userTier === 'free' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-[#1F1F1F] to-[#252525] rounded-xl border border-[#333333]">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#8B5CF6]/10 rounded-full p-3 border border-[#8B5CF6]/30">
                      <Crown className="h-6 w-6 text-[#8B5CF6]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        Upgrade to Premium
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Get unlimited queries, access to all 300 mental models, 246 biases, and the relationship visualization.
                      </p>
                      <button 
                        className="bg-[#8B5CF6] text-white py-2 px-4 rounded-lg hover:bg-[#8B5CF6]/90 transition-colors"
                      >
                        View Premium Plans
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Query history or additional components could go here */}
      </div>
    </div>
  );
};

export default Dashboard;