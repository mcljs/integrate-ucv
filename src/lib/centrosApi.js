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

/* Crea un centro nuevo (lo registra una universidad/organización) */
export async function crearCentroApi(c) {
  const payload = {
    title: c.title,
    category: c.category || 'acopio',
    description: c.description || null,
    city: c.city || null,
    state: c.state || null,
    contact: c.contact || null,
    lat: c.lat ?? null,
    lng: c.lng ?? null,
  }
  const { data, error } = await supabase
    .from('centros')
    .insert(payload)
    .select()
    .single()
  if (error) { console.error('Error creando centro:', error); throw error }
  return data
}