// Arreglando la parte del histograma y el error de exportación
// Compilador mejorado de R a JavaScript
class RCompiler {
    constructor() {
      this.variableMap = new Map();
      
      // Diccionario de funciones básicas de R y sus equivalentes en JavaScript
      this.functionMap = {
        // Operaciones matemáticas básicas
        'c': this.translateCFunction,
        'sum': 'array => array.reduce((a, b) => a + b, 0)',
        'mean': 'array => array.reduce((a, b) => a + b, 0) / array.length',
        'max': 'Math.max',
        'min': 'Math.min',
        'abs': 'Math.abs',
        'sqrt': 'Math.sqrt',
        'log': 'Math.log',
        'log10': 'Math.log10',
        'exp': 'Math.exp',
        'round': 'Math.round',
        'floor': 'Math.floor',
        'ceiling': 'Math.ceil',
        'ceil': 'Math.ceil',
        'trunc': 'Math.trunc',
        'sign': 'Math.sign',

        // Funciones trigonométricas
        'sin': 'Math.sin',
        'cos': 'Math.cos',
        'tan': 'Math.tan',
        'asin': 'Math.asin',
        'acos': 'Math.acos',
        'atan': 'Math.atan',
        'atan2': 'Math.atan2',
        'sinh': 'Math.sinh',
        'cosh': 'Math.cosh',
        'tanh': 'Math.tanh',
        
        // Constantes matemáticas
        'pi': 'Math.PI',
        
        // Operaciones con vectores/matrices
        'length': 'array => array.length',
        'rep': this.translateRepFunction,
        'seq': this.translateSeqFunction,
        'unique': 'array => [...new Set(array)]',
        'rev': 'array => [...array].reverse()',
        'sort': 'array => [...array].sort((a, b) => a - b)',
        
        // Estadísticas
        'sd': this.translateSdFunction,
        'var': this.translateVarFunction,
        'cor': this.translateCorFunction,
        'median': this.translateMedianFunction,
        'quantile': this.translateQuantileFunction,
        'range': 'array => [Math.min(...array), Math.max(...array)]',
        
        // Gráficos
        'plot': this.translatePlotFunction,
        'hist': this.translateHistFunction,
        'boxplot': this.translateBoxplotFunction,
        'barplot': this.translateBarplotFunction,
        'pie': this.translatePieFunction,
        'lines': this.translateLinesFunction,
        'points': this.translatePointsFunction,
      };
      
      // Operadores en R y sus equivalentes en JavaScript
      this.operatorMap = {
        '<-': '=',
        '->': '=',
        '==': '===',
        '!=': '!==',
        '%*%': '*', // Multiplicación de matrices (simplificado)
        '%in%': '.includes',
        '%/%': '/',
        '%%': '%',
        '^': '**',
      };
      
      // Constantes que podemos reemplazar directamente
      this.constantMap = {
        'pi': 'Math.PI',
        'TRUE': 'true',
        'FALSE': 'false',
        'NULL': 'null',
        'NA': 'NaN',
        'NaN': 'NaN',
        'Inf': 'Infinity',
        'LETTERS': '[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]',
        'letters': '[..."abcdefghijklmnopqrstuvwxyz"]',
      };
    }
    
    // Función principal para compilar código R
    compile(rCode) {
      // Separar el código en líneas
      const lines = rCode.split('\n');
      let jsCode = [];
      
      // Agregar constantes predefinidas como PI
      jsCode.push('// Constantes matemáticas');
      jsCode.push('const pi = Math.PI;');
      jsCode.push('');
      
      // Agregar funciones de utilidad
      jsCode.push('// Funciones auxiliares');
      jsCode.push('const seq = (from, to, by = 1) => Array.from({length: Math.floor((to - from) / by) + 1}, (_, i) => from + i * by);');
      jsCode.push('const rep = (x, times) => Array.isArray(x) ? Array(times).fill().flatMap(() => x) : Array(times).fill(x);');
      jsCode.push('');
      
      // Procesar cada línea
      jsCode.push('// Código traducido');
      for (let line of lines) {
        line = line.trim();
        
        // Ignorar comentarios y líneas vacías
        if (line === '' || line.startsWith('#')) {
          jsCode.push(line.startsWith('#') ? '//' + line.substring(1) : line);
          continue;
        }
        
        // Traducir la línea de R a JavaScript
        const translatedLine = this.translateLine(line);
        jsCode.push(translatedLine);
      }
      
      // Retornar el código JavaScript generado
      return jsCode.join('\n');
    }
    
