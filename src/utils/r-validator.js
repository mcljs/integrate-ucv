/**
 * Sistema de validación para ejercicios de código R
 * Proporciona funciones para validar la sintaxis y resultados de código R
 */

/**
 * Analiza el código R en busca de patrones específicos
 * @param {string} code - Código R a analizar
 * @param {object} patterns - Patrones a buscar en el código
 * @returns {object} Resultado del análisis
 */
export function analyzeRCode(code, patterns = {}) {
    const results = {
      hasVectorCreation: false,
      hasMeanCalculation: false,
      hasCorrectValues: false,
      hasCorrectVariableNames: false,
      hasTypeConversion: false,
      syntaxErrors: []
    };
  
    // Verificar si el código contiene la creación de un vector
    if (patterns.vectorCreation) {
      const vectorPattern = new RegExp(patterns.vectorCreation);
      results.hasVectorCreation = vectorPattern.test(code);
    }
  
    // Verificar si el código contiene el cálculo de una media
    if (patterns.meanCalculation) {
      const meanPattern = new RegExp(patterns.meanCalculation);
      results.hasMeanCalculation = meanPattern.test(code);
    }
  
    // Verificar si el vector contiene los valores correctos
    if (patterns.correctValues) {
      const valuesPattern = new RegExp(patterns.correctValues);
      results.hasCorrectValues = valuesPattern.test(code);
    }
  
    // Verificar nombres de variables
    if (patterns.variableNames) {
      const varPattern = new RegExp(patterns.variableNames);
      results.hasCorrectVariableNames = varPattern.test(code);
    }
    
    // Verificar conversión de tipos
    if (patterns.typeConversion) {
      const conversionPattern = new RegExp(patterns.typeConversion);
      results.hasTypeConversion = conversionPattern.test(code);
    }
  
    // Verificar errores comunes de sintaxis
    checkSyntaxErrors(code, results);
  
    return results;
  }
  
  /**
   * Verifica errores comunes de sintaxis en código R
   * @param {string} code - Código R a analizar
   * @param {object} results - Objeto de resultados a modificar
   */
  function checkSyntaxErrors(code, results) {
    // Verificar paréntesis balanceados
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      results.syntaxErrors.push({
        type: 'error',
        message: 'Paréntesis desbalanceados. Verifica que cada paréntesis abierto tenga su correspondiente cierre.'
      });
    }
  
    // Verificar comas en la declaración de vectores
    if (code.includes('c(') && !code.match(/c\(\s*([^,\s]+\s*,\s*)+[^,\s]+\s*\)/)) {
      const vectorMatch = code.match(/c\(([^)]+)\)/);
      if (vectorMatch && !vectorMatch[1].includes(',')) {
        results.syntaxErrors.push({
          type: 'error',
          message: 'Falta separar los elementos del vector con comas.'
        });
      }
    }
  
    // Verificar asignación correcta
    if (!code.includes('<-') && !code.includes('=')) {
      if (code.includes('valores') || code.includes('valores_texto') || 
          code.includes('edades') || code.includes('media')) {
        results.syntaxErrors.push({
          type: 'error',
          message: 'Falta el operador de asignación. Usa "<-" o "=" para asignar valores a variables.'
        });
      }
    }
  
    // Verificar nombre de función mean()
    if (code.includes('mean') && !code.includes('mean(')) {
      results.syntaxErrors.push({
        type: 'error',
        message: 'La función "mean" necesita paréntesis. Usa mean() para calcular la media.'
      });
    }
    
    // Verificar nombre de función as.character()
    if (code.includes('as.character') && !code.includes('as.character(')) {
      results.syntaxErrors.push({
        type: 'error',
        message: 'La función "as.character" necesita paréntesis. Usa as.character() para la conversión.'
      });
    }
  }
  
  /**
   * Simula la ejecución de código R
   * @param {string} code - Código R a ejecutar
   * @param {object} exercise - Datos del ejercicio
   * @returns {object} Resultado de la ejecución
   */
  export function simulateRExecution(code, exercise) {
    if (!exercise) {
      return {
        output: "Error: No se proporcionaron datos del ejercicio",
        success: false,
        error: "Configuración incompleta"
      };
    }
  
    // Para el ejercicio de cálculo de media
    if (exercise.type === 'mean_calculation') {
      const analysis = analyzeRCode(code, {
        vectorCreation: 'edades\\s*<-\\s*c\\(',
        meanCalculation: 'media(_|\\w)*\\s*<-\\s*mean\\(\\s*edades\\s*\\)',
        correctValues: 'c\\(\\s*23\\s*,\\s*45\\s*,\\s*67\\s*,\\s*32\\s*,\\s*19\\s*,\\s*21\\s*,\\s*30\\s*\\)',
        variableNames: '(edades|media(_|\\w)*)'
      });
  
      // Verificar errores de sintaxis
      if (analysis.syntaxErrors.length > 0) {
        return {
          output: null,
          success: false,
          error: analysis.syntaxErrors[0].message,
          details: analysis
        };
      }
  
      // Verificar si falta la creación del vector
      if (!analysis.hasVectorCreation) {
        return {
          output: null,
          success: false,
          error: "No se ha creado el vector 'edades' correctamente.",
          details: analysis
        };
      }
  
      // Verificar si los valores son correctos
      if (!analysis.hasCorrectValues) {
        return {
          output: null,
          success: false,
          error: "El vector 'edades' no contiene los valores correctos o están en orden incorrecto.",
          details: analysis
        };
      }
  
      // Verificar si falta el cálculo de la media
      if (!analysis.hasMeanCalculation) {
        return {
          output: null,
          success: false,
          error: "No se ha calculado la media del vector 'edades' correctamente. Usa la función mean().",
          details: analysis
        };
      }
  
      // Todo está correcto, devolver el resultado esperado
      return {
        output: exercise.expectedOutput,
        success: true,
        details: analysis
      };
    }
    
    // Para el ejercicio de conversión de tipos de datos
    else if (exercise.type === 'data_conversion') {
      const analysis = analyzeRCode(code, {
        vectorCreation: 'valores\\s*<-\\s*(c\\(\\s*1\\s*,\\s*2\\s*,\\s*3\\s*,\\s*4\\s*,\\s*5\\s*\\)|1:5)',
        typeConversion: 'valores_texto\\s*<-\\s*as\\.character\\(\\s*valores\\s*\\)',
        variableNames: '(valores|valores_texto)'
      });
      
      // Verificar errores de sintaxis
      if (analysis.syntaxErrors.length > 0) {
        return {
          output: null,
          success: false,
          error: analysis.syntaxErrors[0].message,
          details: analysis
        };
      }
      
      // Verificar si falta la creación del vector
      if (!analysis.hasVectorCreation) {
        return {
          output: null,
          success: false,
          error: "No se ha creado el vector 'valores' correctamente. Debes crear un vector con los números del 1 al 5.",
          details: analysis
        };
      }
      
      // Verificar si falta la conversión de tipos
      if (!analysis.hasTypeConversion) {
        return {
          output: null,
          success: false,
          error: "No se ha convertido el vector a tipo caracter correctamente. Usa la función as.character().",
          details: analysis
        };
      }
      
      // Todo está correcto, devolver el resultado esperado
      return {
        output: exercise.expectedOutput,
        success: true,
        details: analysis
      };
    }
  
    // Para otros tipos de ejercicios (esto sería un fallback genérico)
    return {
      output: "Error: Tipo de ejercicio no soportado para validación automática",
      success: false,
      error: "Este tipo de ejercicio no tiene validaciones específicas implementadas."
    };
  }
  
  /**
   * Verifica una solución completa
   * @param {string} code - Código R a verificar
   * @param {object} exercise - Datos del ejercicio
   * @returns {object} Resultado de la verificación
   */
  export function verifyRSolution(code, exercise) {
    // Verificar si el ejercicio existe
    if (!exercise) {
      return {
        isCorrect: false,
        message: "No se pudo validar el ejercicio",
        details: null
      };
    }
  
    // Simular la ejecución
    const result = simulateRExecution(code, exercise);
  
    if (result.success) {
      return {
        isCorrect: true,
        message: "¡Excelente! Tu solución es correcta.",
        output: result.output,
        details: result.details
      };
    } else {
      return {
        isCorrect: false,
        message: result.error || "Tu solución no es correcta. Revisa tu código.",
        output: null,
        details: result.details
      };
    }
  }