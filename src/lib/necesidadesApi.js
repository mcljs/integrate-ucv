// lib/necesidadesApi.js
// Sigue el mismo patrón que tu reportesApi.js (createClient() de @supabase/ssr).

import { createClient } from './supabase/client'

const supabase = createClient()

/* Lee todas las necesidades (más recientes primero) */
export async function cargarNecesidadesApi() {
  const { data, error } = await supabase
    .from('necesidades')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando necesidades:', error)
    throw error
  }
  return data
}

/* Crea una necesidad/oferta */
export async function crearNecesidadApi(n) {
  const payload = {
    centro_id: n.centro_id || null,
    centro_nombre: n.centro_nombre,
    tipo: n.tipo,                 // 'necesito' | 'ofrezco'
    recurso: n.recurso,
    cantidad: n.cantidad || null,
    urgencia: n.urgencia,         // 'alta' | 'media' | 'baja'
    descripcion: n.descripcion || null,
    city: n.city || null,
    state: n.state || null,
    contact: n.contact || null,
  }

  const { data, error } = await supabase
    .from('necesidades')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error creando necesidad:', error)
    throw error
  }
  return data
}

/* Marca "en camino" con quién responde */
export async function responderNecesidadApi(id, respondido_por) {
  const { error } = await supabase
    .from('necesidades')
    .update({ estado: 'en_camino', respondido_por })
    .eq('id', id)
  if (error) { console.error(error); throw error }
}

/* Marca resuelto */
export async function resolverNecesidadApi(id) {
  const { error } = await supabase
    .from('necesidades')
    .update({ estado: 'resuelto' })
    .eq('id', id)
  if (error) { console.error(error); throw error }
}

/* Reabre */
export async function reabrirNecesidadApi(id) {
  const { error } = await supabase
    .from('necesidades')
    .update({ estado: 'abierto', respondido_por: null })
    .eq('id', id)
  if (error) { console.error(error); throw error }
}

/* Suscripción realtime: llama a onChange() cuando algo cambia */
export function suscribirNecesidades(onChange) {
  const ch = supabase
    .channel('necesidades-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'necesidades' }, onChange)
    .subscribe()
  return () => { supabase.removeChannel(ch) }
}