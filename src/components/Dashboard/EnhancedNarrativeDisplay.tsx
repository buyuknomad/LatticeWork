// Enhanced Narrative Display Section for ResultsSectionTest.tsx
// This replaces the narrative display portion

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, TrendingUp, AlertCircle, Target, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EnhancedNarrativeProps {
  narrativeAnalysis: string;
  relationshipsSummary?: string;
  searchGrounding?: any;
}

const EnhancedNarrativeDisplay: React.FC<EnhancedNarrativeProps> = ({
  narrativeAnalysis,
  relationshipsSummary,
  searchGrounding
}) => {
  // Process the narrative to add structure
  const structureNarrative = (text: string): string => {
    // If relationship summary exists, prepend it as an introduction
    let structured = text;
    
    if (relationshipsSummary) {
      structured = `**How These Patterns Connect:**\n\n*${relationshipsSummary}*\n\n---\n\n${text}`;
    }
    
    // Auto-detect paragraphs and add proper spacing
    structured = structured
      .split('\n\n')
      .map(paragraph => {
        // Check if paragraph might be a key point
        if (paragraph.length < 150 && (
          paragraph.includes('First') ||
          paragraph.includes('Second') ||
          paragraph.includes('Finally') ||
          paragraph.includes('Additionally') ||
          paragraph.includes('Moreover') ||
          paragraph.includes('However')
        )) {
          return `\n**${paragraph}**\n`;
        }
        return paragraph;
      })
      .join('\n\n');
    
    return structured;
  };

  // Split narrative into sections for better display
  const parseNarrativeSections = (text: string) => {
    const structured = structureNarrative(text);
    const paragraphs = structured.split('\n\n').filter(p => p.trim());
    
    // Identify different types of content
    const sections = paragraphs.map((paragraph, index) => {
      // First paragraph after relationship summary
      if (index === 0 && relationshipsSummary) {
        return { type: 'connection', content: paragraph };
      }
      
      // Check for key insights (shorter paragraphs with strong language)
      if (paragraph.length < 200 && paragraph.includes('**')) {
        return { type: 'insight', content: paragraph };
      }
      
      // Check for examples (often contain "for example", "consider", "imagine")
      if (paragraph.toLowerCase().includes('for example') || 
          paragraph.toLowerCase().includes('consider') ||
          paragraph.toLowerCase().includes('imagine')) {
        return { type: 'example', content: paragraph };
      }
      
      // Regular paragraph
      return { type: 'regular', content: paragraph };
    });
    
    return sections;
  };

  const sections = parseNarrativeSections(narrativeAnalysis);

  return (
    <div className="space-y-6">
      {/* Main Narrative Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 bg-gradient-to-r from-[#8B5CF6] to-[#00FFFF] group-hover:opacity-20" />
        
        <div className="relative bg-[#1F1F1F]/80 backdrop-blur-xl rounded-2xl border border-[#333333] hover:border-[#444444] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-br from-[#8B5CF6]/10 via-transparent to-[#00FFFF]/10" />

          <div className="relative p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6]/20 to-[#00FFFF]/20 rounded-xl">
                <BookOpen className="h-6 w-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-semibold text-white">Deep Pattern Analysis</h3>
              {searchGrounding?.wasSearchUsed && (
                <span className="ml-auto text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-1">
                  <Globe size={12} />
                  <span>Current Context Included</span>
                </span>
              )}
            </div>

            {/* Narrative Content with Enhanced Structure */}
            <div className="space-y-6">
              {sections.map((section, index) => {
                // Connection Summary (from relationship)
                if (section.type === 'connection' && index === 0) {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5CF6] to-[#00FFFF] rounded-full" />
                      <div className="pl-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-[#8B5CF6]" />
                          <span className="text-sm font-semibold text-[#8B5CF6]">Pattern Connections</span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="text-gray-300 leading-relaxed italic">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-white">{children}</strong>
                              ),
                            }}
                          >
                            {section.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                
                // Key Insights
                if (section.type === 'insight') {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#252525]/50 rounded-lg p-4 border-l-4 border-[#00FFFF]"
                    >
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-[#00FFFF] mt-1 flex-shrink-0" />
                        <div className="prose prose-sm max-w-none flex-1">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="text-gray-200 leading-relaxed mb-0">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-[#00FFFF]">{children}</strong>
                              ),
                            }}
                          >
                            {section.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                
                // Examples
                if (section.type === 'example') {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-[#333333]/20 to-transparent rounded-lg p-4 border-l-2 border-gray-600"
                    >
                      <div className="flex items-start gap-3">
                        <Quote className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div className="prose prose-sm max-w-none flex-1">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="text-gray-300 leading-relaxed mb-0 italic">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-100">{children}</strong>
                              ),
                            }}
                          >
                            {section.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                
                // Regular paragraphs
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="prose prose-lg max-w-none"
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-gray-200 italic">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-2 text-gray-300 my-4 ml-4">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-300">{children}</li>
                        ),
                      }}
                    >
                      {section.content}
                    </ReactMarkdown>
                  </motion.div>
                );
              })}
            </div>

            {/* Read Time Estimate */}
            <div className="mt-8 pt-4 border-t border-[#333333]/50 flex items-center justify-between text-xs text-gray-500">
              <span>Comprehensive Analysis</span>
              <span>~3 min read</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedNarrativeDisplay;