// src/components/ui/Badge.tsx
import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'mental-model' | 'cognitive-bias' | 'premium' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className
}) => {
  const baseClasses = [
    'inline-flex items-center gap-1 font-medium rounded-full',
    'border transition-colors duration-200'
  ].join(' ');

  const variants = {
    default: [
      'bg-gray-700/50 text-gray-300 border-gray-600',
      'hover:bg-gray-600/50 hover:text-gray-200'
    ].join(' '),
    
    'mental-model': [
      'bg-[#00FFFF]/10 text-[#00FFFF] border-[#00FFFF]/30',
      'hover:bg-[#00FFFF]/20 hover:border-[#00FFFF]/50'
    ].join(' '),
    
    'cognitive-bias': [
      'bg-amber-500/10 text-amber-400 border-amber-500/30',
      'hover:bg-amber-500/20 hover:border-amber-500/50'
    ].join(' '),
    
    premium: [
      'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'hover:bg-purple-500/20 hover:border-purple-500/50'
    ].join(' '),
    
    secondary: [
      'bg-[#2A2D35] text-gray-300 border-[#444444]',
      'hover:bg-[#333740] hover:text-white'
    ].join(' ')
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;