// CodeGen.js — Recorre el AST y emite código JavaScript que usa R.* del runtime.

import { R_RUNTIME_SOURCE } from './RRuntime';

// Operadores binarios -> función del runtime
const BIN_OP_MAP = {
  '+': 'R.add', '-': 'R.sub', '*': 'R.mul', '/': 'R.div',
  '^': 'R.pow', '**': 'R.pow',
  '%%': 'R.mod', '%/%': 'R.idiv',
  '<': 'R.lt', '>': 'R.gt', '<=': 'R.le', '>=': 'R.ge',
  '==': 'R.eq', '!=': 'R.ne',
  '&': 'R.and', '|': 'R.or',
  '&&': 'R.sand', '||': 'R.sor',
  ':': 'R.range',
  '%in%': 'R.inOp',
  '%*%': 'R.matmul',
};

const UNARY_OP_MAP = {
  '-': 'R.neg',
  '+': 'R.pos',
  '!': 'R.not',
};

// Para los plots, generamos llamadas a window.RPlot.* (o un objeto inyectable).
// Si el usuario tiene un sistema gráfico, lo conecta a través de globalThis.RPlot.
const PLOT_FUNCTIONS = new Set([
  'plot', 'hist', 'boxplot', 'barplot', 'pie', 'lines', 'points',
  'abline', 'legend', 'title', 'curve',
]);

// Nombres reservados de JS que no podemos usar como variables directas.
const JS_RESERVED = new Set([
  'var', 'let', 'const', 'function', 'return', 'if', 'else', 'while',
  'for', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this',
  'class', 'super', 'import', 'export', 'default', 'extends', 'typeof',
  'instanceof', 'in', 'of', 'delete', 'void', 'yield', 'async', 'await',
  'true', 'false', 'null', 'undefined',
]);

// Identificadores R que tienen puntos (data.frame, as.numeric...) se escapan.
function safeIdent(name) {
  if (JS_RESERVED.has(name)) return '_r_' + name;
  // R permite . en nombres, JS no -> reemplazamos por _dot_
  if (name.includes('.')) return '_r_' + name.replace(/\./g, '_dot_');
  return name;
}

export class CodeGen {
  constructor(options = {}) {
    this.opts = { includeRuntime: true, plotting: 'stub', ...options };
    this.indentLevel = 0;
  }

  indent() { return '  '.repeat(this.indentLevel); }

  generate(ast) {
    const declared = new Set();
    this._collectDeclarations(ast.body, declared);

    // Cada nodo top-level se emite como statement.
    const body = ast.body.map(node => this.emitStatement(node)).filter(Boolean);
    const code = body.join('\n');

    const declLines = declared.size > 0
      ? 'var ' + Array.from(declared).join(', ') + ';\n'
      : '';

    const parts = [];
    if (this.opts.includeRuntime) {
      parts.push(R_RUNTIME_SOURCE.trim());
      parts.push(this.emitPlotStub());
    }
    parts.push('// ---------- Código del usuario ----------');
    parts.push('if (typeof __env === "undefined") var __env = {};');
    parts.push(declLines + code);
    return parts.join('\n\n');
  }

  _collectDeclarations(nodes, set) {
    if (!Array.isArray(nodes)) nodes = [nodes];
    for (const n of nodes) {
      if (!n) continue;
      if (n.type === 'Assign' && n.target.type === 'Identifier') {
        set.add(safeIdent(n.target.name));
      }
      // Recolectar dentro de bloques top-level (if/for/while sin función)
      if (n.type === 'If') {
        this._collectDeclarations(n.consequent, set);
        if (n.alternate) this._collectDeclarations(n.alternate, set);
      }
      if (n.type === 'For') {
        set.add(safeIdent(n.variable));
        this._collectDeclarations(n.body, set);
      }
      if (n.type === 'While' || n.type === 'Repeat') {
        this._collectDeclarations(n.body, set);
      }
      if (n.type === 'Block') {
        this._collectDeclarations(n.body, set);
      }
      // No descendemos a Function: las variables internas son locales.
    }
  }

