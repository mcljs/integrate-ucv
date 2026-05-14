// r-validator.js — Validador híbrido de ejercicios R.
//
// Estrategia:
//   1. Ejecuta el código del estudiante con RCompiler.
//   2. Compara el entorno resultante contra valores esperados (deep equal con tolerancia).
//   3. Si falla, analiza el código con patrones declarativos para sugerir qué arreglar.
//
// Los ejercicios se definen declarativamente (ver EXERCISE_CATALOG abajo).
// Cada ejercicio tiene:
//   - id, type, description, expectedOutput
//   - expectedVars: { nombre: valor_esperado, ... }     (validación por ejecución)
//   - requiredPatterns: [ { regex, hint } ]             (pistas si falla la ejecución)
//   - forbiddenPatterns: [ { regex, hint } ]            (cosas que no deben aparecer)
//   - syntaxChecks: lista de checks de sintaxis ligeros aplicables al ejercicio

import RCompiler from './RCompiler';

// ---------- Comparación de valores con tolerancia ----------
const FLOAT_TOLERANCE = 1e-9;

function deepEqualR(a, b, tol = FLOAT_TOLERANCE) {
  // R no distingue entre un escalar y un vector de longitud 1.
  // Si uno es array de 1 elemento, comparamos con el escalar.
  if (Array.isArray(a) && a.length === 1 && !Array.isArray(b)) return deepEqualR(a[0], b, tol);
  if (Array.isArray(b) && b.length === 1 && !Array.isArray(a)) return deepEqualR(a, b[0], tol);

  // NaN == NaN para nuestros propósitos
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
  }
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqualR(v, b[i], tol));
  }
  // Matrices
  if (a && a.__isMatrix && b && b.__isMatrix) {
    if (a.nrow !== b.nrow || a.ncol !== b.ncol) return false;
    return Array.from(a).every((v, i) => deepEqualR(v, b[i], tol));
  }
  // Data frames
  if (a && a.__isDataFrame && b && b.__isDataFrame) {
    if (a.names.length !== b.names.length) return false;
    if (!a.names.every(n => b.names.includes(n))) return false;
    return a.names.every(n => deepEqualR(a.columns[n], b.columns[n], tol));
  }
  // Listas
  if (a && a.__isList && b && b.__isList) {
    if (a.values.length !== b.values.length) return false;
    return a.values.every((v, i) => deepEqualR(v, b.values[i], tol));
  }
  return false;
}

// ---------- Análisis de patrones para pistas ----------
export function analyzeRCode(code, options = {}) {
  const findings = {
    syntaxErrors: [],
    requiredMatched: [],
    requiredMissing: [],
    forbiddenFound: [],
  };

  // Chequeos sintácticos básicos
  const openP = (code.match(/\(/g) || []).length;
  const closeP = (code.match(/\)/g) || []).length;
  if (openP !== closeP) {
    findings.syntaxErrors.push({
      type: 'error',
      message: 'Paréntesis desbalanceados. Verifica que cada paréntesis abierto tenga su correspondiente cierre.',
    });
  }

  const openB = (code.match(/\{/g) || []).length;
  const closeB = (code.match(/\}/g) || []).length;
  if (openB !== closeB) {
    findings.syntaxErrors.push({
      type: 'error',
      message: 'Llaves desbalanceadas.',
    });
  }

  const openBr = (code.match(/\[/g) || []).length;
  const closeBr = (code.match(/\]/g) || []).length;
  if (openBr !== closeBr) {
    findings.syntaxErrors.push({
      type: 'error',
      message: 'Corchetes desbalanceados.',
    });
  }

  // Comillas balanceadas (heurística simple, ignora escapes)
  const doubleQuotes = (code.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    findings.syntaxErrors.push({
      type: 'error',
      message: 'Hay comillas dobles sin cerrar.',
    });
  }

  // Patrones requeridos
  for (const p of options.requiredPatterns || []) {
    const re = p.regex instanceof RegExp ? p.regex : new RegExp(p.regex);
    if (re.test(code)) findings.requiredMatched.push(p);
    else findings.requiredMissing.push(p);
  }

  // Patrones prohibidos
  for (const p of options.forbiddenPatterns || []) {
    const re = p.regex instanceof RegExp ? p.regex : new RegExp(p.regex);
    if (re.test(code)) findings.forbiddenFound.push(p);
  }

  return findings;
}

