'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/container'

const PHOTOS = [
  { src: '/collage/img-4.jpeg', alt: 'Equipo Intégrate' },
  { src: '/collage/img-1.jpeg', alt: 'Actividad estudiantil' },
  { src: '/collage/img-3.jpeg', alt: 'Estudiantes EECA' },
  { src: '/collage/img-7.jpeg', alt: 'Evento campaña' },
  { src: '/collage/img-2.jpeg', alt: 'Grupo campaña' },
  { src: '/collage/img-5.jpeg', alt: 'Miembro equipo' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.94 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ index, onClose, onPrev, onNext }) {
  const photo = PHOTOS[index]

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all">
        <X className="w-5 h-5" />
      </button>
      <button onClick={onPrev} className="absolute left-3 sm:left-6 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={onNext} className="absolute right-3 sm:right-6 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all">
        <ChevronRight className="w-6 h-6" />
      </button>

      <motion.div
        key={index}
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-h-[80vh] max-w-[88vw] object-contain rounded-xl shadow-2xl"
        />
        <div className="mt-3 flex items-center gap-3">
          <p className="text-white/70 text-sm">{photo.alt}</p>
          <span className="text-white/30 text-xs">{index + 1} / {PHOTOS.length}</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {PHOTOS.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i === index ? 'w-4 h-1.5 bg-[#F5A623]' : 'w-1.5 h-1.5 bg-white/30'}`} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Reusable photo tile ───────────────────────────────────────────────────────

function Tile({ index, custom, className, onOpen, children }) {
  const { src, alt } = PHOTOS[index]
  return (
    <motion.div
      custom={custom}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
      onClick={() => onOpen(index)}
      className={`relative overflow-hidden rounded-2xl shadow-md cursor-zoom-in group ${className}`}
    >
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a237e]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {children}
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PhotoCollage() {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const open  = (i) => setLightboxIndex(i)
  const close = () => setLightboxIndex(null)
  const prev  = () => setLightboxIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length)
  const next  = () => setLightboxIndex((i) => (i + 1) % PHOTOS.length)

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F5A623]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#1a237e]/5 blur-3xl pointer-events-none" />

      <Container>
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5A623] mb-3">Nuestra comunidad</p>
          <h2 className="text-4xl sm:text-5xl font-display font-medium tracking-tight text-[#1a237e]">
            Momentos que{' '}
            <span className="relative inline-block">
              nos unen
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#F5A623] rounded-full origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto leading-relaxed">
            Cada foto cuenta la historia de estudiantes comprometidos con el cambio en la EECA.
          </p>
        </motion.div>

        {/* ── Desktop layout ── */}
        <div className="hidden sm:block space-y-3">

          {/* Row 1: grande izq (2/4) + dos pequeñas (1/4 c/u) + tall derecha (1/4, rowspan 2) */}
          {/* Usamos flex para controlar mejor las alturas */}
          <div className="flex gap-3" style={{ height: '320px' }}>

            {/* Hero grande */}
            <motion.div
              custom={0} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
              whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }}
              onClick={() => open(0)}
              className="relative overflow-hidden rounded-2xl shadow-xl cursor-zoom-in group -rotate-1"
              style={{ flex: '0 0 48%' }}
            >
              <img src={PHOTOS[0].src} alt={PHOTOS[0].alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a237e]/70 via-[#1a237e]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <span className="inline-block bg-[#F5A623] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2">Intégrate</span>
                <p className="text-white font-semibold text-base leading-snug drop-shadow-md">Unidos por un<br />propósito común</p>
              </div>
            </motion.div>

            {/* Columna central: 2 fotos apiladas */}
            <div className="flex flex-col gap-3" style={{ flex: '0 0 26%' }}>
              <Tile index={1} custom={1} className="rotate-1 flex-1" onOpen={open} style={{ flex: 1 }} />
              <Tile index={2} custom={2} className="-rotate-2 flex-1" onOpen={open} style={{ flex: 1 }} />
            </div>

            {/* Columna derecha: foto tall */}
            <Tile index={3} custom={3} className="rotate-2 flex-1" onOpen={open} />
          </div>

          {/* Row 2: 3 fotos iguales */}
          <div className="flex gap-3" style={{ height: '240px' }}>
            <Tile index={4} custom={4} className="-rotate-1 flex-1" onOpen={open} />
            <Tile index={5} custom={5} className="rotate-1 flex-1" onOpen={open} />

  
          </div>
        </div>

        {/* ── Mobile: 2-col grid ── */}
        <div className="sm:hidden grid grid-cols-2 gap-2.5">
          {/* Foto grande ocupa 2 cols */}
          <motion.div
            custom={0} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
            onClick={() => open(0)}
            className="col-span-2 relative overflow-hidden rounded-2xl shadow-lg cursor-zoom-in group"
            style={{ height: '220px' }}
          >
            <img src={PHOTOS[0].src} alt={PHOTOS[0].alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a237e]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="inline-block bg-[#F5A623] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-1">Intégrate</span>
              <p className="text-white font-semibold text-sm drop-shadow-md">Unidos por un propósito común</p>
            </div>
          </motion.div>

          {[1, 2, 3, 4, 5].map((idx, i) => ( // índices 1–5 del array PHOTOS
            <motion.div
              key={idx}
              custom={i + 1} variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
              onClick={() => open(idx)}
              className="relative overflow-hidden rounded-xl shadow-md cursor-zoom-in group"
              style={{ height: '150px' }}
            >
              <img src={PHOTOS[idx].src} alt={PHOTOS[idx].alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a237e]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}


        </div>

        {/* CTA strip */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-[#1a237e]/[0.04] border border-[#1a237e]/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 4, 2].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src={PHOTOS[i].src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Más de <span className="text-[#1a237e] font-bold">200 estudiantes</span> se han unido al movimiento
            </p>
          </div>
          <a
            href="https://www.instagram.com/integrate_ucv/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#F5A623]/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-sm shadow-[#F5A623]/30 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Síguenos en Instagram
          </a>
        </motion.div>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox index={lightboxIndex} onClose={close} onPrev={prev} onNext={next} />
        )}
      </AnimatePresence>
    </section>
  )
}