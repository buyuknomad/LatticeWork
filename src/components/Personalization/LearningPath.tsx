// src/components/Personalization/LearningPath.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map,
  Trophy,
  Lock,
  Unlock,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronDown,
  Clock,
  BarChart3,
  BookOpen,
  Zap,
  Star,
  Flag,
  Target,
  Compass,
  Award,
  TrendingUp,
  Brain
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MentalModelCategory, CATEGORY_METADATA } from '../../types/mentalModels';

interface PathNode {
  id: string;
  slug: string;
  name: string;
  category: MentalModelCategory;
  level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimatedTime: number; // in minutes
  completed: boolean;
  progress: number; // 0-100
  locked: boolean;
  description?: string;
  skills?: string[];
  relatedNodes?: string[];
}

interface LearningPathData {
  id: string;
  name: string;
  description: string;
  category?: MentalModelCategory;
  totalModels: number;
  completedModels: number;
  estimatedTotalTime: number;
  userProgress: number;
  nodes: PathNode[];
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredModels: number;
  achieved: boolean;
  icon: any;
  reward?: string;
}

interface LearningPathProps {
  category?: MentalModelCategory;
  customPath?: string[]; // Array of model slugs for custom path
  title?: string;
  showProgress?: boolean;
  variant?: 'tree' | 'linear' | 'grid';
  className?: string;
}

