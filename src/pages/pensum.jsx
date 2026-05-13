'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  BookOpen,
  Building2,
  Download,
  RefreshCw,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'
import { Container } from '@/components/container'
import { Navbar } from '@/components/navbar'
import { Heading, Lead } from '@/components/text'

/* =========================================
   DATA: Departamentos y Materias
   ========================================= */
const deptData = {
  matematica: {
    name: 'Dpto. de Matemáticas',
    key: 'MAT',
    desc: 'Fundamentos de cálculo, álgebra lineal y análisis numérico.',
    color: '#120b46',
  },
  estadistica: {
    name: 'Dpto. de Estadística y Probabilidad',
    key: 'EST',
    desc: 'Núcleo teórico de probabilidad e inferencia estadística.',
    color: '#F5A623',
  },
  diseno: {
    name: 'Dpto. de Diseño Estadístico',
    key: 'DIS',
    desc: 'Aplicación práctica, investigación de operaciones y muestreo.',
    color: '#333333',
  },
  informatica: {
    name: 'Dpto. de Informática',
    key: 'INF',
    desc: 'Programación y sistemas de información estadísticos.',
    color: '#4a5568',
  },
  economia: {
    name: 'Dpto. de Economía Cuantitativa',
    key: 'ECO',
    desc: 'Análisis económico, econometría y evaluación de proyectos.',
    color: '#d97706',
  },
  actuarial: {
    name: 'Dpto. de Actuariales',
    key: 'ACT',
    desc: 'Matemática financiera, seguros y planes de pensiones.',
    color: '#1e1b4b',
  },
  grado: {
    name: 'Requisitos de Egreso',
    key: 'TEG',
    desc: 'Trabajo Especial de Grado.',
    color: '#000000',
  },
  electiva: {
    name: 'Electivas',
    key: 'EL',
    desc: 'Asignaturas complementarias según especialización.',
    color: '#94a3b8',
  },
}

