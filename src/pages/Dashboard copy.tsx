// src/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
// REMOVED: import { Input } from "@/components/ui/input";
// REMOVED: import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
// import { supabase } from '../lib/supabase'; // Not used in this version directly, but good to have if needed elsewhere
// import { User } from '@supabase/supabase-js'; // Not directly used if user comes from useAuth
import InteractiveDemo from '@/components/InteractiveDemo'; // Assuming this path is correct, if it exists. If not, comment it out too.

// Define a type for the results you expect to display eventually
interface LatticeResult {
  id: string;
  name: string;
  category: string;
  summary: string;
  type: 'mental_model' | 'cognitive_bias';
  explanation?: string;
}

const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<LatticeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTierEffect, setShowTierEffect] = useState(false);

  const [queryResponse, setQueryResponse] = useState<string | null>(null);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);

  const [currentUserTier, setCurrentUserTier] = useState<'free' | 'premium'>('free');
  const [devTestTier, setDevTestTier] = useState<'free' | 'premium' | null>(null);
  const displayTier = devTestTier || currentUserTier;

  useEffect(() => {
    if (user?.user_metadata?.tier) {
      setCurrentUserTier(user.user_metadata.tier as 'free' | 'premium');
    }
  }, [user]);

  useEffect(() => {
    if (devTestTier) {
      setShowTierEffect(true);
      const timer = setTimeout(() => setShowTierEffect(false), 300);
      return () => clearTimeout(timer);
    }
  }, [devTestTier]);

  const handleQuerySubmit = useCallback(async () => {
    // This is your placeholder submit, we'll leave it for now
    if (!userInput.trim()) {
      setError("Please enter a query.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);
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
      } else {
        newResults = [...mockMentalModels.slice(0, 3), ...mockCognitiveBiases.slice(0, 2)];
      }
      setResults(newResults);
      setIsLoading(false);
    }, 1000);
  }, [userInput, displayTier]);

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
    setError(null);

    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aGF1Z2xwbmV3dHd6dGNwanhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzUyMjgsImV4cCI6MjA2MzM1MTIyOH0.UDo0SzmylY3VW2JR6-42P3F7BY8HPQ2jSiVkVn3aixc";
    const edgeFunctionUrl = "https://ywhauglpnewtwztcpjxp.supabase.co/functions/v1/get-lattice-insights";
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

  const toggleDevTier = () => {
    if (devTestTier === null) setDevTestTier('premium');
    else if (devTestTier === 'premium') setDevTestTier('free');
    else setDevTestTier(null);
  };

  // Basic styling for temporary HTML elements
  const basicInputStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '8px',
    fontSize: '16px',
    flexGrow: 1,
  };
  const basicButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    marginLeft: '8px'
  };
   const destructiveButtonStyle: React.CSSProperties = {
    ...basicButtonStyle,
    backgroundColor: '#dc3545', // A red color for destructive/test
  };


  return (
    <div className={`container mx-auto p-4 transition-all duration-300 ease-in-out ${showTierEffect ? (displayTier === 'premium' ? 'bg-blue-50' : 'bg-orange-50') : ''}`}>
      <h1 className="text-3xl font-bold text-center mb-6">Cosmic Lattice Dashboard</h1>
      
      <div className="fixed top-4 right-4 bg-gray-700 text-white p-2 rounded shadow-lg z-50">
        <label className="block text-xs">Dev Tier Override:</label>
        {/* Using basic button for toggle too */}
        <button onClick={toggleDevTier} style={{...basicButtonStyle, fontSize: '12px', backgroundColor: '#6c757d'}}>
          {devTestTier ? `Testing as ${devTestTier}` : `Actual: ${currentUserTier}`} (Toggle)
        </button>
      </div>

      <div className="mb-8 p-6 bg-white shadow-xl rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          {/* Using basic HTML input */}
          <input
            type="text"
            placeholder="What's on your mind? Describe a situation or ask a question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            style={basicInputStyle}
            onKeyPress={(e) => { if (e.key === 'Enter') handleQuerySubmit(); }}
          />
          {/* Using basic HTML button */}
          <button 
            onClick={handleQuerySubmit} 
            disabled={isLoading || !userInput.trim()}
            style={isLoading ? {...basicButtonStyle, backgroundColor: '#6c757d'} : basicButtonStyle }
          >
            {isLoading ? 'Thinking...' : 'Get Insights'}
          </button>
        </div>
        {error && <p style={{color: 'red', fontSize: '14px', marginTop: '8px'}}>{error}</p>}
      </div>

      <div className="my-8 p-6 bg-gray-100 shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Temporary Edge Function Tester</h2>
        <p className="text-sm text-gray-600 mb-3">
          The input field above ("What's on your mind?") will be used as the query for this test.
          Ensure you are logged in as the correct user.
        </p>
        {/* Using basic HTML button */}
        <button onClick={handleTestEdgeFunction} disabled={isLoadingQuery} style={isLoadingQuery ? {...destructiveButtonStyle, backgroundColor: '#6c757d'} : destructiveButtonStyle}>
          {isLoadingQuery ? "Calling Edge Function..." : "TEST: Call get-lattice-insights Function"}
        </button>
        {queryResponse && (
          <div className="mt-4 p-3 border bg-white rounded shadow">
            <h3 className="font-semibold text-gray-700">Edge Function Response:</h3>
            <pre className="text-sm whitespace-pre-wrap break-all bg-gray-50 p-2 rounded mt-1">{queryResponse}</pre>
          </div>
        )}
      </div>

      {results.length > 0 && (
         <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recommended Tools: ({displayTier} view)</h2>
          {/* ... result display ... this part will also need styling adjustments if Button/Input were heavily used inside */}
        </div>
      )}

      {/* Commenting out InteractiveDemo if it's not set up yet */}
      {/* {displayTier === 'premium' && results.length > 0 && (
        <div className="mt-12 p-6 bg-white shadow-xl rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Interactive Relationship Map (Premium)</h2>
          <div className="h-96 border rounded-md">
            <InteractiveDemo data={results.map(r => ({id: r.id, label: r.name, group: r.type === 'mental_model' ? 1 : 2}))} />
          </div>
        </div>
      )} */}

      {displayTier === 'free' && results.length > 0 && (
         <div className="mt-10 p-6" style={{background: 'linear-gradient(to right, #6d28d9, #4f46e5)', color: 'white', borderRadius: '8px', textAlign: 'center'}}>
          <h3 className="text-2xl font-bold mb-3">Unlock More Insights & Visualizations!</h3>
          <p className="mb-4">Upgrade to Premium to get more recommendations and explore the interactive relationship map.</p>
          {/* Using basic HTML button */}
          <button style={{...basicButtonStyle, backgroundColor: 'white', color: '#4f46e5'}}>
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;