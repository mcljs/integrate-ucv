// RRuntime.js — Funciones helper que emulan el comportamiento de R en JS.
// El código emitido por el compilador asume que `R` está en scope.
// Este módulo se exporta como string para poder inyectarlo en el código
// generado, además de poderse importar directamente para ejecutar in-process.

export const R_RUNTIME_SOURCE = `
// ---------- Runtime de R en JavaScript ----------
const R = (function () {
  // Helpers internos
  const toArray = (x) => Array.isArray(x) ? x : [x];
  const isNA = (x) => Number.isNaN(x) && x !== x;

  // Recycling: aplica fn elemento a elemento reciclando el más corto.
  function vectorize2(a, b, fn) {
    const av = toArray(a);
    const bv = toArray(b);
    if (av.length === 0 || bv.length === 0) return [];
    const n = Math.max(av.length, bv.length);
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = fn(av[i % av.length], bv[i % bv.length]);
    return out.length === 1 ? out[0] : out;
  }

  function vectorize1(a, fn) {
    const av = toArray(a);
    const out = av.map(fn);
    return out.length === 1 ? out[0] : out;
  }

  // ---------- Operadores ----------
  const add = (a, b) => vectorize2(a, b, (x, y) => x + y);
  const sub = (a, b) => vectorize2(a, b, (x, y) => x - y);
  const mul = (a, b) => vectorize2(a, b, (x, y) => x * y);
  const div = (a, b) => vectorize2(a, b, (x, y) => x / y);
  const pow = (a, b) => vectorize2(a, b, (x, y) => Math.pow(x, y));
  const mod = (a, b) => vectorize2(a, b, (x, y) => ((x % y) + y) % y);
  const idiv = (a, b) => vectorize2(a, b, (x, y) => Math.floor(x / y));
  const neg = (a) => vectorize1(a, x => -x);
  const pos = (a) => vectorize1(a, x => +x);

  const lt = (a, b) => vectorize2(a, b, (x, y) => x < y);
  const gt = (a, b) => vectorize2(a, b, (x, y) => x > y);
  const le = (a, b) => vectorize2(a, b, (x, y) => x <= y);
  const ge = (a, b) => vectorize2(a, b, (x, y) => x >= y);
  const eq = (a, b) => vectorize2(a, b, (x, y) => x === y);
  const ne = (a, b) => vectorize2(a, b, (x, y) => x !== y);

  const and = (a, b) => vectorize2(a, b, (x, y) => Boolean(x) && Boolean(y));
  const or  = (a, b) => vectorize2(a, b, (x, y) => Boolean(x) || Boolean(y));
  const not = (a) => vectorize1(a, x => !x);
  // && y || en R son escalares con short-circuit (sólo primer elemento)
  const sand = (a, b) => Boolean(toArray(a)[0]) && Boolean(toArray(b)[0]);
  const sor  = (a, b) => Boolean(toArray(a)[0]) || Boolean(toArray(b)[0]);

  // Secuencia 1:5
  const range = (from, to) => {
    const f = toArray(from)[0];
    const t = toArray(to)[0];
    const step = f <= t ? 1 : -1;
    const len = Math.abs(t - f) + 1;
    const out = new Array(len);
    for (let i = 0; i < len; i++) out[i] = f + i * step;
    return out;
  };

  // %in%
  const inOp = (a, b) => {
    const av = toArray(a);
    const bv = toArray(b);
    const set = new Set(bv);
    const out = av.map(x => set.has(x));
    return out.length === 1 ? out[0] : out;
  };

  // %*% multiplicación de matrices (matrix-aware)
  const matmul = (a, b) => {
    if (!a || !a.__isMatrix || !b || !b.__isMatrix) {
      throw new Error("%*% requiere matrices");
    }
    if (a.ncol !== b.nrow) throw new Error("Dimensiones incompatibles para %*%");
    const result = new Array(a.nrow * b.ncol);
    for (let i = 0; i < a.nrow; i++) {
      for (let j = 0; j < b.ncol; j++) {
        let s = 0;
        for (let k = 0; k < a.ncol; k++) {
          s += a.data[k * a.nrow + i] * b.data[j * b.nrow + k];
        }
        result[j * a.nrow + i] = s;
      }
    }
    return makeMatrix(result, a.nrow, b.ncol);
  };

  // ---------- Estructuras ----------
  function makeMatrix(data, nrow, ncol) {
    const arr = data.slice();
    arr.__isMatrix = true;
    arr.nrow = nrow;
    arr.ncol = ncol;
    return arr;
  }

  function makeDataFrame(cols) {
    // cols: { name: array }
    const df = { __isDataFrame: true, columns: {}, names: [], nrow: 0 };
    for (const [name, vals] of Object.entries(cols)) {
      const v = toArray(vals);
      df.columns[name] = v;
      df.names.push(name);
      df.nrow = Math.max(df.nrow, v.length);
    }
    return df;
  }

  function makeList(args) {
    // args: array de [name|null, value]
    const list = { __isList: true, values: [], names: [] };
    for (const [name, value] of args) {
      list.values.push(value);
      list.names.push(name);
    }
    return list;
  }

  // ---------- Indexación ----------
  // R usa indexación 1-based. Soporta:
  //   x[2], x[c(1,3)], x[-1] (excluir), x[x>3] (lógica), x["nombre"]
  function indexGet(obj, indices, kind = 'single') {
    if (obj && obj.__isDataFrame) return indexDataFrame(obj, indices, kind);
    if (obj && obj.__isMatrix) return indexMatrix(obj, indices, kind);
    if (obj && obj.__isList) return indexList(obj, indices, kind);
    // Vector
    const arr = toArray(obj);
    if (indices.length !== 1) {
      throw new Error("Indexación vectorial espera un argumento");
    }
    const idx = indices[0];
    return indexVector(arr, idx, kind);
  }

  function indexVector(arr, idx, kind) {
    if (idx === null || idx === undefined) return arr.slice();

    if (Array.isArray(idx)) {
      // ¿lógico?
      if (idx.length > 0 && typeof idx[0] === 'boolean') {
        const out = [];
        for (let i = 0; i < arr.length; i++) {
          if (idx[i % idx.length]) out.push(arr[i]);
        }
        return out.length === 1 && kind === 'double' ? out[0] : out;
      }
      // ¿negativos? -> exclusión
      if (idx.every(v => typeof v === 'number' && v < 0)) {
        const excl = new Set(idx.map(v => -v - 1));
        const out = arr.filter((_, i) => !excl.has(i));
        return out;
      }
      // Numéricos 1-based
      const out = idx.map(i => arr[i - 1]);
      return out.length === 1 && kind === 'double' ? out[0] : out;
    }

    if (typeof idx === 'number') {
      if (idx < 0) {
        const excl = -idx - 1;
        return arr.filter((_, i) => i !== excl);
      }
      const v = arr[idx - 1];
      return kind === 'double' ? v : [v];
    }

    if (typeof idx === 'boolean') {
      return idx ? arr.slice() : [];
    }

    throw new Error("Tipo de índice no soportado");
  }

  function indexMatrix(m, indices, kind) {
    // m[i, j], m[i, ], m[, j]
    if (indices.length === 1) {
      // Indexación lineal (column-major en R)
      return indexVector(Array.from(m), indices[0], kind);
    }
    if (indices.length !== 2) throw new Error("Matriz: usa m[i,j]");
    const [ri, ci] = indices;
    const rows = (ri === null || ri === undefined)
      ? Array.from({length: m.nrow}, (_, k) => k + 1)
      : toArray(ri);
    const cols = (ci === null || ci === undefined)
      ? Array.from({length: m.ncol}, (_, k) => k + 1)
      : toArray(ci);
    if (rows.length === 1 && cols.length === 1) {
      return m[(cols[0] - 1) * m.nrow + (rows[0] - 1)];
    }
    const data = [];
    for (const c of cols) {
      for (const r of rows) {
        data.push(m[(c - 1) * m.nrow + (r - 1)]);
      }
    }
    return makeMatrix(data, rows.length, cols.length);
  }

  function indexDataFrame(df, indices, kind) {
    if (indices.length === 1) {
      const idx = indices[0];
      // df[[i]] o df["col"] -> columna
      if (typeof idx === 'string') {
        return kind === 'double' ? df.columns[idx] : makeDataFrame({ [idx]: df.columns[idx] });
      }
      if (typeof idx === 'number') {
        const name = df.names[idx - 1];
        return kind === 'double' ? df.columns[name] : makeDataFrame({ [name]: df.columns[name] });
      }
    }
    if (indices.length === 2) {
      const [ri, ci] = indices;
      const colNames = (ci === null || ci === undefined)
        ? df.names.slice()
        : (typeof ci === 'string' ? [ci]
           : Array.isArray(ci) ? ci.map(c => typeof c === 'string' ? c : df.names[c - 1])
           : typeof ci === 'number' ? [df.names[ci - 1]]
           : df.names.slice());

      // ri puede ser número, array numérico, array lógico, o vacío
      let rowIdx;
      if (ri === null || ri === undefined) {
        rowIdx = Array.from({length: df.nrow}, (_, i) => i);
      } else if (typeof ri === 'boolean') {
        rowIdx = ri ? Array.from({length: df.nrow}, (_, i) => i) : [];
      } else if (Array.isArray(ri) && ri.length > 0 && typeof ri[0] === 'boolean') {
        rowIdx = [];
        for (let i = 0; i < df.nrow; i++) if (ri[i % ri.length]) rowIdx.push(i);
      } else {
        const arr = toArray(ri);
        if (arr.every(v => typeof v === 'number' && v < 0)) {
          const excl = new Set(arr.map(v => -v - 1));
          rowIdx = Array.from({length: df.nrow}, (_, i) => i).filter(i => !excl.has(i));
        } else {
          rowIdx = arr.map(v => v - 1);
        }
      }

      const newCols = {};
      for (const cn of colNames) {
        newCols[cn] = rowIdx.map(i => df.columns[cn][i]);
      }
      return makeDataFrame(newCols);
    }
    throw new Error("Indexación de data frame no soportada");
  }

  function indexList(list, indices, kind) {
    if (indices.length !== 1) throw new Error("Lista: un solo índice");
    const idx = indices[0];
    if (typeof idx === 'string') {
      const i = list.names.indexOf(idx);
      return i >= 0 ? list.values[i] : null;
    }
    if (typeof idx === 'number') {
      const v = list.values[idx - 1];
      if (kind === 'double') return v;
      const sub = makeList([[list.names[idx - 1], v]]);
      return sub;
    }
    throw new Error("Tipo de índice no soportado para lista");
  }

  // Asignación a posición indexada (in-place)
  function indexSet(obj, indices, value) {
    if (obj && obj.__isDataFrame) {
      if (indices.length === 1 && typeof indices[0] === 'string') {
        const name = indices[0];
        if (!(name in obj.columns)) obj.names.push(name);
        obj.columns[name] = toArray(value);
        obj.nrow = Math.max(obj.nrow, obj.columns[name].length);
        return obj;
      }
    }
    const arr = obj;
    const idx = indices[0];
    if (typeof idx === 'number') { arr[idx - 1] = value; return arr; }
    if (Array.isArray(idx)) {
      const vals = toArray(value);
      for (let k = 0; k < idx.length; k++) {
        arr[idx[k] - 1] = vals[k % vals.length];
      }
      return arr;
    }
    throw new Error("Asignación indexada no soportada");
  }

  function memberGet(obj, name) {
    if (obj && obj.__isDataFrame) return obj.columns[name];
    if (obj && obj.__isList) {
      const i = obj.names.indexOf(name);
      return i >= 0 ? obj.values[i] : null;
    }
    return obj ? obj[name] : undefined;
  }

  function memberSet(obj, name, value) {
    if (obj && obj.__isDataFrame) {
      if (!(name in obj.columns)) obj.names.push(name);
      obj.columns[name] = toArray(value);
      obj.nrow = Math.max(obj.nrow, obj.columns[name].length);
      return obj;
    }
    if (obj && obj.__isList) {
      const i = obj.names.indexOf(name);
      if (i >= 0) obj.values[i] = value;
      else { obj.names.push(name); obj.values.push(value); }
      return obj;
    }
    obj[name] = value;
    return obj;
  }

  // Verdad escalar para if()
  const truthy = (x) => Boolean(toArray(x)[0]);

  // ---------- Funciones built-in de R ----------
  const builtins = {
    c: (...args) => {
      const out = [];
      for (const a of args) {
        if (Array.isArray(a)) out.push(...a);
        else if (a && a.__isList) out.push(...a.values);
        else out.push(a);
      }
      return out;
    },
    length: (x) => Array.isArray(x) ? x.length : (x && x.__isDataFrame ? x.names.length : 1),
    sum: (...args) => builtins.c(...args).reduce((a, b) => a + b, 0),
    prod: (...args) => builtins.c(...args).reduce((a, b) => a * b, 1),
    mean: (x) => { const a = toArray(x); return a.reduce((s, v) => s + v, 0) / a.length; },
    median: (x) => {
      const s = toArray(x).slice().sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    },
    sd: (x) => {
      const a = toArray(x);
      const m = a.reduce((s, v) => s + v, 0) / a.length;
      return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1));
    },
    var: (x) => {
      const a = toArray(x);
      const m = a.reduce((s, v) => s + v, 0) / a.length;
      return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1);
    },
    min: (...args) => Math.min(...builtins.c(...args)),
    max: (...args) => Math.max(...builtins.c(...args)),
    range: (...args) => { const a = builtins.c(...args); return [Math.min(...a), Math.max(...a)]; },
    abs: (x) => vectorize1(x, Math.abs),
    sqrt: (x) => vectorize1(x, Math.sqrt),
    exp: (x) => vectorize1(x, Math.exp),
    log: (x, base) => {
      if (base === undefined) return vectorize1(x, Math.log);
      const b = Math.log(toArray(base)[0]);
      return vectorize1(x, v => Math.log(v) / b);
    },
    log2: (x) => vectorize1(x, Math.log2),
    log10: (x) => vectorize1(x, Math.log10),
    sin: (x) => vectorize1(x, Math.sin),
    cos: (x) => vectorize1(x, Math.cos),
    tan: (x) => vectorize1(x, Math.tan),
    asin: (x) => vectorize1(x, Math.asin),
    acos: (x) => vectorize1(x, Math.acos),
    atan: (x) => vectorize1(x, Math.atan),
    atan2: (y, x) => vectorize2(y, x, Math.atan2),
    round: (x, digits = 0) => vectorize1(x, v => {
      const d = toArray(digits)[0];
      const f = Math.pow(10, d);
      return Math.round(v * f) / f;
    }),
    floor: (x) => vectorize1(x, Math.floor),
    ceiling: (x) => vectorize1(x, Math.ceil),
    trunc: (x) => vectorize1(x, Math.trunc),
    sign: (x) => vectorize1(x, Math.sign),

    seq: (from = 1, to, by, length_out) => {
      from = toArray(from)[0];
      if (to === undefined && length_out === undefined) {
        // seq(n) -> 1:n
        return range(1, from);
      }
      to = toArray(to)[0];
      if (length_out !== undefined) {
        const n = toArray(length_out)[0];
        if (n === 1) return [from];
        const step = (to - from) / (n - 1);
        return Array.from({length: n}, (_, i) => from + i * step);
      }
      const step = by !== undefined ? toArray(by)[0] : (from <= to ? 1 : -1);
      const len = Math.floor((to - from) / step) + 1;
      return Array.from({length: len}, (_, i) => from + i * step);
    },
    seq_len: (n) => range(1, toArray(n)[0]),
    seq_along: (x) => range(1, toArray(x).length),
    rep: (x, times = 1) => {
      const xa = toArray(x);
      const t = toArray(times)[0];
      const out = [];
      for (let i = 0; i < t; i++) out.push(...xa);
      return out;
    },
    rev: (x) => toArray(x).slice().reverse(),
    sort: (x, decreasing = false) => {
      const d = toArray(decreasing)[0];
      return toArray(x).slice().sort((a, b) => d ? b - a : a - b);
    },
    order: (x, decreasing = false) => {
      const a = toArray(x);
      const d = toArray(decreasing)[0];
      return a.map((v, i) => i + 1).sort((i, j) => d ? a[j-1] - a[i-1] : a[i-1] - a[j-1]);
    },
    unique: (x) => [...new Set(toArray(x))],
    which: (x) => {
      const a = toArray(x);
      const out = [];
      for (let i = 0; i < a.length; i++) if (a[i]) out.push(i + 1);
      return out;
    },
    'which.max': (x) => { const a = toArray(x); let mi = 0; for (let i = 1; i < a.length; i++) if (a[i] > a[mi]) mi = i; return mi + 1; },
    'which.min': (x) => { const a = toArray(x); let mi = 0; for (let i = 1; i < a.length; i++) if (a[i] < a[mi]) mi = i; return mi + 1; },
    any: (...args) => builtins.c(...args).some(Boolean),
    all: (...args) => builtins.c(...args).every(Boolean),
    cumsum: (x) => { let s = 0; return toArray(x).map(v => s += v); },
    cumprod: (x) => { let p = 1; return toArray(x).map(v => p *= v); },

    // Tipos / conversiones
    'as.numeric': (x) => vectorize1(x, v => Number(v)),
    'as.integer': (x) => vectorize1(x, v => parseInt(v, 10)),
    'as.character': (x) => vectorize1(x, v => String(v)),
    'as.logical': (x) => vectorize1(x, v => Boolean(v)),
    'is.numeric': (x) => typeof (Array.isArray(x) ? x[0] : x) === 'number',
    'is.character': (x) => typeof (Array.isArray(x) ? x[0] : x) === 'string',
    'is.logical': (x) => typeof (Array.isArray(x) ? x[0] : x) === 'boolean',
    'is.null': (x) => x === null || x === undefined,
    'is.na': (x) => vectorize1(x, v => Number.isNaN(v) || v === null),
    'is.matrix': (x) => !!(x && x.__isMatrix),
    'is.data.frame': (x) => !!(x && x.__isDataFrame),
    'is.list': (x) => !!(x && x.__isList),

    // Strings
    paste: (...args) => {
      let sep = ' ';
      const last = args[args.length - 1];
      // En R real, sep es nombrado; aquí lo simplificamos.
      const parts = args.map(a => toArray(a).map(String));
      const n = Math.max(...parts.map(p => p.length), 1);
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push(parts.map(p => p[i % p.length]).join(sep));
      }
      return out.length === 1 ? out[0] : out;
    },
    paste0: (...args) => {
      const parts = args.map(a => toArray(a).map(String));
      const n = Math.max(...parts.map(p => p.length), 1);
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push(parts.map(p => p[i % p.length]).join(''));
      }
      return out.length === 1 ? out[0] : out;
    },
    nchar: (x) => vectorize1(x, v => String(v).length),
    toupper: (x) => vectorize1(x, v => String(v).toUpperCase()),
    tolower: (x) => vectorize1(x, v => String(v).toLowerCase()),
    substr: (x, start, stop) => vectorize1(x, v => String(v).substring(toArray(start)[0] - 1, toArray(stop)[0])),

    // Matrices y data frames
    matrix: (data, nrow, ncol, byrow = false) => {
      const arr = toArray(data);
      const br = toArray(byrow)[0];
      let nr = nrow !== undefined ? toArray(nrow)[0] : undefined;
      let nc = ncol !== undefined ? toArray(ncol)[0] : undefined;
      if (nr === undefined && nc === undefined) { nr = arr.length; nc = 1; }
      else if (nr === undefined) nr = Math.ceil(arr.length / nc);
      else if (nc === undefined) nc = Math.ceil(arr.length / nr);

      const out = new Array(nr * nc);
      // R guarda en column-major
      for (let i = 0; i < nr * nc; i++) {
        const value = arr[i % arr.length];
        if (br) {
          const row = Math.floor(i / nc);
          const col = i % nc;
          out[col * nr + row] = value;
        } else {
          out[i] = value;
        }
      }
      return makeMatrix(out, nr, nc);
    },
    nrow: (x) => x && x.__isMatrix ? x.nrow : (x && x.__isDataFrame ? x.nrow : null),
    ncol: (x) => x && x.__isMatrix ? x.ncol : (x && x.__isDataFrame ? x.names.length : null),
    dim: (x) => x && x.__isMatrix ? [x.nrow, x.ncol] : null,
    t: (m) => {
      if (!m || !m.__isMatrix) throw new Error("t() requiere matriz");
      const out = new Array(m.nrow * m.ncol);
      for (let i = 0; i < m.nrow; i++) for (let j = 0; j < m.ncol; j++) {
        out[i * m.ncol + j] = m[j * m.nrow + i];
      }
      return makeMatrix(out, m.ncol, m.nrow);
    },
    diag: (x) => {
      if (x && x.__isMatrix) {
        const n = Math.min(x.nrow, x.ncol);
        const out = new Array(n);
        for (let i = 0; i < n; i++) out[i] = x[i * x.nrow + i];
        return out;
      }
      // diag(n) -> matriz identidad
      const n = toArray(x)[0];
      const out = new Array(n * n).fill(0);
      for (let i = 0; i < n; i++) out[i * n + i] = 1;
      return makeMatrix(out, n, n);
    },
    'data.frame': (...args) => {
      // args puede tener NamedArg-like {name, value} ya resueltos por el compilador
      // El compilador pasa argumentos nombrados como objetos {__named: name, value}
      const cols = {};
      let unnamed = 0;
      for (const a of args) {
        if (a && a.__named) cols[a.__named] = toArray(a.value);
        else cols['V' + (++unnamed)] = toArray(a);
      }
      return makeDataFrame(cols);
    },
    list: (...args) => {
      const items = args.map(a => a && a.__named ? [a.__named, a.value] : [null, a]);
      return makeList(items);
    },
    names: (x) => {
      if (x && x.__isDataFrame) return x.names.slice();
      if (x && x.__isList) return x.names.slice();
      return null;
    },
    print: (x) => { console.log(formatValue(x)); return x; },
    cat: (...args) => {
      let sep = ' ';
      const parts = [];
      for (const a of args) {
        if (a && a.__named && a.__named === 'sep') { sep = a.value; continue; }
        parts.push(toArray(a && a.__named ? a.value : a).map(String).join(sep));
      }
      const out = parts.join(sep);
      console.log(out);
      return null;
    },
  };

  // Formato amigable para print
  function formatValue(v) {
    if (v && v.__isMatrix) {
      let s = '';
      for (let i = 0; i < v.nrow; i++) {
        const row = [];
        for (let j = 0; j < v.ncol; j++) row.push(v[j * v.nrow + i]);
        s += '[' + (i+1) + ',] ' + row.join(' ') + '\\n';
      }
      return s.trimEnd();
    }
    if (v && v.__isDataFrame) {
      const header = v.names.join('\\t');
      const rows = [];
      for (let i = 0; i < v.nrow; i++) {
        rows.push(v.names.map(n => v.columns[n][i]).join('\\t'));
      }
      return header + '\\n' + rows.join('\\n');
    }
    if (v && v.__isList) {
      return v.names.map((n, i) => '$' + (n || (i+1)) + ': ' + formatValue(v.values[i])).join('\\n');
    }
    if (Array.isArray(v)) return '[' + v.join(', ') + ']';
    return String(v);
  }

  return {
    // operadores
    add, sub, mul, div, pow, mod, idiv, neg, pos,
    lt, gt, le, ge, eq, ne, and, or, not, sand, sor,
    range, inOp, matmul,
    // indexación
    indexGet, indexSet, memberGet, memberSet,
    // helpers
    truthy, toArray,
    // constructores
    makeMatrix, makeDataFrame, makeList,
    // builtins
    builtins,
    // formato
    formatValue,
  };
})();
`;