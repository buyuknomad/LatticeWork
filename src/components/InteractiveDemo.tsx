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
  level?: number; 
  // For structural hints from layout:
  layerIndex?: number;
  positionInLayer?: number;
}

interface Point {
  x: number;
  y: number;
}

interface InteractiveDemoProps {
  isTyping: boolean;
  category: 'business' | 'personal' | 'analysis' | 'default';
}

const distance = (point1: Point, point2: Point) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};

const normalizeAngle = (angle: number) => {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
};

const angleBetween = (angle1: number, angle2: number) => {
  angle1 = normalizeAngle(angle1);
  angle2 = normalizeAngle(angle2);
  let diff = Math.abs(angle1 - angle2);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
};

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

  const drawTriangularPatternElements = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const center = centerRef.current || { x: canvas.width / 2, y: canvas.height / 2 };
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 * transitionProgress})`;
    ctx.lineWidth = 1;
    
    const triangleHeight = Math.min(canvas.width, canvas.height) * 0.7;
    const triangleWidth = triangleHeight * 0.866; 
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

  const drawDefaultConnection = (
    ctx: CanvasRenderingContext2D, 
    node1: Node, 
    node2: Node, 
    currentProgress: number, 
    canvas: HTMLCanvasElement
  ) => {
    // Use target positions for determining structural connections, more stable during animation
    const p1 = { x: node1.targetX, y: node1.targetY, layerIndex: node1.layerIndex, positionInLayer: node1.positionInLayer };
    const p2 = { x: node2.targetX, y: node2.targetY, layerIndex: node2.layerIndex, positionInLayer: node2.positionInLayer };

    const yDiff = Math.abs(p1.y - p2.y);
    const xDiff = Math.abs(p1.x - p2.x);
    const distVal = distance(p1,p2); // Distance between target positions

    const triangleLayerHeight = (Math.min(canvas.width, canvas.height) * 0.7) / 4; // from updateNodePosition
    const isSameTargetLayer = node1.layerIndex !== undefined && node1.layerIndex === node2.layerIndex;
    const isAdjacentTargetLayer = node1.layerIndex !== undefined && node2.layerIndex !== undefined && Math.abs(node1.layerIndex - node2.layerIndex) === 1;
    
    let shouldConnect = false;

    if (isSameTargetLayer && node1.layerIndex !== undefined) {
        // Connect horizontal neighbors in the same layer
        const expectedSpacing = ( (Math.min(canvas.width, canvas.height) * 0.7 * 0.866) * (1 - (node1.layerIndex / 4)) ) / Math.max(1, node1.layerIndex); // Approximate
        if (Math.abs( (node1.positionInLayer || 0) - (node2.positionInLayer || 0) ) === 1 && xDiff < expectedSpacing * 1.5) {
            shouldConnect = true;
        }
    } else if (isAdjacentTargetLayer && node1.layerIndex !== undefined && node2.layerIndex !== undefined) {
        // Connect to nodes in adjacent layer if they are structurally children
        const upperNode = node1.layerIndex < node2.layerIndex ? node1 : node2;
        const lowerNode = node1.layerIndex < node2.layerIndex ? node2 : node1;
        // A node (L,P) connects to (L+1, P) and (L+1, P+1)
        if ( (lowerNode.positionInLayer === upperNode.positionInLayer || lowerNode.positionInLayer === (upperNode.positionInLayer || 0) + 1) &&
             xDiff < triangleLayerHeight * 1.5 ) { // xDiff should be relatively small for a slanted line
            shouldConnect = true;
        }
    }
    
    // Fallback for highlighted nodes to ensure some connectivity if structure is sparse
    if (!shouldConnect && node1.highlighted && node2.highlighted && distance(node1, node2) < triangleLayerHeight * 2.5) {
        shouldConnect = true;
    }

    if (shouldConnect) {
      const opacity = Math.max(0.12, (0.6 - (distance(node1, node2) / 200)) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (node1.highlighted && node2.highlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (node1.highlighted && node2.highlighted ? 3 : 0);
      
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      // For triangular, straight lines are often clearer for the structure
      ctx.lineTo(node2.x, node2.y);
      ctx.stroke();
      
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
    const p1 = { x: node1.targetX, y: node1.targetY };
    const p2 = { x: node2.targetX, y: node2.targetY };
    const center = centerRef.current || { x: (canvasRef.current?.width || 0) / 2, y: (canvasRef.current?.height || 0) / 2 };

    const distToCenter1 = distance(p1, center);
    const distToCenter2 = distance(p2, center);
    const angleToCenter1 = Math.atan2(p1.y - center.y, p1.x - center.x);
    const angleToCenter2 = Math.atan2(p2.y - center.y, p2.x - center.x);
    const angleDiff = angleBetween(angleToCenter1, angleToCenter2);
    
    const baseHexRadius = Math.min(canvasRef.current?.width || 0, canvasRef.current?.height || 0) * 0.42;
    const expectedNeighborDistHighlighted = baseHexRadius * 0.35; // Approx distance between highlighted central nodes
    const expectedNeighborDistOuter = baseHexRadius * (1/3) * 0.9; // Approx for outer layers

    let shouldConnect = false;

    if (node1.highlighted && node2.highlighted) {
        // Highlighted nodes form a central hexagon
        if (distance(p1, p2) < expectedNeighborDistHighlighted * 1.5 && angleDiff < Math.PI / 2.5) { // ~72 deg
             shouldConnect = true;
        }
    } else if (!node1.highlighted && !node2.highlighted) {
        // Non-highlighted nodes on concentric hex layers
        const onSameLayer = Math.abs(distToCenter1 - distToCenter2) < expectedNeighborDistOuter * 0.5;
        const onAdjacentLayer = !onSameLayer && Math.abs(distToCenter1 - distToCenter2) < expectedNeighborDistOuter * 1.5;

        if (onSameLayer && distance(p1, p2) < expectedNeighborDistOuter * 1.5 && angleDiff < Math.PI / 2.8) { // ~64 deg
            shouldConnect = true;
        } else if (onAdjacentLayer && distance(p1, p2) < expectedNeighborDistOuter * 1.5 && angleDiff < Math.PI / 5) { // ~36 deg
            shouldConnect = true;
        }
    } else if ((node1.highlighted || node2.highlighted) && distance(p1,p2) < expectedNeighborDistOuter * 1.8 ) {
        // Connecting highlighted to non-highlighted, more lenient
        shouldConnect = true;
    }


    if (shouldConnect) {
      const opacity = Math.max(0.15, (0.6 - (distance(node1, node2) / 180)) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (node1.highlighted && node2.highlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (node1.highlighted && node2.highlighted ? 3 : 0);
      
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      // For hex grids, straight lines are usually best
      ctx.lineTo(node2.x, node2.y);
      ctx.stroke();
      
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
    const p1 = { x: node1.targetX, y: node1.targetY };
    const p2 = { x: node2.targetX, y: node2.targetY };
    const center = centerRef.current || { x: (canvasRef.current?.width || 0) / 2, y: (canvasRef.current?.height || 0) / 2 };

    const angle1 = Math.atan2(p1.y - center.y, p1.x - center.x);
    const angle2 = Math.atan2(p2.y - center.y, p2.x - center.x);
    const radius1 = distance(p1, center);
    const radius2 = distance(p2, center);
    
    const angleDiff = angleBetween(angle1, angle2);
    const almostSameTargetRadius = Math.abs(radius1 - radius2) < 20; // Based on target radii
    // Max 8 highlighted nodes on the main circle, so angular separation is PI/4 (45 deg)
    const highlightedAngularSeparation = Math.PI / 4 * 1.2; // একটু বেশি
    // For non-highlighted, using golden angle, so neighbors can be at various angles.
    // Connect if angularly close and on same/adjacent target radius.
    const nonHighlightedAngularSeparation = Math.PI / 3; // 60 degrees for general non-highlighted

    let shouldConnect = false;

    if (node1.highlighted && node2.highlighted) {
        if (almostSameTargetRadius && angleDiff < highlightedAngularSeparation) {
            shouldConnect = true;
        }
    } else if (!node1.highlighted && !node2.highlighted) {
        const radiusDiff = Math.abs(radius1 - radius2);
        const baseRadiusForOuter = Math.min(canvasRef.current?.width || 0, canvasRef.current?.height || 0) * 0.35;
        const expectedRingSeparation = baseRadiusForOuter * 0.3; // From updateNodePosition logic

        if (almostSameTargetRadius && angleDiff < nonHighlightedAngularSeparation) { // Connect along circumference
            shouldConnect = true;
        } else if (radiusDiff > expectedRingSeparation * 0.5 && radiusDiff < expectedRingSeparation * 1.5 && angleDiff < Math.PI / 6) { // Connect radially
            shouldConnect = true;
        }
    } else if ( (node1.highlighted || node2.highlighted) && distance(p1,p2) < 120 ) {
         // Connecting highlighted to non-highlighted, more lenient connection to bridge the structure
         shouldConnect = true;
    }


    if (shouldConnect) {
      const opacity = Math.max(0.15, (0.7 - (distance(node1, node2) / 150)) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (node1.highlighted && node2.highlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (node1.highlighted && node2.highlighted ? 3 : 0);
      
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      if (almostSameTargetRadius && angleDiff > Math.PI / 12) { // If on same circle and not too close, curve along arc
        const midAng = midPointAngle(Math.atan2(node1.y - center.y, node1.x - center.x), Math.atan2(node2.y - center.y, node2.x - center.x));
        const actualRadius1 = distance(node1, center);
        const actualRadius2 = distance(node2, center);
        const avgActualRadius = (actualRadius1 + actualRadius2) / 2;
        const curveFactor = 1.05; 
        const cpX = center.x + Math.cos(midAng) * avgActualRadius * curveFactor;
        const cpY = center.y + Math.sin(midAng) * avgActualRadius * curveFactor;
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else { // Radial or very close circumferential connections
        ctx.lineTo(node2.x, node2.y);
      }
      ctx.stroke();
      
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
    // Use target positions for structural checks
    const p1 = { x: node1.targetX, y: node1.targetY, level: node1.level };
    const p2 = { x: node2.targetX, y: node2.targetY, level: node2.level };

    const levelDiff = Math.abs(p1.level - p2.level);
    const horizontalDist = Math.abs(p1.x - p2.x);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const effectiveMarginX = canvas.width * 0.15;
    const levelWidth = canvas.width - effectiveMarginX * 2;
    // Approx 3 highlighted nodes per level based on initNodes logic (i/3)
    const approxNodesInLevel = 3; 
    const expectedNodeSpacing = levelWidth / (approxNodesInLevel + 1);


    let shouldConnect = false;

    if (levelDiff === 1) { // Parent-child
        const parentNode = p1.level < p2.level ? p1 : p2;
        const childNode = p1.level < p2.level ? p2 : p1;
        // Connect if child is horizontally "under" parent, within reasonable spacing
        if (Math.abs(parentNode.x - childNode.x) < expectedNodeSpacing * 1.5) { 
            shouldConnect = true;
        }
    } else if (levelDiff === 0) { // Siblings
        // Connect if siblings are close horizontally
        if (horizontalDist < expectedNodeSpacing * 1.2) {
            shouldConnect = true;
        }
    }
    
    // Fallback for highlighted nodes to ensure connectivity
    if (!shouldConnect && node1.highlighted && node2.highlighted && distance(node1, node2) < expectedNodeSpacing * 2.5) {
        shouldConnect = true;
    }


    if (shouldConnect) {
      const opacity = Math.max(0.15, (0.7 - (distance(node1, node2) / 170)) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : (node1.highlighted && node2.highlighted ? 1.5 : 1);
      const glowAmount = isNodeHovered ? 5 : (node1.highlighted && node2.highlighted ? 3 : 0);
      
      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = "#00FFFF";
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      if (levelDiff === 1) { // Parent-child uses a gentle curve
        const topNode = node1.level < node2.level ? node1 : node2;
        const bottomNode = node1.level < node2.level ? node2 : node1;
        const controlYOffset = (bottomNode.y - topNode.y) * 0.3;
        ctx.bezierCurveTo(
          topNode.x, topNode.y + controlYOffset, 
          bottomNode.x, bottomNode.y - controlYOffset, 
          bottomNode.x, bottomNode.y
        );
      } else { // Siblings or other connections are straight
        ctx.lineTo(node2.x, node2.y);
      }
      ctx.stroke();
      
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
      
      const node: Node = { // Explicitly type node here
        id: i,
        x: x,
        y: y,
        radius: highlighted ? 7 : 3 + Math.random() * 2,
        color: highlighted ? '#00FFFF' : '#444444',
        speed: 0.2 + Math.random() * 0.3,
        highlighted,
        name: highlighted ? currentModels[i] : undefined,
        category: highlighted ? category : undefined,
        originalX: x,
        originalY: y,
        targetX: x, // Will be updated by updateNodePosition
        targetY: y, // Will be updated by updateNodePosition
        level: highlighted && category === 'analysis' ? Math.floor(i / Math.max(1,currentModels.length/3)) : undefined, // Adjust level assignment
        layerIndex: undefined, // Will be set by updateNodePosition
        positionInLayer: undefined // Will be set by updateNodePosition
      };
      newNodes.push(node);
    }
    nodesRef.current = newNodes;
    // Call updateNodePosition once after init to set initial targetX/Y and layer info
    // This is a bit tricky as updateNodePosition is usually called in animate loop.
    // For now, targetX/Y are set by updateNodePosition during the first animation frames.
  };
  
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
    
    if (currentProgress < 0.1) {
      node.x += Math.sin(Date.now() * 0.001 + index) * node.speed * (1 - currentProgress * 10);
      node.y += Math.cos(Date.now() * 0.001 + index) * node.speed * (1 - currentProgress * 10);
      node.originalX = node.x;
      node.originalY = node.y;
    } else {
      let targetX = node.x; // Default to current if not set
      let targetY = node.y;
      
      const highlightedNodes = nodesRef.current.filter(n => n.highlighted);
      const highlightedCount = highlightedNodes.length;
      const highlightedNodeIndex = highlightedNodes.findIndex(n => n.id === node.id);

      if (currentCategory === 'business') {
        const baseHexRadius = Math.min(canvas.width, canvas.height) * 0.42; // Matched to pattern drawing
        
        if (node.highlighted && highlightedNodeIndex !== -1) {
          const totalHighlightedInCenter = Math.min(highlightedCount, 6); 
          const hexAngle = (2 * Math.PI) / Math.max(1,totalHighlightedInCenter);
          const angle = (highlightedNodeIndex % totalHighlightedInCenter) * hexAngle;
          targetX = center.x + Math.cos(angle) * (baseHexRadius * 0.35);
          targetY = center.y + Math.sin(angle) * (baseHexRadius * 0.35);
          node.layerIndex = 0; // Central layer
          node.positionInLayer = highlightedNodeIndex % totalHighlightedInCenter;
        } else {
          const layer = 1 + (index % 2); // simplified to 2 outer layers for clarity
          const pointsInLayer = 6 * layer; 
          const pointIndex = index % pointsInLayer;
          const angle = (pointIndex / pointsInLayer) * Math.PI * 2;
          const layerRadius = baseHexRadius * (0.6 + layer * 0.2); // Adjusted for better spacing
          targetX = center.x + Math.cos(angle) * layerRadius * (0.95 + Math.random() * 0.1);
          targetY = center.y + Math.sin(angle) * layerRadius * (0.95 + Math.random() * 0.1);
          node.layerIndex = layer;
          node.positionInLayer = pointIndex;
        }
      } else if (currentCategory === 'personal') {
        const baseRadius = Math.min(canvas.width, canvas.height) * 0.35;
        if (node.highlighted && highlightedNodeIndex !== -1) {
          const angle = (highlightedNodeIndex / Math.max(1,highlightedCount)) * Math.PI * 2;
          targetX = center.x + Math.cos(angle) * baseRadius;
          targetY = center.y + Math.sin(angle) * baseRadius;
          node.layerIndex = 0; // Main ring
          node.positionInLayer = highlightedNodeIndex;
        } else {
          const circleIndex = index % 2; // 2 outer rings for non-highlighted
          const circleRadius = baseRadius * (1.3 + circleIndex * 0.4); 
          const goldenAngle = Math.PI * (3 - Math.sqrt(5)); 
          const angle = (index * goldenAngle) % (Math.PI * 2);
          targetX = center.x + Math.cos(angle) * circleRadius;
          targetY = center.y + Math.sin(angle) * circleRadius;
          node.layerIndex = 1 + circleIndex;
          node.positionInLayer = index; // Less structured position in layer
        }
      } else if (currentCategory === 'analysis') {
        const levels = 3; 
        const levelHeight = canvas.height / (levels + 1);
        const effectiveMarginX = canvas.width * 0.15;
        
        if (node.highlighted && node.level !== undefined) {
          const nodeLevel = node.level % levels;
          const nodesInThisLevel = highlightedNodes.filter(n => n.level !== undefined && (n.level % levels) === nodeLevel);
          const countInLevel = nodesInThisLevel.length;
          const nodeIndexInLevel = nodesInThisLevel.findIndex(n => n.id === node.id);

          const levelWidth = canvas.width - effectiveMarginX * 2;
          const nodeSpacing = countInLevel > 0 ? levelWidth / (countInLevel + 1) : levelWidth; 
          
          targetX = effectiveMarginX + nodeSpacing * (nodeIndexInLevel + 1);
          targetY = levelHeight * (nodeLevel + 1);
          node.layerIndex = nodeLevel; // Using 'level' as layerIndex for this category
          node.positionInLayer = nodeIndexInLevel;
        } else {
          const randomLevel = Math.floor(Math.random() * levels);
          targetX = effectiveMarginX + Math.random() * (canvas.width - effectiveMarginX * 2);
          targetY = levelHeight * (randomLevel + 1) + (Math.random() - 0.5) * levelHeight * 0.4;
          node.layerIndex = randomLevel;
        }
      } else { // Default - Triangular pattern
        const triangleTotalHeight = Math.min(canvas.width, canvas.height) * 0.7;
        const triangleBaseWidth = triangleTotalHeight * 0.866; 
        const numLayers = 4; 
        const layerVerticalSpacing = triangleTotalHeight / numLayers;

        if (node.highlighted && highlightedNodeIndex !== -1) {
          let currentLayer = 0;
          let nodesInPrevLayers = 0;
          let positionInCurrentLayer = 0;
          for (let l = 0; l < numLayers; l++) {
            const nodesThisLayer = l + 1;
            if (highlightedNodeIndex < nodesInPrevLayers + nodesThisLayer) {
              currentLayer = l;
              positionInCurrentLayer = highlightedNodeIndex - nodesInPrevLayers;
              break;
            }
            nodesInPrevLayers += nodesThisLayer;
          }
          currentLayer = Math.min(currentLayer, numLayers - 1); // Cap layer

          node.layerIndex = currentLayer;
          node.positionInLayer = positionInCurrentLayer;

          targetY = canvas.height * 0.2 + currentLayer * layerVerticalSpacing;
          const currentLayerEffectiveWidth = triangleBaseWidth * (1 - (currentLayer / numLayers));
          const nodesActuallyInThisLayer = Math.min(currentLayer + 1, highlightedCount - nodesInPrevLayers );

          if (nodesActuallyInThisLayer <= 1) {
            targetX = center.x;
          } else {
            const spacing = currentLayerEffectiveWidth / Math.max(1, nodesActuallyInThisLayer - 1);
            targetX = (center.x - currentLayerEffectiveWidth / 2) + positionInCurrentLayer * spacing;
          }
        } else { 
          const randomLayer = Math.floor(Math.random() * numLayers);
          targetY = canvas.height * 0.2 + randomLayer * layerVerticalSpacing;
          const layerWidthAtRandom = triangleBaseWidth * (1-(randomLayer / numLayers));
          targetX = (center.x - layerWidthAtRandom/2) + Math.random() * layerWidthAtRandom;
          node.layerIndex = randomLayer;
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
    if (nodesRef.current.length === 0) { // Initial setup only if nodes aren't there
        resizeCanvas(); 
    }


    const animate = () => {
      if (!canvas || !ctx || !isVisible) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentNodes = nodesRef.current; 
      
      // Update positions and structural info first
      currentNodes.forEach((node, i) => {
        updateNodePosition(node, canvas, category, i, transitionProgress);
      });
      
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
      
      currentNodes.forEach((node) => { // Drawing uses updated x, y
        drawNode(ctx, node, transitionProgress > 0);
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
      (node.highlighted ? 10 : 7) : 
      (node.radius); 
    
    if ((node.highlighted && isActive) || isHovered) {
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
      (0.8 + 0.2 * transitionProgress) : 
      (0.4 + 0.1 * transitionProgress); 
    
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
      ctx.font = `${isHovered ? 'bold ' : ''}11px Inter, sans-serif`; 
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y - nodeRadius - 5);
      
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
      // Draw all connections once. The specific draw...Connection functions will handle highlighted differences.
      for (let i = 0; i < nodes.length; i++) {
        const node1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) { // Avoid duplicate checks and self-connections
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
    
    particlesRef.current.forEach((particle, index) => {
      const nearestNode = findNearestHighlightedNode(particle);
      
      if (nearestNode && transitionProgress > 0.5) {
        particle.x += (nearestNode.x - particle.x) * 0.04;
        particle.y += (nearestNode.y - particle.y) * 0.04;
      } else {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
      }
      
      const opacity = (particle.life / 80) * transitionProgress; 
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
    // Increase hover radius slightly for easier interaction
    let minDistanceSq = (node: Node) => (node.radius + 15) * (node.radius + 15);


    nodesRef.current.forEach(node => {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distSq = dx*dx + dy*dy;
      const hoverRadiusSq = minDistanceSq(node)

      if (distSq < hoverRadiusSq) {
        // If multiple nodes are in range, this will pick the last one checked.
        // For picking the closest, you'd need to track min actual distance.
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
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#202020]/40" />
    </motion.div>
  );
};

export default InteractiveDemo;