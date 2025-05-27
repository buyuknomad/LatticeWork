// src/components/Features/CoreFeaturesContent.tsx
import React from 'react';
import { BookOpen, Lightbulb, Map, AlertTriangle } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-[#252525] rounded-lg p-6 border border-[#333333] hover:border-[#00FFFF]/50 transition-all duration-300 group">
      <div className="text-[#00FFFF] mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

const CoreFeaturesContent: React.FC = () => {
  const features = [
    {
      icon: <BookOpen size={32} />,
      title: "300+ Mental Models",
      description: "Access a comprehensive collection of thinking frameworks from multiple disciplines to enhance your decision-making capabilities."
    },
    {
      icon: <AlertTriangle size={32} />,
      title: "200+ Cognitive Biases",
      description: "Recognize thinking traps that sabotage good decisions. Learn to identify and mitigate biases in your reasoning."
    },
    {
      icon: <Lightbulb size={32} />,
      title: "AI-Powered Analysis",
      description: "Get personalized insights for your specific situations using advanced AI that understands context and nuance."
    },
    {
      icon: <Map size={32} />,
      title: "Practical Application",
      description: "Receive actionable guidance on how to apply mental models and overcome biases in your exact scenario."
    }
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Everything You Need for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#8B5CF6]">
            Clear Thinking
          </span>
        </h3>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Our platform provides the complete toolkit to navigate complex problems with confidence and clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Feature
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
};

export default CoreFeaturesContent;