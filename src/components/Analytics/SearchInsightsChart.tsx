// src/components/Analytics/SearchInsightsChart.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Calendar, Filter, Download, TrendingUp, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  getSearchInsights, 
  getSearchPerformanceByCategory,
  calculateSearchQuality 
} from '../../utils/searchAnalytics';

interface ChartData {
  date: string;
  searches: number;
  clicks: number;
  ctr: number;
  failures: number;
}

interface CategoryPerformance {
  category: string;
  searches: number;
  ctr: number;
  quality: number;
}

const COLORS = ['#00FFFF', '#8B5CF6', '#FFB84D', '#FF6B6B', '#4ECDC4', '#95E1D3'];

const SearchInsightsChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('area');
  const [searchData, setSearchData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'searches' | 'ctr' | 'failures'>('searches');

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch search data by day
      const { data: searchesByDay, error } = await supabase
        .from('mental_model_searches')
        .select('created_at, clicked_result_slug, failed_search')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data by day
      const dailyData: Record<string, any> = {};
      
      (searchesByDay || []).forEach(search => {
        const date = new Date(search.created_at).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            searches: 0,
            clicks: 0,
            failures: 0
          };
        }
        dailyData[date].searches++;
        if (search.clicked_result_slug) dailyData[date].clicks++;
        if (search.failed_search) dailyData[date].failures++;
      });

      // Calculate CTR and format for chart
      const chartData = Object.values(dailyData).map((day: any) => ({
        ...day,
        ctr: day.searches > 0 ? Math.round((day.clicks / day.searches) * 100) : 0
      }));

      // Fill in missing days with zeros
      const allDays: ChartData[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        const existing = chartData.find(d => d.date === dateStr);
        allDays.unshift(existing || {
          date: dateStr,
          searches: 0,
          clicks: 0,
          ctr: 0,
          failures: 0
        });
      }

      setSearchData(allDays);

      // Fetch category performance
      const categoryPerf = await getSearchPerformanceByCategory(days);
      const formattedCategoryData = Object.entries(categoryPerf).map(([category, metrics]: [string, any]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        searches: metrics.totalSearches,
        ctr: metrics.clickThroughRate,
        quality: metrics.qualityScore
      }));

      setCategoryData(formattedCategoryData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [timeRange]);

  const exportData = () => {
    const csv = [
      ['Date', 'Searches', 'Clicks', 'CTR (%)', 'Failed Searches'],
      ...searchData.map(d => [d.date, d.searches, d.clicks, d.ctr, d.failures])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-insights-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#252525] border border-gray-700 rounded-lg p-3">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="text-white font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const data = selectedMetric === 'searches' ? searchData : 
                 selectedMetric === 'ctr' ? searchData.map(d => ({ ...d, value: d.ctr })) :
                 searchData.map(d => ({ ...d, value: d.failures }));

    const commonProps = {
      data: searchData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="searches" stroke="#00FFFF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="clicks" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ctr" stroke="#FFB84D" strokeWidth={2} dot={false} />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="searches" fill="#00FFFF" />
            <Bar dataKey="clicks" fill="#8B5CF6" />
            <Bar dataKey="failures" fill="#FF6B6B" />
          </BarChart>
        );
      
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="searches" stroke="#00FFFF" fillOpacity={1} fill="url(#colorSearches)" />
            <Area type="monotone" dataKey="clicks" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorClicks)" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-[#252525] rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded transition-all ${
                  timeRange === range 
                    ? 'bg-[#00FFFF] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex bg-[#252525] rounded-lg p-1">
            {(['area', 'line', 'bar'] as const).map(type => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 rounded capitalize transition-all ${
                  chartType === type 
                    ? 'bg-[#00FFFF] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-[#333333] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Main Chart */}
      <div className="bg-[#252525] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00FFFF]" />
          Search Volume & Performance
        </h3>
        
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFFF]"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Category Distribution */}
        <div className="bg-[#252525] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Search Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, searches }) => `${category}: ${searches}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="searches"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart - Category Quality */}
        <div className="bg-[#252525] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Category Performance Quality</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={categoryData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="category" stroke="#666" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
              <Radar name="CTR %" dataKey="ctr" stroke="#00FFFF" fill="#00FFFF" fillOpacity={0.3} />
              <Radar name="Quality Score" dataKey="quality" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Searches', value: searchData.reduce((sum, d) => sum + d.searches, 0), color: 'text-[#00FFFF]' },
          { label: 'Total Clicks', value: searchData.reduce((sum, d) => sum + d.clicks, 0), color: 'text-[#8B5CF6]' },
          { label: 'Avg CTR', value: `${Math.round(searchData.reduce((sum, d) => sum + d.ctr, 0) / searchData.length)}%`, color: 'text-green-500' },
          { label: 'Failed Searches', value: searchData.reduce((sum, d) => sum + d.failures, 0), color: 'text-red-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-[#1A1A1A] rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchInsightsChart;