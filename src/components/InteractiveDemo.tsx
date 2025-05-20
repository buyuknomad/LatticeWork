import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  color: string;
}

interface Node {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
  highlighted: boolean;
  name?: string;
  category?: string;
  originalX: number;
  originalY: number;
  targetX: number;
  targetY: number;
  level?: number; // Added for hierarchical layouts
}

interface Point {
  x: number;
  y: number;
}

interface InteractiveDemoProps {
  isTyping: boolean;
  category: 'business' | 'personal' | 'analysis' | 'default';
}

// Helper function to calculate distance between two points (can stay outside)
const distance = (point1: Point, point2: Point) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};

// Helper function to normalize an angle between 0 and 2π (can stay outside)
const normalizeAngle = (angle: number) => {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
};

// Helper function to calculate the shortest angle between two angles (can stay outside)
const angleBetween = (angle1: number, angle2: number) => {
  angle1 = normalizeAngle(angle1);
  angle2 = normalizeAngle(angle2);
  let diff = Math.abs(angle1 - angle2);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
};

// Helper function to find the midpoint angle between two angles (can stay outside)
const midPointAngle = (angle1: number, angle2: number) => {
  angle1 = normalizeAngle(angle1);
  angle2 = normalizeAngle(angle2);
  
  if (Math.abs(angle1 - angle2) > Math.PI) {
    if (angle1 > angle2) {
      angle2 += Math.PI * 2;
    } else {
      angle1 += Math.PI * 2;
    }
  }
  
  let midAngle = (angle1 + angle2) / 2;
  return normalizeAngle(midAngle);
};

