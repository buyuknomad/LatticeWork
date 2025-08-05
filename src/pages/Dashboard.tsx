// src/pages/Dashboard.tsx
// Replace your Dashboard temporarily with this minimal version to debug

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  console.log('Dashboard component mounting');
  
  const { user, session } = useAuth();
  const [debugState, setDebugState] = useState({
    componentMounted: true,
    userLoaded: !!user,
    errors: [] as string[]
  });

  useEffect(() => {
    console.log('Dashboard useEffect - user:', user);
    console.log('Dashboard useEffect - session:', session);
  }, [user, session]);

  // Try to render something no matter what
  try {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white p-8">
        <h1 className="text-3xl font-bold mb-4 text-[#00FFFF]">Dashboard Debug</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-4">Auth Status:</h2>
          <p>User exists: <span className="text-green-400">{user ? 'Yes' : 'No'}</span></p>
          <p>Email: <span className="text-blue-400">{user?.email || 'None'}</span></p>
          <p>User ID: <span className="text-gray-400">{user?.id || 'None'}</span></p>
          <p>Tier: <span className="text-purple-400">{user?.user_metadata?.tier || 'Not set'}</span></p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Next Steps:</h2>
          <p className="mb-2">✅ If you see this, the Dashboard component is rendering</p>
          <p className="mb-2">✅ Authentication is working</p>
          <p className="mb-2">✅ The routing is correct</p>
          <p className="text-yellow-400 mt-4">The issue is in the original Dashboard component's logic</p>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-[#00FFFF] text-black px-6 py-2 rounded hover:bg-[#00CCCC]"
        >
          Reload Page
        </button>
      </div>
    );
  } catch (error) {
    console.error('Dashboard render error:', error);
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white p-8">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Dashboard Error</h1>
        <p>Error rendering dashboard: {String(error)}</p>
      </div>
    );
  }
};

export default Dashboard;