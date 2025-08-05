// src/pages/Dashboard.tsx
// Temporarily replace your Dashboard with this debug version

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  console.log('Dashboard component rendering - TOP LEVEL');
  
  const { user, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Log all the important values
  console.log('Dashboard - User:', user);
  console.log('Dashboard - Session:', session);
  console.log('Dashboard - Location:', location);
  
  const [debugInfo, setDebugInfo] = useState({
    renderCount: 0,
    userEmail: user?.email || 'No email',
    userId: user?.id || 'No ID',
    userTier: user?.user_metadata?.tier || 'No tier set',
    hasSession: !!session,
    errors: [] as string[]
  });

  useEffect(() => {
    console.log('Dashboard useEffect running');
    setDebugInfo(prev => ({ ...prev, renderCount: prev.renderCount + 1 }));
  }, []);

  // Test Supabase connection
  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
          .from('trending_questions')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Supabase test error:', error);
          setDebugInfo(prev => ({ 
            ...prev, 
            errors: [...prev.errors, `Supabase error: ${error.message}`] 
          }));
        } else {
          console.log('Supabase connection successful:', data);
        }
      } catch (err) {
        console.error('Caught error:', err);
        setDebugInfo(prev => ({ 
          ...prev, 
          errors: [...prev.errors, `Caught error: ${err}`] 
        }));
      }
    };
    
    if (user) {
      testSupabase();
    }
  }, [user]);

  // This should ALWAYS render something
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard Debug Mode</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information:</h2>
        
        <div className="space-y-2">
          <p><strong>Render Count:</strong> {debugInfo.renderCount}</p>
          <p><strong>User Email:</strong> {debugInfo.userEmail}</p>
          <p><strong>User ID:</strong> {debugInfo.userId}</p>
          <p><strong>User Tier:</strong> {debugInfo.userTier}</p>
          <p><strong>Has Session:</strong> {debugInfo.hasSession ? 'Yes' : 'No'}</p>
          <p><strong>Current Path:</strong> {location.pathname}</p>
          
          {debugInfo.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-red-400 font-semibold">Errors:</p>
              {debugInfo.errors.map((error, index) => (
                <p key={index} className="text-red-300 text-sm">{error}</p>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6 space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Go to Home
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Reload Page
          </button>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/');
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">If you see this message:</h2>
        <p>✅ The routing is working correctly</p>
        <p>✅ The authentication is working correctly</p>
        <p>✅ The Dashboard component is rendering</p>
        <p className="mt-4 text-yellow-400">The issue was in the original Dashboard component's logic.</p>
      </div>
    </div>
  );
};

export default Dashboard;