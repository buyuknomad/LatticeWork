// src/components/Features/HowItWorksContent.tsx
import React from 'react';
import { Brain } from 'lucide-react';

const HowItWorksContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B5CF6]/10 rounded-full mb-6">
          <Brain className="h-8 w-8 text-[#8B5CF6]" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          How Mind Lattice{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
            Transforms Your Thinking
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#00FFFF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-[#00FFFF]">1</span>
          </div>
          <h4 className="font-semibold text-lg mb-2">Describe Your Situation</h4>
          <p className="text-gray-400 text-sm">
            Share any decision, behavior, or pattern you're trying to understand
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-[#00FFFF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-[#00FFFF]">2</span>
          </div>
          <h4 className="font-semibold text-lg mb-2">AI Identifies Patterns</h4>
          <p className="text-gray-400 text-sm">
            Our AI analyzes your situation against hundreds of mental models and biases
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-[#00FFFF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-[#00FFFF]">3</span>
          </div>
          <h4 className="font-semibold text-lg mb-2">Apply Clear Insights</h4>
          <p className="text-gray-400 text-sm">
            Get practical guidance on using these frameworks in your specific context
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksContent;