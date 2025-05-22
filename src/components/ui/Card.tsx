// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'mental-model' | 'cognitive-bias';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false,
  variant = 'default' 
}) => {
  const baseClasses = "bg-[#2A2D35] rounded-lg border transition-all duration-200";
  
  const variants = {
    default: "border-[#444]",
    'mental-model': "border-[#00FFFF]/30 hover:border-[#00FFFF]/50",
    'cognitive-bias': "border-amber-500/30 hover:border-amber-500/50"
  };
  
  const hoverClasses = hover ? "hover:shadow-lg hover:-translate-y-1" : "";

  return (
    <div className={clsx(baseClasses, variants[variant], hoverClasses, className)}>
      {children}
    </div>
  );
};