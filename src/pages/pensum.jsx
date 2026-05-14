import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, BookOpen, Building2, Download, RefreshCw, AlertTriangle, Lock,
  GraduationCap, Search, Sparkles, CheckCircle2, Clock, XCircle,
  Circle, TrendingUp, ChevronRight, BarChart3, Zap,
} from 'lucide-react'
import { Container } from '@/components/container'
import { Navbar } from '@/components/navbar'

/* =========================================
   DATA
   ========================================= */
const deptData = {
  matematica: { name: 'Matemáticas', short: 'MAT', color: '#120b46', desc: 'Fundamentos de cálculo, álgebra lineal y análisis numérico.' },
  estadistica: { name: 'Estadística y Probabilidad', short: 'EST', color: '#F5A623', desc: 'Núcleo teórico de probabilidad e inferencia estadística.' },
  diseno: { name: 'Diseño Estadístico', short: 'DIS', color: '#475569', desc: 'Aplicación práctica, investigación de operaciones y muestreo.' },
  informatica: { name: 'Informática', short: 'INF', color: '#0ea5e9', desc: 'Programación y sistemas de información estadísticos.' },
  economia: { name: 'Economía Cuantitativa', short: 'ECO', color: '#d97706', desc: 'Análisis económico, econometría y evaluación de proyectos.' },
  actuarial: { name: 'Actuariales', short: 'ACT', color: '#7c3aed', desc: 'Matemática financiera, seguros y planes de pensiones.' },
  grado: { name: 'Requisitos de Egreso', short: 'TEG', color: '#dc2626', desc: 'Trabajo Especial de Grado.' },
  electiva: { name: 'Electivas', short: 'EL', color: '#94a3b8', desc: 'Asignaturas complementarias según especialización.' },
}

