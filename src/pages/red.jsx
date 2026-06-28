'use client'

/**
 * /red — Plataforma unificada (Centros / Solicitudes) + chat.
 * Params de URL (se leen tras montar, desde window.location.search):
 *   ?tab=centros|solicitudes
 *   ?zona=Miranda  &  ?cat=hospital
 *   ?s=ID    -> resalta/scrollea esa solicitud
 *   ?chat=ID -> abre el chat de esa solicitud
 *
 * Requiere: lib/centrosApi.js, lib/necesidadesApi.js, components/ChatNecesidad.jsx
 * Colócalo en: app/red/page.jsx
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { cargarCentrosApi, crearCentroApi } from '@/lib/centrosApi'
import {
  cargarNecesidadesApi, crearNecesidadApi, responderNecesidadApi,
  resolverNecesidadApi, reabrirNecesidadApi, suscribirNecesidades,
} from '@/lib/necesidadesApi'
import ChatNecesidad from '@/components/ChatNecesidad'
import {
  Plus, Search, X, RefreshCw, HandHeart, PackageOpen, CheckCircle2, Truck,
  AlertTriangle, Loader2, MapPin, Phone, MessageCircle, Share2, Check,
  Package, Home, Cross, Droplet, Utensils, Wifi, HelpCircle, Building2,
} from 'lucide-react'
import { NextSeo } from 'next-seo'

/* ---------- constantes ---------- */
const ZONAS = ['Distrito Capital', 'Miranda', 'La Guaira']
const URGENCIAS = { alta: { label: 'Alta', color: '#e11d48' }, media: { label: 'Media', color: '#F5A623' }, baja: { label: 'Baja', color: '#10b981' } }
const ESTADOS = {
  abierto:   { label: 'Abierto',   color: '#1a237e', icon: PackageOpen },
  en_camino: { label: 'En camino', color: '#F5A623', icon: Truck },
  resuelto:  { label: 'Resuelto',  color: '#10b981', icon: CheckCircle2 },
}
const CATS = {
  acopio:   { label: 'Acopio',   color: '#1a237e', icon: Package },
  refugio:  { label: 'Refugio',  color: '#7c3aed', icon: Home },
  hospital: { label: 'Hospital', color: '#e11d48', icon: Cross },
  agua:     { label: 'Agua',     color: '#0ea5e9', icon: Droplet },
  comida:   { label: 'Comida',   color: '#F5A623', icon: Utensils },
  internet: { label: 'Internet', color: '#10b981', icon: Wifi },
  otro:     { label: 'Otro',     color: '#64748b', icon: HelpCircle },
}
const catInfo = (c) => CATS[c] || CATS.otro
const fold = (s = '') => s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const hace = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'ahora'; if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60); if (h < 24) return `hace ${h} h`; return `hace ${Math.floor(h / 24)} d`
}
const FORM0 = { centro_id: null, centro_nombre: '', tipo: 'necesito', recurso: '', cantidad: '', urgencia: 'media', descripcion: '', state: 'Distrito Capital', city: '', contact: '' }