// ---------- Catálogo de ejercicios ----------
// Definidos declarativamente. Para añadir un ejercicio nuevo, agregá aquí.
export const EXERCISE_CATALOG = {
  mean_calculation: {
    type: 'mean_calculation',
    description: 'Calcular la media de un vector de edades',
    expectedVars: {
      edades: [23, 45, 67, 32, 19, 21, 30],
      // media calculada: 33.857142857...
      // Aceptamos el nombre 'media' o cualquier otro; chequeamos al menos uno.
    },
    expectedScalars: {
      // Si existe una variable que es la media, debe ser este valor.
      mean_value: { value: 33.857142857142854, tol: 1e-6, candidateNames: ['media', 'media_edades', 'promedio'] },
    },
    requiredPatterns: [
      { regex: /edades\s*(<-|=)/, hint: "Debes crear una variable llamada 'edades'." },
      { regex: /\bmean\s*\(/, hint: "Usa la función mean() para calcular el promedio." },
    ],
    forbiddenPatterns: [
      { regex: /sum\s*\([^)]+\)\s*\/\s*length/, hint: "Mejor usa mean() directamente en lugar de sum()/length()." },
    ],
  },

  data_conversion: {
    type: 'data_conversion',
    description: 'Convertir un vector numérico a caracter',
    expectedVars: {
      valores: [1, 2, 3, 4, 5],
      valores_texto: ['1', '2', '3', '4', '5'],
    },
    requiredPatterns: [
      { regex: /valores\s*(<-|=)/, hint: "Crea el vector 'valores'." },
      { regex: /as\.character\s*\(/, hint: "Usa as.character() para la conversión." },
    ],
  },

  vector_operations: {
    type: 'vector_operations',
    description: 'Operaciones aritméticas y producto punto',
    expectedVars: {
      vector_a: [5, 10, 15, 20, 25],
      vector_b: [2, 4, 6, 8, 10],
      resultado_suma: [7, 14, 21, 28, 35],
      resultado_producto: [10, 40, 90, 160, 250],
      producto_punto: 550,
    },
    requiredPatterns: [
      { regex: /vector_a\s*(<-|=)/, hint: "Crea el vector 'vector_a'." },
      { regex: /vector_b\s*(<-|=)/, hint: "Crea el vector 'vector_b'." },
      { regex: /resultado_suma\s*(<-|=)\s*vector_a\s*\+\s*vector_b/, hint: "Calcula la suma como vector_a + vector_b." },
      { regex: /resultado_producto\s*(<-|=)\s*vector_a\s*\*\s*vector_b/, hint: "Calcula el producto elemento a elemento." },
      { regex: /producto_punto\s*(<-|=)\s*sum\s*\(\s*vector_a\s*\*\s*vector_b\s*\)/, hint: "Producto punto: sum(vector_a * vector_b)." },
    ],
  },

  matrix_operations: {
    type: 'matrix_operations',
    description: 'Crear matriz 3x3, extraer diagonal y sumar',
    expectedVars: {
      // Matriz por filas: 1..9 -> column-major en R: [1,4,7, 2,5,8, 3,6,9]
      // Pero usuario puede usar matrix(..., byrow=TRUE); chequeamos el __isMatrix con valores correctos.
    },
    expectedScalars: {
      diagonal_a: { value: [1, 5, 9], tol: 0, candidateNames: ['diagonal_a', 'diagonal'] },
      suma_total: { value: 45, tol: 0, candidateNames: ['suma_total', 'suma'] },
    },
    requiredPatterns: [
      { regex: /matrix\s*\(/, hint: "Usa la función matrix() para crear la matriz." },
      { regex: /byrow\s*=\s*(TRUE|T)\b/, hint: "Llena la matriz por filas con byrow = TRUE." },
      { regex: /diag\s*\(/, hint: "Usa diag() para extraer la diagonal." },
      { regex: /sum\s*\(/, hint: "Usa sum() para sumar todos los elementos." },
    ],
  },

  dataframe_creation: {
    type: 'dataframe_creation',
    description: 'Crear un dataframe de estudiantes y agregar columna calculada',
    expectedDataFrames: {
      estudiantes: {
        columns: {
          Nombre: ['Ana', 'Pedro', 'Carmen', 'Miguel', 'Laura'],
          Edad: [22, 20, 25, 19, 23],
          Nota: [8.5, 7.2, 9.1, 6.8, 8.9],
          Aprobado: [true, true, true, false, true],
        },
        derivedColumns: {
          Puntos_Extra: (df) => df.columns.Nota.map(n => n * 0.1),
        },
      },
    },
    requiredPatterns: [
      { regex: /data\.frame\s*\(/, hint: "Usa data.frame() para crear el dataframe." },
      { regex: /estudiantes\$Puntos_Extra\s*(<-|=)/, hint: "Agrega la columna Puntos_Extra con el operador $." },
    ],
  },

  dataframe_analysis: {
    type: 'dataframe_analysis',
    description: 'Filtrar aprobados, media de notas, mejor estudiante',
    // Para este ejercicio, el dataframe 'estudiantes' debe haber sido creado en el
    // ejercicio anterior. Asumimos que el estudiante lo recrea o lo tiene en memoria.
    // Si no existe, el código fallará al ejecutar y el validador dará pistas.
    expectedScalars: {
      media_aprobados: {
        value: 8.425,
        tol: 0.01,
        candidateNames: ['media_aprobados', 'media', 'promedio'],
      },
      mejor_estudiante: {
        value: 'Carmen',
        tol: 0,
        candidateNames: ['mejor_estudiante', 'mejor', 'nombre_mejor'],
      },
    },
    requiredPatterns: [
      { regex: /aprobados\s*(<-|=)/, hint: "Crea un dataframe 'aprobados' con los estudiantes que tienen Aprobado == TRUE." },
      { regex: /mean\s*\(/, hint: "Usa mean() para calcular la media de las notas." },
      { regex: /which\.max\s*\(/, hint: "Usa which.max() para encontrar el índice del estudiante con la nota más alta." },
    ],
  },
};

// ---------- Validador principal ----------
export class RValidator {
  constructor(options = {}) {
    this.compiler = new RCompiler();
    this.options = options;
  }

  /**
   * Verifica la solución del estudiante para un ejercicio dado.
   * @param {string} code - Código R del estudiante
   * @param {object} exercise - Definición de ejercicio (o el id; ver getExercise)
   * @returns {{ isCorrect, message, output, plots, errors, hints, details }}
   */
  verify(code, exercise) {
    if (typeof exercise === 'string') {
      exercise = EXERCISE_CATALOG[exercise];
    }
    if (!exercise) {
      return { isCorrect: false, message: 'Ejercicio no encontrado o no soportado.', hints: [], details: null };
    }

    // 1. Análisis estático para errores rápidos
    const staticFindings = analyzeRCode(code, {
      requiredPatterns: exercise.requiredPatterns || [],
      forbiddenPatterns: exercise.forbiddenPatterns || [],
    });

    if (staticFindings.syntaxErrors.length > 0) {
      return {
        isCorrect: false,
        message: staticFindings.syntaxErrors[0].message,
        output: null,
        plots: [],
        errors: staticFindings.syntaxErrors,
        hints: [],
        details: { phase: 'static', findings: staticFindings },
      };
    }

    // 2. Ejecutar el código del estudiante
    const exec = this.compiler.run(code);
    if (exec.error) {
      const hints = this._buildHints(staticFindings);
      return {
        isCorrect: false,
        message: 'Tu código tiene un error de ejecución: ' + exec.error.message,
        output: exec.output,
        plots: exec.plots,
        errors: [{ type: 'runtime', message: exec.error.message }],
        hints,
        details: { phase: 'runtime', findings: staticFindings, error: exec.error },
      };
    }

    // 3. Verificar variables esperadas en el entorno final del sandbox
    const env = exec.env || {};
    const checks = this._checkExpectedValues(env, exercise);

    if (checks.allOk) {
      return {
        isCorrect: true,
        message: '¡Excelente! Tu solución es correcta.',
        output: exec.output,
        plots: exec.plots,
        env,
        errors: [],
        hints: [],
        details: { phase: 'pass', findings: staticFindings, checks },
      };
    }

    // 4. Falló alguna comprobación: combinar fallos con pistas de patrones
    const hints = this._buildHints(staticFindings);
    const failMessages = checks.failures.map(f => f.message);
    return {
      isCorrect: false,
      message: failMessages[0] || 'Tu solución no produce los resultados esperados.',
      output: exec.output,
      plots: exec.plots,
      env,
      errors: checks.failures,
      hints,
      details: { phase: 'value', findings: staticFindings, checks },
    };
  }

  _captureGlobals() {
    // Tras compiler.run, las variables `var X = ...` se cuelgan en globalThis.
    return globalThis;
  }

  _checkExpectedValues(env, exercise) {
    const failures = [];

    // expectedVars: nombres exactos
    if (exercise.expectedVars) {
      for (const [name, expected] of Object.entries(exercise.expectedVars)) {
        if (!(name in env)) {
          failures.push({ kind: 'missing_var', name, message: `Falta la variable '${name}'.` });
          continue;
        }
        if (!deepEqualR(env[name], expected)) {
          failures.push({
            kind: 'wrong_value',
            name,
            expected,
            got: env[name],
            message: `La variable '${name}' no tiene el valor esperado.`,
          });
        }
      }
    }

    // expectedScalars: cualquier nombre de la lista de candidatos sirve
    if (exercise.expectedScalars) {
      for (const [key, spec] of Object.entries(exercise.expectedScalars)) {
        const candidates = spec.candidateNames || [key];
        const found = candidates.find(n => n in env);
        if (!found) {
          failures.push({
            kind: 'missing_scalar',
            name: key,
            message: `No se encontró una variable con el resultado de '${key}' (probá nombres como: ${candidates.join(', ')}).`,
          });
          continue;
        }
        if (spec.value !== null && !deepEqualR(env[found], spec.value, spec.tol ?? 1e-6)) {
          failures.push({
            kind: 'wrong_value',
            name: found,
            expected: spec.value,
            got: env[found],
            message: `La variable '${found}' no tiene el valor esperado.`,
          });
        }
      }
    }

    // expectedDataFrames
    if (exercise.expectedDataFrames) {
      for (const [name, spec] of Object.entries(exercise.expectedDataFrames)) {
        const df = env[name];
        if (!df || !df.__isDataFrame) {
          failures.push({ kind: 'missing_df', name, message: `Falta el dataframe '${name}'.` });
          continue;
        }
        // Columnas literales
        if (spec.columns) {
          for (const [col, expected] of Object.entries(spec.columns)) {
            if (!deepEqualR(df.columns[col], expected)) {
              failures.push({
                kind: 'wrong_column',
                df: name, col,
                expected, got: df.columns[col],
                message: `La columna '${col}' del dataframe '${name}' no tiene los valores esperados.`,
              });
            }
          }
        }
        // Columnas derivadas
        if (spec.derivedColumns) {
          for (const [col, fn] of Object.entries(spec.derivedColumns)) {
            let expected;
            try { expected = fn(df); } catch (e) { continue; }
            if (!deepEqualR(df.columns[col], expected)) {
              failures.push({
                kind: 'wrong_derived',
                df: name, col,
                expected, got: df.columns[col],
                message: `La columna '${col}' no se calculó correctamente.`,
              });
            }
          }
        }
      }
    }

    return { allOk: failures.length === 0, failures };
  }

  _buildHints(staticFindings) {
    const hints = [];
    for (const p of staticFindings.requiredMissing) {
      hints.push({ kind: 'missing_pattern', message: p.hint });
    }
    for (const p of staticFindings.forbiddenFound) {
      hints.push({ kind: 'forbidden_pattern', message: p.hint });
    }
    return hints;
  }
}

// ---------- Formato consola estilo R ----------
// Toma un environment ({nombre: valor, ...}) y produce un string que se
// parece a lo que R imprimiría si tipearas cada variable en la consola.

export function formatEnvAsConsole(env, options = {}) {
  if (!env || typeof env !== 'object') return '';
  const lines = [];
  const skipKeys = new Set(options.skip || []);
  // Mantener orden de definición (Object.keys preserva orden de inserción)
  for (const name of Object.keys(env)) {
    if (skipKeys.has(name)) continue;
    if (name.startsWith('__')) continue;
    const value = env[name];
    if (typeof value === 'function') continue;
    lines.push(`> ${name}`);
    lines.push(formatValueR(value));
  }
  return lines.join('\n');
}

function formatValueR(v) {
  if (v === null || v === undefined) return 'NULL';

  // Matriz
  if (v && v.__isMatrix) {
    const colW = Math.max(...Array.from(v).map(x => formatScalar(x).length));
    const rowLabels = Array.from({length: v.nrow}, (_, i) => `[${i+1},]`);
    const colLabels = Array.from({length: v.ncol}, (_, i) => `[,${i+1}]`);
    const rowLabelW = Math.max(...rowLabels.map(s => s.length));
    const cellW = Math.max(colW, ...colLabels.map(s => s.length));

    const header = ' '.repeat(rowLabelW) + ' ' + colLabels.map(s => s.padStart(cellW)).join(' ');
    const rows = [];
    for (let i = 0; i < v.nrow; i++) {
      const cells = [];
      for (let j = 0; j < v.ncol; j++) {
        cells.push(formatScalar(v[j * v.nrow + i]).padStart(cellW));
      }
      rows.push(rowLabels[i].padEnd(rowLabelW) + ' ' + cells.join(' '));
    }
    return [header, ...rows].join('\n');
  }

  // Data frame
  if (v && v.__isDataFrame) {
    const colNames = v.names;
    // Asegurar que cada columna tenga al menos v.nrow elementos (rellenar con NA)
    const colData = colNames.map(n => {
      const col = (v.columns[n] || []).map(formatScalar);
      while (col.length < v.nrow) col.push('NA');
      return col;
    });
    const colW = colNames.map((n, i) => Math.max(n.length, ...colData[i].map(s => s.length)));
    const rowLabelW = String(v.nrow).length;
    const header = ' '.repeat(rowLabelW) + ' ' + colNames.map((n, i) => n.padStart(colW[i])).join(' ');
    const rows = [];
    for (let r = 0; r < v.nrow; r++) {
      const cells = colData.map((col, i) => (col[r] ?? 'NA').padStart(colW[i]));
      rows.push(String(r + 1).padStart(rowLabelW) + ' ' + cells.join(' '));
    }
    return [header, ...rows].join('\n');
  }

  // Lista
  if (v && v.__isList) {
    const parts = [];
    for (let i = 0; i < v.values.length; i++) {
      const label = v.names[i] ? `$${v.names[i]}` : `[[${i + 1}]]`;
      parts.push(label);
      parts.push(formatValueR(v.values[i]));
      parts.push('');
    }
    return parts.join('\n').trimEnd();
  }

  // Vector (array)
  if (Array.isArray(v)) {
    if (v.length === 0) return 'character(0)';
    const cells = v.map(formatScalar);
    const cellW = Math.max(...cells.map(s => s.length));
    // R muestra ~80 columnas por línea; aprox 6 elementos para vectores cortos
    const perLine = Math.max(1, Math.floor(72 / (cellW + 1)));
    const lines = [];
    for (let i = 0; i < cells.length; i += perLine) {
      const chunk = cells.slice(i, i + perLine).map(s => s.padStart(cellW)).join(' ');
      lines.push(`[${i + 1}] ${chunk}`);
    }
    return lines.join('\n');
  }

  // Escalar
  return `[1] ${formatScalar(v)}`;
}

function formatScalar(v) {
  if (v === null || v === undefined) return 'NA';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return 'NaN';
    if (!Number.isFinite(v)) return v > 0 ? 'Inf' : '-Inf';
    if (Number.isInteger(v)) return String(v);
    // R muestra 7 dígitos significativos por defecto
    return parseFloat(v.toPrecision(7)).toString();
  }
  return String(v);
}

// ---------- API legacy (compatibilidad con el módulo viejo) ----------
const __defaultValidator = new RValidator();

export function verifyRSolution(code, exercise) {
  return __defaultValidator.verify(code, exercise);
}

export function simulateRExecution(code, exercise) {
  const r = __defaultValidator.verify(code, exercise);
  if (r.isCorrect) {
    return { output: exercise?.expectedOutput ?? r.output, success: true, details: r.details };
  }
  return {
    output: null,
    success: false,
    error: r.message,
    details: r.details,
  };
}

export default RValidator;