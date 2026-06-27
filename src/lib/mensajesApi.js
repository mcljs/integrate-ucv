// lib/mensajesApi.js
import { createClient } from './supabase/client'

const supabase = createClient()

/* Lee los mensajes de una solicitud (orden cronológico) */
export async function cargarMensajesApi(necesidadId) {
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('necesidad_id', necesidadId)
    .order('created_at', { ascending: true })
  if (error) { console.error(error); throw error }
  return data
}

/* Envía un mensaje */
export async function enviarMensajeApi({ necesidad_id, autor, texto }) {
  const { data, error } = await supabase
    .from('mensajes')
    .insert({ necesidad_id, autor, texto })
    .select()
    .single()
  if (error) { console.error(error); throw error }
  return data
}

/* Realtime de un hilo concreto: llama onMsg(nuevo) al recibir mensajes */
export function suscribirMensajes(necesidadId, onMsg) {
  const ch = supabase
    .channel(`mensajes-${necesidadId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `necesidad_id=eq.${necesidadId}` },
      (payload) => onMsg(payload.new),
    )
    .subscribe()
  return () => { supabase.removeChannel(ch) }
}