    // Traducir una línea de código R
    translateLine(line) {
      // Reemplazar constantes conocidas
      for (const [rConst, jsConst] of Object.entries(this.constantMap)) {
        const regex = new RegExp(`\\b${rConst}\\b`, 'g');
        line = line.replace(regex, jsConst);
      }
      
      // Traducir asignaciones
      if (line.includes('<-') || line.includes('->')) {
        return this.translateAssignment(line);
      }
      
      // Traducir llamadas a funciones
      if (line.includes('(')) {
        return this.translateFunctionCall(line);
      }
      
      // Traducir operaciones
      for (const [rOp, jsOp] of Object.entries(this.operatorMap)) {
        if (line.includes(rOp)) {
          line = line.split(rOp).join(jsOp);
        }
      }
      
      return line + ';';
    }
    
    // Traducir asignaciones (a <- 5 o 5 -> a)
    translateAssignment(line) {
      let varName, value;
      
      if (line.includes('<-')) {
        [varName, value] = line.split('<-').map(s => s.trim());
      } else {
        [value, varName] = line.split('->').map(s => s.trim());
      }
      
      // Registrar la variable para uso futuro
      this.variableMap.set(varName, this.translateExpression(value));
      
      return `let ${varName} = ${this.translateExpression(value)};`;
    }
    
    // Traducir expresiones
    translateExpression(expr) {
      // Reemplazar constantes conocidas
      for (const [rConst, jsConst] of Object.entries(this.constantMap)) {
        const regex = new RegExp(`\\b${rConst}\\b`, 'g');
        expr = expr.replace(regex, jsConst);
      }
      
      // Traducir llamadas a funciones dentro de expresiones
      if (expr.includes('(')) {
        return this.translateFunctionCall(expr, true);
      }
      
      // Traducir vectores c(1, 2, 3)
      if (expr.startsWith('c(')) {
        return this.translateCFunction(expr);
      }
      
      // Traducir operadores
      for (const [rOp, jsOp] of Object.entries(this.operatorMap)) {
        if (expr.includes(rOp)) {
          expr = expr.split(rOp).join(jsOp);
        }
      }
      
      return expr;
    }
    
    // Traducir llamadas a funciones
    translateFunctionCall(line, isExpression = false) {
      // Extraer el nombre de la función y los argumentos
      const funcNameMatch = line.match(/^([a-zA-Z0-9_.]+)\(/);
      if (!funcNameMatch) return line + (isExpression ? '' : ';');
      
      const funcName = funcNameMatch[1];
      
      // Si la función está en nuestro mapa de funciones, usamos su equivalente en JS
      if (this.functionMap[funcName]) {
        if (typeof this.functionMap[funcName] === 'function') {
          // Si es una función de traducción personalizada
          const jsCode = this.functionMap[funcName].call(this, line);
          return jsCode + (isExpression ? '' : ';');
        } else {
          // Reemplazar con la función JavaScript equivalente
          const argsStart = line.indexOf('(') + 1;
          const argsEnd = this.findClosingBracket(line, argsStart - 1);
          const args = line.substring(argsStart, argsEnd).trim();
          
          // Traducir los argumentos
          const translatedArgs = this.translateArgs(args);
          
          return `${this.functionMap[funcName]}(${translatedArgs})` + (isExpression ? '' : ';');
        }
      }
      
      // Si no está en el mapa, la dejamos como está
      return line + (isExpression ? '' : ';');
    }
    
    // Traducir argumentos de funciones
    translateArgs(args) {
      if (!args) return '';
      
      // Dividir por comas, teniendo en cuenta los paréntesis anidados
      const argList = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argList.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argList.push(currentArg.trim());
      }
      
      // Traducir cada argumento
      return argList.map(arg => this.translateExpression(arg)).join(', ');
    }
    
    // Encontrar el paréntesis de cierre correspondiente
    findClosingBracket(str, openPos) {
      let depth = 1;
      for (let i = openPos + 1; i < str.length; i++) {
        if (str[i] === '(') depth++;
        else if (str[i] === ')') {
          depth--;
          if (depth === 0) return i;
        }
      }
      return str.length;
    }
    
    // Funciones de traducción personalizadas
    translateCFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      if (!args) return '[]';
      
