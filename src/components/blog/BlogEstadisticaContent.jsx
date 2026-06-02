import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

/* ─── FADE UP ─── */
function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── CODE BLOCK — VSCode dark, tokenizado en React (sin innerHTML) ─── */

// Colores del tema
const T = {
  keyword:  '#C586C0',  // def, for, if, return...
  builtin:  '#4EC9B0',  // np, pd, stats, len...
  string:   '#CE9178',  // "texto" o 'texto'
  number:   '#B5CEA8',  // 42, 3.14
  comment:  '#6A9955',  // # comentario
  operator: '#D4D4D4',  // = + - * /
  default:  '#D4D4D4',  // todo lo demás
}

const KEYWORDS = new Set([
  'def','return','for','in','if','else','elif','print','import','from',
  'as','True','False','None','class','lambda','and','or','not','with',
  'pass','range','while','try','except','finally','raise','global','del',
])

const BUILTINS = new Set([
  'np','pd','plt','stats','pearsonr','spearmanr','linregress',
  'mean','median','std','var','sum','len','round','abs','min','max',
  'int','float','str','list','dict','set','type','zip','map','filter',
  'enumerate','sorted','reversed','open','print',
])

// Tokeniza una sola línea en un array de { text, color }
function tokenizeLine(line) {
  // Línea de comentario completa
  if (line.trim().startsWith('#')) {
    return [{ text: line, color: T.comment }]
  }

  const tokens = []
  let i = 0

  while (i < line.length) {
    // Comentario inline desde este punto
    if (line[i] === '#') {
      tokens.push({ text: line.slice(i), color: T.comment })
      break
    }

    // String con comillas dobles
    if (line[i] === '"') {
      let j = i + 1
      while (j < line.length && line[j] !== '"') j++
      tokens.push({ text: line.slice(i, j + 1), color: T.string })
      i = j + 1
      continue
    }

    // String con comillas simples
    if (line[i] === "'") {
      let j = i + 1
      while (j < line.length && line[j] !== "'") j++
      tokens.push({ text: line.slice(i, j + 1), color: T.string })
      i = j + 1
      continue
    }

    // Número
    if (/[0-9]/.test(line[i]) && (i === 0 || /\W/.test(line[i - 1]))) {
      let j = i
      while (j < line.length && /[0-9.]/.test(line[j])) j++
      tokens.push({ text: line.slice(i, j), color: T.number })
      i = j
      continue
    }

    // Palabra (keyword, builtin, o identifier)
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++
      const word = line.slice(i, j)
      const color = KEYWORDS.has(word) ? T.keyword
                  : BUILTINS.has(word) ? T.builtin
                  : T.default
      tokens.push({ text: word, color })
      i = j
      continue
    }

    // Operadores
    if (/[=+\-*\/,()[\]{}:.<>!%&|]/.test(line[i])) {
      tokens.push({ text: line[i], color: T.operator })
      i++
      continue
    }

    // Espacio u otro carácter
    tokens.push({ text: line[i], color: T.default })
    i++
  }

  return tokens
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div style={{ margin: '2rem 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
      {/* barra superior */}
      <div style={{ background: '#2D2D2D', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, display: 'inline-block' }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#666', fontFamily: 'monospace', letterSpacing: '0.08em' }}>python</span>
        <button
          onClick={copy}
          style={{ fontSize: 11, color: copied ? '#4EC9B0' : '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}
        >
          {copied ? '✓ copiado' : 'copiar'}
        </button>
      </div>

      {/* código */}
      <pre style={{ background: '#1E1E1E', margin: 0, padding: '1.2rem 1rem', overflowX: 'auto' }}>
        <code style={{ fontFamily: "'Fira Code','Cascadia Code','JetBrains Mono',monospace", fontSize: 13.5, lineHeight: 1.75 }}>
          {lines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
              {/* número de línea */}
              <span style={{ color: '#444', userSelect: 'none', marginRight: '1.4rem', fontSize: 11, display: 'inline-block', width: '1.6rem', textAlign: 'right' }}>
                {i + 1}
              </span>
              {/* tokens coloreados */}
              {tokenizeLine(line).map((tok, j) => (
                <span key={j} style={{ color: tok.color }}>{tok.text}</span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

/* ─── OUTPUT ─── */
function Output({ children }) {
  return (
    <div className="my-[-1.5rem] mb-8 rounded-b-xl border border-t-0 border-[#F5A623]/30 bg-[#FFFBF0] px-5 py-4">
      <p className="text-[10px] font-mono text-[#F5A623]/60 uppercase tracking-widest mb-2">output</p>
      <pre className="font-mono text-[13px] text-gray-700 whitespace-pre-wrap m-0 leading-relaxed">{children}</pre>
    </div>
  )
}

/* ─── CALLOUT ─── */
function Callout({ emoji = '💡', children }) {
  return (
    <div className="my-8 rounded-xl border border-[#1a237e]/10 bg-[#1a237e]/[0.03] px-5 py-4 flex gap-3">
      <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
      <div className="text-[15px] text-gray-600 leading-relaxed">{children}</div>
    </div>
  )
}

/* ─── QUIZ ─── */
function Quiz({ question, options, correct, explanation }) {
  const [selected, setSelected] = useState(null)
  return (
    <div className="my-10 rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
      <p className="text-xs font-semibold tracking-widest text-[#F5A623] uppercase mb-4">Lo entendiste?</p>
      <p className="text-[16px] text-gray-800 font-medium mb-5 leading-snug">{question}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const showResult = selected !== null
          const isCorrect  = i === correct
          const isSelected = selected === i
          let borderColor = '#e5e7eb', bg = '#f9fafb', color = '#374151'
          if (showResult && isCorrect)       { borderColor = '#1D9E75'; bg = '#E1F5EE'; color = '#085041' }
          else if (showResult && isSelected) { borderColor = '#E24B4A'; bg = '#FCEBEB'; color = '#501313' }
          return (
            <button
              key={i}
              disabled={selected !== null}
              onClick={() => setSelected(i)}
              style={{ borderColor, background: bg, color, border: `1px solid ${borderColor}` }}
              className="text-left px-4 py-3 rounded-xl text-[15px] transition-colors"
            >
              <span className="font-mono text-xs mr-2 opacity-40">{String.fromCharCode(97 + i)})</span>
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: selected === correct ? '#085041' : '#A32D2D' }}>
          {selected === correct ? '✓ ' : '✗ '}{explanation}
        </p>
      )}
    </div>
  )
}

/* ─── SECTION HEADING ─── */
function SH({ n, title }) {
  return (
    <FadeUp>
      <div className="mt-20 mb-7 flex items-baseline gap-4">
        <span className="font-mono text-6xl font-bold text-[#F5A623]/15 select-none leading-none">{n}</span>
        <h2 className="font-serif text-2xl md:text-[1.75rem] font-semibold text-[#1a237e] leading-tight">{title}</h2>
      </div>
    </FadeUp>
  )
}

function Sep() {
  return <div className="my-10 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
}

function C({ children }) {
  return <code className="bg-gray-100 text-[#1a237e] text-[13px] px-1.5 py-0.5 rounded font-mono">{children}</code>
}

function P({ children }) {
  return (
    <FadeUp>
      <p className="text-[17px] text-gray-700 leading-[1.85] mb-5">{children}</p>
    </FadeUp>
  )
}

/* ─────────────────────────────────────────────
   CHART 1 — Histograma con Chart.js
───────────────────────────────────────────── */
function HistogramaChart() {
  const allData = [14, 7, 18, 11, 15, 9, 16, 13, 12, 17, 10, 14, 8, 15, 13, 16, 11, 19, 12, 14]
  const [n, setN]     = useState(10)
  const canvasRef     = useRef(null)
  const chartRef      = useRef(null)

  const data   = allData.slice(0, n)
  const mean   = +(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)
  const sorted = [...data].sort((a, b) => a - b)
  const mid    = Math.floor(sorted.length / 2)
  const median = +(sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]).toFixed(1)

  const binLabels = ['1–8', '9–11', '12–14', '15–17', '18–20']
  const bins      = [[1, 9], [9, 12], [12, 15], [15, 18], [18, 21]]
  const counts    = bins.map(([lo, hi]) => data.filter(x => x >= lo && x < hi).length)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: binLabels,
        datasets: [{
          label: 'Estudiantes',
          data: counts,
          backgroundColor: counts.map((_, i) => i === 2 ? '#1a237e' : 'rgba(245,166,35,0.55)'),
          borderColor:     counts.map((_, i) => i === 2 ? '#1a237e' : '#F5A623'),
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.raw} estudiante${ctx.raw !== 1 ? 's' : ''}` }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: 'monospace', size: 12 } },
            grid: { color: '#f3f4f6' }
          },
          x: {
            ticks: { font: { family: 'monospace', size: 12 } },
            grid: { display: false }
          }
        }
      }
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [n])

  return (
    <div className="my-10 rounded-2xl border border-gray-100 bg-white shadow-sm p-6 md:p-8">
      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">
        Histograma interactivo — mueve el slider
      </p>
      <canvas ref={canvasRef} />
      <div className="flex items-center gap-4 mt-6">
        <span className="text-sm text-gray-400 whitespace-nowrap">
          n = <strong className="text-gray-700">{n}</strong>
        </span>
        <input type="range" min={5} max={20} step={1} value={n}
          onChange={e => setN(+e.target.value)} className="flex-1 accent-[#1a237e]" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[{ label: 'Media', val: mean }, { label: 'Mediana', val: median }].map(s => (
          <div key={s.label} className="rounded-xl bg-gray-50 px-4 py-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-mono font-semibold text-[#1a237e]">{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CHART 2 — Scatter con línea de regresión
───────────────────────────────────────────── */
function ScatterChart() {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  const puntos = [
    {x:3,y:14},{x:1,y:7},{x:5,y:18},{x:2,y:11},{x:4,y:15},
    {x:1.5,y:9},{x:5,y:16},{x:3,y:13},{x:2.5,y:12},{x:4.5,y:17},
    {x:2,y:10},{x:3.5,y:14},{x:6,y:19}
  ]

  // regresión lineal
  const n   = puntos.length
  const sx  = puntos.reduce((s, p) => s + p.x, 0)
  const sy  = puntos.reduce((s, p) => s + p.y, 0)
  const sxy = puntos.reduce((s, p) => s + p.x * p.y, 0)
  const sx2 = puntos.reduce((s, p) => s + p.x * p.x, 0)
  const m   = (n * sxy - sx * sy) / (n * sx2 - sx * sx)
  const b   = (sy - m * sx) / n
  const lineaReg = [{ x: 1, y: +(m * 1 + b).toFixed(1) }, { x: 7, y: +(m * 7 + b).toFixed(1) }]

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      data: {
        datasets: [
          {
            type: 'scatter',
            label: 'Estudiantes',
            data: puntos,
            backgroundColor: '#1a237e',
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            type: 'line',
            label: 'Regresión',
            data: lineaReg,
            borderColor: '#F5A623',
            borderWidth: 2,
            borderDash: [6, 3],
            pointRadius: 0,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            filter: item => item.datasetIndex === 0,
            callbacks: {
              label: ctx => ` ${ctx.raw.x}h → nota ${ctx.raw.y}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'horas de estudio', font: { size: 12 } },
            ticks: { font: { family: 'monospace', size: 12 } },
            grid: { color: '#f3f4f6' }
          },
          y: {
            title: { display: true, text: 'nota (1–20)', font: { size: 12 } },
            ticks: { font: { family: 'monospace', size: 12 } },
            grid: { color: '#f3f4f6' }
          }
        }
      }
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [])

  return (
    <div className="my-8 rounded-2xl border border-gray-100 bg-white shadow-sm p-4 md:p-6">
      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
        horas de estudio → nota (r ≈ 0.99)
      </p>
      <canvas ref={canvasRef} />
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#1a237e] inline-block" /> dato real
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 border-t-2 border-dashed border-[#F5A623] inline-block" /> línea de predicción
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CHART 3 — Regla empírica 68-95-99.7
───────────────────────────────────────────── */
function ReglaEmpiricaChart() {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) chartRef.current.destroy()

    const mu = 13, sigma = 3
    const xs = Array.from({ length: 100 }, (_, i) => +(mu - 4 * sigma + i * (8 * sigma / 99)).toFixed(1))
    const normal = x => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
    const ys = xs.map(normal)

    // zonas de color
    const makeZone = (lo, hi, color) => ({
      type: 'line',
      data: xs.map(x => ({ x, y: x >= lo && x <= hi ? normal(x) : null })),
      borderColor: 'transparent',
      backgroundColor: color,
      fill: 'origin',
      pointRadius: 0,
      tension: 0.4,
    })

    chartRef.current = new Chart(canvasRef.current, {
      data: {
        datasets: [
          makeZone(mu - 3*sigma, mu + 3*sigma, 'rgba(245,166,35,0.10)'),
          makeZone(mu - 2*sigma, mu + 2*sigma, 'rgba(245,166,35,0.18)'),
          makeZone(mu - sigma,   mu + sigma,   'rgba(26,35,126,0.20)'),
          {
            type: 'line',
            data: xs.map(x => ({ x, y: normal(x) })),
            borderColor: '#1a237e',
            borderWidth: 2.5,
            backgroundColor: 'transparent',
            pointRadius: 0,
            tension: 0.4,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'nota', font: { size: 12 } },
            ticks: { font: { family: 'monospace', size: 11 } },
            grid: { color: '#f3f4f6' }
          },
          y: { display: false }
        }
      }
    })
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [])

  return (
    <div className="my-8 rounded-2xl border border-gray-100 bg-white shadow-sm p-4 md:p-6">
      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
        campana de gauss — regla 68-95-99.7
      </p>
      <canvas ref={canvasRef} />
      <div className="flex flex-wrap gap-4 mt-4 text-xs font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded inline-block" style={{ background: 'rgba(26,35,126,0.20)' }} /> ±1σ = 68%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded inline-block" style={{ background: 'rgba(245,166,35,0.28)' }} /> ±2σ = 95%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded inline-block" style={{ background: 'rgba(245,166,35,0.10)' }} /> ±3σ = 99.7%
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CONTENIDO PRINCIPAL
───────────────────────────────────────────── */
export default function BlogEstadisticaContent() {
  return (
    <article className="max-w-2xl mx-auto py-16 md:py-20">

      {/* HERO */}
      <div className="pb-10 md:pb-14">
        <p className="font-mono text-xs tracking-widest text-[#F5A623] uppercase mb-4">
          Blog · Estadística básica · Parte 1
        </p>
        <h1 className="font-serif text-5xl md:text-[3.5rem] lg:text-6xl font-bold text-[#1a237e] leading-[1.08] mb-5">
          La estadística<br />
          <span className="text-[#F5A623]">como un game loop</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-7">
          Un enfoque distinto para entender estadística desde cero —
          con Python real, ejemplos concretos y sin fórmulas caídas del cielo.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-400">
          <span>EECA · UCV</span><span>·</span>
          <span>Junio 2026</span><span>·</span>
          <span>~10 min lectura</span>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#F5A623]/30 to-transparent mb-12" />

      {/* INTRO */}
      <P>
        Imagina que el profesor acaba de publicar las notas del parcial. Ves esto:
      </P>
      <FadeUp>
        <div className="my-6 font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl px-6 py-5 leading-relaxed text-gray-600">
          14, 7, 18, 11, 15, 9, 16, 13, 12, 17,<br/>
          10, 14, 8, 15, 13, 16, 11, 19, 12, 14
        </div>
      </FadeUp>
      <P>
        Veinte notas. Cómo le fue al curso? Fue difícil o fácil? Todos sacaron
        parecido o hubo mucha diferencia?
      </P>
      <P>
        No puedes responder eso mirando los números uno por uno. Necesitas resumirlos.
        Y eso — resumir datos para poder interpretarlos — es exactamente lo que hace
        la estadística.
      </P>
      <P>
        Vamos paso a paso con Python. No necesitas haber programado antes. Cada bloque
        de código tiene un comentario que explica qué hace.
      </P>

      <Callout emoji="📌">
        Para correr estos ejemplos entra a <strong>colab.research.google.com</strong>,
        crea un cuaderno nuevo y pega el código. Es gratis, funciona desde el navegador
        y no necesitas instalar nada.
      </Callout>

      {/* 01 */}
      <SH n="01" title="Primero: tener los datos" />
      <P>
        Todo empieza con una lista. Aquí tenemos las notas de 20 estudiantes.
        Usamos pandas para convertir esa lista en algo que Python puede analizar fácil.
      </P>
      <FadeUp>
        <CodeBlock code={`import numpy as np
import pandas as pd


notas = [14, 7, 18, 11, 15, 9, 16, 13, 12, 17,
         10, 14, 8, 15, 13, 16, 11, 19, 12, 14]

notas = pd.Series(notas)

print("Estudiantes:", len(notas))
print("Primeras notas:", notas.head().values)`} />
        <Output>{`Estudiantes: 20
Primeras notas: [14  7 18 11 15]`}</Output>
      </FadeUp>
      <P>
        Bien. Ya tienes los datos. Ahora, qué haces con ellos?
      </P>

      {/* 02 */}
      <SH n="02" title="Media y mediana" />
      <P>
        Alguien te pregunta: cómo le fue al curso? No vas a leer 20 números —
        vas a dar uno solo que represente al grupo. La pregunta es cuál.
      </P>
      <P>
        La <strong>media</strong> es el promedio de siempre: sumas todo y divides entre
        la cantidad. La <strong>mediana</strong> es el valor del medio cuando ordenas
        todos los datos de menor a mayor. Las dos dicen el centro, pero no siempre
        coinciden — y esa diferencia importa.
      </P>
      <FadeUp>
        <CodeBlock code={`media   = notas.mean()
mediana = notas.median()

print(f"Media:   {media:.1f}")
print(f"Mediana: {mediana:.1f}")
print()
print(notas.describe())`} />
        <Output>{`Media:   13.20
Mediana: 13.5

count    20.000000
mean     13.200000
std       3.254147
min       7.000000
25%      11.000000
50%      13.500000
75%      15.250000
max      19.000000`}</Output>
      </FadeUp>

      <Callout emoji="🤔">
        Si hay alguien que sacó 1 y alguien que sacó 19, la media los incluye a los dos
        y queda jalada hacia los extremos. La mediana no — ella solo mira quién quedó
        en el medio. Por eso cuando tienes notas muy raras en los extremos, la mediana
        te da una imagen más honesta del grupo.
      </Callout>

      <Quiz
        question="Un grupo tiene las notas: 10, 11, 13, 15, 18. Cuál es la mediana?"
        options={['13', '14', '15', '11']}
        correct={0}
        explanation="Al ordenarlas (10, 11, 13, 15, 18), el valor del medio es 13. La media sería 13.4 — parecida, pero jala levemente hacia arriba por el 18."
      />

      <HistogramaChart />

      {/* 03 */}
      <SH n="03" title="Desviación estándar" />
      <P>
        La media sola no alcanza. Dos cursos pueden tener el mismo promedio — digamos 13 — y
        ser completamente distintos. En uno, todos sacan entre 12 y 14. En el otro,
        hay quienes sacan 5 y quienes sacan 19.
      </P>
      <P>
        La <strong>desviación estándar</strong> mide exactamente eso: qué tan lejos
        están los datos de su media, en promedio. Un número chico significa que todos
        estuvieron cerca del promedio. Un número grande significa que hubo mucha diferencia.
      </P>
      <FadeUp>
        <CodeBlock code={`sigma = notas.std()
media = notas.mean()

limite_inf = media - sigma
limite_sup = media + sigma

dentro = notas[(notas >= limite_inf) & (notas <= limite_sup)]
pct    = len(dentro) / len(notas) * 100

print(f"Desv. estandar: {sigma:.1f}")
print(f"Rango +/-1s: [{limite_inf:.1f}, {limite_sup:.1f}]")
print(f"Datos dentro: {len(dentro)}/{len(notas)} = {pct:.0f}%")`} />
        <Output>{`Desv. estandar: 3.3
Rango +/-1s: [9.9, 16.5]
Datos dentro: 14/20 = 70%`}</Output>
      </FadeUp>

      <ReglaEmpiricaChart />

      <Quiz
        question="Si la media es 13 y la desviación estándar es 3, entre qué valores cae el 68% de los datos?"
        options={['10 y 16', '7 y 19', '11 y 15', '5 y 21']}
        correct={0}
        explanation="Regla ±1σ: 13 ± 3 = [10, 16]. Ahí cae el ~68% de los datos."
      />

      {/* 04 */}
      <SH n="04" title="Correlación" />
      <P>
        Hasta ahora analizamos una sola cosa a la vez. Pero las preguntas interesantes
        casi siempre involucran dos: los que estudian más horas sacan mejor nota?
        Los que faltan más también sacan menos?
      </P>
      <P>
        Para eso existe la <strong>correlación</strong> — un número entre −1 y +1
        que te dice si dos cosas se mueven juntas, en sentidos opuestos, o si no
        tienen ninguna relación.
      </P>
      <FadeUp>
        <div className="my-6 rounded-xl border border-gray-100 p-5 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            {[
              { val: '−1', desc: 'una sube, la otra baja', color: '#EF4444' },
              { val: '0',  desc: 'sin relación',           color: '#9CA3AF' },
              { val: '+1', desc: 'suben juntas',           color: '#1a237e' },
            ].map(s => (
              <div key={s.val}>
                <p className="text-2xl font-mono font-bold mb-1" style={{ color: s.color }}>{s.val}</p>
                <p className="text-gray-500 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>
      <FadeUp>
        <CodeBlock code={`from scipy import stats

horas = [3, 1, 5, 2, 4, 1.5, 5, 3, 2.5, 4.5,
         2, 3.5, 1.5, 4, 3, 5, 2, 6, 2.5, 3.5]

notas_lista = [14, 7, 18, 11, 15, 9, 16, 13, 12, 17,
               10, 14, 8, 15, 13, 16, 11, 19, 12, 14]

r, p_valor = stats.pearsonr(horas, notas_lista)

print(f"r       = {r:.2f}")
print(f"p-valor = {p_valor:.4f}")`} />
        <Output>{`r       = 0.97
p-valor = 0.0000`}</Output>
      </FadeUp>

      <ScatterChart />

      <Callout emoji="⚠️">
        Cuidado con esto. Que dos cosas estén correlacionadas no significa que una
        cause la otra. Los helados vendidos y los ahogamientos en playa tienen
        correlación altísima — pero los helados no ahogan a nadie. Los dos suben
        en verano por el mismo motivo. Siempre pregúntate: hay algo más detrás?
      </Callout>

      {/* 05 */}
      <SH n="05" title="Prueba de hipótesis" />
      <P>
        El semestre pasado el promedio del curso fue 11. Este semestre subió a 13.2.
        Cambió algo de verdad, o simplemente tuviste suerte con los 20 estudiantes
        que mediste?
      </P>
      <P>
        Esa es exactamente la pregunta que responde una <strong>prueba de hipótesis</strong>.
        Partes de asumir que nada cambió — eso es H₀ — y luego mides qué tan raro
        sería ver tus datos si eso fuera verdad. Si es muy raro, abandonas ese supuesto.
      </P>
      <FadeUp>
        <CodeBlock code={`notas_arr = np.array(notas_lista)

t_stat, p_valor = stats.ttest_1samp(notas_arr, popmean=11)

print(f"Media observada: {notas_arr.mean():.1f}")
print(f"t = {t_stat:.2f},  p = {p_valor:.4f}")
print()

if p_valor < 0.05:
    print("p < 0.05 -> hay evidencia de que la media cambio")
else:
    print("p >= 0.05 -> no hay evidencia suficiente de cambio")`} />
        <Output>{`Media observada: 13.2
t = 3.02,  p = 0.0070

p < 0.05 -> hay evidencia de que la media cambio`}</Output>
      </FadeUp>

      <Callout emoji="🔑">
        El <strong>p-valor</strong> responde esta pregunta: si en realidad nada hubiera
        cambiado, qué tan probable sería ver exactamente estos datos? Si esa probabilidad
        es muy pequeña — por convención, menor a 0.05 — entonces algo probablemente
        sí cambió. No es una certeza, es evidencia. La estadística nunca da certezas.
      </Callout>

      <Quiz
        question="Obtienes p = 0.003 en una prueba t. Qué concluyes a nivel α = 0.05?"
        options={[
          'Rechazo H₀ — hay evidencia de que algo cambió',
          'No rechazo H₀ — no hay evidencia de cambio',
          'El resultado es inconcluso',
          'Hay 3% de probabilidad de que H₁ sea cierta'
        ]}
        correct={0}
        explanation="p = 0.003 < 0.05 → rechazas H₀. Hay evidencia estadística de que la media cambió."
      />

      {/* CIERRE */}
      <Sep />

      <FadeUp>
        <p className="font-serif text-xl text-[#1a237e] font-semibold mb-5">Lo que aprendiste hoy</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '📦', title: 'Estado inicial',     desc: 'tus datos — una lista de números que representan la realidad' },
            { icon: '📍', title: 'Media y mediana',     desc: 'dos formas de describir el centro' },
            { icon: '📏', title: 'Desviación estándar', desc: 'qué tan dispersos están los datos alrededor del centro' },
            { icon: '🔗', title: 'Correlación',         desc: 'si dos variables se mueven juntas — de −1 a +1' },
            { icon: '🔄', title: 'Prueba de hipótesis', desc: 'el update loop: actualizas tu creencia con datos nuevos' },
          ].map(s => (
            <div key={s.title} className="flex gap-3 rounded-xl border border-gray-100 p-4">
              <span className="text-xl shrink-0">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#1a237e]">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <p className="text-[16px] text-gray-500 leading-relaxed mt-10 italic font-serif">
          En la parte 2: qué pasa cuando los datos no siguen la campana de Gauss,
          cuándo no puedes usar estas fórmulas, y qué herramientas tienes entonces.
        </p>
      </FadeUp>

      <Sep />

      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-gray-300 tracking-widest">EECA · UCV · 2026</p>
        <p className="text-xs text-gray-300">Intégrate</p>
      </div>

    </article>
  )
}