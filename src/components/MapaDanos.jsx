'use client'

/**
 * MapaDanos — Reporte de edificios dañados (Sismo Caracas / La Guaira)
 * MOBILE-FIRST. Leaflet puro + formulario completo + geocoding.
 *
 * Dependencia: npm install leaflet   (NO usa react-leaflet)
 * Cárgalo con ssr:false desde page.jsx.
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle, MapPin, X, Search, Crosshair, Download, Upload,
  Trash2, Building2, Camera, Pencil, Loader2, Plus, ChevronUp, ChevronDown,
} from 'lucide-react'
import { cargarReportesApi, crearReporteApi } from '@/lib/reportesApi'
/* ----------------------------- Colores / config ----------------------------- */
const GOLD = '#F5A623'
const STORAGE_KEY = 'reportes_danos_v2'

const NIVELES = {
  parcial: { label: 'Daño parcial', color: GOLD },
  severo:  { label: 'Daño severo',  color: '#f97316' },
  total:   { label: 'Daño total',   color: '#e11d48' },
}
const ORDEN = ['total', 'severo', 'parcial']
const ATRAPADOS = { si: { label: 'Sí' }, no: { label: 'No' }, nose: { label: 'No sé' } }

const ZONAS = {
  caracas:  { nombre: 'Caracas',   lat: 10.4806, lng: -66.9036, zoom: 12 },
  laguaira: { nombre: 'La Guaira', lat: 10.6010, lng: -66.9340, zoom: 13 },
}
const VISTA_INICIAL = { lat: 10.545, lng: -66.918, zoom: 11 }

const FORM_VACIO = {
  foto: '', nombre: '', direccion: '', ciudad: '', zona: '', tipo: '',
  nivel: 'parcial', atrapados: 'nose', descripcion: '', fuente: '', reportanteNombre: '', contacto: '',
}

/* ----------------------------- Helpers ----------------------------- */
function cargarReportes() {
  if (typeof window === 'undefined') return []
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function guardarLS(reportes) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reportes)) }
  catch { alert('Almacenamiento local lleno (por las fotos). Exporta a JSON o conecta el backend (Supabase).') }
}
const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const fechaCorta = (iso) => new Date(iso).toLocaleString('es-VE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function iconoNivel(nivel, urgente) {
  const color = NIVELES[nivel]?.color ?? '#94a3b8'
  const ring = urgente ? 'box-shadow:0 0 0 4px rgba(225,29,72,.4);animation:pulseDano 1.2s infinite;' : 'box-shadow:0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.3);'
  return L.divIcon({ className: '', html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;${ring}"></div>`, iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12] })
}

function comprimirImagen(file, maxDim = 1100, quality = 0.55) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim }
        const c = document.createElement('canvas'); c.width = width; c.height = height
        c.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(c.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject; img.src = reader.result
    }
    reader.onerror = reject; reader.readAsDataURL(file)
  })
}

async function buscarDireccion(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=ve&limit=6&accept-language=es&addressdetails=1`
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } })
    return r.ok ? r.json() : []
  } catch {
    return []
  }
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es&addressdetails=1`

  try {
    const r = await fetch(url)

    if (!r.ok) return null

    const d = await r.json()
    const a = d.address || {}

    return {
      direccion: d.display_name || '',
      ciudad: a.city || a.town || a.village || a.county || a.state || '',
      zona:
        a.suburb ||
        a.neighbourhood ||
        a.quarter ||
        a.city_district ||
        a.residential ||
        '',
    }
  } catch {
    return null
  }
}
function parseNominatim(item) {
  const a = item.address || {}
  return { lat: parseFloat(item.lat), lng: parseFloat(item.lon), direccion: item.display_name || '',
    ciudad: a.city || a.town || a.village || a.county || a.state || '', zona: a.suburb || a.neighbourhood || a.quarter || a.city_district || a.residential || '' }
}

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    const on = () => setM(mq.matches); on()
    mq.addEventListener('change', on); return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

