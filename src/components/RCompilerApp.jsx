'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import RCompiler from '@/utils/RCompiler';
import { formatEnvAsConsole } from '@/utils/r-validator';
import {
  Play,
  Code,
  BarChart2,
  Terminal,
  AlertCircle,
  Info,
  HelpCircle,
  ThumbsUp,
  BookOpen,
  RefreshCw,
  Copy,
  X,
  ChevronLeft,
} from 'lucide-react';

// CodeMirror sólo en cliente
const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

// ============================================================
// Ejemplos
// ============================================================
const EXAMPLES = {
  basico: `# Operaciones básicas y vectores
x <- 10
y <- 5
suma <- x + y
producto <- x * y

# Crear un vector y calcular estadísticas
notas <- c(8.5, 7.2, 9.1, 6.8, 8.9)
promedio <- mean(notas)
maximo <- max(notas)
minimo <- min(notas)`,

  ventas: `# Ventas mensuales de una tienda (en miles de $)
ventas <- c(120, 145, 180, 210, 195, 250, 280, 305, 290, 320, 360, 410)
meses <- c("Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic")

# Estadísticas del año
total_anual <- sum(ventas)
promedio_mensual <- mean(ventas)
mejor_mes <- meses[which.max(ventas)]
crecimiento <- ventas[12] - ventas[1]

# Gráfico de evolución
barplot(ventas, names.arg=meses, main="Ventas mensuales 2024",
        xlab="Mes", ylab="Miles de $", col="rgba(245, 166, 35, 0.7)")`,

  trigonometria: `# Gráfico de la función coseno
x <- seq(-pi, pi, 0.1)
y <- cos(x)
plot(x, y, type="l", main="Función Coseno", xlab="x", ylab="cos(x)", col="rgba(245, 166, 35, 1)")`,

  estadisticas: `# Análisis estadístico de un vector
datos <- c(23, 45, 67, 32, 19, 21, 30, 55, 28, 42, 38, 49)

media <- mean(datos)
mediana <- median(datos)
desv_std <- sd(datos)
varianza <- var(datos)
rango <- max(datos) - min(datos)

# Histograma de los datos
hist(datos, breaks=6, main="Distribución de datos", xlab="Valores", ylab="Frecuencia", col="rgba(245, 166, 35, 0.6)")`,

  multiplesgraficos: `# Generar datos
x <- seq(0, 2*pi, 0.1)
y1 <- sin(x)
y2 <- cos(x)

# Gráfico 1: Seno
plot(x, y1, type="l", main="Seno", xlab="x", ylab="sin(x)", col="rgba(245, 166, 35, 1)")

# Gráfico 2: Coseno
plot(x, y2, type="l", main="Coseno", xlab="x", ylab="cos(x)", col="rgba(54, 162, 235, 1)")

# Gráfico 3: Histograma de datos aleatorios
datos <- c(2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8)
hist(datos, breaks=6, main="Histograma", xlab="Valor", ylab="Frecuencia", col="rgba(245, 166, 35, 0.6)")`,
};

const EXAMPLE_LABELS = {
  basico: 'Básico',
  ventas: 'Ventas anuales',
  trigonometria: 'Trigonometría',
  estadisticas: 'Estadísticas',
  multiplesgraficos: 'Múltiples gráficos',
};

// ============================================================
// Teclas rápidas para móvil
// ============================================================
const QUICK_KEYS = [
  { label: '<-', insert: '<- ' },
  { label: '( )', insert: '()', cursorOffset: -1 },
  { label: '[ ]', insert: '[]', cursorOffset: -1 },
  { label: '{ }', insert: '{}', cursorOffset: -1 },
  { label: '"', insert: '""', cursorOffset: -1 },
  { label: 'c()', insert: 'c()', cursorOffset: -1 },
  { label: ',', insert: ', ' },
  { label: '$', insert: '$' },
  { label: '#', insert: '# ' },
  { label: '==', insert: ' == ' },
  { label: '%%', insert: ' %% ' },
  { label: ':', insert: ':' },
  { label: '~', insert: ' ~ ' },
];

