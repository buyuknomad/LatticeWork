// src/services/supabase-client.ts (client-side)
import { createClient } from '@supabase/supabase-js';
import { MentalModel, CognitiveBias } from '../types/models';

// Initialize Supabase client with public anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Functions to fetch data from Supabase (client-side)
export async function getAllMentalModels(): Promise<MentalModel[]> {
  const { data, error } = await supabase
    .from('mental_models')
    .select('*');
  
  if (error) throw error;
  return data || [];
}

export async function getAllCognitiveBiases(): Promise<CognitiveBias[]> {
  const { data, error } = await supabase
    .from('cognitive_biases')
    .select('*');
  
  if (error) throw error;
  return data || [];
}