const LearningPath: React.FC<LearningPathProps> = ({
  category,
  customPath,
  title = "Your Learning Path",
  showProgress = true,
  variant = 'tree',
  className = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [pathData, setPathData] = useState<LearningPathData | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['beginner']));

  // Fetch user's progress
  const fetchUserProgress = async () => {
    if (!user?.id) return;

    try {
      const { data: views, error } = await supabase
        .from('mental_model_views')
        .select('model_slug, view_duration, completed_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = new Map<string, number>();
      views?.forEach(view => {
        // Calculate progress based on view duration
        const progress = view.completed_at ? 100 : 
                        view.view_duration >= 60 ? 100 :
                        view.view_duration >= 30 ? 75 :
                        view.view_duration >= 15 ? 50 :
                        25;
        
        const existing = progressMap.get(view.model_slug) || 0;
        progressMap.set(view.model_slug, Math.max(existing, progress));
      });

      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  // Build learning path
  const buildLearningPath = async () => {
    try {
      let models: any[] = [];
      let pathName = title;
      let pathDescription = '';

      if (customPath && customPath.length > 0) {
        // Fetch models for custom path
        const { data, error } = await supabase
          .from('mental_models')
          .select('*')
          .in('slug', customPath);

        if (error) throw error;
        models = data || [];
        pathDescription = 'A custom learning path tailored for you';
      } else if (category) {
        // Fetch models for category
        const { data, error } = await supabase
          .from('mental_models')
          .select('*')
          .eq('category', category)
          .order('order_index');

        if (error) throw error;
        models = data || [];
        
        const categoryMeta = CATEGORY_METADATA[category];
        pathName = `${categoryMeta.name} Learning Path`;
        pathDescription = categoryMeta.description;
      } else if (user?.id) {
        // Build personalized path based on user history
        const { data: recommendations, error } = await supabase
          .rpc('get_user_recommendations', {
            p_user_id: user.id,
            p_limit: 10
          });

        if (error) throw error;

        if (recommendations && recommendations.length > 0) {
          const slugs = recommendations.map((r: any) => r.model_slug);
          const { data, error: modelsError } = await supabase
            .from('mental_models')
            .select('*')
            .in('slug', slugs);

          if (!modelsError) {
            models = data || [];
            pathName = 'Personalized Learning Path';
            pathDescription = 'A path based on your learning history and interests';
          }
        }
      }

      if (models.length === 0) {
        // Fallback to trending models
        const { data: trending } = await supabase
          .rpc('calculate_trending_scores')
          .limit(8);

        if (trending) {
          const slugs = trending.map((t: any) => t.slug);
          const { data } = await supabase
            .from('mental_models')
            .select('*')
            .in('slug', slugs);

          models = data || [];
          pathName = 'Popular Learning Path';
          pathDescription = 'Start with the most popular mental models';
        }
      }

      // Create path nodes
      const nodes: PathNode[] = models.map((model, index) => {
        const progress = userProgress.get(model.slug) || 0;
        const completed = progress === 100;
        
        // Determine level based on position
        let level: PathNode['level'] = 'beginner';
        if (index >= models.length * 0.66) level = 'advanced';
        else if (index >= models.length * 0.33) level = 'intermediate';

        // Set prerequisites (previous models in path)
        const prerequisites = index > 0 ? [models[index - 1].slug] : [];
        
        // Check if locked (prerequisites not completed)
        const locked = prerequisites.some(prereq => 
          (userProgress.get(prereq) || 0) < 75
        );

        return {
          id: model.slug,
          slug: model.slug,
          name: model.name,
          category: model.category,
          level,
          prerequisites,
          estimatedTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
          completed,
          progress,
          locked,
          description: model.core_concept,
          skills: model.use_cases?.slice(0, 3),
          relatedNodes: model.related_model_slugs?.slice(0, 3)
        };
      });

      // Calculate overall progress
      const completedCount = nodes.filter(n => n.completed).length;
      const totalTime = nodes.reduce((sum, n) => sum + n.estimatedTime, 0);
      const overallProgress = nodes.length > 0 
        ? Math.round((completedCount / nodes.length) * 100)
        : 0;

      // Create milestones
      const milestones: Milestone[] = [
        {
          id: 'first-step',
          name: 'First Step',
          description: 'Complete your first model',
          requiredModels: 1,
          achieved: completedCount >= 1,
          icon: Flag,
          reward: 'Learner Badge'
        },
        {
          id: 'halfway',
          name: 'Halfway There',
          description: 'Complete 50% of the path',
          requiredModels: Math.floor(nodes.length / 2),
          achieved: completedCount >= Math.floor(nodes.length / 2),
          icon: Compass,
          reward: 'Explorer Badge'
        },
        {
          id: 'nearly-done',
          name: 'Almost There',
          description: 'Complete 75% of the path',
          requiredModels: Math.floor(nodes.length * 0.75),
          achieved: completedCount >= Math.floor(nodes.length * 0.75),
          icon: Target,
          reward: 'Dedicated Badge'
        },
        {
          id: 'completed',
          name: 'Path Master',
          description: 'Complete the entire path',
          requiredModels: nodes.length,
          achieved: completedCount >= nodes.length,
          icon: Trophy,
          reward: 'Master Badge'
        }
      ];

      setPathData({
        id: category || 'custom',
        name: pathName,
        description: pathDescription,
        category,
        totalModels: nodes.length,
        completedModels: completedCount,
        estimatedTotalTime: totalTime,
        userProgress: overallProgress,
        nodes,
        milestones
      });
    } catch (error) {
      console.error('Error building learning path:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProgress();
  }, [user?.id]);

  useEffect(() => {
    if (userProgress.size > 0 || !user) {
      buildLearningPath();
    }
  }, [userProgress, category, customPath, user?.id]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleNodeClick = (node: PathNode) => {
    if (!node.locked) {
      navigate(`/mental-models/${node.slug}`);
    } else {
      setSelectedNode(node);
    }
  };

  const getLevelColor = (level: PathNode['level']) => {
    switch (level) {
      case 'beginner':
        return 'text-[#10B981] border-[#10B981]';
      case 'intermediate':
        return 'text-[#FFB84D] border-[#FFB84D]';
      case 'advanced':
        return 'text-[#8B5CF6] border-[#8B5CF6]';
    }
  };

  const getLevelIcon = (level: PathNode['level']) => {
    switch (level) {
      case 'beginner':
        return Star;
      case 'intermediate':
        return Zap;
      case 'advanced':
        return Award;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-[#1A1A1A] rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-[#1A1A1A] rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-[#1A1A1A] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pathData || pathData.nodes.length === 0) {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 text-center ${className}`}>
        <Map className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No learning path available</p>
        <button
          onClick={() => navigate('/mental-models')}
          className="mt-4 px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
        >
          Explore Models
        </button>
      </div>
    );
  }

  // Tree variant
  if (variant === 'tree') {
    const groupedNodes = {
      beginner: pathData.nodes.filter(n => n.level === 'beginner'),
      intermediate: pathData.nodes.filter(n => n.level === 'intermediate'),
      advanced: pathData.nodes.filter(n => n.level === 'advanced')
    };

    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{pathData.name}</h2>
              <p className="text-gray-400">{pathData.description}</p>
            </div>
            <Map className="w-8 h-8 text-[#00FFFF]" />
          </div>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{pathData.completedModels} of {pathData.totalModels} completed</span>
                <span>{pathData.userProgress}%</span>
              </div>
              <div className="w-full bg-[#1A1A1A] rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pathData.userProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] h-3 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>~{pathData.estimatedTotalTime} minutes total</span>
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Milestones</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pathData.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg text-center ${
                  milestone.achieved 
                    ? 'bg-[#00FFFF]/20 border border-[#00FFFF]/50' 
                    : 'bg-[#1A1A1A] border border-[#1A1A1A]'
                }`}
              >
                <milestone.icon className={`w-6 h-6 mx-auto mb-2 ${
                  milestone.achieved ? 'text-[#00FFFF]' : 'text-gray-500'
                }`} />
                <p className={`text-xs font-medium ${
                  milestone.achieved ? 'text-white' : 'text-gray-400'
                }`}>
                  {milestone.name}
                </p>
                {milestone.achieved && milestone.reward && (
                  <p className="text-xs text-[#00FFFF] mt-1">✓ {milestone.reward}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Learning Nodes by Level */}
        <div className="space-y-4">
          {Object.entries(groupedNodes).map(([level, nodes]) => (
            <div key={level} className="border border-[#1A1A1A] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(level)}
                className="w-full px-4 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {React.createElement(getLevelIcon(level as PathNode['level']), {
                    className: `w-5 h-5 ${getLevelColor(level as PathNode['level'])}`
                  })}
                  <span className="font-medium text-white capitalize">{level} Level</span>
                  <span className="text-sm text-gray-400">({nodes.length} models)</span>
                </div>
                {expandedSections.has(level) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has(level) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {nodes.map((node, index) => (
                        <motion.div
                          key={node.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleNodeClick(node)}
                          className={`p-4 rounded-lg transition-all cursor-pointer ${
                            node.locked 
                              ? 'bg-[#1A1A1A]/50 opacity-60' 
                              : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
                          } ${node.completed ? 'ring-1 ring-[#10B981]/50' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">
                                {node.completed ? (
                                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                                ) : node.locked ? (
                                  <Lock className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium mb-1 ${
                                  node.completed ? 'text-[#10B981]' : 
                                  node.locked ? 'text-gray-500' : 'text-white'
                                }`}>
                                  {node.name}
                                </h4>
                                {node.description && (
                                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                    {node.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {node.estimatedTime} min
                                  </span>
                                  {node.progress > 0 && node.progress < 100 && (
                                    <span className="flex items-center gap-1">
                                      <BarChart3 className="w-3 h-3" />
                                      {node.progress}% complete
                                    </span>
                                  )}
                                </div>
                                {node.locked && node.prerequisites.length > 0 && (
                                  <p className="text-xs text-red-400 mt-2">
                                    Complete prerequisites first
                                  </p>
                                )}
                              </div>
                            </div>
                            {!node.locked && (
                              <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                            )}
                          </div>
                          
                          {/* Progress bar for partially completed nodes */}
                          {node.progress > 0 && node.progress < 100 && (
                            <div className="mt-3 w-full bg-[#252525] rounded-full h-1">
                              <div
                                className="bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6] h-1 rounded-full"
                                style={{ width: `${node.progress}%` }}
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Selected Node Details Modal */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedNode(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#252525] rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{selectedNode.name}</h3>
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">{selectedNode.description}</p>
                <div className="bg-[#1A1A1A] rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-400 mb-2">Prerequisites Required:</p>
                  <ul className="space-y-1">
                    {selectedNode.prerequisites.map(prereq => {
                      const prereqNode = pathData.nodes.find(n => n.slug === prereq);
                      return (
                        <li key={prereq} className="text-sm text-gray-300 flex items-center gap-2">
                          {(userProgress.get(prereq) || 0) >= 75 ? (
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-500" />
                          )}
                          {prereqNode?.name || prereq}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full px-4 py-2 bg-[#00FFFF] text-black rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Linear variant
  if (variant === 'linear') {
    return (
      <div className={`bg-[#252525] rounded-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold text-white mb-4">{pathData.name}</h2>
        <div className="space-y-4">
          {pathData.nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                {node.completed ? (
                  <CheckCircle className="w-8 h-8 text-[#10B981]" />
                ) : node.locked ? (
                  <Lock className="w-8 h-8 text-gray-500" />
                ) : (
                  <Circle className="w-8 h-8 text-gray-400" />
                )}
                {index < pathData.nodes.length - 1 && (
                  <div className={`w-0.5 h-16 ${
                    node.completed ? 'bg-[#10B981]' : 'bg-gray-600'
                  }`} />
                )}
              </div>
              <div
                onClick={() => handleNodeClick(node)}
                className={`flex-1 p-4 rounded-lg cursor-pointer ${
                  node.locked 
                    ? 'bg-[#1A1A1A]/50 opacity-60' 
                    : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
                } transition-all`}
              >
                <h3 className={`font-medium ${
                  node.completed ? 'text-[#10B981]' : 'text-white'
                }`}>
                  {node.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{node.estimatedTime} min</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{pathData.name}</h2>
        <p className="text-gray-400">{pathData.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pathData.nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleNodeClick(node)}
            className={`p-4 rounded-lg cursor-pointer ${
              node.locked 
                ? 'bg-[#252525]/50 opacity-60' 
                : 'bg-[#252525] hover:bg-[#2A2A2A]'
            } transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                node.completed ? 'bg-[#10B981]/20' : 
                node.locked ? 'bg-gray-500/20' : 'bg-[#00FFFF]/20'
              }`}>
                {node.completed ? (
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                ) : node.locked ? (
                  <Lock className="w-5 h-5 text-gray-500" />
                ) : (
                  <Brain className="w-5 h-5 text-[#00FFFF]" />
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${getLevelColor(node.level)}`}>
                {node.level}
              </span>
            </div>
            <h3 className={`font-medium mb-2 ${
              node.completed ? 'text-[#10B981]' : 'text-white'
            }`}>
              {node.name}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {node.estimatedTime} min
              </span>
              {node.progress > 0 && (
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {node.progress}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LearningPath;