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
  level?: number; // For hierarchical layouts
  
  // Additional properties for geometric calculations
  distFromCenter?: number;
  angleFromCenter?: number;
  calculatedLayer?: number;
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

  // ENHANCED BACKGROUND PATTERN FUNCTIONS
  
  const drawTriangularPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    // Increased opacity for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.12 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    const triangleHeight = Math.min(canvas.width, canvas.height) * 0.7;
    const triangleWidth = triangleHeight * 0.866; // Equilateral triangle width
    const layers = 4;
    
    // Draw triangular grid with more complete lines
    for (let layer = 0; layer < layers; layer++) {
      const yPos = canvas.height * 0.2 + layer * (triangleHeight / layers);
      const layerWidthRatio = 1 - (layer / layers);
      const currentLayerWidth = triangleWidth * layerWidthRatio;
      const startX = center.x - currentLayerWidth / 2;
      const endX = center.x + currentLayerWidth / 2;
      
      // Horizontal lines for each layer
      ctx.beginPath();
      ctx.moveTo(startX, yPos);
      ctx.lineTo(endX, yPos);
      ctx.stroke();
      
      // If first layer, draw main triangle outline
      if (layer === 0) {
        // Left side
        ctx.beginPath();
        ctx.moveTo(center.x, yPos);
        ctx.lineTo(center.x - triangleWidth / 2, canvas.height * 0.2 + triangleHeight);
        ctx.stroke();
        
        // Right side
        ctx.beginPath();
        ctx.moveTo(center.x, yPos);
        ctx.lineTo(center.x + triangleWidth / 2, canvas.height * 0.2 + triangleHeight);
        ctx.stroke();
        
        // Bottom side
        ctx.beginPath();
        ctx.moveTo(center.x - triangleWidth / 2, canvas.height * 0.2 + triangleHeight);
        ctx.lineTo(center.x + triangleWidth / 2, canvas.height * 0.2 + triangleHeight);
        ctx.stroke();
      }
      
      // Add internal grid lines
      if (layer > 0) {
        const prevLayerY = canvas.height * 0.2 + (layer - 1) * (triangleHeight / layers);
        const prevLayerWidth = triangleWidth * (1 - ((layer - 1) / layers));
        const prevStartX = center.x - prevLayerWidth / 2;
        const prevEndX = center.x + prevLayerWidth / 2;
        
        // Internal lines connecting previous layer to current
        const segments = layer + 1;
        for (let s = 0; s <= segments; s++) {
          const ratio = s / segments;
          const prevX = prevStartX + ratio * prevLayerWidth;
          const currentX = startX + ratio * currentLayerWidth;
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevLayerY);
          ctx.lineTo(currentX, yPos);
          ctx.stroke();
        }
      }
    }
  };

  const drawGridPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    // Increased opacity for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.12 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    // Draw three concentric hexagons
    for (let layer = 1; layer <= 3; layer++) {
      const hexRadius = Math.min(canvas.width, canvas.height) * 0.42 * (layer / 3); 
      
      // Draw hexagon
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
      
      // Add radial lines connecting to corners
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * hexRadius;
        const y = center.y + Math.sin(angle) * hexRadius;
        
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
    
    // Add additional grid lines
    if (transitionProgress > 0.9) {
      const outerRadius = Math.min(canvas.width, canvas.height) * 0.42;
      
      // Draw additional hexagonal grid lines
      for (let i = 0; i < 6; i++) {
        const angle1 = (i / 6) * Math.PI * 2;
        const angle2 = ((i + 2) % 6 / 6) * Math.PI * 2;
        
        const x1 = center.x + Math.cos(angle1) * outerRadius;
        const y1 = center.y + Math.sin(angle1) * outerRadius;
        const x2 = center.x + Math.cos(angle2) * outerRadius;
        const y2 = center.y + Math.sin(angle2) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  };

  const drawCirclePatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    // Increased opacity for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.15 * transitionProgress})`; 
    ctx.lineWidth = 1;
    
    // Draw perfect concentric circles
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.3;
    for (let i = 1; i <= 3; i++) {
      const radius = baseRadius * i * 0.4;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Add animated pulsing effect
      if (transitionProgress > 0.8) {
        const pulsePhase = Date.now() * 0.001 % (Math.PI * 2);
        const pulseRadius = radius * (1 + 0.02 * Math.sin(pulsePhase + i));
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 * transitionProgress})`;
        ctx.beginPath();
        ctx.arc(center.x, center.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.15 * transitionProgress})`;
      }
    }
    
    // Draw radial lines
    const numRadials = 12; // 12 radial lines at 30° intervals
    for (let i = 0; i < numRadials; i++) {
      const angle = (i / numRadials) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      const endX = center.x + Math.cos(angle) * baseRadius * 1.2;
      const endY = center.y + Math.sin(angle) * baseRadius * 1.2;
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    // Add circle segments
    if (transitionProgress > 0.9) {
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.08 * transitionProgress})`;
      for (let i = 1; i <= 2; i++) {
        const radius = baseRadius * i * 0.4;
        for (let j = 0; j < 6; j++) {
          const startAngle = (j / 6) * Math.PI * 2;
          const endAngle = ((j + 0.5) / 6) * Math.PI * 2;
          
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, startAngle, endAngle);
          ctx.stroke();
        }
      }
    }
  };

  const drawHierarchyPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const levels = 3;
    const levelHeight = canvas.height / (levels + 1);
    
    // Increased opacity for better visibility
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.12 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    // Draw horizontal level lines
    for (let level = 1; level <= levels; level++) {
      const y = levelHeight * level;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Add vertical dividers
    const columns = 5;
    const columnWidth = canvas.width / columns;
    
    if (transitionProgress > 0.8) {
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.08 * transitionProgress})`;
      for (let col = 1; col < columns; col++) {
        const x = columnWidth * col;
        ctx.beginPath();
        ctx.moveTo(x, levelHeight);
        ctx.lineTo(x, levelHeight * levels);
        ctx.stroke();
      }
      
      // Add vertical connector lines
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * transitionProgress})`;
      for (let level = 1; level < levels; level++) {
        const y1 = levelHeight * level;
        const y2 = levelHeight * (level + 1);
        
        for (let col = 0; col <= columns; col++) {
          const x = columnWidth * col;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();
        }
      }
    }
  };

  // PATTERN-SPECIFIC CONNECTION DRAWING FUNCTIONS
  
  const drawDefaultConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    connectionStrength: number, 
    canvas: HTMLCanvasElement
  ) => {
    // Enhanced opacity calculation
    const opacity = Math.max(0.12, 0.6 * connectionStrength);
    
    // Add connection highlighting for hovered nodes
    const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
    const bothHighlighted = node1.highlighted && node2.highlighted;
    const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
    const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
    
    // Add shadow glow effect
    ctx.shadowBlur = glowAmount;
    ctx.shadowColor = "#00FFFF";
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
    
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    
    // Determine if this is a connection between layers
    const yDiff = Math.abs(node1.y - node2.y);
    const isVerticalConnection = yDiff > 20;
    
    // For connections between layers, use curved lines to emphasize triangle
    if (isVerticalConnection) {
      const center = centerRef.current;
      // Determine curve direction based on position relative to center
      const bendDirection = ((node1.x + node2.x) / 2 > center.x) ? -1 : 1;
      const bendAmount = 15 * bendDirection;
      
      const midX = (node1.x + node2.x) / 2;
      const midY = (node1.y + node2.y) / 2 + bendAmount;
      
      ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
    } else {
      // For horizontal connections, use straight lines
      ctx.lineTo(node2.x, node2.y);
    }
    
    ctx.stroke();
    
    // Reset shadow and line width
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
  };

  const drawGridConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    connectionStrength: number
  ) => {
    const center = centerRef.current;
    const dist1 = node1.distFromCenter!;
    const dist2 = node2.distFromCenter!;
    const angle1 = node1.angleFromCenter!;
    const angle2 = node2.angleFromCenter!;
    
    // Enhanced opacity calculation
    const opacity = Math.max(0.15, 0.6 * connectionStrength);
    
    // Add connection highlighting for hovered nodes
    const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
    const bothHighlighted = node1.highlighted && node2.highlighted;
    const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
    const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
    
    // Add shadow glow effect
    ctx.shadowBlur = glowAmount;
    ctx.shadowColor = "#00FFFF";
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
    
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    
    const isSameLayer = Math.abs(dist1 - dist2) < 20;
    
    if (isSameLayer) {
      // For nodes on same hexagon ring, curve along the ring
      const avgDist = (dist1 + dist2) / 2;
      const angleDiff = angleBetween(angle1, angle2);
      
      if (angleDiff > Math.PI / 6) {
        // Calculate midpoint angle
        const midAngle = midPointAngle(angle1, angle2);
        
        // Control point slightly outside the hexagon ring
        const cpX = center.x + Math.cos(midAngle) * (avgDist * 1.05);
        const cpY = center.y + Math.sin(midAngle) * (avgDist * 1.05);
        
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else {
        // For close nodes, direct line is fine
        ctx.lineTo(node2.x, node2.y);
      }
    } else {
      // For nodes on different rings (radial connections)
      // Control point at midpoint
      const midDist = (dist1 + dist2) / 2;
      const midAngle = midPointAngle(angle1, angle2);
      
      const cpX = center.x + Math.cos(midAngle) * midDist;
      const cpY = center.y + Math.sin(midAngle) * midDist;
      
      ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
    }
    
    ctx.stroke();
    
    // Reset shadow and line width
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
  };

  const drawCircularConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    connectionStrength: number
  ) => {
    const center = centerRef.current;
    const dist1 = node1.distFromCenter!;
    const dist2 = node2.distFromCenter!;
    const angle1 = node1.angleFromCenter!;
    const angle2 = node2.angleFromCenter!;
    
    // Enhanced opacity calculation
    const opacity = Math.max(0.15, 0.7 * connectionStrength);
    
    // Add connection highlighting for hovered nodes
    const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
    const bothHighlighted = node1.highlighted && node2.highlighted;
    const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
    const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
    
    // Add shadow glow effect
    ctx.shadowBlur = glowAmount;
    ctx.shadowColor = "#00FFFF";
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
    
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    
    const almostSameRadius = Math.abs(dist1 - dist2) < 20;
    
    if (almostSameRadius) {
      // For nodes on same circle, follow the arc of the circle
      const angleDiff = angleBetween(angle1, angle2);
      
      if (angleDiff > Math.PI / 8) {
        // Calculate midpoint angle
        const midAngle = midPointAngle(angle1, angle2);
        
        // Control point that creates an arc following the circle
        // Adjust curvature based on angle difference
        const curveFactor = 1.1 - (angleDiff / Math.PI / 2); 
        const avgRadius = (dist1 + dist2) / 2;
        const cpRadius = avgRadius * curveFactor;
        
        const cpX = center.x + Math.cos(midAngle) * cpRadius;
        const cpY = center.y + Math.sin(midAngle) * cpRadius;
        
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else {
        // For close nodes, direct line is fine
        ctx.lineTo(node2.x, node2.y);
      }
    } else {
      // For nodes on different circles (radial connections)
      // Use bezier curve that follows radial line
      const midAngle = midPointAngle(angle1, angle2);
      const midRadius = (dist1 + dist2) / 2;
      
      const cpX = center.x + Math.cos(midAngle) * midRadius;
      const cpY = center.y + Math.sin(midAngle) * midRadius;
      
      ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
    }
    
    ctx.stroke();
    
    // Reset shadow and line width
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
  };

  const drawHierarchicalConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    connectionStrength: number
  ) => {
    // Enhanced opacity calculation
    const opacity = Math.max(0.15, 0.7 * connectionStrength);
    
    // Add connection highlighting for hovered nodes
    const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
    const bothHighlighted = node1.highlighted && node2.highlighted;
    const lineWidth = isNodeHovered ? 2 : (bothHighlighted ? 1.5 : 1);
    const glowAmount = isNodeHovered ? 5 : (bothHighlighted ? 3 : 0);
    
    // Add shadow glow effect
    ctx.shadowBlur = glowAmount;
    ctx.shadowColor = "#00FFFF";
    
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
    
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    
    // Determine if this is a horizontal (sibling) or vertical (parent-child) connection
    const yDiff = Math.abs(node1.y - node2.y);
    const isVerticalConnection = yDiff > 20;
    
    if (isVerticalConnection) {
      // Parent-child connection
      // Use S-curve to show hierarchy
      
      // Determine which is parent and which is child
      const [topNode, bottomNode] = node1.y < node2.y ? [node1, node2] : [node2, node1];
      
      // Create smooth S-curve using bezier curve
      const startControlX = topNode.x + (bottomNode.x - topNode.x) * 0.2;
      const startControlY = topNode.y + (bottomNode.y - topNode.y) * 0.3;
      
      const endControlX = topNode.x + (bottomNode.x - topNode.x) * 0.8;
      const endControlY = topNode.y + (bottomNode.y - topNode.y) * 0.7;
      
      ctx.bezierCurveTo(
        startControlX, startControlY,
        endControlX, endControlY,
        bottomNode.x, bottomNode.y
      );
    } else {
      // Sibling connection - slight upward curve
      const midX = (node1.x + node2.x) / 2;
      const midY = (node1.y + node2.y) / 2 - 10; // Upward curve
      
      ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
    }
    
    ctx.stroke();
    
    // Reset shadow and line width
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
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

  // COMPLETELY REWRITTEN CONNECTION DRAWING FUNCTION
  // This is the core improvement that enforces geometric patterns
  
  const drawConnections = (ctx: CanvasRenderingContext2D, nodes: Node[], currentProgress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // During chaotic phase, show random connections
    if (currentProgress < 0.1) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() > 0.97) {
            drawChaoticConnection(ctx, nodes[i], nodes[j], currentProgress);
          }
        }
      }
      return;
    }
    
    // For established patterns, be extremely selective about connections
    
    // First, establish which nodes are important for the pattern
    // - Highlighted nodes (mental models)
    // - Nodes that are close to the pattern's key regions
    
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    
    // Pre-calculate pattern-specific properties for nodes
    nodes.forEach(node => {
      // Store pattern-specific properties directly on the node
      // for efficient reuse during connection determination
      
      // Distance from center
      node.distFromCenter = distance(node, center);
      
      // Angle from center (normalized to 0-2π)
      node.angleFromCenter = normalizeAngle(Math.atan2(node.y - center.y, node.x - center.x));
      
      // For triangle/hierarchy patterns - calculate layer
      if (category === 'default' || category === 'analysis') {
        const verticalPosition = (node.y - (canvas.height * 0.1)) / (canvas.height * 0.8);
        node.calculatedLayer = Math.min(3, Math.max(0, Math.floor(verticalPosition * 4)));
      }
    });
    
    // STRATEGY: Draw strictly pattern-specific connections only
    
    // HEXAGONAL GRID PATTERN (Business)
    if (category === 'business') {
      // Create regular hexagonal connections
      
      // 1. First identify nodes that fall on concentric hexagons
      const hexagonalLayers = [0.35, 0.7, 1.0]; // Normalized radius for three hexagon layers
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.4;
      const layerRadius = hexagonalLayers.map(factor => baseRadius * factor);
      
      // Group nodes by which hexagonal layer they belong to
      const nodesInLayers: Node[][] = [[], [], []];
      
      nodes.forEach(node => {
        // Find closest hexagonal layer
        const dist = node.distFromCenter!;
        let closestLayerIndex = 0;
        let minDiff = Math.abs(dist - layerRadius[0]);
        
        for (let i = 1; i < layerRadius.length; i++) {
          const diff = Math.abs(dist - layerRadius[i]);
          if (diff < minDiff) {
            minDiff = diff;
            closestLayerIndex = i;
          }
        }
        
        // If node is close enough to a layer, add it
        if (minDiff < baseRadius * 0.15 || node.highlighted) {
          nodesInLayers[closestLayerIndex].push(node);
        }
      });
      
      // 2. Connect nodes within the same hexagonal layer if they're adjacent
      nodesInLayers.forEach(layerNodes => {
        // Sort nodes by angle
        layerNodes.sort((a, b) => a.angleFromCenter! - b.angleFromCenter!);
        
        // Connect adjacent nodes in the layer (forms a hexagon)
        for (let i = 0; i < layerNodes.length; i++) {
          const node1 = layerNodes[i];
          const node2 = layerNodes[(i + 1) % layerNodes.length];
          
          // Skip if too far apart (prevents connections across large gaps)
          if (angleBetween(node1.angleFromCenter!, node2.angleFromCenter!) > Math.PI / 3) continue;
          
          drawGridConnection(ctx, node1, node2, currentProgress);
        }
        
        // Add some regular connections to highlighted nodes for emphasis
        const highlightedInLayer = layerNodes.filter(n => n.highlighted);
        for (let i = 0; i < highlightedInLayer.length; i++) {
          for (let j = i + 1; j < highlightedInLayer.length; j++) {
            drawGridConnection(ctx, highlightedInLayer[i], highlightedInLayer[j], currentProgress);
          }
        }
      });
      
      // 3. Add radial connections between layers
      for (let i = 0; i < nodesInLayers.length - 1; i++) {
        const innerLayer = nodesInLayers[i];
        const outerLayer = nodesInLayers[i + 1];
        
        // Connect nodes that share similar angles
        for (const innerNode of innerLayer) {
          // Find closest angle node in outer layer
          let closestNode: Node | null = null;
          let minAngleDiff = Math.PI * 2;
          
          for (const outerNode of outerLayer) {
            const angleDiff = angleBetween(innerNode.angleFromCenter!, outerNode.angleFromCenter!);
            if (angleDiff < minAngleDiff && angleDiff < Math.PI / 6) {
              minAngleDiff = angleDiff;
              closestNode = outerNode;
            }
          }
          
          if (closestNode) {
            drawGridConnection(ctx, innerNode, closestNode, currentProgress);
          }
        }
      }
    }
    
    // CIRCULAR PATTERN (Personal)
    else if (category === 'personal') {
      // 1. Group nodes by concentric circles
      const circularLayers = [0.35, 0.6, 0.85]; // Normalized radius for three circles
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const layerRadius = circularLayers.map(factor => baseRadius * factor);
      
      // Group nodes by which circular layer they belong to
      const nodesInLayers: Node[][] = [[], [], []];
      
      nodes.forEach(node => {
        // Find closest circular layer
        const dist = node.distFromCenter!;
        let closestLayerIndex = 0;
        let minDiff = Math.abs(dist - layerRadius[0]);
        
        for (let i = 1; i < layerRadius.length; i++) {
          const diff = Math.abs(dist - layerRadius[i]);
          if (diff < minDiff) {
            minDiff = diff;
            closestLayerIndex = i;
          }
        }
        
        // If node is close enough to a layer, add it
        if (minDiff < baseRadius * 0.15 || node.highlighted) {
          nodesInLayers[closestLayerIndex].push(node);
        }
      });
      
      // 2. Connect nodes within the same circular layer if they're adjacent in angle
      nodesInLayers.forEach(layerNodes => {
        // Sort nodes by angle
        layerNodes.sort((a, b) => a.angleFromCenter! - b.angleFromCenter!);
        
        // Connect adjacent nodes in the layer to form circle segments
        // Maximum angle for connection - smaller for outer circles
        const maxAngle = Math.PI / 4; 
        
        for (let i = 0; i < layerNodes.length; i++) {
          const node1 = layerNodes[i];
          const node2 = layerNodes[(i + 1) % layerNodes.length];
          
          // Skip if too far apart (prevents connections across large gaps)
          if (angleBetween(node1.angleFromCenter!, node2.angleFromCenter!) > maxAngle) continue;
          
          drawCircularConnection(ctx, node1, node2, currentProgress);
        }
        
        // Connect all highlighted nodes in this layer
        const highlightedInLayer = layerNodes.filter(n => n.highlighted);
        if (highlightedInLayer.length > 1) {
          // Connect in a circular pattern
          for (let i = 0; i < highlightedInLayer.length; i++) {
            const node1 = highlightedInLayer[i];
            const node2 = highlightedInLayer[(i + 1) % highlightedInLayer.length];
            drawCircularConnection(ctx, node1, node2, currentProgress * 1.2); // Stronger connections
          }
        }
      });
      
      // 3. Add some radial connections
      // Find nodes that share very similar angles but are on different layers
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          
          // Skip if both are non-highlighted
          if (!node1.highlighted && !node2.highlighted) continue;
          
          // Check if angles are similar but distances are different (radial)
          const angleDiff = angleBetween(node1.angleFromCenter!, node2.angleFromCenter!);
          const radiusDiff = Math.abs(node1.distFromCenter! - node2.distFromCenter!);
          
          if (angleDiff < Math.PI / 12 && radiusDiff > baseRadius * 0.2 && radiusDiff < baseRadius * 0.5) {
            drawCircularConnection(ctx, node1, node2, currentProgress);
          }
        }
      }
    }
    
    // HIERARCHICAL PATTERN (Analysis)
    else if (category === 'analysis') {
      // This pattern should emphasize horizontal layers and vertical parent-child relationships
      
      // 1. Group nodes by vertical layers
      const levels = 3;
      const levelHeight = canvas.height / (levels + 1);
      const nodesInLevels: Node[][] = [[], [], []];
      
      nodes.forEach(node => {
        // Determine which level the node belongs to based on y-position
        const nodeLevel = Math.floor((node.y - levelHeight/2) / levelHeight);
        if (nodeLevel >= 0 && nodeLevel < levels) {
          nodesInLevels[nodeLevel].push(node);
        }
      });
      
      // 2. Connect horizontally within same level (siblings)
      nodesInLevels.forEach(levelNodes => {
        // Sort nodes horizontally
        levelNodes.sort((a, b) => a.x - b.x);
        
        // Connect adjacent nodes (siblings)
        for (let i = 0; i < levelNodes.length - 1; i++) {
          const node1 = levelNodes[i];
          const node2 = levelNodes[i + 1];
          
          // Skip if too far apart horizontally
          if (Math.abs(node1.x - node2.x) > canvas.width * 0.3) continue;
          
          if (node1.highlighted && node2.highlighted) {
            // Stronger connections for highlighted siblings
            drawHierarchicalConnection(ctx, node1, node2, currentProgress * 1.3);
          } else if (node1.highlighted || node2.highlighted) {
            // Medium connections if one is highlighted
            drawHierarchicalConnection(ctx, node1, node2, currentProgress);
          } else if (Math.abs(node1.x - node2.x) < canvas.width * 0.2) {
            // Weaker connections for non-highlighted close siblings
            drawHierarchicalConnection(ctx, node1, node2, currentProgress * 0.7);
          }
        }
      });
      
      // 3. Connect vertically between levels (parent-child)
      for (let level = 0; level < levels - 1; level++) {
        const upperLevel = nodesInLevels[level];
        const lowerLevel = nodesInLevels[level + 1];
        
        // Connect nodes if they are vertically aligned
        for (const parentNode of upperLevel) {
          // Find child nodes that are roughly aligned with this parent
          const possibleChildren = lowerLevel.filter(childNode => 
            Math.abs(parentNode.x - childNode.x) < canvas.width * 0.15
          );
          
          // Connect to closest child node, prioritizing highlighted nodes
          let closestDist = Infinity;
          let closestChild = null;
          
          for (const childNode of possibleChildren) {
            const dist = Math.abs(parentNode.x - childNode.x);
            
            // Prioritize connections where at least one node is highlighted
            const highlightBonus = (parentNode.highlighted || childNode.highlighted) ? 50 : 0;
            const adjustedDist = dist - highlightBonus;
            
            if (adjustedDist < closestDist) {
              closestDist = adjustedDist;
              closestChild = childNode;
            }
          }
          
          if (closestChild) {
            const connectionStrength = (parentNode.highlighted && closestChild.highlighted) ? 
              currentProgress * 1.3 : currentProgress;
            drawHierarchicalConnection(ctx, parentNode, closestChild, connectionStrength);
          }
        }
      }
    }
    
    // TRIANGULAR PATTERN (Default)
    else {
      // This pattern should form a clear triangle with layers
      
      // 1. First identify the layers of the triangle
      const triangleHeight = Math.min(canvas.width, canvas.height) * 0.7;
      const triangleWidth = triangleHeight * 0.866; // Equilateral triangle width
      const layers = 4;
      const layerHeight = triangleHeight / layers;
      
      // Group nodes by triangle layer
      const nodesInLayers: Node[][] = [[], [], [], []];
      
      nodes.forEach(node => {
        // Determine which layer based on y-position
        const yPos = node.y - (canvas.height * 0.2); // Top of triangle
        const nodeLayer = Math.floor(yPos / layerHeight);
        if (nodeLayer >= 0 && nodeLayer < layers) {
          nodesInLayers[nodeLayer].push(node);
        }
      });
      
      // 2. Connect horizontally within layers
      nodesInLayers.forEach((layerNodes, layerIndex) => {
        // For each layer, width increases as we go down
        const layerWidthRatio = 1 - (layerIndex / layers);
        const currentLayerWidth = triangleWidth * layerWidthRatio;
        const layerLeft = center.x - (currentLayerWidth / 2);
        const layerRight = center.x + (currentLayerWidth / 2);
        
        // Sort nodes horizontally
        layerNodes.sort((a, b) => a.x - b.x);
        
        // Connect adjacent nodes (horizontal connections)
        for (let i = 0; i < layerNodes.length - 1; i++) {
          const node1 = layerNodes[i];
          const node2 = layerNodes[i + 1];
          
          // Skip if too far apart horizontally
          const maxDist = currentLayerWidth / Math.max(3, layerNodes.length - 1) * 1.5;
          if (Math.abs(node1.x - node2.x) > maxDist) continue;
          
          // Stronger connections for highlighted nodes
          const connectionStrength = (node1.highlighted && node2.highlighted) ? 
            currentProgress * 1.3 : currentProgress * 0.9;
          
          drawDefaultConnection(ctx, node1, node2, connectionStrength, canvas);
        }
      });
      
      // 3. Connect between adjacent layers to form triangular pattern
      for (let layer = 0; layer < layers - 1; layer++) {
        const upperLayer = nodesInLayers[layer];
        const lowerLayer = nodesInLayers[layer + 1];
        
        // For triangular pattern, an upper node connects to two lower nodes
        // that are to its left and right
        for (const upperNode of upperLayer) {
          // Find potential lower nodes that could form triangle sides
          const leftLowerNodes = lowerLayer.filter(node => 
            node.x < upperNode.x && node.x > upperNode.x - triangleWidth/2
          );
          
          const rightLowerNodes = lowerLayer.filter(node => 
            node.x > upperNode.x && node.x < upperNode.x + triangleWidth/2
          );
          
          // Find closest node on left and right
          if (leftLowerNodes.length > 0) {
            const closestLeftNode = leftLowerNodes.reduce((closest, current) => 
              (Math.abs(current.x - upperNode.x) < Math.abs(closest.x - upperNode.x)) 
                ? current : closest
            );
            
            const connectionStrength = (upperNode.highlighted && closestLeftNode.highlighted) ? 
              currentProgress * 1.3 : currentProgress;
            
            drawDefaultConnection(ctx, upperNode, closestLeftNode, connectionStrength, canvas);
          }
          
          if (rightLowerNodes.length > 0) {
            const closestRightNode = rightLowerNodes.reduce((closest, current) => 
              (Math.abs(current.x - upperNode.x) < Math.abs(closest.x - upperNode.x)) 
                ? current : closest
            );
            
            const connectionStrength = (upperNode.highlighted && closestRightNode.highlighted) ? 
              currentProgress * 1.3 : currentProgress;
            
            drawDefaultConnection(ctx, upperNode, closestRightNode, connectionStrength, canvas);
          }
        }
      }
      
      // 4. Connect highlighted nodes for emphasis
      const highlightedNodes = nodes.filter(node => node.highlighted);
      if (highlightedNodes.length > 1) {
        // Connect in triangle pattern if possible
        for (let i = 0; i < highlightedNodes.length; i++) {
          for (let j = i + 1; j < highlightedNodes.length; j++) {
            const node1 = highlightedNodes[i];
            const node2 = highlightedNodes[j];
            
            // Connect if they're in adjacent layers
            const layerDiff = Math.abs(node1.calculatedLayer! - node2.calculatedLayer!);
            if (layerDiff === 1) {
              drawDefaultConnection(ctx, node1, node2, currentProgress * 1.5, canvas);
            }
          }
        }
      }
    }
    
    // Add hover connections for better interactive feedback
    if (hoveredNodeId !== null) {
      const hoveredNode = nodes.find(node => node.id === hoveredNodeId);
      if (hoveredNode) {
        // Connect to nearby nodes with same pattern logic but increased visibility
        const nearbyNodes = nodes.filter(node => {
          if (node.id === hoveredNodeId) return false;
          
          // Use appropriate distance based on pattern
          let maxDist = 0;
          if (category === 'business' || category === 'personal') {
            maxDist = Math.min(canvas.width, canvas.height) * 0.25;
          } else {
            maxDist = Math.min(canvas.width, canvas.height) * 0.3;
          }
          
          return distance(node, hoveredNode) < maxDist;
        });
        
        // Draw connections to nearby nodes with increased intensity
        nearbyNodes.forEach(nearby => {
          if (category === 'business') {
            drawGridConnection(ctx, hoveredNode, nearby, currentProgress * 1.5);
          } else if (category === 'personal') {
            drawCircularConnection(ctx, hoveredNode, nearby, currentProgress * 1.5);
          } else if (category === 'analysis') {
            drawHierarchicalConnection(ctx, hoveredNode, nearby, currentProgress * 1.5);
          } else {
            drawDefaultConnection(ctx, hoveredNode, nearby, currentProgress * 1.5, canvas);
          }
        });
      }
    }
  };

  // ENHANCED NODE POSITIONING FUNCTION
  // Places nodes in precise geometric positions
  
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
      
      // BUSINESS CATEGORY - PERFECT HEXAGONAL GRID
      if (currentCategory === 'business') {
        // Calculate base dimensions for the hexagonal pattern
        const baseHexRadius = Math.min(canvas.width, canvas.height) * 0.4;
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          // For highlighted nodes - perfect central hexagon
          const totalHighlighted = Math.min(highlightedCount, 6);
          const hexAngle = (2 * Math.PI) / totalHighlighted;
          const angle = (highlightedNodeIndex % totalHighlighted) * hexAngle;
          
          // Place exactly on innermost hexagon
          targetX = center.x + Math.cos(angle) * (baseHexRadius * 0.35);
          targetY = center.y + Math.sin(angle) * (baseHexRadius * 0.35);
        } else {
          // For non-highlighted nodes - place on exact hexagonal grid points
          // Determine which of 3 concentric hexagons this belongs to
          const layer = 1 + (index % 3);
          
          // Create exact hexagonal grid with 6*layer points per layer
          const pointsInLayer = 6 * layer;
          const pointIndex = index % pointsInLayer;
          
          // Calculate perfect hexagon point
          const angle = (pointIndex / pointsInLayer) * Math.PI * 2;
          const layerRadius = baseHexRadius * (layer / 3) * 0.9;
          
          // No random offset - precise hexagonal grid
          targetX = center.x + Math.cos(angle) * layerRadius;
          targetY = center.y + Math.sin(angle) * layerRadius;
        }
      } 
      
      // PERSONAL CATEGORY - PERFECT CONCENTRIC CIRCLES
      else if (currentCategory === 'personal') {
        const baseRadius = Math.min(canvas.width, canvas.height) * 0.35;
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          // Highlighted nodes form a perfect circle
          const angle = (highlightedNodeIndex / highlightedCount) * Math.PI * 2;
          
          // Exact placement on main circle
          targetX = center.x + Math.cos(angle) * baseRadius;
          targetY = center.y + Math.sin(angle) * baseRadius;
        } else {
          // Non-highlighted nodes - perfect concentric circles
          // Use exact circular rings with no jitter
          const circleIndex = index % 3;
          const circleRadius = baseRadius * (0.6 + circleIndex * 0.3);
          
          // Golden angle for even distribution around the circle
          const goldenRatio = 1.618033988749895;
          const goldenAngle = Math.PI * 2 * (1 - 1/goldenRatio);
          const angle = (index * goldenAngle) % (Math.PI * 2);
          
          // Add subtle pulsing movement along radius for dynamic feel
          const timeOffset = Date.now() * 0.0001;
          const pulseFactor = 0.02 * Math.sin(timeOffset + index);
          // Exact circles with subtle pulse
          const adjustedRadius = circleRadius * (1 + pulseFactor);
          
          targetX = center.x + Math.cos(angle) * adjustedRadius;
          targetY = center.y + Math.sin(angle) * adjustedRadius;
        }
      } 
      
      // ANALYSIS CATEGORY - STRICT HIERARCHICAL LEVELS
      else if (currentCategory === 'analysis') {
        const levels = 3;
        const levelHeight = canvas.height / (levels + 1);
        const effectiveMarginX = canvas.width * 0.15;
        
        if (node.highlighted && node.level !== undefined) {
          // Highlighted nodes - exact horizontal layers
          const nodeLevel = node.level % levels;
          
          // Find nodes in the same level
          const nodesInThisLevel = highlightedNodes.filter(n => 
            n.level !== undefined && (n.level % levels) === nodeLevel
          );
          
          const countInLevel = nodesInThisLevel.length;
          const nodeIndexInLevel = nodesInThisLevel.findIndex(n => n.id === node.id);
          
          // Perfect horizontal spacing
          const levelWidth = canvas.width - effectiveMarginX * 2;
          const nodeSpacing = countInLevel > 0 ? levelWidth / (countInLevel + 1) : levelWidth;
          
          // Exact grid positions
          targetX = effectiveMarginX + nodeSpacing * (nodeIndexInLevel + 1);
          targetY = levelHeight * (nodeLevel + 1);
        } else {
          // Non-highlighted nodes - still maintain strict horizontal layers
          // but with horizontal variation
          const randomLevel = Math.floor(Math.random() * levels);
          
          // Horizontal position with less randomness
          targetX = effectiveMarginX + Math.random() * (canvas.width - effectiveMarginX * 2);
          // Strict vertical alignment with minimal jitter
          const verticalJitter = (Math.random() - 0.5) * levelHeight * 0.2;
          targetY = levelHeight * (randomLevel + 1) + verticalJitter;
        }
      } 
      
      // DEFAULT CATEGORY - PERFECT TRIANGULAR STRUCTURE
      else { 
        const triangleHeight = Math.min(canvas.width, canvas.height) * 0.7;
        const triangleWidth = triangleHeight * 0.866; // Width of equilateral triangle
        const layers = 4;
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          // Highlighted nodes - form perfect triangle layers
          
          // Calculate ideal triangle distribution (1,2,3,4 nodes per layer)
          let targetLayer = 0;
          let nodesInPreviousLayers = 0;
          let nodePositionInLayer = 0;
          
          for (let l = 0; l < layers; l++) {
            const nodesInThisLayer = l + 1;
            
            if (highlightedNodeIndex < nodesInPreviousLayers + nodesInThisLayer) {
              targetLayer = l;
              nodePositionInLayer = highlightedNodeIndex - nodesInPreviousLayers;
              break;
            }
            nodesInPreviousLayers += nodesInThisLayer;
          }
          
          // Exact vertical position based on layer
          const layerY = canvas.height * 0.2 + targetLayer * (triangleHeight / layers);
          
          // Exact horizontal position - perfectly spaced within layer
          const layerWidthRatio = 1 - (targetLayer / layers);
          const currentLayerWidth = triangleWidth * layerWidthRatio;
          
          const nodesInLayer = targetLayer + 1;
          const horizontalSpacing = nodesInLayer > 1 ? currentLayerWidth / (nodesInLayer - 1) : 0;
          
          // Perfect grid positions
          targetX = center.x - (currentLayerWidth / 2) + nodePositionInLayer * horizontalSpacing;
          targetY = layerY;
        } else {
          // Non-highlighted nodes - follow triangular structure
          // Pick a layer based on node index
          const nodeLayer = index % layers;
          
          // Y-position based on exact layer
          const layerY = canvas.height * 0.2 + nodeLayer * (triangleHeight / layers);
          
          // Calculate exact width at this layer
          const layerWidthRatio = 1 - (nodeLayer / layers);
          const layerWidth = triangleWidth * layerWidthRatio;
          
          // X-position with minimal horizontal jitter
          // Use node index to create more even distribution
          const nodeIndexWithinLayer = Math.floor(index / layers);
          const segmentWidth = layerWidth / Math.max(5, nodeIndexWithinLayer % 10);
          const horizontalOffset = (nodeIndexWithinLayer % 5) * segmentWidth;
          
          targetX = center.x - (layerWidth / 2) + horizontalOffset;
          targetY = layerY;
        }
      }
      
      // Set target positions
      node.targetX = targetX;
      node.targetY = targetY;
      
      // Move toward target position with proper easing
      // Faster movement speed for better pattern formation
      const moveSpeed = 0.08 * easedProgress; 
      node.x += (node.targetX - node.x) * moveSpeed;
      node.y += (node.targetY - node.y) * moveSpeed;
    }
    
    // Ensure node stays within canvas bounds
    node.x = clamp(node.x, 0, canvas.width);
    node.y = clamp(node.y, 0, canvas.height);
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
        // Highlighted nodes are significantly larger for better visibility
        radius: highlighted ? 8 : 3 + Math.random() * 2,
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
      
      // Main function that creates pattern-specific connections
      drawConnections(ctx, currentNodes, transitionProgress);
      
      // Draw particles
      drawParticles(ctx);
      
      // Update and draw nodes
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
      (node.highlighted ? 12 : 8) : // Increased hover size for better visibility
      (node.radius);
    
    if ((node.highlighted && isActive) || isHovered) {
      // Enhanced shadow glow for better visibility
      ctx.shadowBlur = isHovered ? 20 : 15;
      ctx.shadowColor = node.color;
    } else {
      ctx.shadowBlur = 0;
    }

    const gradient = ctx.createRadialGradient(
      node.x, node.y, 0,
      node.x, node.y, nodeRadius
    );
    
    // Increased base alpha for better contrast
    const alpha = node.highlighted ? 
      (0.9 + 0.1 * transitionProgress) : 
      (0.5 + 0.1 * transitionProgress);
    
    gradient.addColorStop(0, `${node.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${node.color}00`);

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowBlur = 0; 

    // Draw labels for highlighted nodes
    if (transitionProgress > 0.5 && node.highlighted && node.name) {
      const labelOpacity = (transitionProgress - 0.5) * 2;
      
      // Draw text shadow for better readability
      if (isHovered) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 4;
        ctx.font = `bold 12px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${labelOpacity * 1.2})`;
        ctx.fillText(node.name, node.x, node.y - nodeRadius - 8);
        ctx.shadowBlur = 0;
      } else {
        // Standard label
        ctx.font = `${isHovered ? 'bold ' : ''}11px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${labelOpacity})`;
        
        // Add subtle text shadow for better readability
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 2;
        ctx.fillText(node.name, node.x, node.y - nodeRadius - 5);
        ctx.shadowBlur = 0;
      }
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Generate particles during active phase
    if (transitionProgress > 0.3 && Math.random() > 0.65 && particlesRef.current.length < 150) {
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 0.5 + Math.random() * 2,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          life: 50 + Math.random() * 50,
          color: '#00FFFF'
        });
      }
    }
    
    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      const nearestNode = findNearestHighlightedNode(particle);
      
      if (nearestNode && transitionProgress > 0.5) {
        // Attract particles to nearest highlighted node
        particle.x += (nearestNode.x - particle.x) * 0.04;
        particle.y += (nearestNode.y - particle.y) * 0.04;
      } else {
        // Random movement
        particle.x += particle.speedX;
        particle.y += particle.speedY;
      }
      
      // Draw particle with fade based on life
      const opacity = (particle.life / 80) * transitionProgress;
      ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Decrease life and remove if expired or out of bounds
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

      if (distSq < node.radius * node.radius + minDistanceSq && distSq < minDistanceSq) {
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
      className="w-full h-80 bg-[#202020] rounded-lg overflow-hidden relative"
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