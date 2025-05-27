// src/components/Features/LatticeworkContent.tsx
import React from 'react';
import { Layers } from 'lucide-react';

const LatticeworkContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FFFF]/10 rounded-full mb-6">
          <Layers className="h-8 w-8 text-[#00FFFF]" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Build Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
            Latticework of Mental Models
          </span>
        </h2>
      </div>
      
      <div className="bg-[#252525]/50 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-[#333333]">
        <blockquote className="text-xl text-gray-300 italic mb-6 text-center">
          "You can't really know anything if you just remember isolated facts and try and bang 'em back. 
          If the facts don't hang together on a latticework of theory, you don't have them in a usable form."
        </blockquote>
        <p className="text-right text-gray-400 mb-8">— Charlie Munger</p>
        
        <div className="space-y-4 text-gray-300">
          <p>
            Charlie Munger's revolutionary insight was that the world's best thinkers don't rely on expertise 
            in just one field. Instead, they build a <span className="text-[#00FFFF] font-semibold">latticework 
            of mental models</span>—a interconnected framework of the most powerful ideas from every discipline.
          </p>
          <p>
            Just as a physical lattice gains strength from its interwoven structure, your thinking becomes 
            more robust when you can apply models from psychology, economics, physics, biology, and philosophy 
            to any situation.
          </p>
          <p className="text-center pt-4">
            <span className="text-white font-semibold">Mind Lattice makes this powerful approach accessible 
            to everyone.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LatticeworkContent;