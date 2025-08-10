// src/lib/cognitiveBiasesService.ts
import { supabase } from './supabase';
import { 
  CognitiveBias, 
  CognitiveBiasSummary, 
  CognitiveBiasFilters,
  RelatedBias,
  CognitiveBiasStats,
  isDuplicate,
  getPrimaryCbId 
} from '../types/cognitiveBiases';

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  uniqueCount?: number; // 227 unique biases
  totalCount?: number;  // 245 total IDs
}

// Get paginated list of cognitive biases with search and filtering
export const getCognitiveBiases = async (
  filters: CognitiveBiasFilters,
  itemsPerPage: number = 20
): Promise<PaginatedResponse<CognitiveBiasSummary>> => {
  try {
    let query = supabase
      .from('cognitive_biases_library')
      .select('id, cb_id, name, slug, category, core_concept, order_index, is_duplicate, duplicate_of_id', 
        { count: 'exact' });

    // ALWAYS filter out duplicates for regular users
    // Only show duplicates if explicitly requested (admin only)
    query = query.eq('is_duplicate', false);

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const searchTerm = `%${filters.searchQuery.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},core_concept.ilike.${searchTerm},cb_id.ilike.${searchTerm}`);
    }

    // Apply category filter
    if (filters.selectedCategory) {
      query = query.eq('category', filters.selectedCategory);
    }

    // Calculate pagination
    const from = (filters.page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Apply ordering and pagination
    const { data, error, count } = await query
      .order('order_index', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching cognitive biases:', error);
      throw error;
    }

    // Get stats for unique/total counts
    const stats = await getCognitiveBiasStats();

    const totalPages = Math.ceil((count || 0) / itemsPerPage);
    const hasMore = filters.page < totalPages;

    return {
      data: data || [],
      count: count || 0,
      totalPages,
      currentPage: filters.page,
      hasMore,
      uniqueCount: stats.unique_biases,
      totalCount: stats.total_biases
    };
  } catch (error) {
    console.error('Error in getCognitiveBiases:', error);
    throw error;
  }
};

// Get single cognitive bias by slug or CB ID with automatic duplicate redirect
export const getCognitiveBiasByIdentifier = async (
  identifier: string
): Promise<{
  bias: CognitiveBias | null;
  relatedBiases: RelatedBias[];
  redirectTo?: string; // Slug to redirect to if this is a duplicate
}> => {
  try {
    // Check if identifier is a CB ID or slug
    const isCbId = identifier.startsWith('CB');
    
    // First, check if this is a duplicate CB ID
    if (isCbId && isDuplicate(identifier)) {
      const primaryCbId = getPrimaryCbId(identifier);
      if (primaryCbId) {
        // Get the primary bias directly
        const { data: primaryBias } = await supabase
          .from('cognitive_biases_library')
          .select('*')
          .eq('cb_id', primaryCbId)
          .single();
        
        if (primaryBias) {
          // Return with redirect instruction
          return {
            bias: null,
            relatedBiases: [],
            redirectTo: primaryBias.slug
          };
        }
      }
    }
    
    // Get the bias (will be blocked by RLS if it's a duplicate)
    const { data: bias, error: biasError } = await supabase
      .from('cognitive_biases_library')
      .select('*')
      .eq(isCbId ? 'cb_id' : 'slug', identifier)
      .eq('is_duplicate', false) // Ensure we only get non-duplicates
      .single();

    if (biasError) {
      if (biasError.code === 'PGRST116') {
        // Not found (might be a duplicate that's filtered out)
        return { bias: null, relatedBiases: [] };
      }
      console.error('Error fetching cognitive bias:', biasError);
      throw biasError;
    }

    // Get related biases (only non-duplicates)
    let relatedBiases: RelatedBias[] = [];
    if (bias.related_bias_ids && bias.related_bias_ids.length > 0) {
      // Query using CB IDs instead of slugs since slugs might not be populated yet
      const { data: related, error: relatedError } = await supabase
        .from('cognitive_biases_library')
        .select('cb_id, name, slug, category, core_concept')
        .in('cb_id', bias.related_bias_ids) // Use cb_id instead of slug
        .eq('is_duplicate', false); // Only show unique biases
      
      if (!relatedError) {
        relatedBiases = related || [];
      }
    } else if (bias.related_bias_slugs && bias.related_bias_slugs.length > 0) {
      // Fallback to slugs if they exist
      const { data: related, error: relatedError } = await supabase
        .from('cognitive_biases_library')
        .select('cb_id, name, slug, category, core_concept')
        .in('slug', bias.related_bias_slugs)
        .eq('is_duplicate', false);
      
      if (!relatedError) {
        relatedBiases = related || [];
      }
    }

    return {
      bias: bias as CognitiveBias,
      relatedBiases
    };
  } catch (error) {
    console.error('Error in getCognitiveBiasByIdentifier:', error);
    throw error;
  }
};

