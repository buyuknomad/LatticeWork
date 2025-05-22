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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// Import our custom components
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

// --- Type Definitions ---
interface RecommendedTool {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation: string;
}

interface LatticeInsightResponse {
  recommendedTools: RecommendedTool[];
  relationshipsSummary?: string;
  error?: string;
  message?: string;
  query_id?: string;
}

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
    
    return (
      <Card 
        key={tool.id}
        variant={isMentalModel ? 'mental-model' : 'cognitive-bias'}
        interactive
        className="h-full"
      >
        <Card.Header>
          <div className="flex items-center justify-between mb-3">
            <div className={isMentalModel ? 'text-[#00FFFF]' : 'text-amber-400'}>
              {isMentalModel ? <Lightbulb className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <Badge variant={isMentalModel ? 'mental-model' : 'cognitive-bias'}>
              {tool.category}
            </Badge>
          </div>
          <h3 className="text-white font-semibold text-lg">{tool.name}</h3>
        </Card.Header>
        
        <Card.Content>
          <p className="text-gray-300 text-sm mb-4">{tool.summary}</p>
          
          {tool.explanation && (
            <details className="mb-4">
              <summary className={`text-sm cursor-pointer hover:underline ${isMentalModel ? 'text-[#00FFFF]' : 'text-amber-400'}`}>
                How it applies to your situation
              </summary>
              <p className="text-gray-400 text-sm mt-2 pl-4 border-l-2 border-gray-600">
                {tool.explanation}
              </p>
            </details>
          )}
        </Card.Content>
        
        <Card.Footer>
          <Button 
            variant="ghost" 
            size="sm"
            className={`ml-auto ${isMentalModel ? 'text-[#00FFFF] hover:bg-[#00FFFF]/10' : 'text-amber-400 hover:bg-amber-500/10'}`}
          >
            Learn More →
          </Button>
        </Card.Footer>
      </Card>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#16181A] text-gray-100">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8 shadow-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome, {getDisplayName()}!
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTierToggle(!showTierToggle)}
                className="hidden md:flex items-center gap-1 text-gray-400 hover:text-gray-300"
              >
                <Info size={12} />
                <span>Dev Mode: {showTierToggle ? 'ON' : 'OFF'}</span>
              </Button>
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
            <Card className="mb-4 p-4 border-[#444]">
              <p className="text-sm text-gray-300 mb-3">Developer Mode: Toggle user tier for testing</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleDevTier}
                  disabled={devTestTier === 'free'}
                  variant={devTestTier === 'free' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  Free Tier
                </Button>
                <Button
                  onClick={toggleDevTier}
                  disabled={devTestTier === 'premium'}
                  variant={devTestTier === 'premium' ? 'primary' : 'secondary'}
                  size="sm"
                >
                  Premium Tier
                </Button>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Badge variant={displayTier === 'premium' ? 'premium' : 'default'}>
              {displayTier === 'premium' ? (
                <>
                  <Crown size={14} />
                  Premium Tier
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Free Tier
                </>
              )}
            </Badge>
          </div>

          <p className="text-gray-300 mb-6">
            Describe your challenge or question. Cosmic Lattice will analyze it and suggest relevant mental models and cognitive biases.
          </p>

          {!results && !isLoading && (
            <div className="space-y-6">
              <form onSubmit={handleQuerySubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What's on your mind? Ask any question..."
                    value={query}
                    onChange={handleQueryChange}
                    className="w-full bg-[#2A2D35] text-white rounded-xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] transition-shadow duration-300 shadow-sm"
                    autoFocus={shouldFocusAnalysis}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  {query && !isLoading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery('')}
                      className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      <X size={18} />
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    variant="ghost"
                    size="sm"
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
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
                      variant="secondary"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      className="text-gray-300 hover:text-white truncate max-w-[200px] sm:max-w-[250px]"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-[#00FFFF] animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-[#212327]"></div>
                  </div>
                </div>
                <p className="mt-4 text-gray-400">Analyzing your query with Cosmic Lattice...</p>
              </div>
            </Card>
          )}

          {error && !isLoading && (
            <Card className="border-red-500/30">
              <Card.Content className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                  <h4 className="text-lg font-semibold text-red-400">Analysis Error</h4>
                </div>
                <p className="text-gray-300 mb-4">{error}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetQuery}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    Try a new query
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setError(null)}
                    className="text-gray-400"
                  >
                    Dismiss
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )}

          {results && !isLoading && !error && (
            <div className="space-y-8 mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Lattice Insights</h2>
                  <p className="text-gray-400 text-sm italic">For your query: "{query}"</p>
                </div>
                <Button
                  onClick={resetQuery}
                  variant="ghost"
                  size="sm"
                  className="text-[#00FFFF] hover:bg-[#00FFFF]/10"
                >
                  <Search size={14} className="mr-1" />
                  New Query
                </Button>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-xl font-medium text-white mb-4">
                  Recommended Tools
                </h3>
                {results.recommendedTools && results.recommendedTools.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.recommendedTools
                      .filter(tool => tool.type === 'mental_model')
                      .map(renderResultCard)}
                    {results.recommendedTools
                      .filter(tool => tool.type === 'cognitive_bias')
                      .map(renderResultCard)}
                  </div>
                ) : (
                  <Card className="p-6">
                    <div className="text-center text-gray-400">
                      <p>No specific tools recommended for this query. Try rephrasing or asking something different.</p>
                    </div>
                  </Card>
                )}
              </div>

              {displayTier === 'premium' && results.relationshipsSummary && (
                <Card variant="premium" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-6 w-6 text-purple-400" />
                    <h3 className="text-lg font-medium text-purple-400">Connections & Interactions</h3>
                    <Badge variant="premium" size="sm">PREMIUM</Badge>
                  </div>
                  <p className="text-gray-300 whitespace-pre-line">{results.relationshipsSummary}</p>
                </Card>
              )}
              
              {displayTier === 'premium' && results.recommendedTools?.length > 0 && (
                <Card variant="premium" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="h-6 w-6 text-purple-400" />
                    <h3 className="text-lg font-medium text-purple-400">Interactive Visualization</h3>
                    <Badge variant="premium" size="sm">PREMIUM</Badge>
                  </div>
                  <div className="bg-[#1F1F1F] rounded-lg h-48 flex items-center justify-center text-gray-500 border border-purple-500/20">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full border-2 border-purple-400/30 mx-auto mb-2 flex items-center justify-center">
                        <Crown className="h-6 w-6 text-purple-400/50" />
                      </div>
                      <p>Interactive visualization coming soon</p>
                    </div>
                  </div>
                </Card>
              )}

              {displayTier === 'free' && (
                <Card className="p-6 bg-gradient-to-r from-[#1F1F1F] via-[#252525] to-[#1F1F1F] border-purple-500/30">
                  <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                    <div className="bg-purple-500/10 rounded-full p-4 border-2 border-purple-500/30">
                      <Crown className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-white">
                        Unlock the Full Power of Cosmic Lattice
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Upgrade to Premium for more detailed insights, access to our complete library of mental models & cognitive biases, and interactive relationship visualizations.
                      </p>
                      <Button variant="primary">
                        Explore Premium Plans
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;