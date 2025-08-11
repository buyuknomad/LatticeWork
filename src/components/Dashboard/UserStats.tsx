// src/components/Dashboard/UserStats.tsx
// Create this component to handle the stats display

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookOpen, Clock, TrendingUp, Target } from 'lucide-react';

interface UserStats {
  modelsExplored: number;
  totalViews: number;
  favoriteCategory: string;
  totalDuration: number;
  lastViewed: {
    model_name: string;
    created_at: string;
    category: string;
  } | null;
}

const UserStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    modelsExplored: 0,
    totalViews: 0,
    favoriteCategory: '',
    totalDuration: 0,
    lastViewed: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
      // Refresh stats every 30 seconds
      const interval = setInterval(fetchUserStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching stats for user:', user.id);
      
      // Fetch user's view data
      const { data: views, error } = await supabase
        .from('mental_model_views')
        .select('model_slug, model_name, category, created_at, view_duration')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching views:', error);
        return;
      }

      console.log('Fetched views:', views?.length || 0);

      if (views && views.length > 0) {
        // Calculate unique models
        const uniqueModels = new Set(views.map(v => v.model_slug));
        const modelsExplored = uniqueModels.size;

        // Calculate favorite category
        const categoryCount: Record<string, number> = {};
        views.forEach(v => {
          if (v.category) {
            categoryCount[v.category] = (categoryCount[v.category] || 0) + 1;
          }
        });
        
        const favoriteCategory = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None yet';

        // Calculate total duration
        const totalDuration = views.reduce((sum, v) => sum + (v.view_duration || 0), 0);

        setStats({
          modelsExplored,
          totalViews: views.length,
          favoriteCategory: formatCategoryName(favoriteCategory),
          totalDuration,
          lastViewed: views[0] || null
        });

        console.log('Stats updated:', {
          modelsExplored,
          totalViews: views.length,
          favoriteCategory
        });
      } else {
        // No views yet
        setStats({
          modelsExplored: 0,
          totalViews: 0,
          favoriteCategory: 'None yet',
          totalDuration: 0,
          lastViewed: null
        });
      }
    } catch (error) {
      console.error('Error in fetchUserStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (category: string): string => {
    if (!category || category === 'None yet') return 'None yet';
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="bg-[#252525] rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#1A1A1A] rounded-lg p-4">
              <div className="h-8 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#252525] rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-white">Your Learning Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Models Explored */}
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-[#00FFFF]" />
          </div>
          <div className="text-3xl font-bold text-[#00FFFF]">
            {stats.modelsExplored}
          </div>
          <div className="text-gray-400 text-sm">Models Explored</div>
        </div>

        {/* Total Views */}
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div className="text-3xl font-bold text-white">
            {stats.totalViews}
          </div>
          <div className="text-gray-400 text-sm">Total Views</div>
        </div>

        {/* Time Spent */}
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-[#FFB84D]" />
          </div>
          <div className="text-3xl font-bold text-white">
            {formatDuration(stats.totalDuration)}
          </div>
          <div className="text-gray-400 text-sm">Time Spent</div>
        </div>

        {/* Favorite Category */}
        <div className="bg-[#1A1A1A] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-lg font-bold text-white truncate">
            {stats.favoriteCategory}
          </div>
          <div className="text-gray-400 text-sm">Favorite Category</div>
        </div>
      </div>

      {/* Last Viewed */}
      {stats.lastViewed && (
        <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Last viewed:</div>
          <div className="text-white font-medium">{stats.lastViewed.model_name}</div>
          <div className="text-xs text-gray-500">
            {formatCategoryName(stats.lastViewed.category)} • {new Date(stats.lastViewed.created_at).toLocaleString()}
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
            Debug Stats
          </summary>
          <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-400 overflow-auto">
{JSON.stringify({
  userId: user?.id,
  stats,
  timestamp: new Date().toISOString()
}, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default UserStats;