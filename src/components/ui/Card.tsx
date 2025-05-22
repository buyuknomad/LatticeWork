// src/components/ui/Card.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'mental-model' | 'cognitive-bias' | 'premium';
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
  interactive = false,
  onClick,
  ...props
}) => {
  const baseClasses = [
    'bg-[#2A2D35] rounded-lg border transition-all duration-200',
    'shadow-sm'
  ].join(' ');

  const variants = {
    default: [
      'border-[#444444]',
      hover && 'hover:shadow-md hover:shadow-black/20'
    ].filter(Boolean).join(' '),
    
    'mental-model': [
      'border-[#00FFFF]/30',
      'hover:border-[#00FFFF]/50 hover:shadow-lg hover:shadow-[#00FFFF]/10',
      'relative overflow-hidden'
    ].join(' '),
    
    'cognitive-bias': [
      'border-amber-500/30',
      'hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10',
      'relative overflow-hidden'
    ].join(' '),
    
    premium: [
      'border-purple-500/30',
      'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10',
      'relative overflow-hidden'
    ].join(' ')
  };

  const interactiveClasses = interactive ? [
    'cursor-pointer select-none',
    'hover:-translate-y-1 active:translate-y-0',
    'focus:outline-none focus:ring-2 focus:ring-[#00FFFF]/30 focus:ring-offset-2 focus:ring-offset-[#1A1A1A]'
  ].join(' ') : '';

  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive ? {
    whileHover: { y: -4, scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      className={clsx(
        baseClasses,
        variants[variant],
        interactiveClasses,
        className
      )}
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...motionProps}
      {...props}
    >
      {/* Gradient overlay for special variants */}
      {variant === 'mental-model' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFFF]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      
      {variant === 'cognitive-bias' && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

// Subcomponents for better composition
const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={clsx('p-6 pb-4', className)}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={clsx('px-6 pb-6', className)}>
    {children}
  </div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={clsx('px-6 pb-6 pt-0', className)}>
    {children}
  </div>
);

// Export with subcomponents
export default Object.assign(Card, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter
});