/* ============================== PRINCIPAL ============================== */
export default function MapaDanos() {
  const isMobile = useIsMobile()
  const [reportes, setReportes] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [filtros, setFiltros] = useState(new Set(Object.keys(NIVELES)))
  const [soloUrgentes, setSoloUrgentes] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [panelOpen, setPanelOpen] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const [autofill, setAutofill] = useState(null)
  const fileImportRef = useRef(null)

  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersLayerRef = useRef(null)
  const draftMarkerRef = useRef(null)
  const handlersRef = useRef({})

  useEffect(() => { setReportes(cargarReportes()); setHydrated(true) }, [])
useEffect(() => {
  let mounted = true

  async function init() {
    try {
      const data = await cargarReportesApi()

      if (mounted) {
        setReportes(data)
      }
    } catch (err) {
      console.error(err)
      alert('No se pudieron cargar los reportes.')
    } finally {
      if (mounted) {
        setHydrated(true)
      }
    }
  }

  init()

  return () => {
    mounted = false
  }
}, [])
  // abierto en desktop, colapsado en móvil
  useEffect(() => { setPanelOpen(!isMobile) }, [isMobile])

  const stats = useMemo(() => {
    const s = { total: reportes.length, urgentes: 0, parcial: 0, severo: 0, totalN: 0 }
    for (const r of reportes) { if (r.nivel === 'total') s.totalN++; else s[r.nivel]++; if (r.atrapados === 'si') s.urgentes++ }
    return s
  }, [reportes])

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return reportes.filter((r) => filtros.has(r.nivel))
      .filter((r) => (soloUrgentes ? r.atrapados === 'si' : true))
      .filter((r) => (q ? [r.nombre, r.direccion, r.ciudad, r.zona, r.descripcion].join(' ').toLowerCase().includes(q) : true))
      .sort((a, b) => ORDEN.indexOf(a.nivel) - ORDEN.indexOf(b.nivel) || new Date(b.fecha) - new Date(a.fecha))
  }, [reportes, filtros, soloUrgentes, busqueda])

  function abrirFormVacio() { setCoords(null); setAutofill(null); setFormOpen(true) }
  async function abrirFormEnPunto(latlng) { setCoords(latlng); setAutofill(null); setFormOpen(true); const i = await reverseGeocode(latlng.lat, latlng.lng); if (i) setAutofill(i) }
  function reportarMiUbicacion() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return abrirFormVacio()
    navigator.geolocation.getCurrentPosition((p) => abrirFormEnPunto({ lat: p.coords.latitude, lng: p.coords.longitude }), () => abrirFormVacio(), { enableHighAccuracy: true, timeout: 8000 })
  }
