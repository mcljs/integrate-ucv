// Parser.js — Pratt parser (precedence climbing) que produce un AST.
// Cubre lo esencial de R: literales, identificadores, llamadas, indexación,
// $, @, operadores binarios/unarios, asignación, if/else, for, while,
// function, return, break, next, bloques { }, vectores c(), secuencias 1:n.

import { TT } from './Lexer';

export class ParseError extends Error {
  constructor(message, token) {
    const where = token ? `línea ${token.line}:${token.col}` : 'EOF';
    super(`${where} — ${message}`);
    this.token = token;
  }
}

// Precedencias (mayor número = mayor precedencia).
// Tomadas del manual de R con algunas simplificaciones.
const PRECEDENCE = {
  '?': 1,
  '<-': 2, '<<-': 2, '->': 2, '->>': 2, '=': 2,
  '~': 3,
  '||': 4, '|': 4,
  '&&': 5, '&': 5,
  '!': 6,
  '<': 7, '>': 7, '<=': 7, '>=': 7, '==': 7, '!=': 7,
  '+': 8, '-': 8,
  '*': 9, '/': 9,
  '%any%': 10, // operadores tipo %xxx% incluyendo %in%, %%, %*%
  ':': 11,
  '^': 13,
  // Postfix se maneja aparte (call, index, $, @): precedencia más alta.
};

const RIGHT_ASSOCIATIVE = new Set(['^', '<-', '<<-', '=', '->', '->>']);