const subjects = [
  // 1er Semestre
  { id: '4000', name: 'Matemáticas I', uc: 8, dept: 'matematica', sem: 1, pre: [], esp: 'comun' },
  { id: '4100', name: 'Estadística I', uc: 8, dept: 'estadistica', sem: 1, pre: [], esp: 'comun' },
  { id: '4300', name: 'Computación I', uc: 4, dept: 'informatica', sem: 1, pre: [], esp: 'comun' },
  // 2do Semestre
  { id: '4001', name: 'Matemáticas II', uc: 8, dept: 'matematica', sem: 2, pre: ['4000'], esp: 'comun' },
  { id: '4101', name: 'Estadística II', uc: 8, dept: 'estadistica', sem: 2, pre: ['4100'], esp: 'comun' },
  { id: '4301', name: 'Computación II', uc: 4, dept: 'informatica', sem: 2, pre: ['4300'], esp: 'comun' },
  // 3er Semestre
  { id: '4002', name: 'Matemáticas III', uc: 8, dept: 'matematica', sem: 3, pre: ['4001'], esp: 'comun' },
  { id: '4003', name: 'Álgebra Lineal I', uc: 4, dept: 'matematica', sem: 3, pre: ['4001'], esp: 'comun' },
  { id: '4102', name: 'Teoría de la Probabilidad I', uc: 4, dept: 'estadistica', sem: 3, pre: ['4001', '4101'], esp: 'comun' },
  { id: '4302', name: 'Sistemas de Información', uc: 4, dept: 'informatica', sem: 3, pre: ['4301'], esp: 'comun' },
  // 4to Semestre
  { id: '4004', name: 'Matemáticas IV', uc: 4, dept: 'matematica', sem: 4, pre: ['4002', '4003'], esp: 'comun' },
  { id: '4005', name: 'Álgebra Lineal II', uc: 6, dept: 'matematica', sem: 4, pre: ['4003'], esp: 'comun' },
  { id: '4103', name: 'Teoría de la Probabilidad II', uc: 6, dept: 'estadistica', sem: 4, pre: ['4002', '4102'], esp: 'comun' },
  { id: '4400', name: 'Introducción a la Economía', uc: 4, dept: 'economia', sem: 4, pre: ['4001'], esp: 'comun' },
  // 5to Semestre
  { id: '4104', name: 'Teoría de la Probabilidad III', uc: 6, dept: 'estadistica', sem: 5, pre: ['4003', '4103'], esp: 'comun' },
  { id: '4401', name: 'Demografía', uc: 4, dept: 'economia', sem: 5, pre: ['4101', '4400'], esp: 'comun' },
  { id: '4402', name: 'Microeconomía', uc: 4, dept: 'economia', sem: 5, pre: ['4002', '4400'], esp: 'comun' },
  { id: '4303', name: 'Computación Estadística', uc: 4, dept: 'informatica', sem: 5, pre: ['4101', '4302'], esp: 'est' },
  { id: '4600', name: 'Matemáticas Financieras I', uc: 4, dept: 'actuarial', sem: 5, pre: ['4002'], esp: 'act' },
  // 6to Semestre
  { id: '4105', name: 'Inferencia Estadística', uc: 6, dept: 'estadistica', sem: 6, pre: ['4104'], esp: 'comun' },
  { id: '4106', name: 'Procesos Estocásticos', uc: 4, dept: 'estadistica', sem: 6, pre: ['4004', '4104'], esp: 'comun' },
  { id: '4403', name: 'Macroeconomía', uc: 4, dept: 'economia', sem: 6, pre: ['4402'], esp: 'est' },
  { id: '4200', name: 'Introd. al Diseño de Inv.', uc: 4, dept: 'diseno', sem: 6, pre: [], minUC: 80, esp: 'est' },
  { id: '4601', name: 'Seguros de Personas', uc: 4, dept: 'actuarial', sem: 6, pre: ['4600'], esp: 'act' },
  { id: '4602', name: 'Matemáticas Financieras II', uc: 4, dept: 'actuarial', sem: 6, pre: ['4600'], esp: 'act' },
  { id: '4603', name: 'Teoría de la Mortalidad', uc: 4, dept: 'actuarial', sem: 6, pre: ['4104', '4401'], esp: 'act' },
  // 7mo Semestre
  { id: '4500', name: 'Investigación de Operaciones I', uc: 4, dept: 'diseno', sem: 7, pre: ['4004'], esp: 'est' },
  { id: '4107', name: 'Métodos Multivariantes', uc: 6, dept: 'estadistica', sem: 7, pre: ['4105'], esp: 'est' },
  { id: '4108', name: 'Series de Tiempo', uc: 4, dept: 'estadistica', sem: 7, pre: ['4105'], esp: 'est' },
  { id: '4201', name: 'Muestreo I', uc: 6, dept: 'diseno', sem: 7, pre: ['4105'], esp: 'est' },
  { id: '4700', name: 'Análisis Numérico', uc: 4, dept: 'actuarial', sem: 7, pre: ['4004'], esp: 'act' },
  { id: '4604', name: 'Seguros Patrimoniales', uc: 4, dept: 'actuarial', sem: 7, pre: ['4600'], esp: 'act' },
  { id: '4605', name: 'Matemáticas Actuariales I', uc: 8, dept: 'actuarial', sem: 7, pre: ['4602', '4603'], esp: 'act' },
  // 8vo Semestre
  { id: '4501', name: 'Investigación de Operaciones II', uc: 4, dept: 'diseno', sem: 8, pre: ['4106', '4500'], esp: 'est' },
  { id: '4204', name: 'Control Estadístico de Calidad', uc: 6, dept: 'diseno', sem: 8, pre: ['4200', '4105'], esp: 'est' },
  { id: '4404', name: 'Econometría', uc: 4, dept: 'economia', sem: 8, pre: ['4403', '4107'], esp: 'est' },
  { id: '4202', name: 'Muestreo II', uc: 6, dept: 'diseno', sem: 8, pre: ['4201'], esp: 'est' },
  { id: '4606', name: 'Derecho del Seguro y Leg. Fin.', uc: 4, dept: 'actuarial', sem: 8, pre: ['4602', '4604'], esp: 'act' },
  { id: '4607', name: 'Teoría Mat. del Riesgo I', uc: 6, dept: 'actuarial', sem: 8, pre: ['4105', '4106'], esp: 'act' },
  { id: '4608', name: 'Matemáticas Actuariales II', uc: 6, dept: 'actuarial', sem: 8, pre: ['4700', '4605'], esp: 'act' },
  { id: '4609', name: 'Seguridad y Seguro Social', uc: 6, dept: 'actuarial', sem: 8, pre: ['4604'], esp: 'act' },
  // 9no Semestre
  { id: '4304', name: 'Sistemas de Información Est. I', uc: 4, dept: 'informatica', sem: 9, pre: [], minUC: 118, esp: 'est' },
  { id: '4405', name: 'Análisis de Mercado', uc: 4, dept: 'economia', sem: 9, pre: ['4202'], esp: 'est' },
  { id: '4203', name: 'Muestreo III', uc: 4, dept: 'diseno', sem: 9, pre: ['4202'], esp: 'est' },
  { id: '4205', name: 'Diseño de Experimentos', uc: 6, dept: 'diseno', sem: 9, pre: ['4200', '4107'], esp: 'est' },
  { id: '4610', name: 'Técnicas Actuariales', uc: 6, dept: 'actuarial', sem: 9, pre: ['4606', '4608'], esp: 'act' },
  { id: '4611', name: 'Teoría Mat. del Riesgo II', uc: 6, dept: 'actuarial', sem: 9, pre: ['4607'], esp: 'act' },
  { id: '4612', name: 'Matemáticas Actuariales III', uc: 6, dept: 'actuarial', sem: 9, pre: ['4608', '4609'], esp: 'act' },
  { id: 'EL-9', name: 'Electiva', uc: 4, dept: 'electiva', sem: 9, pre: [], minUC: 152, esp: 'comun' },
  // 10mo Semestre
  { id: '4305', name: 'Sist. de Información Est. II', uc: 4, dept: 'informatica', sem: 10, pre: ['4304'], esp: 'est' },
  { id: '4406', name: 'Prep. y Eval. de Proyectos', uc: 6, dept: 'economia', sem: 10, pre: [], minUC: 156, esp: 'est' },
  { id: '4613', name: 'Técnicas de Reaseguro', uc: 4, dept: 'actuarial', sem: 10, pre: ['4610', '4611'], esp: 'act' },
  { id: '4614', name: 'Matemática de Pensiones', uc: 6, dept: 'actuarial', sem: 10, pre: ['4612'], esp: 'act' },
  { id: 'EL-10', name: 'Electiva', uc: 4, dept: 'electiva', sem: 10, pre: [], minUC: 156, esp: 'comun' },
  { id: '4900', name: 'Trabajo Especial de Grado', uc: 6, dept: 'grado', sem: 10, pre: [], minUC: 158, esp: 'comun' },
]

