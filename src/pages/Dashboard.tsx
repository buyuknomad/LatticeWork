import React, { useState, useEffect } from 'react';
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
  Info,
  ChevronDown, // Example, if needed for accordions or dropdowns
  AlertCircle // For displaying errors
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// UI Components from Shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Example: import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// For now, we'll keep the styling similar to your previous version and focus on logic.

// --- Type Definitions ---
interface RecommendedTool {
  id: string; // Or number, depending on your DB schema
  name: string;
  category: string; // e.g., "Decision Making", "Problem Solving"
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string; // LLM-generated explanation
}

interface LatticeInsightResponse {
  recommendedTools: RecommendedTool[];
  relationshipsSummary?: string;
  error?: string;
  message?: string;
  query_id?: string;
}
// --- END Type Definitions ---

const EXAMPLE_QUERIES = [
  "How do I prioritize my competing tasks?",
  "Should I trust my intuition or analyze data?",
  "Why do team decisions often take so long?",
  "How can I avoid confirmation bias in research?"
];

const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const location = useLocation();

  const [actualUserTier, setActualUserTier] = useState<'free' | 'premium'>('free');
  const [devTestTier, setDevTestTier] = useState<'free' | 'premium'>('free');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LatticeInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTierToggle, setShowTierToggle] = useState(false);

  const shouldFocusAnalysis = new URLSearchParams(location.search).get('action') === 'analyze';

  useEffect(() => {
    if (user?.user_metadata?.tier) {
      const tier = user.user_metadata.tier as 'free' | 'premium';
      setActualUserTier(tier);
      setDevTestTier(tier);
    }
  }, [user]);

  const displayTier = showTierToggle ? devTestTier : actualUserTier;

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.user_metadata?.username) return user.user_metadata.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setError(null);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    console.log("Attempting to submit query:", query);

    setIsLoading(true);
    setResults(null);
    setError(null);

    if (!session?.access_token) {
      console.warn("Authentication error: No access token available.");
      setError("Authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-lattice-insights`;
      console.log("Calling Edge Function URL:", edgeFunctionUrl);

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query: query }),
      });

      console.log("Raw response from Edge Function (status, headers):", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      setIsLoading(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "An unexpected error occurred while parsing the error response.",
          details: response.statusText
        }));
        console.error("API Error Data (from !response.ok block):", errorData);
        setError(errorData.error || `Error: ${response.status} ${response.statusText}`);
        return;
      }

      const data: LatticeInsightResponse = await response.json();
      console.log("Parsed data from Edge Function (LatticeInsightResponse):", data);

      if (data.error) {
        console.error("Error message received from backend logic:", data.error);
        setError(data.error);
      } else {
        console.log("Successfully received recommendedTools:", data.recommendedTools);
        if (data.relationshipsSummary) {
          console.log("Relationships summary:", data.relationshipsSummary);
        }
        setResults(data);
      }

    } catch (err: any) {
      console.error("Frontend Query Submit Error (catch block):", err);
      setIsLoading(false);
      setError(err.message || "Failed to fetch insights. Please try again.");
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setError(null);
    setResults(null);
  };

  const resetQuery = () => {
    setQuery('');
    setResults(null);
    setError(null);
    setIsLoading(false);
  };

  const toggleDevTier = () => {
    setDevTestTier(prev => prev === 'free' ? 'premium' : 'free');
  };

  const renderResultCard = (tool: RecommendedTool) => {
    const isMentalModel = tool.type === 'mental_model';
    const borderColor = isMentalModel ? 'border-[#00FFFF]/30 hover:border-[#00FFFF]/50' : 'border-yellow-500/30 hover:border-yellow-500/50';
    const textColor = isMentalModel ? 'text-[#00FFFF]' : 'text-yellow-400';
    const buttonBgHover = isMentalModel ? 'hover:bg-[#00FFFF]/20' : 'hover:bg-yellow-500/20';

    return (
      <motion.div
        key={tool.id || tool.name}
        className={`bg-[#2A2D35] p-4 rounded-lg border ${borderColor} transition-colors shadow-md`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="font-semibold text-white text-lg mb-1">{tool.name}</h4>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block ${isMentalModel ? 'bg-[#00FFFF]/10 text-[#00FFFF]' : 'bg-yellow-500/10 text-yellow-400'}`}>
          {tool.category} - {isMentalModel ? 'Mental Model' : 'Cognitive Bias'}
        </span>
        <p className="text-gray-300 text-sm mb-3">{tool.summary}</p>
        <details className="mb-3">
            <summary className={`text-sm ${textColor} cursor-pointer hover:underline`}>
                LLM Explanation
            </summary>
            <p className="text-gray-400 text-sm mt-2 bg-[#212327] p-3 rounded">
                {tool.explanation || "No explanation provided."}
            </p>
        </details>
        <div className="mt-3 flex justify-end gap-2">
          {/* Consider replacing this with Shadcn Button if a specific variant is desired, e.g., <Button variant="link" className="...">Learn More</Button> */}
          <button className={`text-xs bg-opacity-10 ${buttonBgHover} ${textColor} px-3 py-1 rounded transition-colors`}>
            Learn More
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#16181A] text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#212327] rounded-xl p-6 md:p-8 shadow-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome, {getDisplayName()}!
            </h1>
            <div className="flex items-center gap-3">
              <motion.button
                className="hidden md:flex items-center gap-1 text-xs bg-[#2D2D3A] px-2 py-1 rounded text-gray-400 hover:text-gray-300"
                onClick={() => setShowTierToggle(!showTierToggle)}
                whileHover={{ scale: 1.05 }}
                title="Developer Tier Toggle"
              >
                <Info size={12} />
                <span>Dev Mode: {showTierToggle ? 'ON' : 'OFF'}</span>
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

          {showTierToggle && (
            <div className="mb-4 p-3 bg-[#2D2D3A] rounded-lg border border-[#444]">
              <p className="text-sm text-gray-300 mb-2">Developer Mode: Toggle user tier for testing</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDevTier}
                  disabled={devTestTier === 'free'}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    devTestTier === 'free'
                      ? 'bg-cyan-700/30 text-cyan-300 border-cyan-700 cursor-not-allowed'
                      : 'bg-[#333] text-gray-400 hover:bg-[#444] border-[#555]'
                  }`}
                >
                  Set to Free
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDevTier}
                  disabled={devTestTier === 'premium'}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    devTestTier === 'premium'
                      ? 'bg-purple-700/30 text-purple-300 border-purple-700 cursor-not-allowed'
                      : 'bg-[#333] text-gray-400 hover:bg-[#444] border-[#555]'
                  }`}
                >
                  Set to Premium
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            {displayTier === 'premium' ? (
              <div className="flex items-center gap-2 text-[#A78BFA] bg-[#A78BFA]/10 px-3 py-1 rounded-full text-sm border border-[#A78BFA]/30">
                <Crown size={14} />
                <span>Premium Tier</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full text-sm border border-[#22D3EE]/30">
                <Zap size={14} />
                <span>Free Tier</span>
              </div>
            )}
          </div>

          <p className="text-gray-300 mb-6">
            Describe your challenge or question. Cosmic Lattice will analyze it and suggest relevant mental models and cognitive biases.
          </p>

          {!results && !isLoading && (
            <div className="space-y-6">
              <form onSubmit={handleQuerySubmit}>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="What's on your mind? Ask any question..."
                    value={query}
                    onChange={handleQueryChange}
                    className="w-full bg-[#2A2D35] text-white rounded-xl px-5 py-4 pl-12 pr-28 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] transition-shadow duration-300 shadow-sm h-14 text-base" // Increased pr for buttons
                    autoFocus={shouldFocusAnalysis}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  {query && !isLoading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 h-9 w-9" // Adjusted positioning
                      onClick={() => setQuery('')}
                    >
                      <X size={18} />
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    disabled={!query.trim() || isLoading}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-9 w-9 ${ // Adjusted positioning
                      query.trim() && !isLoading
                        ? 'text-[#00FFFF] hover:text-[#00CCCC]'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </form>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Try asking about:</h3>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_QUERIES.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      className="bg-[#2A2D35] text-gray-300 hover:text-white hover:bg-[#333740] border-[#444444] hover:border-[#00FFFF]/70 truncate max-w-[200px] sm:max-w-[250px]"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-[#00FFFF] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-[#212327]"></div>
                </div>
              </div>
              <p className="mt-4 text-gray-400">Analyzing your query with Cosmic Lattice...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="my-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-3">
              <AlertCircle size={20} />
              <div>
                <h4 className="font-semibold">Analysis Error</h4>
                <p className="text-sm">{error}</p>
                <Button
                  variant="link"
                  onClick={resetQuery}
                  className="text-xs text-red-400 hover:text-red-300 mt-1 px-0 py-0 h-auto" // Shadcn link variant for "Try a new query"
                >
                  Try a new query
                </Button>
              </div>
            </div>
          )}

          {results && !isLoading && !error && (
            <div className="space-y-8 mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Lattice Insights</h2>
                  <p className="text-gray-400 text-sm italic">For your query: "{query}"</p>
                </div>
                <Button
                  variant="outline" // Or another suitable variant
                  size="sm"
                  onClick={resetQuery}
                  className="text-sm text-[#00FFFF] hover:text-white flex items-center gap-1 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 border-[#00FFFF]/30 hover:border-[#00FFFF]/50"
                >
                  <Search size={14} />
                  New Query
                </Button>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-xl font-medium text-white mb-4">
                  Recommended Tools
                </h3>
                {results.recommendedTools && results.recommendedTools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.recommendedTools
                            .filter(tool => tool.type === 'mental_model')
                            .map(renderResultCard)}
                        {results.recommendedTools
                            .filter(tool => tool.type === 'cognitive_bias')
                            .map(renderResultCard)}
                    </div>
                ) : (
                    <p className="text-gray-400">No specific tools recommended for this query. Try rephrasing or asking something different.</p>
                )}
              </div>

              {displayTier === 'premium' && results.relationshipsSummary && (
                <div className="mt-8 p-4 bg-[#2A2D35] rounded-lg border border-[#A78BFA]/30 shadow-md">
                  <h3 className="flex items-center gap-2 text-lg font-medium text-[#A78BFA] mb-3">
                    <Zap className="h-5 w-5" />
                    Connections & Interactions
                  </h3>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{results.relationshipsSummary}</p>
                </div>
              )}
              
              {displayTier === 'premium' && results.recommendedTools?.length > 0 && (
                  <div className="mt-8 p-4 bg-[#2A2D35] rounded-lg border border-[#A78BFA]/30 shadow-md">
                      <h3 className="flex items-center gap-2 text-lg font-medium text-[#A78BFA] mb-3">
                          <Crown size={18}/>
                          Interactive Visualization (Premium)
                      </h3>
                      <div className="bg-[#1F1F1F] rounded-lg h-48 flex items-center justify-center text-gray-500">
                          Coming soon: Visual map of these tools.
                      </div>
                  </div>
              )}

              {displayTier === 'free' && (
                <div className="mt-10 p-6 bg-gradient-to-r from-[#1F1F1F] via-[#252525] to-[#1F1F1F] rounded-xl border border-[#333333] shadow-xl">
                  <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                    <div className="bg-[#A78BFA]/10 rounded-full p-3 border-2 border-[#A78BFA]/30 inline-block">
                      <Crown className="h-8 w-8 text-[#A78BFA]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-white">
                        Unlock the Full Power of Cosmic Lattice
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Upgrade to Premium for more detailed insights, access to our complete library of mental models & cognitive biases, and interactive relationship visualizations.
                      </p>
                      <Link
                        to="/pricing"
                        className="bg-[#A78BFA] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-[#9370DB] transition-colors shadow-md hover:shadow-lg transform hover:scale-105 inline-block" // Added inline-block for proper styling of Link as button
                      >
                        Explore Premium Plans
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;