      // Dividir por comas, excluyendo paréntesis anidados
      const argList = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argList.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argList.push(currentArg.trim());
      }
      
      // Convertir a un array en JavaScript
      const jsArgs = argList.map(arg => this.translateExpression(arg)).join(', ');
      return `[${jsArgs}]`;
    }
    
    translateSeqFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      // Casos especiales de seq
      if (argParts.length === 1) {
        // seq(n) es equivalente a 1:n en R
        const n = this.translateExpression(argParts[0]);
        return `Array.from({length: ${n}}, (_, i) => i + 1)`;
      }
      
      let from, to, by;
      
      // Buscar argumentos nombrados
      if (argParts.length > 0) {
        // Buscar argumentos con nombres
        let fromIdx = -1, toIdx = -1, byIdx = -1;
        
        for (let i = 0; i < argParts.length; i++) {
          const arg = argParts[i];
          if (arg.startsWith('from=')) fromIdx = i;
          else if (arg.startsWith('to=')) toIdx = i;
          else if (arg.startsWith('by=')) byIdx = i;
        }
        
        // Si hay argumentos con nombres, usarlos
        if (fromIdx >= 0) from = this.translateExpression(argParts[fromIdx].substring(5));
        else from = this.translateExpression(argParts[0]);
        
        if (toIdx >= 0) to = this.translateExpression(argParts[toIdx].substring(3));
        else if (argParts.length > 1 && fromIdx === -1) to = this.translateExpression(argParts[1]);
        
        if (byIdx >= 0) by = this.translateExpression(argParts[byIdx].substring(3));
        else if (argParts.length > 2 && fromIdx === -1 && toIdx === -1) by = this.translateExpression(argParts[2]);
        else by = '1';
      }
      
      return `Array.from({length: Math.floor((${to} - ${from}) / ${by}) + 1}, (_, i) => ${from} + i * ${by})`;
    }
    
    translateRepFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      let x, times;
      
      // Buscar argumentos nombrados
      if (argParts.length > 0) {
        // Buscar argumentos con nombres
        let xIdx = -1, timesIdx = -1;
        
        for (let i = 0; i < argParts.length; i++) {
          const arg = argParts[i];
          if (arg.startsWith('x=')) xIdx = i;
          else if (arg.startsWith('times=')) timesIdx = i;
        }
        
        // Si hay argumentos con nombres, usarlos
        if (xIdx >= 0) x = this.translateExpression(argParts[xIdx].substring(2));
        else x = this.translateExpression(argParts[0]);
        
        if (timesIdx >= 0) times = this.translateExpression(argParts[timesIdx].substring(6));
        else if (argParts.length > 1 && xIdx === -1) times = this.translateExpression(argParts[1]);
        else times = '1';
      }
      
      return `Array.isArray(${x}) ? Array(${times}).fill().flatMap(() => ${x}) : Array(${times}).fill(${x})`;
    }
    
    translateSdFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      return `
        (array => {
          const mean = array.reduce((a, b) => a + b, 0) / array.length;
          return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (array.length - 1));
        })(${this.translateExpression(args)})
      `;
    }
    
    translateVarFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      return `
        (array => {
          const mean = array.reduce((a, b) => a + b, 0) / array.length;
          return array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (array.length - 1);
        })(${this.translateExpression(args)})
      `;
    }
    
    translateMedianFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      return `
        (array => {
          const sorted = [...array].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
        })(${this.translateExpression(args)})
      `;
    }
    
    translateQuantileFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      const x = this.translateExpression(argParts[0]);
      const probs = argParts.length > 1 ? this.translateExpression(argParts[1]) : '[0.25, 0.5, 0.75]';
      
      return `
        ((x, probs) => {
          const sorted = [...x].sort((a, b) => a - b);
          return probs.map(p => {
            const pos = p * (sorted.length - 1);
            const i = Math.floor(pos);
            const frac = pos - i;
            return i + 1 < sorted.length ? sorted[i] + frac * (sorted[i + 1] - sorted[i]) : sorted[i];
          });
        })(${x}, ${probs})
      `;
    }
    
    translateCorFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Dividir por comas, teniendo en cuenta los paréntesis anidados
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      if (argParts.length !== 2) {
        return `/* Error: cor() requiere dos argumentos */`;
      }
      
      const [x, y] = argParts.map(arg => this.translateExpression(arg));
      
      return `
        ((x, y) => {
          if (x.length !== y.length) return NaN;
          const n = x.length;
          const xMean = x.reduce((a, b) => a + b, 0) / n;
          const yMean = y.reduce((a, b) => a + b, 0) / n;
          const xDev = x.map(val => val - xMean);
          const yDev = y.map(val => val - yMean);
          const sumXYDev = xDev.map((val, i) => val * yDev[i]).reduce((a, b) => a + b, 0);
          const sumXDev2 = xDev.map(val => val * val).reduce((a, b) => a + b, 0);
          const sumYDev2 = yDev.map(val => val * val).reduce((a, b) => a + b, 0);
          return sumXYDev / Math.sqrt(sumXDev2 * sumYDev2);
        })(${x}, ${y})
      `;
    }
    
    // Funciones para gráficos (usando Chart.js)
    translatePlotFunction(expr) {
        const argsStart = expr.indexOf('(') + 1;
        const argsEnd = this.findClosingBracket(expr, argsStart - 1);
        const args = expr.substring(argsStart, argsEnd).trim();
        
        // Dividir por comas, teniendo en cuenta los paréntesis anidados
        const argParts = [];
        let currentArg = '';
        let depth = 0;
        
        for (let i = 0; i < args.length; i++) {
          const char = args[i];
          
          if (char === '(') depth++;
          else if (char === ')') depth--;
          
          if (char === ',' && depth === 0) {
            argParts.push(currentArg.trim());
            currentArg = '';
          } else {
            currentArg += char;
          }
        }
        
        if (currentArg.trim()) {
          argParts.push(currentArg.trim());
        }
        
        // Extraer x e y
        let x, y, title, xlab, ylab, type, pch, col, lty;
        
        if (argParts.length === 1) {
          // Solo y, x es índice implícito
          y = this.translateExpression(argParts[0]);
          x = `Array.from({length: ${y}.length}, (_, i) => i + 1)`;
          title = "'Plot'";
          xlab = "'Index'";
          ylab = "'Value'";
          type = "'p'"; // puntos por defecto
          pch = "1";    // símbolo por defecto
          col = "'rgba(75, 192, 192, 1)'"; // color por defecto
          lty = "1";    // tipo de línea por defecto
        } else if (argParts.length >= 2) {
          // x e y explícitos
          x = this.translateExpression(argParts[0]);
          
          // Importante: Tratar de manera especial argumentos como cos(x)
          // Verificamos si el segundo argumento contiene una función aplicada a una variable
          const secondArg = argParts[1].trim();
          const functionMatch = secondArg.match(/^([a-zA-Z0-9_.]+)\(([a-zA-Z0-9_.]+)\)$/);
          
          if (functionMatch && this.functionMap[functionMatch[1]] && 
              this.variableMap.has(functionMatch[2])) {
            // Es una función aplicada a una variable que ya existe (como cos(x))
            const funcName = functionMatch[1];
            const varName = functionMatch[2];
            
            // Aplicamos la función a cada elemento del vector
            if (typeof this.functionMap[funcName] === 'string') {
              y = `${varName}.map(value => ${this.functionMap[funcName]}(value))`;
            } else {
              // Caso especial para funciones personalizadas
              y = `${varName}.map(value => Math.${funcName}(value))`;
            }
          } else {
            // Caso normal
            y = this.translateExpression(argParts[1]);
          }
          
          // Valores por defecto
          title = "'Plot'";
          xlab = "'X'";
          ylab = "'Y'";
          type = "'p'"; // puntos por defecto
          pch = "1";    // símbolo por defecto
          col = "'rgba(75, 192, 192, 1)'"; // color por defecto
          lty = "1";    // tipo de línea por defecto
          
          // Buscar argumentos nombrados opcionales
          for (let i = 2; i < argParts.length; i++) {
            const arg = argParts[i];
            if (arg.includes('=')) {
              const [name, value] = arg.split('=').map(s => s.trim());
              if (name === 'main') title = this.translateExpression(value);
              else if (name === 'xlab') xlab = this.translateExpression(value);
              else if (name === 'ylab') ylab = this.translateExpression(value);
              else if (name === 'type') type = this.translateExpression(value);
              else if (name === 'pch') pch = this.translateExpression(value);
              else if (name === 'col') col = this.translateColorFunction(value);
              else if (name === 'lty') lty = this.translateExpression(value);
            }
          }
        }
        
        return `
          createPlot({
            x: ${x},
            y: ${y},
            type: 'scatter',
            title: ${title},
            xLabel: ${xlab},
            yLabel: ${ylab},
            pointType: ${type},
            pointSymbol: ${pch},
            color: ${col},
            lineType: ${lty}
          })
        `;
      }
    
    translateColorFunction(color) {
      // Mapear colores de R a CSS
      const colorMap = {
        'red': "'rgba(255, 0, 0, 1)'",
        'green': "'rgba(0, 128, 0, 1)'",
        'blue': "'rgba(0, 0, 255, 1)'",
        'black': "'rgba(0, 0, 0, 1)'",
        'white': "'rgba(255, 255, 255, 1)'",
        'gray': "'rgba(128, 128, 128, 1)'",
        'yellow': "'rgba(255, 255, 0, 1)'",
        'cyan': "'rgba(0, 255, 255, 1)'",
        'magenta': "'rgba(255, 0, 255, 1)'",
        'orange': "'rgba(255, 165, 0, 1)'",
        'purple': "'rgba(128, 0, 128, 1)'",
        'brown': "'rgba(165, 42, 42, 1)'",
        'pink': "'rgba(255, 192, 203, 1)'",
      };
      
      // Si el color está en nuestro mapa, devolvemos su equivalente
      if (colorMap[color.trim()]) {
        return colorMap[color.trim()];
      }
      
      // Si no, intentamos traducirlo como una expresión normal
      return this.translateExpression(color);
    }
    
    translateHistFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      // Extraer x, breaks, etc.
      let x, breaks, title, xlab, ylab, col;
      
      x = this.translateExpression(argParts[0]);
      
      // Valores por defecto
      breaks = '10';
      title = "'Histogram'";
      xlab = "'Value'";
      ylab = "'Frequency'";
      col = "'rgba(54, 162, 235, 0.6)'";
      
      // Buscar argumentos nombrados opcionales
      for (let i = 1; i < argParts.length; i++) {
        const arg = argParts[i];
        if (arg.includes('=')) {
          const [name, value] = arg.split('=').map(s => s.trim());
          if (name === 'breaks') breaks = this.translateExpression(value);
          else if (name === 'main') title = this.translateExpression(value);
          else if (name === 'xlab') xlab = this.translateExpression(value);
          else if (name === 'ylab') ylab = this.translateExpression(value);
          else if (name === 'col') col = this.translateColorFunction(value);
        }
      }
      
      return `
        createPlot({
          data: ${x},
          type: 'histogram',
          bins: ${breaks},
          title: ${title},
          xLabel: ${xlab},
          yLabel: ${ylab},
          color: ${col}
        })
      `;
    }
    
    translateBoxplotFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      // Extraer x, formula, data, etc.
      let x, formula, data, title, xlab, ylab, col;
      
      x = this.translateExpression(argParts[0]);
      
      // Valores por defecto
      title = "'Boxplot'";
      xlab = "''";
      ylab = "'Value'";
      col = "'rgba(255, 99, 132, 0.6)'";
      
      // Buscar argumentos nombrados opcionales
      for (let i = 1; i < argParts.length; i++) {
        const arg = argParts[i];
        if (arg.includes('=')) {
          const [name, value] = arg.split('=').map(s => s.trim());
          if (name === 'data') data = this.translateExpression(value);
          else if (name === 'main') title = this.translateExpression(value);
          else if (name === 'xlab') xlab = this.translateExpression(value);
          else if (name === 'ylab') ylab = this.translateExpression(value);
          else if (name === 'col') col = this.translateColorFunction(value);
        }
      }
      
      return `
        createPlot({
          data: ${x},
          type: 'boxplot',
          title: ${title},
          xLabel: ${xlab},
          yLabel: ${ylab},
          color: ${col}
        })
      `;
    }
    
    translateBarplotFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      // Extraer height, names.arg, etc.
      let height, names, title, xlab, ylab, col;
      
      height = this.translateExpression(argParts[0]);
      
      // Valores por defecto
      title = "'Barplot'";
      xlab = "''";
      ylab = "'Value'";
      col = "'rgba(54, 162, 235, 0.6)'";
      names = `Array.from({length: ${height}.length}, (_, i) => i + 1)`;
      
      // Buscar argumentos nombrados opcionales
      for (let i = 1; i < argParts.length; i++) {
        const arg = argParts[i];
        if (arg.includes('=')) {
          const [name, value] = arg.split('=').map(s => s.trim());
          if (name === 'names.arg') names = this.translateExpression(value);
          else if (name === 'main') title = this.translateExpression(value);
          else if (name === 'xlab') xlab = this.translateExpression(value);
          else if (name === 'ylab') ylab = this.translateExpression(value);
          else if (name === 'col') col = this.translateColorFunction(value);
        }
      }
      
      return `
        createPlot({
          data: ${height},
          labels: ${names},
          type: 'bar',
          title: ${title},
          xLabel: ${xlab},
          yLabel: ${ylab},
          color: ${col}
        })
      `;
    }
    
    translatePieFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      // Extraer x, labels, etc.
      let x, labels, title, col;
      
      x = this.translateExpression(argParts[0]);
      
      // Valores por defecto
      title = "'Pie Chart'";
      labels = `Array.from({length: ${x}.length}, (_, i) => i + 1)`;
      col = "['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)']";
      
      // Buscar argumentos nombrados opcionales
      for (let i = 1; i < argParts.length; i++) {
        const arg = argParts[i];
        if (arg.includes('=')) {
          const [name, value] = arg.split('=').map(s => s.trim());
          if (name === 'labels') labels = this.translateExpression(value);
          else if (name === 'main') title = this.translateExpression(value);
          else if (name === 'col') col = this.translateColorFunction(value);
        }
      }
      
      return `
        createPlot({
          data: ${x},
          labels: ${labels},
          type: 'pie',
          title: ${title},
          colors: ${col}
        })
      `;
    }
    
    translateLinesFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      // Extraer x, y, etc.
      let x, y, col, lty, lwd;
      
      if (argParts.length === 1) {
        // Solo y, x es índice implícito
        y = this.translateExpression(argParts[0]);
        x = `Array.from({length: ${y}.length}, (_, i) => i + 1)`;
      } else {
        // x e y explícitos
        x = this.translateExpression(argParts[0]);
        y = this.translateExpression(argParts[1]);
      }
      
      // Valores por defecto
      col = "'rgba(75, 192, 192, 1)'";
      lty = "1";
      lwd = "2";
      
      // Buscar argumentos nombrados opcionales
      for (let i = 2; i < argParts.length; i++) {
        const arg = argParts[i];
        if (arg.includes('=')) {
          const [name, value] = arg.split('=').map(s => s.trim());
          if (name === 'col') col = this.translateColorFunction(value);
          else if (name === 'lty') lty = this.translateExpression(value);
          else if (name === 'lwd') lwd = this.translateExpression(value);
        }
      }
      
      return `
        addLines({
          x: ${x},
          y: ${y},
          color: ${col},
          lineType: ${lty},
          lineWidth: ${lwd}
        })
      `;
    }
    
    translatePointsFunction(expr) {
      const argsStart = expr.indexOf('(') + 1;
      const argsEnd = this.findClosingBracket(expr, argsStart - 1);
      const args = expr.substring(argsStart, argsEnd).trim();
      
      // Extraer argumentos
      const argParts = [];
      let currentArg = '';
      let depth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if (char === '(') depth++;
        else if (char === ')') depth--;
        
        if (char === ',' && depth === 0) {
          argParts.push(currentArg.trim());
          currentArg = '';
        } else {
          currentArg += char;
        }
      }
      
      if (currentArg.trim()) {
        argParts.push(currentArg.trim());
      }
      
      // Extraer x, y, etc.
      let x, y, pch, col, cex;
      
      if (argParts.length === 1) {
        // Solo y, x es índice implícito
        y = this.translateExpression(argParts[0]);
        x = `Array.from({length: ${y}.length}, (_, i) => i + 1)`;
      } else {
        // x e y explícitos
        x = this.translateExpression(argParts[0]);
        y = this.translateExpression(argParts[1]);
      }
      
      // Valores por defecto
      pch = "1"; // símbolo de círculo
      col = "'rgba(255, 99, 132, 1)'";
      cex = "1"; // tamaño normal
      
      // Buscar argumentos nombrados opcionales
      for (let i = 2; i < argParts.length; i++) {
        const arg = argParts[i];
        if (arg.includes('=')) {
          const [name, value] = arg.split('=').map(s => s.trim());
          if (name === 'pch') pch = this.translateExpression(value);
          else if (name === 'col') col = this.translateColorFunction(value);
          else if (name === 'cex') cex = this.translateExpression(value);
        }
      }
      
      return `
        addPoints({
          x: ${x},
          y: ${y},
          pointType: ${pch},
          color: ${col},
          size: ${cex}
        })
      `;
    }
  }
  
  // Exportar el compilador
  export default RCompiler;