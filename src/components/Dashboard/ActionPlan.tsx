// src/components/Dashboard/ActionPlan.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  BarChart3, 
  Globe, 
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

interface ActionPlanProps {
  actionPlan: {
    type: 'personal' | 'strategic' | 'awareness' | 'analytical';
    sections: {
      [key: string]: string[];
    };
  };
  className?: string;
}

const ActionPlan: React.FC<ActionPlanProps> = ({ actionPlan, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get styling based on action plan type
  const getTypeStyles = () => {
    const styles = {
      personal: {
        icon: Target,
        label: 'Personal Action Plan',
        gradient: 'from-amber-500 to-orange-500',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-500/10',
        iconBg: 'bg-amber-500/20',
        textColor: 'text-amber-500',
        sectionIcon: Sparkles
      },
      strategic: {
        icon: BarChart3,
        label: 'Strategic Action Plan',
        gradient: 'from-blue-500 to-purple-500',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-500/10',
        iconBg: 'bg-blue-500/20',
        textColor: 'text-blue-500',
        sectionIcon: Zap
      },
      awareness: {
        icon: Globe,
        label: 'Awareness Action Plan',
        gradient: 'from-teal-500 to-cyan-500',
        borderColor: 'border-teal-500/30',
        bgColor: 'bg-teal-500/10',
        iconBg: 'bg-teal-500/20',
        textColor: 'text-teal-500',
        sectionIcon: ArrowRight
      },
      analytical: {
        icon: Search,
        label: 'Analytical Action Plan',
        gradient: 'from-gray-400 to-slate-500',
        borderColor: 'border-gray-500/30',
        bgColor: 'bg-gray-500/10',
        iconBg: 'bg-gray-500/20',
        textColor: 'text-gray-400',
        sectionIcon: CheckCircle
      }
    };
    
    return styles[actionPlan.type] || styles.analytical;
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;
  const SectionIcon = styles.sectionIcon;
  const sections = Object.entries(actionPlan.sections);

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  // Auto-expand all sections on desktop, collapse on mobile
  React.useEffect(() => {
    if (!isMobile) {
      setExpandedSections(new Set(Object.keys(actionPlan.sections)));
    } else {
      setExpandedSections(new Set());
    }
  }, [isMobile, actionPlan.sections]);

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Main container */}
      <div className={`relative bg-[#1F1F1F]/80 backdrop-blur-xl rounded-xl border ${styles.borderColor} overflow-hidden`}>
        {/* Background gradient accent */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${styles.gradient}`} />

        {/* Header */}
        <div className="p-6 border-b border-[#333333]">
          <div className="flex items-center gap-3">
            <motion.div
              className={`p-3 ${styles.iconBg} rounded-xl`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`h-6 w-6 ${styles.textColor}`} />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{styles.label}</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {sections.length} focus areas • {sections.reduce((acc, [, actions]) => acc + actions.length, 0)} actions
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-4">
          {sections.map(([sectionName, actions], sectionIndex) => {
            const isExpanded = expandedSections.has(sectionName);
            
            return (
              <motion.div
                key={sectionName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className={`rounded-lg border ${styles.borderColor} ${styles.bgColor} overflow-hidden`}
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(sectionName)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <SectionIcon className={`h-5 w-5 ${styles.textColor} flex-shrink-0`} />
                  <h4 className="text-base font-medium text-white flex-1 text-left">
                    {sectionName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${styles.textColor} ${styles.bgColor} px-2 py-1 rounded-full`}>
                      {actions.length} actions
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  </div>
                </button>

                {/* Section content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {actions.map((action, actionIndex) => (
                          <motion.div
                            key={actionIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: actionIndex * 0.05 }}
                            className="flex items-start gap-3 group"
                          >
                            <div className={`mt-0.5 p-1 ${styles.iconBg} rounded-full flex-shrink-0`}>
                              <CheckCircle className={`h-4 w-4 ${styles.textColor}`} />
                            </div>
                            <p className="text-sm text-gray-300 flex-1 leading-relaxed group-hover:text-white transition-colors">
                              {action}
                            </p>
                            <motion.div
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ x: 3 }}
                            >
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="px-6 pb-6">
          <motion.div
            className="flex items-center gap-2 text-xs text-gray-500"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="h-3 w-3" />
            <span>Start with the first action in each area for maximum impact</span>
          </motion.div>
        </div>

        {/* Corner decoration */}
        <div 
          className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${styles.gradient} opacity-10`}
          style={{
            maskImage: 'radial-gradient(circle at top right, black, transparent)',
            WebkitMaskImage: 'radial-gradient(circle at top right, black, transparent)'
          }}
        />
      </div>

      {/* Word count indicators (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-8 right-0 text-xs text-gray-600">
          {sections.map(([name, actions]) => (
            <div key={name}>
              {name}: {actions.map(a => a.split(' ').length).join(', ')} words
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActionPlan;