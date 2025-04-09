
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Default to empty strings if environment variables aren't available yet
// This allows the app to at least load in development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have actual values before creating client
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;

if (!hasSupabaseCredentials) {
  console.warn('Supabase URL and anonymous key are missing. Some features will be unavailable until you connect to Supabase via the integration.');
}

// Create a mock supabase client if credentials are missing
export const supabase = hasSupabaseCredentials 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>('https://placeholder-url.supabase.co', 'placeholder-key');

// Export your type definitions
export type FileRecord = {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_encrypted: boolean;
  blockchain_verified: boolean;
  shared_with: string[];
  retention_policy?: string;
  tags: string[];
}

export type VersionRecord = {
  id: string;
  file_id: string;
  version_number: number;
  created_at: string;
  created_by: string;
  changes: string;
  storage_path: string;
}
