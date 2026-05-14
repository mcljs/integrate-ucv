// Lexer.js — Tokeniza código R en una lista de tokens.
// Soporta: números, strings, identificadores, operadores, paréntesis,
// llaves, corchetes, comas, punto y coma, comentarios y saltos de línea.

export const TT = Object.freeze({
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENT: 'IDENT',
  KEYWORD: 'KEYWORD',
  OP: 'OP',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  DOUBLE_LBRACKET: 'DOUBLE_LBRACKET',
  DOUBLE_RBRACKET: 'DOUBLE_RBRACKET',
  COMMA: 'COMMA',
  SEMI: 'SEMI',
  NEWLINE: 'NEWLINE',
  DOLLAR: 'DOLLAR',
  AT: 'AT',
  TILDE: 'TILDE',
  QUESTION: 'QUESTION',
  EOF: 'EOF',
});

const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'repeat', 'function', 'return',
  'break', 'next', 'in', 'TRUE', 'FALSE', 'NULL', 'NA', 'NaN',
  'Inf', 'T', 'F',
]);

// Operadores ordenados por longitud descendente para matching greedy.
const OPERATORS = [
  '<<-', '->>', '<-', '->', '==', '!=', '<=', '>=', '&&', '||',
  '**', ':=', '%%', '%/%', '%*%', '%o%', '%in%', '%/%',
  '+', '-', '*', '/', '^', '<', '>', '!', '&', '|', '=', ':', '?',
];

export class LexerError extends Error {
  constructor(message, line, col) {
    super(`Línea ${line}:${col} — ${message}`);
    this.line = line;
    this.col = col;
  }
}

export class Lexer {
  constructor(source) {
    this.src = source;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.tokens = [];
  }

  peek(offset = 0) {
    return this.src[this.pos + offset];
  }

  advance() {
    const ch = this.src[this.pos++];
    if (ch === '\n') { this.line++; this.col = 1; }
    else { this.col++; }
    return ch;
  }

  match(str) {
    if (this.src.startsWith(str, this.pos)) {
      for (let i = 0; i < str.length; i++) this.advance();
      return true;
    }
    return false;
  }

  push(type, value, startLine, startCol) {
    this.tokens.push({ type, value, line: startLine, col: startCol });
  }

  isDigit(ch) { return ch >= '0' && ch <= '9'; }
  isAlpha(ch) { return /[A-Za-z_.]/.test(ch); }
  isIdentChar(ch) { return /[A-Za-z0-9_.]/.test(ch); }