/* Lee los params reales del navegador (cliente). Devuelve {} en SSR. */
function leerParams() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  return { tab: p.get('tab'), zona: p.get('zona'), cat: p.get('cat'), s: p.get('s'), chat: p.get('chat') }
}
/* Actualiza la URL sin recargar */
function setUrlParam(key, value) {
  if (typeof window === 'undefined') return
  const p = new URLSearchParams(window.location.search)
  if (value == null) p.delete(key); else p.set(key, value)
  const qs = p.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? '?' + qs : ''}`)
}
async function compartir({ url, title, text }) {
  try { if (navigator.share) { await navigator.share({ title, text, url }); return 'shared' } } catch { return 'cancel' }
  try { await navigator.clipboard.writeText(url); return 'copied' } catch { return 'fail' }
}

/* ============================== PÁGINA ============================== */
export default function RedPage() {
  const [tab, setTab] = useState('centros')
  const [centros, setCentros] = useState([])
  const [neces, setNeces] = useState([])
  const [loadingC, setLoadingC] = useState(true)
  const [loadingN, setLoadingN] = useState(true)
  const [error, setError] = useState('')
  const [chat, setChat] = useState(null)
  const [form, setForm] = useState(null)
  const [formCentro, setFormCentro] = useState(false)

  // params aplicados tras montar
  const [initZona, setInitZona] = useState('todas')
  const [initCat, setInitCat] = useState('todas')
  const [highlight, setHighlight] = useState(null)
  const [pendingChat, setPendingChat] = useState(null)
  const [ready, setReady] = useState(false)

  const cargarCentros = useCallback(async () => {
    setLoadingC(true)
    try { setCentros(await cargarCentrosApi()) } catch (e) { setError(e.message) } finally { setLoadingC(false) }
  }, [])
  const cargarNeces = useCallback(async () => {
    setLoadingN(true)
    try { setNeces(await cargarNecesidadesApi()) } catch (e) { setError(e.message) } finally { setLoadingN(false) }
  }, [])

  useEffect(() => { cargarCentros(); cargarNeces() }, [cargarCentros, cargarNeces])
  useEffect(() => suscribirNecesidades(cargarNeces), [cargarNeces])

  // === Lee los params UNA vez, ya montado en el cliente ===
  useEffect(() => {
    const { tab: t, zona, cat, s, chat: chatId } = leerParams()
    if (zona && ZONAS.includes(zona)) setInitZona(zona)
    if (cat && CATS[cat]) setInitCat(cat)
    if (s) setHighlight(s)
    if (chatId) setPendingChat(chatId)
    // tab: explícito, o implícito si viene s/chat
    if (t === 'solicitudes' || s || chatId) setTab('solicitudes')
    else if (t === 'centros') setTab('centros')
    setReady(true)
  }, [])

  // Cuando cargan las necesidades, si venía ?chat=ID abre ese chat
  useEffect(() => {
    if (!pendingChat || !neces.length) return
    const n = neces.find((x) => x.id === pendingChat)
    if (n) { setChat(n); setPendingChat(null) }
  }, [pendingChat, neces])

  const cambiarTab = useCallback((t) => { setTab(t); setUrlParam('tab', t) }, [])

  function abrirForm(centro) {
    if (centro) setForm({ ...FORM0, centro_id: centro.id, centro_nombre: centro.title, state: centro.state || 'Distrito Capital', city: centro.city || '' })
    else setForm({ ...FORM0 })
    cambiarTab('solicitudes')
  }

  async function responder(id) {
    const quien = prompt('¿Qué centro/persona va a ayudar?'); if (!quien) return
    try { await responderNecesidadApi(id, quien) } catch (e) { alert(e.message) }
  }
  async function resolver(id) { if (!confirm('¿Marcar como resuelto?')) return; try { await resolverNecesidadApi(id) } catch (e) { alert(e.message) } }
  async function reabrir(id) { try { await reabrirNecesidadApi(id) } catch (e) { alert(e.message) } }

  const stats = useMemo(() => ({
    abierto: neces.filter((i) => i.estado === 'abierto').length,
    en_camino: neces.filter((i) => i.estado === 'en_camino').length,
    urgentes: neces.filter((i) => i.estado !== 'resuelto' && i.urgencia === 'alta').length,
  }), [neces])

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <style>{`.no-sb::-webkit-scrollbar{display:none}.no-sb{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes flash { 0%,100%{background:#fff} 30%{background:#fff7e6} } .flash{animation:flash 2s ease}`}</style>
      <NextSeo title={`Red de Centros de Acopio · Comunicación y recursos | ${process.env.NEXT_PUBLIC_SITE_TITLE}`} />

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto max-w-2xl px-4 pb-0 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5A623]/15"><HandHeart className="h-5 w-5 text-[#F5A623]" /></div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-extrabold leading-tight text-[#1a237e]">Red de Emergencia — Sismo</h1>
              <p className="text-xs text-slate-500">{centros.length} centros · {stats.abierto} solicitudes abiertas{stats.urgentes > 0 && <span className="font-bold text-rose-600"> · {stats.urgentes} urgentes</span>}</p>
            </div>
            <button onClick={() => { cargarCentros(); cargarNeces() }} aria-label="Actualizar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 active:bg-slate-100"><RefreshCw className={`h-4 w-4 ${(loadingC || loadingN) ? 'animate-spin' : ''}`} /></button>
          </div>
          <div className="mt-3 flex gap-1">
            <TabBtn active={tab === 'centros'} onClick={() => cambiarTab('centros')} icon={Building2} label={`Centros (${centros.length})`} />
            <TabBtn active={tab === 'solicitudes'} onClick={() => cambiarTab('solicitudes')} icon={HandHeart} label={`Solicitudes (${stats.abierto + stats.en_camino})`} />
          </div>
        </div>
      </header>

      {error && <div className="mx-auto mt-3 max-w-2xl px-4"><div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div></div>}

      {tab === 'centros'
        ? <TabCentros centros={centros} loading={loadingC} onPedir={abrirForm} onAgregarCentro={() => setFormCentro(true)} initZona={initZona} initCat={initCat} ready={ready} />
        : <TabSolicitudes neces={neces} loading={loadingN} onResponder={responder} onResolver={resolver} onReabrir={reabrir} onChat={setChat} onNueva={() => abrirForm(null)} initZona={initZona} ready={ready} highlight={highlight} clearHighlight={() => setHighlight(null)} />}

      {form && <FormNueva initial={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); cargarNeces(); cambiarTab('solicitudes') }} />}
      {formCentro && <FormCentro onClose={() => setFormCentro(false)} onSaved={() => { setFormCentro(false); cargarCentros() }} />}
      {chat && <ChatNecesidad necesidad={chat} onClose={() => { setChat(null); cargarNeces() }} />}
    </div>
  )
}

