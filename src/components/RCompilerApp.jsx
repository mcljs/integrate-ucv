'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import RCompiler from '@/utils/RCompiler';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Importaciones dinámicas para evitar errores de SSR en Next.js
const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

const ReactR = dynamic(
  () => import('codemirror-lang-r').then((mod) => mod),
  { ssr: false }
);

const ChartModule = dynamic(
  () => import('chart.js').then((mod) => {
    mod.Chart.register(...mod.registerables);
    return mod;
  }),
  { ssr: false }
);

// Ejemplos predefinidos
const EXAMPLES = {
  trigonometria: `# Gráfico de función trigonométrica
x <- seq(-pi, pi, 0.1)
y <- cos(x)
plot(x, y, main="Función coseno", xlab="x", ylab="cos(x)")`,
  estadisticas: `# Análisis estadístico básico
datos <- c(12, 15, 18, 22, 30, 35, 40, 41, 42, 48, 50)
print("Estadísticas descriptivas:")
print(paste("Media:", mean(datos)))
print(paste("Mediana:", median(datos)))
print(paste("Desviación estándar:", sd(datos)))
print(paste("Varianza:", var(datos)))
print(paste("Rango:", min(datos), "-", max(datos)))

# Histograma
hist(datos, main="Distribución de datos", xlab="Valor", ylab="Frecuencia", col="orange")`,
  multiplesgraficos: `# Múltiples tipos de gráficos
x <- c(1, 2, 3, 4, 5)
y1 <- c(2, 4, 6, 8, 10)
y2 <- c(1, 3, 5, 7, 9)

# Gráfico de dispersión con líneas
plot(x, y1, type="o", col="blue", main="Gráfico combinado", xlab="X", ylab="Y")
lines(x, y2, type="o", col="red")`,
  basico: `# Ejemplo básico
x <- c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
y <- 2 * x + 5
media_x <- mean(x)
media_y <- mean(y)

# Imprime resultados
print(paste("Media de x:", media_x))
print(paste("Media de y:", media_y))

# Crea un gráfico
plot(x, y, main="Línea y = 2x + 5", xlab="X", ylab="Y")`
};

