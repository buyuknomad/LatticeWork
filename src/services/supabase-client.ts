// src/services/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { MentalModel, CognitiveBias } from '../types/models';

dotenv.config();

// Check if Supabase credentials are defined
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('SUPABASE_URL or SUPABASE_KEY is not defined in environment variables');
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Functions to fetch data from Supabase
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

export default supabase;