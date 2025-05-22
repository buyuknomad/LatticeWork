// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className,
  ...props 
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-[#00FFFF] text-[#1A1A1A] hover:bg-[#00CCCC] focus:ring-[#00FFFF]",
    secondary: "bg-[#2A2D35] text-white border border-[#444] hover:bg-[#333740]",
    ghost: "text-[#00FFFF] hover:bg-[#00FFFF]/10",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};