
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and anonymous key must be provided. Please connect to Supabase via the integration.');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