/* ---------- UI compartida ---------- */
function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className={`flex flex-1 items-center justify-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-bold transition ${active ? 'border-[#1a237e] text-[#1a237e]' : 'border-transparent text-slate-400'}`}>
      <Icon className="h-4 w-4" />{label}
    </button>
  )
}
function Chip({ active, onClick, label, n, color }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${active ? 'border-transparent text-white' : 'border-slate-200 bg-white text-slate-600'}`} style={active ? { background: color || '#1a237e' } : {}}>
      {label}{typeof n === 'number' && <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{n}</span>}
    </button>
  )
}
function BotonCompartir({ url, title, text, className = '' }) {
  const [ok, setOk] = useState(false)
  async function go() {
    const r = await compartir({ url, title, text })
    if (r === 'copied' || r === 'shared') { setOk(true); setTimeout(() => setOk(false), 1800) }
  }
  return (
    <button onClick={go} className={`flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 active:bg-slate-100 ${className}`}>
      {ok ? <><Check className="h-4 w-4 text-emerald-600" /> Copiado</> : <><Share2 className="h-4 w-4" /> Compartir</>}
    </button>
  )
}

/* ============================== PESTAÑA CENTROS ============================== */
function TabCentros({ centros, loading, onPedir, onAgregarCentro, initZona, initCat, ready }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('todas')
  const [zona, setZona] = useState('todas')

  // aplica los filtros que venían en la URL, una vez listos
  useEffect(() => { if (ready) { setCat(initCat); setZona(initZona) } }, [ready, initCat, initZona])

  const cats = useMemo(() => {
    const m = new Map()
    for (const c of centros) m.set(c.category || 'otro', (m.get(c.category || 'otro') || 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [centros])

  const visibles = useMemo(() => {
    const fq = fold(q)
    return centros
      .filter((c) => cat === 'todas' ? true : (c.category || 'otro') === cat)
      .filter((c) => zona === 'todas' ? true : c.state === zona)
      .filter((c) => fq ? fold([c.title, c.description, c.city, c.state].join(' ')).includes(fq) : true)
  }, [centros, q, cat, zona])

  return (
    <>
      <div className="sticky top-[112px] z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} inputMode="search" placeholder="Buscar centro, zona o ciudad…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-base outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-5 w-5" /></button>}
          </div>
          <div className="no-sb -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4">
            <Chip active={cat === 'todas'} onClick={() => setCat('todas')} label="Todas" n={centros.length} />
            {cats.map(([c, n]) => <Chip key={c} active={cat === c} onClick={() => setCat(c)} label={catInfo(c).label} n={n} color={catInfo(c).color} />)}
          </div>
          <div className="no-sb -mx-4 mt-1.5 flex gap-1.5 overflow-x-auto px-4">
            <Chip active={zona === 'todas'} onClick={() => setZona('todas')} label="Toda zona" />
            {ZONAS.map((z) => <Chip key={z} active={zona === z} onClick={() => setZona(z)} label={z} />)}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-3 pb-28">
        {loading && !centros.length && <div className="flex flex-col items-center gap-2 py-20 text-slate-400"><Loader2 className="h-7 w-7 animate-spin" /><p className="text-sm">Cargando…</p></div>}
        {!loading && visibles.length === 0 && <div className="flex flex-col items-center gap-2 py-20 text-center text-slate-400"><MapPin className="h-9 w-9" /><p className="text-sm font-medium">No se encontró ningún centro.</p></div>}
        {visibles.length > 0 && <p className="mb-2 px-1 text-xs font-semibold text-slate-500">{visibles.length} centros</p>}
        <div className="space-y-2">
          {visibles.map((c) => <CentroCard key={c.id} c={c} onPedir={() => onPedir(c)} />)}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}>
        <div className="mx-auto max-w-2xl">
          <button onClick={onAgregarCentro} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a237e] py-3.5 text-base font-bold text-white shadow-lg active:bg-[#1a237e]/90"><Plus className="h-5 w-5" /> Agregar mi centro de acopio</button>
        </div>
      </div>
    </>
  )
}

function CentroCard({ c, onPedir }) {
  const info = catInfo(c.category)
  const Icon = info.icon
  const tel = c.contact && /\d/.test(c.contact) ? c.contact.replace(/[^\d+]/g, '') : null
  const mapsUrl = (c.lat != null && c.lng != null)
    ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.title, c.city, c.state, 'Venezuela'].filter(Boolean).join(' '))}`
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm" style={{ borderLeft: `4px solid ${info.color}` }}>
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: info.color + '18' }}><Icon className="h-5 w-5" style={{ color: info.color }} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-[#1a237e]">{c.title}</h3>
            <span className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ background: info.color + '18', color: info.color }}>{info.label}</span>
          </div>
          {(c.city || c.state) && <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{[c.city, c.state].filter(Boolean).join(', ')}</div>}
          {c.description && <p className="mt-1 text-sm text-slate-600">{c.description}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={onPedir} className="inline-flex items-center gap-1 rounded-lg bg-[#1a237e] px-2.5 py-1.5 text-xs font-bold text-white active:bg-[#1a237e]/90"><Plus className="h-3.5 w-3.5" />Pedir / ofrecer</button>
            {tel && <a href={`tel:${tel}`} className="inline-flex items-center gap-1 rounded-lg bg-[#1a237e]/5 px-2.5 py-1.5 text-xs font-bold text-[#1a237e] active:bg-[#1a237e]/10"><Phone className="h-3.5 w-3.5" />{c.contact}</a>}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-[#F5A623]/15 px-2.5 py-1.5 text-xs font-bold text-[#9a6207] active:bg-[#F5A623]/25"><MapPin className="h-3.5 w-3.5" />Mapa</a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================== PESTAÑA SOLICITUDES ============================== */
function TabSolicitudes({ neces, loading, onResponder, onResolver, onReabrir, onChat, onNueva, initZona, ready, highlight, clearHighlight }) {
  const [q, setQ] = useState('')
  const [fEstado, setFEstado] = useState('activos')
  const [fZona, setFZona] = useState('todas')

  useEffect(() => { if (ready) setFZona(initZona) }, [ready, initZona])

  const visibles = useMemo(() => {
    const fq = fold(q)
    return neces
      .filter((i) => fEstado === 'todos' ? true : fEstado === 'activos' ? i.estado !== 'resuelto' : i.estado === fEstado)
      .filter((i) => fZona === 'todas' ? true : i.state === fZona)
      .filter((i) => fq ? fold([i.centro_nombre, i.recurso, i.descripcion, i.city].join(' ')).includes(fq) : true)
      .sort((a, b) => {
        const o = { alta: 0, media: 1, baja: 2 }
        if (a.estado !== 'resuelto' && b.estado !== 'resuelto') return (o[a.urgencia] - o[b.urgencia]) || (new Date(b.created_at) - new Date(a.created_at))
        return new Date(b.created_at) - new Date(a.created_at)
      })
  }, [neces, q, fEstado, fZona])

  const refHL = useRef(null)
  useEffect(() => {
    if (!highlight) return
    const t = setTimeout(() => {
      refHL.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => clearHighlight?.(), 2200)
    }, 350)
    return () => clearTimeout(t)
  }, [highlight, visibles, clearHighlight])

  return (
    <>
      <div className="sticky top-[112px] z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} inputMode="search" placeholder="Buscar recurso o centro…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-base outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-5 w-5" /></button>}
          </div>
          <div className="no-sb -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4">
            <Chip active={fEstado === 'activos'} onClick={() => setFEstado('activos')} label="Activas" />
            <Chip active={fEstado === 'abierto'} onClick={() => setFEstado('abierto')} label="Abiertas" />
            <Chip active={fEstado === 'en_camino'} onClick={() => setFEstado('en_camino')} label="En camino" />
            <Chip active={fEstado === 'resuelto'} onClick={() => setFEstado('resuelto')} label="Resueltas" />
            <span className="w-px shrink-0 bg-slate-200" />
            <Chip active={fZona === 'todas'} onClick={() => setFZona('todas')} label="Toda zona" />
            {ZONAS.map((z) => <Chip key={z} active={fZona === z} onClick={() => setFZona(z)} label={z} />)}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-3 pb-28">
        {loading && !neces.length && <div className="flex flex-col items-center gap-2 py-20 text-slate-400"><Loader2 className="h-7 w-7 animate-spin" /><p className="text-sm">Cargando…</p></div>}
        {!loading && visibles.length === 0 && <div className="flex flex-col items-center gap-2 py-20 text-center text-slate-400"><PackageOpen className="h-9 w-9" /><p className="text-sm font-medium">No hay solicitudes aquí.</p><p className="text-xs">Pulsa el botón de abajo para publicar la primera.</p></div>}
        <div className="space-y-2.5">
          {visibles.map((it) => (
            <div key={it.id} ref={highlight === it.id ? refHL : null}>
              <NecesCard it={it} resaltada={highlight === it.id} onResponder={onResponder} onResolver={onResolver} onReabrir={onReabrir} onChat={() => onChat(it)} />
            </div>
          ))}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}>
        <div className="mx-auto max-w-2xl">
          <button onClick={onNueva} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a237e] py-3.5 text-base font-bold text-white shadow-lg active:bg-[#1a237e]/90"><Plus className="h-5 w-5" /> Pedir / ofrecer recurso</button>
        </div>
      </div>
    </>
  )
}