// Get navigation (previous/next) biases for detail page
export const getNavigationBiases = async (
  currentOrderIndex: number
): Promise<{
  previous: CognitiveBiasSummary | null;
  next: CognitiveBiasSummary | null;
}> => {
  try {
    // Get previous bias (lower order_index, non-duplicate)
    const { data: previousData } = await supabase
      .from('cognitive_biases_library')
      .select('id, cb_id, name, slug, category, core_concept, order_index, is_duplicate')
      .eq('is_duplicate', false)
      .lt('order_index', currentOrderIndex)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    // Get next bias (higher order_index, non-duplicate)
    const { data: nextData } = await supabase
      .from('cognitive_biases_library')
      .select('id, cb_id, name, slug, category, core_concept, order_index, is_duplicate')
      .eq('is_duplicate', false)
      .gt('order_index', currentOrderIndex)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    return {
      previous: previousData || null,
      next: nextData || null
    };
  } catch (error) {
    console.error('Error in getNavigationBiases:', error);
    return { previous: null, next: null };
  }
};

// Get all cognitive bias stats
export const getCognitiveBiasStats = async (): Promise<CognitiveBiasStats> => {
  try {
    const { data, error } = await supabase
      .rpc('get_cognitive_bias_stats');

    if (error) {
      console.error('Error fetching bias stats:', error);
      throw error;
    }

    return data[0] || {
      total_biases: 0,
      unique_biases: 0,
      duplicate_biases: 0,
      categories_count: 0,
      batches_imported: 0
    };
  } catch (error) {
    console.error('Error in getCognitiveBiasStats:', error);
    return {
      total_biases: 0,
      unique_biases: 0,
      duplicate_biases: 0,
      categories_count: 0,
      batches_imported: 0
    };
  }
};

// Get all available categories for filtering
export const getCognitiveBiasCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('cognitive_biases_library')
      .select('category')
      .eq('is_duplicate', false) // Only from unique biases
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Get unique categories
    const categories = [...new Set((data || []).map(item => item.category))];
    return categories.filter(Boolean);
  } catch (error) {
    console.error('Error in getCognitiveBiasCategories:', error);
    throw error;
  }
};

// Search cognitive biases (focused search)
export const searchCognitiveBiases = async (
  query: string,
  limit: number = 10
): Promise<CognitiveBiasSummary[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;
    
    const { data, error } = await supabase
      .from('cognitive_biases_library')
      .select('id, cb_id, name, slug, category, core_concept, order_index, is_duplicate')
      .eq('is_duplicate', false) // Only search unique biases
      .or(`name.ilike.${searchTerm},core_concept.ilike.${searchTerm},cb_id.ilike.${searchTerm}`)
      .order('order_index', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error searching cognitive biases:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchCognitiveBiases:', error);
    return [];
  }
};

// Get batch progress for admin dashboard
export const getBatchProgress = async (): Promise<{
  totalBatches: number;
  completedBatches: number[];
  currentBatch: number | null;
  biasesPerBatch: Record<number, number>;
  uniqueBiasesCompleted: number;
  duplicatesProcessed: number;
}> => {
  try {
    const { data: biases } = await supabase
      .from('cognitive_biases_library')
      .select('batch_number, is_duplicate');

    if (!biases || biases.length === 0) {
      return {
        totalBatches: 25,
        completedBatches: [],
        currentBatch: null,
        biasesPerBatch: {},
        uniqueBiasesCompleted: 0,
        duplicatesProcessed: 0
      };
    }

    const batchSet = new Set<number>();
    const biasesPerBatch: Record<number, number> = {};
    let uniqueCount = 0;
    let duplicateCount = 0;

    biases.forEach(bias => {
      batchSet.add(bias.batch_number);
      biasesPerBatch[bias.batch_number] = (biasesPerBatch[bias.batch_number] || 0) + 1;
      if (bias.is_duplicate) {
        duplicateCount++;
      } else {
        uniqueCount++;
      }
    });

    const completedBatches = Array.from(batchSet).sort((a, b) => a - b);
    const currentBatch = completedBatches.length > 0 
      ? Math.max(...completedBatches) 
      : null;

    return {
      totalBatches: 25,
      completedBatches,
      currentBatch,
      biasesPerBatch,
      uniqueBiasesCompleted: uniqueCount,
      duplicatesProcessed: duplicateCount
    };
  } catch (error) {
    console.error('Error in getBatchProgress:', error);
    throw error;
  }
};

// Check if a CB ID or slug exists
export const checkBiasExists = async (identifier: string): Promise<boolean> => {
  try {
    const isCbId = identifier.startsWith('CB');
    
    const { data, error } = await supabase
      .from('cognitive_biases_library')
      .select('id')
      .eq(isCbId ? 'cb_id' : 'slug', identifier)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking bias existence:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkBiasExists:', error);
    return false;
  }
};

// ADMIN ONLY: Get all biases including duplicates
export const getAllBiasesAdmin = async (): Promise<CognitiveBias[]> => {
  try {
    // This bypasses RLS and gets all biases
    // Should only be used in admin contexts
    const { data, error } = await supabase
      .from('cognitive_biases_library')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching all biases (admin):', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllBiasesAdmin:', error);
    return [];
  }
};

// Get duplicate mapping for redirects
export const getDuplicateRedirect = (cbId: string): string | null => {
  // If someone tries to access CB068, return CB023
  return getPrimaryCbId(cbId);
};