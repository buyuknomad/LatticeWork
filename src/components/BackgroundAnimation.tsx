import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const animate = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas with semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(26, 26, 26, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Draw particle
        const gradient = ctx.createRadialGradient(
          particle.x, 
          particle.y, 
          0, 
          particle.x, 
          particle.y, 
          particle.size
        );
        gradient.addColorStop(0, `rgba(0, 255, 255, ${particle.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Move particle with subtle sinusoidal movement
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary checking
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX = -particle.speedX * 0.5;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY = -particle.speedY * 0.5;
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const particles: Particle[] = [];
    const particleCount = Math.min(50, canvas.width * canvas.height / 25000);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: 0.1 + Math.random() * 0.3
      });
    }
    
    particlesRef.current = particles;
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default BackgroundAnimation;