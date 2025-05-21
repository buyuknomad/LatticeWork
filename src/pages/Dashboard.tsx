import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#212327] rounded-xl p-6 md:p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            Welcome, {user?.user_metadata?.full_name || 'User'}!
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;