  emitPlotStub() {
    if (this.opts.plotting === 'none') return '';
    // Stub: si el entorno ya proveyó un RPlot (p.ej. desde RCompiler.run o desde
    // globalThis), lo respetamos. Si no, instalamos uno por defecto.
    return `
if (typeof RPlot === 'undefined') var RPlot = (typeof globalThis !== 'undefined' && globalThis.RPlot) || {
  _calls: [],
  _record(name, args) { this._calls.push({ name, args }); return null; },
  plot(opts)    { return this._record('plot', opts); },
  hist(opts)    { return this._record('hist', opts); },
  boxplot(opts) { return this._record('boxplot', opts); },
  barplot(opts) { return this._record('barplot', opts); },
  pie(opts)     { return this._record('pie', opts); },
  lines(opts)   { return this._record('lines', opts); },
  points(opts)  { return this._record('points', opts); },
  abline(opts)  { return this._record('abline', opts); },
  legend(opts)  { return this._record('legend', opts); },
  title(opts)   { return this._record('title', opts); },
  curve(opts)   { return this._record('curve', opts); },
};`.trim();
  }

  emit(node) {
    if (!node) return '';
    const method = 'emit_' + node.type;
    if (!this[method]) throw new Error(`Nodo no soportado: ${node.type}`);
    return this[method](node);
  }

  emit_Number(n) { return JSON.stringify(n.value); }
  emit_String(n) { return JSON.stringify(n.value); }
  emit_Logical(n) { return n.value ? 'true' : 'false'; }
  emit_Null() { return 'null'; }
  emit_NA() { return 'NaN'; }
  emit_NaN() { return 'NaN'; }
  emit_Inf() { return 'Infinity'; }

  emit_Identifier(n) {
    // Constantes especiales
    if (n.name === 'pi') return 'Math.PI';
    if (n.name === 'T') return 'true';
    if (n.name === 'F') return 'false';
    return safeIdent(n.name);
  }

  emit_Unary(n) {
    const fn = UNARY_OP_MAP[n.operator];
    if (!fn) throw new Error(`Operador unario no soportado: ${n.operator}`);
    return `${fn}(${this.emit(n.operand)})`;
  }

  emit_Binary(n) {
    const fn = BIN_OP_MAP[n.operator];
    if (fn) {
      return `${fn}(${this.emit(n.left)}, ${this.emit(n.right)})`;
    }
    // %custom% operadores genéricos: si el usuario definió uno, no lo soportamos.
    throw new Error(`Operador binario no soportado: ${n.operator}`);
  }

  emit_Assign(n) {
    const { target, value } = n;

    // x <- expr
    if (target.type === 'Identifier') {
      const name = safeIdent(target.name);
      // Asignamos también al objeto __env para que sea accesible desde fuera
      // del sandbox (validator). El nombre del JS local se usa internamente.
      return `(${name} = (__env[${JSON.stringify(name)}] = ${this.emit(value)}))`;
    }

    // x$nombre <- expr  ó  x[i] <- expr
    if (target.type === 'Member') {
      return `R.memberSet(${this.emit(target.object)}, ${JSON.stringify(target.property)}, ${this.emit(value)})`;
    }
    if (target.type === 'Index') {
      const obj = this.emit(target.object);
      const args = this.emitIndexArgs(target.args);
      return `R.indexSet(${obj}, ${args}, ${this.emit(value)})`;
    }
    if (target.type === 'Slot') {
      return `${this.emit(target.object)}.${target.property} = ${this.emit(value)}`;
    }

    throw new Error(`Asignación no soportada para target tipo ${target.type}`);
  }

  emitIndexArgs(args) {
    // Devuelve un array literal de JS donde Empty -> null
    const parts = args.map(a => {
      if (a.type === 'Empty') return 'null';
      if (a.type === 'NamedArg') return this.emit(a.value);
      return this.emit(a);
    });
    return `[${parts.join(', ')}]`;
  }

