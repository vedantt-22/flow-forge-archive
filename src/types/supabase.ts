
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      files: {
        Row: {
          id: string
          name: string
          size: number
          type: string
          path: string
          owner_id: string
          created_at: string
          updated_at: string
          is_encrypted: boolean
          blockchain_verified: boolean
          shared_with: string[]
          retention_policy: string | null
          tags: string[]
          favorite: boolean
        }
        Insert: {
          id?: string
          name: string
          size: number
          type: string
          path: string
          owner_id: string
          created_at?: string
          updated_at?: string
          is_encrypted?: boolean
          blockchain_verified?: boolean
          shared_with?: string[]
          retention_policy?: string | null
          tags?: string[]
          favorite?: boolean
        }
        Update: {
          id?: string
          name?: string
          size?: number
          type?: string
          path?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
          is_encrypted?: boolean
          blockchain_verified?: boolean
          shared_with?: string[]
          retention_policy?: string | null
          tags?: string[]
          favorite?: boolean
        }
      }
      file_versions: {
        Row: {
          id: string
          file_id: string
          version_number: number
          created_at: string
          created_by: string
          changes: string
          storage_path: string
        }
        Insert: {
          id?: string
          file_id: string
          version_number: number
          created_at?: string
          created_by: string
          changes: string
          storage_path: string
        }
        Update: {
          id?: string
          file_id?: string
          version_number?: number
          created_at?: string
          created_by?: string
          changes?: string
          storage_path?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