async function onSubmitReporte(data) {
  try {
    const creado = await crearReporteApi(data)

    setReportes((prev) => [creado, ...prev])
    setFormOpen(false)
    setCoords(null)
    setAutofill(null)
  } catch (err) {
    console.error(err)
    alert('No se pudo enviar el reporte. Intenta nuevamente.')
  }
}
function eliminar(id) {
  alert('Por seguridad, el borrado público está desactivado. Luego hacemos un panel admin.')
}
  function toggleFiltro(n) { setFiltros((prev) => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s }) }
  function volarA(lat, lng, zoom = 17) { mapRef.current?.flyTo([lat, lng], zoom, { duration: 0.8 }); if (isMobile) setPanelOpen(false) }
  handlersRef.current.onMapClick = abrirFormEnPunto
  handlersRef.current.eliminar = eliminar

  useEffect(() => {
    if (!hydrated || mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false }).setView([VISTA_INICIAL.lat, VISTA_INICIAL.lng], VISTA_INICIAL.zoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    markersLayerRef.current = L.layerGroup().addTo(map)
    map.on('click', (e) => handlersRef.current.onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }))
    mapRef.current = map
    const fix = () => map.invalidateSize()
    setTimeout(fix, 200); setTimeout(fix, 600)
    window.addEventListener('resize', fix)
    return () => { window.removeEventListener('resize', fix); map.remove(); mapRef.current = null }
  }, [hydrated])

  useEffect(() => {
    const lg = markersLayerRef.current; if (!lg) return
    lg.clearLayers()
visibles.forEach((r) => {
  if (r.lat == null || r.lng == null) return

  const m = L.marker([r.lat, r.lng], { icon: iconoNivel(r.nivel, r.atrapados === 'si') })
      const el = document.createElement('div'); el.style.maxWidth = '220px'
      el.innerHTML = `
        ${r.foto ? `<img src="${r.foto}" style="width:100%;border-radius:8px;margin-bottom:6px;display:block" />` : ''}
        <div style="font-weight:700;color:#0f172a">${escapeHtml(r.nombre)}</div>
        <div style="display:flex;align-items:center;gap:4px;margin:4px 0;font-size:13px">
          <span style="width:10px;height:10px;border-radius:50%;background:${NIVELES[r.nivel].color};display:inline-block"></span>
          ${NIVELES[r.nivel].label}${r.atrapados === 'si' ? ' &middot; <b style="color:#e11d48">⚠ Atrapados</b>' : ''}
        </div>
        ${r.direccion ? `<div style="font-size:12px;color:#475569">📍 ${escapeHtml(r.direccion)}</div>` : ''}
        ${(r.ciudad || r.zona) ? `<div style="font-size:12px;color:#64748b">${escapeHtml([r.ciudad, r.zona].filter(Boolean).join(' · '))}</div>` : ''}
        ${r.tipo ? `<div style="font-size:12px;color:#64748b">🏢 ${escapeHtml(r.tipo)}</div>` : ''}
        ${r.descripcion ? `<div style="font-size:13px;color:#334155;margin-top:4px">${escapeHtml(r.descripcion)}</div>` : ''}
        ${r.fuente ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px">Fuente: ${escapeHtml(r.fuente)}</div>` : ''}
        <div style="font-size:11px;color:#94a3b8">${fechaCorta(r.fecha)}</div>
        <button data-del style="margin-top:6px;font-size:12px;color:#e11d48;font-weight:600;background:none;border:none;cursor:pointer;padding:0">🗑 Eliminar</button>`
      el.querySelector('[data-del]').addEventListener('click', () => handlersRef.current.eliminar(r.id))
      m.bindPopup(el, { maxWidth: 240 }); lg.addLayer(m)
    })
  }, [visibles])

  useEffect(() => {
    const map = mapRef.current; if (!map) return
    if (!coords) { if (draftMarkerRef.current) { map.removeLayer(draftMarkerRef.current); draftMarkerRef.current = null } return }
    if (!draftMarkerRef.current) draftMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: iconoNivel('parcial', false) }).addTo(map)
    else draftMarkerRef.current.setLatLng([coords.lat, coords.lng])
  }, [coords])

  useEffect(() => { const t = setTimeout(() => mapRef.current?.invalidateSize(), 320); return () => clearTimeout(t) }, [panelOpen])

  function descargar(blob, n) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = n; a.click(); URL.revokeObjectURL(url) }
  function exportarJSON() { descargar(new Blob([JSON.stringify(reportes, null, 2)], { type: 'application/json' }), `reportes-${Date.now()}.json`) }
  function exportarCSV() {
    const cols = ['nombre', 'direccion', 'ciudad', 'zona', 'tipo', 'nivel', 'atrapados', 'descripcion', 'fuente', 'reportanteNombre', 'contacto', 'lat', 'lng', 'fecha']
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    descargar(new Blob([[cols.join(','), ...reportes.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')], { type: 'text/csv' }), `reportes-${Date.now()}.csv`)
  }
  function importarJSON(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => { try { const data = JSON.parse(reader.result); if (!Array.isArray(data)) throw 0
      setReportes((prev) => { const map = new Map(prev.map((r) => [r.id, r])); for (const r of data) if (r && r.id) map.set(r.id, r); return [...map.values()] }); alert(`Importados ${data.length} reportes.`)
    } catch { alert('Archivo inválido.') } }
    reader.readAsText(file); e.target.value = ''
  }

  if (!hydrated) return <div className="flex h-[100dvh] w-full items-center justify-center bg-amber-50/30 text-sm font-semibold text-slate-500">Cargando mapa…</div>

  const numFmt = (n) => (n === 'total' ? stats.totalN : stats[n])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-white text-slate-900">
      <style>{`@keyframes pulseDano{0%{box-shadow:0 0 0 0 rgba(225,29,72,.55)}70%{box-shadow:0 0 0 12px rgba(225,29,72,0)}100%{box-shadow:0 0 0 0 rgba(225,29,72,0)}}.leaflet-container{font-family:inherit}.no-sb::-webkit-scrollbar{display:none}.no-sb{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* ---------------- Header (1 fila, scroll horizontal) ---------------- */}
      <header className="absolute inset-x-0 top-0 z-[1000] border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="no-sb flex items-center gap-2 overflow-x-auto px-3 py-2">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5A623]/15"><AlertTriangle className="h-4.5 w-4.5 text-[#F5A623]" /></div>
            <div className="leading-tight">
              <h1 className="text-sm font-extrabold text-[#1a237e]">Mapa de Daños</h1>
              <p className="text-[10px] font-semibold text-[#F5A623]">Caracas · La Guaira</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Total <b className="text-[#1a237e]">{stats.total}</b></span>
          {stats.urgentes > 0 && <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-600 px-2 py-1 text-xs font-bold text-white"><AlertTriangle className="h-3 w-3" />{stats.urgentes}</span>}
          {ORDEN.map((n) => (
            <span key={n} className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              <i className="inline-block h-2 w-2 rounded-full" style={{ background: NIVELES[n].color }} />{numFmt(n)}
            </span>
          ))}
          <span className="h-5 w-px shrink-0 bg-slate-200" />
          {Object.entries(ZONAS).map(([k, z]) => (
            <button key={k} onClick={() => volarA(z.lat, z.lng, z.zoom)} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#1a237e] px-2.5 py-1.5 text-xs font-bold text-white">
              <MapPin className="h-3.5 w-3.5" />{z.nombre}
            </button>
          ))}
          <button onClick={exportarJSON} title="Exportar JSON" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600"><Download className="h-4 w-4" /></button>
          <button onClick={exportarCSV} className="shrink-0 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600">CSV</button>
          <button onClick={() => fileImportRef.current?.click()} title="Importar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600"><Upload className="h-4 w-4" /></button>
          <input ref={fileImportRef} type="file" accept="application/json" onChange={importarJSON} className="hidden" />
        </div>
      </header>

      {/* ---------------- FAB ---------------- */}
      {!formOpen && !(isMobile && panelOpen) && (
        <div className="absolute right-3 z-[1000] flex flex-col items-end gap-2" style={{ bottom: isMobile ? 150 : 20 }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={abrirFormVacio} className="flex items-center gap-2 rounded-full bg-[#1a237e] px-5 py-3.5 text-sm font-bold text-white shadow-lg"><Plus className="h-5 w-5" /> Reportar edificio</motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={reportarMiUbicacion} className="flex items-center gap-2 rounded-full bg-[#F5A623] px-4 py-2.5 text-sm font-bold text-white shadow-lg"><Crosshair className="h-4 w-4" /> Mi ubicación</motion.button>
        </div>
      )}

      {/* ---------------- Panel: bottom-sheet (móvil) / lateral (desktop) ---------------- */}
      {isMobile ? (
        <motion.div animate={{ height: panelOpen ? '72dvh' : 128 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="absolute inset-x-0 bottom-0 z-[900] flex flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <button onClick={() => setPanelOpen((v) => !v)} className="flex flex-col items-center gap-1 pb-1 pt-2">
            <span className="h-1.5 w-10 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1 text-sm font-extrabold text-[#1a237e]">Reportes ({visibles.length}) {panelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</span>
          </button>
          <div className="px-3 pb-2"><FiltrosChips {...{ filtros, toggleFiltro, soloUrgentes, setSoloUrgentes }} /></div>
          {panelOpen && (
            <div className="flex flex-1 flex-col overflow-hidden border-t border-slate-100">
              <div className="p-3 pb-2"><Buscador {...{ busqueda, setBusqueda }} /></div>
              <div className="flex-1 overflow-y-auto"><Lista {...{ visibles, volarA, eliminar }} /></div>
            </div>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div animate={{ x: panelOpen ? 0 : '-100%' }} transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="absolute bottom-0 left-0 top-[53px] z-[900] flex w-80 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-lg">
            <div className="space-y-2 border-b border-slate-200 p-3"><Buscador {...{ busqueda, setBusqueda }} /><FiltrosChips {...{ filtros, toggleFiltro, soloUrgentes, setSoloUrgentes }} /></div>
            <div className="flex-1 overflow-y-auto"><Lista {...{ visibles, volarA, eliminar }} /></div>
          </motion.div>
          <button onClick={() => setPanelOpen((v) => !v)} className="absolute top-[64px] z-[950] flex h-10 w-7 items-center justify-center rounded-r-lg border border-l-0 border-slate-200 bg-white text-[#1a237e] shadow-sm" style={{ left: panelOpen ? 320 : 0 }}>
            {panelOpen ? '◀' : '▶'}
          </button>
        </>
      )}

      <AnimatePresence>
      {formOpen && <FormularioReporte coords={coords} setCoords={setCoords} autofill={autofill} onClose={() => { setFormOpen(false); setCoords(null); setAutofill(null) }} onSubmit={onSubmitReporte} />}
      </AnimatePresence>
    </div>
  )
}

/* ============================== PIEZAS REUTILIZABLES ============================== */
function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar en reportes…"
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20" />
    </div>
  )
}
function FiltrosChips({ filtros, toggleFiltro, soloUrgentes, setSoloUrgentes }) {
  return (
    <div className="no-sb flex gap-1.5 overflow-x-auto">
      {ORDEN.map((n) => (
        <button key={n} onClick={() => toggleFiltro(n)}
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-bold ${filtros.has(n) ? 'border-transparent text-slate-700' : 'border-slate-200 text-slate-400 opacity-60'}`}
          style={{ background: filtros.has(n) ? NIVELES[n].color + '22' : '#fff' }}>
          <i className="inline-block h-2 w-2 rounded-full" style={{ background: NIVELES[n].color }} />{NIVELES[n].label}
        </button>
      ))}
      <button onClick={() => setSoloUrgentes((v) => !v)} className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-bold ${soloUrgentes ? 'border-transparent bg-rose-600 text-white' : 'border-slate-200 text-slate-500'}`}>
        <AlertTriangle className="h-3 w-3" /> Atrapados
      </button>
    </div>
  )
}
function Lista({ visibles, volarA, eliminar }) {
  if (visibles.length === 0) return <div className="flex flex-col items-center gap-2 p-8 text-center text-slate-400"><Building2 className="h-8 w-8" /><p className="text-sm font-medium">Sin reportes todavía.</p></div>
  return visibles.map((r) => (
    <div key={r.id} className="flex items-start gap-2 border-b border-slate-100 px-3 py-3 active:bg-amber-50/60">
   <button
  onClick={() => {
    if (r.lat == null || r.lng == null) {
      alert('Este reporte no tiene ubicación exacta en el mapa.')
      return
    }

    volarA(r.lat, r.lng)
  }}
  className="flex min-w-0 flex-1 gap-2 text-left"
>
        {r.foto ? <img src={r.foto} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" /> : <i className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: NIVELES[r.nivel].color }} />}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-[#1a237e]">{r.nombre} {r.atrapados === 'si' && <span className="text-rose-500">⚠</span>}</div>
          {(r.ciudad || r.zona) && <div className="truncate text-xs text-slate-500">{[r.ciudad, r.zona].filter(Boolean).join(' · ')}</div>}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400"><i className="inline-block h-2 w-2 rounded-full" style={{ background: NIVELES[r.nivel].color }} />{NIVELES[r.nivel].label} · {fechaCorta(r.fecha)}</div>
        </div>
      </button>
      <button onClick={() => eliminar(r.id)} className="mt-0.5 shrink-0 p-1 text-slate-300 active:text-rose-600"><Trash2 className="h-4 w-4" /></button>
    </div>
  ))
}

/* ============================== FORMULARIO ============================== */
function FormularioReporte({ coords, setCoords, autofill, onClose, onSubmit }) {
  const [f, setF] = useState(FORM_VACIO)
  const [manual, setManual] = useState(false)
  const [query, setQuery] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => { if (autofill) setF((p) => ({ ...p, direccion: autofill.direccion || p.direccion, ciudad: autofill.ciudad || p.ciudad, zona: autofill.zona || p.zona })) }, [autofill])

  useEffect(() => {
    if (manual || query.trim().length < 3) { setSugerencias([]); return }
    setBuscando(true)
    const t = setTimeout(async () => { setSugerencias(await buscarDireccion(query) || []); setBuscando(false) }, 500)
    return () => clearTimeout(t)
  }, [query, manual])

  function elegirSugerencia(item) {
    const p = parseNominatim(item); setCoords({ lat: p.lat, lng: p.lng })
    setF((prev) => ({ ...prev, direccion: p.direccion, ciudad: p.ciudad || prev.ciudad, zona: p.zona || prev.zona }))
    setQuery(p.direccion); setSugerencias([])
  }
function usarMiUbicacion() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    alert('Tu navegador no permite obtener la ubicación.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const c = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }

      if (typeof setCoords === 'function') {
        setCoords(c)
      }

      const i = await reverseGeocode(c.lat, c.lng)

      if (i) {
        setF((prev) => ({
          ...prev,
          direccion: i.direccion || prev.direccion,
          ciudad: i.ciudad || prev.ciudad,
          zona: i.zona || prev.zona,
        }))
      }
    },
    () => alert('No se pudo obtener tu ubicación. Puedes escribir la dirección manualmente.'),
    { enableHighAccuracy: true, timeout: 8000 }
  )
}
  async function onFoto(e) { const file = e.target.files?.[0]; if (!file) return; setSubiendoFoto(true); try { set('foto', await comprimirImagen(file)) } catch { alert('No se pudo procesar la foto.') } setSubiendoFoto(false); e.target.value = '' }
function enviar() {
  if (!f.nombre.trim()) return alert('Indica el nombre del edificio.')
  if (!f.ciudad.trim()) return alert('Indica la ciudad.')

  onSubmit({
    ...f,
    foto: f.foto || '',
    nombre: f.nombre.trim(),
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  })
}

  const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base outline-none focus:border-[#F5A623] focus:bg-white focus:ring-2 focus:ring-[#F5A623]/20'
  const label = 'mb-1.5 block text-sm font-bold text-[#1a237e]'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[1100] overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1a237e] sm:text-2xl">Reportar un edificio</h2>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <label className={label}>Foto del daño *</label>
            {f.foto ? (
              <div className="relative"><img src={f.foto} alt="" className="max-h-64 w-full rounded-xl object-cover" />
                <button onClick={() => set('foto', '')} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"><X className="h-4 w-4" /></button></div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-amber-50/40 px-4 py-10 text-center active:border-[#F5A623]">
                {subiendoFoto ? <Loader2 className="h-8 w-8 animate-spin text-slate-400" /> : <Camera className="h-8 w-8 text-slate-400" />}
<span className="text-sm text-slate-500">Opcional. Toma o sube una foto clara del edificio.</span>
                <input type="file" accept="image/*" capture="environment" onChange={onFoto} className="hidden" />
              </label>
            )}
          </div>

          <div><label className={label}>Nombre del edificio *</label><input value={f.nombre} onChange={(e) => set('nombre', e.target.value)} className={input} placeholder="Ej. Residencias El Ávila, Torre B" /></div>

          <div>
        <label className={label}>
  Dirección / referencia <span className="font-normal text-slate-400">(opcional)</span>
</label>
            {!manual ? (
              <div className="relative">
                <div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className={input + ' pl-9'} placeholder="Busca calle, edificio o referencia" />
                  {buscando && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}</div>
                {sugerencias.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {sugerencias.map((s) => <button key={s.place_id} onClick={() => elegirSugerencia(s)} className="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-xs text-slate-700 last:border-0 active:bg-amber-50">{s.display_name}</button>)}
                  </div>
                )}
              </div>
            ) : <input value={f.direccion} onChange={(e) => set('direccion', e.target.value)} className={input} placeholder="Escribe la dirección manualmente" />}
            <button onClick={() => { setManual((v) => !v); setSugerencias([]) }} className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#1a237e]"><Pencil className="h-3 w-3" /> {manual ? 'Volver al buscador' : 'No encuentro la dirección, escribirla manualmente'}</button>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <button onClick={usarMiUbicacion} className="flex items-center gap-1 rounded-lg bg-[#F5A623]/15 px-2.5 py-2 font-bold text-[#b9750f] active:bg-[#F5A623]/25"><Crosshair className="h-3.5 w-3.5" /> Usar mi ubicación</button>
<span className={`font-semibold ${coords ? 'text-emerald-600' : 'text-slate-400'}`}>
  {coords ? '✓ Ubicación fijada' : 'Ubicación exacta opcional'}
</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={label}>Ciudad *</label><input value={f.ciudad} onChange={(e) => set('ciudad', e.target.value)} className={input} placeholder="Caracas, La Guaira…" /></div>
            <div><label className={label}>Zona / parroquia / sector</label><input value={f.zona} onChange={(e) => set('zona', e.target.value)} className={input} placeholder="Chacao, Catia, Maiquetía…" /></div>
          </div>

          <div><label className={label}>Tipo de construcción</label><input value={f.tipo} onChange={(e) => set('tipo', e.target.value)} className={input} placeholder="Residencial, comercial, vivienda…" /></div>

          <div>
            <label className={label}>Nivel de daño *</label>
            <div className="grid grid-cols-3 gap-2">
              {ORDEN.slice().reverse().map((n) => (
                <button key={n} onClick={() => set('nivel', n)} className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 ${f.nivel === n ? 'border-[#1a237e] bg-[#1a237e]/5' : 'border-slate-200'}`}>
                  <i className="h-3 w-3 rounded-full" style={{ background: NIVELES[n].color }} /><span className="text-center text-xs font-bold text-slate-700">{NIVELES[n].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>¿Personas atrapadas? *</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ATRAPADOS).map(([k, v]) => (
                <button key={k} onClick={() => set('atrapados', k)} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${f.atrapados === k ? (k === 'si' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-[#1a237e] bg-[#1a237e]/5 text-[#1a237e]') : 'border-slate-200 text-slate-500'}`}>{v.label}</button>
              ))}
            </div>
          </div>

          <div><label className={label}>Descripción</label><textarea value={f.descripcion} onChange={(e) => set('descripcion', e.target.value)} rows={3} className={input + ' resize-none'} placeholder="Detalles visibles, columnas afectadas, evacuación, etc." /></div>
          <div><label className={label}>Fuente del reporte</label><input value={f.fuente} onChange={(e) => set('fuente', e.target.value)} className={input} placeholder="Vecino, video, noticia, organismo…" /></div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={label}>Tu nombre <span className="font-normal text-slate-400">(opcional, privado)</span></label><input value={f.reportanteNombre} onChange={(e) => set('reportanteNombre', e.target.value)} className={input} /></div>
            <div><label className={label}>Tu contacto <span className="font-normal text-slate-400">(opcional, privado)</span></label><input value={f.contacto} onChange={(e) => set('contacto', e.target.value)} className={input} placeholder="Email o teléfono" /></div>
          </div>

          <button onClick={enviar} className="mt-1 w-full rounded-xl bg-[#1a237e] py-4 text-base font-bold text-white shadow-lg active:bg-[#1a237e]/90">Enviar reporte</button>
        </div>
      </div>
    </motion.div>
  )
}