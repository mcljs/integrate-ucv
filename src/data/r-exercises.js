/**
 * Base de datos de ejercicios de R
 * Contiene los ejercicios, soluciones y material educativo para el curso
 */

export const lessons = {
    'intro-r': {
      title: "Introducción básica a R",
      background: `
  ## ¿Qué es R?
  
  R es un lenguaje de programación y entorno para análisis estadístico y gráficos. Creado por Ross Ihaka y Robert Gentleman en la Universidad de Auckland, Nueva Zelanda.
  
  ### Características principales:
  - Lenguaje especializado en estadística y visualización de datos
  - Gratuito y de código abierto
  - Amplia comunidad académica y profesional
  - Miles de paquetes disponibles para diferentes áreas de análisis
      `,
      codeExamples: [
        {
          title: "Tu primer comando en R",
          code: `# Esto es un comentario
  # R puede funcionar como una calculadora
  2 + 2
  
  # Crear una variable
  x <- 10  # El operador <- asigna valores
  y <- 5
  
  # Realizar operaciones
  x + y
  x * y
  `,
          explanation: "R utiliza el operador '<-' como forma estándar de asignación, aunque también acepta '=' para asignar valores a variables."
        },
        {
          title: "Funciones básicas",
          code: `# Crear un vector
  nums <- c(10, 25, 8, 32, 15, 7)
  
  # Calcular estadísticas básicas
  mean(nums)    # Media
  median(nums)  # Mediana
  min(nums)     # Valor mínimo
  max(nums)     # Valor máximo
  sum(nums)     # Suma total
  length(nums)  # Número de elementos
  `,
          explanation: "La función c() se usa para combinar valores en un vector. R tiene muchas funciones estadísticas incorporadas."
        }
      ],
      exercises: [
        {
          id: "vector-mean",
          title: "Cálculo de media de un vector",
          type: "mean_calculation",
          instruction: "Crea un vector llamado 'edades' con los siguientes valores: 23, 45, 67, 32, 19, 21, 30 y calcula su media.",
          starterCode: "# Crea el vector edades\nedades <- \n\n# Calcula la media\nmedia_edades <- ",
          solution: "# Crea el vector edades\nedades <- c(23, 45, 67, 32, 19, 21, 30)\n\n# Calcula la media\nmedia_edades <- mean(edades)",
          hint: "Usa la función c() para crear el vector y mean() para calcular la media.",
          expectedOutput: "33.85714",
          validationCriteria: [
            {
              description: "Crear el vector 'edades' correctamente",
              test: (code) => /edades\s*<-\s*c\(\s*23\s*,\s*45\s*,\s*67\s*,\s*32\s*,\s*19\s*,\s*21\s*,\s*30\s*\)/.test(code),
              message: "Debes crear el vector 'edades' con los valores exactos en el orden indicado: 23, 45, 67, 32, 19, 21, 30"
            },
            {
              description: "Calcular la media usando mean()",
              test: (code) => /media(_|\w)*\s*<-\s*mean\(\s*edades\s*\)/.test(code),
              message: "Debes calcular la media del vector 'edades' usando la función mean()"
            }
          ],
          difficulty: "Principiante",
          tags: ["vectores", "estadística descriptiva"]
        }
      ],
      extraCredit: [
        {
          id: "stats-function",
          title: "Crear una función personalizada",
          instruction: "Crea una función llamada 'estadisticas_basicas' que reciba un vector numérico y devuelva una lista con la media, mediana, valor mínimo y valor máximo.",
          starterCode: "estadisticas_basicas <- function(datos) {\n  # Tu código aquí\n}",
          solution: `estadisticas_basicas <- function(datos) {
    # Verificar que el input es numérico
    if (!is.numeric(datos)) {
      stop("El vector debe contener valores numéricos")
    }
    
    # Crear lista con estadísticas
    resultado <- list(
      media = mean(datos),
      mediana = median(datos),
      minimo = min(datos),
      maximo = max(datos)
    )
    
    return(resultado)
  }`,
          explanation: "Las funciones en R se definen con function() y pueden retornar cualquier tipo de dato, incluyendo listas.",
          type: "function_creation",
          expectedOutput: "list(media = 33.85714, mediana = 30, minimo = 19, maximo = 67)",
          difficulty: "Intermedio",
          tags: ["funciones", "listas", "estadística descriptiva"]
        }
      ],
      resources: [
        {
          title: "Documentación oficial de R",
          url: "https://www.r-project.org/",
          type: "link"
        },
        {
          title: "R for Data Science (libro gratuito)",
          url: "https://r4ds.had.co.nz/",
          type: "book"
        }
      ]
    },
    'data-types': {
      title: "Tipos de datos en R",
      background: `
  ## Tipos de datos fundamentales en R
  
  R ofrece una variedad de tipos de datos para diferentes necesidades de análisis. Comprender estos tipos es esencial para manipular datos eficientemente.
  
  ### Tipos básicos:
  - **Numérico (numeric)**: Valores decimales o enteros (ej. 3.14, 42)
  - **Entero (integer)**: Valores enteros específicos (ej. 1L, 100L)
  - **Complejo (complex)**: Números complejos (ej. 3+2i)
  - **Lógico (logical)**: Valores booleanos TRUE/FALSE
  - **Caracter (character)**: Texto entre comillas (ej. "Hola mundo")
      `,
      codeExamples: [
        {
          title: "Tipos de datos básicos",
          code: `# Numérico
  x <- 10.5
  class(x)  # "numeric"
  
  # Entero
  y <- 10L  # La 'L' indica que es un entero
  class(y)  # "integer"
  
  # Lógico
  z <- TRUE  # También puede ser FALSE
  class(z)  # "logical"
  
  # Caracter (texto)
  nombre <- "R es genial"
  class(nombre)  # "character"
  `,
          explanation: "La función class() nos permite verificar el tipo de dato de una variable."
        },
        {
          title: "Vectores de diferentes tipos",
          code: `# Vector numérico
  edades <- c(25, 30, 35, 40)
  
  # Vector de caracteres
  nombres <- c("Ana", "Juan", "Carla", "Pedro")
  
  # Vector lógico
  aprobados <- c(TRUE, FALSE, TRUE, TRUE)
  
  # Conversión automática de tipos
  mixto <- c(1, "dos", 3)
  class(mixto)  # "character" - se convierte todo al tipo más flexible
  `,
          explanation: "R convierte automáticamente todos los elementos de un vector al tipo más flexible cuando hay tipos mixtos."
        }
      ],
      exercises: [
        {
          id: "data-type-conversion",
          title: "Conversión de tipos de datos",
          type: "data_conversion",
          instruction: "Crea un vector numérico llamado 'valores' con los números del 1 al 5, conviértelo a tipo caracter y guárdalo en una variable llamada 'valores_texto'.",
          starterCode: "# Crea el vector numérico\nvalores <- \n\n# Convierte a tipo caracter\nvalores_texto <- ",
          solution: "# Crea el vector numérico\nvalores <- 1:5  # Alternativa: valores <- c(1, 2, 3, 4, 5)\n\n# Convierte a tipo caracter\nvalores_texto <- as.character(valores)",
          hint: "Puedes usar la secuencia 1:5 para crear el vector y as.character() para la conversión.",
          expectedOutput: "c(\"1\", \"2\", \"3\", \"4\", \"5\")",
          difficulty: "Principiante",
          tags: ["vectores", "conversión de tipos"]
        }
      ]
    },
    // Puedes agregar más lecciones siguiendo el mismo formato
  };
  
  /**
   * Obtiene todos los IDs de las lecciones disponibles
   * @returns {string[]} Array con los IDs de las lecciones
   */
  export function getLessonIds() {
    return Object.keys(lessons);
  }
  
  /**
   * Obtiene los datos de una lección específica
   * @param {string} lessonId - ID de la lección
   * @returns {object|null} Datos de la lección o null si no existe
   */
  export function getLesson(lessonId) {
    return lessons[lessonId] || null;
  }
  
  /**
   * Obtiene un ejercicio específico de una lección
   * @param {string} lessonId - ID de la lección
   * @param {string} exerciseId - ID del ejercicio
   * @returns {object|null} Datos del ejercicio o null si no existe
   */
  export function getExercise(lessonId, exerciseId) {
    const lesson = getLesson(lessonId);
    if (!lesson || !lesson.exercises) return null;
    
    return lesson.exercises.find(ex => ex.id === exerciseId) || null;
  }