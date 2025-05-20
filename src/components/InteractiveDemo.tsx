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

// Helper function to calculate distance between two points
const distance = (point1: Point, point2: Point) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};

// Helper function to normalize an angle between 0 and 2π
const normalizeAngle = (angle: number) => {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
};

// Helper function to calculate the shortest angle between two angles
const angleBetween = (angle1: number, angle2: number) => {
  angle1 = normalizeAngle(angle1);
  angle2 = normalizeAngle(angle2);
  let diff = Math.abs(angle1 - angle2);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
};

// Helper function to find the midpoint angle between two angles
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

// Helper function to clamp a value between min and max
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

  // Drawing functions for background pattern elements

  const drawTriangularPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
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
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    for (let layer = 1; layer <= 3; layer++) {
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

  // Enhanced connection drawing functions

  const drawDefaultConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    currentProgress: number, 
    canvas: HTMLCanvasElement
  ) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    
    // Check if both nodes are highlighted
    const bothHighlighted = node1.highlighted && node2.highlighted;
    
    // Calculate vertical layer positions and differentials
    const yDiff = Math.abs(node1.y - node2.y);
    const sameVerticalLayer = yDiff < 20;
    const adjacentLayer = !sameVerticalLayer && yDiff < canvas.height / 5;
    
    // Calculate distance to center point for triangle formation
    const distToCenter1 = Math.abs(node1.x - center.x);
    const distToCenter2 = Math.abs(node2.x - center.x);
    
    // Form triangular connections:
    // 1. Connect nodes in the same horizontal layer (same y position)
    // 2. Connect nodes to the level below in triangular form
    // 3. For highlighted nodes, ensure proper triangle formation
    const shouldConnect = 
      // Same layer horizontal connections
      (sameVerticalLayer && distance(node1, node2) < 160) || 
      // Connect to nodes in the level below - triangular form
      (adjacentLayer && 
        // Either form a downward-pointing triangle
        ((node1.y < node2.y && Math.abs(distToCenter1) > Math.abs(distToCenter2)) ||
         (node2.y < node1.y && Math.abs(distToCenter2) > Math.abs(distToCenter1)))) ||
      // Special case for highlighted nodes - ensure triangle formation
      (bothHighlighted && distance(node1, node2) < 200);
      
    if (shouldConnect) {
      // Enhanced opacity calculation
      const distVal = distance(node1, node2);
      const opacity = Math.max(0.12, (0.6 - (distVal / 200)) * currentProgress);
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
      
      // Add shadow glow effect
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      // If connecting across layers, use curves to suggest triangular shape
      if (adjacentLayer) {
        // Draw curved lines suggesting triangular formation
        const midX = (node1.x + node2.x) / 2;
        // Adjust control point to bend away from center
        const bendDirection = (node1.x + node2.x) / 2 > center.x ? -1 : 1;
        const bendAmount = 20 * bendDirection;
        const midY = (node1.y + node2.y) / 2 + bendAmount;
        
        ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
      } else {
        // Direct connections for same layer
        ctx.lineTo(node2.x, node2.y);
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
    
    // Calculate distances from center and angles
    const dist1 = distance(node1, center);
    const dist2 = distance(node2, center);
    const angle1 = Math.atan2(node1.y - center.y, node1.x - center.x);
    const angle2 = Math.atan2(node2.y - center.y, node2.x - center.x);
    const angleDiff = angleBetween(angle1, angle2);
    
    // Determine if nodes are on same concentric ring
    const isSameLayer = Math.abs(dist1 - dist2) < 30;
    
    // Determine if nodes are on adjacent concentric rings
    const isAdjacentLayer = !isSameLayer && Math.abs(dist1 - dist2) < 60;
    
    // Hexagonal connections should:
    // 1. Connect nodes on the same ring that are within ~60° of each other
    // 2. Connect nodes on adjacent rings that are within ~30° of each other
    // 3. Special handling for highlighted nodes
    const bothHighlighted = node1.highlighted && node2.highlighted;
    
    const shouldConnect = 
      // Nodes on same ring - connect if they're within 60 degrees (π/3)
      (isSameLayer && angleDiff < Math.PI / 3) ||
      // Nodes on adjacent rings - connect if nearly same angle (within 30 degrees)
      (isAdjacentLayer && angleDiff < Math.PI / 6) ||
      // Special case for highlighted nodes - ensure cohesive pattern
      (bothHighlighted && distance(node1, node2) < 150);
    
    if (shouldConnect) {
      // Enhanced opacity calculation
      const opacity = Math.max(0.15, (0.6 - (distance(node1, node2) / 180)) * currentProgress);
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
      
      // Add shadow glow effect
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      if (isAdjacentLayer) {
        // Curve slightly to show concentric ring structure
        const midAng = midPointAngle(angle1, angle2);
        const midDist = (dist1 + dist2) / 2;
        const cpX = center.x + Math.cos(midAng) * midDist;
        const cpY = center.y + Math.sin(midAng) * midDist;
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else {
        // For nodes on same ring, connection follows the ring's curve slightly
        const avgDist = (dist1 + dist2) / 2;
        const midAngle = midPointAngle(angle1, angle2);
        
        // If nodes are far apart on the ring, curve along the ring
        if (angleDiff > Math.PI / 6) {
          const cpX = center.x + Math.cos(midAngle) * (avgDist * 1.05); // Slightly outside the ring
          const cpY = center.y + Math.sin(midAngle) * (avgDist * 1.05);
          ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
        } else {
          ctx.lineTo(node2.x, node2.y); // Direct line for close nodes
        }
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
    
    // Calculate angles and radii for circular arrangement
    const angle1 = Math.atan2(node1.y - center.y, node1.x - center.x);
    const angle2 = Math.atan2(node2.y - center.y, node2.x - center.x);
    const radius1 = distance(node1, center);
    const radius2 = distance(node2, center);
    
    // Get angle difference - crucial for circular pattern
    const angleDiff = angleBetween(angle1, angle2);
    const radiusRatio = Math.max(radius1, radius2) / Math.min(radius1, radius2);
    
    // Circular connections should:
    // 1. Connect nodes on the same circle (same radius) if they're within ~90° of each other
    // 2. Connect nodes on adjacent circles if they're within ~45° (same sector)
    // 3. Special handling for highlighted nodes
    const bothHighlighted = node1.highlighted && node2.highlighted;
    const almostSameRadius = Math.abs(radius1 - radius2) < 30;
    
    const shouldConnect = 
      // Same circle connections - connect if within 90 degrees
      (almostSameRadius && angleDiff < Math.PI / 2) || 
      // Adjacent circle connections - connect if in similar sector (within 45 degrees)
      (!almostSameRadius && radiusRatio < 1.5 && angleDiff < Math.PI / 4) ||
      // Special case for highlighted nodes - ensure circular pattern
      (bothHighlighted && distance(node1, node2) < 180);
    
    if (shouldConnect) {
      // Enhanced opacity calculation
      const opacity = Math.max(0.15, (0.7 - (distance(node1, node2) / 150)) * currentProgress);
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
      
      // Add shadow glow effect
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      // For nodes on same circle, connection should follow the circle's arc
      if (almostSameRadius && angleDiff > Math.PI / 8) {
        // Calculate control point to make connection follow the circle
        const midAngle = midPointAngle(angle1, angle2);
        // Control point slightly outside the circle for proper curve
        const curveFactor = 1.2 - (angleDiff / Math.PI); // Adjust curve based on angle difference
        const cpRadius = (radius1 + radius2) / 2 * curveFactor;
        const cpX = center.x + Math.cos(midAngle) * cpRadius;
        const cpY = center.y + Math.sin(midAngle) * cpRadius;
        
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } 
      // For nodes on different circles, connection should follow a radial line
      else if (!almostSameRadius) {
        // Use bezier curve to suggest movement between circular layers
        const midAngle = midPointAngle(angle1, angle2);
        // Control point that helps transition between different radii
        const cpRadius = (radius1 + radius2) / 2;
        const cpX = center.x + Math.cos(midAngle) * cpRadius;
        const cpY = center.y + Math.sin(midAngle) * cpRadius;
        
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } 
      // Direct line for nodes close to each other on the same circle
      else {
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
    const horizontalDist = Math.abs(node1.x - node2.x);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Determine if this is a parent-child relationship
    const isVerticalRelation = levelDiff === 1;
    
    // Determine if nodes are siblings (same level)
    const areSiblings = levelDiff === 0;
    
    // Determine parent-child proximity (horizontal alignment)
    const isAligned = horizontalDist < canvas.width * 0.2; // More generous alignment threshold
    
    // Hierarchical connections should:
    // 1. Connect parent-child nodes that are somewhat aligned vertically
    // 2. Connect sibling nodes that are close to each other horizontally
    // 3. Special handling for highlighted nodes
    const bothHighlighted = node1.highlighted && node2.highlighted;
    
    const shouldConnect = 
      // Parent-child vertical connections
      (isVerticalRelation && isAligned) ||
      // Sibling horizontal connections if they're close
      (areSiblings && horizontalDist < 150) ||
      // Special case for highlighted nodes
      (bothHighlighted && distance(node1, node2) < 200);
    
    if (shouldConnect) {
      // Enhanced opacity calculation 
      const opacity = Math.max(0.15, (0.7 - (distance(node1, node2) / 170)) * currentProgress);
      
      // Add connection highlighting for hovered nodes
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
      
      // Add shadow glow effect 
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      if (isVerticalRelation) {
        // Determine which is parent and which is child
        const [topNode, bottomNode] = node1.level < node2.level ? [node1, node2] : [node2, node1];
        
        // Create smoother S-curve for parent-child connections
        const startControlX = topNode.x + (bottomNode.x - topNode.x) * 0.2;
        const startControlY = topNode.y + (bottomNode.y - topNode.y) * 0.3;
        
        const endControlX = topNode.x + (bottomNode.x - topNode.x) * 0.8;
        const endControlY = topNode.y + (bottomNode.y - topNode.y) * 0.7;
        
        // Use bezier curve for smooth connections
        ctx.bezierCurveTo(
          startControlX, startControlY, 
          endControlX, endControlY, 
          bottomNode.x, bottomNode.y
        );
      } else if (areSiblings) {
        // For sibling connections, use subtle arc
        const midX = (node1.x + node2.x) / 2;
        const midY = (node1.y + node2.y) / 2 - 10; // Slight upward curve
        
        ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
      } else {
        // Fallback for other connections
        ctx.lineTo(node2.x, node2.y);
      }
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

  const initNodes = () => {
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

  // Enhanced node positioning function
  const updateNodePosition = (
    node: Node,
    canvas: HTMLCanvasElement,
    currentCategory: string, 
    index: number,
    currentProgress: number 
  ) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(currentProgress);
    
    // During initial chaotic phase
    if (currentProgress < 0.1) {
      node.x += Math.sin(Date.now() * 0.001 + index) * node.speed * (1 - currentProgress * 10);
      node.y += Math.cos(Date.now() * 0.001 + index) * node.speed * (1 - currentProgress * 10);
      node.originalX = node.x;
      node.originalY = node.y;
    } else {
      let targetX, targetY;
      
      // Get highlighted nodes for special positioning
      const highlightedNodes = nodesRef.current.filter(n => n.highlighted);
      const highlightedCount = highlightedNodes.length;
      const highlightedNodeIndex = highlightedNodes.findIndex(n => n.id === node.id);

      // BUSINESS CATEGORY - HEXAGONAL GRID PATTERN
      if (currentCategory === 'business') {
        // Calculate base dimensions for the hexagonal pattern
        const baseHexRadius = Math.min(canvas.width, canvas.height) * 0.4;
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          // Highlighted nodes form a perfect hexagon in the center
          const totalHighlighted = Math.min(highlightedCount, 6); // Maximum 6 nodes for a hexagon
          const hexAngle = (2 * Math.PI) / totalHighlighted;
          const angle = (highlightedNodeIndex % totalHighlighted) * hexAngle;
          
          // Place on innermost hexagon
          targetX = center.x + Math.cos(angle) * (baseHexRadius * 0.35);
          targetY = center.y + Math.sin(angle) * (baseHexRadius * 0.35);
        } else {
          // Non-highlighted nodes form concentric hexagons
          // Determine which hexagonal layer this node belongs to
          const layer = 1 + (index % 3); // 3 layers
          
          // Calculate points on this hexagonal layer
          // More points on outer layers
          const pointsInLayer = 6 * layer; 
          const pointIndex = index % pointsInLayer;
          const angle = (pointIndex / pointsInLayer) * Math.PI * 2;
          
          // Calculate distance from center based on layer
          const layerRadius = baseHexRadius * (layer / 3) * 0.9;
          
          // Add slight randomness for natural look, but maintain hexagonal structure
          const randomFactor = 0.05;
          const randomAngleOffset = (Math.random() - 0.5) * randomFactor;
          const finalAngle = angle + randomAngleOffset;
          
          targetX = center.x + Math.cos(finalAngle) * layerRadius;
          targetY = center.y + Math.sin(finalAngle) * layerRadius;
        }
      } 
      
      // PERSONAL CATEGORY - CIRCULAR PATTERN
      else if (currentCategory === 'personal') {
        // Base radius for the concentric circles
        const baseRadius = Math.min(canvas.width, canvas.height) * 0.35;
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          // Place highlighted nodes evenly on the main circle
          const angle = (highlightedNodeIndex / highlightedCount) * Math.PI * 2;
          targetX = center.x + Math.cos(angle) * baseRadius;
          targetY = center.y + Math.sin(angle) * baseRadius;
        } else {
          // Non-highlighted nodes form multiple concentric circles
          // Determine which circle this node belongs to
          const circleIndex = index % 3; // 3 concentric circles
          const circleRadius = baseRadius * (0.6 + circleIndex * 0.3); // Properly spaced circles
          
          // Calculate position on this circle
          // Use golden angle for more uniform distribution
          const pointsOnCircle = Math.max(8, Math.floor(circleRadius * 0.2));
          const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle ~137.5°
          const angle = (index * goldenAngle) % (Math.PI * 2);
          
          // Add subtle movement for more dynamic feel
          const timeOffset = Date.now() * 0.0001;
          const pulseFactor = 0.02 * Math.sin(timeOffset + index);
          const adjustedRadius = circleRadius * (1 + pulseFactor);
          
          targetX = center.x + Math.cos(angle) * adjustedRadius;
          targetY = center.y + Math.sin(angle) * adjustedRadius;
        }
      } 
      
      // ANALYSIS CATEGORY - HIERARCHICAL PATTERN
      else if (currentCategory === 'analysis') {
        // Calculate dimensions for the hierarchical layout
        const levels = 3;
        const levelHeight = canvas.height / (levels + 1);
        const effectiveMarginX = canvas.width * 0.15;
        
        if (node.highlighted && node.level !== undefined) {
          // The level of this node (0, 1, or 2)
          const nodeLevel = node.level % levels;
          
          // Find other highlighted nodes at this level
          const nodesInThisLevel = highlightedNodes.filter(n => 
            n.level !== undefined && (n.level % levels) === nodeLevel
          );
          
          const countInLevel = nodesInThisLevel.length;
          const nodeIndexInLevel = nodesInThisLevel.findIndex(n => n.id === node.id);
          
          // Better distribute nodes horizontally at each level
          const levelWidth = canvas.width - effectiveMarginX * 2;
          const nodeSpacing = countInLevel > 0 ? levelWidth / (countInLevel + 1) : levelWidth;
          
          // Calculate position - horizontal position depends on index within level
          targetX = effectiveMarginX + nodeSpacing * (nodeIndexInLevel + 1);
          // Vertical position is determined by level
          targetY = levelHeight * (nodeLevel + 1);
        } else {
          // Non-highlighted nodes form a more random background
          // but still maintain some horizontal stratification
          const randomLevel = Math.floor(Math.random() * levels);
          
          // Add jitter but maintain level structure
          targetX = effectiveMarginX + Math.random() * (canvas.width - effectiveMarginX * 2);
          targetY = levelHeight * (randomLevel + 1) + (Math.random() - 0.5) * levelHeight * 0.4;
        }
      } 
      
      // DEFAULT CATEGORY - TRIANGULAR PATTERN
      else { 
        // Calculate dimensions for the triangular layout
        const triangleHeight = Math.min(canvas.width, canvas.height) * 0.7;
        const triangleWidth = triangleHeight * 0.866; // Width of equilateral triangle
        const layers = 4; // Number of horizontal layers in the triangle
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          // Place highlighted nodes in a clear triangular pattern
          
          // Calculate which layer this node should go in
          // Distribution: Layer 0: 1 node, Layer 1: 2 nodes, Layer 2: 3 nodes, Layer 3: 4 nodes
          let targetLayer = 0;
          let nodesInPreviousLayers = 0;
          let nodePositionInLayer = 0;
          
          for (let l = 0; l < layers; l++) {
            const nodesInThisLayer = l + 1; // 1, 2, 3, 4 nodes per layer
            
            if (highlightedNodeIndex < nodesInPreviousLayers + nodesInThisLayer) {
              targetLayer = l;
              nodePositionInLayer = highlightedNodeIndex - nodesInPreviousLayers;
              break;
            }
            nodesInPreviousLayers += nodesInThisLayer;
          }
          
          // Calculate vertical position based on layer
          const layerY = canvas.height * 0.2 + targetLayer * (triangleHeight / layers);
          
          // Calculate horizontal position based on position within layer
          // Width gets wider as we go down layers
          const layerWidthRatio = 1 - (targetLayer / layers);
          const currentLayerWidth = triangleWidth * layerWidthRatio;
          
          // Evenly distribute nodes horizontally in this layer
          const nodesInLayer = targetLayer + 1;
          const horizontalSpacing = nodesInLayer > 1 ? currentLayerWidth / (nodesInLayer - 1) : 0;
          
          targetX = center.x - (currentLayerWidth / 2) + nodePositionInLayer * horizontalSpacing;
          targetY = layerY;
        } else {
          // Non-highlighted nodes still follow triangular structure but with randomness
          // Pick a random layer, biased toward middle layers for more density there
          const randomLayerIndex = Math.floor(Math.pow(Math.random(), 0.8) * layers);
          
          // Calculate y-position based on layer
          const yPos = canvas.height * 0.2 + randomLayerIndex * (triangleHeight / layers);
          
          // Calculate width at this layer
          const layerWidthRatio = 1 - (randomLayerIndex / layers);
          const layerWidth = triangleWidth * layerWidthRatio;
          
          // Calculate x-position with jitter but staying within triangle bounds
          // More jitter for lower layers
          const jitterFactor = 0.2 * (randomLayerIndex / layers);
          const jitterAmount = layerWidth * jitterFactor * (Math.random() - 0.5);
          
          targetX = center.x + jitterAmount + (Math.random() - 0.5) * layerWidth;
          targetY = yPos + (Math.random() - 0.5) * 10; // Small vertical jitter
        }
      }
      
      // Set target positions
      node.targetX = targetX;
      node.targetY = targetY;
      
      // Move toward target position with easing
      // Increase speed based on progress for smoother transition
      const moveSpeed = 0.05 * easedProgress; 
      node.x += (node.targetX - node.x) * moveSpeed;
      node.y += (node.targetY - node.y) * moveSpeed;
    }

    // Ensure node stays within canvas bounds
    node.x = clamp(node.x, 0, canvas.width);
    node.y = clamp(node.y, 0, canvas.height);
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
      className="w-full h-80 bg-[#202020] rounded-lg overflow-hidden relative" // Increased height from h-64 to h-80
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
      {/* Enhanced gradient overlay for better depth perception */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#202020]/40" />
    </motion.div>
  );
};

export default InteractiveDemo;