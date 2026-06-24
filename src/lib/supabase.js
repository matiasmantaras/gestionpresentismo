import { createClient } from '@supabase/supabase-js'

// Validar que las variables de entorno existan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Falta configurar las credenciales de Supabase en el archivo .env.local\n' +
    'Necesitás crear el archivo .env.local con:\n' +
    'VITE_SUPABASE_URL=tu_url_aqui\n' +
    'VITE_SUPABASE_ANON_KEY=tu_key_aqui'
  )
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
})

// Helper para manejo de errores
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)
  return {
    success: false,
    error: error.message || 'Error desconocido',
  }
}
