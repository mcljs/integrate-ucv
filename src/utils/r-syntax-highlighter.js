/**
 * Componente sencillo para mostrar código R con colores
 * Basado en un enfoque de React.js puro para mayor compatibilidad
 */

import React from 'react';



// Palabras clave en R
const keywords = [
  'if', 'else', 'for', 'while', 'repeat', 'in', 'function', 'next', 'break',
  'TRUE', 'FALSE', 'NULL', 'NA', 'Inf', 'NaN', 'return', 'source', 'library'
];

// Funciones comunes en R
const functions = [
  'c', 'mean', 'median', 'sum', 'min', 'max', 'length', 'paste', 'print',
  'head', 'tail', 'read.csv', 'write.csv', 'plot', 'hist', 'boxplot'
];

/**
 * Componente para mostrar código R con sintaxis resaltada
 */
export function RCodeBlock({ code }) {
  if (!code) return null;
  
  // Dividir el código en líneas
  const lines = code.split('\n');
  
  return (
    <pre className="font-mono text-sm overflow-x-auto p-2 rounded bg-gray-50">
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          {formatLine(line)}
        </div>
      ))}
    </pre>
  );
}

/**
 * Formatea una línea de código R con colores
 */
function formatLine(line) {
  const tokens = [];
  
  // Procesar la línea caracter por caracter
  let currentToken = '';
  let tokenType = 'text';
  let i = 0;
  
  while (i < line.length) {
    // Comentarios
    if (line[i] === '#') {
      // Guardar token anterior si existe
      if (currentToken) {
        tokens.push({ type: tokenType, text: currentToken });
        currentToken = '';
      }
      
      // Extraer todo el comentario hasta el final de la línea
      let comment = line.substring(i);
      tokens.push({ type: 'comment', text: comment });
      break; // Terminamos el procesamiento de esta línea
    }
    
    // Cadenas de texto
    else if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      
      // Guardar token anterior si existe
      if (currentToken) {
        tokens.push({ type: tokenType, text: currentToken });
        currentToken = '';
      }
      
      // Buscar el final de la cadena
      let j = i + 1;
      let string = quote;
      
      while (j < line.length && line[j] !== quote) {
        string += line[j];
        j++;
      }
      
      if (j < line.length) {
        string += quote; // Añadir la comilla final
      }
      
      tokens.push({ type: 'string', text: string });
      i = j + 1;
      continue;
    }
    
    // Operadores
    else if ('+-*/^<>=!&|'.includes(line[i])) {
      // Operadores compuestos (<-, ->, ==, !=, etc.)
      if (i + 1 < line.length && 
          ((line[i] === '<' && line[i+1] === '-') || 
           (line[i] === '-' && line[i+1] === '>') ||
           (line[i] === '=' && line[i+1] === '=') ||
           (line[i] === '!' && line[i+1] === '=') ||
           (line[i] === '<' && line[i+1] === '=') ||
           (line[i] === '>' && line[i+1] === '='))) {
        
        // Guardar token anterior si existe
        if (currentToken) {
          tokens.push({ type: tokenType, text: currentToken });
          currentToken = '';
        }
        
        tokens.push({ type: 'operator', text: line.substring(i, i+2) });
        i += 2;
        continue;
      }
      
      // Operadores simples
      if (currentToken) {
        tokens.push({ type: tokenType, text: currentToken });
        currentToken = '';
      }
      
      tokens.push({ type: 'operator', text: line[i] });
      i++;
      continue;
    }
    
    // Identificar palabras (palabras clave, funciones, variables)
    else if (/[a-zA-Z0-9._]/.test(line[i])) {
      if (currentToken === '' || tokenType !== 'word') {
        // Si estamos comenzando una nueva palabra
        if (currentToken) {
          tokens.push({ type: tokenType, text: currentToken });
        }
        currentToken = line[i];
        tokenType = 'word';
      } else {
        // Continuamos acumulando la palabra
        currentToken += line[i];
      }
      i++;
    }
    
    // Otros caracteres
    else {
      if (currentToken) {
        // Clasificar la palabra acumulada antes de añadir otro caracter
        if (tokenType === 'word') {
          // Verificar si es función (seguida por paréntesis abierto)
          const isFunction = functions.includes(currentToken) && 
                            i < line.length && 
                            line.substring(i).trim().startsWith('(');
          
          // Verificar si es palabra clave
          const isKeyword = keywords.includes(currentToken);
          
          // Añadir el token con su tipo correcto
          if (isFunction) {
            tokens.push({ type: 'function', text: currentToken });
          } else if (isKeyword) {
            tokens.push({ type: 'keyword', text: currentToken });
          } else if (/^\d+(\.\d+)?$/.test(currentToken)) {
            tokens.push({ type: 'number', text: currentToken });
          } else {
            tokens.push({ type: 'variable', text: currentToken });
          }
        } else {
          tokens.push({ type: tokenType, text: currentToken });
        }
        currentToken = '';
      }
      
      // Añadir el caracter actual como un token independiente
      tokens.push({ type: 'text', text: line[i] });
      i++;
    }
  }
  
  // No olvidar el último token si existe
  if (currentToken) {
    if (tokenType === 'word') {
      if (keywords.includes(currentToken)) {
        tokens.push({ type: 'keyword', text: currentToken });
      } else if (functions.includes(currentToken) && 
                i < line.length && 
                line.substring(i).trim().startsWith('(')) {
        tokens.push({ type: 'function', text: currentToken });
      } else if (/^\d+(\.\d+)?$/.test(currentToken)) {
        tokens.push({ type: 'number', text: currentToken });
      } else {
        tokens.push({ type: 'variable', text: currentToken });
      }
    } else {
      tokens.push({ type: tokenType, text: currentToken });
    }
  }
  
  // Renderizar todos los tokens con sus estilos
  return tokens.map((token, index) => {
    let className = '';
    
    switch (token.type) {
      case 'keyword':
        className = 'text-indigo-600 font-medium';
        break;
      case 'function':
        className = 'text-yellow-700 font-medium';
        break;
      case 'comment':
        className = 'text-gray-400';
        break;
      case 'string':
        className = 'text-green-600';
        break;
      case 'number':
        className = 'text-blue-600';
        break;
      case 'operator':
        className = 'text-purple-600';
        break;
      case 'variable':
        className = 'text-gray-700';
        break;
      case 'text':
      default:
        className = 'text-gray-700';
    }
    
    return <span key={index} className={className}>{token.text}</span>;
  });
}