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

    // Filter duplicates by default (unless admin viewing all)
    if (!filters.showDuplicates) {
      query = query.eq('is_duplicate', false);
    }

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

// Get single cognitive bias by slug or CB ID with duplicate handling
export const getCognitiveBiasByIdentifier = async (
  identifier: string
): Promise<{
  bias: CognitiveBias | null;
  relatedBiases: RelatedBias[];
  primaryBias?: CognitiveBias | null;
  redirectToPrimary?: boolean;
}> => {
  try {
    // Check if identifier is a CB ID or slug
    const isCbId = identifier.startsWith('CB');
    
    // Get the bias
    const { data: bias, error: biasError } = await supabase
      .from('cognitive_biases_library')
      .select('*')
      .eq(isCbId ? 'cb_id' : 'slug', identifier)
      .single();

    if (biasError) {
      if (biasError.code === 'PGRST116') {
        // Not found
        return { bias: null, relatedBiases: [] };
      }
      console.error('Error fetching cognitive bias:', biasError);
      throw biasError;
    }

    // If it's a duplicate, fetch the primary bias
    let primaryBias = null;
    let redirectToPrimary = false;
    if (bias.is_duplicate && bias.duplicate_of_id) {
      const { data: primary } = await supabase
        .from('cognitive_biases_library')
        .select('*')
        .eq('cb_id', bias.duplicate_of_id)
        .single();
      
      primaryBias = primary as CognitiveBias;
      redirectToPrimary = true; // Flag to indicate UI should redirect
    }

    // Get related biases (only for non-duplicates)
    let relatedBiases: RelatedBias[] = [];
    if (!bias.is_duplicate && bias.related_bias_slugs && bias.related_bias_slugs.length > 0) {
      const { data: related, error: relatedError } = await supabase
        .from('cognitive_biases_library')
        .select('cb_id, name, slug, category, core_concept')
        .in('slug', bias.related_bias_slugs)
        .eq('is_duplicate', false); // Only show unique biases in related
      
      if (!relatedError) {
        relatedBiases = related || [];
      }
    }

    return {
      bias: bias as CognitiveBias,
      relatedBiases,
      primaryBias,
      redirectToPrimary
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