// Componente principal
const RCompilerApp = () => {
  const [rCode, setRCode] = useState(EXAMPLES.trigonometria);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [showExamples, setShowExamples] = useState(false);
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const chartContainerRef = useRef(null);
  const chartsRef = useRef([]);
  const currentChartRef = useRef(null);
  const [extensions, setExtensions] = useState([]);
  const compilerRef = useRef(null);

  // Inicializar extensiones y compilador después de que el componente se monte (client-side)
  useEffect(() => {
    const initializeExtensions = async () => {
      try {
        const r = await import('codemirror-lang-r');
        setExtensions([r.r()]);
      } catch (err) {
        console.error("Error loading CodeMirror extensions:", err);
      }
    };

    // Inicializar el compilador
    compilerRef.current = new RCompiler();
    
    initializeExtensions();

    // Cargar Chart.js
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);
    });
    
    // Ejecutar código automáticamente al cargar la página
    setTimeout(() => {
      runCode();
    }, 1000);
  }, []);
  
  // Compilar código R a JavaScript
  const compileCode = () => {
    if (!compilerRef.current) return null;
    
    try {
      setError('');
      const compiledCode = compilerRef.current.compile(rCode);
      return compiledCode;
    } catch (err) {
      setError(`Error de compilación: ${err.message}`);
      return null;
    }
  };
  
  // Ejecutar el código JavaScript compilado
  const runCode = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setSuccessMessage('');
    setError('');
    
    const compiledCode = compileCode();
    if (!compiledCode) {
      setIsRunning(false);
      return;
    }
    
    // Limpiar gráficos anteriores
    if (chartsRef.current.length > 0) {
      chartsRef.current.forEach(chart => chart.destroy());
      chartsRef.current = [];
    }
    
    // Limpiar contenedor de gráficos
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
    }
    
    try {
      // Importar Chart.js dinámicamente
      const { Chart } = await import('chart.js');
      
      // Capturar la salida
      let capturedOutput = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        capturedOutput.push(args.join(' '));
        originalConsoleLog.apply(console, args);
      };
      
      // Crear función auxiliar para gráficos
      window.createPlot = (options) => {
        const { 
          x, y, data, type, title, xLabel, yLabel, bins, 
          color, pointType, pointSymbol, lineType, lineWidth,
          labels, colors
        } = options;
        
        // Crear un nuevo div y canvas para el gráfico
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-wrapper bg-white p-4 rounded-lg shadow-sm mb-5';
        chartDiv.style.width = '100%';
        
        const chartTitle = document.createElement('h3');
        chartTitle.textContent = title.replace(/['"]/g, '');
        chartTitle.className = 'text-center text-lg font-semibold text-gray-800 mb-3';
        chartDiv.appendChild(chartTitle);
        
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '350px';
        chartDiv.appendChild(canvas);
        
        chartContainerRef.current.appendChild(chartDiv);
        
        let chartConfig;
        currentChartRef.current = { canvas, options };
        
        if (type === 'scatter') {
          const pointColor = color || 'rgba(245, 166, 35, 0.6)';
          const pointBorderColor = color ? color.replace('0.6', '1') : 'rgba(245, 166, 35, 1)';
          const plotType = pointType === "'l'" ? 'line' : 'scatter';
          
          chartConfig = {
            type: plotType,
            data: {
              datasets: [{
                label: title,
                data: x.map((val, idx) => ({ x: val, y: y[idx] })),
                backgroundColor: pointColor,
                borderColor: pointBorderColor,
                pointRadius: plotType === 'line' ? 0 : 5,
                pointHoverRadius: plotType === 'line' ? 3 : 7,
                showLine: pointType === "'l'" || pointType === "'o'" || pointType === "'b'",
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: title,
                  font: {
                    size: 16,
                    weight: 'bold'
                  }
                },
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: xLabel
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: yLabel
                  }
                }
              }
            }
          };
        } else if (type === 'histogram') {
          // Calcular histograma
          const min = Math.min(...data);
          const max = Math.max(...data);
          const binWidth = (max - min) / bins;
          const histogram = Array(bins).fill(0);
          
          data.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
            histogram[binIndex]++;
          });
          
          const binLabels = Array(bins).fill(0).map((_, i) => min + (i + 0.5) * binWidth);
          
          chartConfig = {
            type: 'bar',
            data: {
              labels: binLabels.map(v => v.toFixed(2)),
              datasets: [{
                label: 'Frecuencia',
                data: histogram,
                backgroundColor: color || 'rgba(245, 166, 35, 0.6)',
                borderColor: (color || 'rgba(245, 166, 35, 0.6)').replace('0.6', '1'),
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: title,
                  font: {
                    size: 16,
                    weight: 'bold'
                  }
                },
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: xLabel
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: yLabel
                  }
                }
              }
            }
          };
        } else if (type === 'boxplot') {
          // Implementación básica de boxplot utilizando Chart.js
          // En una aplicación real, se usaría una extensión específica
          const sortedData = [...data].sort((a, b) => a - b);
          const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
          const median = sortedData[Math.floor(sortedData.length * 0.5)];
          const q3 = sortedData[Math.floor(sortedData.length * 0.75)];
          const iqr = q3 - q1;
          const min = Math.max(...sortedData.filter(v => v >= q1 - 1.5 * iqr));
          const max = Math.min(...sortedData.filter(v => v <= q3 + 1.5 * iqr));
          
          chartConfig = {
            type: 'bar',
            data: {
              labels: [title],
              datasets: [
                {
                  label: 'Min a Max',
                  data: [max - min],
                  backgroundColor: 'transparent',
                  borderColor: color || 'rgba(245, 166, 35, 1)',
                  borderWidth: 2,
                  barPercentage: 0.3,
                  base: min
                },
                {
                  label: 'Q1 a Q3',
                  data: [q3 - q1],
                  backgroundColor: color || 'rgba(245, 166, 35, 0.6)',
                  borderColor: (color || 'rgba(245, 166, 35, 0.6)').replace('0.6', '1'),
                  borderWidth: 2,
                  barPercentage: 0.5,
                  base: q1
                },
                {
                  label: 'Mediana',
                  data: [0.1],
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  barPercentage: 0.8,
                  base: median - 0.05
                }
              ]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: title,
                  font: {
                    size: 16,
                    weight: 'bold'
                  }
                },
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    title: () => title,
                    label: () => {
                      return [
                        `Min: ${min.toFixed(2)}`,
                        `Q1: ${q1.toFixed(2)}`,
                        `Mediana: ${median.toFixed(2)}`,
                        `Q3: ${q3.toFixed(2)}`,
                        `Max: ${max.toFixed(2)}`
                      ];
                    }
                  }
                }
              },
              scales: {
                y: {
                  stacked: false,
                  title: {
                    display: true,
                    text: xLabel
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: yLabel
                  }
                }
              }
            }
          };
        } else if (type === 'bar') {
          chartConfig = {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: title,
                data: data,
                backgroundColor: color || 'rgba(245, 166, 35, 0.6)',
                borderColor: (color || 'rgba(245, 166, 35, 0.6)').replace('0.6', '1'),
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: title,
                  font: {
                    size: 16,
                    weight: 'bold'
                  }
                },
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: xLabel
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: yLabel
                  }
                }
              }
            }
          };
        } else if (type === 'pie') {
          chartConfig = {
            type: 'pie',
            data: {
              labels: labels,
              datasets: [{
                label: title,
                data: data,
                backgroundColor: colors || [
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: colors ? colors.map(c => c.replace('0.6', '1')) : [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: title,
                  font: {
                    size: 16,
                    weight: 'bold'
                  }
                }
              }
            }
          };
        }
        
        // Crear y almacenar la instancia del gráfico
        const chartInstance = new Chart(canvas, chartConfig);
        chartsRef.current.push(chartInstance);
        
        // Retornar algún valor para que el código continúe
        return 0;
      };

      // Funciones para añadir elementos a un gráfico existente
      window.addLines = (options) => {
        if (!currentChartRef.current) return 0;
        
        const { x, y, color, lineType, lineWidth } = options;
        const chart = chartsRef.current[chartsRef.current.length - 1];
        
        if (chart && chart.config && chart.config.type === 'scatter') {
          // Añadir nueva línea a un gráfico de dispersión existente
          chart.data.datasets.push({
            label: 'Line',
            data: x.map((val, idx) => ({ x: val, y: y[idx] })),
            backgroundColor: color || 'rgba(255, 99, 132, 0.6)',
            borderColor: color || 'rgba(255, 99, 132, 1)',
            pointRadius: 0,
            showLine: true,
            borderWidth: parseInt(lineWidth) || 2,
            borderDash: lineType === "'dashed'" ? [5, 5] : (lineType === "'dotted'" ? [2, 2] : [])
          });
          
          chart.update();
        }
        
        return 0;
      };
      
      window.addPoints = (options) => {
        if (!currentChartRef.current) return 0;
        
        const { x, y, pointType, color, size } = options;
        const chart = chartsRef.current[chartsRef.current.length - 1];
        
        if (chart && chart.config && chart.config.type === 'scatter') {
          // Añadir nuevos puntos a un gráfico de dispersión existente
          chart.data.datasets.push({
            label: 'Points',
            data: x.map((val, idx) => ({ x: val, y: y[idx] })),
            backgroundColor: color || 'rgba(255, 99, 132, 0.6)',
            borderColor: color || 'rgba(255, 99, 132, 1)',
            pointRadius: parseInt(size) * 3 || 5,
            pointHoverRadius: parseInt(size) * 4 || 7,
            showLine: false
          });
          
          chart.update();
        }
        
        return 0;
      };
      
      // Definir la función print para R
      window.print = (str) => {
        capturedOutput.push(str);
      };
      
      // Definir la función paste para R
      window.paste = (...args) => {
        return args.join('');
      };
      
      // Ejecutar el código compilado
      try {
        // eslint-disable-next-line no-new-func
        const execFunc = new Function(compiledCode);
        execFunc();
        
        // Mostrar mensaje de éxito
        setSuccessMessage('¡Código ejecutado correctamente!');
        
        // Restaurar console.log
        console.log = originalConsoleLog;
        
        // Actualizar la salida
        setOutput(capturedOutput.join('\n'));
      } catch (err) {
        setError(`Error de ejecución: ${err.message}`);
        console.log = originalConsoleLog;
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };
  
  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(rCode).then(() => {
      setSuccessMessage('Código copiado al portapapeles');
      setTimeout(() => setSuccessMessage(''), 3000);
    });
  };
  
  const loadExample = (exampleKey) => {
    setRCode(EXAMPLES[exampleKey]);
    setTimeout(() => {
      runCode();
    }, 100);
  };
  
  const clearOutput = () => {
    setOutput('');
    setError('');
    setSuccessMessage('');
    
    // Limpiar gráficos
    if (chartsRef.current.length > 0) {
      chartsRef.current.forEach(chart => chart.destroy());
      chartsRef.current = [];
    }
    
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
    }
  };
  
  return (
    <div className="bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.06)_100%)] min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Panel izquierdo: Editor de código */}
          <div className="w-full lg:w-7/12 flex flex-col">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <Code className="h-5 w-5 mr-2 text-[#F5A623]" />
                  <h2 className="text-lg font-medium text-gray-800">Editor de Código R</h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={copyCodeToClipboard}
                    className="flex items-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Copiar código"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={clearOutput}
                    className="flex items-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Limpiar resultados"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={runCode}
                    disabled={isRunning} 
                    className="flex items-center px-4 py-2 bg-[#F5A623] hover:bg-[#F5A623]/90 text-white rounded-lg shadow-sm transition-colors disabled:opacity-70"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isRunning ? 'Ejecutando...' : 'Ejecutar'}
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                {/* Ejemplo seleccionado y barra de ejemplos */}
                <div className="flex items-center mb-4 justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Ejemplos:</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadExample('trigonometria')}
                      className="px-2 py-1 text-xs bg-[#F5A623]/10 text-[#F5A623] rounded hover:bg-[#F5A623]/20"
                    >
                      Trigonometría
                    </button>
                    <button
                      onClick={() => loadExample('estadisticas')}
                      className="px-2 py-1 text-xs bg-[#F5A623]/10 text-[#F5A623] rounded hover:bg-[#F5A623]/20"
                    >
                      Estadísticas
                    </button>
                    <button
                      onClick={() => loadExample('multiplesgraficos')}
                      className="px-2 py-1 text-xs bg-[#F5A623]/10 text-[#F5A623] rounded hover:bg-[#F5A623]/20"
                    >
                      Múltiples gráficos
                    </button>
                    <button
                      onClick={() => loadExample('basico')}
                      className="px-2 py-1 text-xs bg-[#F5A623]/10 text-[#F5A623] rounded hover:bg-[#F5A623]/20"
                    >
                      Básico
                    </button>
                  </div>
                </div>
                
                {extensions.length > 0 && (
                  <CodeMirror
                    value={rCode}
                    height="500px"
                    extensions={extensions}
                    onChange={(value) => setRCode(value)}
                    theme="dark"
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  />
                )}
                
                {/* Mensaje de éxito */}
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
            
            {/* Panel de consejos/tips */}
            {showTips && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <Info className="h-6 w-6 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Consejos para empezar</h3>
                    <p className="text-amber-700 text-sm mb-2">
                      Este compilador interpreta código R y lo ejecuta directamente en el navegador. Algunas funciones básicas soportadas:
                    </p>
                    <ul className="text-amber-700 text-sm list-disc pl-5 space-y-1">
                      <li><code className="bg-amber-100 px-1 rounded">c()</code> - Para crear vectores</li>
                      <li><code className="bg-amber-100 px-1 rounded">mean(), sum(), sd()</code> - Funciones estadísticas básicas</li>
                      <li><code className="bg-amber-100 px-1 rounded">plot(), hist()</code> - Visualizaciones</li>
                      <li><code className="bg-amber-100 px-1 rounded">print()</code> - Para mostrar resultados</li>
                      <li><code className="bg-amber-100 px-1 rounded">seq(from, to, by)</code> - Para generar secuencias</li>
                      <li><code className="bg-amber-100 px-1 rounded">cos(), sin()</code> - Funciones trigonométricas</li>
                    </ul>
                    <p className="text-amber-700 text-sm mt-2">
                      Escribe tu código R y haz clic en "Ejecutar" para ver los resultados y gráficos.
                    </p>
                  </div>
                  <button 
                    className="text-amber-600 hover:text-amber-800 ml-2 flex-shrink-0"
                    onClick={() => setShowTips(false)}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Panel derecho: Resultados */}
          <div className="w-full lg:w-5/12 flex flex-col">
            {showOutput ? (
              <>
                {/* Salida del programa */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <Terminal className="h-5 w-5 mr-2 text-gray-700" />
                      <h2 className="text-lg font-medium text-gray-800">Resultados de ejecución</h2>
                    </div>
                    <button 
                      onClick={clearOutput}
                      className="text-gray-500 hover:text-gray-700"
                      title="Limpiar resultados"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    {error ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                          <pre className="text-red-700 text-sm font-mono whitespace-pre-wrap">{error}</pre>
                        </div>
                      </div>
                    ) : output ? (
                      <pre className="bg-gray-50 p-4 rounded-lg text-gray-800 text-sm font-mono whitespace-pre-wrap">{output}</pre>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-center text-sm">
                        No hay resultados para mostrar
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Gráficos */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-gray-700" />
                    <h2 className="text-lg font-medium text-gray-800">Visualización de datos</h2>
                  </div>
                  
                  <div className="p-5">
                    <div ref={chartContainerRef} className="charts">
                      {/* Los gráficos se agregarán aquí dinámicamente */}
                    </div>
                    
                    {chartsRef.current.length === 0 && (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <BarChart2 className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500">
                          No hay gráficos para mostrar. Prueba funciones como 
                          <code className="bg-gray-100 px-1 mx-1 rounded">plot()</code> 
                          o <code className="bg-gray-100 px-1 mx-1 rounded">hist()</code> 
                          para visualizar tus datos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-[#F5A623]/10 mx-auto flex items-center justify-center mb-4">
                  <Play className="h-10 w-10 text-[#F5A623]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Compilador R listo</h3>
                <p className="text-gray-600 mb-6">
                  Escribe tu código R y haz clic en "Ejecutar" para ver los resultados y visualizaciones.
                </p>
                <button 
                  onClick={runCode}
                  className="px-6 py-3 bg-[#F5A623] hover:bg-[#F5A623]/90 text-white rounded-lg shadow-sm transition-colors"
                >
                  Ejecutar código
                </button>
                <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  <span>El código se ejecutará en tu navegador de manera segura</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RCompilerApp;