const deptBorderClass = {
  matematica: 'border-l-[#120b46]',
  estadistica: 'border-l-[#F5A623]',
  diseno: 'border-l-[#333333]',
  informatica: 'border-l-[#4a5568]',
  economia: 'border-l-[#d97706]',
  actuarial: 'border-l-[#1e1b4b]',
  grado: 'border-l-black',
  electiva: 'border-l-[#94a3b8]',
}

/* =========================================
   HOOK: localStorage seguro para SSR
   ========================================= */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error reading localStorage', e)
    }
    setIsHydrated(true)
  }, [key])

  useEffect(() => {
    if (!isHydrated) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Error writing localStorage', e)
    }
  }, [key, value, isHydrated])

  return [value, setValue, isHydrated]
}

/* =========================================
   COMPONENTE PRINCIPAL
   ========================================= */
export default function Pensum() {
  const [states, setStates] = useLocalStorage('int_states_v2', {})
  const [gradesArray, setGradesArray] = useLocalStorage('int_grades_arr', {})
  const [currentEsp, setCurrentEsp] = useLocalStorage('int_esp', 'basico')
  const [scStatus, setScStatus] = useLocalStorage('int_sc_status', 'bloqueado')

  const [menuOpen, setMenuOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [deptsOpen, setDeptsOpen] = useState(false)
  const [userName, setUserName] = useState('')

  /* ===== CÁLCULOS DERIVADOS ===== */
  const stats = useMemo(() => {
    let ucAprobGlobal = 0
    let cursandoUC = 0
    let totalUcInscritas = 0
    let puntosTotales = 0
    let matAprobadas = 0
    let matInscritasTotales = 0

    subjects.forEach((s) => {
      if (s.esp !== 'comun' && currentEsp !== 'basico' && s.esp !== currentEsp) return

      let inscripcionesEnMateria = 0
      const intentos = gradesArray[s.id] || []

      if (intentos.length > 0) {
        intentos.forEach((nota) => {
          inscripcionesEnMateria++
          totalUcInscritas += s.uc
          puntosTotales += nota * s.uc
          if (nota >= 10) {
            ucAprobGlobal += s.uc
            matAprobadas++
          }
        })
      }

      if (states[s.id] === 'cursando') {
        cursandoUC += s.uc
        inscripcionesEnMateria++
      }

      if (states[s.id] === 'reprobado' && intentos.length === 0) {
        inscripcionesEnMateria++
      }

      matInscritasTotales += inscripcionesEnMateria
    })

    const totalUcCarrera = 158
    const porcentaje = Math.min(100, Math.round((ucAprobGlobal / totalUcCarrera) * 100))
    const promedio = totalUcInscritas > 0 ? (puntosTotales / totalUcInscritas).toFixed(2) : '0.00'
    const eficiencia = matInscritasTotales > 0 ? (matAprobadas / matInscritasTotales).toFixed(2) : '1.00'
    const alertaPermanencia = matInscritasTotales > 0 && matAprobadas / matInscritasTotales < 0.25

    return {
      ucAprobGlobal,
      cursandoUC,
      porcentaje,
      promedio,
      eficiencia,
      alertaPermanencia,
    }
  }, [states, gradesArray, currentEsp])

  /* ===== EFECTO SC: actualizar al cambiar UC aprobadas ===== */
  useEffect(() => {
    if (stats.ucAprobGlobal >= 80 && scStatus === 'bloqueado') {
      setScStatus('pendiente')
    } else if (stats.ucAprobGlobal < 80 && scStatus !== 'bloqueado') {
      setScStatus('bloqueado')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.ucAprobGlobal])

  /* ===== HANDLERS ===== */
  const handleStatusChange = useCallback(
    (id, val) => {
      setStates((prev) => ({ ...prev, [id]: val }))
      if (val === 'pendiente' || val === 'cursando') {
        setGradesArray((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    },
    [setStates, setGradesArray]
  )

  const handleGradeInput = useCallback(
    (id, index, val) => {
      setGradesArray((prev) => {
        let intentos = [...(prev[id] || [])]

        if (val === '') {
          intentos.splice(index, 1)
        } else {
          intentos[index] = parseInt(val, 10)
        }

        intentos = intentos.filter((n) => !isNaN(n))

        const next = { ...prev }
        if (intentos.length === 0) {
          delete next[id]
        } else {
          next[id] = intentos
        }

        // Actualizar estado en función del último intento
        setStates((prevStates) => {
          const nextStates = { ...prevStates }
          if (intentos.length > 0) {
            const ultima = intentos[intentos.length - 1]
            nextStates[id] = ultima >= 10 ? 'aprobado' : 'reprobado'
          } else {
            nextStates[id] = 'pendiente'
          }
          return nextStates
        })

        return next
      })
    },
    [setGradesArray, setStates]
  )

  const reiniciarTodo = () => {
    if (confirm('¿Estás seguro de borrar todos tus datos y reiniciar el pensum?')) {
      setStates({})
      setGradesArray({})
      setCurrentEsp('basico')
      setScStatus('bloqueado')
      setMenuOpen(false)
    }
  }

  /* ===== GENERAR PDF ===== */
  const generarReportePDF = async () => {
    // Carga dinámica para evitar SSR issues
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')

    const doc = new jsPDF()
    const nombre = userName || 'Estudiante'

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(18, 11, 70)
    doc.text('REPORTE ACADÉMICO - EECA UCV', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const espTxt = currentEsp === 'est' ? 'Estadística' : currentEsp === 'act' ? 'Actuarial' : 'Básico'
    doc.text(`Nombre: ${nombre} | Especialidad: ${espTxt}`, 14, 30)
    const scLabel = {
      bloqueado: 'Bloqueado',
      pendiente: 'Pendiente de Inicio',
      induccion: 'Curso de Inducción Completado',
      proyecto: 'Realizando Proyecto',
      evaluacion: 'Esperando Evaluación',
      aprobado: 'Aprobado con Éxito',
    }[scStatus]
    doc.text(`Servicio Comunitario: ${scLabel}`, 14, 35)

    const body = []
    subjects.forEach((s) => {
      if (s.esp !== 'comun' && currentEsp !== 'basico' && s.esp !== currentEsp) return
      const estado = states[s.id] || 'pendiente'
      const intentos = gradesArray[s.id] || []

      if (estado !== 'pendiente') {
        let reprobadasStr = ''
        let notaDef = '-'

        if (intentos.length > 0) {
          const fallos = intentos.filter((n) => n < 10)
          if (fallos.length > 0) reprobadasStr = fallos.join(', ')
          const ultima = intentos[intentos.length - 1]
          notaDef = ultima >= 10 ? ultima.toString() : 'R'
        }
        body.push([s.sem, s.name, s.uc, estado.toUpperCase(), reprobadasStr, notaDef])
      }
    })

    doc.autoTable({
      startY: 42,
      head: [['Sem.', 'Asignatura', 'UC', 'Estado', 'Reprobadas', 'Nota Def.']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [245, 166, 35], textColor: [255, 255, 255] },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 4 && data.cell.raw !== '') {
          data.cell.styles.textColor = [225, 29, 72]
          data.cell.styles.fontStyle = 'bold'
        }
        if (data.section === 'body' && data.column.index === 5 && data.cell.raw !== '-' && data.cell.raw !== 'R') {
          data.cell.styles.textColor = [4, 120, 87]
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })

    doc.setFontSize(8)
    doc.setTextColor(120)
    const disclaimer =
      'DOCUMENTO NO OFICIAL. Este reporte es meramente referencial y no pretende llevar un registro ni sustituir las funciones u normativas de Control de Estudios de FACES UCV. Su único fin es asistir al estudiante en el cálculo de eficiencia, promedio y planificación de inscripciones a modo de herramienta didáctica.'
    const splitText = doc.splitTextToSize(disclaimer, 180)
    doc.text(splitText, 14, doc.lastAutoTable.finalY + 15)

    doc.save(`Reporte_EECA_${nombre}.pdf`)
  }

  /* ===== HELPERS ===== */
  const isSubjectApproved = (id) => {
    const intentos = gradesArray[id] || []
    return states[id] === 'aprobado' || (intentos.length > 0 && intentos[intentos.length - 1] >= 10)
  }

  const ucAprobGlobal = stats.ucAprobGlobal

  /* ===== RENDER ===== */
  return (
    <div className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)]">
      <Container className="p-4">
        <Navbar />

        {/* Botón menú */}
        <button
          onClick={() => setMenuOpen(true)}
          className="fixed top-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-[#1a237e] shadow-sm transition hover:border-[#F5A623] hover:text-[#F5A623]"
        >
          <Menu className="h-5 w-5" />
          Opciones
        </button>

        {/* HEADER */}
        <header className="relative mt-16 mb-5 overflow-hidden rounded-3xl border border-gray-100 bg-white px-5 py-10 text-center shadow-sm">
          <div className="absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2 rounded-b-xl bg-[#F5A623]" />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5A623]/10">
            <GraduationCap className="h-9 w-9 text-[#F5A623]" />
          </div>
          <Heading as="h1" className="text-[#1a237e]">
            Pensum Interactivo
          </Heading>
          <p className="mt-2 text-base font-bold tracking-wider text-[#F5A623] sm:text-lg">
            &quot;La solución es la suma de todas las partes&quot;
          </p>
          <Lead className="mx-auto mt-4 max-w-2xl text-gray-600">
            Planifica tu carrera, registra tus calificaciones y haz seguimiento de tu progreso académico en la EECA.
          </Lead>
        </header>

        {/* PANELES SUPERIORES */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Especialidad */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
            <h3 className="mb-3 text-base font-bold text-[#1a237e]">Especialidad (Desde 5to Semestre)</h3>
            <select
              value={currentEsp}
              onChange={(e) => setCurrentEsp(e.target.value)}
              className="w-full cursor-pointer rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-bold text-[#1a237e] outline-none transition focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/20"
            >
              <option value="basico">Ciclo Básico (Aún sin decidir)</option>
              <option value="est">📊 Ciencias Estadísticas</option>
              <option value="act">📈 Ciencias Actuariales</option>
            </select>
          </div>

          {/* Servicio Comunitario */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
            <h3 className="mb-3 text-base font-bold text-[#1a237e]">Servicio Comunitario</h3>
            <span
              className={clsxLite(
                'mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold',
                ucAprobGlobal >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-600'
              )}
            >
              {ucAprobGlobal >= 80 ? `✅ Habilitado (${ucAprobGlobal} UC)` : `🔒 Requiere 80 UC (Tienes ${ucAprobGlobal})`}
            </span>
            <select
              value={scStatus}
              onChange={(e) => setScStatus(e.target.value)}
              disabled={ucAprobGlobal < 80}
              className={clsxLite(
                'w-full cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/20',
                scStatus === 'aprobado'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 bg-white text-[#1a237e]',
                ucAprobGlobal < 80 && 'cursor-not-allowed opacity-70'
              )}
            >
              <option value="bloqueado">Bloqueado</option>
              <option value="pendiente">📝 Pendiente de Inicio</option>
              <option value="induccion">📚 Curso de Inducción Completado</option>
              <option value="proyecto">⚙️ Realizando Proyecto</option>
              <option value="evaluacion">⏳ Esperando Evaluación</option>
              <option value="aprobado">✅ Aprobado con Éxito</option>
            </select>
          </div>
        </div>

        {/* Alerta de Permanencia */}
        <AnimatePresence>
          {stats.alertaPermanencia && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 border-l-4 border-l-rose-600 bg-rose-50 p-5"
            >
              <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-rose-600" />
              <div>
                <h4 className="font-bold text-rose-900">Alerta de Permanencia (Art. 3)</h4>
                <p className="mt-1 text-sm text-rose-950">
                  Tienes un índice de aprobación menor al 25% de las UC inscritas. Debes aprobar tus próximas asignaturas
                  para evitar inhabilitación por el Artículo 6.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PENSUM */}
        <div className="flex gap-8 overflow-x-auto pb-12 [scroll-behavior:smooth]">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((semNum) => {
            const semSubjects = subjects.filter(
              (s) => s.sem === semNum && (s.esp === 'comun' || currentEsp === 'basico' || s.esp === currentEsp)
            )
            if (semSubjects.length === 0) return null

            return (
              <motion.div
                key={semNum}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="min-w-[340px] rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-6 border-b-2 border-dashed border-gray-200 pb-4 text-center text-xl font-extrabold text-[#1a237e]">
                  Semestre {semNum}
                </h3>

                {semSubjects.map((s) => {
                  const status = states[s.id] || 'pendiente'
                  const intentos = gradesArray[s.id] || []
                  const canTake =
                    s.pre.every((p) => isSubjectApproved(p)) && (!s.minUC || ucAprobGlobal >= s.minUC)

                  const stateStyles = {
                    aprobado: 'border-emerald-500 !border-l-emerald-500',
                    cursando: 'border-[#F5A623]',
                    reprobado: 'border-red-500 !border-l-red-500',
                    pendiente: '',
                  }[status]

                  const locked = status === 'pendiente' && !canTake

                  return (
                    <motion.div
                      key={s.id}
                      whileHover={{ y: -2 }}
                      className={clsxLite(
                        'relative my-4 rounded-2xl border border-gray-200 border-l-[6px] bg-white p-5 transition',
                        deptBorderClass[s.dept],
                        stateStyles,
                        locked && 'pointer-events-none opacity-40 grayscale'
                      )}
                    >
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {deptData[s.dept].name}
                      </span>
                      <div className="mb-4 min-h-[45px] text-base font-extrabold leading-tight text-[#1a237e]">
                        {s.name}
                      </div>

                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                        className={clsxLite(
                          'w-full cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-[#F5A623]',
                          {
                            aprobado: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                            cursando: 'border-amber-200 bg-amber-50 text-amber-700',
                            reprobado: 'border-red-200 bg-red-50 text-red-700',
                            pendiente: 'border-gray-300 bg-gray-50 text-gray-700',
                          }[status]
                        )}
                      >
                        <option value="pendiente">📝 Pendiente</option>
                        <option value="cursando">⏳ Cursando</option>
                        <option value="aprobado">✅ Aprobado</option>
                        <option value="reprobado">❌ Reprobado</option>
                      </select>

                      {/* Notas dinámicas */}
                      {(status === 'aprobado' || status === 'reprobado') && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {intentos.map((nota, k) => (
                            <input
                              key={k}
                              type="number"
                              min="1"
                              max="20"
                              value={nota}
                              title={`Intento ${k + 1}`}
                              onChange={(e) => handleGradeInput(s.id, k, e.target.value)}
                              className={clsxLite(
                                'h-9 w-11 rounded-lg border text-center text-sm font-bold outline-none transition focus:border-[#F5A623]',
                                nota < 10
                                  ? 'border-red-300 bg-rose-50 text-rose-600'
                                  : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              )}
                            />
                          ))}
                          {(intentos.length === 0 || intentos[intentos.length - 1] < 10) && (
                            <input
                              type="number"
                              min="1"
                              max="20"
                              placeholder="Nota"
                              title="Siguiente Intento"
                              onChange={(e) => handleGradeInput(s.id, intentos.length, e.target.value)}
                              className="h-9 w-11 rounded-lg border border-gray-300 bg-gray-50 text-center text-sm font-bold text-[#1a237e] outline-none transition focus:border-[#F5A623]"
                            />
                          )}
                        </div>
                      )}

                      {/* Prelaciones */}
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                          {s.pre.length > 0 || s.minUC ? 'Prelaciones:' : 'Sin prelaciones'}
                        </div>
                        {s.pre.map((p) => {
                          const pSub = subjects.find((x) => x.id === p)
                          return (
                            <span
                              key={p}
                              className="mr-1 mb-1 inline-block rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600"
                            >
                              {pSub ? pSub.name.substring(0, 8) + '...' : p}
                            </span>
                          )
                        })}
                        {s.minUC && (
                          <span className="mr-1 mb-1 inline-block rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            Req: {s.minUC} UC
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400">
                        <span>Cod: {s.id}</span>
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-extrabold text-[#1a237e]">
                          {s.uc} UC
                        </span>
                      </div>

                      {locked && (
                        <div className="absolute right-3 top-3">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )
          })}
        </div>

        {/* Footer autor */}
        <div className="mt-10 border-t border-gray-100 bg-white py-5 text-center text-sm font-medium text-gray-500">
          Autor: <span className="font-extrabold tracking-wider text-[#1a237e]">INTÉGRATE</span>{' '}
          <span className="font-extrabold text-[#F5A623]">EECA</span>{' '}
          <span className="font-extrabold tracking-wider text-[#1a237e]">- UCV</span>
        </div>
      </Container>

      {/* =========================================
          SIDEBAR
          ========================================= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[1000] bg-black/20 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -340 }}
              animate={{ x: 0 }}
              exit={{ x: -340 }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 z-[1001] h-screen w-[320px] overflow-y-auto border-r border-gray-200 bg-white p-7 shadow-2xl"
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="mt-2 border-b-2 border-gray-100 pb-4 text-xl font-extrabold text-[#1a237e]">
                Panel de Control
              </h2>

              {/* Progreso */}
              <div className="mt-6 mb-6">
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.porcentaje}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-[#F5A623] to-[#1a237e]"
                  />
                </div>
                <div className="mt-2 text-center text-xs font-bold text-[#1a237e]">
                  {stats.porcentaje}% de la Carrera
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-[#1a237e] p-4 text-center text-white">
                  <span className="block text-xl font-extrabold">{stats.promedio}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">Promedio</span>
                </div>
                <div className="rounded-xl bg-[#F5A623] p-4 text-center text-white">
                  <span className="block text-xl font-extrabold">{stats.ucAprobGlobal}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider opacity-90">UC Aprob.</span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <span className="block text-xl font-extrabold text-[#1a237e]">{stats.cursandoUC}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">UC Cursando</span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <span className="block text-xl font-extrabold text-[#1a237e]">{stats.eficiencia}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Eficiencia</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-8">
                <span className="mb-2.5 block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Información
                </span>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setGuideOpen(true)
                  }}
                  className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1a237e] transition hover:border-gray-300 hover:bg-gray-100"
                >
                  <BookOpen className="h-4 w-4 text-[#F5A623]" /> Guía de Uso
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setDeptsOpen(true)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1a237e] transition hover:border-gray-300 hover:bg-gray-100"
                >
                  <Building2 className="h-4 w-4 text-[#F5A623]" /> Departamentos EECA
                </button>
              </div>

              {/* Exportar */}
              <div className="mt-5">
                <span className="mb-2.5 block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Exportar Datos
                </span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Tu Nombre para el PDF"
                  className="mb-2.5 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-xs font-medium outline-none transition focus:border-[#F5A623]"
                />
                <button
                  onClick={generarReportePDF}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <Download className="h-4 w-4" /> Descargar PDF
                </button>
                <button
                  onClick={reiniciarTodo}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                >
                  <RefreshCw className="h-4 w-4" /> Reiniciar Pensum
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =========================================
          MODAL GUÍA
          ========================================= */}
      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Guía de Uso del Pensum" icon={BookOpen}>
        <GuideSection icon="📍" title="Inicio y Configuración">
          <li>
            <strong>1. Configura tu especialidad:</strong> Selecciona si estudiarás Estadística o Actuarial para adaptar
            tu pensum.
          </li>
          <li>
            <strong>2. Registra tu desempeño:</strong> Marca las materias que ya superaste o las que cursas.
          </li>
        </GuideSection>

        <GuideSection icon="🚥" title="Sistema Inteligente de Notas">
          <li>
            <strong>📝 Pendiente y ⏳ Cursando:</strong> No requieren ingresar notas.
          </li>
          <li>
            <strong>✅ Aprobado y ❌ Reprobado:</strong> Al seleccionar estos estados, se abrirá una casilla. Escribe tu
            calificación (1 al 20). Si la nota es menor a 10, la casilla se pondrá roja y{' '}
            <strong>automáticamente aparecerá una nueva casilla vacía</strong> al lado para que coloques la nota de tu
            próximo intento, y así sucesivamente hasta que apruebes con 10 o más.
          </li>
        </GuideSection>

        <GuideSection icon="📜" title="Requisitos y Reglamentos">
          <li>
            <strong>1. Servicio Comunitario:</strong> Su panel está en la parte superior. Se desbloqueará cuando alcances
            80 UC y podrás hacer seguimiento a tus fases (Inducción, Proyecto, etc).
          </li>
          <li>
            <strong>2. Electivas:</strong> Disponibles en 9no y 10mo semestre.
          </li>
          <li>
            <strong>3. Trabajo Especial de Grado:</strong> Ubicado en 10mo semestre (Requiere 158 UC).
          </li>
          <li>
            <strong>4. Alerta de Permanencia:</strong> Si tu eficiencia cae bajo el 25% (Artículo 3), verás una alerta
            para evitar la inhabilitación.
          </li>
        </GuideSection>
      </Modal>

      {/* =========================================
          MODAL DEPARTAMENTOS
          ========================================= */}
      <Modal open={deptsOpen} onClose={() => setDeptsOpen(false)} title="Departamentos EECA" icon={Building2}>
        <div className="space-y-3">
          {Object.values(deptData).map((d) => (
            <div
              key={d.key}
              className="flex items-start gap-4 rounded-xl border border-gray-200 border-l-4 bg-gray-50 p-4"
              style={{ borderLeftColor: d.color }}
            >
              <div>
                <h4 className="text-sm font-bold text-[#1a237e]">{d.name}</h4>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

/* =========================================
   SUB-COMPONENTES
   ========================================= */
function Modal({ open, onClose, title, icon: Icon, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="mb-5 flex items-center gap-2 border-b-2 border-gray-100 pb-3 text-xl font-extrabold text-[#1a237e]">
              {Icon && <Icon className="h-6 w-6 text-[#F5A623]" />}
              {title}
            </h3>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GuideSection({ icon, title, children }) {
  return (
    <div className="mb-6">
      <h4 className="mb-2.5 flex items-center gap-2 text-base font-bold text-[#F5A623]">
        <span>{icon}</span> {title}
      </h4>
      <ul className="space-y-2 list-none p-0 m-0">
        {Array.isArray(children)
          ? children.map((child, i) => (
              <li key={i} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                {child.props.children}
              </li>
            ))
          : (
              <li className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                {children}
              </li>
            )}
      </ul>
    </div>
  )
}

/* Util: clsx mínimo inline para no añadir dependencia */
function clsxLite(...args) {
  return args
    .flat()
    .filter(Boolean)
    .map((a) => {
      if (typeof a === 'string') return a
      if (typeof a === 'object') {
        return Object.entries(a)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(' ')
      }
      return ''
    })
    .join(' ')
}