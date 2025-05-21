// src/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
import { supabase } from '../lib/supabase'; // Assuming this is your client, for other uses
import { User } from '@supabase/supabase-js';
import InteractiveDemo from '@/components/InteractiveDemo'; // Assuming this path is correct

// Define a type for the results you expect to display eventually
interface LatticeResult {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation?: string; // From LLM
  // Add other fields like 'how_to_apply', 'how_to_recognize', 'how_to_mitigate' as needed
}

const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<LatticeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTierEffect, setShowTierEffect] = useState(false); // For dev toggle visualization

  // For the temporary Edge Function tester
  const [queryResponse, setQueryResponse] = useState<string | null>(null);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);

  const [currentUserTier, setCurrentUserTier] = useState<'free' | 'premium'>('free');

  // Developer toggle state for testing tiers
  const [devTestTier, setDevTestTier] = useState<'free' | 'premium' | null>(null);
  const displayTier = devTestTier || currentUserTier;

  useEffect(() => {
    if (user?.user_metadata?.tier) {
      setCurrentUserTier(user.user_metadata.tier as 'free' | 'premium');
    }
  }, [user]);

  // Effect to visualize tier change from developer toggle
  useEffect(() => {
    if (devTestTier) {
      setShowTierEffect(true);
      const timer = setTimeout(() => setShowTierEffect(false), 300); // Flash duration
      return () => clearTimeout(timer);
    }
  }, [devTestTier]);

  const handleQuerySubmit = useCallback(async () => {
    if (!userInput.trim()) {
      setError("Please enter a query.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    // Placeholder: Simulating API call and tiered results
    // Replace this with your actual API call to the Edge Function later
    setTimeout(() => {
      const mockMentalModels: LatticeResult[] = [
        { id: 'mm1', name: 'First Principles Thinking', category: 'Problem Solving', summary: 'Break down complex problems into basic elements.', type: 'mental_model' },
        { id: 'mm2', name: 'Second-Order Thinking', category: 'Decision Making', summary: 'Consider the consequences of the consequences.', type: 'mental_model' },
        { id: 'mm3', name: 'Inversion', category: 'Problem Solving', summary: 'Approach a problem by considering the opposite.', type: 'mental_model' },
      ];
      const mockCognitiveBiases: LatticeResult[] = [
        { id: 'cb1', name: 'Confirmation Bias', category: 'Decision Making', summary: 'Favor information that confirms existing beliefs.', type: 'cognitive_bias' },
        { id: 'cb2', name: 'Availability Heuristic', category: 'Decision Making', summary: 'Overestimate the likelihood of events that are easily recalled.', type: 'cognitive_bias' },
      ];

      let newResults: LatticeResult[] = [];
      if (displayTier === 'free') {
        newResults = [mockMentalModels[0], mockCognitiveBiases[0]];
      } else { // premium
        newResults = [...mockMentalModels.slice(0, 3), ...mockCognitiveBiases.slice(0, 2)];
      }
      setResults(newResults);
      setIsLoading(false);
    }, 1000); // Simulate network delay
  }, [userInput, displayTier]);


  // NEW: Function to test the Edge Function
  const handleTestEdgeFunction = async () => {
    if (!session) {
      alert("You must be logged in to test the function.");
      setQueryResponse("Error: You must be logged in.");
      return;
    }

    if (!userInput.trim()) {
      alert("Please enter something in the 'What's on your mind?' field to send as a query.");
      setQueryResponse("Error: Please enter a query in the input field above.");
      return;
    }

    setIsLoadingQuery(true);
    setQueryResponse(null);
    setError(null); // Clear main error display

    // --- IMPORTANT: Replace with your actual Supabase project details ---
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aGF1Z2xwbmV3dHd6dGNwanhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzUyMjgsImV4cCI6MjA2MzM1MTIyOH0.UDo0SzmylY3VW2JR6-42P3F7BY8HPQ2jSiVkVn3aixc"; // YOUR Supabase Anon Key
    const edgeFunctionUrl = "https://ywhauglpnewtwztcpjxp.supabase.co/functions/v1/get-lattice-insights"; // YOUR Edge Function URL
    // --- End of section to replace ---
    
    const jwt = session.access_token;

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userInput }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error from Edge Function:", responseData);
        setQueryResponse(`Error ${response.status}: ${responseData.error || response.statusText}`);
      } else {
        console.log("Success from Edge Function:", responseData);
        setQueryResponse(JSON.stringify(responseData, null, 2));
      }
    } catch (error: any) {
      console.error("Network or other error calling Edge Function:", error);
      setQueryResponse(`Client-side error: ${error.message}`);
    } finally {
      setIsLoadingQuery(false);
    }
  };


  // Function to toggle developer test tier
  const toggleDevTier = () => {
    if (devTestTier === null) setDevTestTier('premium');
    else if (devTestTier === 'premium') setDevTestTier('free');
    else setDevTestTier(null); // Back to actual tier
  };

  return (
    <div className={`container mx-auto p-4 transition-all duration-300 ease-in-out ${showTierEffect ? (displayTier === 'premium' ? 'bg-blue-50' : 'bg-orange-50') : ''}`}>
      <h1 className="text-3xl font-bold text-center mb-6">Cosmic Lattice Dashboard</h1>
      
      {/* Developer Tier Toggle - As per handover doc, useful for testing UI */}
      <div className="fixed top-4 right-4 bg-gray-700 text-white p-2 rounded shadow-lg z-50">
        <label className="block text-xs">Dev Tier Override:</label>
        <Button onClick={toggleDevTier} size="sm" variant="outline" className="text-xs text-white hover:bg-gray-600">
          {devTestTier ? `Testing as ${devTestTier}` : `Actual: ${currentUserTier}`} (Toggle)
        </Button>
      </div>

      <div className="mb-8 p-6 bg-white shadow-xl rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="What's on your mind? Describe a situation or ask a question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-grow !text-lg p-3 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onKeyPress={(e) => { if (e.key === 'Enter') handleQuerySubmit(); }}
          />
          <Button 
            onClick={handleQuerySubmit} 
            disabled={isLoading || !userInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold !text-lg py-3 px-6"
          >
            {isLoading ? 'Thinking...' : 'Get Insights'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Temporary Edge Function Tester Section - NEW */}
      <div className="my-8 p-6 bg-gray-100 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Temporary Edge Function Tester</h2>
        <p className="text-sm text-gray-600 mb-3">
          The input field above ("What's on your mind?") will be used as the query for this test.
          Ensure you are logged in as the correct user (`ceyyla@gmail.com` or your test user with the `tier` set).
        </p>
        <Button onClick={handleTestEdgeFunction} disabled={isLoadingQuery} variant="destructive" size="lg">
          {isLoadingQuery ? "Calling Edge Function..." : "TEST: Call get-lattice-insights Function"}
        </Button>
        {queryResponse && (
          <div className="mt-4 p-3 border bg-white rounded shadow">
            <h3 className="font-semibold text-gray-700">Edge Function Response:</h3>
            <pre className="text-sm whitespace-pre-wrap break-all bg-gray-50 p-2 rounded mt-1">{queryResponse}</pre>
          </div>
        )}
      </div>
      {/* End of Temporary Edge Function Tester Section */}


      {/* Display Results - This part might need significant updates when real LLM data comes in */}
      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recommended Tools: ({displayTier} view)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <div 
                key={item.id} 
                className={`p-5 rounded-xl shadow-lg transition-all hover:shadow-2xl ${
                  item.type === 'mental_model' ? 'bg-cyan-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-sm mb-1"><span className="font-semibold">Category:</span> {item.category}</p>
                <p className="text-sm mb-3">{item.summary}</p>
                {item.explanation && <p className="text-xs italic mt-2 p-2 bg-black bg-opacity-10 rounded">LLM Note: {item.explanation}</p>}
                <div className="mt-3 space-x-2">
                  <Button variant="secondary" size="sm" className="bg-opacity-80 hover:bg-opacity-100">Learn More</Button>
                  {/* Add other buttons as needed */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Feature: Interactive Visualization */}
      {displayTier === 'premium' && results.length > 0 && (
        <div className="mt-12 p-6 bg-white shadow-xl rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Interactive Relationship Map (Premium)</h2>
          <div className="h-96 border rounded-md">
            {/* Pass appropriate data to InteractiveDemo */}
            <InteractiveDemo data={results.map(r => ({id: r.id, label: r.name, group: r.type === 'mental_model' ? 1 : 2}))} />
          </div>
        </div>
      )}

      {/* Upsell for Free Tier */}
      {displayTier === 'free' && results.length > 0 && (
         <div className="mt-10 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-xl text-center">
          <h3 className="text-2xl font-bold mb-3">Unlock More Insights & Visualizations!</h3>
          <p className="mb-4">Upgrade to Premium to get more recommendations and explore the interactive relationship map.</p>
          <Button size="lg" variant="outline" className="bg-white text-indigo-600 hover:bg-gray-100 font-bold">
            Upgrade to Premium
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;