function NecesCard({ it, resaltada, onResponder, onResolver, onReabrir, onChat }) {
  const urg = URGENCIAS[it.urgencia] || URGENCIAS.media
  const est = ESTADOS[it.estado] || ESTADOS.abierto
  const EstIcon = est.icon
  const esOferta = it.tipo === 'ofrezco'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.integrateucv.com'
  const shareUrl = `${baseUrl}/red?tab=solicitudes&s=${it.id}`
  const shareText = `${esOferta ? 'OFRECE' : 'NECESITA'}: ${it.recurso}${it.cantidad ? ' · ' + it.cantidad : ''} — ${it.centro_nombre}`
  return (
    <div className={`rounded-xl border bg-white p-3.5 shadow-sm ${resaltada ? 'flash ring-2 ring-[#F5A623]' : ''} ${it.estado === 'resuelto' ? 'opacity-60' : ''}`} style={{ borderLeft: `4px solid ${esOferta ? '#10b981' : urg.color}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${esOferta ? 'bg-emerald-100 text-emerald-700' : 'bg-[#1a237e]/10 text-[#1a237e]'}`}>{esOferta ? 'OFRECE' : 'NECESITA'}</span>
            {it.estado !== 'resuelto' && <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: urg.color }}>{urg.label}</span>}
          </div>
          <h3 className="mt-1 text-base font-extrabold text-slate-900">{it.recurso}{it.cantidad && <span className="font-bold text-slate-500"> · {it.cantidad}</span>}</h3>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: est.color + '18', color: est.color }}><EstIcon className="h-3 w-3" />{est.label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-[#1a237e]">{it.centro_nombre}</div>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
        {(it.city || it.state) && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{[it.city, it.state].filter(Boolean).join(', ')}</span>}
        <span>{hace(it.created_at)}</span>
      </div>
      {it.descripcion && <p className="mt-1.5 text-sm text-slate-600">{it.descripcion}</p>}
      {it.contact && <a href={`tel:${it.contact}`} className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-[#1a237e]"><Phone className="h-3.5 w-3.5" />{it.contact}</a>}
      {it.respondido_por && it.estado !== 'resuelto' && <p className="mt-1.5 text-xs font-semibold text-amber-600">🚚 Apoya: {it.respondido_por}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={onChat} className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1a237e]/20 bg-[#1a237e]/5 px-3 py-2 text-sm font-bold text-[#1a237e] active:bg-[#1a237e]/10">
          <MessageCircle className="h-4 w-4" /> Chat{it.mensajes_count > 0 && <span className="rounded-full bg-[#1a237e] px-1.5 text-[10px] text-white">{it.mensajes_count}</span>}
        </button>
        <BotonCompartir url={shareUrl} title="Solicitud — Red de Centros" text={shareText} />
        {it.estado === 'abierto' && <button onClick={() => onResponder(it.id)} className="flex-1 rounded-lg bg-[#F5A623] py-2 text-sm font-bold text-white active:opacity-90">Yo ayudo</button>}
        {it.estado !== 'resuelto' && <button onClick={() => onResolver(it.id)} className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white active:opacity-90">Resuelto</button>}
        {it.estado === 'resuelto' && <button onClick={() => onReabrir(it.id)} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-bold text-slate-500">Reabrir</button>}
      </div>
    </div>
  )
}

/* ============================== FORM AGREGAR CENTRO ============================== */
function FormCentro({ onClose, onSaved }) {
  const [f, setF] = useState({ title: '', category: 'acopio', description: '', state: 'Distrito Capital', city: '', contact: '', address: '', lat: null, lng: null })
  const [saving, setSaving] = useState(false)
  const [geoStatus, setGeoStatus] = useState('') // '', 'ok', 'gps', 'error'
  const [sugs, setSugs] = useState([])           // sugerencias de Photon
  const [buscando, setBuscando] = useState(false)
  const [abierto, setAbierto] = useState(false)  // dropdown visible
  const skipRef = useRef(false)                   // evita re-buscar al elegir una sugerencia
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base outline-none focus:border-[#F5A623] focus:bg-white focus:ring-2 focus:ring-[#F5A623]/20'
  const label = 'mb-1.5 block text-sm font-bold text-[#1a237e]'

  /* Autocomplete con Photon (OpenStreetMap, gratis, sin API key).
     Photon NO soporta 'es' (solo default/de/en/fr) -> usamos 'default'.
     Si Photon falla, cae a Nominatim. Debounce 350 ms, sesgo a Caracas. */
  useEffect(() => {
    if (skipRef.current) { skipRef.current = false; return }
    const q = f.address.trim()
    if (q.length < 4) { setSugs([]); return }
    setBuscando(true)
    const t = setTimeout(async () => {
      let items = []
      // 1) Photon (sin lang=es)
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q + ', Venezuela')}&lat=10.49&lon=-66.88&limit=6`
        const r = await fetch(url)
        if (r.ok) {
          const data = await r.json()
          items = (data.features || []).map((ft) => {
            const p = ft.properties || {}
            const linea = [p.name, p.street, p.city || p.county, p.state].filter(Boolean).join(', ')
            return { label: linea || p.name || 'Sin nombre', lat: ft.geometry.coordinates[1], lng: ft.geometry.coordinates[0], city: p.city || p.county || '', state: p.state || '' }
          }).filter((x) => x.label)
        }
      } catch { /* sigue al fallback */ }

      // 2) Fallback: Nominatim si Photon no trajo nada
      if (items.length === 0) {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&accept-language=es&q=${encodeURIComponent(q + ', Venezuela')}`
          const r = await fetch(url)
          if (r.ok) {
            const data = await r.json()
            items = (data || []).map((d) => {
              const a = d.address || {}
              const ciudad = a.city || a.town || a.village || a.county || ''
              return { label: d.display_name?.split(',').slice(0, 3).join(', ') || d.display_name, lat: parseFloat(d.lat), lng: parseFloat(d.lon), city: ciudad, state: a.state || '' }
            }).filter((x) => x.label)
          }
        } catch { /* nada */ }
      }

      setSugs(items); setAbierto(true); setBuscando(false)
    }, 350)
    return () => clearTimeout(t)
  }, [f.address])

  function elegirSug(s) {
    skipRef.current = true // no dispares otra búsqueda por este cambio
    setF((p) => ({
      ...p,
      address: s.label,
      lat: s.lat, lng: s.lng,
      city: p.city || s.city || p.city,
    }))
    setSugs([]); setAbierto(false); setGeoStatus('ok')
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return alert('Tu dispositivo no permite ubicación.')
    setGeoStatus('')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setF((p) => ({ ...p, lat: pos.coords.latitude, lng: pos.coords.longitude })); setGeoStatus('gps'); setAbierto(false) },
      () => { setGeoStatus('error'); alert('No se pudo obtener la ubicación. Activa el GPS y permite el acceso.') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function enviar() {
    if (!f.title.trim()) return alert('Indica el nombre del centro.')
    setSaving(true)
    try {
      await crearCentroApi({
        title: f.title.trim(),
        category: f.category,
        description: [f.address, f.description].filter(Boolean).join(' — ') || null,
        city: f.city, state: f.state, contact: f.contact,
        lat: f.lat, lng: f.lng,
      })
      onSaved()
    } catch (e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-xl px-4 pb-10" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.25rem)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1a237e]">Agregar centro de acopio</h2>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-[#F5A623]/10 px-3 py-2 text-xs font-medium text-[#9a6207]">Registra tu universidad u organización para que aparezca en la red y puedas pedir/ofrecer recursos.</div>
          <div><label className={label}>Nombre del centro *</label><input value={f.title} onChange={(e) => set('title', e.target.value)} className={input} placeholder="Ej. UCV - Facultad de Ciencias" /></div>
          <div>
            <label className={label}>Tipo</label>
            <select value={f.category} onChange={(e) => set('category', e.target.value)} className={input}>
              <option value="acopio">Acopio</option>
              <option value="refugio">Refugio</option>
              <option value="hospital">Hospital / Salud</option>
              <option value="agua">Agua</option>
              <option value="comida">Comida</option>
              <option value="internet">Internet</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Estado</label><select value={f.state} onChange={(e) => set('state', e.target.value)} className={input}>{ZONAS.map((z) => <option key={z}>{z}</option>)}</select></div>
            <div><label className={label}>Ciudad / zona</label><input value={f.city} onChange={(e) => set('city', e.target.value)} className={input} placeholder="Chacao, Catia…" /></div>
          </div>

          {/* Dirección con autocompletado (Photon) */}
          <div className="relative">
            <label className={label}>Dirección</label>
            <div className="relative">
              <input
                value={f.address}
                onChange={(e) => { set('address', e.target.value); setGeoStatus(''); set('lat', null); set('lng', null) }}
                onFocus={() => sugs.length && setAbierto(true)}
                className={input}
                placeholder="Empieza a escribir la dirección…"
                autoComplete="off"
              />
              {buscando && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
            </div>

            {/* dropdown de sugerencias */}
            {abierto && sugs.length > 0 && (
              <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {sugs.map((s, i) => (
                  <button key={i} onClick={() => elegirSug(s)} className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 active:bg-slate-50">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
                    <span className="text-sm text-slate-700">{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={usarMiUbicacion} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5A623]/15 px-3 py-2 text-xs font-bold text-[#9a6207] active:bg-[#F5A623]/25">
                <MapPin className="h-3.5 w-3.5" /> Usar mi ubicación
              </button>
            </div>

            {geoStatus === 'ok' && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" /> Dirección ubicada en el mapa</p>}
            {geoStatus === 'gps' && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" /> Ubicación tomada del GPS</p>}
            {geoStatus === 'error' && <p className="mt-2 text-xs font-semibold text-rose-600">No se pudo ubicar. Prueba con más detalle o usa tu ubicación.</p>}
            {f.lat != null && f.lng != null && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}`} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#1a237e] underline">
                Ver punto exacto en Google Maps
              </a>
            )}
          </div>

          <div><label className={label}>Detalles / horario</label><textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={2} className={input + ' resize-none'} placeholder="Horario de atención, qué reciben…" /></div>
          <div><label className={label}>Contacto</label><input value={f.contact} onChange={(e) => set('contact', e.target.value)} className={input} placeholder="Teléfono o WhatsApp" /></div>
          <button onClick={enviar} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a237e] py-3.5 text-base font-bold text-white active:bg-[#1a237e]/90 disabled:opacity-60">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Registrar centro'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================== FORMULARIO ============================== */
function FormNueva({ initial, onClose, onSaved }) {
  const [f, setF] = useState(initial)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base outline-none focus:border-[#F5A623] focus:bg-white focus:ring-2 focus:ring-[#F5A623]/20'
  const label = 'mb-1.5 block text-sm font-bold text-[#1a237e]'

  async function enviar() {
    if (!f.centro_nombre.trim()) return alert('Indica el nombre del centro.')
    if (!f.recurso.trim()) return alert('Indica el recurso.')
    setSaving(true)
    try { await crearNecesidadApi({ ...f, centro_nombre: f.centro_nombre.trim(), recurso: f.recurso.trim() }); onSaved() }
    catch (e) { alert('Error: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-xl px-4 pb-10" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.25rem)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1a237e]">Publicar solicitud</h2>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {f.centro_id && <div className="rounded-lg bg-[#1a237e]/5 px-3 py-2 text-sm font-semibold text-[#1a237e]">Desde: {f.centro_nombre}</div>}
          <div>
            <label className={label}>¿Qué es?</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => set('tipo', 'necesito')} className={`rounded-xl border-2 py-3 text-sm font-bold ${f.tipo === 'necesito' ? 'border-[#1a237e] bg-[#1a237e]/5 text-[#1a237e]' : 'border-slate-200 text-slate-500'}`}>Necesito</button>
              <button onClick={() => set('tipo', 'ofrezco')} className={`rounded-xl border-2 py-3 text-sm font-bold ${f.tipo === 'ofrezco' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>Ofrezco</button>
            </div>
          </div>
          <div><label className={label}>Nombre del centro *</label><input value={f.centro_nombre} onChange={(e) => set('centro_nombre', e.target.value)} className={input} placeholder="Ej. Refugio Plaza Altamira" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Recurso *</label><input value={f.recurso} onChange={(e) => set('recurso', e.target.value)} className={input} placeholder="Agua, gasas, pañales…" /></div>
            <div><label className={label}>Cantidad</label><input value={f.cantidad} onChange={(e) => set('cantidad', e.target.value)} className={input} placeholder="200 L, 10 cajas…" /></div>
          </div>
          <div>
            <label className={label}>Urgencia</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(URGENCIAS).map(([k, v]) => <button key={k} onClick={() => set('urgencia', k)} className={`rounded-xl border-2 py-2.5 text-sm font-bold ${f.urgencia === k ? 'text-white' : 'border-slate-200 text-slate-500'}`} style={f.urgencia === k ? { background: v.color, borderColor: v.color } : {}}>{v.label}</button>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Estado</label><select value={f.state} onChange={(e) => set('state', e.target.value)} className={input}>{ZONAS.map((z) => <option key={z}>{z}</option>)}</select></div>
            <div><label className={label}>Ciudad / zona</label><input value={f.city} onChange={(e) => set('city', e.target.value)} className={input} placeholder="Chacao, Catia…" /></div>
          </div>
          <div><label className={label}>Detalles</label><textarea value={f.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={2} className={input + ' resize-none'} placeholder="Lo que haga falta aclarar" /></div>
          <div><label className={label}>Contacto</label><input value={f.contact} onChange={(e) => set('contact', e.target.value)} className={input} placeholder="Teléfono o WhatsApp" /></div>
          <button onClick={enviar} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a237e] py-3.5 text-base font-bold text-white active:bg-[#1a237e]/90 disabled:opacity-60">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}