// ============================================================
// Chart.js config builder
// ============================================================
function buildChartConfig(call) {
  const { name, args = {} } = call;
  const { x, y, title, xLabel, yLabel, color, pointType, bins, labels, height } = args;

  const titleText = (title || '').toString().replace(/['"]/g, '') || nameToTitle(name);
  const xText = (xLabel || '').toString().replace(/['"]/g, '') || 'x';
  const yText = (yLabel || '').toString().replace(/['"]/g, '') || 'y';
  const baseColor = color || 'rgba(245, 166, 35, 0.6)';
  const borderColor = baseColor.includes('0.6') ? baseColor.replace('0.6', '1') : baseColor;

  const commonScales = {
    x: { title: { display: true, text: xText } },
    y: { title: { display: true, text: yText } },
  };
  const commonPlugins = {
    title: { display: true, text: titleText, font: { size: 16, weight: 'bold' } },
    legend: { display: false },
  };

  if (name === 'plot') {
    const xs = toArray(x);
    const ys = toArray(y);
    if (xs.length === 0 || ys.length === 0) return null;
    const isLine = pointType === 'l' || pointType === "'l'";
    return {
      type: isLine ? 'line' : 'scatter',
      data: {
        datasets: [{
          label: titleText,
          data: xs.map((v, i) => ({ x: v, y: ys[i] })),
          backgroundColor: baseColor,
          borderColor,
          pointRadius: isLine ? 0 : 4,
          pointHoverRadius: isLine ? 3 : 6,
          showLine: isLine,
          tension: 0.1,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: commonPlugins, scales: commonScales },
    };
  }

  if (name === 'hist') {
    const data = toArray(x);
    if (data.length === 0) return null;
    const numBins = Math.max(1, parseInt(bins, 10) || Math.ceil(Math.sqrt(data.length)));
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const binWidth = range / numBins;
    const counts = new Array(numBins).fill(0);
    for (const v of data) {
      const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
      counts[idx]++;
    }
    const labelsArr = counts.map((_, i) => (min + (i + 0.5) * binWidth).toFixed(2));
    return {
      type: 'bar',
      data: {
        labels: labelsArr,
        datasets: [{
          label: 'Frecuencia',
          data: counts,
          backgroundColor: baseColor,
          borderColor,
          borderWidth: 1,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: commonPlugins, scales: commonScales },
    };
  }

  if (name === 'barplot') {
    const data = toArray(height ?? x);
    return {
      type: 'bar',
      data: {
        labels: labels || data.map((_, i) => String(i + 1)),
        datasets: [{
          label: titleText,
          data,
          backgroundColor: baseColor,
          borderColor,
          borderWidth: 1,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: commonPlugins, scales: commonScales },
    };
  }

  if (name === 'pie') {
    const data = toArray(x);
    const palette = [
      'rgba(245, 166, 35, 0.7)', 'rgba(54, 162, 235, 0.7)',
      'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)',
      'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)',
    ];
    return {
      type: 'pie',
      data: {
        labels: labels || data.map((_, i) => String(i + 1)),
        datasets: [{
          label: titleText,
          data,
          backgroundColor: data.map((_, i) => palette[i % palette.length]),
          borderWidth: 1,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: commonPlugins },
    };
  }

  if (name === 'boxplot') {
    const data = toArray(x).slice().sort((a, b) => a - b);
    if (data.length === 0) return null;
    const q = (p) => data[Math.min(data.length - 1, Math.floor(data.length * p))];
    const q1 = q(0.25), median = q(0.5), q3 = q(0.75);
    const min = data[0], max = data[data.length - 1];
    return {
      type: 'bar',
      data: {
        labels: [titleText],
        datasets: [{
          label: 'Rango Q1-Q3',
          data: [q3 - q1],
          base: q1,
          backgroundColor: baseColor,
          borderColor,
          borderWidth: 1,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...commonPlugins,
          tooltip: {
            callbacks: {
              label: () => [
                `Min: ${min.toFixed(2)}`, `Q1: ${q1.toFixed(2)}`,
                `Mediana: ${median.toFixed(2)}`, `Q3: ${q3.toFixed(2)}`,
                `Max: ${max.toFixed(2)}`,
              ],
            },
          },
        },
        scales: commonScales,
      },
    };
  }

  return null;
}

function toArray(v) {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function nameToTitle(name) {
  const map = { plot: 'Gráfico', hist: 'Histograma', barplot: 'Gráfico de barras', pie: 'Gráfico circular', boxplot: 'Diagrama de caja' };
  return map[name] || 'Gráfico';
}

// ============================================================
// Hooks
// ============================================================
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const initial = window.visualViewport.height;
    const handler = () => {
      const current = window.visualViewport.height;
      setOpen(current < initial * 0.75);
    };
    window.visualViewport.addEventListener('resize', handler);
    return () => window.visualViewport.removeEventListener('resize', handler);
  }, []);
  return open;
}

// ============================================================
// Subcomponentes — DEFINIDOS A NIVEL DE MÓDULO, no dentro del padre.
// Definirlos adentro causa que React los desmonte/remonte en cada render,
// rompiendo el foco del editor (escribías una letra y perdías foco).
// ============================================================

const RunButton = ({ onClick, isRunning, size = 'normal', fullWidth = false }) => (
  <button
    onClick={onClick}
    disabled={isRunning}
    className={`flex items-center justify-center bg-[#F5A623] hover:bg-[#F5A623]/90 text-white rounded-lg shadow-sm transition-colors disabled:opacity-70 ${
      size === 'large' ? 'px-5 py-3 text-base' : 'px-4 py-2'
    } ${fullWidth ? 'w-full' : ''}`}
  >
    <Play className="h-5 w-5 mr-2" />
    {isRunning ? 'Ejecutando...' : 'Ejecutar'}
  </button>
);

const ExamplesBar = ({ onLoadExample }) => (
  <div className="flex items-center mb-3 justify-between flex-wrap gap-2">
    <div className="flex items-center">
      <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
      <span className="text-sm text-gray-600">Ejemplos:</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {Object.keys(EXAMPLES).map((key) => (
        <button
          key={key}
          onClick={() => onLoadExample(key)}
          className="px-2 py-1 text-xs bg-[#F5A623]/10 text-[#F5A623] rounded hover:bg-[#F5A623]/20 whitespace-nowrap"
        >
          {EXAMPLE_LABELS[key] || key}
        </button>
      ))}
    </div>
  </div>
);

// Editor envuelto en memo para evitar re-renders innecesarios cuando solo
// cambia algo del padre que no afecta al editor (output, plots, mensajes, etc).
const EditorBlock = memo(function EditorBlock({ value, onChange, onCreateView, extensions, isMobile }) {
  if (extensions.length === 0) return null;
  return (
    <CodeMirror
      value={value}
      height={isMobile ? '380px' : '500px'}
      extensions={extensions}
      onChange={onChange}
      theme="dark"
      onCreateEditor={onCreateView}
      className="border border-gray-200 rounded-lg overflow-hidden text-sm"
      basicSetup={{
        autocompletion: !isMobile,
        foldGutter: !isMobile,
      }}
    />
  );
});

const QuickKeysBar = ({ onInsert }) => (
  <div
    className="fixed left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 shadow-lg overflow-x-auto"
    style={{ bottom: 0 }}
  >
    <div className="flex items-center gap-1 px-2 py-2 min-w-max">
      {QUICK_KEYS.map((k) => (
        <button
          key={k.label}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onClick={() => onInsert(k.insert, k.cursorOffset || 0)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-100 rounded text-sm font-mono whitespace-nowrap min-w-[44px]"
        >
          {k.label}
        </button>
      ))}
    </div>
  </div>
);

// ResultsPanel ahora maneja el renderizado de gráficos internamente con su
// propio ref + useEffect. Esto garantiza que el contenedor exista en el DOM
// cuando intentamos dibujar, evitando el bug de "ref es null" cuando el panel
// recién se monta (pasa al cambiar de hasRun=false→true o de tab en móvil).
const ResultsPanel = ({ error, consoleVars, output, plots, onClear }) => {
  const chartContainerRef = useRef(null);
  const chartInstancesRef = useRef([]);
  const ChartRef = useRef(null);

  // Cargar Chart.js una vez
  useEffect(() => {
    let cancelled = false;
    import('chart.js').then(({ Chart, registerables }) => {
      if (cancelled) return;
      Chart.register(...registerables);
      ChartRef.current = Chart;
      // Forzar un re-dibujo al cargar Chart.js si ya hay plots pendientes
      renderPlots();
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPlots = () => {
    if (!chartContainerRef.current || !ChartRef.current) return;

    // Destruir instancias previas
    chartInstancesRef.current.forEach((c) => c.destroy());
    chartInstancesRef.current = [];
    chartContainerRef.current.innerHTML = '';

    for (const call of plots) {
      const config = buildChartConfig(call);
      if (!config) continue;

      const wrapper = document.createElement('div');
      wrapper.className = 'bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4';

      const canvasWrap = document.createElement('div');
      canvasWrap.style.position = 'relative';
      canvasWrap.style.height = '280px';

      const canvas = document.createElement('canvas');
      canvasWrap.appendChild(canvas);
      wrapper.appendChild(canvasWrap);
      chartContainerRef.current.appendChild(wrapper);

      const instance = new ChartRef.current(canvas, config);
      chartInstancesRef.current.push(instance);
    }
  };

  // Re-renderizar cuando cambian los plots
  useEffect(() => {
    renderPlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plots]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => chartInstancesRef.current.forEach((c) => c.destroy());
  }, []);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 lg:mb-6">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <Terminal className="h-5 w-5 mr-2 text-gray-700" />
            <h2 className="text-base sm:text-lg font-medium text-gray-800">Consola R</h2>
          </div>
          <button onClick={onClear} className="text-gray-500 hover:text-gray-700 p-2" title="Limpiar">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3 sm:p-5">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <pre className="text-red-700 text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">{error}</pre>
              </div>
            </div>
          ) : (consoleVars || output) ? (
            <pre className="bg-[#1E1E1E] text-[#D4D4D4] p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-mono whitespace-pre overflow-x-auto">
{output ? output + (consoleVars ? '\n' : '') : ''}{consoleVars}
            </pre>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-center text-sm">
              No hay resultados. Crea variables o usa <code>print()</code>.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-gray-700" />
          <h2 className="text-base sm:text-lg font-medium text-gray-800">Visualización</h2>
        </div>
        <div className="p-3 sm:p-5">
          <div ref={chartContainerRef} className="charts" />
          {plots.length === 0 && !error && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <BarChart2 className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 text-sm">
                Sin gráficos. Usa <code className="bg-gray-100 px-1 rounded">plot()</code>, <code className="bg-gray-100 px-1 rounded">hist()</code> o <code className="bg-gray-100 px-1 rounded">barplot()</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const TipsBoxDesktop = ({ onClose }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
    <div className="flex items-start">
      <Info className="h-6 w-6 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-medium text-amber-800 mb-1">Consejos para empezar</h3>
        <p className="text-amber-700 text-sm mb-2">
          Este compilador interpreta código R y lo ejecuta directamente en el navegador. Funciones soportadas:
        </p>
        <ul className="text-amber-700 text-sm list-disc pl-5 space-y-1">
          <li><code className="bg-amber-100 px-1 rounded">c(), seq(), rep()</code> — crear vectores</li>
          <li><code className="bg-amber-100 px-1 rounded">mean(), median(), sd(), var()</code> — estadísticas</li>
          <li><code className="bg-amber-100 px-1 rounded">plot(), hist(), barplot(), pie()</code> — gráficos</li>
          <li><code className="bg-amber-100 px-1 rounded">matrix(), data.frame(), list()</code> — estructuras</li>
          <li><code className="bg-amber-100 px-1 rounded">if/else, for, while, function</code> — control de flujo</li>
        </ul>
        <p className="text-amber-700 text-sm mt-2">
          Las variables que crees se mostrarán automáticamente en la consola, como en R real.
        </p>
      </div>
      <button className="text-amber-600 hover:text-amber-800 ml-2 flex-shrink-0" onClick={onClose}>
        <ThumbsUp className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const TipsBoxMobile = ({ onClose }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
    <div className="flex items-start">
      <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-amber-800 text-sm mb-1">Funciones soportadas</h3>
        <p className="text-amber-700 text-xs leading-relaxed">
          <code className="bg-amber-100 px-1 rounded">c() seq() mean() sd()</code> · gráficos:{' '}
          <code className="bg-amber-100 px-1 rounded">plot() hist() barplot()</code> · estructuras:{' '}
          <code className="bg-amber-100 px-1 rounded">if for while function</code>
        </p>
      </div>
      <button className="text-amber-600 ml-2 flex-shrink-0" onClick={onClose}>
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const WelcomeScreen = ({ onRun }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-8 text-center">
    <div className="w-20 h-20 rounded-full bg-[#F5A623]/10 mx-auto flex items-center justify-center mb-4">
      <Play className="h-10 w-10 text-[#F5A623]" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">Compilador R listo</h3>
    <p className="text-gray-600 mb-6">
      Escribe tu código R y haz clic en Ejecutar para ver los resultados y visualizaciones.
    </p>
    <button onClick={onRun} className="px-6 py-3 bg-[#F5A623] hover:bg-[#F5A623]/90 text-white rounded-lg shadow-sm transition-colors">
      Ejecutar código
    </button>
    <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
      <HelpCircle className="h-4 w-4 mr-1" />
      <span>El código se ejecutará en tu navegador de manera segura</span>
    </div>
  </div>
);

// ============================================================
// Componente principal
// ============================================================
const RCompilerApp = () => {
  const [rCode, setRCode] = useState(EXAMPLES.trigonometria);
  const [output, setOutput] = useState('');
  const [consoleVars, setConsoleVars] = useState('');
  const [plots, setPlots] = useState([]);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [extensions, setExtensions] = useState([]);
  const [mobileTab, setMobileTab] = useState('editor');

  const compilerRef = useRef(null);
  const codeMirrorViewRef = useRef(null);

  const isMobile = useIsMobile();
  const keyboardOpen = useKeyboardOpen();

  useEffect(() => {
    compilerRef.current = new RCompiler();
    import('codemirror-lang-r')
      .then((r) => setExtensions([r.r()]))
      .catch((err) => console.error('Error cargando CodeMirror:', err));
  }, []);

  const runCode = () => {
    if (!compilerRef.current) return;
    setIsRunning(true);
    setHasRun(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = compilerRef.current.run(rCode);
      if (result.error) {
        setError(`Error: ${result.error.message}`);
        setOutput('');
        setConsoleVars('');
        setPlots([]);
      } else {
        setOutput(result.output || '');
        setConsoleVars(formatEnvAsConsole(result.env || {}));
        setPlots(result.plots || []);
        setSuccessMessage('¡Código ejecutado correctamente!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      if (isMobile) setMobileTab('results');
    } catch (err) {
      setError(`Error inesperado: ${err.message}`);
      if (isMobile) setMobileTab('results');
    } finally {
      setIsRunning(false);
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(rCode).then(() => {
      setSuccessMessage('Código copiado al portapapeles');
      setTimeout(() => setSuccessMessage(''), 2000);
    });
  };

  const loadExample = (key) => {
    if (!EXAMPLES[key]) return;
    setRCode(EXAMPLES[key]);
    setTimeout(runCode, 50);
  };

  const clearOutput = () => {
    setOutput('');
    setConsoleVars('');
    setError('');
    setPlots([]);
    setSuccessMessage('');
  };

  const onCreateView = (view) => {
    codeMirrorViewRef.current = view;
  };

  const insertAtCursor = (insert, cursorOffset = 0) => {
    const view = codeMirrorViewRef.current;
    if (!view) {
      setRCode((c) => c + insert);
      return;
    }
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + insert.length + cursorOffset },
    });
    view.focus();
  };

  const bottomPadding = isMobile && keyboardOpen ? 'pb-16' : '';

  return (
    <div className={`bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.06)_100%)] min-h-screen ${bottomPadding}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* ============ MÓVIL: tabs ============ */}
        {isMobile && (
          <div className="lg:hidden">
            <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setMobileTab('editor')}
                  className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                    mobileTab === 'editor' ? 'border-[#F5A623] text-[#F5A623]' : 'border-transparent text-gray-500'
                  }`}
                >
                  <Code className="h-4 w-4" />
                  Editor
                </button>
                <button
                  onClick={() => setMobileTab('results')}
                  disabled={!hasRun}
                  className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                    mobileTab === 'results' ? 'border-[#F5A623] text-[#F5A623]' : 'border-transparent text-gray-500 disabled:opacity-40'
                  }`}
                >
                  <Terminal className="h-4 w-4" />
                  Resultados
                  {hasRun && plots.length > 0 && (
                    <span className="ml-1 bg-[#F5A623] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                      {plots.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {mobileTab === 'editor' && (
              <>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <Code className="h-5 w-5 mr-2 text-[#F5A623]" />
                      <h2 className="text-base font-medium text-gray-800">Código R</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={copyCodeToClipboard} className="p-2 text-gray-500 hover:text-gray-700" title="Copiar">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={clearOutput} className="p-2 text-gray-500 hover:text-gray-700" title="Limpiar">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <ExamplesBar onLoadExample={loadExample} />
                    <EditorBlock
                      value={rCode}
                      onChange={setRCode}
                      onCreateView={onCreateView}
                      extensions={extensions}
                      isMobile={isMobile}
                    />
                    {successMessage && (
                      <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2 text-green-700 text-sm">
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage('')}>
                          <X className="h-4 w-4 text-green-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!keyboardOpen && (
                  <div className="sticky bottom-4 z-10">
                    <RunButton onClick={runCode} isRunning={isRunning} size="large" fullWidth />
                  </div>
                )}
              </>
            )}

            {mobileTab === 'results' && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={() => setMobileTab('editor')}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Volver al editor
                  </button>
                  <RunButton onClick={runCode} isRunning={isRunning} />
                </div>
                <ResultsPanel
                  error={error}
                  consoleVars={consoleVars}
                  output={output}
                  plots={plots}
                  onClear={clearOutput}
                />
              </>
            )}

            {mobileTab === 'editor' && showTips && (
              <TipsBoxMobile onClose={() => setShowTips(false)} />
            )}
          </div>
        )}

        {/* ============ DESKTOP: split ============ */}
        {!isMobile && (
          <div className="hidden lg:flex flex-row items-start gap-6">
            <div className="w-7/12 flex flex-col">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <Code className="h-5 w-5 mr-2 text-[#F5A623]" />
                    <h2 className="text-lg font-medium text-gray-800">Editor de Código R</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={copyCodeToClipboard} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Copiar">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={clearOutput} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded" title="Limpiar">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <RunButton onClick={runCode} isRunning={isRunning} />
                  </div>
                </div>
                <div className="p-5">
                  <ExamplesBar onLoadExample={loadExample} />
                  <EditorBlock
                    value={rCode}
                    onChange={setRCode}
                    onCreateView={onCreateView}
                    extensions={extensions}
                    isMobile={isMobile}
                  />
                  {successMessage && (
                    <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">
                      <span>{successMessage}</span>
                      <button onClick={() => setSuccessMessage('')}>
                        <X className="h-4 w-4 text-green-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showTips && <TipsBoxDesktop onClose={() => setShowTips(false)} />}
            </div>

            <div className="w-5/12 flex flex-col">
              {!hasRun ? (
                <WelcomeScreen onRun={runCode} />
              ) : (
                <ResultsPanel
                  error={error}
                  consoleVars={consoleVars}
                  output={output}
                  plots={plots}
                  onClear={clearOutput}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {isMobile && mobileTab === 'editor' && keyboardOpen && (
        <QuickKeysBar onInsert={insertAtCursor} />
      )}
    </div>
  );
};

export default RCompilerApp;