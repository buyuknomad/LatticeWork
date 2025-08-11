// src/components/Analytics/ModelPerformanceTable.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Star,
  Award,
  Search,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelPerformance {
  model_slug: string;
  model_name: string;
  category: string;
  total_views: number;
  unique_viewers: number;
  avg_duration: number;
  total_duration: number;
  trending_score: number;
  search_clicks: number;
  completion_rate: number;
  last_viewed: string;
  change_7d: number;
}

type SortField = keyof ModelPerformance;
type SortDirection = 'asc' | 'desc';

const ModelPerformanceTable: React.FC = () => {
  const [models, setModels] = useState<ModelPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('total_views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [showOnlyTrending, setShowOnlyTrending] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchModelPerformance = async () => {
    setIsLoading(true);
    try {
      // Calculate date range
      let startDate = new Date(0).toISOString(); // Beginning of time
      if (dateRange === '7d') {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (dateRange === '30d') {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Fetch aggregated model data
      const { data: aggregates, error: aggError } = await supabase
        .from('mental_model_aggregates')
        .select('*')
        .order('total_views', { ascending: false });

      if (aggError) throw aggError;

      // Fetch recent views for additional metrics
      const { data: recentViews, error: viewError } = await supabase
        .from('mental_model_views')
        .select('model_slug, model_name, category, view_duration, created_at, user_id')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (viewError) throw viewError;

      // Fetch search clicks
      const { data: searchClicks, error: searchError } = await supabase
        .from('mental_model_searches')
        .select('clicked_result_slug')
        .not('clicked_result_slug', 'is', null)
        .gte('created_at', startDate);

      if (searchError) throw searchError;

      // Process data to calculate performance metrics
      const performanceMap: Record<string, ModelPerformance> = {};
      
      // Initialize with aggregate data
      aggregates?.forEach(agg => {
        performanceMap[agg.model_slug] = {
          model_slug: agg.model_slug,
          model_name: agg.model_name,
          category: agg.category,
          total_views: 0,
          unique_viewers: 0,
          avg_duration: agg.avg_view_duration || 0,
          total_duration: 0,
          trending_score: agg.trending_score || 0,
          search_clicks: 0,
          completion_rate: 0,
          last_viewed: agg.last_viewed_at || '',
          change_7d: 0
        };
      });

      // Calculate metrics from recent views
      const viewsByModel: Record<string, any[]> = {};
      const uniqueViewers: Record<string, Set<string>> = {};
      
      recentViews?.forEach(view => {
        const slug = view.model_slug;
        
        if (!viewsByModel[slug]) {
          viewsByModel[slug] = [];
          uniqueViewers[slug] = new Set();
        }
        
        viewsByModel[slug].push(view);
        if (view.user_id) {
          uniqueViewers[slug].add(view.user_id);
        }

        // Update model info if not in aggregates
        if (!performanceMap[slug]) {
          performanceMap[slug] = {
            model_slug: slug,
            model_name: view.model_name,
            category: view.category,
            total_views: 0,
            unique_viewers: 0,
            avg_duration: 0,
            total_duration: 0,
            trending_score: 0,
            search_clicks: 0,
            completion_rate: 0,
            last_viewed: view.created_at,
            change_7d: 0
          };
        }
      });

      // Calculate search click counts
      const clickCounts: Record<string, number> = {};
      searchClicks?.forEach(click => {
        if (click.clicked_result_slug) {
          clickCounts[click.clicked_result_slug] = (clickCounts[click.clicked_result_slug] || 0) + 1;
        }
      });

      // Update performance metrics
      Object.keys(performanceMap).forEach(slug => {
        const views = viewsByModel[slug] || [];
        const model = performanceMap[slug];
        
        model.total_views = views.length;
        model.unique_viewers = uniqueViewers[slug]?.size || 0;
        model.search_clicks = clickCounts[slug] || 0;
        
        if (views.length > 0) {
          const durations = views.filter(v => v.view_duration).map(v => v.view_duration);
          model.total_duration = durations.reduce((sum, d) => sum + d, 0);
          model.avg_duration = durations.length > 0 ? Math.round(model.total_duration / durations.length) : 0;
          
          // Completion rate (views > 30s / total views)
          const completedViews = views.filter(v => v.view_duration > 30).length;
          model.completion_rate = views.length > 0 ? Math.round((completedViews / views.length) * 100) : 0;
          
          // Calculate 7-day change
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const recentViews7d = views.filter(v => new Date(v.created_at) > sevenDaysAgo).length;
          const olderViews = views.length - recentViews7d;
          model.change_7d = olderViews > 0 ? Math.round(((recentViews7d - olderViews) / olderViews) * 100) : 0;
          
          // Update last viewed
          model.last_viewed = views[0]?.created_at || model.last_viewed;
        }
      });

      // Convert to array and filter out models with no views in date range
      const performanceArray = Object.values(performanceMap)
        .filter(m => m.total_views > 0);

      setModels(performanceArray);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(performanceArray.map(m => m.category))].filter(Boolean);
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching model performance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModelPerformance();
  }, [dateRange]);

  // Sort and filter models
  const sortedAndFilteredModels = useMemo(() => {
    let filtered = [...models];
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(m => m.category === filterCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.model_name.toLowerCase().includes(query) ||
        m.model_slug.toLowerCase().includes(query) ||
        m.category?.toLowerCase().includes(query)
      );
    }
    
    // Apply trending filter
    if (showOnlyTrending) {
      filtered = filtered.filter(m => m.trending_score > 50);
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
    
    return filtered;
  }, [models, sortField, sortDirection, filterCategory, searchQuery, showOnlyTrending]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectModel = (slug: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setSelectedModels(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedModels.size === sortedAndFilteredModels.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(sortedAndFilteredModels.map(m => m.model_slug)));
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Model Name',
      'Category',
      'Total Views',
      'Unique Viewers',
      'Avg Duration (s)',
      'Completion Rate (%)',
      'Search Clicks',
      'Trending Score',
      '7-Day Change (%)',
      'Last Viewed'
    ];
    
    const rows = (selectedModels.size > 0 
      ? sortedAndFilteredModels.filter(m => selectedModels.has(m.model_slug))
      : sortedAndFilteredModels
    ).map(m => [
      m.model_name,
      m.category,
      m.total_views,
      m.unique_viewers,
      m.avg_duration,
      m.completion_rate,
      m.search_clicks,
      m.trending_score,
      m.change_7d,
      new Date(m.last_viewed).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-performance-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-500" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-[#00FFFF]" />
      : <ChevronDown className="w-4 h-4 text-[#00FFFF]" />;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#00FFFF]" />
            Model Performance
          </h2>
          
          {/* Date Range */}
          <div className="flex bg-[#252525] rounded-lg p-1">
            {(['7d', '30d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded transition-all ${
                  dateRange === range 
                    ? 'bg-[#00FFFF] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedModels.size > 0 && (
            <span className="text-sm text-gray-400">
              {selectedModels.size} selected
            </span>
          )}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export {selectedModels.size > 0 ? 'Selected' : 'All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#252525] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-[#252525] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        {/* Trending Toggle */}
        <button
          onClick={() => setShowOnlyTrending(!showOnlyTrending)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showOnlyTrending 
              ? 'bg-[#00FFFF] text-black' 
              : 'bg-[#252525] text-white hover:bg-[#333333]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trending Only
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#252525] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1A1A1A]">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedModels.size === sortedAndFilteredModels.length && sortedAndFilteredModels.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-600"
                  />
                </th>
                <th 
                  className="p-3 text-left text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('model_name')}
                >
                  <div className="flex items-center gap-1">
                    Model
                    <SortIcon field="model_name" />
                  </div>
                </th>
                <th 
                  className="p-3 text-left text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    <SortIcon field="category" />
                  </div>
                </th>
                <th 
                  className="p-3 text-center text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('total_views')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" />
                    Views
                    <SortIcon field="total_views" />
                  </div>
                </th>
                <th 
                  className="p-3 text-center text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('unique_viewers')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Unique
                    <SortIcon field="unique_viewers" />
                  </div>
                </th>
                <th 
                  className="p-3 text-center text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('avg_duration')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Avg Time
                    <SortIcon field="avg_duration" />
                  </div>
                </th>
                <th 
                  className="p-3 text-center text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('completion_rate')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Completion
                    <SortIcon field="completion_rate" />
                  </div>
                </th>
                <th 
                  className="p-3 text-center text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('search_clicks')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Search className="w-4 h-4" />
                    Clicks
                    <SortIcon field="search_clicks" />
                  </div>
                </th>
                <th 
                  className="p-3 text-center text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('trending_score')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" />
                    Trending
                    <SortIcon field="trending_score" />
                  </div>
                </th>
                <th 
                  className="p-3 text-center text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('change_7d')}
                >
                  <div className="flex items-center justify-center gap-1">
                    7d Change
                    <SortIcon field="change_7d" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF] mx-auto"></div>
                  </td>
                </tr>
              ) : sortedAndFilteredModels.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">
                    No models found matching your criteria
                  </td>
                </tr>
              ) : (
                sortedAndFilteredModels.map((model, index) => (
                  <motion.tr 
                    key={model.model_slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-t border-gray-700 hover:bg-[#333333] transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedModels.has(model.model_slug)}
                        onChange={() => handleSelectModel(model.model_slug)}
                        className="rounded border-gray-600"
                      />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="text-white font-medium">{model.model_name}</div>
                        <div className="text-xs text-gray-500">{model.model_slug}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-[#1A1A1A] rounded text-sm text-gray-300">
                        {model.category?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center text-white">{model.total_views}</td>
                    <td className="p-3 text-center text-white">{model.unique_viewers}</td>
                    <td className="p-3 text-center text-white">{formatDuration(model.avg_duration)}</td>
                    <td className="p-3 text-center">
                      <span className={`${model.completion_rate > 50 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {model.completion_rate}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-white">{model.search_clicks}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {model.trending_score > 70 && <TrendingUp className="w-4 h-4 text-green-500" />}
                        <span className={model.trending_score > 50 ? 'text-[#00FFFF]' : 'text-gray-400'}>
                          {Math.round(model.trending_score)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {model.change_7d > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : model.change_7d < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : null}
                        <span className={
                          model.change_7d > 0 ? 'text-green-500' : 
                          model.change_7d < 0 ? 'text-red-500' : 
                          'text-gray-400'
                        }>
                          {model.change_7d > 0 ? '+' : ''}{model.change_7d}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Models</div>
          <div className="text-2xl font-bold text-white">{sortedAndFilteredModels.length}</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Views</div>
          <div className="text-2xl font-bold text-[#00FFFF]">
            {sortedAndFilteredModels.reduce((sum, m) => sum + m.total_views, 0)}
          </div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Avg Completion</div>
          <div className="text-2xl font-bold text-green-500">
            {sortedAndFilteredModels.length > 0
              ? Math.round(sortedAndFilteredModels.reduce((sum, m) => sum + m.completion_rate, 0) / sortedAndFilteredModels.length)
              : 0}%
          </div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Trending Models</div>
          <div className="text-2xl font-bold text-purple-500">
            {sortedAndFilteredModels.filter(m => m.trending_score > 50).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceTable;