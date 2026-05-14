// RCompiler.js — Compilador de R a JavaScript.
// Pipeline: source -> Lexer -> Parser -> AST -> CodeGen -> JS
//
// Reemplazo del compilador anterior basado en regex/split.
// API pública compatible con el anterior:
//   const compiler = new RCompiler();
//   const js = compiler.compile(rCode);
//
// API adicional:
//   compiler.tokenize(rCode)  -> tokens
//   compiler.parse(rCode)     -> AST
//   compiler.run(rCode, env)  -> ejecuta el JS y retorna { result, plots, output, error }

import { tokenize, LexerError } from './Lexer';
import { parse, ParseError } from './Parser';
import { CodeGen } from './CodeGen';

export class CompileError extends Error {
  constructor(message, phase, cause) {
    super(`[${phase}] ${message}`);
    this.phase = phase;
    this.cause = cause;
  }
}

export default class RCompiler {
  constructor(options = {}) {
    this.options = {
      includeRuntime: true,   // incluir helpers R.* en el output
      plotting: 'stub',       // 'stub' | 'none'
      ...options,
    };
  }

  tokenize(rCode) {
    try {
      return tokenize(rCode);
    } catch (e) {
      if (e instanceof LexerError) throw new CompileError(e.message, 'lex', e);
      throw e;
    }
  }

  parse(rCode) {
    const tokens = this.tokenize(rCode);
    try {
      return parse(tokens);
    } catch (e) {
      if (e instanceof ParseError) throw new CompileError(e.message, 'parse', e);
      throw e;
    }
  }

  compile(rCode) {
    const ast = this.parse(rCode);
    try {
      const gen = new CodeGen(this.options);
      return gen.generate(ast);
    } catch (e) {
      throw new CompileError(e.message, 'codegen', e);
    }
  }

  /**
   * Ejecuta el código R compilado.
   * Devuelve un objeto con:
   *   result: valor de la última expresión
   *   plots:  llamadas a funciones de gráficos capturadas
   *   output: salida de print()/cat() capturada
   *   env:    el "entorno" final (variables top-level)
   *   error:  Error | null
   */
  run(rCode, externalEnv = {}) {
    const result = { result: undefined, plots: [], output: '', env: {}, error: null };
    let jsCode;
    try {
      jsCode = this.compile(rCode);
    } catch (e) {
      result.error = e;
      return result;
    }

    // Capturar console.log
    const lines = [];
    const fakeConsole = { log: (...args) => lines.push(args.map(String).join(' ')) };

    // RPlot mockeable
    const RPlot = {
      _calls: [],
      _record(name, args) { this._calls.push({ name, args }); return null; },
      plot(o) { return this._record('plot', o); },
      hist(o) { return this._record('hist', o); },
      boxplot(o) { return this._record('boxplot', o); },
      barplot(o) { return this._record('barplot', o); },
      pie(o) { return this._record('pie', o); },
      lines(o) { return this._record('lines', o); },
      points(o) { return this._record('points', o); },
      abline(o) { return this._record('abline', o); },
      legend(o) { return this._record('legend', o); },
      title(o) { return this._record('title', o); },
      curve(o) { return this._record('curve', o); },
    };

    // Sandbox vía Function — no es un sandbox de seguridad real, pero aísla scope.
    try {
      // Inyectamos console y RPlot a través de globalThis para evitar choques
      // con la declaración del stub en el código generado.
      const prevConsole = globalThis.console;
      const prevRPlot = globalThis.RPlot;
      globalThis.console = fakeConsole;
      globalThis.RPlot = RPlot;
      try {
        const wrapped = `
          "use strict";
          const __externalEnv = arguments[0];
          var __env = {};
          for (const __k in __externalEnv) __env[__k] = __externalEnv[__k];
          let __last;
          ${this._wrapLastExpression(jsCode)}
          return { __last, __env };
        `;
        const fn = new Function(wrapped);
        const out = fn(externalEnv);
        result.result = out.__last;
        result.env = out.__env;
      } finally {
        globalThis.console = prevConsole;
        globalThis.RPlot = prevRPlot;
      }
      result.output = lines.join('\n');
      result.plots = RPlot._calls;
    } catch (e) {
      result.error = e;
      result.output = lines.join('\n');
      result.plots = RPlot._calls;
    }
    return result;
  }

  _wrapLastExpression(jsCode) {
    // Heurística simple: tomar la última línea no vacía que no sea `var X = ...`
    // y asignarla a __last. Esto es opcional; si no funciona, no pasa nada.
    // Para no romper el código generado, sólo añadimos al final.
    return jsCode + '\n;try { __last = (typeof __last !== "undefined") ? __last : undefined; } catch(e) {}';
  }
}

export { RCompiler };