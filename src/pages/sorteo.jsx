import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, MessageSquare, ThumbsUp, Users, Loader2 } from 'lucide-react';
import { NextSeo } from 'next-seo';
import { Navbar } from '@/components/navbar';
import { Container } from '@/components/container';
import toast, { Toaster } from 'react-hot-toast';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        setStoredValue(initialValue);
        setIsInitialized(true);
      }
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue, isInitialized];
};

const WorkshopRegistration = () => {
  const initialTasks = {
    followedInstagram: false,
    invitedInstagramFriends: false,
    joinedWhatsApp: false,
    invitedWhatsAppFriends: false,
    likedPost: false
  };

  const initialFormData = {
    studentId: '',
    name: '',
    email: '',
    phone: ''
  };

  const [tasks, setTasks] = useLocalStorage('workshopTasks', initialTasks);
  const [loading, setLoading] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTaskClick = (link) => {
    try {
      window.open(link, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening link:', error);
      toast.error('Error al abrir el enlace. Por favor intenta nuevamente.');
    }
  };

  const handleTaskComplete = async (task, link) => {
    if (loading[task]) return;

    const shareCount = parseInt(localStorage.getItem(`${task}_shares`) || '0');
    if (task.includes('invited') && shareCount < 10) {
      toast.error('Necesitas compartir el enlace 10 veces antes de verificar');
      return;
    }

    setLoading(prev => ({ ...prev, [task]: true }));
    setTimeLeft(120);

    const loadingToastId = toast.loading(
      '⏳ Verificando tarea, por favor espere...',
      { duration: 120000 }
    );

    try {
      handleTaskClick(link);
      await new Promise(resolve => setTimeout(resolve, 120000));
      
      setTasks(prev => ({ ...prev, [task]: true }));
      
      toast.dismiss(loadingToastId);
      toast.success('¡Tarea verificada con éxito! 🎉');

      const allTasksCompleted = Object.values({ ...tasks, [task]: true }).every(Boolean);
      if (allTasksCompleted) {
        toast.success('¡Felicitaciones! Has completado todas las tareas 🎊');
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Hubo un error al verificar la tarea. Por favor intenta nuevamente.');
    } finally {
      setLoading(prev => ({ ...prev, [task]: false }));
      setTimeLeft(0);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Enviando registro...');

    try {
      const validations = [
        {
          condition: /^\d{7,9}$/.test(formData.studentId),
          message: 'La cédula debe tener entre 7 y 9 dígitos numéricos'
        },
        {
          condition: /^[A-Za-zÀ-ÿ\s]{3,50}$/.test(formData.name.trim()),
          message: 'El nombre debe contener solo letras y tener entre 3 y 50 caracteres'
        },
        {
          condition: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()),
          message: 'El correo electrónico ingresado no es válido'
        },
        {
          condition: /^\d{10,11}$/.test(formData.phone.replace(/\D/g, '')),
          message: 'El número de teléfono debe tener entre 10 y 11 dígitos numéricos'
        }
      ];

      const validationError = validations.find(v => !v.condition);
      if (validationError) {
        throw new Error(validationError.message);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss(loadingToast);
      toast.success('¡Registro completado con éxito! 🎉 Buena suerte en el sorteo.');
      setFormData(initialFormData);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  };

  const TaskCard = ({ title, description, icon: Icon, completed, link, onComplete, isLoading, task }) => {
    const [shareCount, setShareCount] = useLocalStorage(`${task}_shares`, 0);
    const isInviteTask = task === 'invitedInstagramFriends' || task === 'invitedWhatsAppFriends';

    const handleShare = async () => {
      try {
        const shareText = task === 'invitedInstagramFriends'
          ? '¡Síguenos en Instagram! @integrate_ucv'
          : '¡Únete a nuestro grupo de WhatsApp!';

        if (navigator.share) {
          await navigator.share({
            title: 'Intégrate UCV',
            text: shareText,
            url: link
          });
        } else {
          await navigator.clipboard.writeText(`${shareText}\n${link}`);
        }

        const newCount = shareCount + 1;
        setShareCount(newCount);
        
        if (newCount >= 10) {
          toast.success('¡Has compartido 10 veces! Ya puedes verificar la tarea');
        } else {
          toast.success(`¡Enlace compartido! ${newCount}/10 veces`);
        }
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Error al compartir. Por favor intenta nuevamente.');
      }
    };

    if (!mounted) return null;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="mb-4"
        initial={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`w-full rounded-xl border ${completed ? 'bg-green-50' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className={`p-3 rounded-xl ${completed ? 'bg-green-100' : 'bg-orange-100'} flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${completed ? 'text-green-600' : 'text-[#F5A623]'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 break-words">{title}</h3>
                <p className="text-sm text-gray-600 mt-1 break-words">{description}</p>
                
                {isInviteTask && !completed && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button 
                        onClick={handleShare}
                        className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Compartir enlace ({shareCount}/10)
                      </button>

                      {task === 'invitedWhatsAppFriends' && (
                        <a 
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent('¡Únete a nuestro grupo de WhatsApp!\n' + link)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            const newCount = shareCount + 1;
                            setShareCount(newCount);
                            if (newCount >= 10) {
                              toast.success('¡Has compartido 10 veces! Ya puedes verificar la tarea');
                            } else {
                              toast.success(`¡Enlace compartido! ${newCount}/10 veces`);
                            }
                          }}
                          className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                          Compartir por WhatsApp ({shareCount}/10)
                        </a>
                      )}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <p className="text-sm text-gray-600">
                          {shareCount >= 10 
                            ? '¡Ya puedes verificar esta tarea!'
                            : `Comparte el enlace ${10 - shareCount} veces más para verificar esta tarea.`}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((shareCount / 10) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:ml-2 mt-4 sm:mt-0 flex-shrink-0 w-full sm:w-auto">
                {completed ? (
                  <span className="text-green-600 text-sm font-medium block text-center sm:text-left">Completado ✓</span>
                ) : (
                  <button 
                    onClick={() => onComplete(task, link)}
                    disabled={isLoading || (isInviteTask && shareCount < 10)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${isLoading || (isInviteTask && shareCount < 10)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-black hover:bg-[#E69612] text-white'
                      } disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ) : (
                      'Verificar'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!mounted) return null;

  return (
    <>
      <Container>
        <NextSeo title={`Sorteos | ${process.env.NEXT_PUBLIC_SITE_TITLE}`} />
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#1a237e] mb-4">
              Conoce el poder de Excel: Taller para futuros Estadísticos y Actuarios
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              ¿Listo para llevar tus habilidades en Excel al siguiente nivel? Acompáñanos en este taller interactivo 
              donde aprenderás trucos y técnicas para optimizar tu trabajo con datos.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg inline-block">
              <p className="font-medium text-gray-900">📅 Jueves 06 de febrero de 2025</p>
              <p className="font-medium text-gray-900">📍 Salón de Usos Múltiples, Piso 2</p>
              <p className="font-medium text-gray-900">🕙 10:30 AM - 1:00 PM</p>
            </div>
          </div>

          {!showForm ? (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-[#F5A623] mb-2">
                  Completa estas tareas para participar en el sorteo
                </h2>
                <p className="text-gray-600">
                  Estamos sorteando 5 becas para este taller. ¡Completa todas las tareas para participar!
                </p>
                <p className="text-sm text-gray-500 mt-2 italic">
                  Nota: La verificación de cada tarea puede tomar hasta 2 minutos.
                </p>
              </div>

              <TaskCard
                title="Síguenos en Instagram"
                description="Sigue nuestra cuenta oficial de Instagram @integrate_ucv"
                icon={Instagram}
                completed={tasks.followedInstagram}
                link="https://www.instagram.com/integrate_ucv/"
                onComplete={handleTaskComplete}
                isLoading={loading.followedInstagram}
                task="followedInstagram"
                timeLeft={timeLeft}
              />

              <TaskCard
                title="Invita a tus compañeros a Instagram"
                description="Invita a 10 estudiantes a seguir nuestra cuenta de Instagram"
                icon={Users}
                completed={tasks.invitedInstagramFriends}
                link="https://www.instagram.com/integrate_ucv/"
                onComplete={handleTaskComplete}
                isLoading={loading.invitedInstagramFriends}
                task="invitedInstagramFriends"
                timeLeft={timeLeft}
              />

              <TaskCard
                title="Únete a nuestra comunidad de WhatsApp"
                description="Forma parte de nuestra comunidad de estudiantes en WhatsApp"
                icon={MessageSquare}
                completed={tasks.joinedWhatsApp}
                link="https://chat.whatsapp.com/D0Xlg5fBlguHgrdxxx5D0Z"
                onComplete={handleTaskComplete}
                isLoading={loading.joinedWhatsApp}
                task="joinedWhatsApp"
                timeLeft={timeLeft}
              />

              <TaskCard
                title="Invita a tus compañeros a WhatsApp"
                description="Invita a 10 estudiantes a unirse a nuestra comunidad de WhatsApp"
                icon={Users}
                completed={tasks.invitedWhatsAppFriends}
                link="https://chat.whatsapp.com/D0Xlg5fBlguHgrdxxx5D0Z"
                onComplete={handleTaskComplete}
                isLoading={loading.invitedWhatsAppFriends}
                task="invitedWhatsAppFriends"
                timeLeft={timeLeft}
              />

              <TaskCard
                title="Dale me gusta a nuestra publicación"
                description="Muestra tu apoyo dando like a nuestra última publicación"
                icon={ThumbsUp}
                completed={tasks.likedPost}
                link="https://www.instagram.com/p/DCc2-vIhdj6/?img_index=1"
                onComplete={handleTaskComplete}
                isLoading={loading.likedPost}
                task="likedPost"
                timeLeft={timeLeft}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-2xl font-bold text-[#1a237e] mb-6">Registro para el Taller</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula de Identidad
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 12345678"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#F5A623] focus:border-transparent outline-none"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                    maxLength={9}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#F5A623] focus:border-transparent outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '')})}
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ej: juan@example.com"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#F5A623] focus:border-transparent outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 04121234567"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#F5A623] focus:border-transparent outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                    maxLength={11}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-black hover:bg-[#E69612] text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Registrarme para el sorteo
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </Container>
    </>
  );
};

export default WorkshopRegistration;