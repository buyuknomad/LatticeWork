import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Brain, Lightbulb, AlertTriangle } from 'lucide-react';
import QueryInput from '../components/dashboard/QueryInput';
import ResultsDisplay from '../components/dashboard/ResultsDisplay';
import RelationshipVisualization from '../components/dashboard/RelationshipVisualization';
import { MentalModel, CognitiveBias } from '../types/models';
import { mockModels, mockBiases } from '../data/mockData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queriesRemaining, setQueriesRemaining] = useState<number>(2); // For free tier
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedModels, setSelectedModels] = useState<MentalModel[]>([]);
  const [selectedBiases, setSelectedBiases] = useState<CognitiveBias[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showVisualization, setShowVisualization] = useState<boolean>(false);

  useEffect(() => {
    // In a real implementation, we would fetch this from the user's metadata
    const userTier = user?.user_metadata?.tier || 'free';
    setIsPremium(userTier === 'premium');

    // In a real implementation, we would fetch remaining queries from the database
    if (userTier === 'free') {
      const fetchQueriesRemaining = async () => {
        // This would be an API call in production
        setQueriesRemaining(2); // Hardcoded for demo
      };
      fetchQueriesRemaining();
    }
  }, [user]);

  const handleQuerySubmit = async (queryText: string) => {
    if (!queryText.trim()) return;
    
    setQuery(queryText);
    setIsLoading(true);
    setShowResults(false);
    
    try {
      // In a real implementation, this would be an API call to your LLM service
      // For now, we'll simulate a response with a timeout and mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate model and bias selection based on query
      // In a real application, this would come from your API/LLM
      const models = selectModelsForQuery(queryText, isPremium);
      const biases = selectBiasesForQuery(queryText, isPremium);
      
      setSelectedModels(models);
      setSelectedBiases(biases);
      
      // If free tier, decrement remaining queries
      if (!isPremium) {
        setQueriesRemaining(prev => Math.max(0, prev - 1));
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // This simulates the model selection that would be done by the LLM
  const selectModelsForQuery = (queryText: string, isPremium: boolean): MentalModel[] => {
    const lowerQuery = queryText.toLowerCase();
    let filteredModels = [...mockModels];
    
    // Extremely simplistic matching for demo purposes
    // In a real app, this would be handled by your LLM or a sophisticated algorithm
    if (lowerQuery.includes('decision')) {
      filteredModels = mockModels.filter(m => m.category === 'Decision Making');
    } else if (lowerQuery.includes('system') || lowerQuery.includes('complex')) {
      filteredModels = mockModels.filter(m => m.category === 'Systems Thinking');
    } else if (lowerQuery.includes('risk') || lowerQuery.includes('uncertain')) {
      filteredModels = mockModels.filter(m => m.category === 'Probability & Risk');
    }
    
    // Return an appropriate number of models based on tier
    const numModels = isPremium ? 3 : 1;
    return filteredModels.slice(0, numModels);
  };

  // This simulates the bias selection that would be done by the LLM
  const selectBiasesForQuery = (queryText: string, isPremium: boolean): CognitiveBias[] => {
    const lowerQuery = queryText.toLowerCase();
    let filteredBiases = [...mockBiases];
    
    // Extremely simplistic matching for demo purposes
    if (lowerQuery.includes('group') || lowerQuery.includes('team')) {
      filteredBiases = mockBiases.filter(b => b.category === 'Social and Group Biases');
    } else if (lowerQuery.includes('risk') || lowerQuery.includes('uncertain')) {
      filteredBiases = mockBiases.filter(b => b.category === 'Probability and Risk Assessment Biases');
    }
    
    // Return an appropriate number of biases based on tier
    const numBiases = isPremium ? 2 : 1;
    return filteredBiases.slice(0, numBiases);
  };

  const toggleVisualization = () => {
    if (isPremium) {
      setShowVisualization(!showVisualization);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#212327] to-[#262B33] rounded-xl p-6 md:p-8 shadow-lg mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#00FFFF]/10 rounded-full p-3">
              <Brain className="h-8 w-8 text-[#00FFFF]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome to Your Thinking Dashboard
            </h1>
          </div>
          
          <p className="text-gray-300 mb-4">
            Describe a situation or ask a question, and I'll recommend mental models and 
            highlight cognitive biases that can help you think more clearly.
          </p>
          
          {!isPremium && (
            <div className="bg-[#2A2D35] rounded-lg p-4 text-sm">
              <p className="text-gray-300">
                <span className="font-medium text-[#00FFFF]">Free Tier: </span>
                You have {queriesRemaining} queries remaining today. 
                <button 
                  className="ml-2 text-[#8B5CF6] hover:underline"
                  onClick={() => {/* Implement upgrade flow */}}
                >
                  Upgrade to Premium
                </button>
              </p>
            </div>
          )}
        </motion.div>
        
        {/* Query Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <QueryInput 
            onSubmit={handleQuerySubmit} 
            isLoading={isLoading} 
            disabled={!isPremium && queriesRemaining <= 0}
          />
        </motion.div>
        
        {/* Results Area */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            {isPremium && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleVisualization}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showVisualization
                      ? "bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/30"
                      : "bg-[#2A2D35] text-gray-300 border border-gray-700 hover:border-[#00FFFF]/30"
                  }`}
                >
                  {showVisualization ? "Hide Relationships" : "Show Relationships"}
                </button>
              </div>
            )}
            
            {showVisualization && isPremium ? (
              <RelationshipVisualization 
                models={selectedModels} 
                biases={selectedBiases}
              />
            ) : (
              <ResultsDisplay 
                query={query}
                models={selectedModels}
                biases={selectedBiases}
                isPremium={isPremium}
              />
            )}
          </motion.div>
        )}
        
        {/* Premium Upgrade Banner */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 bg-gradient-to-r from-[#1F1F1F] to-[#252525] rounded-lg p-6 border border-[#333333]"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Upgrade to Premium
                </h3>
                <p className="text-gray-300 mb-4">
                  Get unlimited queries, access to all 300 mental models and 246 biases, 
                  detailed application guidance, and visualize relationships between concepts.
                </p>
                <ul className="space-y-2 mb-6 md:mb-0">
                  {[
                    { icon: <Lightbulb size={16} />, text: "Unlimited queries" },
                    { icon: <Brain size={16} />, text: "300 mental models, 246 biases" },
                    { icon: <AlertTriangle size={16} />, text: "Advanced visualization" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-400">
                      <span className="text-[#00FFFF]">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0">
                <button 
                  className="w-full md:w-auto bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-lg"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;