  emit_Call(n) {
    const { callee, args } = n;

    // Llamada a identificador conocido
    if (callee.type === 'Identifier') {
      const name = callee.name;

      // Funciones de gráficos -> redirigir a RPlot
      if (PLOT_FUNCTIONS.has(name)) {
        return this.emitPlotCall(name, args);
      }

      // data.frame y list con argumentos nombrados -> envolver en {__named, value}
      if (name === 'data.frame' || name === 'list') {
        const argParts = args.map(a => {
          if (a.type === 'NamedArg') {
            return `{__named: ${JSON.stringify(a.name)}, value: ${this.emit(a.value)}}`;
          }
          return this.emit(a);
        });
        return `R.builtins[${JSON.stringify(name)}](${argParts.join(', ')})`;
      }

      // Builtin del runtime
      const builtinArgs = args.map(a => {
        if (a.type === 'NamedArg') return this.emit(a.value); // posicional simplificado
        return this.emit(a);
      });

      // Si el nombre tiene punto o es palabra reservada, accedemos por []
      const isComplex = name.includes('.') || JS_RESERVED.has(name);
      const ref = isComplex
        ? `R.builtins[${JSON.stringify(name)}]`
        : `(R.builtins.${name} || ${safeIdent(name)})`;

      return `${ref}(${builtinArgs.join(', ')})`;
    }

    // Llamada a expresión cualquiera (closures, etc.)
    const calleeCode = this.emit(callee);
    const argParts = args.map(a => {
      if (a.type === 'NamedArg') return this.emit(a.value);
      return this.emit(a);
    });
    return `${calleeCode}(${argParts.join(', ')})`;
  }

  emitPlotCall(name, args) {
    // Convertir args a objeto literal con nombres conocidos.
    // Mapeo de nombres R -> propiedades estándar.
    const KEY_MAP = {
      main: 'title', xlab: 'xLabel', ylab: 'yLabel',
      col: 'color', pch: 'pointSymbol', type: 'pointType',
      lty: 'lineType', lwd: 'lineWidth',
      breaks: 'bins', 'names.arg': 'labels',
      cex: 'size',
    };
    const props = [];
    let positionalIdx = 0;
    const POSITIONAL_NAMES = {
      plot:    ['x', 'y'],
      hist:    ['x'],
      boxplot: ['x'],
      barplot: ['height'],
      pie:     ['x'],
      lines:   ['x', 'y'],
      points:  ['x', 'y'],
      abline:  ['a', 'b'],
      curve:   ['expr', 'from', 'to'],
    };
    const positional = POSITIONAL_NAMES[name] || [];

    for (const a of args) {
      if (a.type === 'NamedArg') {
        const key = KEY_MAP[a.name] || a.name;
        props.push(`${JSON.stringify(key)}: ${this.emit(a.value)}`);
      } else {
        const key = positional[positionalIdx++] || `arg${positionalIdx}`;
        props.push(`${JSON.stringify(key)}: ${this.emit(a)}`);
      }
    }
    return `RPlot.${name}({ ${props.join(', ')} })`;
  }

  emit_Index(n) {
    const obj = this.emit(n.object);
    const args = this.emitIndexArgs(n.args);
    const kind = JSON.stringify(n.kind);
    return `R.indexGet(${obj}, ${args}, ${kind})`;
  }

  emit_Member(n) {
    return `R.memberGet(${this.emit(n.object)}, ${JSON.stringify(n.property)})`;
  }

  emit_Slot(n) {
    return `${this.emit(n.object)}.${n.property}`;
  }

  // Emite un nodo como statement (sentencia JS), no como expresión.
  // Útil para if/for/while donde el cuerpo puede contener break/return/next.
  emitStatement(n) {
    if (!n) return '';
    switch (n.type) {
      case 'If': {
        const test = this.emit(n.test);
        const cons = this.emitBlockBody(n.consequent);
        let s = `if (R.truthy(${test})) { ${cons} }`;
        if (n.alternate) s += ` else { ${this.emitBlockBody(n.alternate)} }`;
        return s;
      }
      case 'For': {
        const v = safeIdent(n.variable);
        const it = this.emit(n.iterable);
        const body = this.emitBlockBody(n.body);
        return `{ const __it_${v} = R.toArray(${it}); for (const ${v} of __it_${v}) { ${body} } }`;
      }
      case 'While': {
        const test = this.emit(n.test);
        const body = this.emitBlockBody(n.body);
        return `while (R.truthy(${test})) { ${body} }`;
      }
      case 'Repeat': {
        const body = this.emitBlockBody(n.body);
        return `while (true) { ${body} }`;
      }
      case 'Block': {
        return `{ ${n.body.map(s => this.emitStatement(s)).join('; ')} }`;
      }
      case 'Return':
        return `return ${n.value ? this.emit(n.value) : 'null'};`;
      case 'Break':
        return 'break;';
      case 'Next':
        return 'continue;';
      default:
        // Expresión normal terminada en ;
        return this.emit(n) + ';';
    }
  }

