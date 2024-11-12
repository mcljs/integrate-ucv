import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Book, FolderOpen, FileText, Search, Download, Image, FileSpreadsheet } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Container } from '@/components/container';

// Mantener las funciones de utilidad existentes...
const normalizeText = (text) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[º°]/g, '')
    .replace(/_/g, ' ')
    .trim();
};

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':
      return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
    case 'png':
    case 'jpg':
    case 'jpeg':
      return { icon: Image, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'xlsx':
    case 'xls':
    case 'csv':
      return { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50' };
    default:
      return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

const getS3Url = (path) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const segments = cleanPath.split('/').map(segment => {
    const normalizedSegment = normalizeText(segment);
    return encodeURIComponent(normalizedSegment);
  });
  return `https://s3.magic-api.xyz/ucv-eeca/${segments.join('/')}`;
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 }
};

const DigitalLibrary = () => {
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const cycleRef = useRef(null);
  const semesterRef = useRef(null);
  const materialsRef = useRef(null);

  const library = {
    "Ciclo Básico": {
      description: "Primeros 5 semestres de formación fundamental",
      semesters: {
        "1er Semestre": {
          subjects: ["Matemáticas I", "Computación I", "Estadística I"],
          materials: {
            "Matemáticas I": [

            ]
          }
        },
        "2do Semestre": {
            "subjects": ["Matemáticas II", "Computación II", "Estadística II"],
            "materials": {
              "Matemáticas II": [
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/tema-5.pdf", "name": "Tema 5" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/matematica-ii-2-parcial.pdf", "name": "2do Parcial" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/tabla-de-integrales.pdf", "name": "Tabla de Integrales" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/formulario-integrales-impropias-y-series-.pdf", "name": "Formulario Integrales Impropias y Series" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/agenda-de-la-sesion-4.pdf", "name": "Agenda Sesión 4" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/tabla-de-integrales-e-identidades-trigonometricas.pdf", "name": "Tabla de Integrales e Identidades Trigonométricas" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/matematica-ii-1-parcial.pdf", "name": "1er Parcial" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/practica-1.-integrales-indefinidas.pdf", "name": "Práctica 1 - Integrales Indefinidas" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/practica-1.-integrales-indefinidas-1-.pdf", "name": "Práctica 1 (Versión 1)" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/tema8-integrales-impropias.pdf", "name": "Tema 8 - Integrales Impropias" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/criterios-de-convergencia.docx", "name": "Criterios de Convergencia" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/formulas-matematicas.pdf", "name": "Fórmulas Matemáticas" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/matematica-ii-3-parcial.pdf", "name": "3er Parcial" },
                { "path": "/ciclo-basico/2do-semestre/matematicas-ii/tecnicas-de-integracion.pdf", "name": "Técnicas de Integración" }
              ],
              "Computación II": [
                { "path": "/ciclo-basico/2do-semestre/computacion-ii/ejercicio-acccess.pdf", "name": "Ejercicio Access" },
                { "path": "/ciclo-basico/2do-semestre/computacion-ii/satisfaccion-laboral.pptx", "name": "Satisfacción Laboral" },
                { "path": "/ciclo-basico/2do-semestre/computacion-ii/test-de-inteligencia.ppt", "name": "Test de Inteligencia" },
                { "path": "/ciclo-basico/2do-semestre/computacion-ii/programa-de-computacionii.pdf", "name": "Programa de Computación II" }
              ],
              "Estadística II": [
                { "path": "/ciclo-basico/2do-semestre/estadistica-ii/int.-a-la-teoria-del-muestreo.pdf", "name": "Introducción a la Teoría del Muestreo" },
                { "path": "/ciclo-basico/2do-semestre/estadistica-ii/correlacion-y-regresion-lizbeth-.pptx", "name": "Correlación y Regresión" },
                { "path": "/ciclo-basico/2do-semestre/estadistica-ii/contraste-de-hipotesis-mts-sp-mod-.pdf", "name": "Contraste de Hipótesis" },
                { "path": "/ciclo-basico/2do-semestre/estadistica-ii/contenido-programatico-estadistica-ii.pdf", "name": "Contenido Programático" }
              ]
            }
          },
          "3er Semestre": {
            "subjects": ["Matemáticas III", "Algebra Lineal I", "Probabilidad I", "Sistema de Información"],
            "materials": {
              "Matemáticas III": [
                { "path": "/ciclo-basico/3er-semestre/matematicas-iii/integrales-dobles-y-triples.pdf", "name": "Integrales Dobles y Triples" },
                { "path": "/ciclo-basico/3er-semestre/matematicas-iii/limites-dobles-con-soluciones.pdf", "name": "Límites Dobles con Soluciones" },
                { "path": "/ciclo-basico/3er-semestre/matematicas-iii/matematica-iii-2o-parcial.pdf", "name": "2do Parcial" }
              ],
              "Algebra Lineal I": [
                { "path": "/ciclo-basico/3er-semestre/algebra-lineal-i/algebra-lineal-i-2o-parcial.pdf", "name": "2do Parcial" },
                { "path": "/ciclo-basico/3er-semestre/algebra-lineal-i/laboratorio-de-matriz-de-datos.pdf", "name": "Laboratorio de Matriz de Datos" }
              ],
              "Probabilidad I": [
                { "path": "/ciclo-basico/3er-semestre/proba-1/clase1.pdf", "name": "Clase 1" },
                { "path": "/ciclo-basico/3er-semestre/proba-1/sucesos-probabilidad.pdf", "name": "Sucesos y Probabilidad" },
                { "path": "/ciclo-basico/3er-semestre/proba-1/modulo1.2.pdf", "name": "Módulo 1.2" }
              ],
              "Sistema de Información": [
                { "path": "/ciclo-basico/3er-semestre/sistemas-de-informacion/contenido-programatico-sistemas-de-informacion.pdf", "name": "Contenido Programático" },
                { "path": "/ciclo-basico/3er-semestre/sistemas-de-informacion/tema-1-teoria-gral.-de-sistemas-1ro.-2014.pdf", "name": "Teoría General de Sistemas" }
              ]
            }
          },
        "4to Semestre": {
            subjects: [
              "Teoría de la Probabilidad II",
              "Álgebra Lineal II",
              "Matemáticas IV",
              "Introducción a la Economía"
            ],
            materials: {
              "Teoría de la Probabilidad II": [
                // Contenido programático
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/contenido-programatico-probabilidad-ii.pdf", name: "Contenido Programático" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/contenido-programatico-probabilidad-ii-2014-.doc", name: "Contenido Programático 2014" },
                
                // Material de estudio
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practica-esperanza-y-varianza.pdf", name: "Práctica de Esperanza y Varianza" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/formulas-matematicas.pdf", name: "Fórmulas Matemáticas" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/ejercicio-distribucion-normal.docx", name: "Ejercicio Distribución Normal" },
                
                // Recursos visuales
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/relacion-entre-las-distribuciones-de-probabilidad.jpg", name: "Relación entre Distribuciones" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/relacion-entre-las-distribuciones-de-probabilidad-ampliado-.jpg", name: "Relación entre Distribuciones (Ampliado)" },
                
                // Prácticas
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practicas/practica-1.docx", name: "Práctica 1" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practicas/practica-2.docx", name: "Práctica 2" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practicas/practica-3.docx", name: "Práctica 3" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practicas/practica-4.docx", name: "Práctica 4" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practicas/practica-5.docx", name: "Práctica 5" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practicas/ejercicios-tema-1.docx", name: "Ejercicios Tema 1" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/practicas/probabilidad-2-guia-de-ejercicios-modelos-discretos.pdf", name: "Guía de Ejercicios - Modelos Discretos" },
                
                // Material adicional
                { path: "/ciclo-basico/4to-semestre/proba-2/tpii-modelos-formulas-propiedades.pdf", name: "Modelos, Fórmulas y Propiedades" },
                { path: "/ciclo-basico/4to-semestre/proba-2/tema1.pdf", name: "Tema 1" },
                { path: "/ciclo-basico/4to-semestre/proba-2/tema3.pdf", name: "Tema 3" },
                { path: "/ciclo-basico/4to-semestre/proba-2/guia1.pdf", name: "Guía 1" },
                { path: "/ciclo-basico/4to-semestre/proba-2/guia2.pdf", name: "Guía 2" },
                { path: "/ciclo-basico/4to-semestre/proba-2/guia3.pdf", name: "Guía 3" },
                { path: "/ciclo-basico/4to-semestre/proba-2/guia4-2022.pdf", name: "Guía 4 (2022)" },
                { path: "/ciclo-basico/4to-semestre/proba-2/guia5-2022.pdf", name: "Guía 5 (2022)" },
                
                // Parciales
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/probabilidad-ii-1o-parcial.pdf", name: "1er Parcial" },
                { path: "/ciclo-basico/4to-semestre/teoria-de-la-probabilidad-ii/probabilidad-ii-2o-parcial.pdf", name: "2do Parcial" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-i-1993-1-.jpg", name: "1er Parcial I-1993" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/final-ii-2011-2-.jpg", name: "Final II-2011" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-i-2007-1-.jpg", name: "1er Parcial I-2007" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/examen-final-2-.jpg", name: "Examen Final" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-i-2012-2-.jpg", name: "1er Parcial I-2012" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/examen-final-ii-2012-1-.jpg", name: "Examen Final II-2012" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/final-2-2-.jpg", name: "Final 2" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/final-2011-1-.jpg", name: "Final 2011" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-ii-2011-1-.jpg", name: "1er Parcial II-2011" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/final-ii-2008-1-.jpg", name: "Final II-2008" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-i-2008-2-.jpg", name: "1er Parcial I-2008" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-1-.jpg", name: "1er Parcial" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-rec-i-2014.pdf", name: "1er Parcial Rec I-2014" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/examen-final-2012-1-.jpg", name: "Examen Final 2012" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-ii-2008.jpg", name: "1er Parcial II-2008" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/final-1.jpg", name: "Final 1" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-i-2011-1-.jpg", name: "1er Parcial I-2011" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/final-ii-2007.jpg", name: "Final II-2007" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/8vo-semestre/econometria-parciales-/1er-parcial-rec-ii-2014-2-.jpg", name: "1er Parcial Rec II-2014" }
              ],
              "Álgebra Lineal II": [
                // Parciales
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/algebra-lineal-ii-parciales-/1er-1-.pdf", name: "1er Parcial (1)" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/algebra-lineal-ii-parciales-/2do-parcial-i-2012.pdf", name: "2do Parcial I-2012" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/algebra-lineal-ii-parciales-/2do-parcial-ii-2011.pdf", name: "2do Parcial II-2011" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/algebra-lineal-ii-parciales-/2do-parcial-ii-2012.pdf", name: "2do Parcial II-2012" }
              ],
              "Matemáticas IV": [
                // Parciales históricos
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/matematicas-iv-parciales-/1er-parcial-i-2012.pdf", name: "1er Parcial I-2012" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/matematicas-iv-parciales-/2do-parcial-i-2012.pdf", name: "2do Parcial I-2012" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/matematicas-iv-parciales-/3er-parcial-i-2012.pdf", name: "3er Parcial I-2012" }
              ],
              "Introducción a la Economía": [
                // Parciales
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/introduccion-a-la-economia-parciales-/1er-parcial-ii-2013.jpg", name: "1er Parcial II-2013" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/introduccion-a-la-economia-parciales-/2do-parcial-ii-2013.jpg", name: "2do Parcial II-2013" },
                { path: "/ciclo-basico/4to-semestre/proba-2/parciales/4to-semestre/introduccion-a-la-economia-parciales-/3er-parcial-ii-2013.jpg", name: "3er Parcial II-2013" }
              ]
            }
          },
            "5to Semestre": {
              subjects: [
                "Teoría de la Probabilidad III",
                "Demografía I",
                "Computación Estadística",
                "Microeconomía"
              ],
              materials: {
                "Teoría de la Probabilidad III": [
                  // Contenido programático
                  { path: "/ciclo-basico/5to-semestre/teoria-de-la-probabilidad-iii/contenido-programatico-probabilidad-iii.pdf", name: "Contenido Programático" },
                  
                  // Parciales
                  { path: "/ciclo-basico/5to-semestre/teoria-de-la-probabilidad-iii/probabilidad-iii-1o-parcial.pdf", name: "1er Parcial" },
                  { path: "/ciclo-basico/5to-semestre/teoria-de-la-probabilidad-iii/probabilidad-iii-2o-parcial.pdf", name: "2do Parcial" },
                  { path: "/ciclo-basico/5to-semestre/teoria-de-la-probabilidad-iii/probabilidad-iii-3o-parcial.pdf", name: "3er Parcial" },
                  
                  // Material de estudio
                  { path: "/ciclo-basico/5to-semestre/teoria-de-la-probabilidad-iii/ejercicios-resueltos-1er-parcial.pdf", name: "Ejercicios Resueltos - 1er Parcial" },
                  { path: "/ciclo-basico/5to-semestre/teoria-de-la-probabilidad-iii/practicas-1-...-6.pdf", name: "Prácticas 1-6" },
                  
                  // Parciales históricos y material adicional
                  { path: "/ciclo-basico/5to-semestre/probabilidad-3/parciales/", name: "Parciales Históricos" },
                  { path: "/ciclo-basico/5to-semestre/probabilidad-3/tema-5-tema-6-tema-7/", name: "Material Temas 5-7" }
                ],
                "Demografía I": [
                  // Contenido básico
                  { path: "/ciclo-basico/5to-semestre/demografia-1-/contenido-programatico-demografia-1-.pdf", name: "Contenido Programático" },
                  
                  // Trabajos prácticos
                  { path: "/ciclo-basico/5to-semestre/demografia-1-/trabajo-de-mortalidad/trabajo-de-mortalidad.docx", name: "Trabajo de Mortalidad" },
                  { path: "/ciclo-basico/5to-semestre/demografia-1-/trabajo-de-mortalidad/trabajo-de-mortalidad.xlsx", name: "Cálculos - Trabajo de Mortalidad" },
                  
                  // Material de Felipe Gomes
                  { path: "/ciclo-basico/5to-semestre/demografia-1-/felipe-gomes-1-/", name: "Material Felipe Gomes" },
                  
                  // Laboratorios
                  { path: "/ciclo-basico/5to-semestre/demografia-1-/laboratorio-1-/", name: "Laboratorio 1" },
                  
                  // Trabajos especiales
                  { path: "/ciclo-basico/5to-semestre/demografia-1-/trabajo-encuesta-de-hogares-por-muestreo-censo/", name: "Trabajo Encuesta de Hogares" },
                  
                  // Resúmenes
                  { path: "/ciclo-basico/5to-semestre/demografia-1-/resumen-1-/", name: "Resúmenes" }
                ],
                "Microeconomía": [
                  // Contenido programático
                  { path: "/ciclo-basico/5to-semestre/microeconomia/contenido-programatico-microeconomia.pdf", name: "Contenido Programático" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/plan-de-evaluacion-i-2015.pdf", name: "Plan de Evaluación I-2015" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/plan-de-evaluacion-ii-2015.pdf", name: "Plan de Evaluación II-2015" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/quiz.pdf", name: "Quiz" },
                  
                  // Clases por tema
                  { path: "/ciclo-basico/5to-semestre/microeconomia/clases/microeconomia-tema-1.pdf", name: "Tema 1" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/clases/microeconomia-tema-2-2.1.pdf", name: "Tema 2.1" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/clases/microeconomia-tema-2-2.2.pdf", name: "Tema 2.2" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/clases/microeconomia-tema-3.pdf", name: "Tema 3" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/clases/microeconomia-tema-4-4.1.pdf", name: "Tema 4.1" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/clases/microeconomia-tema-4-4.2.pdf", name: "Tema 4.2" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/clases/microeconomia-tema-5.pdf", name: "Tema 5" },
                  
                  // Prácticas
                  { path: "/ciclo-basico/5to-semestre/microeconomia/practicas/practica-1-jose-nino.pdf", name: "Práctica 1 - José Niño" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/practicas/practica-2-jose-nino.pdf", name: "Práctica 2 - José Niño" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/practicas/practica-1-luis-hernandez.pdf", name: "Práctica 1 - Luis Hernández" },
                  { path: "/ciclo-basico/5to-semestre/microeconomia/practicas/practica-2-luis-hernandez.pdf", name: "Práctica 2 - Luis Hernández" },
                  
                  // Material adicional
                  { path: "/ciclo-basico/5to-semestre/microeconomia/practicas/clases-completas-.docx", name: "Clases Completas" }
                ],
                "Computación Estadística": [
                  { path: "/ciclo-basico/5to-semestre/computacion-estadistica/contenido-programatico-computacion-estadistica.pdf", name: "Contenido Programático" },
                  { path: "/ciclo-basico/5to-semestre/computacion-estadistica/pautas-anteproyecto-y-proyecto-mts-y-sp-.docx", name: "Pautas Anteproyecto y Proyecto" },
                  // Recursos visuales
                  { path: "/ciclo-basico/5to-semestre/compu-estadistica/ucvv.jpg", name: "Logo UCV" },
                  { path: "/ciclo-basico/5to-semestre/compu-estadistica/eeca.png", name: "Logo EECA" }
                ]
              }
          
          },
      }
    },
    "Ciencias Actuariales": {
      description: "Especialización en Ciencias Actuariales del 6to al 10mo semestre",
      semesters: {
        "6to Semestre": {
          subjects: ["Teoría del Seguro", "Matemática Actuarial I"],
          materials: {}
        },
        // ... hasta 10mo semestre
      }
    },
    "Ciencias Estadísticas": {
      description: "Especialización en Estadística del 6to al 10mo semestre",
      semesters: {
        "6to Semestre": {
          subjects: ["Inferencia Estadística", "Muestreo"],
          materials: {}
        },
        // ... hasta 10mo semestre
      }
    }
  };

  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return null;

    const results = [];
    Object.entries(library).forEach(([cycle, cycleData]) => {
      Object.entries(cycleData.semesters).forEach(([semester, semesterData]) => {
        Object.entries(semesterData.materials).forEach(([subject, materials]) => {
          materials.forEach(material => {
            const searchTerms = [
              material.name,
              subject,
              semester,
              cycle,
            ].map(term => term.toLowerCase());

            const searchQueryLower = searchQuery.toLowerCase();
            
            if (searchTerms.some(term => term.includes(searchQueryLower))) {
              results.push({
                ...material,
                cycle,
                semester,
                subject
              });
            }
          });
        });
      });
    });

    // Ordenar resultados por relevancia
    return results.sort((a, b) => {
      const aRelevance = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1;
      const bRelevance = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1;
      return bRelevance - aRelevance;
    });
  }, [searchQuery, library]);
  

  const handleCycleClick = (cycle) => {
    setSelectedCycle(cycle);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setTimeout(() => cycleRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
    setTimeout(() => semesterRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setTimeout(() => materialsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDownload = async (path) => {
    try {
      const url = getS3Url(path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al intentar descargar el archivo');
    }
  };

  const getCurrentSubjects = () => {
    if (!selectedCycle || !selectedSemester) return [];
    return library[selectedCycle].semesters[selectedSemester]?.subjects || [];
  };

  const getCurrentMaterials = () => {
    if (!selectedCycle || !selectedSemester || !selectedSubject) return [];
    return library[selectedCycle].semesters[selectedSemester]?.materials[selectedSubject] || [];
  };

  return (
    <Container className="mt-12 mb-20">
      <Navbar />
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-12 mt-12">
          <h1 className="text-5xl font-bold mb-6 text-black animate-gradient">
            Biblioteca Digital EECA
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Accede a todos los recursos académicos organizados por ciclo, semestre y materia
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-xl mx-auto mt-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar material..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
        {searchQuery ? (
    <motion.div
    key="search-results"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}>
      {filteredMaterials && filteredMaterials.length > 0 ? (
        <SearchResults results={filteredMaterials} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center"
        >
          <div className="flex flex-col items-center space-y-4">
            <Search className="w-12 h-12 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600 max-w-md">
              No encontramos materiales que coincidan con {searchQuery}. 
              Intenta con otros términos o navega por las categorías.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  ) : (
    <>
      {/* Navigation Breadcrumb */}
      <AnimatePresence>
          {(selectedCycle || selectedSemester || selectedSubject) && (
            <motion.nav 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 mb-6 text-sm"
            >
              <button 
                onClick={() => {
                  setSelectedCycle(null);
                  setSelectedSemester(null);
                  setSelectedSubject(null);
                }}
                className="text-blue-500 hover:underline flex items-center"
              >
                <FolderOpen className="w-4 h-4 mr-1" />
                Inicio
              </button>
              {selectedCycle && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button 
                    onClick={() => {
                      setSelectedSemester(null);
                      setSelectedSubject(null);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    {selectedCycle}
                  </button>
                </>
              )}
              {selectedSemester && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <button 
                    onClick={() => setSelectedSubject(null)}
                    className="text-blue-500 hover:underline"
                  >
                    {selectedSemester}
                  </button>
                </>
              )}
              {selectedSubject && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{selectedSubject}</span>
                </>
              )}
            </motion.nav>
          )}
        </AnimatePresence>

      {/* Main Content */}
{!selectedCycle && (
  <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
    {Object.entries(library).map(([cycle, cycleData]) => (
      <motion.button
        key={cycle}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleCycleClick(cycle)}
        className="relative p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-100 group overflow-hidden"
      >
        {/* Gradient background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon decoration */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300" />
        <FolderOpen className="absolute right-4 top-4 w-8 h-8 text-blue-500 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
        
        <div className="relative flex flex-col items-start space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {cycle}
          </h3>
          <div className="w-16 h-1 bg-blue-500 rounded group-hover:w-full transition-all duration-300" />
          <p className="text-base text-gray-600 group-hover:text-gray-700">
            {cycleData.description}
          </p>
          
          {/* Flecha decorativa */}
          <div className="mt-4 flex items-center text-blue-500 font-medium">
            <span className="mr-2">Explorar</span>
            <ChevronRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </motion.button>
    ))}
  </motion.div>
)}
        {/* Semesters Grid */}
        {selectedCycle && !selectedSemester && (
          <motion.div 
            ref={cycleRef}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Object.keys(library[selectedCycle].semesters).map((semester) => (
              <motion.button
                key={semester}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSemesterClick(semester)}
                className="p-6 rounded-xl bg-white shadow hover:shadow-xl hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-6 h-6 text-blue-500" />
                    <span className="font-medium text-gray-800">{semester}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Subjects Grid */}
        {selectedSemester && (
          <motion.div
            ref={semesterRef}
            variants={containerVariants}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Book className="w-6 h-6 mr-2 text-blue-500" />
              Materias - {selectedSemester}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCurrentSubjects().map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectClick(subject)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedSubject === subject
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg'
                      : 'bg-white border-2 border-gray-100 hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Book className={`w-6 h-6 ${selectedSubject === subject ? 'text-white' : 'text-green-500'}`} />
                    <span className={`font-medium ${selectedSubject === subject ? 'text-white' : 'text-gray-800'}`}>
                      {subject}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Materials List */}
        {selectedSubject && (
          <motion.div 
            ref={materialsRef}
            variants={containerVariants}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-500" />
              Material Disponible
            </h2>
            <div className="space-y-3">
              {getCurrentMaterials().map((material, index) => {
                const fileType = getFileType(material.path);
                const FileIcon = fileType.icon;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all bg-white group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 ${fileType.bg} rounded-lg transition-colors group-hover:bg-opacity-70`}>
                        <FileIcon className={`w-6 h-6 ${fileType.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{material.name}</h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(material.path)}
                      className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Descargar archivo"
                    >
                      <Download className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
    </>
  )}


        </AnimatePresence>
    

      
      </motion.div>
    </Container>
  );
};

export default DigitalLibrary;


const SearchResults = ({ results }) => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
          <Search className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-500" />
          Resultados de búsqueda
        </h2>
        <span className="text-sm text-gray-500">
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'} encontrados
        </span>
      </div>
      
      <div className="space-y-3">
        {results.map((material, index) => {
          const fileType = getFileType(material.path);
          const FileIcon = fileType.icon;
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all bg-white group"
            >
              {/* Icono y título */}
              <div className="flex items-center space-x-4 flex-grow min-w-0">
                <div className={`p-2 ${fileType.bg} rounded-lg transition-colors group-hover:bg-opacity-70 shrink-0`}>
                  <FileIcon className={`w-5 h-5 md:w-6 md:h-6 ${fileType.color}`} />
                </div>
                <div className="min-w-0 flex-grow">
                  <h3 className="font-medium text-gray-800 truncate">
                    {material.name}
                  </h3>
                  {/* Breadcrumb en móvil */}
                  <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500">
                    <span className="truncate">{material.cycle}</span>
                    <span className="mx-1.5">•</span>
                    <span className="truncate">{material.semester}</span>
                    <span className="mx-1.5">•</span>
                    <span className="truncate">{material.subject}</span>
                  </div>
                </div>
              </div>
              
              {/* Botón de descarga */}
              <div className="flex justify-end sm:justify-start items-center">
                <button 
                  onClick={() => handleDownload(material.path)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 group-hover:border-blue-200"
                  title="Descargar archivo"
                >
                  <Download className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-600 group-hover:text-blue-500">
                    Descargar
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );