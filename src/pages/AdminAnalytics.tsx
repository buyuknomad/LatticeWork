// src/pages/AdminAnalytics.tsx
// Create this new file for admin analytics (Preview of Phase 4)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchTrackingTest from '../components/Analytics/SearchTrackingTest';
import TrendingModels from '../components/Analytics/TrendingModels';
import { 
  BarChart, 
  Activity, 
  Search, 
  TrendingUp, 
  AlertCircle,
  Users,
  Clock,
  Target
} from 'lucide-react';
import { 
  getSearchInsights, 
  getPopularSearches, 
  getContentGaps,
  getSearchFunnel
} from '../utils/searchAnalytics';

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'test'>('overview');
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Check admin access
  const isAdmin = user?.email === 'infiernodel@gmail.com' || 
                  user?.user_metadata?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/dashboard');
    } else {
      loadMetrics();
    }
  }, [user, isAdmin, navigate]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [insights, popular, gaps, funnel] = await Promise.all([
        getSearchInsights(),
        getPopularSearches(5, 7),
        getContentGaps(5, 30),
        getSearchFunnel()
      ]);

      setMetrics({
        insights: insights[0] || {},
        popularSearches: popular,
        contentGaps: gaps,
        funnel
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'search', label: 'Search Analytics', icon: Search },
    { id: 'test', label: 'Test Suite', icon: Activity }
  ];

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Monitor search performance and user behavior</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-700">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Activity className="w-8 h-8 animate-spin text-[#00FFFF]" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <MetricCard
                    icon={Search}
                    label="Total Searches"
                    value={metrics.insights.total_searches || 0}
                    change="+12%"
                    color="text-[#00FFFF]"
                  />
                  <MetricCard
                    icon={Target}
                    label="Click Rate"
                    value={`${metrics.insights.click_through_rate || 0}%`}
                    change="+5%"
                    color="text-green-500"
                  />
                  <MetricCard
                    icon={AlertCircle}
                    label="Failed Searches"
                    value={`${metrics.insights.failure_rate || 0}%`}
                    change="-3%"
                    color="text-yellow-500"
                  />
                  <MetricCard
                    icon={Clock}
                    label="Avg Time to Click"
                    value={`${Math.round((metrics.insights.avg_time_to_click || 0) / 1000)}s`}
                    change="-8%"
                    color="text-purple-500"
                  />
                </div>

                {/* Trending Models */}
                <div className="bg-[#252525] rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#00FFFF]" />
                    Trending Models
                  </h2>
                  <TrendingModels />
                </div>
              </div>
            )}

            {/* Search Analytics Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                {/* Popular Searches */}
                <div className="bg-[#252525] rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
                  <div className="space-y-2">
                    {metrics.popularSearches?.map((search: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span>{search.search_query}</span>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>{search.search_count} searches</span>
                          <span>{search.click_through_rate}% CTR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Gaps */}
                <div className="bg-[#252525] rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Content Gaps (Failed Searches)</h3>
                  <div className="space-y-2">
                    {metrics.contentGaps?.map((gap: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-red-400">{gap.search_query}</span>
                        <span className="text-sm text-gray-400">
                          {gap.failure_count} attempts by {gap.unique_users} users
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search Funnel */}
                <div className="bg-[#252525] rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Search Funnel</h3>
                  <div className="space-y-3">
                    {metrics.funnel?.map((stage: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="flex justify-between items-center">
                          <span>{stage.funnel_stage}</span>
                          <span className="text-[#00FFFF]">{stage.count} ({stage.percentage}%)</span>
                        </div>
                        <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]"
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Test Suite Tab */}
            {activeTab === 'test' && (
              <SearchTrackingTest />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  icon: any;
  label: string;
  value: string | number;
  change: string;
  color: string;
}> = ({ icon: Icon, label, value, change, color }) => (
  <div className="bg-[#252525] rounded-lg p-4">
    <div className="flex items-start justify-between mb-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </span>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

export default AdminAnalytics;