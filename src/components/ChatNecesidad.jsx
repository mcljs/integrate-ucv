'use client'

/**
 * ChatNecesidad — hilo de mensajes de una solicitud, en tiempo real.
 * Rematado para móvil real: usa altura dinámica del visualViewport para que
 * el teclado NO tape el input, respeta el notch (safe-area) y evita el zoom
 * automático de iOS (inputs a 16px).
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { cargarMensajesApi, enviarMensajeApi, suscribirMensajes } from '@/lib/mensajesApi'
import { X, Send, Loader2 } from 'lucide-react'

const KEY_AUTOR = 'red_centros_autor'

export default function ChatNecesidad({ necesidad, onClose }) {
  const [msgs, setMsgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [autor, setAutor] = useState('')
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [vh, setVh] = useState(null) // alto visible real (descontando teclado)
  const finRef = useRef(null)

  // Bloquea el scroll del fondo mientras el chat está abierto
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Altura real con visualViewport (clave para que el teclado no tape el input)
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    if (!vv) return
    const update = () => setVh(vv.height)
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update) }
  }, [])

  useEffect(() => {
    try { const a = localStorage.getItem(KEY_AUTOR); if (a) setAutor(a) } catch {}
  }, [])

  const scrollFin = useCallback(() => { setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth' }), 60) }, [])

  useEffect(() => {
    let activo = true
    cargarMensajesApi(necesidad.id).then((d) => { if (activo) { setMsgs(d); setLoading(false); scrollFin() } }).catch(() => setLoading(false))
    const off = suscribirMensajes(necesidad.id, (nuevo) => {
      setMsgs((prev) => prev.some((m) => m.id === nuevo.id) ? prev : [...prev, nuevo])
      scrollFin()
    })
    return () => { activo = false; off() }
  }, [necesidad.id, scrollFin])

  async function enviar() {
    const t = texto.trim()
    if (!t) return
    if (!autor.trim()) return alert('Escribe tu nombre o el de tu centro arriba.')
    setEnviando(true)
    try {
      try { localStorage.setItem(KEY_AUTOR, autor.trim()) } catch {}
      await enviarMensajeApi({ necesidad_id: necesidad.id, autor: autor.trim(), texto: t })
      setTexto('')
    } catch (e) { alert('Error: ' + e.message) }
    finally { setEnviando(false) }
  }

  // Si tenemos vh del visualViewport lo usamos; si no, 100dvh
  const alto = vh ? `${vh}px` : '100dvh'

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-white" style={{ height: alto }}>
      {/* header (respeta el notch) */}
      <div className="shrink-0 border-b border-slate-200 px-3 pb-2" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}>
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button onClick={onClose} aria-label="Cerrar" className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 active:bg-slate-100"><X className="h-5 w-5" /></button>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold text-[#1a237e]">{necesidad.recurso}{necesidad.cantidad ? ` · ${necesidad.cantidad}` : ''}</h2>
            <p className="truncate text-xs text-slate-500">{necesidad.centro_nombre}</p>
          </div>
        </div>
      </div>

      {/* nombre del autor */}
      <div className="shrink-0 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <div className="mx-auto max-w-2xl">
          <input value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="Tu nombre o centro"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base outline-none focus:border-[#F5A623]" />
        </div>
      </div>

      {/* mensajes (esta zona es la que hace scroll) */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        <div className="mx-auto max-w-2xl space-y-2">
          {loading && <div className="flex justify-center py-10 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {!loading && msgs.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Aún no hay mensajes. Escribe el primero para coordinar.</p>}
          {msgs.map((m) => {
            const mio = m.autor === autor.trim()
            return (
              <div key={m.id} className={`flex flex-col ${mio ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[15px] ${mio ? 'bg-[#1a237e] text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {!mio && <div className="mb-0.5 text-[10px] font-bold text-[#F5A623]">{m.autor}</div>}
                  <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                </div>
                <span className="mt-0.5 text-[10px] text-slate-400">{new Date(m.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )
          })}
          <div ref={finRef} />
        </div>
      </div>

      {/* input (respeta el safe-area de abajo) */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 pt-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}>
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
            placeholder="Escribe un mensaje…"
            className="max-h-28 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base outline-none focus:border-[#F5A623] focus:bg-white" />
          <button onClick={enviar} disabled={enviando} aria-label="Enviar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a237e] text-white active:bg-[#1a237e]/90 disabled:opacity-60">
            {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}