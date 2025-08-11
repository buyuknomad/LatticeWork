// src/components/Analytics/UserJourneyFlow.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sankey, 
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
  Legend
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
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface JourneyNode {
  name: string;
  category?: string;
}

interface JourneyLink {
  source: number;
  target: number;
  value: number;
}

interface JourneyData {
  nodes: JourneyNode[];
  links: JourneyLink[];
}

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

const COLORS = ['#00FFFF', '#8B5CF6', '#FFB84D', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FFA07A', '#98D8C8'];

const UserJourneyFlow: React.FC = () => {
  const [journeyData, setJourneyData] = useState<JourneyData>({ nodes: [], links: [] });
  const [pathMetrics, setPathMetrics] = useState<PathMetrics[]>([]);
  const [sourceDistribution, setSourceDistribution] = useState<SourceDistribution[]>([]);
  const [categoryTransitions, setCategoryTransitions] = useState<CategoryTransition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [minPathLength, setMinPathLength] = useState(2);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);

  const fetchJourneyData = async () => {
    setIsLoading(true);
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

      const { data: views, error } = await query;
      if (error) throw error;

      // Get unique users for dropdown
      const uniqueUsers = [...new Set(views?.map(v => v.user_id))];
      const { data: userData } = await supabase.auth.admin.listUsers();
      if (userData?.users) {
        setUsers(userData.users.map(u => ({ id: u.id, email: u.email || 'Unknown' })));
      }

      // Process journey data
      if (views && views.length > 0) {
        processJourneyData(views);
        processPathMetrics(views);
        processSourceDistribution(views);
        processCategoryTransitions(views);
      }
    } catch (error) {
      console.error('Error fetching journey data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processJourneyData = (views: any[]) => {
    // Group views by session
    const sessionPaths: Record<string, any[]> = {};
    
    views.forEach(view => {
      const sessionId = view.session_id || 'default';
      if (!sessionPaths[sessionId]) {
        sessionPaths[sessionId] = [];
      }
      sessionPaths[sessionId].push(view);
    });

    // Build nodes and links for Sankey diagram
    const nodes: JourneyNode[] = [];
    const links: JourneyLink[] = [];
    const nodeMap: Record<string, number> = {};
    
    // Add source nodes
    const sources = ['library_search', 'library_browse', 'trending_widget', 'direct_url', 'dashboard_link'];
    sources.forEach(source => {
      nodeMap[`source_${source}`] = nodes.length;
      nodes.push({ name: source.replace(/_/g, ' '), category: 'source' });
    });

    // Process each session path
    Object.values(sessionPaths).forEach(path => {
      if (path.length < minPathLength) return;

      // Add first model as node if not exists
      const firstView = path[0];
      const firstNodeKey = `model_${firstView.model_slug}`;
      if (!(firstNodeKey in nodeMap)) {
        nodeMap[firstNodeKey] = nodes.length;
        nodes.push({ 
          name: firstView.model_name, 
          category: firstView.category 
        });
      }

      // Link source to first model
      const sourceKey = `source_${firstView.view_source}`;
      if (sourceKey in nodeMap) {
        const linkKey = `${sourceKey}-${firstNodeKey}`;
        const existingLink = links.find(l => 
          l.source === nodeMap[sourceKey] && l.target === nodeMap[firstNodeKey]
        );
        if (existingLink) {
          existingLink.value++;
        } else {
          links.push({
            source: nodeMap[sourceKey],
            target: nodeMap[firstNodeKey],
            value: 1
          });
        }
      }

      // Process transitions between models
      for (let i = 0; i < path.length - 1; i++) {
        const currentView = path[i];
        const nextView = path[i + 1];
        
        const currentKey = `model_${currentView.model_slug}`;
        const nextKey = `model_${nextView.model_slug}`;
        
        // Add nodes if not exist
        if (!(currentKey in nodeMap)) {
          nodeMap[currentKey] = nodes.length;
          nodes.push({ 
            name: currentView.model_name, 
            category: currentView.category 
          });
        }
        if (!(nextKey in nodeMap)) {
          nodeMap[nextKey] = nodes.length;
          nodes.push({ 
            name: nextView.model_name, 
            category: nextView.category 
          });
        }
        
        // Add or update link
        const existingLink = links.find(l => 
          l.source === nodeMap[currentKey] && l.target === nodeMap[nextKey]
        );
        if (existingLink) {
          existingLink.value++;
        } else {
          links.push({
            source: nodeMap[currentKey],
            target: nodeMap[nextKey],
            value: 1
          });
        }
      }
    });

    // Filter out weak connections for clarity
    const significantLinks = links.filter(l => l.value >= 2);
    
    setJourneyData({ nodes, links: significantLinks });
  };

  const processPathMetrics = (views: any[]) => {
    // Group by user and session to identify paths
    const userPaths: Record<string, any[][]> = {};
    
    views.forEach(view => {
      const userId = view.user_id;
      const sessionId = view.session_id;
      const key = `${userId}_${sessionId}`;
      
      if (!userPaths[key]) {
        userPaths[key] = [];
      }
      
      // Find or create path for this session
      let currentPath = userPaths[key][userPaths[key].length - 1];
      if (!currentPath || 
          (currentPath.length > 0 && 
           new Date(view.created_at).getTime() - new Date(currentPath[currentPath.length - 1].created_at).getTime() > 30 * 60 * 1000)) {
        // Start new path if gap > 30 minutes
        currentPath = [];
        userPaths[key].push(currentPath);
      }
      currentPath.push(view);
    });

    // Calculate metrics for common paths
    const pathCounts: Record<string, { count: number; durations: number[]; completed: number }> = {};
    
    Object.values(userPaths).forEach(sessions => {
      sessions.forEach(path => {
        if (path.length >= minPathLength) {
          const pathKey = path.map(v => v.model_slug).join(' → ');
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
    });

    // Convert to metrics array
    const metrics = Object.entries(pathCounts)
      .map(([path, data]) => ({
        path: path.length > 50 ? path.substring(0, 47) + '...' : path,
        count: data.count,
        avgDuration: Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length),
        completionRate: Math.round((data.completed / data.count) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setPathMetrics(metrics);
  };

  const processSourceDistribution = (views: any[]) => {
    const sourceCounts: Record<string, number> = {};
    const uniqueSessions = new Set<string>();
    
    views.forEach(view => {
      const sessionId = view.session_id || view.user_id;
      if (!uniqueSessions.has(sessionId)) {
        uniqueSessions.add(sessionId);
        const source = view.view_source || 'unknown';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      }
    });

    const total = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
    const distribution = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source: source.replace(/_/g, ' '),
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    setSourceDistribution(distribution);
  };

  const processCategoryTransitions = (views: any[]) => {
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
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.email}</option>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF]"></div>
        </div>
      ) : (
        <>
          {/* Journey Flow Visualization */}
          <div className="bg-[#252525] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Flow Visualization</h3>
            {journeyData.nodes.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <Sankey
                  data={journeyData}
                  node={{ fill: '#00FFFF', stroke: '#00FFFF' }}
                  link={{ stroke: '#8B5CF6', strokeOpacity: 0.5 }}
                  nodeWidth={15}
                  nodeGap={10}
                  margin={{ top: 10, right: 150, bottom: 10, left: 10 }}
                >
                  <Tooltip content={<CustomTooltip />} />
                </Sankey>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No journey data available for the selected filters
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
                <Zap className="w-5 h-5 text-[#00FFFF]" />
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
                      className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium truncate">{path.path}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {path.count} users
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
                <BarChart data={categoryTransitions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="from" 
                    stroke="#666"
                    angle={-45}
                    textAnchor="end"
                    height={100}
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
              <div className="text-sm text-gray-400 mb-1">Avg Path Length</div>
              <div className="text-2xl font-bold text-[#00FFFF]">
                {journeyData.links.length > 0 ? Math.round(journeyData.links.length / journeyData.nodes.length * 10) / 10 : 0}
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