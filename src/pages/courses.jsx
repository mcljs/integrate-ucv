// pages/index.js
import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { 
  BookOpen, 
  Code, 
  FileText, 
  BarChart2, 
  Database,
  Layers,
  Grid,
  Sun,
  AlertTriangle,
  Construction,
  Clock,
  Lock
} from 'lucide-react';
import { NextSeo } from 'next-seo';
import { Container } from '@/components/container';
import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <div className="bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)] min-h-screen">
      <NextSeo
        title={`R Fundamentals | ${process.env.NEXT_PUBLIC_SITE_TITLE}`}
      />

      <Container className="p-4">
        <Navbar />

        <div className="my-10 text-center">
          <h2 className="text-4xl font-bold mb-2 text-gray-800">R Fundamentals</h2>
          <p className="text-gray-600">Una introducción práctica al lenguaje de programación R para estudiantes de Estadística</p>
        </div>

        <div className="space-y-4">
          {courses.map((course, index) => (
            <CourseItem 
              key={index} 
              number={index + 1} 
              title={course.title}
              description={course.description}
              icon={course.icon}
              href={course.href}
              isAvailable={index < 2} // Solo los primeros 2 cursos están disponibles
            />
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Próximamente más contenido</h3>
            <p className="text-amber-700 text-sm mt-1">
              Estamos trabajando en ampliar el contenido del curso. Las lecciones se irán habilitando progresivamente.
              Si tienes dudas o sugerencias, no dudes en contactar al Centro de Estudiantes.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

function CourseItem({ number, title, description, icon, href, isAvailable }) {
  // Mapeo de nombres de iconos a componentes de Lucide
  const iconMapping = {
    'BookOpen': BookOpen,
    'Database': Database,
    'Layers': Layers,
    'Grid': Grid,
    'BarChart2': BarChart2
  };
  
  // Seleccionar el componente de icono
  const IconComponent = iconMapping[icon] || BookOpen;

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${isAvailable ? 'hover:shadow-md' : 'opacity-80'} transition-all border border-gray-100`}>
      <div className="flex items-center mb-3">
        <div className={`w-10 h-10 rounded-full ${isAvailable ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'bg-gray-200 text-gray-500'} flex items-center justify-center mr-4 text-xl font-semibold`}>
          {number}
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        
        {!isAvailable && (
          <div className="ml-auto flex items-center text-gray-500 bg-gray-100 rounded-full px-3 py-1">
            <Construction className="h-4 w-4 mr-1" />
            <span className="text-xs">En construcción</span>
          </div>
        )}
      </div>
      
      <div className="pl-14 mb-4">
        <p className="text-gray-600">{description}</p>
      </div>
      
      <div className="pl-14 flex space-x-4">
        {isAvailable ? (
          <>
            <Link href={`${href}/exercise`} className="px-4 py-2 rounded-lg flex items-center text-gray-700 hover:text-[#F5A623] hover:bg-[#F5A623]/5 transition-colors">
              <Code className="h-5 w-5 mr-2 text-[#F5A623]" />
              Ejercicio
            </Link>

            <Link href={`${href}/final`} className="px-4 py-2 rounded-lg flex items-center text-gray-700 hover:text-[#F5A623] hover:bg-[#F5A623]/5 transition-colors">
              <FileText className="h-5 w-5 mr-2 text-[#F5A623]" />
              Versión Final
            </Link>
          </>
        ) : (
          <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg flex items-center opacity-80">
            <Lock className="h-4 w-4 mr-2" />
            <span>Disponible próximamente</span>
          </div>
        )}
      </div>
      
      {!isAvailable && (
        <div className="mt-4 pl-14">
          <div className="text-xs flex items-center text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Los contenidos están siendo preparados por el equipo académico</span>
          </div>
        </div>
      )}
    </div>
  );
}

const courses = [
  {
    title: "Introducción básica a R",
    description: "Aprende las bases del lenguaje R, su sintaxis y estructura fundamental.",
    icon: "BookOpen",
    href: "/courses/intro-r"
  },
  {
    title: "Tipos de datos en R",
    description: "Conoce los diferentes tipos de datos en R: vectores, matrices, factores, listas y dataframes.",
    icon: "Database",
    href: "/courses/data-types"
  },
  {
    title: "Vectores y matrices",
    description: "Manipulación de vectores y matrices, operaciones y funciones asociadas.",
    icon: "Layers",
    href: "/courses/vectors-matrices"
  },
  {
    title: "Dataframes",
    description: "Aprende a trabajar con dataframes, la estructura de datos más usada en análisis estadístico.",
    icon: "Grid",
    href: "/courses/dataframes"
  },
  {
    title: "Visualización con ggplot2",
    description: "Crea gráficos estadísticos profesionales con la librería ggplot2.",
    icon: "BarChart2",
    href: "/courses/ggplot2"
  },
  {
    title: "Análisis estadístico básico",
    description: "Realiza análisis descriptivos e inferenciales básicos con R.",
    icon: "BarChart2",
    href: "/courses/basic-stats"
  },
  {
    title: "Regresión lineal",
    description: "Implementa modelos de regresión lineal simple y múltiple, diagnostica y evalúa modelos.",
    icon: "BarChart2",
    href: "/courses/linear-regression"
  }
];