// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type UserRoleWithOrg = Database['public']['Tables']['user_role']['Row'] & {
  org: Database['public']['Tables']['org']['Row']
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
})

// Tipos de roles
export type UserRole = 'admin' | 'manager' | 'cashier'

// Función helper para obtener el usuario actual y su rol
export const getCurrentUserWithRole = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { user: null, role: null, org: null, error: userError }
  }

  // Obtener el rol y la organización del usuario en una sola consulta
  const { data, error } = await supabase
    .from('user_role')
    .select<string, UserRoleWithOrg>('*, org!user_role_org_id_fkey(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return { user, role: null, org: null, error }
  }

  return {
    user,
    role: data.role,
    org: data.org,
    error: null
  }
}