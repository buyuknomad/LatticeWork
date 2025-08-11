// src/components/Analytics/MetricCards.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Target, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  Activity,
  BarChart3,
  Eye,
  Zap,
  Award,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface MetricData {
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  sparkline?: number[];
}

interface MetricCardProps {
  icon: any;
  label: string;
  value: string | number;
  change: string;
  color: string;
  sparkline?: number[];
  isLoading?: boolean;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  color, 
  sparkline,
  isLoading = false,
  subtitle
}) => {
  const [prevValue, setPrevValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsUpdating(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsUpdating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const isPositive = change.startsWith('+');
  const isNeutral = change === '0%' || change === '-';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-[#252525] rounded-lg p-4 relative overflow-hidden ${
        isUpdating ? 'ring-2 ring-[#00FFFF]/50' : ''
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#00FFFF]/10 to-transparent" />
      </div>

      {/* Pulse Animation on Update */}
      {isUpdating && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-[#00FFFF]/20 rounded-lg"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg bg-black/30`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {!isNeutral && (
            <div className={`flex items-center gap-1 text-xs ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              <TrendIcon className="w-3 h-3" />
              <span>{change}</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
            </div>
          ) : (
            <motion.div
              key={value.toString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
            >
              <div className="text-2xl font-bold mb-1 text-white">
                {value}
              </div>
              <div className="text-sm text-gray-400">{label}</div>
              {subtitle && (
                <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkline */}
        {sparkline && sparkline.length > 0 && (
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {sparkline.map((value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${(value / Math.max(...sparkline)) * 100}%` }}
                transition={{ delay: index * 0.02 }}
                className={`flex-1 ${color.replace('text-', 'bg-')}/30 rounded-t hover:opacity-80 transition-opacity`}
                title={`Value: ${value}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MetricCards: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({
    totalSearches: { value: 0, change: 0, trend: 'neutral' },
    clickRate: { value: '0%', change: 0, trend: 'neutral' },
    failureRate: { value: '0%', change: 0, trend: 'neutral' },
    avgTimeToClick: { value: '0s', change: 0, trend: 'neutral' },
    uniqueUsers: { value: 0, change: 0, trend: 'neutral' },
    modelViews: { value: 0, change: 0, trend: 'neutral' },
    avgDuration: { value: '0s', change: 0, trend: 'neutral' },
    engagement: { value: '0%', change: 0, trend: 'neutral' },
    bounceRate: { value: '0%', change: 0, trend: 'neutral' },
    returnRate: { value: '0%', change: 0, trend: 'neutral' },
    conversionRate: { value: '0%', change: 0, trend: 'neutral' },
    satisfaction: { value: '0', change: 0, trend: 'neutral' }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    if (!user?.id) return;

    try {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      // Fetch current period metrics
      const [searchData, viewData, aggregateData, userActivity] = await Promise.all([
        // Search metrics
        supabase
          .from('mental_model_searches')
          .select('*')
          .gte('created_at', dayAgo.toISOString()),
        
        // View metrics
        supabase
          .from('mental_model_views')
          .select('*')
          .gte('created_at', dayAgo.toISOString()),
        
        // Aggregate metrics
        supabase
          .from('mental_model_aggregates')
          .select('*')
          .order('total_views', { ascending: false })
          .limit(10),
          
        // User activity for return rate
        supabase
          .from('mental_model_views')
          .select('user_id, created_at')
          .gte('created_at', weekAgo.toISOString())
      ]);

      // Fetch previous period for comparison
      const [prevSearchData, prevViewData] = await Promise.all([
        supabase
          .from('mental_model_searches')
          .select('*')
          .gte('created_at', twoDaysAgo.toISOString())
          .lt('created_at', dayAgo.toISOString()),
        
        supabase
          .from('mental_model_views')
          .select('*')
          .gte('created_at', twoDaysAgo.toISOString())
          .lt('created_at', dayAgo.toISOString())
      ]);

      // Calculate metrics
      const searches = searchData.data || [];
      const views = viewData.data || [];
      const prevSearches = prevSearchData.data || [];
      const prevViews = prevViewData.data || [];
      const allUserActivity = userActivity.data || [];

      // Search metrics
      const totalSearches = searches.length;
      const clickedSearches = searches.filter(s => s.clicked_result_slug).length;
      const failedSearches = searches.filter(s => s.failed_search).length;
      const clickRate = totalSearches > 0 ? Math.round((clickedSearches / totalSearches) * 100) : 0;
      const failureRate = totalSearches > 0 ? Math.round((failedSearches / totalSearches) * 100) : 0;
      
      const timesToClick = searches
        .filter(s => s.time_to_click_ms)
        .map(s => s.time_to_click_ms);
      const avgTimeToClick = timesToClick.length > 0
        ? Math.round(timesToClick.reduce((a, b) => a + b, 0) / timesToClick.length / 1000)
        : 0;

      // View metrics
      const totalViews = views.length;
      const uniqueModels = new Set(views.map(v => v.model_slug)).size;
      const uniqueUsers = new Set([...searches.map(s => s.user_id), ...views.map(v => v.user_id)]).size;
      
      const durations = views.filter(v => v.view_duration).map(v => v.view_duration);
      const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

      // Engagement metrics
      const engagedViews = views.filter(v => v.view_duration > 10).length;
      const engagement = totalViews > 0 ? Math.round((engagedViews / totalViews) * 100) : 0;
      
      // Bounce rate (single page sessions)
      const sessionGroups = views.reduce((acc, view) => {
        const session = view.session_id || view.user_id;
        if (!acc[session]) acc[session] = [];
        acc[session].push(view);
        return acc;
      }, {} as Record<string, any[]>);
      
      const singlePageSessions = Object.values(sessionGroups).filter(s => s.length === 1).length;
      const totalSessions = Object.keys(sessionGroups).length;
      const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0;
      
      // Return rate (users who came back)
      const usersByDay = allUserActivity.reduce((acc, activity) => {
        const day = new Date(activity.created_at).toDateString();
        const userId = activity.user_id;
        if (!acc[userId]) acc[userId] = new Set();
        acc[userId].add(day);
        return acc;
      }, {} as Record<string, Set<string>>);
      
      const returningUsers = Object.values(usersByDay).filter(days => days.size > 1).length;
      const totalUsersWeek = Object.keys(usersByDay).length;
      const returnRate = totalUsersWeek > 0 ? Math.round((returningUsers / totalUsersWeek) * 100) : 0;
      
      // Conversion rate (completed important actions)
      const conversions = views.filter(v => v.view_duration > 60).length; // Views > 1 minute as conversion
      const conversionRate = totalViews > 0 ? Math.round((conversions / totalViews) * 100) : 0;
      
      // Satisfaction score (composite metric)
      const satisfactionScore = Math.round(
        (clickRate * 0.3 + engagement * 0.3 + (100 - bounceRate) * 0.2 + returnRate * 0.2) / 10
      ) / 10;

      // Calculate changes
      const prevTotalSearches = prevSearches.length;
      const prevTotalViews = prevViews.length;
      const prevClickRate = prevTotalSearches > 0 
        ? Math.round((prevSearches.filter(s => s.clicked_result_slug).length / prevTotalSearches) * 100)
        : 0;
      const prevFailureRate = prevTotalSearches > 0
        ? Math.round((prevSearches.filter(s => s.failed_search).length / prevTotalSearches) * 100)
        : 0;

      const searchChange = prevTotalSearches > 0 
        ? Math.round(((totalSearches - prevTotalSearches) / prevTotalSearches) * 100)
        : 0;
      const viewChange = prevTotalViews > 0
        ? Math.round(((totalViews - prevTotalViews) / prevTotalViews) * 100)
        : 0;
      const clickRateChange = clickRate - prevClickRate;
      const failureRateChange = failureRate - prevFailureRate;

      // Generate sparklines (last 24 hours, hourly)
      const generateSparkline = (data: any[], field: string = 'created_at') => {
        const hourly = Array(24).fill(0);
        const now = new Date();
        
        data.forEach(item => {
          const itemDate = new Date(item[field]);
          const hoursAgo = Math.floor((now.getTime() - itemDate.getTime()) / (60 * 60 * 1000));
          if (hoursAgo >= 0 && hoursAgo < 24) {
            hourly[23 - hoursAgo]++;
          }
        });
        return hourly.slice(-12); // Last 12 hours for display
      };

      setMetrics({
        totalSearches: {
          value: totalSearches,
          change: searchChange,
          trend: searchChange > 0 ? 'up' : searchChange < 0 ? 'down' : 'neutral',
          sparkline: generateSparkline(searches)
        },
        clickRate: {
          value: `${clickRate}%`,
          change: clickRateChange,
          trend: clickRateChange > 0 ? 'up' : clickRateChange < 0 ? 'down' : 'neutral'
        },
        failureRate: {
          value: `${failureRate}%`,
          change: failureRateChange,
          trend: failureRateChange < 0 ? 'up' : failureRateChange > 0 ? 'down' : 'neutral' // Inverted
        },
        avgTimeToClick: {
          value: `${avgTimeToClick}s`,
          change: 0,
          trend: 'neutral'
        },
        uniqueUsers: {
          value: uniqueUsers,
          change: 0,
          trend: 'neutral'
        },
        modelViews: {
          value: totalViews,
          change: viewChange,
          trend: viewChange > 0 ? 'up' : viewChange < 0 ? 'down' : 'neutral',
          sparkline: generateSparkline(views)
        },
        avgDuration: {
          value: `${avgDuration}s`,
          change: 0,
          trend: 'neutral'
        },
        engagement: {
          value: `${engagement}%`,
          change: 0,
          trend: engagement > 50 ? 'up' : 'neutral'
        },
        bounceRate: {
          value: `${bounceRate}%`,
          change: 0,
          trend: bounceRate < 30 ? 'up' : 'down'
        },
        returnRate: {
          value: `${returnRate}%`,
          change: 0,
          trend: returnRate > 30 ? 'up' : 'neutral'
        },
        conversionRate: {
          value: `${conversionRate}%`,
          change: 0,
          trend: conversionRate > 20 ? 'up' : 'neutral'
        },
        satisfaction: {
          value: satisfactionScore.toFixed(1),
          change: 0,
          trend: satisfactionScore > 7 ? 'up' : satisfactionScore < 5 ? 'down' : 'neutral'
        }
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchMetrics();
  };

  const formatChange = (change: number, trend: string): string => {
    if (change === 0) return '-';
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header with last update and refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00FFFF]" />
          Real-time Metrics
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Search}
          label="Total Searches"
          value={metrics.totalSearches.value}
          change={formatChange(metrics.totalSearches.change, metrics.totalSearches.trend)}
          color="text-[#00FFFF]"
          sparkline={metrics.totalSearches.sparkline}
          isLoading={isLoading}
          subtitle="Last 24 hours"
        />
        <MetricCard
          icon={MousePointer}
          label="Click-Through Rate"
          value={metrics.clickRate.value}
          change={formatChange(metrics.clickRate.change, metrics.clickRate.trend)}
          color="text-green-500"
          isLoading={isLoading}
          subtitle="Search to click"
        />
        <MetricCard
          icon={AlertCircle}
          label="Failed Searches"
          value={metrics.failureRate.value}
          change={formatChange(metrics.failureRate.change, metrics.failureRate.trend)}
          color="text-yellow-500"
          isLoading={isLoading}
          subtitle="No results found"
        />
        <MetricCard
          icon={Clock}
          label="Time to Click"
          value={metrics.avgTimeToClick.value}
          change={formatChange(metrics.avgTimeToClick.change, metrics.avgTimeToClick.trend)}
          color="text-purple-500"
          isLoading={isLoading}
          subtitle="Average response"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Active Users"
          value={metrics.uniqueUsers.value}
          change={formatChange(metrics.uniqueUsers.change, metrics.uniqueUsers.trend)}
          color="text-blue-500"
          isLoading={isLoading}
          subtitle="Unique visitors"
        />
        <MetricCard
          icon={Eye}
          label="Model Views"
          value={metrics.modelViews.value}
          change={formatChange(metrics.modelViews.change, metrics.modelViews.trend)}
          color="text-orange-500"
          sparkline={metrics.modelViews.sparkline}
          isLoading={isLoading}
          subtitle="Total page views"
        />
        <MetricCard
          icon={Clock}
          label="Avg Duration"
          value={metrics.avgDuration.value}
          change={formatChange(metrics.avgDuration.change, metrics.avgDuration.trend)}
          color="text-pink-500"
          isLoading={isLoading}
          subtitle="Time on model"
        />
        <MetricCard
          icon={Target}
          label="Engagement Rate"
          value={metrics.engagement.value}
          change={formatChange(metrics.engagement.change, metrics.engagement.trend)}
          color="text-indigo-500"
          isLoading={isLoading}
          subtitle="Views > 10s"
        />
      </div>

      {/* Advanced Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingDown}
          label="Bounce Rate"
          value={metrics.bounceRate.value}
          change={formatChange(metrics.bounceRate.change, metrics.bounceRate.trend)}
          color="text-red-500"
          isLoading={isLoading}
          subtitle="Single page sessions"
        />
        <MetricCard
          icon={Zap}
          label="Return Rate"
          value={metrics.returnRate.value}
          change={formatChange(metrics.returnRate.change, metrics.returnRate.trend)}
          color="text-emerald-500"
          isLoading={isLoading}
          subtitle="Returning users"
        />
        <MetricCard
          icon={Award}
          label="Conversion Rate"
          value={metrics.conversionRate.value}
          change={formatChange(metrics.conversionRate.change, metrics.conversionRate.trend)}
          color="text-amber-500"
          isLoading={isLoading}
          subtitle="Deep engagement"
        />
        <MetricCard
          icon={BarChart3}
          label="Satisfaction Score"
          value={metrics.satisfaction.value}
          change={formatChange(metrics.satisfaction.change, metrics.satisfaction.trend)}
          color="text-cyan-500"
          isLoading={isLoading}
          subtitle="Composite metric"
        />
      </div>

      {/* Performance Summary */}
      <div className="bg-[#1A1A1A] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00FFFF]" />
            <span className="text-sm text-gray-400">System Performance</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-500">● Excellent</span>
            <span className="text-yellow-500">● Good</span>
            <span className="text-red-500">● Needs Attention</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCards;