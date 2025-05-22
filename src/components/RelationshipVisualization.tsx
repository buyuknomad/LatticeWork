// src/components/RelationshipVisualization.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  type: 'mental_model' | 'cognitive_bias';
  category: string;
}

interface RelationshipVisualizationProps {
  tools: Tool[];
  relationships?: string;
}

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  name: string;
  type: 'mental_model' | 'cognitive_bias';
  category: string;
  targetX?: number;
  targetY?: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

const RelationshipVisualization: React.FC<RelationshipVisualizationProps> = ({ tools, relationships }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<string | null>(null);

  // Initialize nodes and links
  useEffect(() => {
    if (!tools || tools.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas dimensions
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const newWidth = rect.width;
      const newHeight = Math.min(rect.height, 500);
      setDimensions({ width: newWidth, height: newHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Initialize nodes
    const nodes: Node[] = tools.map((tool, index) => {
      const angle = (index / tools.length) * Math.PI * 2;
      const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      return {
        id: tool.id,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 50,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        radius: 30,
        name: tool.name,
        type: tool.type,
        category: tool.category,
        targetX: centerX + Math.cos(angle) * radius,
        targetY: centerY + Math.sin(angle) * radius
      };
    });

    nodesRef.current = nodes;

    // Create links based on shared categories or relationships
    const links: Link[] = [];
    for (let i = 0; i < tools.length; i++) {
      for (let j = i + 1; j < tools.length; j++) {
        // Link tools in the same category
        if (tools[i].category === tools[j].category) {
          links.push({
            source: tools[i].id,
            target: tools[j].id,
            strength: 0.8
          });
        }
        // Weaker links between mental models and biases
        else if (tools[i].type !== tools[j].type) {
          links.push({
            source: tools[i].id,
            target: tools[j].id,
            strength: 0.3
          });
        }
      }
    }

    linksRef.current = links;

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [tools]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply forces
      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Apply spring forces for links
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = (distance - 100) * link.strength * 0.01;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // Apply repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0 && distance < 200) {
            const force = 3000 / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }
      }

      // Apply centering force
      nodes.forEach(node => {
        if (draggedNodeRef.current === node.id) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        // Apply drag
        node.vx *= 0.85;
        node.vy *= 0.85;

        // Update positions
        node.x += node.vx;
        node.y += node.vy;

        // Keep nodes within bounds
        const margin = node.radius;
        node.x = Math.max(margin, Math.min(canvas.width - margin, node.x));
        node.y = Math.max(margin, Math.min(canvas.height - margin, node.y));
      });

      // Draw links
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const isHighlighted = hoveredNode === source.id || hoveredNode === target.id;
        
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        if (isHighlighted) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${link.strength * 0.3})`;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${link.strength * 0.1})`;
          ctx.lineWidth = 1;
        }
        
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id;
        const isMentalModel = node.type === 'mental_model';
        
        // Node glow effect
        if (isHovered) {
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, node.radius * 2
          );
          gradient.addColorStop(0, isMentalModel ? 'rgba(0, 255, 255, 0.3)' : 'rgba(245, 158, 11, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw node
        const nodeGradient = ctx.createRadialGradient(
          node.x - node.radius * 0.3, 
          node.y - node.radius * 0.3, 
          0,
          node.x, 
          node.y, 
          node.radius
        );
        
        if (isMentalModel) {
          nodeGradient.addColorStop(0, '#00FFFF');
          nodeGradient.addColorStop(0.7, '#0099CC');
          nodeGradient.addColorStop(1, '#006699');
        } else {
          nodeGradient.addColorStop(0, '#FFA500');
          nodeGradient.addColorStop(0.7, '#FF8C00');
          nodeGradient.addColorStop(1, '#FF6B00');
        }

        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = isMentalModel ? '#00FFFF' : '#FFA500';
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        // Draw icon
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = `${isHovered ? '18px' : '16px'} "Font Awesome 6 Free"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isMentalModel ? '🧠' : '⚠️', node.x, node.y);

        // Draw label on hover
        if (isHovered) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          
          // Background for text
          const textWidth = ctx.measureText(node.name).width;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.roundRect(
            node.x - textWidth / 2 - 8,
            node.y + node.radius + 8,
            textWidth + 16,
            20,
            4
          );
          ctx.fill();
          
          // Text
          ctx.fillStyle = 'white';
          ctx.fillText(node.name, node.x, node.y + node.radius + 18);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, hoveredNode]);

  // Mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseRef.current = { x, y };

    // Check if hovering over a node
    const nodes = nodesRef.current;
    let foundHover = false;
    
    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < node.radius) {
        setHoveredNode(node.id);
        canvas.style.cursor = 'pointer';
        foundHover = true;
        break;
      }
    }

    if (!foundHover) {
      setHoveredNode(null);
      canvas.style.cursor = 'default';
    }

    // Move dragged node
    if (draggedNodeRef.current) {
      const draggedNode = nodes.find(n => n.id === draggedNodeRef.current);
      if (draggedNode) {
        draggedNode.x = x;
        draggedNode.y = y;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      draggedNodeRef.current = hoveredNode;
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
    draggedNodeRef.current = null;
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full min-h-[400px] relative bg-[#1A1A1A]/50 rounded-xl overflow-hidden"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/5 via-transparent to-[#8B5CF6]/5"></div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
          <div className="w-3 h-3 rounded-full bg-[#00FFFF]"></div>
          <span className="text-gray-300">Mental Models</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-300">Cognitive Biases</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 text-xs text-gray-400 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        Drag nodes to explore
      </div>
    </motion.div>
  );
};

export default RelationshipVisualization;