  // Emite el cuerpo de un bloque (puede ser Block o un statement simple)
  // como una secuencia de sentencias JS.
  emitBlockBody(node) {
    if (!node) return '';
    if (node.type === 'Block') {
      return node.body.map(s => this.emitStatement(s)).join(' ');
    }
    return this.emitStatement(node);
  }

  emit_Block(n) {
    // En contexto de expresión: IIFE que retorna el valor de la última sentencia.
    const stmts = n.body;
    if (stmts.length === 0) return 'null';
    const parts = stmts.map((s, i) => {
      if (i === stmts.length - 1) {
        // Última: si es control flow, no podemos devolver un valor — usamos null
        if (s.type === 'Return' || s.type === 'Break' || s.type === 'Next') {
          return this.emitStatement(s);
        }
        if (s.type === 'If' || s.type === 'For' || s.type === 'While' || s.type === 'Repeat') {
          // Estos producen un valor como expresión
          return `return ${this.emit(s)};`;
        }
        return `return ${this.emit(s)};`;
      }
      return this.emitStatement(s);
    });
    return `(() => { ${parts.join(' ')} })()`;
  }

  emit_If(n) {
    const test = this.emit(n.test);
    const cons = this.emit(n.consequent);
    if (n.alternate) {
      const alt = this.emit(n.alternate);
      return `(R.truthy(${test}) ? (${cons}) : (${alt}))`;
    }
    return `(R.truthy(${test}) ? (${cons}) : null)`;
  }

  emit_For(n) {
    const v = safeIdent(n.variable);
    const it = this.emit(n.iterable);
    const body = this.emitBlockBody(n.body);
    // IIFE para usar como expresión (no muy útil, pero correcto JS).
    return `(() => { const __it = R.toArray(${it}); for (const ${v} of __it) { ${body} } })()`;
  }

  emit_While(n) {
    const test = this.emit(n.test);
    const body = this.emitBlockBody(n.body);
    return `(() => { while (R.truthy(${test})) { ${body} } })()`;
  }

  emit_Repeat(n) {
    const body = this.emitBlockBody(n.body);
    return `(() => { while (true) { ${body} } })()`;
  }

  emit_Function(n) {
    const params = n.params.map(p => safeIdent(p.name)).join(', ');
    const defaults = n.params
      .filter(p => p.default !== null)
      .map(p => `if (${safeIdent(p.name)} === undefined) ${safeIdent(p.name)} = ${this.emit(p.default)};`)
      .join(' ');

    // Recolectar locales
    const locals = new Set();
    const bodyNodes = n.body.type === 'Block' ? n.body.body : [n.body];
    this._collectDeclarations(bodyNodes, locals);
    for (const p of n.params) locals.delete(safeIdent(p.name));
    const localDecl = locals.size > 0 ? `var ${Array.from(locals).join(', ')};` : '';

    if (n.body.type === 'Block') {
      const stmts = n.body.body;
      const inner = stmts.map((s, i) => {
        const isLast = i === stmts.length - 1;
        // Sentencias de control flow se emiten como statement JS
        if (s.type === 'Return' || s.type === 'Break' || s.type === 'Next' ||
            s.type === 'If' || s.type === 'For' || s.type === 'While' ||
            s.type === 'Repeat' || s.type === 'Block') {
          const code = this.emitStatement(s);
          // Si es la última y no garantiza retorno, no añadimos return.
          return code;
        }
        // Expresión normal: si es la última, hacemos return implícito
        if (isLast) return `return ${this.emit(s)};`;
        return this.emit(s) + ';';
      }).join(' ');
      return `function(${params}) { var __env = {}; ${localDecl} ${defaults} ${inner} }`;
    }
    return `function(${params}) { var __env = {}; ${localDecl} ${defaults} return ${this.emit(n.body)}; }`;
  }

  emit_Return(n) {
    // `return` solo es válido como statement; el contexto debe garantizarlo
    // (estamos dentro de una function, emitida por emit_Function).
    return `return ${n.value ? this.emit(n.value) : 'null'}`;
  }

  emit_Break() { return 'break'; }
  emit_Next()  { return 'continue'; }

  // Si por algún motivo aparece un NamedArg en posición de expresión (no debería)
  emit_NamedArg(n) {
    return `{__named: ${JSON.stringify(n.name)}, value: ${this.emit(n.value)}}`;
  }

  emit_Empty() { return 'null'; }
}

export function generate(ast, options = {}) {
  return new CodeGen(options).generate(ast);
}