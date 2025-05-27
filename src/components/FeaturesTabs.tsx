// src/components/FeaturesTabs.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, BookOpen, Lightbulb, Brain } from 'lucide-react';
import LatticeworkContent from './Features/LatticeworkContent';
import CoreFeaturesContent from './Features/CoreFeaturesContent';
import HowItWorksContent from './Features/HowItWorksContent';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'latticework', label: 'The Latticework Method', icon: <Layers className="h-4 w-4" /> },
  { id: 'features', label: 'Core Features', icon: <Brain className="h-4 w-4" /> },
  { id: 'how', label: 'How It Works', icon: <Lightbulb className="h-4 w-4" /> },
];

const FeaturesTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('latticework');

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex flex-col sm:flex-row gap-2 sm:gap-4 p-1 bg-[#252525]/50 backdrop-blur-sm rounded-xl sm:rounded-full border border-[#333333]/50 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 shadow-[0_0_20px_rgba(0,255,255,0.15)]'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-[#333333]/50 border border-transparent hover:border-[#333333]/50'
              }`}
            >
              <motion.div
                animate={{ 
                  scale: activeTab === tab.id ? 1.1 : 1,
                  rotate: activeTab === tab.id ? 5 : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {tab.icon}
              </motion.div>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'latticework' && <LatticeworkContent />}
          {activeTab === 'features' && <CoreFeaturesContent />}
          {activeTab === 'how' && <HowItWorksContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FeaturesTabs;