// lib/centrosApi.js
import { createClient } from './supabase/client'

const supabase = createClient()

export async function cargarCentrosApi() {
  const { data, error } = await supabase
    .from('centros')
    .select('*')
    .eq('status', 'activo')
    .order('title', { ascending: true })
  if (error) { console.error('Error cargando centros:', error); throw error }
  return data
}