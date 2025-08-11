// src/pages/AdminAnalytics.tsx
// Updated AdminAnalytics page with all Phase 4 components integrated

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Activity, 
  Search, 
  TrendingUp, 
  GitBranch,
  Award,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all Phase 4 components
import MetricCards from '../components/Analytics/MetricCards';
import SearchInsightsChart from '../components/Analytics/SearchInsightsChart';
import ModelPerformanceTable from '../components/Analytics/ModelPerformanceTable';
import UserJourneyFlow from '../components/Analytics/UserJourneyFlow';
import SearchTrackingTest from '../components/Analytics/SearchTrackingTest';
import TrendingModels from '../components/Analytics/TrendingModels';

// Import analytics utilities
import { 
  exportSearchAnalytics,
  refreshSearchInsights 
} from '../utils/searchAnalytics';

type TabType = 'overview' | 'search' | 'models' | 'journeys' | 'test';

const AdminAnalytics: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [exportRange, setExportRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showSettings, setShowSettings] = useState(false);

  // Check admin access
  const isAdmin = user?.email === 'infiernodel@gmail.com' || 
                  user?.user_metadata?.role === 'admin';

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refreshSearchInsights();
      setLastRefresh(new Date());
      // Trigger re-render of components
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = async () => {
    try {
      const days = exportRange === '7d' ? 7 : exportRange === '30d' ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const data = await exportSearchAnalytics(startDate, endDate, 'csv');
      if (data) {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${exportRange}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: any; description: string }> = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart,
      description: 'Real-time metrics and trending models'
    },
    { 
      id: 'search', 
      label: 'Search Analytics', 
      icon: Search,
      description: 'Search performance and insights'
    },
    { 
      id: 'models', 
      label: 'Model Performance', 
      icon: Award,
      description: 'Detailed model analytics'
    },
    { 
      id: 'journeys', 
      label: 'User Journeys', 
      icon: GitBranch,
      description: 'User navigation patterns'
    },
    { 
      id: 'test', 
      label: 'Test Suite', 
      icon: Activity,
      description: 'Verify tracking implementation'
    }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-400">
                Monitor performance, track user behavior, and optimize the learning experience
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="p-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#252525] rounded-lg p-4 mb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Export Range:</span>
                    <select
                      value={exportRange}
                      onChange={(e) => setExportRange(e.target.value as any)}
                      className="px-3 py-1 bg-[#1A1A1A] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-2 px-4 py-1 bg-[#00FFFF] text-black rounded hover:bg-[#00FFFF]/90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last refresh: {lastRefresh.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Tabs with Descriptions */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative p-4 rounded-lg transition-all transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#00FFFF]/20 to-[#8B5CF6]/20 border border-[#00FFFF]/50'
                      : 'bg-[#252525] hover:bg-[#333333] border border-transparent'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-6 h-6 ${isActive ? 'text-[#00FFFF]' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {tab.label}
                    </span>
                    <span className="text-xs text-gray-500 text-center hidden md:block">
                      {tab.description}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/10 to-[#8B5CF6]/10 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <MetricCards />
                
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Trending Models */}
                  <div className="bg-[#252525] rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#00FFFF]" />
                      Trending Models
                    </h2>
                    <TrendingModels />
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="bg-[#252525] rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Platform Health</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Search Quality Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]" style={{ width: '78%' }} />
                          </div>
                          <span className="text-white font-medium">78%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Content Coverage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '92%' }} />
                          </div>
                          <span className="text-white font-medium">92%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">User Satisfaction</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '85%' }} />
                          </div>
                          <span className="text-white font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">System Performance</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '94%' }} />
                          </div>
                          <span className="text-white font-medium">94%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Analytics Tab */}
            {activeTab === 'search' && <SearchInsightsChart />}

            {/* Model Performance Tab */}
            {activeTab === 'models' && <ModelPerformanceTable />}

            {/* User Journeys Tab */}
            {activeTab === 'journeys' && <UserJourneyFlow />}

            {/* Test Suite Tab */}
            {activeTab === 'test' && (
              <div className="space-y-6">
                <SearchTrackingTest />
                
                {/* Additional Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-[#252525] rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">User ID:</span>
                        <span className="ml-2 text-white font-mono">{user?.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="ml-2 text-white">{user?.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Role:</span>
                        <span className="ml-2 text-white">{user?.user_metadata?.role || 'admin'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Environment:</span>
                        <span className="ml-2 text-white">{process.env.NODE_ENV}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminAnalytics;