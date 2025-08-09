// src/lib/cognitiveBiasesUtils.ts
import { CognitiveBiasCategory, CATEGORY_METADATA, DUPLICATE_MAPPINGS } from '../types/cognitiveBiases';

/**
 * Format category name for display
 * Converts 'memory-biases' to 'Memory Biases'
 */
export const formatCategoryName = (category: string): string => {
  // Check if we have metadata for this category
  if (CATEGORY_METADATA[category as CognitiveBiasCategory]) {
    return CATEGORY_METADATA[category as CognitiveBiasCategory].name;
  }
  
  // Fallback to basic formatting
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format CB ID for display (CB001 -> #001)
 */
export const formatCbId = (cbId: string): string => {
  return `#${cbId.replace('CB', '')}`;
};

/**
 * Check if a CB ID is a duplicate and get info
 */
export const getDuplicateInfo = (cbId: string): {
  isDuplicate: boolean;
  primaryId: string | null;
  message: string | null;
} => {
  const isDuplicate = DUPLICATE_MAPPINGS.hasOwnProperty(cbId);
  const primaryId = isDuplicate ? DUPLICATE_MAPPINGS[cbId] : null;
  const message = isDuplicate 
    ? `This is a duplicate entry. See primary bias at ${primaryId}`
    : null;
  
  return { isDuplicate, primaryId, message };
};

/**
 * Debounce function for search input (shared with mental models)
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Truncate text to specified length (shared)
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Generate breadcrumb items for cognitive bias pages
 */
export const generateBreadcrumbs = (biasName?: string, category?: string) => {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Cognitive Biases', href: '/cognitive-biases' }
  ];
  
  if (category) {
    breadcrumbs.push({ 
      name: formatCategoryName(category), 
      href: `/cognitive-biases?category=${category}` 
    });
  }
  
  if (biasName) {
    breadcrumbs.push({ name: biasName, href: '#' });
  }
  
  return breadcrumbs;
};

/**
 * Calculate reading time estimate (shared)
 */
export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Format relative time (shared)
 */
export const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return past.toLocaleDateString();
};

/**
 * Scroll to section smoothly (shared)
 */
export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

/**
 * Get progress statistics for display
 */
export const formatProgressStats = (
  uniqueBiases: number, 
  totalBiases: number
): {
  percentage: number;
  text: string;
  color: string;
} => {
  const percentage = Math.round((uniqueBiases / 227) * 100);
  const text = `${uniqueBiases} of 227 unique biases (${totalBiases} total entries)`;
  
  let color = 'text-yellow-500';
  if (percentage >= 100) color = 'text-green-500';
  else if (percentage >= 75) color = 'text-blue-500';
  else if (percentage >= 50) color = 'text-indigo-500';
  
  return { percentage, text, color };
};

/**
 * Group biases by category for display
 */
export const groupBiasesByCategory = <T extends { category: string }>(
  biases: T[]
): Record<string, T[]> => {
  return biases.reduce((acc, bias) => {
    const category = bias.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(bias);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Get bias difficulty level based on mitigation complexity
 */
export const getBiasDifficulty = (mitigationCount: number): {
  level: string;
  color: string;
  description: string;
} => {
  if (mitigationCount <= 2) {
    return {
      level: 'Simple',
      color: 'text-green-500',
      description: 'Easy to recognize and mitigate'
    };
  } else if (mitigationCount <= 4) {
    return {
      level: 'Moderate',
      color: 'text-yellow-500',
      description: 'Requires conscious effort to overcome'
    };
  } else {
    return {
      level: 'Complex',
      color: 'text-red-500',
      description: 'Deeply ingrained and hard to mitigate'
    };
  }
};

/**
 * Filter out duplicate biases from a list
 */
export const filterUniqueBiases = <T extends { cb_id: string; is_duplicate?: boolean }>(
  biases: T[]
): T[] => {
  return biases.filter(bias => !bias.is_duplicate);
};

/**
 * Get a random bias for "Bias of the Day" feature
 */
export const getRandomBias = <T>(biases: T[]): T | null => {
  if (biases.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * biases.length);
  return biases[randomIndex];
};

/**
 * Sort biases by various criteria
 */
export const sortBiases = <T extends { name: string; order_index: number }>(
  biases: T[],
  sortBy: 'name' | 'index' | 'random' = 'index'
): T[] => {
  const sorted = [...biases];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'random':
      return sorted.sort(() => Math.random() - 0.5);
    case 'index':
    default:
      return sorted.sort((a, b) => a.order_index - b.order_index);
  }
};

/**
 * Create shareable URL for a specific bias
 */
export const createBiasShareUrl = (slug: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/cognitive-biases/${slug}`;
};

/**
 * Generate meta description for SEO
 */
export const generateMetaDescription = (
  biasName: string, 
  coreConcept: string
): string => {
  const truncated = truncateText(coreConcept, 150);
  return `Learn about ${biasName}: ${truncated}. Understand how this cognitive bias affects your thinking and decision-making.`;
};

/**
 * Check if user has seen a bias (using localStorage)
 */
export const markBiasAsViewed = (cbId: string): void => {
  const viewed = getViewedBiases();
  if (!viewed.includes(cbId)) {
    viewed.push(cbId);
    localStorage.setItem('viewedBiases', JSON.stringify(viewed));
  }
};

export const getViewedBiases = (): string[] => {
  const stored = localStorage.getItem('viewedBiases');
  return stored ? JSON.parse(stored) : [];
};

export const isBiasViewed = (cbId: string): boolean => {
  return getViewedBiases().includes(cbId);
};

/**
 * Format batch number for display
 */
export const formatBatchNumber = (batchNumber: number): string => {
  return `Batch ${batchNumber.toString().padStart(2, '0')}`;
};