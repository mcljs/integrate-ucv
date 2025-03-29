// Si cambiamos de pestaña, actualizar estados

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { NextSeo } from 'next-seo';
import { Container } from '@/components/container';
import { Navbar } from '@/components/navbar';
import { 
  BookOpen, 
  Code, 
  FileText, 
  ArrowLeft, 
  Play, 
  RefreshCw, 
  HelpCircle,
  Award,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getLesson } from '@/data/r-exercises';
import { verifyRSolution, simulateRExecution } from '@/utils/r-validator';
import { RCodeBlock } from '@/utils/r-syntax-highlighter';
import { CodeExample, CodeSolution } from '@/components/CodeExamples';

export default function CoursePage() {
  const router = useRouter();
  const { course, type } = router.query;
  const [code, setCode] = useState('');
  const [output, setOutput] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [activeTab, setActiveTab] = useState('exercise');
  const [loading, setLoading] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (course) {
      const lessonInfo = getLesson(course);
      if (lessonInfo) {
        setLessonData(lessonInfo);
        
        // Set initial code if it's an exercise
        if (type === 'exercise' && lessonInfo.exercises && lessonInfo.exercises.length > 0) {
          setCode(lessonInfo.exercises[0].starterCode);
        }
      }
    }
  }, [course, type]);

  // Asegurarnos de que el estado de output sea visible cuando hay resultados correctos
  useEffect(() => {
    if (feedback && feedback.isCorrect && output) {
      setShowOutput(true);
    }
  }, [feedback, output]);

  useEffect(() => {
    if (activeTab === 'final') {
      setShowSolution(false);
    }
  }, [activeTab]);// pages/courses/[course]/[type].js

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)] flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const currentExercise = type === 'exercise' && lessonData.exercises && lessonData.exercises.length > 0
    ? lessonData.exercises[currentExerciseIndex]
    : null;

  const executeCode = () => {
    if (!currentExercise) return;
    
    setLoading(true);
    setFeedback(null);
    
    // Simular pequeña demora para dar sensación de procesamiento
    setTimeout(() => {
      try {
        // Validar la solución del estudiante
        const validationResult = verifyRSolution(code, currentExercise);
        
        if (validationResult.isCorrect) {
          setOutput(validationResult.output);
          setShowOutput(true);
          setFeedback({
            isCorrect: true,
            message: validationResult.message
          });
          toast.success('¡Código ejecutado correctamente!');
        } else {
          setOutput(null);
          setShowOutput(false);
          setFeedback({
            isCorrect: false,
            message: validationResult.message
          });
          toast.error('Hay errores en tu código');
        }
      } catch (error) {
        console.error("Error al ejecutar código:", error);
        setFeedback({
          isCorrect: false,
          message: "Ocurrió un error al ejecutar el código: " + error.message
        });
        toast.error('Error al ejecutar el código');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const resetCode = () => {
    if (currentExercise) {
      setCode(currentExercise.starterCode);
      setOutput(null);
      setShowOutput(false);
      setFeedback(null);
      toast.success('Código reiniciado');
    }
  };
  
  const showHint = () => {
    if (currentExercise && currentExercise.hint) {
      toast.success(currentExercise.hint, {
        duration: 5000,
        style: {
          padding: '16px',
          borderRadius: '10px',
          background: '#F8FAFC',
          color: '#1E293B',
          border: '1px solid #E2E8F0',
          maxWidth: '500px'
        },
        icon: '💡'
      });
    }
  };

  // Manejar cambio de pestaña
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    
    // Si cambiamos a la pestaña "Final" y hay output, mostrarlo
    if (tab === 'final' && output) {
      setShowOutput(true);
    }
  };

  // Manejar toggle de solución
  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)]">
      <NextSeo
        title={`${lessonData.title} | R Fundamentals | ${process.env.NEXT_PUBLIC_SITE_TITLE}`}
      />

      <Container className="p-4">
        <Navbar />
        
        <div className="flex flex-col lg:flex-row mt-8 gap-6">
          {/* Sidebar / Lesson content */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <Link href="/courses" className="flex items-center text-[#F5A623] hover:text-[#F7B844]">
                <ArrowLeft className="h-5 w-5 mr-1" />
                R Fundamentals
              </Link>
              <span className="px-2 text-gray-500">•</span>
              <span className="text-gray-600">{course}</span>
            </div>

            <h1 className="text-3xl font-bold mb-2 text-gray-800">{lessonData.title}</h1>
            
            <div className="mb-4">

              <div className="bg-white p-4 ">
              
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-[#F5A623]" />
                  <span>¿Necesitas ayuda? Comunícate con nuestro grupo de WhatsApp del Centro de Estudiantes: <a href="https://wa.me/grouplink" className="text-[#F5A623] hover:underline">Unirse al grupo</a></span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <BookOpen className="h-5 w-5 mr-2 text-[#F5A623]" />
                Background
              </h2>
              <div className="prose max-w-none text-gray-700">
                <ReactMarkdown>{lessonData.background}</ReactMarkdown>
              </div>
            </div>

            {lessonData.codeExamples && lessonData.codeExamples.map((example, index) => (
              <CodeExample key={index} example={example} index={index} />
            ))}

            {type === 'exercise' && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                  <Code className="h-5 w-5 mr-2 text-[#F5A623]" />
                  Ejercicio {currentExerciseIndex + 1}
                  {currentExercise && currentExercise.difficulty && (
                    <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {currentExercise.difficulty}
                    </span>
                  )}
                </h2>
                {currentExercise && (
                  <div className="mb-4">
                    <p className="text-gray-700 mb-6">{currentExercise.instruction}</p>
                    
                    {currentExercise.tags && currentExercise.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {currentExercise.tags.map(tag => (
                          <span key={tag} className="text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600">Producción final:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                      <li>
                        <Link href={`/courses/${course}/exercise`} className="text-[#F5A623] hover:text-[#F7B844] hover:underline flex items-center">
                          <Code className="h-4 w-4 mr-1" />
                          Ejercicio
                        </Link>
                      </li>
                      <li>
                        <Link href={`/courses/${course}/final`} className="text-[#F5A623] hover:text-[#F7B844] hover:underline flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Final
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {lessonData.extraCredit && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                  <Award className="h-5 w-5 mr-2 text-[#F5A623]" />
                  Extra Credit
                </h2>
                {lessonData.extraCredit.map((credit, index) => (
                  <div key={index} className="mb-4 p-4 border border-[#F5A623]/20 rounded-lg bg-[#F5A623]/5">
                    <p className="text-[#F5A623] flex items-center font-medium">
                      <Award className="h-4 w-4 mr-2" />
                      {credit.title}
                    </p>
                    <p className="mt-2 text-gray-700 text-sm">{credit.instruction}</p>
                  </div>
                ))}
              </div>
            )}
            
            {lessonData.resources && lessonData.resources.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recursos adicionales</h3>
                <ul className="space-y-2">
                  {lessonData.resources.map((resource, index) => (
                    <li key={index}>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#F5A623] hover:text-[#F7B844] flex items-center"
                      >
                        {resource.type === 'book' ? (
                          <BookOpen className="h-4 w-4 mr-2" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Code editor / Output */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
              <div 
                className={`px-3 py-2 mx-1 cursor-pointer ${activeTab === 'exercise' ? 'border-b-2 border-[#F5A623] text-[#F5A623]' : 'text-gray-600'}`}
                onClick={() => handleTabChange('exercise')}
              >
                <span className="flex items-center">
                  <Code className="h-4 w-4 mr-1" />
                  Ejercicio {type === 'exercise' && currentExerciseIndex + 1}
                </span>
              </div>
              <div 
                className={`px-3 py-2 mx-1 cursor-pointer ${activeTab === 'final' ? 'border-b-2 border-[#F5A623] text-[#F5A623]' : 'text-gray-600'}`}
                onClick={() => handleTabChange('final')}
              >
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Final
                </span>
              </div>
              
              {activeTab === 'exercise' && type === 'exercise' && (
                <div 
                  className={`px-3 py-2 mx-1 cursor-pointer ${showSolution ? 'border-b-2 border-[#F5A623] text-[#F5A623]' : 'text-gray-600'}`}
                  onClick={toggleSolution}
                >
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Solución
                  </span>
                </div>
              )}
            </div>

            {activeTab === 'exercise' && type === 'exercise' && (
              <div className="flex-grow flex flex-col bg-white rounded-b-xl shadow-sm">
                <div className="flex-grow bg-gray-50 font-mono text-sm p-4 overflow-y-auto border border-gray-200 border-t-0">
                  {!showSolution ? (
                    <textarea
                      className="w-full h-full bg-transparent outline-none text-gray-700 resize-none"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck="false"
                      disabled={loading}
                    />
                  ) : (
                    <CodeSolution code={currentExercise.solution} isVisible={true} />
                  )}
                </div>
                
                {/* Output section */}
                {showOutput && output && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Resultado:</h3>
                    <pre className="bg-gray-50 p-3 rounded text-green-600 text-sm border border-gray-200">{output}</pre>
                  </div>
                )}
                
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                  {feedback && (
                    <div className={`p-3 rounded mb-4 flex items-start ${feedback.isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {feedback.isCorrect ? 
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /> : 
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
                      <span>{feedback.message}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button 
                      className="px-4 py-2 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center border border-gray-300"
                      onClick={resetCode}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Reiniciar
                    </button>
                    
                    <div>
                      <button 
                        className="px-4 py-2 mr-2 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center border border-gray-300"
                        onClick={showHint}
                        disabled={loading}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Pista
                      </button>
                      
                      <button 
                        className={`px-4 py-2 bg-[#F5A623] text-white rounded hover:bg-[#F7B844] transition-colors flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={executeCode}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Ejecutando...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Ejecutar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'final' && (
              <div className="flex-grow flex flex-col items-center justify-center bg-white rounded-b-xl p-4 shadow-sm">
                <div className="text-center max-w-md w-full">
                  <img 
                    src="/r-logo.png" 
                    alt="R Logo" 
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://www.r-project.org/logo/Rlogo.png";
                    }}
                  />
                  <p className="text-lg mb-4 text-gray-800 font-medium">Versión final del proyecto</p>
                  
                  {!showOutput ? (
                    <>
                      <p className="text-gray-600 mb-6">
                        Aquí se mostrará la versión final de tu código cuando completes el ejercicio.
                      </p>
                      <button 
                        className="px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#F7B844] transition-colors inline-flex items-center"
                        onClick={() => handleTabChange('exercise')}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Ir al ejercicio
                      </button>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg text-left">
                      <h3 className="font-medium text-gray-700 mb-2">Tu solución:</h3>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <CodeSolution code={currentExercise.solution} isVisible={true} />
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Resultado:</p>
                        <p className="font-mono bg-white p-2 rounded border border-gray-200 text-green-600">{output}</p>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <button 
                          className="px-4 py-2 bg-[#F5A623] text-white rounded-lg hover:bg-[#F7B844] transition-colors inline-flex items-center"
                          onClick={() => {
                            // Aquí podrías implementar la funcionalidad para descargar o compartir
                            toast.success('¡Código guardado!');
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Guardar solución
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}