  tokenize() {
    while (this.pos < this.src.length) {
      const ch = this.peek();
      const startLine = this.line;
      const startCol = this.col;

      // Comentarios
      if (ch === '#') {
        while (this.pos < this.src.length && this.peek() !== '\n') this.advance();
        continue;
      }

      // Saltos de línea (significativos en R)
      if (ch === '\n') {
        this.advance();
        // Colapsar múltiples newlines en uno
        if (this.tokens.length && this.tokens[this.tokens.length - 1].type !== TT.NEWLINE) {
          this.push(TT.NEWLINE, '\n', startLine, startCol);
        }
        continue;
      }

      // Whitespace
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
        continue;
      }

      // Strings (comillas dobles o simples)
      if (ch === '"' || ch === "'") {
        this.readString(ch, startLine, startCol);
        continue;
      }

      // Backticks para identificadores literales
      if (ch === '`') {
        this.readBacktickIdent(startLine, startCol);
        continue;
      }

      // Números
      if (this.isDigit(ch) || (ch === '.' && this.isDigit(this.peek(1)))) {
        this.readNumber(startLine, startCol);
        continue;
      }

      // Identificadores / keywords
      if (this.isAlpha(ch)) {
        this.readIdent(startLine, startCol);
        continue;
      }

      // Puntuación y operadores
      if (this.match('[[')) { this.push(TT.DOUBLE_LBRACKET, '[[', startLine, startCol); continue; }
      if (this.match(']]')) { this.push(TT.DOUBLE_RBRACKET, ']]', startLine, startCol); continue; }
      if (ch === '(') { this.advance(); this.push(TT.LPAREN, '(', startLine, startCol); continue; }
      if (ch === ')') { this.advance(); this.push(TT.RPAREN, ')', startLine, startCol); continue; }
      if (ch === '{') { this.advance(); this.push(TT.LBRACE, '{', startLine, startCol); continue; }
      if (ch === '}') { this.advance(); this.push(TT.RBRACE, '}', startLine, startCol); continue; }
      if (ch === '[') { this.advance(); this.push(TT.LBRACKET, '[', startLine, startCol); continue; }
      if (ch === ']') { this.advance(); this.push(TT.RBRACKET, ']', startLine, startCol); continue; }
      if (ch === ',') { this.advance(); this.push(TT.COMMA, ',', startLine, startCol); continue; }
      if (ch === ';') { this.advance(); this.push(TT.SEMI, ';', startLine, startCol); continue; }
      if (ch === '$') { this.advance(); this.push(TT.DOLLAR, '$', startLine, startCol); continue; }
      if (ch === '@') { this.advance(); this.push(TT.AT, '@', startLine, startCol); continue; }
      if (ch === '~') { this.advance(); this.push(TT.TILDE, '~', startLine, startCol); continue; }

      // Operadores (matching greedy)
      let matched = false;
      for (const op of OPERATORS) {
        if (this.match(op)) {
          this.push(TT.OP, op, startLine, startCol);
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // %custom% operators
      if (ch === '%') {
        const start = this.pos;
        this.advance();
        while (this.pos < this.src.length && this.peek() !== '%' && this.peek() !== '\n') {
          this.advance();
        }
        if (this.peek() === '%') {
          this.advance();
          this.push(TT.OP, this.src.slice(start, this.pos), startLine, startCol);
          continue;
        }
        throw new LexerError(`Operador %...% no cerrado`, startLine, startCol);
      }

      throw new LexerError(`Carácter inesperado: '${ch}'`, this.line, this.col);
    }

    this.push(TT.EOF, null, this.line, this.col);
    return this.tokens;
  }

  readString(quote, startLine, startCol) {
    this.advance(); // consumir comilla apertura
    let value = '';
    while (this.pos < this.src.length && this.peek() !== quote) {
      let ch = this.advance();
      if (ch === '\\' && this.pos < this.src.length) {
        const next = this.advance();
        const escapes = { n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', "'": "'", '0': '\0' };
        value += escapes[next] ?? next;
      } else {
        value += ch;
      }
    }
    if (this.pos >= this.src.length) {
      throw new LexerError('String sin cerrar', startLine, startCol);
    }
    this.advance(); // consumir comilla cierre
    this.push(TT.STRING, value, startLine, startCol);
  }

  readBacktickIdent(startLine, startCol) {
    this.advance(); // consumir `
    let value = '';
    while (this.pos < this.src.length && this.peek() !== '`') {
      value += this.advance();
    }
    if (this.pos >= this.src.length) {
      throw new LexerError('Identificador con backtick sin cerrar', startLine, startCol);
    }
    this.advance(); // consumir ` cierre
    this.push(TT.IDENT, value, startLine, startCol);
  }

  readNumber(startLine, startCol) {
    let value = '';
    let hasDot = false;
    let hasE = false;

    // Hexadecimal
    if (this.peek() === '0' && (this.peek(1) === 'x' || this.peek(1) === 'X')) {
      value += this.advance(); // 0
      value += this.advance(); // x
      while (this.pos < this.src.length && /[0-9a-fA-F]/.test(this.peek())) {
        value += this.advance();
      }
      this.push(TT.NUMBER, parseInt(value, 16), startLine, startCol);
      return;
    }

    while (this.pos < this.src.length) {
      const ch = this.peek();
      if (this.isDigit(ch)) {
        value += this.advance();
      } else if (ch === '.' && !hasDot && !hasE) {
        hasDot = true;
        value += this.advance();
      } else if ((ch === 'e' || ch === 'E') && !hasE) {
        hasE = true;
        value += this.advance();
        if (this.peek() === '+' || this.peek() === '-') value += this.advance();
      } else {
        break;
      }
    }

    // Sufijo L (entero) o i (imaginario) — los ignoramos al parsear
    if (this.peek() === 'L' || this.peek() === 'i') this.advance();

    this.push(TT.NUMBER, parseFloat(value), startLine, startCol);
  }

  readIdent(startLine, startCol) {
    let value = '';
    while (this.pos < this.src.length && this.isIdentChar(this.peek())) {
      value += this.advance();
    }
    const type = KEYWORDS.has(value) ? TT.KEYWORD : TT.IDENT;
    this.push(type, value, startLine, startCol);
  }
}

export function tokenize(source) {
  return new Lexer(source).tokenize();
}