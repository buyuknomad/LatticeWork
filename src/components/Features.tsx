// src/components/Features.tsx
import React from 'react';
import { BookOpen, Lightbulb, Map, AlertTriangle, Layers, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const Features = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

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
    <section className="py-20 md:py-28" id="features">
      <div className="container mx-auto px-4 md:px-8">
        {/* Latticework Concept Section */}
        <div className="max-w-4xl mx-auto mb-20">
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

        {/* Main Features Section */}
        <div className="text-center mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* How It Works Section */}
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

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-xl text-gray-300 mb-8">
            Ready to think like the world's best decision-makers?
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-[#00FFFF] text-[#1A1A1A] font-bold py-3 px-8 rounded-lg hover:bg-[#00FFFF]/90 transition-colors"
          >
            {user ? 'Go to Dashboard' : 'Start Building Your Latticework'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;