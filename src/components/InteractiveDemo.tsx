import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface Particle extends Point {
  vx: number;
  vy: number;
  alpha: number;
  targetNodeId?: string;
}

interface Node extends Point {
  id: string;
  label: string;
  highlighted: boolean;
  targetX: number;
  targetY: number;
  level?: number; // For hierarchical structure
}

interface InteractiveDemoProps {
  isTyping: boolean;
  category: 'business' | 'personal' | 'analysis' | 'default';
}

const mentalModels = {
  default: ['First Principles', 'Pareto Principle', 'Occam’s Razor', 'Inversion', 'Feedback Loops'],
  business: ['SWOT Analysis', 'Porter’s Five Forces', 'Value Proposition', 'Lean Thinking', 'Scalability'],
  personal: ['Growth Mindset', 'Habit Loop', 'Self-Reflection', 'Goal Setting', 'Resilience'],
  analysis: ['Root Cause', 'Decision Trees', 'Cost-Benefit', 'Systems Thinking', 'Scenario Planning'],
};

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ isTyping, category }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const centerRef = useRef<Point>({ x: 0, y: 0 });

  // Helper Functions
  const distance = (p1: Point, p2: Point) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  const normalizeAngle = (angle: number) => ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const angleBetween = (a1: number, a2: number) => {
    const diff = normalizeAngle(a2) - normalizeAngle(a1);
    return Math.min(Math.abs(diff), 2 * Math.PI - Math.abs(diff));
  };
  const midPointAngle = (a1: number, a2: number) => {
    const n1 = normalizeAngle(a1);
    const n2 = normalizeAngle(a2);
    const diff = angleBetween(n1, n2);
    return n1 + (n2 > n1 ? diff : -diff) / 2;
  };
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // Background Pattern Drawing Functions
  const drawTriangularPatternElements = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const size = 50;
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size * 1.732) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size * 0.866, y + size);
        ctx.lineTo(x - size * 0.866, y + size);
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  const drawGridPatternElements = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        ctx.strokeRect(x, y, gridSize, gridSize);
      }
    }
  };

  const drawCirclePatternElements = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const radius = 30;
    for (let x = radius; x < width; x += radius * 2) {
      for (let y = radius; y < height; y += radius * 2) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const drawHierarchyPatternElements = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const levelHeight = 60;
    for (let y = 0; y < height; y += levelHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Connection Drawing Functions
  const drawGridConnection = (
    ctx: CanvasRenderingContext2D,
    node1: Node,
    node2: Node,
    currentProgress: number
  ) => {
    const center = centerRef.current;
    const targetNode1 = { x: node1.targetX, y: node1.targetY };
    const targetNode2 = { x: node2.targetX, y: node2.targetY };
    const dist1 = distance(targetNode1, center);
    const dist2 = distance(targetNode2, center);
    const angle1 = Math.atan2(targetNode1.y - center.y, targetNode1.x - center.x);
    const angle2 = Math.atan2(targetNode2.y - center.y, targetNode2.x - center.x);
    const angleDiff = angleBetween(angle1, angle2);
    const isSameLayer = Math.abs(dist1 - dist2) < 30;
    const isAdjacentLayer = !isSameLayer && Math.abs(dist1 - dist2) < 60;
    const bothHighlighted = node1.highlighted && node2.highlighted;

    const shouldConnect =
      (isSameLayer && angleDiff < Math.PI / 3) ||
      (isAdjacentLayer && angleDiff < Math.PI / 6) ||
      (bothHighlighted && distance(targetNode1, targetNode2) < 150);

    if (shouldConnect) {
      const opacity = Math.max(0.15, (0.6 - distance(node1, node2) / 180) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : bothHighlighted ? 1.5 : 1;
      const glowAmount = isNodeHovered ? 5 : bothHighlighted ? 3 : 0;

      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = '#00FFFF';
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;

      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      if (isAdjacentLayer) {
        const midAng = midPointAngle(angle1, angle2);
        const midDist = (dist1 + dist2) / 2;
        const cpX = center.x + Math.cos(midAng) * midDist;
        const cpY = center.y + Math.sin(midAng) * midDist;
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else if (angleDiff > Math.PI / 6) {
        const avgDist = (dist1 + dist2) / 2;
        const midAngle = midPointAngle(angle1, angle2);
        const cpX = center.x + Math.cos(midAngle) * (avgDist * 1.05);
        const cpY = center.y + Math.sin(midAngle) * (avgDist * 1.05);
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else {
        ctx.lineTo(node2.x, node2.y);
      }
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
    const center = centerRef.current;
    const targetNode1 = { x: node1.targetX, y: node1.targetY };
    const targetNode2 = { x: node2.targetX, y: node2.targetY };
    const angle1 = Math.atan2(targetNode1.y - center.y, targetNode1.x - center.x);
    const angle2 = Math.atan2(targetNode2.y - center.y, targetNode2.x - center.x);
    const radius1 = distance(targetNode1, center);
    const radius2 = distance(targetNode2, center);
    const angleDiff = angleBetween(angle1, angle2);
    const radiusRatio = Math.max(radius1, radius2) / Math.min(radius1, radius2);
    const almostSameRadius = Math.abs(radius1 - radius2) < 30;
    const bothHighlighted = node1.highlighted && node2.highlighted;

    const shouldConnect =
      (almostSameRadius && angleDiff < Math.PI / 2) ||
      (!almostSameRadius && radiusRatio < 1.5 && angleDiff < Math.PI / 4) ||
      (bothHighlighted && distance(targetNode1, targetNode2) < 180);

    if (shouldConnect) {
      const opacity = Math.max(0.15, (0.7 - distance(node1, node2) / 150) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : bothHighlighted ? 1.5 : 1;
      const glowAmount = isNodeHovered ? 5 : bothHighlighted ? 3 : 0;

      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = '#00FFFF';
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;

      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      if (almostSameRadius && angleDiff > Math.PI / 8) {
        const midAngle = midPointAngle(angle1, angle2);
        const curveFactor = 1.2 - angleDiff / Math.PI;
        const cpRadius = ((radius1 + radius2) / 2) * curveFactor;
        const cpX = center.x + Math.cos(midAngle) * cpRadius;
        const cpY = center.y + Math.sin(midAngle) * cpRadius;
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else if (!almostSameRadius) {
        const midAngle = midPointAngle(angle1, angle2);
        const cpRadius = (radius1 + radius2) / 2;
        const cpX = center.x + Math.cos(midAngle) * cpRadius;
        const cpY = center.y + Math.sin(midAngle) * cpRadius;
        ctx.quadraticCurveTo(cpX, cpY, node2.x, node2.y);
      } else {
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
    const levelDiff = Math.abs(node1.level - node2.level);
    const horizontalDist = Math.abs(node1.targetX - node2.targetX);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isVerticalRelation = levelDiff === 1;
    const areSiblings = levelDiff === 0;
    const isAligned = horizontalDist < canvas.width * 0.2;
    const bothHighlighted = node1.highlighted && node2.highlighted;

    const shouldConnect =
      (isVerticalRelation && isAligned) ||
      (areSiblings && horizontalDist < 150) ||
      (bothHighlighted && distance({ x: node1.targetX, y: node1.targetY }, { x: node2.targetX, y: node2.targetY }) < 200);

    if (shouldConnect) {
      const opacity = Math.max(0.15, (0.7 - distance(node1, node2) / 170) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : bothHighlighted ? 1.5 : 1;
      const glowAmount = isNodeHovered ? 5 : bothHighlighted ? 3 : 0;

      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = '#00FFFF';
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;

      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      if (isVerticalRelation) {
        const [topNode, bottomNode] = node1.level < node2.level ? [node1, node2] : [node2, node1];
        const startControlX = topNode.x + (bottomNode.x - topNode.x) * 0.2;
        const startControlY = topNode.y + (bottomNode.y - topNode.y) * 0.3;
        const endControlX = topNode.x + (bottomNode.x - topNode.x) * 0.8;
        const endControlY = topNode.y + (bottomNode.y - topNode.y) * 0.7;
        ctx.bezierCurveTo(startControlX, startControlY, endControlX, endControlY, bottomNode.x, bottomNode.y);
      } else if (areSiblings) {
        const midX = (node1.x + node2.x) / 2;
        const midY = (node1.y + node2.y) / 2 - 10;
        ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
      } else {
        ctx.lineTo(node2.x, node2.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
    }
  };

  const drawDefaultConnection = (
    ctx: CanvasRenderingContext2D,
    node1: Node,
    node2: Node,
    currentProgress: number,
    canvas: HTMLCanvasElement
  ) => {
    const center = centerRef.current;
    const targetNode1 = { x: node1.targetX, y: node1.targetY };
    const targetNode2 = { x: node2.targetX, y: node2.targetY };
    const yDiff = Math.abs(targetNode1.y - targetNode2.y);
    const sameVerticalLayer = yDiff < 20;
    const adjacentLayer = !sameVerticalLayer && yDiff < canvas.height / 5;
    const distToCenter1 = Math.abs(targetNode1.x - center.x);
    const distToCenter2 = Math.abs(targetNode2.x - center.x);
    const bothHighlighted = node1.highlighted && node2.highlighted;

    const shouldConnect =
      (sameVerticalLayer && distance(targetNode1, targetNode2) < 160) ||
      (adjacentLayer &&
        ((targetNode1.y < targetNode2.y && distToCenter1 > distToCenter2) ||
         (targetNode2.y < targetNode1.y && distToCenter2 > distToCenter1))) ||
      (bothHighlighted && distance(targetNode1, targetNode2) < 200);

    if (shouldConnect) {
      const opacity = Math.max(0.12, (0.6 - distance(node1, node2) / 200) * currentProgress);
      const isNodeHovered = node1.id === hoveredNodeId || node2.id === hoveredNodeId;
      const lineWidth = isNodeHovered ? 2 : bothHighlighted ? 1.5 : 1;
      const glowAmount = isNodeHovered ? 5 : bothHighlighted ? 3 : 0;

      ctx.shadowBlur = glowAmount;
      ctx.shadowColor = '#00FFFF';
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;

      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      if (adjacentLayer) {
        const midX = (node1.x + node2.x) / 2;
        const bendDirection = (node1.x + node2.x) / 2 > center.x ? -1 : 1;
        const bendAmount = 20 * bendDirection;
        const midY = (node1.y + node2.y) / 2 + bendAmount;
        ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
      } else {
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
    const dist = distance(node1, node2);
    if (dist < 120 && Math.random() < 0.1) {
      const opacity = clamp(0.2 - dist / 300, 0, 0.2) * (1 - currentProgress);
      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      ctx.lineTo(node2.x, node2.y);
      ctx.stroke();
    }
  };

  // Node and Particle Drawing
  const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
    const isHovered = node.id === hoveredNodeId;
    const size = isHovered ? 12 : node.highlighted ? 10 : 8;
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size);
    gradient.addColorStop(0, node.highlighted ? '#00FFFF' : '#FFFFFF');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    if ((node.highlighted || isHovered) && transitionProgress > 0.8) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#00FFFF';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y - 15);
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const highlightedNodes = nodesRef.current.filter((n) => n.highlighted || n.id === hoveredNodeId);

    particlesRef.current.forEach((p, i) => {
      if (transitionProgress > 0.5 && highlightedNodes.length > 0) {
        const targetNode = highlightedNodes[Math.floor(Math.random() * highlightedNodes.length)];
        const dx = targetNode.x - p.x;
        const dy = targetNode.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          const force = 0.05 * (1 - transitionProgress);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        p.targetNodeId = targetNode.id;
      } else {
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;
        p.targetNodeId = undefined;
      }

      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = clamp(p.alpha - 0.005, 0, 1);

      if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.alpha <= 0) {
        particlesRef.current.splice(i, 1);
        return;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`;
      ctx.fill();
    });

    if (Math.random() < 0.3 && particlesRef.current.length < 100) {
      const node = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
      particlesRef.current.push({
        x: node.x,
        y: node.y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        alpha: 1,
      });
    }
  };

  const drawConnections = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const nodes = nodesRef.current;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (transitionProgress < 0.3) {
          drawChaoticConnection(ctx, nodes[i], nodes[j], transitionProgress);
        } else {
          switch (category) {
            case 'business':
              drawGridConnection(ctx, nodes[i], nodes[j], transitionProgress);
              break;
            case 'personal':
              drawCircularConnection(ctx, nodes[i], nodes[j], transitionProgress);
              break;
            case 'analysis':
              drawHierarchicalConnection(ctx, nodes[i], nodes[j], transitionProgress);
              break;
            default:
              drawDefaultConnection(ctx, nodes[i], nodes[j], transitionProgress, canvas);
              break;
          }
        }
      }
    }
  };

  // Node Positioning
  const updateNodePosition = (node: Node, index: number, width: number, height: number) => {
    const center = centerRef.current;
    let targetX = node.targetX;
    let targetY = node.targetY;

    switch (category) {
      case 'business': {
        const rings = 3;
        const angleStep = (2 * Math.PI) / mentalModels.business.length;
        const radius = Math.min(width, height) * 0.2 * (1 + (index % rings));
        targetX = center.x + Math.cos(angleStep * index) * radius;
        targetY = center.y + Math.sin(angleStep * index) * radius;
        break;
      }
      case 'personal': {
        const radius = Math.min(width, height) * 0.25;
        const angleStep = (2 * Math.PI) / mentalModels.personal.length;
        targetX = center.x + Math.cos(angleStep * index) * radius;
        targetY = center.y + Math.sin(angleStep * index) * radius;
        break;
      }
      case 'analysis': {
        const levels = Math.ceil(mentalModels.analysis.length / 3);
        node.level = Math.floor(index / 3);
        const levelHeight = height / levels;
        const nodesInLevel = Math.min(3, mentalModels.analysis.length - node.level * 3);
        const levelWidth = width / (nodesInLevel + 1);
        targetX = levelWidth * ((index % 3) + 1);
        targetY = levelHeight * node.level + levelHeight / 2;
        break;
      }
      default: {
        const angleStep = (2 * Math.PI) / mentalModels.default.length;
        const radius = Math.min(width, height) * 0.3;
        targetX = center.x + Math.cos(angleStep * index) * radius;
        targetY = center.y + Math.sin(angleStep * index) * radius;
        break;
      }
    }

    node.targetX = targetX;
    node.targetY = targetY;
    const dx = node.targetX - node.x;
    const dy = node.targetY - node.y;
    node.x += dx * 0.05 * transitionProgress;
    node.y += dy * 0.05 * transitionProgress;
  };

  // Animation Loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (transitionProgress > 0.5) {
      switch (category) {
        case 'business':
          drawGridPatternElements(ctx, canvas.width, canvas.height);
          break;
        case 'personal':
          drawCirclePatternElements(ctx, canvas.width, canvas.height);
          break;
        case 'analysis':
          drawHierarchyPatternElements(ctx, canvas.width, canvas.height);
          break;
        default:
          drawTriangularPatternElements(ctx, canvas.width, canvas.height);
          break;
      }
    }

    drawConnections(ctx, canvas);
    drawParticles(ctx);
    nodesRef.current.forEach((node, index) => {
      updateNodePosition(node, index, canvas.width, canvas.height);
      drawNode(ctx, node);
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Viewport Check
  const isInViewport = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // Effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const checkVisibility = () => setIsVisible(isInViewport(canvas));
    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVisible) {
      interval = setInterval(() => {
        setTransitionProgress((prev) => clamp(isTyping ? prev - 0.05 : prev + 0.05, 0, 1));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isTyping, isVisible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      centerRef.current = { x: canvas.width / 2, y: canvas.height / 2 };

      const models = mentalModels[category];
      nodesRef.current = models.map((label, index) => ({
        id: `${label}-${index}`,
        label,
        x: centerRef.current.x + (Math.random() - 0.5) * 100,
        y: centerRef.current.y + (Math.random() - 0.5) * 100,
        targetX: 0,
        targetY: 0,
        highlighted: Math.random() > 0.5,
      }));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [category]);

  useEffect(() => {
    if (isVisible) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, category, transitionProgress, hoveredNodeId]);

  // Event Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closestNode: Node | null = null;
    let minDist = 20;

    nodesRef.current.forEach((node) => {
      const dist = distance({ x: node.x, y: node.y }, { x: mouseX, y: mouseY });
      if (dist < minDist) {
        minDist = dist;
        closestNode = node;
      }
    });

    setHoveredNodeId(closestNode?.id || null);
  };

  const handleMouseLeave = () => setHoveredNodeId(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '100%' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};

export default InteractiveDemo;