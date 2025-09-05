import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
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
  lead_data: Record<string, any>
  created_time: string
  created_at: string
}