// src/components/Analytics/UserJourneyFlow.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Treemap
} from 'recharts';
import { 
  GitBranch, 
  Users, 
  ArrowRight, 
  Clock,
  Target,
  Zap,
  TrendingUp,
  Filter,
  RefreshCw,
  Navigation,
  Map
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface PathMetrics {
  path: string;
  count: number;
  avgDuration: number;
  completionRate: number;
}

interface SourceDistribution {
  source: string;
  count: number;
  percentage: number;
}

interface CategoryTransition {
  from: string;
  to: string;
  count: number;
}

interface ModelFlow {
  name: string;
  value: number;
  children?: ModelFlow[];
}

const COLORS = ['#00FFFF', '#8B5CF6', '#FFB84D', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FFA07A', '#98D8C8'];

const UserJourneyFlow: React.FC = () => {
  const [flowData, setFlowData] = useState<ModelFlow[]>([]);
  const [pathMetrics, setPathMetrics] = useState<PathMetrics[]>([]);
  const [sourceDistribution, setSourceDistribution] = useState<SourceDistribution[]>([]);
  const [categoryTransitions, setCategoryTransitions] = useState<CategoryTransition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [minPathLength, setMinPathLength] = useState(2);
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneyData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Build query
      let query = supabase
        .from('mental_model_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      const { data: views, error: viewError } = await query;
      if (viewError) throw viewError;

      // Get unique users from the views data itself (no admin API needed)
      if (views && views.length > 0) {
        const userIds = [...new Set(views.map(v => v.user_id).filter(Boolean))];
        setUniqueUsers(userIds);
        
        // Process the data
        processFlowData(views);
        processPathMetrics(views);
        processSourceDistribution(views);
        processCategoryTransitions(views);
      } else {
        // Reset if no data
        setFlowData([]);
        setPathMetrics([]);
        setSourceDistribution([]);
        setCategoryTransitions([]);
      }
    } catch (error) {
      console.error('Error fetching journey data:', error);
      setError('Failed to load journey data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processFlowData = (views: any[]) => {
    try {
      // Create a hierarchical structure for Treemap instead of Sankey
      // to avoid circular reference issues
      const categoryMap: Record<string, Record<string, number>> = {};
      
      // Group by category and model
      views.forEach(view => {
        const category = view.category || 'uncategorized';
        const model = view.model_name || view.model_slug;
        
        if (!categoryMap[category]) {
          categoryMap[category] = {};
        }
        
        categoryMap[category][model] = (categoryMap[category][model] || 0) + 1;
      });

      // Convert to treemap format
      const treeData: ModelFlow[] = Object.entries(categoryMap).map(([category, models]) => ({
        name: category.replace(/_/g, ' '),
        value: 0,
        children: Object.entries(models).map(([model, count]) => ({
          name: model,
          value: count
        }))
      }));

      // Calculate parent values
      treeData.forEach(category => {
        category.value = category.children?.reduce((sum, child) => sum + child.value, 0) || 0;
      });

      setFlowData(treeData);
    } catch (error) {
      console.error('Error processing flow data:', error);
      setFlowData([]);
    }
  };

  const processPathMetrics = (views: any[]) => {
    try {
      // Group by user and session to identify paths
      const sessionPaths: Record<string, any[]> = {};
      
      views.forEach(view => {
        const sessionKey = view.session_id || `${view.user_id}_default`;
        
        if (!sessionPaths[sessionKey]) {
          sessionPaths[sessionKey] = [];
        }
        sessionPaths[sessionKey].push(view);
      });

      // Calculate metrics for common paths
      const pathCounts: Record<string, { count: number; durations: number[]; completed: number }> = {};
      
      Object.values(sessionPaths).forEach(path => {
        if (path.length >= minPathLength) {
          // Sort by timestamp to ensure correct order
          path.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          // Create path key (limit to first 3 models for clarity)
          const pathModels = path.slice(0, 3).map(v => v.model_name || v.model_slug);
          const pathKey = pathModels.join(' → ');
          
          if (!pathCounts[pathKey]) {
            pathCounts[pathKey] = { count: 0, durations: [], completed: 0 };
          }
          pathCounts[pathKey].count++;
          
          const totalDuration = path.reduce((sum, v) => sum + (v.view_duration || 0), 0);
          pathCounts[pathKey].durations.push(totalDuration);
          
          // Consider completed if last view > 30s
          if (path[path.length - 1].view_duration > 30) {
            pathCounts[pathKey].completed++;
          }
        }
      });

      // Convert to metrics array
      const metrics = Object.entries(pathCounts)
        .map(([path, data]) => ({
          path: path.length > 50 ? path.substring(0, 47) + '...' : path,
          count: data.count,
          avgDuration: data.durations.length > 0
            ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
            : 0,
          completionRate: Math.round((data.completed / data.count) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setPathMetrics(metrics);
    } catch (error) {
      console.error('Error processing path metrics:', error);
      setPathMetrics([]);
    }
  };

  const processSourceDistribution = (views: any[]) => {
    try {
      const sourceCounts: Record<string, number> = {};
      const processedSessions = new Set<string>();
      
      views.forEach(view => {
        const sessionId = view.session_id || view.user_id;
        if (!processedSessions.has(sessionId)) {
          processedSessions.add(sessionId);
          const source = view.view_source || 'unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        }
      });

      const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
      const distribution = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source: source.replace(/_/g, ' '),
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      setSourceDistribution(distribution);
    } catch (error) {
      console.error('Error processing source distribution:', error);
      setSourceDistribution([]);
    }
  };

  const processCategoryTransitions = (views: any[]) => {
    try {
      const transitions: Record<string, number> = {};
      
      // Group by session
      const sessionViews: Record<string, any[]> = {};
      views.forEach(view => {
        const sessionId = view.session_id || view.user_id;
        if (!sessionViews[sessionId]) {
          sessionViews[sessionId] = [];
        }
        sessionViews[sessionId].push(view);
      });

      // Count category transitions
      Object.values(sessionViews).forEach(session => {
        // Sort by timestamp
        session.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        for (let i = 0; i < session.length - 1; i++) {
          const fromCategory = session[i].category || 'uncategorized';
          const toCategory = session[i + 1].category || 'uncategorized';
          
          if (fromCategory !== toCategory) {
            const key = `${fromCategory}_to_${toCategory}`;
            transitions[key] = (transitions[key] || 0) + 1;
          }
        }
      });

      // Convert to array format
      const transitionArray = Object.entries(transitions)
        .map(([key, count]) => {
          const [from, to] = key.split('_to_');
          return {
            from: from.replace(/_/g, ' '),
            to: to.replace(/_/g, ' '),
            count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      setCategoryTransitions(transitionArray);
    } catch (error) {
      console.error('Error processing category transitions:', error);
      setCategoryTransitions([]);
    }
  };

  useEffect(() => {
    fetchJourneyData();
  }, [selectedUser, timeRange, minPathLength]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#252525] border border-gray-700 rounded-lg p-3">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-[#00FFFF]">Value: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTreemapContent = ({ x, y, width, height, name, value }: any) => {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[Math.floor(Math.random() * COLORS.length)],
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 0.5,
          }}
        />
        {width > 50 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 5}
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
            >
              {value}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-[#00FFFF]" />
          User Journey Analytics
        </h2>

        <div className="flex flex-wrap gap-2">
          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-[#252525] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 bg-[#252525] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(userId => (
              <option key={userId} value={userId}>
                User {userId.substring(0, 8)}...
              </option>
            ))}
          </select>

          {/* Path Length Filter */}
          <select
            value={minPathLength}
            onChange={(e) => setMinPathLength(Number(e.target.value))}
            className="px-3 py-2 bg-[#252525] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
          >
            <option value={2}>Min 2 Steps</option>
            <option value={3}>Min 3 Steps</option>
            <option value={4}>Min 4 Steps</option>
            <option value={5}>Min 5 Steps</option>
          </select>

          <button
            onClick={fetchJourneyData}
            className="p-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF]"></div>
        </div>
      ) : (
        <>
          {/* Model Flow Visualization using Treemap */}
          <div className="bg-[#252525] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-[#00FFFF]" />
              Model Navigation Map
            </h3>
            {flowData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={flowData}
                  dataKey="value"
                  aspectRatio={4/3}
                  stroke="#fff"
                  fill="#00FFFF"
                  content={<CustomTreemapContent />}
                >
                  <Tooltip content={<CustomTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No navigation data available for the selected filters
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Distribution */}
            <div className="bg-[#252525] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00FFFF]" />
                Traffic Sources
              </h3>
              {sourceDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sourceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percentage }) => `${source}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-400">No source data available</div>
              )}
            </div>

            {/* Top Paths */}
            <div className="bg-[#252525] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#00FFFF]" />
                Most Common Paths
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {pathMetrics.length > 0 ? (
                  pathMetrics.map((path, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded hover:bg-[#2A2A2A] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium truncate">{path.path}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {path.count} sessions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(path.avgDuration / 60)}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {path.completionRate}%
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">No path data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Category Transitions */}
          <div className="bg-[#252525] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00FFFF]" />
              Category Transitions
            </h3>
            {categoryTransitions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryTransitions.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="from" 
                    stroke="#666"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#252525] border border-gray-700 rounded-lg p-3">
                            <p className="text-white font-semibold">{data.from} → {data.to}</p>
                            <p className="text-[#00FFFF]">Transitions: {data.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#00FFFF" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No category transition data available
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1A1A1A] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Unique Journeys</div>
              <div className="text-2xl font-bold text-white">{pathMetrics.length}</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Sessions</div>
              <div className="text-2xl font-bold text-[#00FFFF]">
                {pathMetrics.reduce((sum, p) => sum + p.count, 0)}
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Top Source</div>
              <div className="text-lg font-bold text-green-500 truncate">
                {sourceDistribution[0]?.source || 'N/A'}
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Cross-Category</div>
              <div className="text-2xl font-bold text-purple-500">
                {categoryTransitions.length}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserJourneyFlow;