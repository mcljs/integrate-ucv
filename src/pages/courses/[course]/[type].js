// pages/courses/[course]/[type].js
import { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getLesson } from '@/data/r-exercises';
import { verifyRSolution, formatEnvAsConsole } from '@/utils/r-validator';
import { CodeExample, CodeSolution } from '@/components/CodeExamples';

export default function CoursePage() {
  const router = useRouter();
  const { course, type } = router.query;

  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);   // { isCorrect, message, env, hints, ... }
  const [showSolution, setShowSolution] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    if (!course) return;
    const lessonInfo = getLesson(course);
    if (!lessonInfo) return;
    setLessonData(lessonInfo);
    if (type === 'exercise' && lessonInfo.exercises?.length > 0) {
      setCode(lessonInfo.exercises[0].starterCode);
      setCurrentExerciseIndex(0);
    }
  }, [course, type]);

  // IMPORTANTE: todos los hooks deben llamarse antes de cualquier return
  // temprano, sino React rompe ("Rendered more hooks than during the previous render").
  const consoleOutput = useMemo(() => {
    if (!result?.env) return '';
    return formatEnvAsConsole(result.env);
  }, [result]);

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)] flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const currentExercise =
    type === 'exercise' && lessonData.exercises?.length > 0
      ? lessonData.exercises[currentExerciseIndex]
      : null;

  // Número de ejercicio = posición en la lista (1-indexed). Simple y confiable.
  const exerciseNumber = currentExerciseIndex + 1;

  const executeCode = () => {
    if (!currentExercise) return;
    setLoading(true);
    try {
      // Importante: le pasamos el `type` del ejercicio (string id) al validador,
      // que es la forma que entiende el catálogo del validador.
      const r = verifyRSolution(code, currentExercise.type);
      setResult(r);
      if (r.isCorrect) {
        toast.success('¡Código ejecutado correctamente!');
      } else {
        toast.error(r.message || 'Hay errores en tu código');
      }
    } catch (error) {
      console.error('Error al ejecutar código:', error);
      setResult({
        isCorrect: false,
        message: 'Ocurrió un error inesperado: ' + error.message,
        hints: [],
        env: {},
      });
      toast.error('Error al ejecutar el código');
    } finally {
      setLoading(false);
    }
  };

  const resetCode = () => {
    if (!currentExercise) return;
    setCode(currentExercise.starterCode);
    setResult(null);
    toast.success('Código reiniciado');
  };

  const showHint = () => {
    if (!currentExercise?.hint) return;
    toast(currentExercise.hint, {
      duration: 5000,
      style: {
        padding: '16px',
        borderRadius: '10px',
        background: '#F8FAFC',
        color: '#1E293B',
        border: '1px solid #E2E8F0',
        maxWidth: '500px',
      },
      icon: '💡',
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)]">
      <NextSeo title={`${lessonData.title} | R Fundamentals | ${process.env.NEXT_PUBLIC_SITE_TITLE}`} />

      <Container className="p-4">
        <Navbar />

        <div className="flex flex-col lg:flex-row mt-8 gap-6">
          {/* Panel izquierdo: lección */}
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

            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center">
              <HelpCircle className="h-5 w-5 mr-3 text-[#F5A623]" />
              <span>
                ¿Necesitas ayuda? Comunícate con nuestro grupo del Centro de Estudiantes:{' '}
                <a href="https://chat.whatsapp.com/D0Xlg5fBlguHgrdxxx5D0Z" className="text-[#F5A623] hover:underline">
                  Unirse al grupo
                </a>
              </span>
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

            {lessonData.codeExamples?.map((example, index) => (
              <CodeExample key={index} example={example} index={index} />
            ))}

            {type === 'exercise' && currentExercise && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                  <Code className="h-5 w-5 mr-2 text-[#F5A623]" />
                  Ejercicio {exerciseNumber}
                  {currentExercise.difficulty && (
                    <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {currentExercise.difficulty}
                    </span>
                  )}
                </h2>
                <p className="text-gray-700 mb-4">{currentExercise.instruction}</p>
                {currentExercise.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentExercise.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
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

            {lessonData.resources?.length > 0 && (
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

          {/* Panel derecho: editor + consola */}
          <div className="w-full lg:w-1/2 lg:h-[720px] flex flex-col">
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl shadow-sm">
              <div className={`px-3 py-2 mx-1 cursor-pointer border-b-2 ${!showSolution ? 'border-[#F5A623] text-[#F5A623]' : 'border-transparent text-gray-600'}`}
                   onClick={() => setShowSolution(false)}>
                <span className="flex items-center">
                  <Code className="h-4 w-4 mr-1" />
                  Ejercicio {exerciseNumber}
                </span>
              </div>

              {type === 'exercise' && (
                <div className={`px-3 py-2 mx-1 cursor-pointer border-b-2 ${showSolution ? 'border-[#F5A623] text-[#F5A623]' : 'border-transparent text-gray-600'}`}
                     onClick={() => setShowSolution((s) => !s)}>
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Solución
                  </span>
                </div>
              )}
            </div>

            {type === 'exercise' && currentExercise && (
              <div className="flex-grow flex flex-col bg-white rounded-b-xl shadow-sm">
                <div className="flex-grow bg-gray-50 font-mono text-sm p-4 overflow-y-auto border border-gray-200">
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

                {/* Consola estilo R — siempre se muestra cuando hay un resultado */}
                {result?.env && Object.keys(result.env).length > 0 && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Consola R:</h3>
                    <pre className="bg-[#1E1E1E] text-[#D4D4D4] p-3 rounded text-xs border border-gray-200 overflow-x-auto whitespace-pre">
{consoleOutput}
                    </pre>
                  </div>
                )}

                <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                  {result && (
                    <div
                      className={`p-3 rounded mb-4 flex items-start ${
                        result.isCorrect
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{result.message}</span>
                    </div>
                  )}

                  {/* Pistas específicas del validador */}
                  {result && !result.isCorrect && result.hints?.length > 0 && (
                    <div className="mb-4 p-3 rounded bg-amber-50 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-1" />
                        Pistas para resolver
                      </p>
                      <ul className="space-y-1 text-sm text-amber-900">
                        {result.hints.map((h, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{h.message}</span>
                          </li>
                        ))}
                      </ul>
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
                        className={`px-4 py-2 bg-[#F5A623] text-white rounded hover:bg-[#F7B844] transition-colors flex items-center ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
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
          </div>
        </div>
      </Container>
    </div>
  );
}