function getPrecedence(op) {
  if (op in PRECEDENCE) return PRECEDENCE[op];
  if (op && op.startsWith('%') && op.endsWith('%')) return PRECEDENCE['%any%'];
  return 0;
}

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek(offset = 0) { return this.tokens[this.pos + offset]; }
  current() { return this.tokens[this.pos]; }
  advance() { return this.tokens[this.pos++]; }

  check(type, value = null) {
    const t = this.current();
    if (!t || t.type !== type) return false;
    if (value !== null && t.value !== value) return false;
    return true;
  }

  expect(type, value = null) {
    if (!this.check(type, value)) {
      const t = this.current();
      const expected = value !== null ? `${type}('${value}')` : type;
      throw new ParseError(`Se esperaba ${expected} pero se encontró ${t?.type}('${t?.value}')`, t);
    }
    return this.advance();
  }

  skipNewlines() {
    while (this.check(TT.NEWLINE) || this.check(TT.SEMI)) this.advance();
  }

  // Punto de entrada
  parseProgram() {
    const body = [];
    this.skipNewlines();
    while (!this.check(TT.EOF)) {
      const stmt = this.parseStatement();
      if (stmt) body.push(stmt);
      // Después de un statement: espera newline, semi o EOF
      if (!this.check(TT.EOF)) {
        if (this.check(TT.NEWLINE) || this.check(TT.SEMI)) {
          this.skipNewlines();
        } else if (!this.check(TT.RBRACE)) {
          // Permitir RBRACE para bloques anidados
          this.skipNewlines();
        }
      }
    }
    return { type: 'Program', body };
  }

  parseStatement() {
    return this.parseExpression(0);
  }

  // Pratt parser principal
  parseExpression(minPrec) {
    let left = this.parsePrefix();
    left = this.parsePostfix(left);

    while (true) {
      const t = this.current();
      if (!t) break;

      // Operadores binarios
      if (t.type === TT.OP || (t.type === TT.KEYWORD && false)) {
        const prec = getPrecedence(t.value);
        if (prec === 0 || prec < minPrec) break;

        const op = this.advance().value;
        const nextMinPrec = RIGHT_ASSOCIATIVE.has(op) ? prec : prec + 1;

        // El RHS puede estar en líneas siguientes después de un operador
        this.skipNewlines();

        // Asignación: normalizar dirección
        if (op === '<-' || op === '<<-' || op === '=') {
          const right = this.parseExpression(nextMinPrec);
          left = { type: 'Assign', operator: op, target: left, value: right };
        } else if (op === '->' || op === '->>') {
          const right = this.parseExpression(nextMinPrec);
          left = { type: 'Assign', operator: op === '->' ? '<-' : '<<-', target: right, value: left };
        } else {
          const right = this.parseExpression(nextMinPrec);
          left = { type: 'Binary', operator: op, left, right };
        }
        continue;
      }

      break;
    }

    return left;
  }

  parsePrefix() {
    const t = this.current();
    if (!t) throw new ParseError('Expresión esperada', t);

    // Literales
    if (t.type === TT.NUMBER) {
      this.advance();
      return { type: 'Number', value: t.value };
    }
    if (t.type === TT.STRING) {
      this.advance();
      return { type: 'String', value: t.value };
    }

    // Keywords con valor
    if (t.type === TT.KEYWORD) {
      switch (t.value) {
        case 'TRUE': case 'T':
          this.advance();
          return { type: 'Logical', value: true };
        case 'FALSE': case 'F':
          this.advance();
          return { type: 'Logical', value: false };
        case 'NULL':
          this.advance();
          return { type: 'Null' };
        case 'NA':
          this.advance();
          return { type: 'NA' };
        case 'NaN':
          this.advance();
          return { type: 'NaN' };
        case 'Inf':
          this.advance();
          return { type: 'Inf' };
        case 'if':
          return this.parseIf();
        case 'for':
          return this.parseFor();
        case 'while':
          return this.parseWhile();
        case 'repeat':
          return this.parseRepeat();
        case 'function':
          return this.parseFunctionDef();
        case 'return':
          return this.parseReturn();
        case 'break':
          this.advance();
          return { type: 'Break' };
        case 'next':
          this.advance();
          return { type: 'Next' };
      }
    }

    // Identificador
    if (t.type === TT.IDENT) {
      this.advance();
      return { type: 'Identifier', name: t.value };
    }

    // Unario
    if (t.type === TT.OP && (t.value === '-' || t.value === '+' || t.value === '!')) {
      this.advance();
      const operand = this.parseExpression(12); // precedencia alta para unarios
      return { type: 'Unary', operator: t.value, operand };
    }

    // Paréntesis (agrupación)
    if (t.type === TT.LPAREN) {
      this.advance();
      this.skipNewlines();
      const expr = this.parseExpression(0);
      this.skipNewlines();
      this.expect(TT.RPAREN);
      return expr;
    }

    // Bloque { ... }
    if (t.type === TT.LBRACE) {
      return this.parseBlock();
    }

    throw new ParseError(`Token inesperado: ${t.type}('${t.value}')`, t);
  }

  parsePostfix(left) {
    while (true) {
      const t = this.current();
      if (!t) break;

      // Llamada a función: f(args)
      if (t.type === TT.LPAREN) {
        this.advance();
        const args = this.parseArgList(TT.RPAREN);
        this.expect(TT.RPAREN);
        left = { type: 'Call', callee: left, args };
        continue;
      }

      // Indexación: x[i] o x[i, j]
      if (t.type === TT.LBRACKET) {
        this.advance();
        const args = this.parseArgList(TT.RBRACKET, /*allowEmpty=*/true);
        this.expect(TT.RBRACKET);
        left = { type: 'Index', object: left, args, kind: 'single' };
        continue;
      }

      // Indexación doble: x[[i]]
      if (t.type === TT.DOUBLE_LBRACKET) {
        this.advance();
        const args = this.parseArgList(TT.DOUBLE_RBRACKET);
        this.expect(TT.DOUBLE_RBRACKET);
        left = { type: 'Index', object: left, args, kind: 'double' };
        continue;
      }

      // x$nombre
      if (t.type === TT.DOLLAR) {
        this.advance();
        const propTok = this.current();
        if (propTok.type !== TT.IDENT && propTok.type !== TT.STRING && propTok.type !== TT.KEYWORD) {
          throw new ParseError(`Se esperaba un nombre después de '$'`, propTok);
        }
        this.advance();
        left = { type: 'Member', object: left, property: propTok.value };
        continue;
      }

      // x@slot (S4)
      if (t.type === TT.AT) {
        this.advance();
        const propTok = this.current();
        if (propTok.type !== TT.IDENT) {
          throw new ParseError(`Se esperaba un nombre después de '@'`, propTok);
        }
        this.advance();
        left = { type: 'Slot', object: left, property: propTok.value };
        continue;
      }

      // Namespace: pkg::name o pkg:::name (lo tratamos como Member)
      if (t.type === TT.OP && (t.value === ':' || t.value === '::' || t.value === ':::')) {
        // Solo si el siguiente token es un identificador inmediato y no parte de a:b range.
        // R no usa :: como operador, pero por si acaso, no lo manejamos como postfix.
        break;
      }

      break;
    }
    return left;
  }

  parseArgList(closeType, allowEmpty = false) {
    const args = [];
    this.skipNewlines();
    if (this.check(closeType)) return args;

    while (true) {
      this.skipNewlines();

      // Argumento vacío (para x[, 1])
      if (allowEmpty && (this.check(TT.COMMA) || this.check(closeType))) {
        args.push({ type: 'Empty' });
      } else {
        // ¿Argumento nombrado? identificador o string seguido de '='
        let name = null;
        const t = this.current();
        const next = this.peek(1);
        if (
          (t.type === TT.IDENT || t.type === TT.STRING) &&
          next && next.type === TT.OP && next.value === '=' &&
          // No confundir con '==' (ya lo agrupa el lexer)
          true
        ) {
          name = t.value;
          this.advance(); // nombre
          this.advance(); // =
          this.skipNewlines();
        }
        const value = this.parseExpression(0);
        args.push(name ? { type: 'NamedArg', name, value } : value);
      }

      this.skipNewlines();
      if (this.check(TT.COMMA)) {
        this.advance();
        continue;
      }
      break;
    }
    return args;
  }

  parseBlock() {
    this.expect(TT.LBRACE);
    const body = [];
    this.skipNewlines();
    while (!this.check(TT.RBRACE) && !this.check(TT.EOF)) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    this.expect(TT.RBRACE);
    return { type: 'Block', body };
  }

  parseIf() {
    this.advance(); // 'if'
    this.expect(TT.LPAREN);
    this.skipNewlines();
    const test = this.parseExpression(0);
    this.skipNewlines();
    this.expect(TT.RPAREN);
    this.skipNewlines();
    const consequent = this.parseStatement();
    let alternate = null;
    // Mirar adelante saltando newlines, pero solo si hay 'else'
    const save = this.pos;
    this.skipNewlines();
    if (this.check(TT.KEYWORD, 'else')) {
      this.advance();
      this.skipNewlines();
      alternate = this.parseStatement();
    } else {
      this.pos = save;
    }
    return { type: 'If', test, consequent, alternate };
  }

  parseFor() {
    this.advance(); // 'for'
    this.expect(TT.LPAREN);
    this.skipNewlines();
    const variable = this.expect(TT.IDENT).value;
    this.expect(TT.KEYWORD, 'in');
    this.skipNewlines();
    const iterable = this.parseExpression(0);
    this.skipNewlines();
    this.expect(TT.RPAREN);
    this.skipNewlines();
    const body = this.parseStatement();
    return { type: 'For', variable, iterable, body };
  }

  parseWhile() {
    this.advance(); // 'while'
    this.expect(TT.LPAREN);
    this.skipNewlines();
    const test = this.parseExpression(0);
    this.skipNewlines();
    this.expect(TT.RPAREN);
    this.skipNewlines();
    const body = this.parseStatement();
    return { type: 'While', test, body };
  }

  parseRepeat() {
    this.advance();
    this.skipNewlines();
    const body = this.parseStatement();
    return { type: 'Repeat', body };
  }

  parseFunctionDef() {
    this.advance(); // 'function'
    this.expect(TT.LPAREN);
    const params = [];
    this.skipNewlines();
    if (!this.check(TT.RPAREN)) {
      while (true) {
        this.skipNewlines();
        const nameTok = this.expect(TT.IDENT);
        let defaultValue = null;
        if (this.check(TT.OP, '=')) {
          this.advance();
          this.skipNewlines();
          defaultValue = this.parseExpression(0);
        }
        params.push({ name: nameTok.value, default: defaultValue });
        this.skipNewlines();
        if (this.check(TT.COMMA)) { this.advance(); continue; }
        break;
      }
    }
    this.expect(TT.RPAREN);
    this.skipNewlines();
    const body = this.parseStatement();
    return { type: 'Function', params, body };
  }

  parseReturn() {
    this.advance(); // 'return'
    // return puede ser return() o return(expr)
    if (this.check(TT.LPAREN)) {
      this.advance();
      this.skipNewlines();
      let value = null;
      if (!this.check(TT.RPAREN)) {
        value = this.parseExpression(0);
      }
      this.skipNewlines();
      this.expect(TT.RPAREN);
      return { type: 'Return', value };
    }
    return { type: 'Return', value: null };
  }
}

export function parse(tokens) {
  return new Parser(tokens).parseProgram();
}