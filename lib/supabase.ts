import { createClient } from '@supabase/supabase-js'

// Your Supabase project configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string
          title: string
          excerpt: string
          content: string
          date: string
          read_time: string
          tags: string[]
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          excerpt: string
          content: string
          date: string
          read_time: string
          tags: string[]
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          excerpt?: string
          content?: string
          date?: string
          read_time?: string
          tags?: string[]
          image_url?: string | null
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          pdf_url: string
          category: string
          location: string | null
          year: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          pdf_url: string
          category: string
          location?: string | null
          year?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          pdf_url?: string
          category?: string
          location?: string | null
          year?: string | null
          status?: string
          updated_at?: string
        }
      }
      resume: {
        Row: {
          id: string
          file_name: string
          file_url: string
          file_size: number
          uploaded_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_url: string
          file_size: number
          uploaded_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_url?: string
          file_size?: number
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          title: string
          issuer: string
          date_issued: string
          file_name: string
          file_url: string
          file_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          issuer: string
          date_issued: string
          file_name: string
          file_url: string
          file_size: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          issuer?: string
          date_issued?: string
          file_name?: string
          file_url?: string
          file_size?: number
          updated_at?: string
        }
      }
    }
  }
} 