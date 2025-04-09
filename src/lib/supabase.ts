
import { supabase } from '@/integrations/supabase/client';

// Re-export the supabase client
export { supabase };

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
