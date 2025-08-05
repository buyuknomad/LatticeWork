// src/components/CategoryBadge.tsx
import React from 'react';
import { 
  MentalModelCategory, 
  getCategoryMetadata, 
  getCategoryColor 
} from '../types/mentalModels';

interface CategoryBadgeProps {
  category: MentalModelCategory;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
  showText = true,
  className = '',
  onClick
}) => {
  const metadata = getCategoryMetadata(category);
  
  // Size classes
  const sizeClasses = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      iconSize: 'text-sm'
    },
    md: {
      padding: 'px-3 py-1',
      text: 'text-sm',
      iconSize: 'text-base'
    },
    lg: {
      padding: 'px-4 py-2',
      text: 'text-base',
      iconSize: 'text-lg'
    }
  };

  const currentSize = sizeClasses[size];
  
  // Base classes
  const baseClasses = `
    inline-flex items-center rounded-full border transition-all duration-200
    ${currentSize.padding} ${currentSize.text}
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${className}
  `;

  // Style object for dynamic colors
  const badgeStyle = {
    backgroundColor: getCategoryColor(category, 0.2),
    color: metadata.color,
    borderColor: getCategoryColor(category, 0.3)
  };

  // Hover styles if clickable
  const hoverStyle = onClick ? {
    '--hover-bg': getCategoryColor(category, 0.3),
    '--hover-border': getCategoryColor(category, 0.5)
  } as React.CSSProperties : {};

  return (
    <span
      className={baseClasses}
      style={{ ...badgeStyle, ...hoverStyle }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {showIcon && (
        <span className={`${currentSize.iconSize} ${showText ? 'mr-1' : ''}`}>
          {metadata.icon}
        </span>
      )}
      {showText && metadata.name}
    </span>
  );
};

// Variant with just icon
export const CategoryIcon: React.FC<{
  category: MentalModelCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ category, size = 'md', className = '' }) => {
  const metadata = getCategoryMetadata(category);
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg'
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full
        ${sizeClasses[size]} ${className}
      `}
      style={{
        backgroundColor: getCategoryColor(category, 0.2),
        color: metadata.color
      }}
    >
      {metadata.icon}
    </div>
  );
};

// Compact list variant for dropdowns or lists
export const CategoryListItem: React.FC<{
  category: MentalModelCategory;
  selected?: boolean;
  onClick?: () => void;
}> = ({ category, selected = false, onClick }) => {
  const metadata = getCategoryMetadata(category);
  
  return (
    <div
      className={`
        flex items-center px-3 py-2 cursor-pointer transition-all duration-200
        ${selected ? 'bg-opacity-20' : 'hover:bg-gray-800'}
      `}
      style={selected ? {
        backgroundColor: getCategoryColor(category, 0.1),
        color: metadata.color
      } : {}}
      onClick={onClick}
      role="option"
      aria-selected={selected}
    >
      <span className="text-lg mr-3">{metadata.icon}</span>
      <span className="flex-1">{metadata.name}</span>
    </div>
  );
};

// Export all variants
export default CategoryBadge;

// Helper component for category description tooltips
export const CategoryWithTooltip: React.FC<{
  category: MentalModelCategory;
  size?: 'sm' | 'md' | 'lg';
}> = ({ category, size = 'md' }) => {
  const metadata = getCategoryMetadata(category);
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <CategoryBadge category={category} size={size} />
      </div>
      
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap max-w-xs">
          <div className="font-semibold mb-1">{metadata.name}</div>
          <div className="text-xs text-gray-300">{metadata.description}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};