const subjects = [
  { id: '4000', name: 'Matemáticas I', uc: 8, dept: 'matematica', sem: 1, pre: [], esp: 'comun' },
  { id: '4100', name: 'Estadística I', uc: 8, dept: 'estadistica', sem: 1, pre: [], esp: 'comun' },
  { id: '4300', name: 'Computación I', uc: 4, dept: 'informatica', sem: 1, pre: [], esp: 'comun' },
  { id: '4001', name: 'Matemáticas II', uc: 8, dept: 'matematica', sem: 2, pre: ['4000'], esp: 'comun' },
  { id: '4101', name: 'Estadística II', uc: 8, dept: 'estadistica', sem: 2, pre: ['4100'], esp: 'comun' },
  { id: '4301', name: 'Computación II', uc: 4, dept: 'informatica', sem: 2, pre: ['4300'], esp: 'comun' },
  { id: '4002', name: 'Matemáticas III', uc: 8, dept: 'matematica', sem: 3, pre: ['4001'], esp: 'comun' },
  { id: '4003', name: 'Álgebra Lineal I', uc: 4, dept: 'matematica', sem: 3, pre: ['4001'], esp: 'comun' },
  { id: '4102', name: 'Teoría de la Probabilidad I', uc: 4, dept: 'estadistica', sem: 3, pre: ['4001', '4101'], esp: 'comun' },
  { id: '4302', name: 'Sistemas de Información', uc: 4, dept: 'informatica', sem: 3, pre: ['4301'], esp: 'comun' },
  { id: '4004', name: 'Matemáticas IV', uc: 4, dept: 'matematica', sem: 4, pre: ['4002', '4003'], esp: 'comun' },
  { id: '4005', name: 'Álgebra Lineal II', uc: 6, dept: 'matematica', sem: 4, pre: ['4003'], esp: 'comun' },
  { id: '4103', name: 'Teoría de la Probabilidad II', uc: 6, dept: 'estadistica', sem: 4, pre: ['4002', '4102'], esp: 'comun' },
  { id: '4400', name: 'Introducción a la Economía', uc: 4, dept: 'economia', sem: 4, pre: ['4001'], esp: 'comun' },
  { id: '4104', name: 'Teoría de la Probabilidad III', uc: 6, dept: 'estadistica', sem: 5, pre: ['4003', '4103'], esp: 'comun' },
  { id: '4401', name: 'Demografía', uc: 4, dept: 'economia', sem: 5, pre: ['4101', '4400'], esp: 'comun' },
  { id: '4402', name: 'Microeconomía', uc: 4, dept: 'economia', sem: 5, pre: ['4002', '4400'], esp: 'comun' },
  { id: '4303', name: 'Computación Estadística', uc: 4, dept: 'informatica', sem: 5, pre: ['4101', '4302'], esp: 'est' },
  { id: '4600', name: 'Matemáticas Financieras I', uc: 4, dept: 'actuarial', sem: 5, pre: ['4002'], esp: 'act' },
  { id: '4105', name: 'Inferencia Estadística', uc: 6, dept: 'estadistica', sem: 6, pre: ['4104'], esp: 'comun' },
  { id: '4106', name: 'Procesos Estocásticos', uc: 4, dept: 'estadistica', sem: 6, pre: ['4004', '4104'], esp: 'comun' },
  { id: '4403', name: 'Macroeconomía', uc: 4, dept: 'economia', sem: 6, pre: ['4402'], esp: 'est' },
  { id: '4200', name: 'Introd. al Diseño de Inv.', uc: 4, dept: 'diseno', sem: 6, pre: [], minUC: 80, esp: 'est' },
  { id: '4601', name: 'Seguros de Personas', uc: 4, dept: 'actuarial', sem: 6, pre: ['4600'], esp: 'act' },
  { id: '4602', name: 'Matemáticas Financieras II', uc: 4, dept: 'actuarial', sem: 6, pre: ['4600'], esp: 'act' },
  { id: '4603', name: 'Teoría de la Mortalidad', uc: 4, dept: 'actuarial', sem: 6, pre: ['4104', '4401'], esp: 'act' },
  { id: '4500', name: 'Investigación de Operaciones I', uc: 4, dept: 'diseno', sem: 7, pre: ['4004'], esp: 'est' },
  { id: '4107', name: 'Métodos Multivariantes', uc: 6, dept: 'estadistica', sem: 7, pre: ['4105'], esp: 'est' },
  { id: '4108', name: 'Series de Tiempo', uc: 4, dept: 'estadistica', sem: 7, pre: ['4105'], esp: 'est' },
  { id: '4201', name: 'Muestreo I', uc: 6, dept: 'diseno', sem: 7, pre: ['4105'], esp: 'est' },
  { id: '4700', name: 'Análisis Numérico', uc: 4, dept: 'actuarial', sem: 7, pre: ['4004'], esp: 'act' },
  { id: '4604', name: 'Seguros Patrimoniales', uc: 4, dept: 'actuarial', sem: 7, pre: ['4600'], esp: 'act' },
  { id: '4605', name: 'Matemáticas Actuariales I', uc: 8, dept: 'actuarial', sem: 7, pre: ['4602', '4603'], esp: 'act' },
  { id: '4501', name: 'Investigación de Operaciones II', uc: 4, dept: 'diseno', sem: 8, pre: ['4106', '4500'], esp: 'est' },
  { id: '4204', name: 'Control Estadístico de Calidad', uc: 6, dept: 'diseno', sem: 8, pre: ['4200', '4105'], esp: 'est' },
  { id: '4404', name: 'Econometría', uc: 4, dept: 'economia', sem: 8, pre: ['4403', '4107'], esp: 'est' },
  { id: '4202', name: 'Muestreo II', uc: 6, dept: 'diseno', sem: 8, pre: ['4201'], esp: 'est' },
  { id: '4606', name: 'Derecho del Seguro y Leg. Fin.', uc: 4, dept: 'actuarial', sem: 8, pre: ['4602', '4604'], esp: 'act' },
  { id: '4607', name: 'Teoría Mat. del Riesgo I', uc: 6, dept: 'actuarial', sem: 8, pre: ['4105', '4106'], esp: 'act' },
  { id: '4608', name: 'Matemáticas Actuariales II', uc: 6, dept: 'actuarial', sem: 8, pre: ['4700', '4605'], esp: 'act' },
  { id: '4609', name: 'Seguridad y Seguro Social', uc: 6, dept: 'actuarial', sem: 8, pre: ['4604'], esp: 'act' },
  { id: '4304', name: 'Sistemas de Información Est. I', uc: 4, dept: 'informatica', sem: 9, pre: [], minUC: 118, esp: 'est' },
  { id: '4405', name: 'Análisis de Mercado', uc: 4, dept: 'economia', sem: 9, pre: ['4202'], esp: 'est' },
  { id: '4203', name: 'Muestreo III', uc: 4, dept: 'diseno', sem: 9, pre: ['4202'], esp: 'est' },
  { id: '4205', name: 'Diseño de Experimentos', uc: 6, dept: 'diseno', sem: 9, pre: ['4200', '4107'], esp: 'est' },
  { id: '4610', name: 'Técnicas Actuariales', uc: 6, dept: 'actuarial', sem: 9, pre: ['4606', '4608'], esp: 'act' },
  { id: '4611', name: 'Teoría Mat. del Riesgo II', uc: 6, dept: 'actuarial', sem: 9, pre: ['4607'], esp: 'act' },
  { id: '4612', name: 'Matemáticas Actuariales III', uc: 6, dept: 'actuarial', sem: 9, pre: ['4608', '4609'], esp: 'act' },
  { id: 'EL-9', name: 'Electiva', uc: 4, dept: 'electiva', sem: 9, pre: [], minUC: 152, esp: 'comun' },
  { id: '4305', name: 'Sist. de Información Est. II', uc: 4, dept: 'informatica', sem: 10, pre: ['4304'], esp: 'est' },
  { id: '4406', name: 'Prep. y Eval. de Proyectos', uc: 6, dept: 'economia', sem: 10, pre: [], minUC: 156, esp: 'est' },
  { id: '4613', name: 'Técnicas de Reaseguro', uc: 4, dept: 'actuarial', sem: 10, pre: ['4610', '4611'], esp: 'act' },
  { id: '4614', name: 'Matemática de Pensiones', uc: 6, dept: 'actuarial', sem: 10, pre: ['4612'], esp: 'act' },
  { id: 'EL-10', name: 'Electiva', uc: 4, dept: 'electiva', sem: 10, pre: [], minUC: 156, esp: 'comun' },
  { id: '4900', name: 'Trabajo Especial de Grado', uc: 6, dept: 'grado', sem: 10, pre: [], minUC: 158, esp: 'comun' },
]

