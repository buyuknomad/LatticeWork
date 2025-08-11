// src/components/Analytics/SearchTrackingTest.tsx
// Test component to verify search tracking is working correctly

import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Activity, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  getSearchInsights, 
  getPopularSearches, 
  getContentGaps,
  getSearchFunnel,
  getSearchPerformanceByCategory
} from '../../utils/searchAnalytics';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const SearchTrackingTest: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const runTests = async () => {
    if (!user?.id) {
      alert('Please login to run tests');
      return;
    }

    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Check if search table exists
    try {
      const { data, error } = await supabase
        .from('mental_model_searches')
        .select('id')
        .limit(1);
      
      testResults.push({
        name: 'Database Table',
        status: error ? 'error' : 'success',
        message: error ? `Table error: ${error.message}` : 'Table accessible',
        details: { data, error }
      });
    } catch (err) {
      testResults.push({
        name: 'Database Table',
        status: 'error',
        message: 'Failed to check table',
        details: err
      });
    }

    // Test 2: Check recent searches
    try {
      const { data, error } = await supabase
        .from('mental_model_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      const hasSearches = data && data.length > 0;
      testResults.push({
        name: 'Recent Searches',
        status: hasSearches ? 'success' : 'warning',
        message: hasSearches 
          ? `Found ${data.length} recent searches` 
          : 'No searches found - try searching first',
        details: data
      });
    } catch (err) {
      testResults.push({
        name: 'Recent Searches',
        status: 'error',
        message: 'Failed to fetch searches',
        details: err
      });
    }

    // Test 3: Check search insights
    try {
      const insights = await getSearchInsights();
      testResults.push({
        name: 'Search Insights',
        status: insights.length > 0 ? 'success' : 'warning',
        message: insights.length > 0 
          ? `${insights.length} insight records found`
          : 'No insights yet - needs data accumulation',
        details: insights
      });
    } catch (err) {
      testResults.push({
        name: 'Search Insights',
        status: 'error',
        message: 'Failed to fetch insights',
        details: err
      });
    }

    // Test 4: Check popular searches
    try {
      const popular = await getPopularSearches(5, 7);
      testResults.push({
        name: 'Popular Searches',
        status: popular.length > 0 ? 'success' : 'warning',
        message: popular.length > 0 
          ? `Top ${popular.length} searches identified`
          : 'No popular searches yet',
        details: popular
      });
    } catch (err) {
      testResults.push({
        name: 'Popular Searches',
        status: 'error',
        message: 'Failed to fetch popular searches',
        details: err
      });
    }

    // Test 5: Check content gaps
    try {
      const gaps = await getContentGaps(10, 30);
      testResults.push({
        name: 'Content Gaps',
        status: 'success',
        message: gaps.length > 0 
          ? `${gaps.length} content gaps identified`
          : 'No content gaps detected',
        details: gaps
      });
    } catch (err) {
      testResults.push({
        name: 'Content Gaps',
        status: 'error',
        message: 'Failed to fetch content gaps',
        details: err
      });
    }

    // Test 6: Check search funnel
    try {
      const funnel = await getSearchFunnel();
      testResults.push({
        name: 'Search Funnel',
        status: funnel.length > 0 ? 'success' : 'warning',
        message: funnel.length > 0 
          ? 'Funnel metrics calculated'
          : 'No funnel data yet',
        details: funnel
      });
    } catch (err) {
      testResults.push({
        name: 'Search Funnel',
        status: 'error',
        message: 'Failed to calculate funnel',
        details: err
      });
    }

    // Test 7: Check category performance
    try {
      const categoryPerf = await getSearchPerformanceByCategory(7);
      const categoryCount = Object.keys(categoryPerf).length;
      testResults.push({
        name: 'Category Performance',
        status: categoryCount > 0 ? 'success' : 'warning',
        message: categoryCount > 0 
          ? `Performance data for ${categoryCount} categories`
          : 'No category performance data yet',
        details: categoryPerf
      });
    } catch (err) {
      testResults.push({
        name: 'Category Performance',
        status: 'error',
        message: 'Failed to fetch category performance',
        details: err
      });
    }

    // Test 8: Check click tracking
    try {
      const { data } = await supabase
        .from('mental_model_searches')
        .select('clicked_result_slug, clicked_result_position, time_to_click_ms')
        .not('clicked_result_slug', 'is', null)
        .eq('user_id', user.id)
        .limit(5);
      
      const hasClicks = data && data.length > 0;
      testResults.push({
        name: 'Click Tracking',
        status: hasClicks ? 'success' : 'warning',
        message: hasClicks 
          ? `${data.length} clicks tracked`
          : 'No clicks tracked yet - click on search results',
        details: data
      });
    } catch (err) {
      testResults.push({
        name: 'Click Tracking',
        status: 'error',
        message: 'Failed to check click tracking',
        details: err
      });
    }

    // Test 9: Check failed searches
    try {
      const { data } = await supabase
        .from('mental_model_searches')
        .select('search_query, results_count')
        .eq('failed_search', true)
        .eq('user_id', user.id)
        .limit(5);
      
      testResults.push({
        name: 'Failed Search Detection',
        status: 'success',
        message: data && data.length > 0 
          ? `${data.length} failed searches detected`
          : 'No failed searches (good!)',
        details: data
      });
    } catch (err) {
      testResults.push({
        name: 'Failed Search Detection',
        status: 'error',
        message: 'Failed to check failed searches',
        details: err
      });
    }

    setTests(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-[#1A1A1A] text-white p-6 rounded-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6 text-[#00FFFF]" />
            Search Tracking Test Suite
          </h2>
          <p className="text-gray-400 mt-1">
            Verify Phase 3 search tracking implementation
          </p>
        </div>
        <button
          onClick={runTests}
          disabled={isRunning || !user}
          className="px-6 py-2 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all
                   flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Activity className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Run Tests
            </>
          )}
        </button>
      </div>

      {!user && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-500">
            Please login to run search tracking tests
          </p>
        </div>
      )}

      {tests.length > 0 && (
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{test.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{test.message}</p>
                  </div>
                </div>
                {test.details && (
                  <button
                    onClick={() => setShowDetails(showDetails === test.name ? null : test.name)}
                    className="text-[#00FFFF] hover:text-white text-sm transition-colors"
                  >
                    {showDetails === test.name ? 'Hide' : 'Show'} Details
                  </button>
                )}
              </div>
              
              {showDetails === test.name && test.details && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tests.length > 0 && (
        <div className="mt-6 p-4 bg-[#252525] rounded-lg">
          <h3 className="font-semibold mb-2">Test Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-500">✓ Passed:</span>{' '}
              {tests.filter(t => t.status === 'success').length}
            </div>
            <div>
              <span className="text-yellow-500">⚠ Warnings:</span>{' '}
              {tests.filter(t => t.status === 'warning').length}
            </div>
            <div>
              <span className="text-red-500">✗ Failed:</span>{' '}
              {tests.filter(t => t.status === 'error').length}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-[#252525] rounded-lg">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            1. Go to <a href="/mental-models" className="text-[#00FFFF] hover:underline">Mental Models</a> page
          </p>
          <p className="text-gray-400">
            2. Try searching for "first principles" or "systems thinking"
          </p>
          <p className="text-gray-400">
            3. Click on a search result
          </p>
          <p className="text-gray-400">
            4. Try a search with no results like "xyzabc123"
          </p>
          <p className="text-gray-400">
            5. Come back and run tests again to see the data
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchTrackingTest;