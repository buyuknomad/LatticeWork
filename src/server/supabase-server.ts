// src/server/supabase-server.ts (server-side)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { MentalModel, CognitiveBias } from '../types/models';

dotenv.config();

// Check if Supabase credentials are defined
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY is not defined in environment variables');
}

// Initialize Supabase client with service key (for admin operations)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Functions to fetch data from Supabase (server-side)
export async function getAllMentalModelsServer(): Promise<MentalModel[]> {
  const { data, error } = await supabaseAdmin
    .from('mental_models')
    .select('*');
  
  if (error) throw error;
  return data || [];
}

export async function getAllCognitiveBiasesServer(): Promise<CognitiveBias[]> {
  const { data, error } = await supabaseAdmin
    .from('cognitive_biases')
    .select('*');
  
  if (error) throw error;
  return data || [];
}

export default supabaseAdmin;