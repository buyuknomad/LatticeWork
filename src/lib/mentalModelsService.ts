// src/lib/mentalModelsService.ts
import { supabase } from './supabase';
import { MentalModel, MentalModelSummary, RelatedModel, MentalModelFilters } from '../types/mentalModels';

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

// Get paginated list of mental models with search and filtering
export const getMentalModels = async (
  filters: MentalModelFilters,
  itemsPerPage: number = 20
): Promise<PaginatedResponse<MentalModelSummary>> => {
  try {
    let query = supabase
      .from('mental_models_library')
      .select('name, slug, category, core_concept, order_index', { count: 'exact' });

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const searchTerm = `%${filters.searchQuery.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},core_concept.ilike.${searchTerm}`);
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
      console.error('Error fetching mental models:', error);
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / itemsPerPage);
    const hasMore = filters.page < totalPages;

    return {
      data: data || [],
      count: count || 0,
      totalPages,
      currentPage: filters.page,
      hasMore
    };
  } catch (error) {
    console.error('Error in getMentalModels:', error);
    throw error;
  }
};

// Get single mental model by slug with related models
export const getMentalModelBySlug = async (slug: string): Promise<{
  model: MentalModel | null;
  relatedModels: RelatedModel[];
}> => {
  try {
    // Get the main model
    const { data: model, error: modelError } = await supabase
      .from('mental_models_library')
      .select('*')
      .eq('slug', slug)
      .single();

    if (modelError) {
      if (modelError.code === 'PGRST116') {
        // Not found
        return { model: null, relatedModels: [] };
      }
      console.error('Error fetching mental model:', modelError);
      throw modelError;
    }

    // Get related models if they exist
    let relatedModels: RelatedModel[] = [];
    if (model?.related_model_slugs && model.related_model_slugs.length > 0) {
      const { data: related, error: relatedError } = await supabase
        .from('mental_models_library')
        .select('name, slug, category, core_concept')
        .in('slug', model.related_model_slugs);

      if (relatedError) {
        console.error('Error fetching related models:', relatedError);
        // Don't throw error for related models - just continue without them
      } else {
        relatedModels = related || [];
      }
    }

    return {
      model: model as MentalModel,
      relatedModels
    };
  } catch (error) {
    console.error('Error in getMentalModelBySlug:', error);
    throw error;
  }
};

// Get navigation (previous/next) models for a given model
export const getNavigationModels = async (currentOrderIndex: number): Promise<{
  previous: MentalModelSummary | null;
  next: MentalModelSummary | null;
}> => {
  try {
    // Get previous model (lower order_index)
    const { data: previousData } = await supabase
      .from('mental_models_library')
      .select('name, slug, category, core_concept, order_index')
      .lt('order_index', currentOrderIndex)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    // Get next model (higher order_index)
    const { data: nextData } = await supabase
      .from('mental_models_library')
      .select('name, slug, category, core_concept, order_index')
      .gt('order_index', currentOrderIndex)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    return {
      previous: previousData || null,
      next: nextData || null
    };
  } catch (error) {
    console.error('Error in getNavigationModels:', error);
    return { previous: null, next: null };
  }
};

// Get all available categories for filtering
export const getMentalModelCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('mental_models_library')
      .select('category')
      .order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Get unique categories
    const categories = [...new Set((data || []).map(item => item.category))];
    return categories.filter(Boolean); // Remove any null/undefined values
  } catch (error) {
    console.error('Error in getMentalModelCategories:', error);
    throw error;
  }
};

// Get total count of mental models
export const getMentalModelsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('mental_models_library')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching models count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getMentalModelsCount:', error);
    return 0;
  }
};

// Search mental models (more focused search functionality)
export const searchMentalModels = async (
  query: string,
  limit: number = 10
): Promise<MentalModelSummary[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;
    
    const { data, error } = await supabase
      .from('mental_models_library')
      .select('name, slug, category, core_concept, order_index')
      .or(`name.ilike.${searchTerm},core_concept.ilike.${searchTerm}`)
      .order('order_index', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error searching mental models:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchMentalModels:', error);
    return [];
  }
};