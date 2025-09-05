import { createClient } from '@supabase/supabase-js'

// Função para criar cliente Supabase de forma lazy
export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Configurações do Supabase não encontradas')
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Cliente lazy para evitar inicialização durante build
let _supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabaseClient) {
    _supabaseClient = getSupabaseClient()
  }
  return _supabaseClient
}

// Para compatibilidade com código existente
export const supabase = {
  get from() { return getSupabase().from },
  get auth() { return getSupabase().auth },
  get storage() { return getSupabase().storage },
  get rpc() { return getSupabase().rpc },
  get channel() { return getSupabase().channel },
  get realtime() { return getSupabase().realtime }
}

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          firebase_uid: string
          email: string
          display_name: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firebase_uid: string
          email: string
          display_name?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firebase_uid?: string
          email?: string
          display_name?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface FacebookIntegration {
  id: string
  user_id: string
  facebook_user_id: string
  access_token: string
  page_id: string
  page_name: string
  permissions: string[]
  token_expires_at: string
  created_at: string
  updated_at: string
}

export interface FacebookInsights {
  id: string
  integration_id: string
  metric_name: string
  metric_value: number
  date: string
  created_at: string
}

export interface Lead {
  id: string
  integration_id: string
  facebook_lead_id: string
  form_id: string
  form_name: string
  lead_data: Record<string, string | number | boolean>
  created_time: string
  created_at: string
}