// src/components/ui/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'relative overflow-hidden'
  ].join(' ');

  const variants = {
    primary: [
      'bg-[#00FFFF] text-[#1A1A1A] shadow-sm',
      'hover:bg-[#00CCCC] hover:shadow-md hover:shadow-[#00FFFF]/20',
      'focus:ring-[#00FFFF]/50',
      'active:bg-[#00B8B8] active:scale-95'
    ].join(' '),
    
    secondary: [
      'bg-[#2A2D35] text-white border border-[#444444] shadow-sm',
      'hover:bg-[#333740] hover:border-[#555555]',
      'focus:ring-[#00FFFF]/30',
      'active:bg-[#3A3D45] active:scale-95'
    ].join(' '),
    
    ghost: [
      'text-[#00FFFF] bg-transparent',
      'hover:bg-[#00FFFF]/10 hover:text-[#00CCCC]',
      'focus:ring-[#00FFFF]/30',
      'active:bg-[#00FFFF]/20 active:scale-95'
    ].join(' '),
    
    destructive: [
      'bg-red-600 text-white shadow-sm',
      'hover:bg-red-700 hover:shadow-md hover:shadow-red-600/20',
      'focus:ring-red-500/50',
      'active:bg-red-800 active:scale-95'
    ].join(' ')
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      {...props}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      
      {/* Content - hidden when loading */}
      <span className={clsx('flex items-center gap-2', isLoading && 'opacity-0')}>
        {children}
      </span>
    </motion.button>
  );
};

export default Button;