// Helper function to clamp a value between min and max (can stay outside)
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ isTyping, category }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const centerRef = useRef<Point>({ x: 0, y: 0 });

  const mentalModels = {
    business: [
      "First Principles", "Competitive Advantage", "Network Effects", "Game Theory", "Opportunity Cost"
    ],
    personal: [
      "Pareto Principle", "Decision Matrix", "Habit Formation", "Time Boxing", "Energy Management"
    ],
    analysis: [
      "Second-Order Thinking", "Inversion", "Confirmation Bias", "Systems Thinking", "Probabilistic Reasoning"
    ],
    default: [
      "First Principles", "Occam's Razor", "Pareto Principle", "Second-Order Thinking", "Inversion"
    ]
  };

  // Moved drawing functions inside the component to access scope (centerRef, transitionProgress)

  const drawTriangularPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    // Increased opacity from 0.03 to 0.05 for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    const triangleHeight = Math.min(canvas.width, canvas.height) * 0.7;
    const triangleWidth = triangleHeight * 0.866; // Equilateral triangle width
    const layers = 4;
    
    for (let layer = 0; layer < layers; layer++) {
      const yPos = canvas.height * 0.2 + layer * (triangleHeight / layers);
      const layerWidthRatio = 1 - (layer / layers);
      const currentLayerWidth = triangleWidth * layerWidthRatio;
      const startX = center.x - currentLayerWidth / 2;
      const endX = center.x + currentLayerWidth / 2;
      
      ctx.beginPath();
      ctx.moveTo(startX, yPos);
      ctx.lineTo(endX, yPos);
      ctx.stroke();
      
      if (layer === 0) {
        ctx.beginPath();
        ctx.moveTo(center.x, yPos);
        ctx.lineTo(center.x - triangleWidth / 2, canvas.height * 0.2 + triangleHeight);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(center.x, yPos);
        ctx.lineTo(center.x + triangleWidth / 2, canvas.height * 0.2 + triangleHeight);
        ctx.stroke();
      }
    }
  };

  const drawGridPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    // Increased opacity from 0.03 to 0.05 for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    for (let layer = 1; layer <= 3; layer++) {
      // Increased base factor from 0.40 to 0.42 for larger hexagons
      const hexRadius = Math.min(canvas.width, canvas.height) * 0.42 * (layer / 3); 
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * hexRadius;
        const y = center.y + Math.sin(angle) * hexRadius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  };

  const drawCirclePatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    // Increased opacity from 0.06 to 0.08 for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.08 * transitionProgress})`; 
    ctx.lineWidth = 1;
    
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.3;
    for (let i = 1; i <= 3; i++) {
      const radius = baseRadius * i * 0.4;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      const endX = center.x + Math.cos(angle) * baseRadius * 1.2;
      const endY = center.y + Math.sin(angle) * baseRadius * 1.2;
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  };

  const drawHierarchyPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const levels = 3;
    const levelHeight = canvas.height / (levels + 1);
    
    // Increased opacity from 0.03 to 0.05 for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    for (let level = 1; level <= levels; level++) {
      const y = levelHeight * level;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const drawDefaultConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    currentProgress: number, 
    canvas: HTMLCanvasElement
  ) => {
    const sameLayer = Math.abs(node1.y - node2.y) < 20;
    const adjacentLayer = !sameLayer && Math.abs(node1.y - node2.y) < canvas.height / 5;
    const distVal = distance(node1, node2); 
    
    // Increased connection distance threshold from 120 to 150
    if ((sameLayer || adjacentLayer) && distVal < 150) {
      // Enhanced opacity calculation for better visibility
      // Reduced divisor from 300 to 200 for stronger connections
      const opacity = (0.5 - (distVal / 200)) * currentProgress;
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : 1;
      const glowAmount = isNodeHovered ? 5 : 0;
      
      // Add shadow glow effect for better visibility
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${Math.max(0.1, opacity)})`; // Increased min opacity from 0.05 to 0.1
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      if (adjacentLayer) {
        ctx.lineTo(node2.x, node2.y);
      } else {
        const midX = (node1.x + node2.x) / 2;
        const midY = (node1.y + node2.y) / 2 - 10;
        ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
      }
      ctx.stroke();
      
      // Reset shadow and line width
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
    }
  };

  const drawGridConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    currentProgress: number 
  ) => {
    const center = centerRef.current || { 
      x: canvasRef.current ? canvasRef.current.width / 2 : 0, 
      y: canvasRef.current ? canvasRef.current.height / 2 : 0 
    };
    const dist1 = distance(node1, center);
    const dist2 = distance(node2, center);
    
    const isSameLayer = Math.abs(dist1 - dist2) < 25; // Increased threshold from 20 to 25
    const isAdjacentLayer = Math.abs(dist1 - dist2) < 50 && !isSameLayer; // Increased threshold from 40 to 50
    
    // Increased connection distance threshold from 100 to 130
    if ((isSameLayer || isAdjacentLayer) && distance(node1, node2) < 130) {
      // Reduced divisor from 300 to 180 for stronger connections
      const opacity = (0.5 - (distance(node1, node2) / 180)) * currentProgress;
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (isSameLayer ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : 0;
      
      // Add shadow glow effect for better visibility
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${Math.max(0.12, opacity)})`; // Increased min opacity from 0.05 to 0.12
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      if (isAdjacentLayer) {
        const angle1 = Math.atan2(node1.y - center.y, node1.x - center.x);
        const angle2 = Math.atan2(node2.y - center.y, node2.x - center.x);
        const midAng = midPointAngle(angle1, angle2); 
        const midDist = (dist1 + dist2) / 2;
        const cpX = center.x + Math.cos(midAng) * midDist;
        const cpY = center.y + Math.sin(midAng) * midDist;
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else {
        ctx.lineTo(node2.x, node2.y);
      }
      ctx.stroke();
      
      // Reset shadow and line width
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
    }
  };

  const drawCircularConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    currentProgress: number 
  ) => {
    const center = centerRef.current || { 
      x: canvasRef.current ? canvasRef.current.width / 2 : 0, 
      y: canvasRef.current ? canvasRef.current.height / 2 : 0 
    };
    
    const angle1 = Math.atan2(node1.y - center.y, node1.x - center.x);
    const angle2 = Math.atan2(node2.y - center.y, node2.x - center.x);
    const radius1 = distance(node1, center);
    const radius2 = distance(node2, center);
    
    // Increased angle threshold from 0.8 to 1.0 and from 1.2 to 1.4
    const angleDiff = Math.abs(angleBetween(angle1, angle2)); 
    const radiusRatio = Math.max(radius1, radius2) / Math.min(radius1, radius2);
    
    if ((angleDiff < 1.0 && radiusRatio < 1.4) || 
        (Math.abs(radius1 - radius2) < 25 && angleDiff < 1.4)) { // Increased threshold from 20 to 25
      
      // Reduced divisor from 300 to 160 for stronger connections  
      const opacity = (0.5 - (distance(node1, node2) / 160)) * currentProgress;
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : 1.2; // Increased base lineWidth from 1 to 1.2
      const glowAmount = isNodeHovered ? 5 : 0;
      
      // Add shadow glow effect for better visibility
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      // Increased minimum opacity from 0.1 to 0.15
      ctx.strokeStyle = `rgba(0, 255, 255, ${Math.max(0.15, opacity)})`; 
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      if (Math.abs(radius1 - radius2) < 25 && angleDiff > 0.1) { // Increased threshold from 20 to 25
        const midAng = midPointAngle(angle1, angle2); 
        const midRadius = (radius1 + radius2) / 2;
        const controlX = center.x + Math.cos(midAng) * midRadius;
        const controlY = center.y + Math.sin(midAng) * midRadius;
        ctx.quadraticCurveTo(controlX, controlY, node2.x, node2.y);
      } else {
        ctx.lineTo(node2.x, node2.y);
      }
      ctx.stroke();
      
      // Reset shadow and line width
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
    }
  };

  const drawHierarchicalConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    currentProgress: number 
  ) => {
    if (node1.level === undefined || node2.level === undefined) return; 
    
    const levelDiff = Math.abs(node1.level - node2.level);
    // Increased connection distance threshold from 150 to 180
    if (levelDiff === 1 && distance(node1, node2) < 180) {
      // Reduced divisor from 300 to 170 for stronger connections
      const opacity = (0.5 - (distance(node1, node2) / 170)) * currentProgress;
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : 1.3; // Increased base lineWidth from 1 to 1.3
      const glowAmount = isNodeHovered ? 5 : 0;
      
      // Add shadow glow effect for better visibility
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      // Increased minimum opacity from 0.05 to 0.13
      ctx.strokeStyle = `rgba(0, 255, 255, ${Math.max(0.13, opacity)})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      const [topNode, bottomNode] = node1.level < node2.level ? [node1, node2] : [node2, node1];
      
      const controlX = (topNode.x + bottomNode.x) / 2;
      const controlY = topNode.y + (bottomNode.y - topNode.y) * 0.3;
      
      ctx.quadraticCurveTo(controlX, controlY, bottomNode.x, bottomNode.y);
      ctx.stroke();
      
      // Reset shadow and line width
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
    }
  };

  const drawChaoticConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    currentProgress: number 
  ) => {
    const invProgress = 1 - currentProgress;
    ctx.strokeStyle = `rgba(51, 51, 51, ${invProgress * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    ctx.lineTo(node2.x, node2.y);
    ctx.stroke();
  };

  const isInViewport = (element: HTMLElement | null) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0 &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right >= 0
    );
  };

  useEffect(() => {
    const checkVisibility = () => {
      setIsVisible(isInViewport(canvasRef.current));
    };

    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);

  useEffect(() => {
    let intervalId: number;
    if (isTyping) {
      let progressVal = 0;
      intervalId = window.setInterval(() => {
        progressVal += 0.02;
        setTransitionProgress(Math.min(progressVal, 1));
        if (progressVal >= 1) clearInterval(intervalId);
      }, 20);
    } else {
      intervalId = window.setInterval(() => {
        setTransitionProgress(prev => {
          const newValue = Math.max(0, prev - 0.02);
          if (newValue <= 0) clearInterval(intervalId);
          return newValue;
        });
      }, 20);
    }
    return () => clearInterval(intervalId);
  }, [isTyping, category]); 

  const initNodes = () => { // initNodes should be defined before being used in useEffect's resizeCanvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newNodes: Node[] = [];
    const numNodes = Math.min(40, Math.floor(canvas.width * canvas.height / 25000));
    const currentModels = mentalModels[category] || mentalModels.default; 
    
    for (let i = 0; i < numNodes; i++) {
      const highlighted = i < currentModels.length;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      
      newNodes.push({
        id: i,
        x: x,
        y: y,
        // Highlighted nodes slightly larger for better visibility
        radius: highlighted ? 7 : 3 + Math.random() * 2,
        color: highlighted ? '#00FFFF' : '#444444',
        speed: 0.2 + Math.random() * 0.3,
        highlighted,
        name: highlighted ? currentModels[i] : undefined,
        category: highlighted ? category : undefined,
        originalX: x,
        originalY: y,
        targetX: x,
        targetY: y,
        level: highlighted && category === 'analysis' ? Math.floor(i / 3) : undefined 
      });
    }
    nodesRef.current = newNodes;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      centerRef.current = { 
        x: canvas.width / 2, 
        y: canvas.height / 2 
      };
      initNodes(); 
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); 

    const animate = () => {
      if (!canvas || !ctx || !isVisible) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentNodes = nodesRef.current; 
      
      if (transitionProgress > 0.7) {
        if (category === 'business') {
          drawGridPatternElements(ctx, canvas);
        } else if (category === 'personal') {
          drawCirclePatternElements(ctx, canvas);
        } else if (category === 'analysis') {
          drawHierarchyPatternElements(ctx, canvas);
        } else {
          drawTriangularPatternElements(ctx, canvas);
        }
      }
      
      drawConnections(ctx, currentNodes, transitionProgress);
      drawParticles(ctx);
      
      currentNodes.forEach((node, i) => {
        drawNode(ctx, node, transitionProgress > 0);
        updateNodePosition(node, canvas, category, i, transitionProgress);
      });

      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isTyping, category, isVisible, transitionProgress, hoveredNodeId]); 

  const drawNode = (ctx: CanvasRenderingContext2D, node: Node, isActive: boolean) => {
    const isHovered = node.id === hoveredNodeId;
    const nodeRadius = isHovered ? 
      (node.highlighted ? 10 : 7) : // Slightly increased hover size 
      (node.radius); // Use node.radius directly as it's initialized
    
    if ((node.highlighted && isActive) || isHovered) {
      // Increased shadow blur for better visibility
      ctx.shadowBlur = isHovered ? 18 : 15;
      ctx.shadowColor = node.color;
    } else {
      ctx.shadowBlur = 0;
    }

    const gradient = ctx.createRadialGradient(
      node.x, node.y, 0,
      node.x, node.y, nodeRadius
    );
    
    const alpha = node.highlighted ? 
      (0.8 + 0.2 * transitionProgress) : // Increased base alpha from 0.7 to 0.8
      (0.4 + 0.1 * transitionProgress); // Increased base alpha from 0.3 to 0.4
    
    gradient.addColorStop(0, `${node.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${node.color}00`);

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowBlur = 0; 

    if (transitionProgress > 0.5 && node.highlighted && node.name) {
      const labelOpacity = (transitionProgress - 0.5) * 2;
      ctx.fillStyle = `rgba(255, 255, 255, ${labelOpacity})`;
      // Slightly larger font for better readability
      ctx.font = `${isHovered ? 'bold ' : ''}11px Inter, sans-serif`; 
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y - nodeRadius - 5);
      
      // Add shadow to text for better readability
      if (isHovered) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 3;
        ctx.fillText(node.name, node.x, node.y - nodeRadius - 5);
        ctx.shadowBlur = 0;
      }
    }
  };

  const drawConnections = (ctx: CanvasRenderingContext2D, nodes: Node[], currentProgress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (currentProgress < 0.1) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() > 0.97) {
            drawChaoticConnection(ctx, nodes[i], nodes[j], currentProgress);
          }
        }
      }
    } else {
      // First draw non-highlighted connections
      for (let i = 0; i < nodes.length; i++) {
        const node1 = nodes[i];
        if (node1.highlighted) continue; // Skip highlighted nodes for now
        
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const node2 = nodes[j];
          if (node2.highlighted) continue; // Skip highlighted nodes for now
          
          if (category === 'business') {
            drawGridConnection(ctx, node1, node2, currentProgress * 0.7); // Reduced opacity for non-highlighted
          } else if (category === 'personal') {
            drawCircularConnection(ctx, node1, node2, currentProgress * 0.7); // Reduced opacity for non-highlighted
          } else if (category === 'analysis') {
            drawHierarchicalConnection(ctx, node1, node2, currentProgress * 0.7); // Reduced opacity for non-highlighted
          } else {
            drawDefaultConnection(ctx, node1, node2, currentProgress * 0.7, canvas); // Reduced opacity for non-highlighted
          }
        }
      }
      
      // Then draw connections involving highlighted nodes (on top)
      for (let i = 0; i < nodes.length; i++) {
        const node1 = nodes[i];
        if (!node1.highlighted && node1.id !== hoveredNodeId) continue; // Only process highlighted or hovered
        
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const node2 = nodes[j];
          
          if (category === 'business') {
            drawGridConnection(ctx, node1, node2, currentProgress);
          } else if (category === 'personal') {
            drawCircularConnection(ctx, node1, node2, currentProgress);
          } else if (category === 'analysis') {
            drawHierarchicalConnection(ctx, node1, node2, currentProgress);
          } else {
            drawDefaultConnection(ctx, node1, node2, currentProgress, canvas);
          }
        }
      }
    }
  };
  
  const updateNodePosition = (
    node: Node,
    canvas: HTMLCanvasElement,
    currentCategory: string, 
    index: number,
    currentProgress: number 
  ) => {
    // const marginX = canvas.width * 0.15; // Defined but not always used
    // const marginY = canvas.height * 0.15; // Defined but not always used
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(currentProgress);
    
    if (currentProgress < 0.1) {
      node.x += Math.sin(Date.now() * 0.001 + index) * node.speed * (1 - currentProgress * 10);
      node.y += Math.cos(Date.now() * 0.001 + index) * node.speed * (1 - currentProgress * 10);
      node.originalX = node.x;
      node.originalY = node.y;
    } else {
      let targetX, targetY;
      
      const highlightedNodes = nodesRef.current.filter(n => n.highlighted);
      const highlightedCount = highlightedNodes.length;
      const highlightedNodeIndex = highlightedNodes.findIndex(n => n.id === node.id);


      if (currentCategory === 'business') {
        // Increased base factor from 0.40 to 0.42 for larger hexagons node placement
        const hexRadius = Math.min(canvas.width, canvas.height) * 0.42; 
        const hexLayers = 3; 
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          const angle = (highlightedNodeIndex / Math.max(1, highlightedCount)) * Math.PI * 2;
          const adjustedRadius = hexRadius * 0.4; 
          targetX = center.x + Math.cos(angle) * adjustedRadius;
          targetY = center.y + Math.sin(angle) * adjustedRadius;
        } else {
          const layer = 1 + (index % hexLayers); 
          const layerNodes = Math.max(1, Math.floor(6 * layer));
          const nodeInLayer = index % layerNodes;
          const angle = (nodeInLayer / layerNodes) * Math.PI * 2;
          const adjustedRadius = hexRadius * (layer / hexLayers);
          targetX = center.x + Math.cos(angle) * adjustedRadius * (0.9 + Math.random() * 0.2);
          targetY = center.y + Math.sin(angle) * adjustedRadius * (0.9 + Math.random() * 0.2);
        }
      } else if (currentCategory === 'personal') {
        if (node.highlighted && highlightedNodeIndex !== -1) {
          const angle = (highlightedNodeIndex / Math.max(1, highlightedCount)) * Math.PI * 2;
          const radius = Math.min(canvas.width, canvas.height) * 0.3;
          targetX = center.x + Math.cos(angle) * radius;
          targetY = center.y + Math.sin(angle) * radius;
        } else {
          const angle = (index / Math.max(1, nodesRef.current.length)) * Math.PI * 2;
          const baseRadius = Math.min(canvas.width, canvas.height) * 0.3;
          const radius = baseRadius * (1.2 + (index % 3) * 0.2); 
          targetX = center.x + Math.cos(angle + Math.sin(Date.now() * 0.0003) * 0.2) * radius;
          targetY = center.y + Math.sin(angle + Math.sin(Date.now() * 0.0003) * 0.2) * radius;
        }
      } else if (currentCategory === 'analysis') {
        const levels = 3; 
        const levelHeight = canvas.height / (levels + 1);
        const effectiveMarginX = canvas.width * 0.1;
        
        if (node.highlighted && node.level !== undefined) {
          const nodeLevel = node.level % levels;
          // Filter nodes in the current level among highlighted nodes
          const nodesInThisLevel = highlightedNodes.filter(n => n.level !== undefined && (n.level % levels) === nodeLevel);
          const countInLevel = nodesInThisLevel.length;
          const nodeIndexInLevel = nodesInThisLevel.findIndex(n => n.id === node.id);

          const levelWidth = canvas.width - effectiveMarginX * 2;
          // Ensure countInLevel is at least 1 if nodeIndexInLevel is valid
          const nodeSpacing = countInLevel > 0 ? levelWidth / (countInLevel + 1) : levelWidth; 
          
          targetX = effectiveMarginX + nodeSpacing * (nodeIndexInLevel + 1);
          targetY = levelHeight * (nodeLevel + 1);
        } else {
          const randomLevel = Math.floor(Math.random() * levels);
          targetX = effectiveMarginX + Math.random() * (canvas.width - effectiveMarginX * 2);
          targetY = levelHeight * (randomLevel + 1) + (Math.random() - 0.5) * levelHeight * 0.5;
        }
      } else { // Default - Triangular pattern
        const triangleHeight = Math.min(canvas.width, canvas.height) * 0.7;
        const triangleWidth = triangleHeight * 0.866; 
        const layers = 4;
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
            const numHighlighted = Math.max(1, highlightedCount);
            // Attempt to distribute highlighted nodes into layers in a triangular fashion
            let nodesInPreviousLayers = 0;
            let targetLayer = 0;
            for (let l = 0; l < layers; l++) {
                const nodesInThisLayer = l + 1; // e.g. 1, 2, 3, 4 nodes for a simple triangle
                if (highlightedNodeIndex < nodesInPreviousLayers + nodesInThisLayer) {
                    targetLayer = l;
                    break;
                }
                nodesInPreviousLayers += nodesInThisLayer;
            }
            targetLayer = Math.min(targetLayer, layers -1); // Cap at max layers

            const nodesActuallyInTargetLayer = Math.min(targetLayer + 1, numHighlighted - nodesInPreviousLayers);
            const indexInTargetLayer = highlightedNodeIndex - nodesInPreviousLayers;


            const layerY = canvas.height * 0.2 + targetLayer * (triangleHeight / layers);
            const layerWidthRatio = 1 - (targetLayer / layers);
            const currentLayerWidth = triangleWidth * layerWidthRatio;
            
            if (nodesActuallyInTargetLayer <= 1) {
                targetX = center.x;
            } else {
                const spacing = currentLayerWidth / Math.max(1, nodesActuallyInTargetLayer -1); // Avoid division by zero
                targetX = (center.x - currentLayerWidth / 2) + indexInTargetLayer * spacing;
            }
            targetY = layerY;

        } else { 
            const randomLayer = Math.max(1, layers - 1 - Math.floor(Math.random()*2)); 
            const yPos = canvas.height * 0.2 + randomLayer * (triangleHeight / layers);
            const layerWidthRatio = 1-(randomLayer / layers);
            const layerWidth = triangleWidth * layerWidthRatio;
            targetX = (center.x - layerWidth/2) + Math.random() * layerWidth;
            targetY = yPos;
        }
      }
      
      node.targetX = targetX;
      node.targetY = targetY;
      
      const moveSpeed = 0.05 * easedProgress; 
      node.x += (node.targetX - node.x) * moveSpeed;
      node.y += (node.targetY - node.y) * moveSpeed;
    }

    node.x = clamp(node.x, 0, canvas.width);
    node.y = clamp(node.y, 0, canvas.height);
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Increased particle count by reducing the random threshold from 0.7 to 0.65
    if (transitionProgress > 0.3 && Math.random() > 0.65 && particlesRef.current.length < 150) { // Increased max from 100 to 150
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // Slightly larger particles for better visibility
          size: 0.5 + Math.random() * 2, // Increased min size from 0 to 0.5
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          life: 50 + Math.random() * 50,
          color: '#00FFFF'
        });
      }
    }
    
    particlesRef.current.forEach((particle, index) => {
      const nearestNode = findNearestHighlightedNode(particle);
      
      if (nearestNode && transitionProgress > 0.5) {
        // Increased attraction strength from 0.03 to 0.04
        particle.x += (nearestNode.x - particle.x) * 0.04;
        particle.y += (nearestNode.y - particle.y) * 0.04;
      } else {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
      }
      
      // Increased base opacity
      const opacity = (particle.life / 80) * transitionProgress; // Reduced divisor from 100 to 80
      ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      particle.life--;
      
      if (particle.life <= 0 || particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
        particlesRef.current.splice(index, 1);
      }
    });
  };
  
  const findNearestHighlightedNode = (particle: Point): Node | null => { 
    let nearestNode: Node | null = null;
    let minDistanceSq = Infinity; 
    
    nodesRef.current.forEach(node => {
      if (node.highlighted) {
        const dx = node.x - particle.x;
        const dy = node.y - particle.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          nearestNode = node;
        }
      }
    });
    return nearestNode;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let newHoveredId: number | null = null;
    let minDistanceSq = 30 * 30; 

    nodesRef.current.forEach(node => {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distSq = dx*dx + dy*dy;

      if (distSq < node.radius * node.radius + minDistanceSq && distSq < minDistanceSq) { // Check against node radius + hover threshold
        minDistanceSq = distSq; 
        newHoveredId = node.id;
      }
    });
    
    if (hoveredNodeId !== newHoveredId) {
      setHoveredNodeId(newHoveredId);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredNodeId(null);
  };

  return (
    <motion.div 
      className="w-full h-64 bg-[#202020] rounded-lg overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#202020]/30" />
    </motion.div>
  );
};

export default InteractiveDemo;