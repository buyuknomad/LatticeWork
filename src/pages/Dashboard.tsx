import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Ensure we have the latest session data
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Force a session refresh
        await refreshSession();
        
        // Get user data for debugging
        const { data: userData } = await supabase.auth.getUser();
        setDebugInfo({
          user: userData?.user || null,
          metadata: userData?.user?.user_metadata || null,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [refreshSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF]"></div>
      </div>
    );
  }

  // Fallback case if user is somehow null
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-[#212327] rounded-xl p-6 md:p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            Session Issue Detected
          </h1>
          <p className="text-gray-300 mb-4">
            We couldn't load your user data. Please try logging in again.
          </p>
          <div className="bg-[#2A2D35] p-4 rounded-lg mb-4 overflow-auto max-h-60">
            <pre className="text-xs text-gray-400">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
          <button 
            className="bg-[#00FFFF] text-[#1A1A1A] font-medium py-2 px-4 rounded-lg"
            onClick={() => window.location.href = '/login'}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#212327] rounded-xl p-6 md:p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            Welcome, {user?.user_metadata?.full_name || user?.email || 'User'}!
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#00FFFF]">
              Your Mental Models Dashboard
            </h2>
            <p className="text-gray-300">
              This is where you'll be able to use the mental models and cognitive biases 
              to analyze situations and make better decisions.
            </p>
          </div>
          
          {/* Placeholder for the main dashboard content */}
          <div className="bg-[#2A2D35] rounded-lg p-6 mb-6">
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                You have 2 queries available today in the free tier.
              </p>
              <button 
                className="bg-[#00FFFF] text-[#1A1A1A] font-medium py-3 px-6 rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          </div>
          
          {/* Upgrade prompt */}
          <div className="bg-gradient-to-r from-[#1F1F1F] to-[#252525] rounded-lg p-6 border border-[#333333]">
            <h3 className="text-lg font-semibold mb-2">
              Upgrade to Premium
            </h3>
            <p className="text-gray-300 mb-4">
              Get unlimited queries, access to all 300 mental models, and detailed application guidance.
            </p>
            <button 
              className="bg-[#8B5CF6] text-white py-2 px-4 rounded-lg hover:bg-[#8B5CF6]/90 transition-colors"
            >
              View Plans
            </button>
          </div>
          
          {/* Debug section - remove in production */}
          <div className="mt-8 p-4 bg-[#1F1F1F] rounded-lg border border-[#333333]">
            <h3 className="text-sm font-medium mb-2 text-gray-400">Debug Information</h3>
            <div className="bg-[#2A2D35] p-4 rounded-lg overflow-auto max-h-60">
              <pre className="text-xs text-gray-400">
                {JSON.stringify({ 
                  user: {
                    id: user.id,
                    email: user.email,
                    metadata: user.user_metadata
                  }
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;