const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100' },
  cursando: { label: 'Cursando', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  aprobado: { label: 'Aprobado', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  reprobado: { label: 'Reprobado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
}

/* =========================================
   HOOK localStorage SSR-safe
   ========================================= */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) setValue(JSON.parse(stored))
    } catch (e) {}
    setIsHydrated(true)
  }, [key])

  useEffect(() => {
    if (!isHydrated) return
    try { window.localStorage.setItem(key, JSON.stringify(value)) } catch (e) {}
  }, [key, value, isHydrated])

  return [value, setValue]
}

/* =========================================
   MAIN
   ========================================= */
export default function Pensum() {
  const [states, setStates] = useLocalStorage('int_states_v2', {})
  const [gradesArray, setGradesArray] = useLocalStorage('int_grades_arr', {})
  const [currentEsp, setCurrentEsp] = useLocalStorage('int_esp', 'basico')
  const [scStatus, setScStatus] = useLocalStorage('int_sc_status', 'bloqueado')

  const [menuOpen, setMenuOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [deptsOpen, setDeptsOpen] = useState(false)
  const [deptProgressOpen, setDeptProgressOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [userName, setUserName] = useState('')
  const [recentlyApproved, setRecentlyApproved] = useState(null)

  const isSubjectApproved = useCallback((id) => {
    const intentos = gradesArray[id] || []
    return states[id] === 'aprobado' || (intentos.length > 0 && intentos[intentos.length - 1] >= 10)
  }, [states, gradesArray])

  const stats = useMemo(() => {
    let ucAprobGlobal = 0, cursandoUC = 0, totalUcInscritas = 0, puntosTotales = 0
    let matAprobadas = 0, matInscritasTotales = 0

    subjects.forEach((s) => {
      if (s.esp !== 'comun' && currentEsp !== 'basico' && s.esp !== currentEsp) return
      let inscripcionesEnMateria = 0
      const intentos = gradesArray[s.id] || []
      if (intentos.length > 0) {
        intentos.forEach((nota) => {
          inscripcionesEnMateria++
          totalUcInscritas += s.uc
          puntosTotales += nota * s.uc
          if (nota >= 10) { ucAprobGlobal += s.uc; matAprobadas++ }
        })
      }
      if (states[s.id] === 'cursando') { cursandoUC += s.uc; inscripcionesEnMateria++ }
      if (states[s.id] === 'reprobado' && intentos.length === 0) inscripcionesEnMateria++
      matInscritasTotales += inscripcionesEnMateria
    })

    const totalUcCarrera = 158
    const porcentaje = Math.min(100, Math.round((ucAprobGlobal / totalUcCarrera) * 100))
    const promedio = totalUcInscritas > 0 ? (puntosTotales / totalUcInscritas).toFixed(2) : '0.00'
    const eficiencia = matInscritasTotales > 0 ? (matAprobadas / matInscritasTotales).toFixed(2) : '1.00'
    const alertaPermanencia = matInscritasTotales > 0 && matAprobadas / matInscritasTotales < 0.25
    return { ucAprobGlobal, cursandoUC, porcentaje, promedio, eficiencia, alertaPermanencia, totalUcCarrera }
  }, [states, gradesArray, currentEsp])

  const deptProgress = useMemo(() => {
    const map = {}
    Object.keys(deptData).forEach((k) => (map[k] = { aprobadas: 0, total: 0, ucAprobadas: 0, ucTotal: 0 }))
    subjects.forEach((s) => {
      if (s.esp !== 'comun' && currentEsp !== 'basico' && s.esp !== currentEsp) return
      map[s.dept].total++
      map[s.dept].ucTotal += s.uc
      if (isSubjectApproved(s.id)) {
        map[s.dept].aprobadas++
        map[s.dept].ucAprobadas += s.uc
      }
    })
    return map
  }, [currentEsp, isSubjectApproved])

  useEffect(() => {
    if (stats.ucAprobGlobal >= 80 && scStatus === 'bloqueado') setScStatus('pendiente')
    else if (stats.ucAprobGlobal < 80 && scStatus !== 'bloqueado') setScStatus('bloqueado')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.ucAprobGlobal])

  const handleStatusChange = useCallback((id, val) => {
    const prevStatus = states[id]
    setStates((prev) => ({ ...prev, [id]: val }))
    if (val === 'pendiente' || val === 'cursando') {
      setGradesArray((prev) => { const next = { ...prev }; delete next[id]; return next })
    }
    if (val === 'aprobado' && prevStatus !== 'aprobado') {
      setRecentlyApproved(id)
      setTimeout(() => setRecentlyApproved(null), 1500)
    }
  }, [setStates, setGradesArray, states])

  const handleGradeInput = useCallback((id, index, val) => {
    const prevApproved = isSubjectApproved(id)
    setGradesArray((prev) => {
      let intentos = [...(prev[id] || [])]
      if (val === '') intentos.splice(index, 1)
      else intentos[index] = parseInt(val, 10)
      intentos = intentos.filter((n) => !isNaN(n))
      const next = { ...prev }
      if (intentos.length === 0) delete next[id]
      else next[id] = intentos

      setStates((prevStates) => {
        const nextStates = { ...prevStates }
        if (intentos.length > 0) {
          const ultima = intentos[intentos.length - 1]
          nextStates[id] = ultima >= 10 ? 'aprobado' : 'reprobado'
          if (ultima >= 10 && !prevApproved) {
            setRecentlyApproved(id)
            setTimeout(() => setRecentlyApproved(null), 1500)
          }
        } else { nextStates[id] = 'pendiente' }
        return nextStates
      })
      return next
    })
  }, [setGradesArray, setStates, isSubjectApproved])

  const reiniciarTodo = () => {
    if (confirm('¿Estás seguro de borrar todos tus datos y reiniciar el pensum?')) {
      setStates({}); setGradesArray({}); setCurrentEsp('basico'); setScStatus('bloqueado'); setMenuOpen(false)
    }
  }

  const generarReportePDF = async () => {
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')
    const doc = new jsPDF()
    const nombre = userName || 'Estudiante'
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(18, 11, 70)
    doc.text('REPORTE ACADÉMICO - EECA UCV', 105, 20, { align: 'center' })
    doc.setFontSize(10); doc.setFont('helvetica', 'normal')
    const espTxt = currentEsp === 'est' ? 'Estadística' : currentEsp === 'act' ? 'Actuarial' : 'Básico'
    doc.text(`Nombre: ${nombre} | Especialidad: ${espTxt}`, 14, 30)
    const scLabel = { bloqueado: 'Bloqueado', pendiente: 'Pendiente', induccion: 'Inducción Completada', proyecto: 'Realizando Proyecto', evaluacion: 'Esperando Evaluación', aprobado: 'Aprobado' }[scStatus]
    doc.text(`Servicio Comunitario: ${scLabel}`, 14, 35)

    const body = []
    subjects.forEach((s) => {
      if (s.esp !== 'comun' && currentEsp !== 'basico' && s.esp !== currentEsp) return
      const estado = states[s.id] || 'pendiente'
      const intentos = gradesArray[s.id] || []
      if (estado !== 'pendiente') {
        let reprobadasStr = ''; let notaDef = '-'
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
      startY: 42, head: [['Sem.', 'Asignatura', 'UC', 'Estado', 'Reprobadas', 'Nota Def.']], body, theme: 'grid',
      headStyles: { fillColor: [245, 166, 35], textColor: [255, 255, 255] },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 4 && data.cell.raw !== '') {
          data.cell.styles.textColor = [225, 29, 72]; data.cell.styles.fontStyle = 'bold'
        }
        if (data.section === 'body' && data.column.index === 5 && data.cell.raw !== '-' && data.cell.raw !== 'R') {
          data.cell.styles.textColor = [4, 120, 87]; data.cell.styles.fontStyle = 'bold'
        }
      },
    })
    doc.setFontSize(8); doc.setTextColor(120)
    const disclaimer = 'DOCUMENTO NO OFICIAL. Reporte referencial sin valor administrativo. Herramienta didáctica.'
    doc.text(doc.splitTextToSize(disclaimer, 180), 14, doc.lastAutoTable.finalY + 15)
    doc.save(`Reporte_EECA_${nombre}.pdf`)
  }

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (s.esp !== 'comun' && currentEsp !== 'basico' && s.esp !== currentEsp) return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.includes(search)) return false
      if (filterDept !== 'all' && s.dept !== filterDept) return false
      const status = states[s.id] || 'pendiente'
      if (filterStatus !== 'all' && status !== filterStatus) return false
      if (onlyAvailable) {
        const canTake = s.pre.every((p) => isSubjectApproved(p)) && (!s.minUC || stats.ucAprobGlobal >= s.minUC)
        if (!canTake || status === 'aprobado') return false
      }
      return true
    })
  }, [currentEsp, search, filterDept, filterStatus, onlyAvailable, states, isSubjectApproved, stats.ucAprobGlobal])

  const visibleSemesters = useMemo(() => {
    const sems = new Set(filteredSubjects.map((s) => s.sem))
    return Array.from(sems).sort((a, b) => a - b)
  }, [filteredSubjects])

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white text-slate-900 transition-colors">
        <Container className="p-4">
          <Navbar />
        </Container>

        <StickyTopBar
          stats={stats} currentEsp={currentEsp} setCurrentEsp={setCurrentEsp}
          scStatus={scStatus} setScStatus={setScStatus}
          setMenuOpen={setMenuOpen} setDeptProgressOpen={setDeptProgressOpen}
        />

        <Container className="px-4 pb-20">
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#F5A623]/10 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5A623]/15">
                <GraduationCap className="h-6 w-6 text-[#F5A623]" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-extrabold tracking-tight text-[#1a237e] sm:text-2xl">
                  Pensum Interactivo
                </h1>
                <p className="text-xs font-semibold text-[#F5A623] sm:text-sm">
                  &quot;La solución es la suma de todas las partes&quot;
                </p>
              </div>
            </div>
          </motion.header>

          <AnimatePresence>
            {stats.alertaPermanencia && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-start gap-3 overflow-hidden rounded-xl border border-rose-200 border-l-4 border-l-rose-600 bg-rose-50 p-4"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Alerta de Permanencia (Art. 3)</h4>
                  <p className="mt-0.5 text-xs text-rose-800">
                    Tu índice de aprobación es menor al 25%. Aprueba tus próximas asignaturas para evitar inhabilitación.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Toolbar
            search={search} setSearch={setSearch}
            filterDept={filterDept} setFilterDept={setFilterDept}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            onlyAvailable={onlyAvailable} setOnlyAvailable={setOnlyAvailable}
          />

          {visibleSemesters.length === 0 ? (
            <EmptyState onClear={() => { setSearch(''); setFilterDept('all'); setFilterStatus('all'); setOnlyAvailable(false) }} />
          ) : (
            <div className="space-y-6">
              {visibleSemesters.map((semNum) => (
                <SemesterRow
                  key={semNum} semNum={semNum}
                  semSubjects={filteredSubjects.filter((s) => s.sem === semNum)}
                  states={states} gradesArray={gradesArray}
                  isSubjectApproved={isSubjectApproved}
                  ucAprobGlobal={stats.ucAprobGlobal}
                  onStatusChange={handleStatusChange}
                  onGradeInput={handleGradeInput}
                  recentlyApproved={recentlyApproved}
                />
              ))}
            </div>
          )}

          <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs font-medium text-slate-500">
            Autor: <span className="font-extrabold tracking-wider text-[#1a237e]">INTÉGRATE</span>{' '}
            <span className="font-extrabold text-[#F5A623]">EECA</span>{' '}
            <span className="font-extrabold tracking-wider text-[#1a237e]">- UCV</span>
          </div>
        </Container>

        <OptionsPanel
          open={menuOpen} onClose={() => setMenuOpen(false)}
          stats={stats} userName={userName} setUserName={setUserName}
          onPDF={generarReportePDF} onReset={reiniciarTodo}
          onGuide={() => { setMenuOpen(false); setGuideOpen(true) }}
          onDepts={() => { setMenuOpen(false); setDeptsOpen(true) }}
          onDeptProgress={() => { setMenuOpen(false); setDeptProgressOpen(true) }}
        />

        <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Guía de Uso" icon={BookOpen}>
          <GuideContent />
        </Modal>

        <Modal open={deptsOpen} onClose={() => setDeptsOpen(false)} title="Departamentos EECA" icon={Building2}>
          <div className="space-y-3">
            {Object.entries(deptData).map(([key, d]) => (
              <div key={key} className="rounded-xl border border-slate-200 border-l-4 bg-slate-50 p-3" style={{ borderLeftColor: d.color }}>
                <div className="flex items-center gap-2">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white" style={{ backgroundColor: d.color }}>
                    {d.short}
                  </span>
                  <h4 className="text-sm font-bold text-[#1a237e]">{d.name}</h4>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{d.desc}</p>
              </div>
            ))}
          </div>
        </Modal>

        <Modal open={deptProgressOpen} onClose={() => setDeptProgressOpen(false)} title="Progreso por Departamento" icon={BarChart3}>
          <div className="space-y-3">
            {Object.entries(deptData).map(([key, d]) => {
              const p = deptProgress[key]
              if (p.total === 0) return null
              const pct = Math.round((p.aprobadas / p.total) * 100)
              return (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white" style={{ backgroundColor: d.color }}>{d.short}</span>
                      <span className="text-sm font-bold text-[#1a237e]">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{p.aprobadas}/{p.total}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full" style={{ backgroundColor: d.color }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>{pct}% completado</span>
                    <span>{p.ucAprobadas}/{p.ucTotal} UC</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Modal>
      </div>
    </div>
  )
}

/* =========================================
   TOP BAR STICKY
   ========================================= */
function StickyTopBar({ stats, currentEsp, setCurrentEsp, scStatus, setScStatus, setMenuOpen, setDeptProgressOpen }) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <Container className="px-4">
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3 overflow-x-auto sm:gap-4">
            <ProgressRing percentage={stats.porcentaje} />
            <div className="flex items-center gap-3 sm:gap-4">
              <StatMini label="UC" value={`${stats.ucAprobGlobal}/${stats.totalUcCarrera}`} color="text-[#F5A623]" />
              <StatMini label="Prom." value={stats.promedio} color="text-[#1a237e]" />
              <StatMini label="Cur." value={stats.cursandoUC} color="text-amber-600" />
              <StatMini label="Efic." value={stats.eficiencia} color="text-emerald-600" />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setDeptProgressOpen(true)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 sm:flex"
              aria-label="Progreso por depto"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#1a237e] px-3 text-xs font-bold text-white transition hover:bg-[#1a237e]/90"
            >
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Opciones</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3">
          <select
            value={currentEsp} onChange={(e) => setCurrentEsp(e.target.value)}
            className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#1a237e] outline-none transition focus:border-[#F5A623]"
          >
            <option value="basico">📚 Ciclo Básico</option>
            <option value="est">📊 Estadística</option>
            <option value="act">📈 Actuarial</option>
          </select>
          <select
            value={scStatus} onChange={(e) => setScStatus(e.target.value)}
            disabled={stats.ucAprobGlobal < 80}
            className={`shrink-0 cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold outline-none transition focus:border-[#F5A623] disabled:cursor-not-allowed disabled:opacity-50 ${
              scStatus === 'aprobado'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-[#1a237e]'
            }`}
          >
            <option value="bloqueado">🔒 SC: Requiere 80 UC</option>
            <option value="pendiente">📝 SC: Pendiente</option>
            <option value="induccion">📚 SC: Inducción</option>
            <option value="proyecto">⚙️ SC: Proyecto</option>
            <option value="evaluacion">⏳ SC: Evaluación</option>
            <option value="aprobado">✅ SC: Aprobado</option>
          </select>
        </div>
      </Container>
    </div>
  )
}

function StatMini({ label, value, color }) {
  return (
    <div className="flex shrink-0 flex-col items-start leading-tight">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm font-extrabold ${color}`}>{value}</span>
    </div>
  )
}

function ProgressRing({ percentage }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-200" />
        <motion.circle
          cx="22" cy="22" r={radius}
          stroke="url(#gradient)" strokeWidth="4" fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5A623" />
            <stop offset="100%" stopColor="#1a237e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-extrabold text-[#1a237e]">{percentage}%</span>
      </div>
    </div>
  )
}

/* =========================================
   TOOLBAR
   ========================================= */
function Toolbar({ search, setSearch, filterDept, setFilterDept, filterStatus, setFilterStatus, onlyAvailable, setOnlyAvailable }) {
  return (
    <div className="mb-5 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar materia o código..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={onlyAvailable} onClick={() => setOnlyAvailable(!onlyAvailable)} icon={Zap} label="Disponibles" accent />
        <div className="h-6 w-px shrink-0 self-center bg-slate-200" />
        <FilterChip active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} label="Todas" />
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <FilterChip key={key} active={filterStatus === key} onClick={() => setFilterStatus(key)} icon={cfg.icon} label={cfg.label} />
        ))}
        <div className="h-6 w-px shrink-0 self-center bg-slate-200" />
        <FilterChip active={filterDept === 'all'} onClick={() => setFilterDept('all')} label="Todos Depts" />
        {Object.entries(deptData).map(([key, d]) => (
          <FilterChip key={key} active={filterDept === key} onClick={() => setFilterDept(key)} label={d.short} color={d.color} />
        ))}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, icon: Icon, label, color, accent }) {
  const bgStyle = active && color ? { backgroundColor: color, borderColor: color } : undefined
  return (
    <button
      onClick={onClick}
      style={bgStyle}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? accent
            ? 'border-[#F5A623] bg-[#F5A623] text-white'
            : color
              ? 'text-white'
              : 'border-[#1a237e] bg-[#1a237e] text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  )
}

/* =========================================
   SEMESTER ROW
   ========================================= */
function SemesterRow({ semNum, semSubjects, states, gradesArray, isSubjectApproved, ucAprobGlobal, onStatusChange, onGradeInput, recentlyApproved }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5A623] to-[#F7B844] text-xs font-extrabold text-white">
          {semNum}
        </div>
        <h2 className="text-sm font-extrabold text-[#1a237e]">Semestre {semNum}</h2>
        <div className="ml-auto text-xs font-bold text-slate-400">
          {semSubjects.reduce((acc, s) => acc + s.uc, 0)} UC
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {semSubjects.map((s) => (
          <SubjectCard
            key={s.id} subject={s}
            status={states[s.id] || 'pendiente'}
            intentos={gradesArray[s.id] || []}
            isSubjectApproved={isSubjectApproved}
            ucAprobGlobal={ucAprobGlobal}
            onStatusChange={onStatusChange}
            onGradeInput={onGradeInput}
            recentlyApproved={recentlyApproved === s.id}
          />
        ))}
      </div>
    </motion.section>
  )
}

/* =========================================
   SUBJECT CARD
   ========================================= */
function SubjectCard({ subject: s, status, intentos, isSubjectApproved, ucAprobGlobal, onStatusChange, onGradeInput, recentlyApproved }) {
  const [expanded, setExpanded] = useState(false)
  const dept = deptData[s.dept]
  const canTake = s.pre.every((p) => isSubjectApproved(p)) && (!s.minUC || ucAprobGlobal >= s.minUC)
  const locked = status === 'pendiente' && !canTake
  const available = status === 'pendiente' && canTake

  const statusCfg = STATUS_CONFIG[status]
  const StatusIcon = statusCfg.icon
  const intentosKey = intentos.join('|')
  const [draftGrades, setDraftGrades] = useState(() => intentos.map((nota) => String(nota)))

  useEffect(() => {
    setDraftGrades(intentos.map((nota) => String(nota)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentosKey])

  const updateDraftGrade = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 2)
    setDraftGrades((prev) => {
      const next = [...prev]
      next[index] = cleanValue
      return next
    })
  }

  const commitDraftGrade = (index) => {
    const rawValue = (draftGrades[index] ?? '').trim()

    if (rawValue === '') {
      onGradeInput(s.id, index, '')
      return
    }

    const grade = Number(rawValue)

    if (!Number.isInteger(grade) || grade < 1 || grade > 20) {
      setDraftGrades(intentos.map((nota) => String(nota)))
      return
    }

    onGradeInput(s.id, index, String(grade))
  }

  return (
    <motion.div
      layout
      animate={recentlyApproved ? {
        boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0)', '0 0 0 8px rgba(16, 185, 129, 0.3)', '0 0 0 0 rgba(16, 185, 129, 0)'],
      } : {}}
      transition={{ duration: 1.5 }}
      className={`group relative overflow-hidden rounded-xl border bg-white transition ${
        status === 'aprobado' ? 'border-emerald-300'
          : status === 'cursando' ? 'border-amber-300'
          : status === 'reprobado' ? 'border-red-300'
          : available ? 'border-[#F5A623]/40 ring-1 ring-[#F5A623]/20'
          : 'border-slate-200'
      } ${locked ? 'opacity-50' : ''}`}
    >
      <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: dept.color }} />
      {available && <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F5A623]/5 to-transparent" />}

      <div className="relative p-3 pl-4">
        <div className="mb-2 flex items-start gap-2">
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold text-white" style={{ backgroundColor: dept.color }}>
            {dept.short}
          </span>
          <h3 className="flex-1 text-xs font-extrabold leading-tight text-[#1a237e]">{s.name}</h3>
          {available && <Sparkles className="h-3 w-3 shrink-0 animate-pulse text-[#F5A623]" />}
          {locked && <Lock className="h-3 w-3 shrink-0 text-slate-400" />}
        </div>

        <button
          onClick={() => !locked && setExpanded(!expanded)}
          disabled={locked}
          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${statusCfg.bg} ${statusCfg.color} ${!locked && 'hover:opacity-80'}`}
        >
          <span className="flex items-center gap-1.5">
            <StatusIcon className="h-3.5 w-3.5" />
            {statusCfg.label}
          </span>
          <span className="rounded bg-white/50 px-1.5 py-0.5 text-[10px] font-extrabold">{s.uc} UC</span>
        </button>

        <AnimatePresence>
          {expanded && !locked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
                <div className="grid grid-cols-4 gap-1">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    return (
                      <button
                        key={key}
                        onClick={() => onStatusChange(s.id, key)}
                        className={`flex flex-col items-center gap-0.5 rounded-md py-1.5 text-[9px] font-bold transition ${
                          status === key ? `${cfg.bg} ${cfg.color} ring-1 ring-current` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>

                {(status === 'aprobado' || status === 'reprobado') && (
                  <div>
                    <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Nota final:</div>
                    <div className="flex flex-wrap gap-1">
                      {intentos.map((nota, k) => {
                        const draftValue = draftGrades[k] ?? ''
                        const draftNumber = Number(draftValue)
                        const isFailingGrade = draftValue !== '' && draftNumber < 10

                        return (
                          <input
                            key={k}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={2}
                            value={draftValue}
                            onChange={(e) => updateDraftGrade(k, e.target.value)}
                            onBlur={() => commitDraftGrade(k)}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                            className={`h-8 w-10 rounded-md border text-center text-xs font-extrabold outline-none ${
                              isFailingGrade
                                ? 'border-red-300 bg-red-50 text-red-600'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            }`}
                          />
                        )
                      })}
                      {(intentos.length === 0 || intentos[intentos.length - 1] < 10) && (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={2}
                          placeholder="—"
                          value={draftGrades[intentos.length] ?? ''}
                          onChange={(e) => updateDraftGrade(intentos.length, e.target.value)}
                          onBlur={() => commitDraftGrade(intentos.length)}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                          className="h-8 w-10 rounded-md border border-slate-300 bg-slate-50 text-center text-xs font-bold text-[#1a237e] outline-none focus:border-[#F5A623]"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-[9px] font-semibold text-slate-400">Se guarda al salir del campo o presionar Enter.</p>
                  </div>
                )}

                {(s.pre.length > 0 || s.minUC) && (
                  <div>
                    <div className="mb-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Prelaciones:</div>
                    <div className="flex flex-wrap gap-1">
                      {s.pre.map((p) => {
                        const pSub = subjects.find((x) => x.id === p)
                        const approved = isSubjectApproved(p)
                        return (
                          <span
                            key={p}
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              approved
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                            title={pSub?.name}
                          >
                            {approved ? '✓' : '✗'} {pSub?.name?.substring(0, 14) || p}
                          </span>
                        )
                      })}
                      {s.minUC && (
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          ucAprobGlobal >= s.minUC
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {ucAprobGlobal}/{s.minUC} UC
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-[9px] font-bold text-slate-400">Cod: {s.id}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* =========================================
   EMPTY STATE
   ========================================= */
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <Search className="mb-3 h-10 w-10 text-slate-300" />
      <h3 className="text-sm font-bold text-[#1a237e]">Sin resultados</h3>
      <p className="mt-1 text-xs text-slate-500">No se encontraron materias con los filtros aplicados.</p>
      <button onClick={onClear} className="mt-4 rounded-lg bg-[#F5A623] px-4 py-2 text-xs font-bold text-white hover:opacity-90">
        Limpiar filtros
      </button>
    </div>
  )
}

/* =========================================
   OPTIONS PANEL
   ========================================= */
function OptionsPanel({ open, onClose, stats, userName, setUserName, onPDF, onReset, onGuide, onDepts, onDeptProgress }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 z-[1001] h-screen w-full max-w-sm overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#1a237e]">Panel de Control</h2>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-gradient-to-br from-[#1a237e] to-[#1a237e]/80 p-3 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Promedio</div>
                <div className="text-xl font-extrabold">{stats.promedio}</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#F5A623] to-[#F7B844] p-3 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">UC Aprobadas</div>
                <div className="text-xl font-extrabold">{stats.ucAprobGlobal}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cursando</div>
                <div className="text-xl font-extrabold text-[#1a237e]">{stats.cursandoUC}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Eficiencia</div>
                <div className="text-xl font-extrabold text-[#1a237e]">{stats.eficiencia}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs font-bold">
                <span className="text-slate-500">Progreso de la carrera</span>
                <span className="text-[#1a237e]">{stats.porcentaje}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${stats.porcentaje}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-[#F5A623] to-[#1a237e]"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Información</div>
              <div className="space-y-2">
                <ActionButton icon={TrendingUp} label="Progreso por Departamento" onClick={onDeptProgress} />
                <ActionButton icon={BookOpen} label="Guía de Uso" onClick={onGuide} />
                <ActionButton icon={Building2} label="Departamentos EECA" onClick={onDepts} />
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Exportar</div>
              <input
                type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                placeholder="Tu nombre para el PDF"
                className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-[#F5A623]"
              />
              <button
                onClick={onPDF}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5A623] py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Descargar Reporte PDF
              </button>
            </div>

            <button
              onClick={onReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <RefreshCw className="h-4 w-4" /> Reiniciar Pensum
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-[#1a237e] transition hover:border-slate-300 hover:bg-white"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#F5A623]" />
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </button>
  )
}

/* =========================================
   MODAL
   ========================================= */
function Modal({ open, onClose, title, icon: Icon, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="mb-5 flex items-center gap-2 pr-10 text-base font-extrabold text-[#1a237e]">
              {Icon && <Icon className="h-5 w-5 text-[#F5A623]" />}
              {title}
            </h3>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GuideContent() {
  const sections = [
    {
      icon: '📍', title: 'Inicio',
      items: [
        <><strong>Configura tu especialidad</strong> en la barra superior para adaptar tu pensum.</>,
        <><strong>Toca cualquier materia</strong> para expandirla y ver sus opciones.</>,
      ],
    },
    {
      icon: '🚥', title: 'Sistema de Notas',
      items: [
        <>Al marcar <strong>Aprobado</strong> o <strong>Reprobado</strong>, escribe tu nota (1-20).</>,
        <>Si la nota es <strong>menor a 10</strong>, automáticamente aparece otra casilla.</>,
      ],
    },
    {
      icon: '🔎', title: 'Filtros y Búsqueda',
      items: [
        <>Usa <strong>&quot;Disponibles&quot;</strong> para ver solo las materias que puedes inscribir ahora.</>,
        <>Filtra por <strong>departamento</strong> o <strong>estado</strong>.</>,
        <>La búsqueda acepta <strong>nombre o código</strong> de materia.</>,
      ],
    },
    {
      icon: '📜', title: 'Reglamentos',
      items: [
        <><strong>Servicio Comunitario:</strong> Se desbloquea con 80 UC.</>,
        <><strong>Trabajo de Grado:</strong> Requiere 158 UC.</>,
        <><strong>Permanencia:</strong> Alerta si tu eficiencia cae bajo 25%.</>,
      ],
    },
  ]
  return (
    <div className="space-y-4">
      {sections.map((sec, i) => (
        <div key={i}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#F5A623]">
            <span>{sec.icon}</span> {sec.title}
          </h4>
          <ul className="space-y-1.5">
            {sec.items.map((item, j) => (
              <li key={j} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}