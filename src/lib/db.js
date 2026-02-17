import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
  });
}

// Cliente para operaciones del lado del cliente
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Cliente con permisos de servicio para operaciones del lado del servidor
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

export default supabaseAdmin;
