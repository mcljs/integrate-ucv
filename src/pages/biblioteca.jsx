import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Book, FolderOpen, FileText, Search, Download, Image, FileSpreadsheet, FolderOpenDot } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Container } from '@/components/container';
import { NextSeo } from 'next-seo';

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
   "Propedeutico": {
  description: "Formacion academica para el 1er Semestre",
  semesters: {
    "Material": {
      subjects: ["Matemáticas", "Estadística"],
      materials: {
      "Matemáticas": [

        // Archivos en el directorio principal
{ "path": "matematicas-prope/mate_20210429_induccion_completadocx.docx", "name": "Inducción Completa" },
{ "path": "matematicas-prope/mate_ecuación_de_eulerdocx.docx", "name": "Ecuación de Euler" },
{ "path": "matematicas-prope/mate_ejercicio_angel_enrique_v2docx.docx", "name": "Ejercicio Ángel Enrique V2" },

// Directorio 20240420
{ "path": "matematicas-prope/mate_20240420/mate_20240420_logica_y_conjuntos.docx", "name": "Lógica y Conjuntos" },
{ "path": "matematicas-prope/mate_20240420/mate_logica_proposicional_y_teoria_de_conjuntos.pdf", "name": "Lógica Proposicional y Teoría de Conjuntos" },

// Directorio evaluaciones_m0
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_1er_parcial_2019-ii.docx", "name": "Primer Parcial 2019-II" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_1er_parcial_2019-ii_v2.docx", "name": "Primer Parcial 2019-II (Versión 2)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_1ra_evaluación_grupal_de_matemáticas_8_a_915_am.pdf", "name": "Primera Evaluación Grupal (8:00-9:15)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2do_parcial_2019-ii_seccion_12.docx", "name": "Segundo Parcial 2019-II (Sección 12)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_3er_parcial_2019-ii_evaluacion_grupal.pdf", "name": "Tercer Parcial 2019-II (Evaluación Grupal)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_3er_parcial_2019-ii_evaluacion_individual.pdf", "name": "Tercer Parcial 2019-II (Evaluación Individual)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_3er_parcial_de_matematica_propedeutico_i-2020.docx", "name": "Tercer Parcial Propedéutico I-2020" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_4to_parcial_2019-ii.pdf", "name": "Cuarto Parcial 2019-II" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_examen_#3_matematicas.pdf", "name": "Examen #3 Matemáticas" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_examen_#4_matematicas_prope.pdf", "name": "Examen #4 Matemáticas Propedéutico" },

// Directorio evaluaciones_m0/2019-1
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_parcial_2019-i.docx", "name": "Primer Parcial 2019-I" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_parcial_2019-i.pdf", "name": "Primer Parcial 2019-I (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_parcial_2019-i_resuelto.docx", "name": "Primer Parcial 2019-I Resuelto" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_parcial_2019-i_resuelto.pdf", "name": "Primer Parcial 2019-I Resuelto (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_quiz_matematicas_2019-i.docx", "name": "Primer Quiz 2019-I" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_quiz_matematicas_2019-i.pdf", "name": "Primer Quiz 2019-I (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_quiz_matematicas_2019-i_resuelto.docx", "name": "Primer Quiz 2019-I Resuelto" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_1er_quiz_matematicas_2019-i_resuelto.pdf", "name": "Primer Quiz 2019-I Resuelto (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_2do_parcial_2019-i.docx", "name": "Segundo Parcial 2019-I" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_2do_parcial_2019-i.pdf", "name": "Segundo Parcial 2019-I (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_2do_parcial_2019-i_resuelto.docx", "name": "Segundo Parcial 2019-I Resuelto" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_2do_parcial_2019-i_resuelto.pdf", "name": "Segundo Parcial 2019-I Resuelto (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_3er_parcial_2019-i.docx", "name": "Tercer Parcial 2019-I" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_3er_parcial_2019-i.pdf", "name": "Tercer Parcial 2019-I (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_4to_parcial_2019-i.docx", "name": "Cuarto Parcial 2019-I" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_4to_parcial_2019-i.pdf", "name": "Cuarto Parcial 2019-I (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_asignacion_exponencial_y_logaritmos_2019-i.docx", "name": "Asignación: Exponencial y Logaritmos 2019-I" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_asignacion_exponencial_y_logaritmos_2019-i.pdf", "name": "Asignación: Exponencial y Logaritmos 2019-I (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_pre-examen_3_2019-i.docx", "name": "Pre-examen 3 (2019-I)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_pre-examen_3_2019-i.pdf", "name": "Pre-examen 3 (2019-I) (PDF)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_pre-examen_4_2019-i.docx", "name": "Pre-examen 4 (2019-I)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_2019-1/mate_pre-examen_4_2019-i.pdf", "name": "Pre-examen 4 (2019-I) (PDF)" },

// Directorio evaluaciones_m0/fotos_transcritas
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_1er_parcial_ricardo_quintero_y_raquel_fernandez_01.jpg", "name": "Primer Parcial - Quintero y Fernández (Imagen 1)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_1er_parcial_ricardo_quintero_y_raquel_fernandez_02.jpg", "name": "Primer Parcial - Quintero y Fernández (Imagen 2)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_1er_parcial_ricardo_quintero_y_raquel_fernandez_opc1.jpg", "name": "Primer Parcial - Quintero y Fernández (Opción 1)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_1er_parcial_ricardo_quintero_y_raquel_fernandez_opc2.jpg", "name": "Primer Parcial - Quintero y Fernández (Opción 2)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_1er_parcial_ricardo_quintero_y_sahid_leal.jpg", "name": "Primer Parcial - Quintero y Leal" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_2do_parcial_ricardo_quintero_y_raquel_fernandez_01.jpg", "name": "Segundo Parcial - Quintero y Fernández (Imagen 1)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_2do_parcial_ricardo_quintero_y_raquel_fernandez_02.jpg", "name": "Segundo Parcial - Quintero y Fernández (Imagen 2)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_2do_parcial_ricardo_quintero_y_raquel_fernandez_03.jpg", "name": "Segundo Parcial - Quintero y Fernández (Imagen 3)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_2do_parcial_ricardo_quintero_y_raquel_fernandez_20021218.jpg", "name": "Segundo Parcial - Quintero y Fernández (18/12/2002)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_2do_parcial_ricardo_quintero_y_raquel_fernandez_20040114.jpg", "name": "Segundo Parcial - Quintero y Fernández (14/01/2004)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_3er_parcial_20110207.jpg", "name": "Tercer Parcial (07/02/2011)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_3er_parcial_ricardo_quintero_y_raquel_fernandez_20020114.jpg", "name": "Tercer Parcial - Quintero y Fernández (14/01/2002)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_3er_parcial_ricardo_quintero_y_raquel_fernandez_20030708.jpg", "name": "Tercer Parcial - Quintero y Fernández (08/07/2003)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_fotos_transcritas/mate_3er_parcial_sin_informacion.jpg", "name": "Tercer Parcial (Sin Información)" },

// Directorio evaluaciones_m0/word_y_pdf - omito algunos para evitar duplicaciones excesivas
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_1er_parcial_ever_jaimes.docx", "name": "Primer Parcial - Ever Jaimes" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_1er_parcial_jorge_aquino_y_pedro_calatayud.docx", "name": "Primer Parcial - Aquino y Calatayud" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_1er_parcial_mayarin_lopez.docx", "name": "Primer Parcial - Mayarin López" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_1er_parcial_mayarin_lopez_20180122.pdf", "name": "Primer Parcial - Mayarin López (22/01/2018)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_2do_parcial_ever_jaimes.docx", "name": "Segundo Parcial - Ever Jaimes" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_2do_parcial_ever_jaimes_y_mayarin_lopez.docx", "name": "Segundo Parcial - Jaimes y López" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_2do_parcial_jorge_aquino_y_pedro_calatayud.docx", "name": "Segundo Parcial - Aquino y Calatayud" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_2do_parcial_mayarin_lopez_20180218.pdf", "name": "Segundo Parcial - Mayarin López (18/02/2018)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_3er_parcial_mayarin_lopez_20180322.pdf", "name": "Tercer Parcial - Mayarin López (22/03/2018)" },
{ "path": "matematicas-prope/mate_evaluaciones_m0/mate_word_y_pdf/mate_rec_parcial_mayarin_lopez_20180418.pdf", "name": "Recuperativo - Mayarin López (18/04/2018)" },

// Directorio m0_20192_
{ "path": "matematicas-prope/mate_m0_20192_/mate_1er_parcial_alexander_brito.pdf", "name": "Primer Parcial - Alexander Brito" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_1er_parcial_nicolas_yanez.pdf", "name": "Primer Parcial - Nicolás Yánez" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_1ra_evaluación_grupal_de_matemáticas_8_a_915_am.pdf", "name": "Primera Evaluación Grupal (8:00-9:15)" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_1ra_evaluación_grupal_de_matemáticas_900_a_1015_am.pdf", "name": "Primera Evaluación Grupal (9:00-10:15)" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_asignacion_#1.docx", "name": "Asignación #1" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_álgebra_de_baldor.pdf", "name": "Álgebra de Baldor" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_e-navarro-propedeutico-de-matematica.pdf", "name": "E. Navarro - Propedéutico de Matemática" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_examen_#2_cesar_rodriguez.xlsx", "name": "Examen #2 - César Rodríguez" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_guia_rapida_funciones.pdf", "name": "Guía Rápida: Funciones" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_guia_rapida_polinomios.pdf", "name": "Guía Rápida: Polinomios" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_teoria_polinomios.pdf", "name": "Teoría: Polinomios" },
{ "path": "matematicas-prope/mate_m0_20192_/mate_teoría_funciones.pdf", "name": "Teoría: Funciones" },

// Directorio presentaciones_m0
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20190721_2355_funcion_lineal.xlsx", "name": "Función Lineal (21/07/2019)" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20191003_2246_polinomios.xlsx", "name": "Polinomios (03/10/2019)" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20191006_2016_polinomios.docx", "name": "Polinomios (06/10/2019)" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20191006_2119_teoria_de_conjuntos_iniciando.docx", "name": "Teoría de Conjuntos" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20191009_0520_funcion_lineal.docx", "name": "Función Lineal (09/10/2019)" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20191012_0000_conjuntos_numericos_iniciando.docx", "name": "Conjuntos Numéricos" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20191012_1800_trigonometria_figuras.pptx", "name": "Trigonometría: Figuras" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20200323_2348_funcion_logaritmica_y_exponencial.docx", "name": "Función Logarítmica y Exponencial" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_20220410_2140_trigonometria.docx", "name": "Trigonometría (10/04/2022)" },
{ "path": "matematicas-prope/mate_presentaciones_m0/mate_identidades_trigonometricas_ejercicios.docx", "name": "Identidades Trigonométricas: Ejercicios" },

// Directorio teoria_segun_tema_otros_materiales
{ "path": "matematicas-prope/mate_teoria_segun_tema_otros_materiales/mate_cap2_teoria_combinatoria.pdf", "name": "Teoría Combinatoria (Cap. 2)" },
{ "path": "matematicas-prope/mate_teoria_segun_tema_otros_materiales/mate_clases_propedeutico_jorge_aquino.docx", "name": "Clases Propedéutico - Jorge Aquino" },
{ "path": "matematicas-prope/mate_teoria_segun_tema_otros_materiales/mate_guia_1.docx", "name": "Guía 1" },
{ "path": "matematicas-prope/mate_teoria_segun_tema_otros_materiales/mate_guia_1_resolviendo.docx", "name": "Guía 1 (Resolución)" },
{ "path": "matematicas-prope/mate_teoria_segun_tema_otros_materiales/mate_jorge_aquino_prop_teoria_de_conjuntos.docx", "name": "Teoría de Conjuntos - Jorge Aquino" },
  // Material 2024
  { "path": "ciclo-basico/matematica-prope/2024.04.20/logica-proposicional-y-teoria-de-conjuntos.pdf", "name": "Lógica Proposicional y Teoría de Conjuntos" },
  { "path": "ciclo-basico/matematica-prope/2024.04.20/20240420-logica-y-conjuntos.docx", "name": "Lógica y Conjuntos" },
  { "path": "ciclo-basico/matematica-prope/2021.04.29-induccion-completa.docx", "name": "Inducción Completa" },
  { "path": "ciclo-basico/matematica-prope/ecuación-de-euler.docx", "name": "Ecuación de Euler" },
  { "path": "ciclo-basico/matematica-prope/ejercicio-angel-enrique-v2.docx", "name": "Ejercicio Ángel Enrique V2" },

  // Presentaciones Básicas (M0)
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20200323-2348-funcion-logaritmica-y-exponencial.docx", "name": "Función Logarítmica y Exponencial" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20190721-2355-funcion-lineal.xlsx", "name": "Función Lineal (Excel)" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20191009-0520-funcion-lineal.docx", "name": "Función Lineal" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20191012-1800-trigonometria-figuras.pptx", "name": "Trigonometría - Figuras" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20191012-0000-conjuntos-numericos-(iniciando).docx", "name": "Conjuntos Numéricos" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20191006-2016-polinomios.docx", "name": "Polinomios" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20191006-2119-teoria-de-conjuntos-(iniciando).docx", "name": "Teoría de Conjuntos" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20220410-2140-trigonometria.docx", "name": "Trigonometría" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/identidades-trigonometricas-(ejercicios).docx", "name": "Identidades Trigonométricas - Ejercicios" },
  { "path": "ciclo-basico/matematica-prope/presentaciones-m0/20191003-2246-polinomios.xlsx", "name": "Polinomios (Excel)" },

  // Material PLE 2021
  { "path": "ciclo-basico/matematica-prope/ple-2021/propedeutico_semana_1.pdf", "name": "Propedéutico Semana 1" },
  { "path": "ciclo-basico/matematica-prope/ple-2021/mayarin---operaciones-con-fracciones.pdf", "name": "Operaciones con Fracciones" },

  // Material M0-2019-2
  { "path": "ciclo-basico/matematica-prope/m0---20192---/teoria-polinomios.pdf", "name": "Teoría Polinomios" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/guia-rapida-polinomios.pdf", "name": "Guía Rápida Polinomios" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/1er-parcial-(nicolas-yanez).pdf", "name": "1er Parcial (Nicolás Yánez)" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/asignacion-#1.docx", "name": "Asignación #1" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/teoría-funciones.pdf", "name": "Teoría Funciones" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/examen-#2-cesar-rodriguez.xlsx", "name": "Examen #2 (César Rodríguez)" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/e-navarro-propedeutico-de-matematica.pdf", "name": "E. Navarro - Propedéutico Matemática" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/álgebra-de-baldor.pdf", "name": "Álgebra de Baldor" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/1ra-evaluacion-grupal-de-matematicas-(8-a-915-am).pdf", "name": "1ra Evaluación Grupal Matemáticas" },
  { "path": "ciclo-basico/matematica-prope/m0---20192---/guia-rapida-funciones.pdf", "name": "Guía Rápida Funciones" },

  // Evaluaciones M0-2019 y Word/PDF
  { "path": "ciclo-basico/matematica-prope/evaluaciones-m0/word-y-pdf/1er-parcial-(2019-i).docx", "name": "1er Parcial 2019-I" },
  { "path": "ciclo-basico/matematica-prope/evaluaciones-m0/word-y-pdf/1er-quiz-matematicas-(2019-i).docx", "name": "1er Quiz Matemáticas 2019-I" },
  { "path": "ciclo-basico/matematica-prope/evaluaciones-m0/word-y-pdf/2do-parcial-(ricardo-quintero-y-raquel-fernandez)-20021218.docx", "name": "2do Parcial (Ricardo Quintero y Raquel Fernández)" },

  // Fotos Transcritas
  { "path": "ciclo-basico/matematica-prope/evaluaciones-m0/fotos-transcritas/2do-parcial-(ricardo-quintero-y-raquel-fernandez)-20040114.jpg", "name": "2do Parcial (Foto)" },
  { "path": "ciclo-basico/matematica-prope/evaluaciones-m0/fotos-transcritas/3er-parcial-(ricardo-quintero-y-raquel-fernandez)-20030708.jpg", "name": "3er Parcial 2003 (Foto)" },

  // Teoría por Tema
  { "path": "ciclo-basico/matematica-prope/teoria-segun-tema-(otros-materiales)/guia-1.docx", "name": "Guía 1" },
  { "path": "ciclo-basico/matematica-prope/teoria-segun-tema-(otros-materiales)/cap2---teoria-combinatoria.pdf", "name": "Teoría Combinatoria" }
],
        "Estadística": [
          // Clases 2024 (Material Actual)
          { "path": "ciclo-basico/estadistica-prope/2024/tema-1.-historia.jpg", "name": "Tema 1 - Historia" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-2.-producción-de-datos-estadísticos.-clase-1-(2023-01-27).pdf", "name": "Tema 2 - Producción de Datos Estadísticos" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-3.-medicion.-clase-1.pdf", "name": "Tema 3.1 - Medición" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-3.-medicion.-clase-2.-escalas-de-medición.pdf", "name": "Tema 3.2 - Escalas de Medición" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-3.-medicion.-clase-3.-porcentaje,-proporción-y-razón.pdf", "name": "Tema 3.3 - Porcentaje, Proporción y Razón" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-4.-medidas-de-posición.-clase-1..pdf", "name": "Tema 4.1 - Medidas de Posición" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-4.-practica-de-medidas-de-tendencia-central.pdf", "name": "Tema 4.2 - Práctica Medidas de Tendencia Central" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-4.-practica-medidas-de-posición.pdf", "name": "Tema 4.3 - Práctica Medidas de Posición" },
          { "path": "ciclo-basico/estadistica-prope/2024/tema-4.-ejercicio-tipo-examen.pdf", "name": "Tema 4.4 - Ejercicio Tipo Examen" },

          // Clases Zoom 2021-2022
          { "path": "ciclo-basico/estadistica-prope/2021---(clases-zoom)/ple-i-2022-clase-1---estadística-propedéutico---def.pdf", "name": "Clase 1 - Introducción" },
          { "path": "ciclo-basico/estadistica-prope/2021---(clases-zoom)/clase-2022.06.25---05-02-media-aritmetica-(editado).pdf", "name": "Media Aritmética" },
          { "path": "ciclo-basico/estadistica-prope/2021---(clases-zoom)/clase-2022.06.28---05-03-media-geométrica-(editado).pdf", "name": "Media Geométrica" },
          { "path": "ciclo-basico/estadistica-prope/2021---(clases-zoom)/clase-2022.06.25---05-04-media-armónica-(editado).pdf", "name": "Media Armónica" },
          { "path": "ciclo-basico/estadistica-prope/2021---(clases-zoom)/clase-2022.07.02---05-05-relaciones-entre-promedios-matemáticos.pdf", "name": "Relaciones entre Promedios" },
          { "path": "ciclo-basico/estadistica-prope/2021---(clases-zoom)/clase-2022.07.02---06-02-propiedades-de-la-desviación-estándar.pdf", "name": "Propiedades de la Desviación Estándar" },
          { "path": "ciclo-basico/estadistica-prope/2021---(clases-zoom)/clase-2022.07.16---07-01-momentos.pdf", "name": "Momentos" },

          // Presentaciones 2021
          { "path": "ciclo-basico/estadistica-prope/2021--(presentaciones)/01-01-introduccion-a-la-estadística---pensamiento-estadístico.pdf", "name": "1.1 - Pensamiento Estadístico" },
          { "path": "ciclo-basico/estadistica-prope/2021--(presentaciones)/01-02-introduccion-a-la-estadística---la-investigación-estadística.pdf", "name": "1.2 - Investigación Estadística" },
          { "path": "ciclo-basico/estadistica-prope/2021--(presentaciones)/02-01-produccion-de-datos-estadisticos---conceptos-básicos.pdf", "name": "2.1 - Conceptos Básicos" },
          { "path": "ciclo-basico/estadistica-prope/2021--(presentaciones)/03-01-medicion---constantes-y-variables,-medición.pdf", "name": "3.1 - Constantes y Variables" },
          { "path": "ciclo-basico/estadistica-prope/2021--(presentaciones)/03-03-medición---cocientes-estadisticos.pdf", "name": "3.3 - Cocientes Estadísticos" },
          { "path": "ciclo-basico/estadistica-prope/2021--(presentaciones)/04-01-ordenamiento-de-datos-y-diagrama-de-tallo-y-hojas.pptx.pdf", "name": "4.1 - Ordenamiento de Datos" },
          { "path": "ciclo-basico/estadistica-prope/2021--(presentaciones)/04-02-cuartiles,-deciles-y-percentiles.pdf", "name": "4.2 - Cuartiles, Deciles y Percentiles" },

          // Prácticas
          { "path": "ciclo-basico/estadistica-prope/practicas/guía-practica-del-curso-propedéutico-estadística-(2020.04.23).pdf", "name": "Guía Práctica del Curso" },
          { "path": "ciclo-basico/estadistica-prope/practicas/prof.-beens---tema-3---practica-ple-2021.pdf", "name": "Práctica Tema 3" },
          { "path": "ciclo-basico/estadistica-prope/practicas/prof.-beens---tema-4---practica-ple-2021.pdf", "name": "Práctica Tema 4" },
          { "path": "ciclo-basico/estadistica-prope/practicas/prof.-beens---tema-5---ejemplos-ple-2021.pdf", "name": "Ejemplos Tema 5" },
          { "path": "ciclo-basico/estadistica-prope/practicas/prof.-beens---tema-6---practica-ple-2021.pdf", "name": "Práctica Tema 6" },
          { "path": "ciclo-basico/estadistica-prope/practicas/prof.-beens---guia-tema-7.pdf", "name": "Guía Tema 7" },
          { "path": "ciclo-basico/estadistica-prope/practicas/prof.-beens---guia-tema-8.pdf", "name": "Guía Tema 8" },

          // Estudio de Casos
          { "path": "ciclo-basico/estadistica-prope/estudio-de-casos/20192-estudio-de-caso-(20200328).pdf", "name": "Estudio de Caso 2019-2" },
          { "path": "ciclo-basico/estadistica-prope/estudio-de-casos/estudio-de-caso-2020.05.18.pdf", "name": "Estudio de Caso 2020" },
          { "path": "ciclo-basico/estadistica-prope/estudio-de-casos/guia-para-la-elaboracion-de-tabulados-y-graficos.pdf", "name": "Guía de Tabulados y Gráficos" },
          { "path": "ciclo-basico/estadistica-prope/estudio-de-casos/tema-8-representaciones-gráficas-2020.05.30.pdf", "name": "Representaciones Gráficas" },

          // Leyes y Manuales 2022
          { "path": "ciclo-basico/estadistica-prope/2022---trabajo---ley-y-manuales/ley-de-la-función-pública-de-estadística.pdf", "name": "Ley de la Función Pública de Estadística" },
          { "path": "ciclo-basico/estadistica-prope/2022---trabajo---ley-y-manuales/proyecto-de-reglamento-de-la-ley-de-la-función-pública-de-estadística.pdf", "name": "Proyecto de Reglamento" },
          { "path": "ciclo-basico/estadistica-prope/2022---trabajo---ley-y-manuales/codigo-de-buenas-practicas-estadisticas-europeas.pdf", "name": "Código de Buenas Prácticas Europeas" },
          { "path": "ciclo-basico/estadistica-prope/2022---trabajo---ley-y-manuales/codigo-de-buenas-practicas-de-las-estadistica-venezolanas.pdf", "name": "Código de Buenas Prácticas Venezolanas" },

          // Material Histórico y Complementario
          { "path": "ciclo-basico/estadistica-prope/otros-materiales---tema-1/historia-del-razonamiento-estadístico.pdf", "name": "Historia del Razonamiento Estadístico" },
          { "path": "ciclo-basico/estadistica-prope/otros-materiales---tema-1/la-eeca-en-cifras.pdf", "name": "La EECA en Cifras" },
          { "path": "ciclo-basico/estadistica-prope/otros-materiales---tema-1/la-eeca-en-cifras-ii.pdf", "name": "La EECA en Cifras II" },
          { "path": "ciclo-basico/estadistica-prope/otros-materiales---tema-1/material-de-joel-morgado.pdf", "name": "Material de Joel Morgado" },
          { "path": "ciclo-basico/estadistica-prope/otros-materiales---tema-1/estadística-sistemica-(azorin-poch).pdf", "name": "Estadística Sistémica" },
          { "path": "ciclo-basico/estadistica-prope/otros-materiales---tema-1/francisco-azorín-poch.pdf", "name": "Francisco Azorín Poch" },
          { "path": "ciclo-basico/estadistica-prope/la-mentira-en-porcentaje.pdf", "name": "La Mentira en Porcentaje" },
          { "path": "ciclo-basico/estadistica-prope/mts-y-sp---análisis-descriptivo-bivariante.pdf", "name": "Análisis Descriptivo Bivariante" },
          { "path": "ciclo-basico/estadistica-prope/excel,-spss-y-r/r---introduccion-a-r.pdf", "name": "Introducción a R" }
        ]
      }
    }
  }
},
    "Ciclo Básico": {
      description: "Primeros 5 semestres de formación fundamental",
      semesters: {
     "1er Semestre": {
  subjects: ["Matemáticas I", "Computación I", "Estadística I"],
  materials: {
    "Matemáticas I": [
      { "path": "ciclo-basico/1er-semestre/matematicas-i/matematica-i-2º-parcial-(limite).pdf", "name": "2do Parcial - Límites" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/2.5_inecuaciones-1.ppt", "name": "Inecuaciones 1" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/resumen-sucesiones.pdf", "name": "Resumen Sucesiones" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/ejercicios-de-series-y-sucesiones.pdf", "name": "Ejercicios de Series y Sucesiones" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/tabla-de-derivadas.pdf", "name": "Tabla de Derivadas" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/propiedades-de-los-limites.pdf", "name": "Propiedades de los Límites" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/04---lógica-proposicional,-teoremas-y-demostraciones_-manuel-maia-(ucv-2012).pdf", "name": "Lógica Proposicional" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/teoremas-del-vm-y-regla-de-lhopital.pdf", "name": "Teoremas del VM y L'Hôpital" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/inecuaciones.pdf", "name": "Inecuaciones" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/01---lógica,-conjuntos-y-números_carlos-uzcátegui-(ula-2011).pdf", "name": "Lógica, Conjuntos y Números" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/matematica-i-3º-parcial-(derivadas).pdf", "name": "3er Parcial - Derivadas" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/limites-por-definición.pdf", "name": "Límites por Definición" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/inducción-matematica-1.pdf", "name": "Inducción Matemática 1" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/inducción-matematica-2.pdf", "name": "Inducción Matemática 2" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/inducción-matematica-3.pdf", "name": "Inducción Matemática 3" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/teoremas-del-valor-medio.pdf", "name": "Teoremas del Valor Medio" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/funciones-trigonometricas---eder-nuñez.pdf", "name": "Funciones Trigonométricas" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/contenido-programatico-matematicas-i.pdf", "name": "Contenido Programático" },
      { "path": "ciclo-basico/1er-semestre/matematicas-i/calculo-de-derivadas.pdf", "name": "Cálculo de Derivadas" }
    ],
    "Estadística I": [
      { "path": "ciclo-basico/1er-semestre/estadistica-i/programa-estadistica-1-(julio-2016).doc", "name": "Programa Estadística I" },
      { "path": "ciclo-basico/1er-semestre/estadistica-i/contenido-programatico-estadistica-i.pdf", "name": "Contenido Programático" }
    ],
    "Computación I": [
      { "path": "ciclo-basico/1er-semestre/computacion-i/contenido-programatico-computacion-i.pdf", "name": "Contenido Programático" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/trabajo-final---carmelis-y-maria.docx", "name": "Trabajo Final" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/computacion-i-seccion-11/programa-de-computacion-i.doc", "name": "Programa de Computación I" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/computacion-i-seccion-11/ejercicios-de-programacion.doc", "name": "Ejercicios de Programación" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/computacion-i-seccion-11/ejercicios.pdf", "name": "Ejercicios" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/computacion-i-seccion-11/ejercicios-resueltos-pseudocodigo.pdf", "name": "Ejercicios Resueltos Pseudocódigo" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/computacion-i-seccion-11/quiz_computacion.docx", "name": "Quiz Computación" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/computacion-i-seccion-11/codigo-fuente-programa-notas.doc", "name": "Código Fuente Programa Notas" },
      { "path": "ciclo-basico/1er-semestre/computacion-i/computacion-i-seccion-11/teoria-de-programaci_n-en-pseudoc_digo.pdf", "name": "Teoría de Programación en Pseudocódigo" }
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
    <div className="bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)] min-h-screen">
    <Container className="pb-20 ">
           <NextSeo
        title={`Biblioteca Digital | ${process.env.NEXT_PUBLIC_SITE_TITLE}`}
  
      />
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
        <SearchResults results={filteredMaterials} handleDownload={handleDownload} />
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
      {getCurrentMaterials().length > 0 ? (
        getCurrentMaterials().map((material, index) => {
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
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <FolderOpenDot className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            No hay material disponible
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Estamos trabajando para subir nuevo contenido.
            Pronto encontrarás aquí material útil para tu aprendizaje.
          </p>
        </div>
      )}
    </div>
  </motion.div>
)}
    </>
  )}


        </AnimatePresence>
    

      
      </motion.div>
    </Container>
    </div>
  );
};

export default DigitalLibrary;


const SearchResults = ({ results,handleDownload }) => (
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
                type="button"
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