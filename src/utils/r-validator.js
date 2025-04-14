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
    // Campos para ejercicios existentes
    hasVectorCreation: false,
    hasMeanCalculation: false,
    hasCorrectValues: false,
    hasCorrectVariableNames: false,
    hasTypeConversion: false,
    
    // Campos para nuevos ejercicios de vectores y matrices
    hasVectorOperations: false,
    hasMatrixCreation: false,
    hasMatrixOperations: false,
    hasDiagonalExtraction: false,
    
    // Campos para nuevos ejercicios de dataframes
    hasDataframeCreation: false,
    hasDataframeManipulation: false,
    hasDataframeFiltering: false,
    hasMaxSearch: false,
    
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
  
  // Verificar operaciones con vectores
  if (patterns.vectorOperations) {
    const vectorOpsPattern = new RegExp(patterns.vectorOperations);
    results.hasVectorOperations = vectorOpsPattern.test(code);
  }
  
  // Verificar creación de matrices
  if (patterns.matrixCreation) {
    const matrixPattern = new RegExp(patterns.matrixCreation);
    results.hasMatrixCreation = matrixPattern.test(code);
  }
  
  // Verificar operaciones con matrices
  if (patterns.matrixOperations) {
    const matrixOpsPattern = new RegExp(patterns.matrixOperations);
    results.hasMatrixOperations = matrixOpsPattern.test(code);
  }
  
  // Verificar extracción de diagonal
  if (patterns.diagonalExtraction) {
    const diagPattern = new RegExp(patterns.diagonalExtraction);
    results.hasDiagonalExtraction = diagPattern.test(code);
  }
  
  // Verificar creación de dataframe
  if (patterns.dataframeCreation) {
    const dfPattern = new RegExp(patterns.dataframeCreation);
    results.hasDataframeCreation = dfPattern.test(code);
  }
  
  // Verificar manipulación de dataframe
  if (patterns.dataframeManipulation) {
    const dfManipPattern = new RegExp(patterns.dataframeManipulation);
    results.hasDataframeManipulation = dfManipPattern.test(code);
  }
  
  // Verificar filtrado de dataframe
  if (patterns.dataframeFiltering) {
    const dfFilterPattern = new RegExp(patterns.dataframeFiltering);
    results.hasDataframeFiltering = dfFilterPattern.test(code);
  }
  
  // Verificar búsqueda de máximo
  if (patterns.maxSearch) {
    const maxSearchPattern = new RegExp(patterns.maxSearch);
    results.hasMaxSearch = maxSearchPattern.test(code);
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
        code.includes('edades') || code.includes('media') ||
        code.includes('vector_a') || code.includes('vector_b') ||
        code.includes('matriz_a') || code.includes('estudiantes')) {
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
  
  // Verificar sintaxis de matrices
  if (code.includes('matrix') && !code.includes('matrix(')) {
    results.syntaxErrors.push({
      type: 'error',
      message: 'La función "matrix" necesita paréntesis. Usa matrix() para crear matrices.'
    });
  }
  
  // Verificar parámetros de la función matrix
  if (code.includes('matrix(') && code.includes('byrow') && !code.match(/byrow\s*=\s*(TRUE|T|FALSE|F)/i)) {
    results.syntaxErrors.push({
      type: 'error',
      message: 'El parámetro byrow debe ser TRUE o FALSE.'
    });
  }
  
  // Verificar uso de diag()
  if (code.includes('diag') && !code.includes('diag(')) {
    results.syntaxErrors.push({
      type: 'error',
      message: 'La función "diag" necesita paréntesis. Usa diag() para extraer la diagonal.'
    });
  }
  
  // Verificar sintaxis de data.frame
  if (code.includes('data.frame') && !code.includes('data.frame(')) {
    results.syntaxErrors.push({
      type: 'error',
      message: 'La función "data.frame" necesita paréntesis. Usa data.frame() para crear dataframes.'
    });
  }
  
  // Verificar operador $ para dataframes
  if ((code.includes('estudiantes') || code.includes('aprobados')) && 
      code.includes('$') && !code.match(/[a-zA-Z_][a-zA-Z0-9_]*\$[a-zA-Z_][a-zA-Z0-9_]*/)) {
    results.syntaxErrors.push({
      type: 'error',
      message: 'Revisa el uso del operador $. La sintaxis correcta es dataframe$columna.'
    });
  }
  
  // Verificar función which.max()
  if (code.includes('which.max') && !code.includes('which.max(')) {
    results.syntaxErrors.push({
      type: 'error',
      message: 'La función "which.max" necesita paréntesis. Usa which.max() para encontrar el índice del valor máximo.'
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
  
  // Para el ejercicio de operaciones con vectores
  else if (exercise.type === 'vector_operations') {
    // Modificar el análisis para verificar cada vector por separado
    const analysis_vector_a = analyzeRCode(code, {
      vectorCreation: 'vector_a\\s*<-\\s*c\\(\\s*5\\s*,\\s*10\\s*,\\s*15\\s*,\\s*20\\s*,\\s*25\\s*\\)'
    });
    
    const analysis_vector_b = analyzeRCode(code, {
      vectorCreation: 'vector_b\\s*<-\\s*c\\(\\s*2\\s*,\\s*4\\s*,\\s*6\\s*,\\s*8\\s*,\\s*10\\s*\\)'
    });
    
    const analysis_operations = analyzeRCode(code, {
      vectorOperations: 'resultado_suma\\s*<-\\s*vector_a\\s*\\+\\s*vector_b',
      variableNames: '(vector_a|vector_b|resultado_suma|resultado_producto|producto_punto)'
    });
    
    // Combinar resultados
    const analysis = {
      ...analysis_operations,
      hasVectorCreation: analysis_vector_a.hasVectorCreation && analysis_vector_b.hasVectorCreation,
      syntaxErrors: [
        ...analysis_vector_a.syntaxErrors,
        ...analysis_vector_b.syntaxErrors,
        ...analysis_operations.syntaxErrors
      ]
    };
    
    // Verificar errores de sintaxis
    if (analysis.syntaxErrors.length > 0) {
      return {
        output: null,
        success: false,
        error: analysis.syntaxErrors[0].message,
        details: analysis
      };
    }
    
    // Verificar si faltan los vectores
    if (!analysis_vector_a.hasVectorCreation) {
      return {
        output: null,
        success: false,
        error: "No se ha creado correctamente el vector 'vector_a' con los valores 5, 10, 15, 20, 25.",
        details: analysis
      };
    }
    
    if (!analysis_vector_b.hasVectorCreation) {
      return {
        output: null,
        success: false,
        error: "No se ha creado correctamente el vector 'vector_b' con los valores 2, 4, 6, 8, 10.",
        details: analysis
      };
    }
    
    // Verificar si faltan las operaciones
    if (!analysis.hasVectorOperations) {
      return {
        output: null,
        success: false,
        error: "No se han realizado las operaciones entre vectores correctamente. Debes calcular la suma, el producto y el producto punto.",
        details: analysis
      };
    }
    
    // Verificar específicamente cada operación
    if (!code.match(/resultado_suma\s*<-\s*vector_a\s*\+\s*vector_b/)) {
      return {
        output: null,
        success: false,
        error: "No se ha calculado correctamente la suma de los vectores. Usa: resultado_suma <- vector_a + vector_b",
        details: analysis
      };
    }
    
    if (!code.match(/resultado_producto\s*<-\s*vector_a\s*\*\s*vector_b/)) {
      return {
        output: null,
        success: false,
        error: "No se ha calculado correctamente el producto elemento a elemento. Usa: resultado_producto <- vector_a * vector_b",
        details: analysis
      };
    }
    
    if (!code.match(/producto_punto\s*<-\s*sum\(\s*vector_a\s*\*\s*vector_b\s*\)/)) {
      return {
        output: null,
        success: false,
        error: "No se ha calculado correctamente el producto punto. Debe ser la suma del producto elemento a elemento de los vectores.",
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
  
  // Para el ejercicio de creación y manipulación de matrices
  else if (exercise.type === 'matrix_operations') {
    const analysis = analyzeRCode(code, {
      matrixCreation: 'matriz_a\\s*<-\\s*matrix\\(\\s*1:9\\s*,\\s*nrow\\s*=\\s*3\\s*,\\s*ncol\\s*=\\s*3\\s*,\\s*byrow\\s*=\\s*TRUE\\s*\\)',
      diagonalExtraction: 'diagonal_a\\s*<-\\s*diag\\(\\s*matriz_a\\s*\\)',
      matrixOperations: 'suma_total\\s*<-\\s*sum\\(\\s*matriz_a\\s*\\)',
      variableNames: '(matriz_a|diagonal_a|suma_total)'
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
    
    // Verificar si falta la creación de la matriz
    if (!analysis.hasMatrixCreation) {
      return {
        output: null,
        success: false,
        error: "No se ha creado la matriz 'matriz_a' correctamente. Debe ser una matriz 3x3 con los números del 1 al 9 llenándola por filas.",
        details: analysis
      };
    }
    
    // Verificar si falta la extracción de la diagonal
    if (!analysis.hasDiagonalExtraction) {
      return {
        output: null,
        success: false,
        error: "No se ha extraído la diagonal de la matriz correctamente. Usa la función diag().",
        details: analysis
      };
    }
    
    // Verificar si falta el cálculo de la suma
    if (!analysis.hasMatrixOperations) {
      return {
        output: null,
        success: false,
        error: "No se ha calculado la suma de todos los elementos de la matriz correctamente. Usa la función sum().",
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
  
  // Para el ejercicio de creación de dataframes
  else if (exercise.type === 'dataframe_creation') {
    const analysis = analyzeRCode(code, {
      dataframeCreation: 'estudiantes\\s*<-\\s*data\\.frame\\(',
      dataframeManipulation: 'estudiantes\\$Puntos_Extra\\s*<-\\s*estudiantes\\$Nota\\s*\\*\\s*0\\.1',
      variableNames: '(estudiantes|Nombre|Edad|Nota|Aprobado|Puntos_Extra)'
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
    
    // Verificar si faltan los vectores para el dataframe
    if (!code.match(/Nombre\s*<-\s*c\(\s*\"Ana\"\s*,\s*\"Pedro\"\s*,\s*\"Carmen\"\s*,\s*\"Miguel\"\s*,\s*\"Laura\"\s*\)/)) {
      return {
        output: null,
        success: false,
        error: "No se ha creado correctamente el vector 'Nombre' con los valores especificados.",
        details: analysis
      };
    }
    
    // Verificar si falta la creación del dataframe
    if (!analysis.hasDataframeCreation) {
      return {
        output: null,
        success: false,
        error: "No se ha creado el dataframe 'estudiantes' correctamente. Usa la función data.frame().",
        details: analysis
      };
    }
    
    // Verificar si falta la manipulación del dataframe
    if (!analysis.hasDataframeManipulation) {
      return {
        output: null,
        success: false,
        error: "No se ha añadido la columna 'Puntos_Extra' correctamente. Debe ser igual a 'Nota' multiplicada por 0.1.",
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
  
  // Para el ejercicio de filtrado y análisis de dataframes
  else if (exercise.type === 'dataframe_analysis') {
    const analysis = analyzeRCode(code, {
      dataframeFiltering: 'aprobados\\s*<-\\s*estudiantes\\[estudiantes\\$Aprobado\\s*==\\s*TRUE',
      dataframeManipulation: 'media_aprobados\\s*<-\\s*mean\\(aprobados\\$Nota\\)',
      maxSearch: 'mejor_estudiante\\s*<-\\s*estudiantes\\$Nombre\\[which\\.max\\(estudiantes\\$Nota\\)\\]',
      variableNames: '(aprobados|media_aprobados|mejor_estudiante)'
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
    
    // Verificar si falta el filtrado del dataframe
    if (!analysis.hasDataframeFiltering) {
      return {
        output: null,
        success: false,
        error: "No se ha filtrado el dataframe para obtener los estudiantes aprobados correctamente. Usa estudiantes[estudiantes$Aprobado == TRUE, ]",
        details: analysis
      };
    }
    
    // Verificar si falta el cálculo de la media
    if (!analysis.hasDataframeManipulation) {
      return {
        output: null,
        success: false,
        error: "No se ha calculado la media de las notas de los estudiantes aprobados correctamente. Usa mean(aprobados$Nota)",
        details: analysis
      };
    }
    
    // Verificar si falta la búsqueda del mejor estudiante
    if (!analysis.hasMaxSearch) {
      return {
        output: null,
        success: false,
        error: "No se ha encontrado correctamente el estudiante con la nota más alta. Usa which.max() para obtener el índice de la nota máxima.",
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