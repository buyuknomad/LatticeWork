// src/components/Personalization/LearningPath.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Lock, 
  CheckCircle, 
  ChevronRight,
  ChevronDown,
  Trophy,
  Clock,
  TrendingUp,
  Sparkles,
  Target,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PathNode {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  estimatedTime?: number; // in minutes
  progress?: number; // 0-100
  isCompleted?: boolean;
  isLocked?: boolean;
  children?: PathNode[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  requiredNodes: number;
  completedNodes: number;
  reward?: string;
  isUnlocked: boolean;
}

interface LearningPathProps {
  category?: string;
  customPath?: PathNode[];
  variant?: 'tree' | 'linear' | 'grid';
  showProgress?: boolean;
  showMilestones?: boolean;
  onNodeClick?: (slug: string) => void;
  className?: string;
}

const LearningPath: React.FC<LearningPathProps> = ({
  category,
  customPath,
  variant = 'linear',
  showProgress = true,
  showMilestones = false,
  onNodeClick,
  className = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pathNodes, setPathNodes] = useState<PathNode[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLearningPath = async () => {
    try {
      setError(null);
      let nodes: PathNode[] = [];

      if (customPath) {
        // Use provided custom path
        nodes = customPath;
      } else if (category) {
        // Try to use the database function first
        try {
          const { data: pathData, error: pathError } = await supabase
            .rpc('get_learning_path_for_category', {
              p_category: category,
              p_user_id: user?.id || null
            });

          if (!pathError && pathData) {
            nodes = pathData.map((item: any) => ({
              id: item.model_slug,  // RPC returns model_slug
              slug: item.model_slug,  // RPC returns model_slug
              name: item.model_name,
              description: item.core_concept,
              category: category,
              difficulty: item.difficulty_level === 1 ? 'beginner' : 
                         item.difficulty_level === 3 ? 'advanced' : 'intermediate',
              prerequisites: item.prerequisites || [],
              progress: item.completion_percentage || 0,
              isCompleted: item.is_completed || false,
              isLocked: false // Will calculate based on prerequisites
            }));
          }
        } catch (rpcError) {
          console.error('RPC function error, falling back to manual fetch:', rpcError);
          
          // Fallback: Fetch models manually
          const { data: models, error: modelsError } = await supabase
            .from('mental_models_library')  // FIXED: correct table name
            .select('*')
            .eq('category', category);
          // Removed .eq('is_active', true) - column doesn't exist

          if (!modelsError && models) {
            // Get user progress if logged in
            let userProgress = new Map<string, number>();
            if (user?.id) {
              const { data: views } = await supabase
                .from('mental_model_views')
                .select('model_slug, view_duration')
                .eq('user_id', user.id);

              if (views) {
                views.forEach(view => {
                  const current = userProgress.get(view.model_slug) || 0;
                  userProgress.set(view.model_slug, Math.max(current, 
                    view.view_duration > 60 ? 100 : 
                    view.view_duration > 30 ? 75 : 50
                  ));
                });
              }
            }

            // Create path nodes - map from table structure to node structure
            nodes = models.map((model, index) => {
              const progress = userProgress.get(model.slug) || 0;  // Use slug from table
              const difficulty = 
                model.name.toLowerCase().includes('basic') || 
                model.name.toLowerCase().includes('introduction') ? 'beginner' :
                model.name.toLowerCase().includes('advanced') || 
                model.name.toLowerCase().includes('complex') ? 'advanced' :
                'intermediate';

              return {
                id: model.slug,  // Use slug from table
                slug: model.slug,  // Use slug from table
                name: model.name,
                description: model.core_concept,
                category: model.category,
                difficulty,
                prerequisites: model.related_model_slugs || [],
                estimatedTime: 10 + (difficulty === 'advanced' ? 10 : difficulty === 'intermediate' ? 5 : 0),
                progress,
                isCompleted: progress >= 75,
                isLocked: false
              };
            });

            // Sort by difficulty
            nodes.sort((a, b) => {
              const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
              return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            });
          }
        }

        // Calculate locked states based on prerequisites
        nodes.forEach(node => {
          if (node.prerequisites && node.prerequisites.length > 0) {
            const prereqsMet = node.prerequisites.every(prereq => {
              const prereqNode = nodes.find(n => n.slug === prereq);
              return prereqNode ? (prereqNode.progress || 0) >= 75 : true;
            });
            node.isLocked = !prereqsMet;
          }
        });
      } else {
        // No category specified, create a sample path
        const { data: popularModels } = await supabase
          .from('mental_models_library')  // FIXED: correct table name
          .select('*')
          .limit(10);

        if (popularModels) {
          nodes = popularModels.map((model, index) => ({
            id: model.slug,  // Use slug from table
            slug: model.slug,  // Use slug from table
            name: model.name,
            description: model.core_concept,
            category: model.category,
            difficulty: index < 3 ? 'beginner' : index < 7 ? 'intermediate' : 'advanced',
            prerequisites: index > 0 ? [popularModels[index - 1].slug] : [],
            estimatedTime: 10 + (index > 6 ? 10 : index > 2 ? 5 : 0),
            progress: 0,
            isCompleted: false,
            isLocked: index > 0
          }));
        }
      }

      setPathNodes(nodes);

      // Calculate milestones if enabled
      if (showMilestones && nodes.length > 0) {
        const completedCount = nodes.filter(n => n.isCompleted).length;
        const totalCount = nodes.length;

        setMilestones([
          {
            id: 'starter',
            title: 'Getting Started',
            description: 'Complete your first model',
            requiredNodes: 1,
            completedNodes: completedCount,
            reward: '🎯 Focus Badge',
            isUnlocked: completedCount >= 1
          },
          {
            id: 'halfway',
            title: 'Halfway There',
            description: `Complete ${Math.floor(totalCount / 2)} models`,
            requiredNodes: Math.floor(totalCount / 2),
            completedNodes: completedCount,
            reward: '🚀 Momentum Badge',
            isUnlocked: completedCount >= Math.floor(totalCount / 2)
          },
          {
            id: 'master',
            title: 'Path Master',
            description: 'Complete all models in this path',
            requiredNodes: totalCount,
            completedNodes: completedCount,
            reward: '🏆 Master Badge',
            isUnlocked: completedCount >= totalCount
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
      setError('Unable to load learning path. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPath();
  }, [category, user?.id]);

  const handleNodeClick = (node: PathNode) => {
    if (node.isLocked) {
      setSelectedNode(node);
      return;
    }

    if (onNodeClick) {
      onNodeClick(node.slug);
    } else {
      navigate(`/mental-models/${node.slug}`);  // Navigate using slug
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-[#10B981] border-[#10B981]';
      case 'intermediate':
        return 'text-[#FFB84D] border-[#FFB84D]';
      case 'advanced':
        return 'text-[#EC4899] border-[#EC4899]';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-[#10B981]';
    if (progress >= 75) return 'bg-[#00FFFF]';
    if (progress >= 50) return 'bg-[#FFB84D]';
    if (progress >= 25) return 'bg-[#8B5CF6]';
    return 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-[#1A1A1A] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-[#1A1A1A] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-yellow-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (pathNodes.length === 0) {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 text-center ${className}`}>
        <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No learning path available</p>
        {!user && (
          <p className="text-gray-500 text-sm mt-2">
            Login to track your progress
          </p>
        )}
      </div>
    );
  }

  // Calculate overall progress
  const overallProgress = pathNodes.length > 0
    ? Math.round(
        pathNodes.reduce((sum, node) => sum + (node.progress || 0), 0) / pathNodes.length
      )
    : 0;

  // Tree variant
  if (variant === 'tree') {
    const renderTreeNode = (node: PathNode, level: number = 0) => (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginLeft: `${level * 24}px` }}
        className="mb-2"
      >
        <div
          onClick={() => node.children ? toggleNodeExpansion(node.id) : handleNodeClick(node)}
          className={`flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors ${
            node.isLocked ? 'opacity-50' : ''
          }`}
        >
          {node.children && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
              className="p-1"
            >
              {expandedNodes.has(node.id) ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              }
            </button>
          )}
          
          {node.isLocked ? (
            <Lock className="w-5 h-5 text-gray-500" />
          ) : node.isCompleted ? (
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
          ) : (
            <BookOpen className="w-5 h-5 text-[#00FFFF]" />
          )}

          <div className="flex-1">
            <h4 className="font-medium text-white">{node.name}</h4>
            {node.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                {node.description}
              </p>
            )}
          </div>

          <span className={`text-xs px-2 py-1 border rounded-full ${getDifficultyColor(node.difficulty)}`}>
            {node.difficulty}
          </span>

          {showProgress && node.progress !== undefined && (
            <div className="w-16">
              <div className="bg-[#252525] rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all ${getProgressColor(node.progress)}`}
                  style={{ width: `${node.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {node.children && expandedNodes.has(node.id) && (
          <div className="mt-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </motion.div>
    );

    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Learning Path: {category ? category.split('-').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ') : 'Custom'}
          </h3>
          {showProgress && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Overall:</span>
              <div className="w-24 bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-sm text-white font-medium">{overallProgress}%</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {pathNodes.map(node => renderTreeNode(node))}
        </div>
      </div>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Learning Path: {category ? category.split('-').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ') : 'Custom'}
          </h3>
          {showProgress && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Progress:</span>
              <span className="text-sm text-white font-medium">{overallProgress}%</span>
            </div>
          )}
        </div>

        {showMilestones && milestones.length > 0 && (
          <div className="mb-6 p-4 bg-[#1A1A1A] rounded-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Milestones</h4>
            <div className="flex gap-4">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex-1 text-center ${
                    milestone.isUnlocked ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <Trophy className={`w-6 h-6 mx-auto mb-1 ${
                    milestone.isUnlocked ? 'text-[#FFB84D]' : 'text-gray-500'
                  }`} />
                  <p className="text-xs text-gray-400">{milestone.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {milestone.completedNodes}/{milestone.requiredNodes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pathNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: node.isLocked ? 1 : 1.02 }}
              onClick={() => handleNodeClick(node)}
              className={`bg-[#1A1A1A] rounded-lg p-4 cursor-pointer transition-all ${
                node.isLocked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#2A2A2A]'
              } ${
                node.isCompleted 
                  ? 'ring-2 ring-[#10B981] ring-opacity-50' 
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                {node.isLocked ? (
                  <Lock className="w-6 h-6 text-gray-500" />
                ) : node.isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                ) : (
                  <BookOpen className="w-6 h-6 text-[#00FFFF]" />
                )}
                <span className={`text-xs px-2 py-1 border rounded-full ${getDifficultyColor(node.difficulty)}`}>
                  {node.difficulty}
                </span>
              </div>

              <h4 className="font-medium text-white mb-2">{node.name}</h4>
              
              {node.description && (
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                  {node.description}
                </p>
              )}

              {node.estimatedTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{node.estimatedTime} min</span>
                </div>
              )}

              {showProgress && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{node.progress || 0}%</span>
                  </div>
                  <div className="bg-[#252525] rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${node.progress || 0}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`h-full ${getProgressColor(node.progress || 0)}`}
                    />
                  </div>
                </div>
              )}

              {node.prerequisites && node.prerequisites.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#252525]">
                  <p className="text-xs text-gray-500">
                    Prerequisites: {node.prerequisites.length}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Linear variant (default)
  return (
    <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          Learning Path: {category ? category.split('-').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' ') : 'Custom'}
        </h3>
        {showProgress && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Overall Progress:</span>
            <div className="w-32 bg-[#1A1A1A] rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]"
              />
            </div>
            <span className="text-sm text-white font-medium">{overallProgress}%</span>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#1A1A1A]"></div>
        
        {/* Nodes */}
        <div className="space-y-4">
          {pathNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex items-center gap-4"
            >
              {/* Node Indicator */}
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  node.isLocked 
                    ? 'bg-[#1A1A1A] border-2 border-gray-600' 
                    : node.isCompleted 
                      ? 'bg-[#10B981] border-2 border-[#10B981]' 
                      : 'bg-[#1A1A1A] border-2 border-[#00FFFF]'
                }`}>
                  {node.isLocked ? (
                    <Lock className="w-5 h-5 text-gray-500" />
                  ) : node.isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-medium">{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div
                onClick={() => handleNodeClick(node)}
                className={`flex-1 bg-[#1A1A1A] rounded-lg p-4 cursor-pointer transition-all ${
                  node.isLocked 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#2A2A2A]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white">{node.name}</h4>
                      <span className={`text-xs px-2 py-0.5 border rounded-full ${getDifficultyColor(node.difficulty)}`}>
                        {node.difficulty}
                      </span>
                    </div>
                    
                    {node.description && (
                      <p className="text-sm text-gray-400 mb-2">
                        {node.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {node.estimatedTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {node.estimatedTime} min
                        </span>
                      )}
                      {node.prerequisites && node.prerequisites.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {node.prerequisites.length} prerequisites
                        </span>
                      )}
                    </div>

                    {showProgress && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{node.progress || 0}%</span>
                        </div>
                        <div className="bg-[#252525] rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${node.progress || 0}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-full ${getProgressColor(node.progress || 0)}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <ChevronRight className={`w-5 h-5 ml-4 ${
                    node.isLocked ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Node Modal */}
      <AnimatePresence>
        {selectedNode && selectedNode.isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#252525] rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-gray-500" />
                <h3 className="text-lg font-semibold text-white">Model Locked</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Complete the prerequisite models to unlock "{selectedNode.name}".
              </p>
              {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                <div className="bg-[#1A1A1A] rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-500 mb-2">Prerequisites:</p>
                  <ul className="space-y-1">
                    {selectedNode.prerequisites.map(prereq => (
                      <li key={prereq} className="text-sm text-gray-400">
                        • {pathNodes.find(n => n.slug === prereq)?.name || prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-lg text-white transition-colors"
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPath;