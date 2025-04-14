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

    'vectors-matrices': {
      title: "Vectores y matrices",
      background: `
  ## Vectores y matrices en R
  
  Los vectores y matrices son estructuras de datos fundamentales en R para el análisis numérico y estadístico.
  
  ### Vectores
  - Son colecciones unidimensionales de elementos del mismo tipo
  - Sirven como bloques básicos para construir estructuras más complejas
  - Permiten operaciones eficientes elemento a elemento
  
  ### Matrices
  - Son arreglos bidimensionales (filas y columnas) con elementos del mismo tipo
  - Ideales para cálculos algebraicos lineales
  - Base para muchos análisis estadísticos multivariados
      `,
      codeExamples: [
        {
          title: "Creación y manipulación de vectores",
          code: `# Crear vectores
  numeros <- c(5, 8, 2, 10, 3)
  nombres <- c("Ana", "Luis", "Carlos", "María", "Elena")
  logicos <- c(TRUE, FALSE, TRUE, FALSE, TRUE)
  
  # Secuencias
  secuencia1 <- 1:10  # Del 1 al 10
  secuencia2 <- seq(0, 1, by=0.1)  # De 0 a 1 en incrementos de 0.1
  
  # Repeticiones
  repetidos <- rep(c(1, 2), times=3)  # Repite todo el vector 3 veces
  repetidos2 <- rep(c(1, 2), each=3)  # Repite cada elemento 3 veces
  
  # Indexación de vectores
  numeros[3]  # Acceder al tercer elemento
  numeros[c(1, 3, 5)]  # Acceder a elementos específicos
  numeros[2:4]  # Acceder a un rango
  numeros[numeros > 5]  # Indexación condicional
  `,
          explanation: "R ofrece diversas formas de crear y manipular vectores. La función c() combina valores, los operadores de secuencia (: y seq()) crean secuencias, y la función rep() crea repeticiones. La indexación permite acceder a elementos específicos."
        },
        {
          title: "Operaciones con vectores",
          code: `# Vectores para operaciones
  v1 <- c(10, 20, 30, 40, 50)
  v2 <- c(1, 2, 3, 4, 5)
  
  # Operaciones aritméticas
  v1 + v2  # Suma elemento a elemento
  v1 - v2  # Resta elemento a elemento
  v1 * v2  # Multiplicación elemento a elemento
  v1 / v2  # División elemento a elemento
  v1 ^ 2   # Potencia
  
  # Funciones vectorizadas
  sum(v1)       # Suma de todos los elementos
  prod(v2)      # Producto de todos los elementos
  cumsum(v1)    # Suma acumulativa
  cumprod(v2)   # Producto acumulativo
  pmax(v1, v2)  # Máximo elemento a elemento
  `,
          explanation: "R aplica operaciones aritméticas a vectores elemento por elemento. También proporciona funciones para manipular todos los elementos de un vector de manera eficiente."
        },
        {
          title: "Creación y manipulación de matrices",
          code: `# Crear matrices
  matriz1 <- matrix(1:12, nrow=3, ncol=4)  # Llenar por columnas
  matriz2 <- matrix(1:12, nrow=3, ncol=4, byrow=TRUE)  # Llenar por filas
  
  # Dimensiones
  dim(matriz1)
  nrow(matriz1)  # Número de filas
  ncol(matriz1)  # Número de columnas
  
  # Indexación de matrices
  matriz1[2, 3]  # Elemento en la fila 2, columna 3
  matriz1[2, ]   # Toda la fila 2
  matriz1[, 3]   # Toda la columna 3
  matriz1[1:2, 3:4]  # Submatriz
  
  # Combinación de matrices
  rbind(matriz1[1, ], matriz1[3, ])  # Combinar filas
  cbind(matriz1[, 1], matriz1[, 4])  # Combinar columnas
  `,
          explanation: "Las matrices en R se crean con la función matrix(). Pueden llenarse por columnas (por defecto) o por filas (con byrow=TRUE). La indexación permite acceder a elementos, filas, columnas o submatrices."
        },
        {
          title: "Operaciones con matrices",
          code: `# Matrices para operaciones
  A <- matrix(1:6, nrow=2, ncol=3)
  B <- matrix(7:12, nrow=2, ncol=3)
  C <- matrix(1:6, nrow=3, ncol=2)
  
  # Operaciones elemento a elemento
  A + B
  A - B
  A * B  # Multiplicación elemento a elemento (no es producto matricial)
  
  # Producto matricial
  A %*% C  # Producto matricial (2x3 * 3x2 = 2x2)
  
  # Otras operaciones matriciales
  t(A)        # Transpuesta
  diag(1:3)   # Matriz diagonal
  solve(A %*% C)  # Inversa (si es posible)
  
  # Valores y vectores propios
  M <- matrix(c(2, 1, 1, 2), nrow=2)  # Matriz simétrica 2x2
  eigen(M)  # Valores y vectores propios
  `,
          explanation: "R permite realizar operaciones matriciales básicas como suma, resta y multiplicación elemento a elemento. El operador %*% realiza el producto matricial. Funciones como t(), diag() y solve() permiten realizar transformaciones y cálculos avanzados."
        }
      ],
      exercises: [
        {
          id: "vector-operations",
          title: "Operaciones con vectores",
          type: "vector_operations",
          instruction: "Crea dos vectores: 'vector_a' con los números 5, 10, 15, 20, 25 y 'vector_b' con los números 2, 4, 6, 8, 10. Luego, calcula: la suma de ambos vectores en 'resultado_suma', el producto elemento a elemento en 'resultado_producto', y el producto punto (suma del producto de cada elemento correspondiente) en 'producto_punto'.",
          starterCode: "# Crea los vectores\nvector_a <- \nvector_b <- \n\n# Calcula la suma\nresultado_suma <- \n\n# Calcula el producto elemento a elemento\nresultado_producto <- \n\n# Calcula el producto punto\nproducto_punto <- ",
          solution: "# Crea los vectores\nvector_a <- c(5, 10, 15, 20, 25)\nvector_b <- c(2, 4, 6, 8, 10)\n\n# Calcula la suma\nresultado_suma <- vector_a + vector_b\n\n# Calcula el producto elemento a elemento\nresultado_producto <- vector_a * vector_b\n\n# Calcula el producto punto\nproducto_punto <- sum(vector_a * vector_b)",
          hint: "Usa la función c() para crear los vectores. La suma y multiplicación entre vectores se realizan con los operadores + y * respectivamente. El producto punto es la suma de todos los productos elemento a elemento.",
          expectedOutput: "c(7, 14, 21, 28, 35), c(10, 40, 90, 160, 250), 550",
          validationCriteria: [
            {
              description: "Crear los vectores correctamente",
              test: (code) => /vector_a\s*<-\s*c\(\s*5\s*,\s*10\s*,\s*15\s*,\s*20\s*,\s*25\s*\)/.test(code) && /vector_b\s*<-\s*c\(\s*2\s*,\s*4\s*,\s*6\s*,\s*8\s*,\s*10\s*\)/.test(code),
              message: "Debes crear 'vector_a' y 'vector_b' con los valores exactos en el orden indicado."
            },
            {
              description: "Calcular la suma correctamente",
              test: (code) => /resultado_suma\s*<-\s*vector_a\s*\+\s*vector_b/.test(code),
              message: "Debes calcular la suma de los vectores usando el operador +"
            },
            {
              description: "Calcular el producto elemento a elemento",
              test: (code) => /resultado_producto\s*<-\s*vector_a\s*\*\s*vector_b/.test(code),
              message: "Debes calcular el producto elemento a elemento usando el operador *"
            },
            {
              description: "Calcular el producto punto",
              test: (code) => /producto_punto\s*<-\s*sum\(\s*vector_a\s*\*\s*vector_b\s*\)/.test(code),
              message: "El producto punto se calcula multiplicando los vectores elemento a elemento y sumando los resultados."
            }
          ],
          difficulty: "Principiante",
          tags: ["vectores", "operaciones", "producto punto"]
        },
        {
          id: "matrix-creation",
          title: "Creación y manipulación de matrices",
          type: "matrix_operations",
          instruction: "Crea una matriz 3x3 llamada 'matriz_a' con los números del 1 al 9 llenándola por filas. Luego, extrae la diagonal de esta matriz y guárdala en 'diagonal_a'. Finalmente, calcula la suma de todos los elementos de la matriz y guárdala en 'suma_total'.",
          starterCode: "# Crea la matriz 3x3 llenándola por filas\nmatriz_a <- \n\n# Extrae la diagonal\ndiagonal_a <- \n\n# Calcula la suma de todos los elementos\nsuma_total <- ",
          solution: "# Crea la matriz 3x3 llenándola por filas\nmatriz_a <- matrix(1:9, nrow=3, ncol=3, byrow=TRUE)\n\n# Extrae la diagonal\ndiagonal_a <- diag(matriz_a)\n\n# Calcula la suma de todos los elementos\nsuma_total <- sum(matriz_a)",
          hint: "Usa matrix() con el parámetro byrow=TRUE para llenar por filas. La función diag() extrae la diagonal de una matriz y sum() suma todos los elementos.",
          expectedOutput: "matriz_a: [1,2,3; 4,5,6; 7,8,9], diagonal_a: c(1, 5, 9), suma_total: 45",
          difficulty: "Intermedio",
          tags: ["matrices", "diagonal", "suma"]
        }
      ],
      extraCredit: [
        {
          id: "matrix-inversion",
          title: "Inversión de matrices",
          instruction: "Crea una función llamada 'matriz_info' que reciba una matriz y devuelva una lista con: la matriz original, su transpuesta, su inversa (si es posible), y sus valores propios.",
          starterCode: "matriz_info <- function(M) {\n  # Tu código aquí\n}",
          solution: `matriz_info <- function(M) {
    # Verificar si la matriz es cuadrada
    if (nrow(M) != ncol(M)) {
      warning("La matriz no es cuadrada, no se puede calcular su inversa")
      inversa <- NULL
    } else {
      # Verificar si la matriz es invertible
      det_M <- det(M)
      if (abs(det_M) < 1e-10) {
        warning("La matriz no es invertible (determinante cercano a cero)")
        inversa <- NULL
      } else {
        inversa <- solve(M)
      }
    }
    
    # Calcular valores propios
    if (nrow(M) == ncol(M)) {
      valores_propios <- eigen(M)$values
    } else {
      warning("La matriz no es cuadrada, no se pueden calcular valores propios")
      valores_propios <- NULL
    }
    
    # Crear lista con la información
    resultado <- list(
      original = M,
      transpuesta = t(M),
      inversa = inversa,
      valores_propios = valores_propios
    )
    
    return(resultado)
  }`,
          explanation: "Esta función verifica si una matriz es cuadrada para calcular su inversa y valores propios. La función solve() calcula la inversa de una matriz si es posible, y eigen() calcula los valores y vectores propios.",
          type: "matrix_function",
          expectedOutput: "Lista con matrices y valores",
          difficulty: "Avanzado",
          tags: ["matrices", "inversión", "valores propios", "funciones"]
        }
      ],
      resources: [
        {
          title: "Guía de vectores y matrices en R",
          url: "https://www.statmethods.net/advstats/matrix.html",
          type: "link"
        },
        {
          title: "Álgebra Lineal con R",
          url: "https://www.math.uh.edu/~jmorgan/Math6397/day13/LinearAlgebraR-Handout.pdf",
          type: "link"
        }
      ]
    },
    'dataframes': {
    title: "Dataframes",
    background: `
## Dataframes en R

Los dataframes son la estructura de datos más importante para el análisis estadístico en R. Combinan características de matrices y listas, permitiendo almacenar diferentes tipos de datos en una estructura tabular.

### Características principales:
- Estructura bidimensional (filas y columnas) similar a una hoja de cálculo
- Cada columna puede contener un tipo de dato diferente (numérico, carácter, lógico, etc.)
- Cada columna tiene el mismo número de filas
- Nombres para filas y columnas
- Base para la mayoría de los análisis de datos en R, especialmente con paquetes como dplyr y tidyverse
    `,
    codeExamples: [
      {
        title: "Creación de dataframes",
        code: `# Crear un dataframe con vectores
nombre <- c("Ana", "Carlos", "Elena", "David", "Laura")
edad <- c(28, 35, 42, 24, 31)
ingreso <- c(3500, 4200, 5100, 2800, 3900)
ciudad <- c("Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao")

# Crear el dataframe
datos <- data.frame(
  Nombre = nombre,
  Edad = edad,
  Ingreso = ingreso,
  Ciudad = ciudad
)

# Ver el dataframe
datos

# Estructura del dataframe
str(datos)

# Resumen estadístico
summary(datos)
`,
        explanation: "Los dataframes se crean generalmente con la función data.frame(), combinando vectores de igual longitud. Cada vector se convierte en una columna del dataframe. Las funciones str() y summary() son útiles para explorar su estructura y estadísticas básicas."
      },
      {
        title: "Acceso y manipulación básica",
        code: `# Acceder a elementos
datos[3, 2]  # Fila 3, columna 2
datos[2, "Ingreso"]  # Fila 2, columna "Ingreso"

# Acceder a columnas completas
datos$Edad  # Usando el operador $
datos[["Ciudad"]]  # Usando doble corchete
datos[, "Nombre"]  # Usando índice de columna

# Acceder a filas completas
datos[3, ]  # Fila 3

# Seleccionar subconjuntos
datos[datos$Edad > 30, ]  # Filas donde la edad es mayor que 30
datos[datos$Ciudad == "Madrid", c("Nombre", "Ingreso")]  # Columnas específicas

# Agregar nuevas columnas
datos$Antigüedad <- c(5, 8, 12, 3, 6)
datos$Bono <- datos$Ingreso * 0.1

# Ordenar dataframe
datos_ordenados <- datos[order(datos$Edad), ]  # Ordenar por edad ascendente
datos_ordenados_desc <- datos[order(-datos$Ingreso), ]  # Ordenar por ingreso descendente
`,
        explanation: "Los dataframes ofrecen varias formas de acceder y manipular sus datos. Se pueden seleccionar elementos individuales, filas completas, columnas completas o subconjuntos basados en condiciones. También se pueden añadir nuevas columnas y ordenar los datos."
      },
      {
        title: "Funciones básicas con dataframes",
        code: `# Dimensiones
dim(datos)  # Número de filas y columnas
nrow(datos)  # Número de filas
ncol(datos)  # Número de columnas

# Nombres
names(datos)  # Nombres de columnas
colnames(datos)  # Nombres de columnas (alternativa)
rownames(datos)  # Nombres de filas

# Primeras y últimas filas
head(datos, 3)  # Primeras 3 filas
tail(datos, 2)  # Últimas 2 filas

# Valores únicos
unique(datos$Ciudad)  # Valores únicos en la columna Ciudad

# Eliminar columnas o filas
datos_reducido <- datos[, -4]  # Eliminar columna 4 (Ciudad)
datos_sin_fila2 <- datos[-2, ]  # Eliminar fila 2
`,
        explanation: "R proporciona muchas funciones para trabajar con dataframes. Puedes verificar dimensiones, cambiar nombres, ver muestras de los datos, identificar valores únicos y eliminar filas o columnas según sea necesario."
      },
      {
        title: "Operaciones de agregación",
        code: `# Estadísticas básicas por columna
mean(datos$Edad)  # Media de la columna Edad
median(datos$Ingreso)  # Mediana de la columna Ingreso
sd(datos$Antigüedad)  # Desviación estándar de la columna Antigüedad

# Estadísticas por grupos
aggregate(Ingreso ~ Ciudad, data = datos, FUN = mean)  # Media de ingreso por ciudad
aggregate(cbind(Edad, Ingreso) ~ Ciudad, data = datos, FUN = mean)  # Múltiples variables

# Tabla de frecuencias
table(datos$Ciudad)  # Frecuencia de cada ciudad

# Tablas cruzadas
edad_categorica <- cut(datos$Edad, breaks = c(20, 30, 40, 50), 
                        labels = c("20-30", "31-40", "41-50"))
table(edad_categorica, datos$Ciudad)  # Tabla cruzada de edad y ciudad
`,
        explanation: "Los dataframes permiten realizar análisis estadísticos de manera sencilla. Se pueden calcular estadísticas básicas por columna, agrupar datos por categorías, crear tablas de frecuencias y analizar relaciones entre variables."
      }
    ],
    exercises: [
      {
        id: "dataframe-creation",
        title: "Creación y manipulación de dataframes",
        type: "dataframe_creation",
        instruction: "Crea un dataframe llamado 'estudiantes' con las siguientes columnas: 'Nombre' (Ana, Pedro, Carmen, Miguel, Laura), 'Edad' (22, 20, 25, 19, 23), 'Nota' (8.5, 7.2, 9.1, 6.8, 8.9) y 'Aprobado' (TRUE, TRUE, TRUE, FALSE, TRUE). Luego, añade una nueva columna llamada 'Puntos_Extra' que sea igual a la 'Nota' multiplicada por 0.1.",
        starterCode: "# Crea los vectores necesarios\nNombre <- \nEdad <- \nNota <- \nAprobado <- \n\n# Crea el dataframe\nestudiantes <- \n\n# Añade la columna Puntos_Extra\nestudiantes$Puntos_Extra <- ",
        solution: "# Crea los vectores necesarios\nNombre <- c(\"Ana\", \"Pedro\", \"Carmen\", \"Miguel\", \"Laura\")\nEdad <- c(22, 20, 25, 19, 23)\nNota <- c(8.5, 7.2, 9.1, 6.8, 8.9)\nAprobado <- c(TRUE, TRUE, TRUE, FALSE, TRUE)\n\n# Crea el dataframe\nestudiantes <- data.frame(Nombre, Edad, Nota, Aprobado)\n\n# Añade la columna Puntos_Extra\nestudiantes$Puntos_Extra <- estudiantes$Nota * 0.1",
        hint: "Usa la función c() para crear cada vector y luego data.frame() para crear el dataframe. Para añadir la nueva columna, utiliza el operador $ y la expresión de multiplicación.",
        expectedOutput: "Dataframe con 5 filas y 5 columnas",
        validationCriteria: [
          {
            description: "Crear correctamente los vectores",
            test: (code) => /Nombre\s*<-\s*c\(\s*\"Ana\"\s*,\s*\"Pedro\"\s*,\s*\"Carmen\"\s*,\s*\"Miguel\"\s*,\s*\"Laura\"\s*\)/.test(code),
            message: "Debes crear el vector 'Nombre' con los valores exactos en el orden indicado."
          },
          {
            description: "Crear correctamente el dataframe",
            test: (code) => /estudiantes\s*<-\s*data\.frame\(.*\)/.test(code),
            message: "Debes usar la función data.frame() para crear el dataframe 'estudiantes'."
          },
          {
            description: "Añadir la columna Puntos_Extra",
            test: (code) => /estudiantes\$Puntos_Extra\s*<-\s*estudiantes\$Nota\s*\*\s*0\.1/.test(code),
            message: "Debes crear la columna 'Puntos_Extra' multiplicando la columna 'Nota' por 0.1."
          }
        ],
        difficulty: "Principiante",
        tags: ["dataframe", "manipulación de datos"]
      },
      {
        id: "dataframe-filter",
        title: "Filtrado y análisis de dataframes",
        type: "dataframe_analysis",
        instruction: "Usando el dataframe 'estudiantes' del ejercicio anterior, realiza las siguientes operaciones: 1) Crea un nuevo dataframe llamado 'aprobados' que contenga solo los estudiantes que tienen 'Aprobado' igual a TRUE. 2) Calcula la media de la columna 'Nota' para estos estudiantes aprobados y guárdala en 'media_aprobados'. 3) Encuentra el estudiante con la nota más alta y guarda su nombre en 'mejor_estudiante'.",
        starterCode: "# Filtra los estudiantes aprobados\naprobados <- \n\n# Calcula la media de las notas de los aprobados\nmedia_aprobados <- \n\n# Encuentra el nombre del estudiante con la nota más alta\nmejor_estudiante <- ",
        solution: "# Filtra los estudiantes aprobados\naprobados <- estudiantes[estudiantes$Aprobado == TRUE, ]\n\n# Calcula la media de las notas de los aprobados\nmedia_aprobados <- mean(aprobados$Nota)\n\n# Encuentra el nombre del estudiante con la nota más alta\nmejor_estudiante <- estudiantes$Nombre[which.max(estudiantes$Nota)]",
        hint: "Para filtrar, usa indexación booleana. Para calcular la media, usa la función mean(). Para encontrar el máximo, puedes usar which.max() para obtener el índice de la nota más alta.",
        expectedOutput: "Dataframe filtrado, media_aprobados = 8.425, mejor_estudiante = \"Carmen\"",
        difficulty: "Intermedio",
        tags: ["dataframe", "filtrado", "análisis"]
      }
    ],
    extraCredit: [
      {
        id: "dataframe-summary",
        title: "Función de resumen para dataframes",
        instruction: "Crea una función llamada 'resumen_dataframe' que reciba un dataframe y devuelva una lista con: 1) Un resumen estadístico (mínimo, máximo, media, mediana) de todas las columnas numéricas, 2) La cantidad de valores únicos en las columnas de caracteres, y 3) La cantidad y porcentaje de valores TRUE en las columnas lógicas.",
        starterCode: "resumen_dataframe <- function(df) {\n  # Tu código aquí\n}",
        solution: `resumen_dataframe <- function(df) {
  # Inicializar listas para almacenar resultados
  resultados_numericos <- list()
  resultados_caracteres <- list()
  resultados_logicos <- list()
  
  # Recorrer cada columna del dataframe
  for (col_name in names(df)) {
    columna <- df[[col_name]]
    
    # Procesar según el tipo de dato
    if (is.numeric(columna)) {
      # Para columnas numéricas, calcular estadísticas
      resultados_numericos[[col_name]] <- list(
        minimo = min(columna, na.rm = TRUE),
        maximo = max(columna, na.rm = TRUE),
        media = mean(columna, na.rm = TRUE),
        mediana = median(columna, na.rm = TRUE),
        desviacion = sd(columna, na.rm = TRUE)
      )
    } else if (is.character(columna)) {
      # Para columnas de caracteres, contar valores únicos
      valores_unicos <- unique(columna)
      resultados_caracteres[[col_name]] <- list(
        valores_unicos = valores_unicos,
        cantidad_unicos = length(valores_unicos)
      )
    } else if (is.logical(columna)) {
      # Para columnas lógicas, contar TRUE y calcular porcentaje
      valores_true <- sum(columna, na.rm = TRUE)
      total_no_na <- sum(!is.na(columna))
      resultados_logicos[[col_name]] <- list(
        cantidad_true = valores_true,
        porcentaje_true = if (total_no_na > 0) valores_true / total_no_na * 100 else 0
      )
    }
  }
  
  # Devolver todos los resultados en una lista
  return(list(
    numericos = resultados_numericos,
    caracteres = resultados_caracteres,
    logicos = resultados_logicos
  ))
}`,
        explanation: "Esta función analiza cada columna del dataframe según su tipo de dato y calcula estadísticas apropiadas. Para columnas numéricas calcula estadísticas básicas, para columnas de caracteres cuenta valores únicos, y para columnas lógicas cuenta y calcula porcentajes de valores TRUE.",
        type: "dataframe_function",
        expectedOutput: "Lista con resúmenes por tipo de dato",
        difficulty: "Avanzado",
        tags: ["dataframe", "funciones", "análisis estadístico"]
      }
    ],
    resources: [
      {
        title: "R para Ciencia de Datos (capítulo de dataframes)",
        url: "https://es.r4ds.hadley.nz/datos-ordenados.html",
        type: "book"
      },
      {
        title: "Manipulación de datos con dplyr",
        url: "https://dplyr.tidyverse.org/",
        type: "link"
      },
      {
        title: "Dataframes en R (tutorial)",
        url: "https://www.datacamp.com/community/tutorials/data-frames-r",
        type: "link"
      }
    ]
  }

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