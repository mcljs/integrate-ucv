import React from 'react';
import { Container } from '@/components/container';
import { Calendar, Clock, Users2, MessageSquare, Vote } from 'lucide-react';
import { FadeIn } from './FadeIn';

function EventCard({ date, title, type, description }) {
    const getBgColor = (type) => {
        switch(type) {
            case 'actividad': return 'bg-[#F5A623]/10';
            default: return 'bg-white';
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'actividad': return <Calendar className="w-5 h-5 text-[#F5A623]" />;
            case 'redes': return <MessageSquare className="w-5 h-5 text-[#1a237e]" />;
            case 'pendiente': return <Clock className="w-5 h-5 text-gray-600" />;
            default: return null;
        }
    };

    return (
        <div className={`rounded-xl p-4 ${getBgColor(type)} hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center gap-2 mb-2">
                {getIcon(type)}
                <span className="text-sm font-medium text-gray-600">{date}</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );
}

function CalendarSection() {
    return (
        <FadeIn id="calendario" className="py-24 bg-gradient-to-b from-white to-gray-50">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Calendario Electoral
                    </h2>
                    <p className="text-lg text-gray-600">
                        Conoce todas las actividades y eventos importantes del proceso electoral
                    </p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F5A623]" />
                        <span className="text-sm text-gray-600">Actividades</span>
                    </div>
                </div>

                {/* Semana 1 */}
                <div className="mb-12">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-[#F5A623]" />
                        Semana del 4 al 8 de Noviembre
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <EventCard
                            date="Lunes 4"
                            type="actividad"
                            title="COMIENZO DE CAMPAÑA OFICIAL"
                            description="Recepción de Donativos en la EECA"
                        />
                      

                        {/* Martes 5 */}
                        <EventCard
                            date="Martes 5"
                            type="actividad"
                            title="Actividad: La Escuela Que Queremos"
                            description="Actividad en la Escuela donde se le pide a los estudiantes que describan que les gustaría que hubiera en la EECA a futuro"
                        />
                      
                        {/* Jueves 7 */}
                        <EventCard
                            date="Jueves 7"
                            type="actividad"
                            title="Visita a Salones"
                            description="Visita a los Salones de Clases para la presentación con el estudiantado"
                        />
                        <EventCard
                            date="Jueves 7"
                            type="actividad"
                            title="Actividad Especial"
                            description="Con El Club de Programación, para presentar la iniciativa a todos los miembros y ver los beneficios"
                        />
                        {/* Viernes 8 */}
                        <EventCard
                            date="Viernes 8"
                            type="actividad"
                            title="Visita a Salones y Campeonato"
                            description="Visita a los Salones de Clases y Campeonato de Voleybol"
                        />
                        <EventCard
                            date="Viernes 8"
                            type="actividad"
                            title="Actividad P/D"
                            description="Actividad de Dispersión P/D"
                        />

                    </div>
                </div>

                {/* Semana 2 */}
                <div className="mb-12">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-[#F5A623]" />
                        Semana del 11 al 15 de Noviembre
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <EventCard
                            date="Lunes 11"
                            type="actividad"
                            title="Visita a Salones"
                            description="Visita a los Salones de Clases para la presentación con el estudiantado"
                        />

                        {/* Martes 12 */}
                        <EventCard
                            date="Martes 12"
                            type="actividad"
                            title="Debate Electoral"
                            description="Debate en la Sala con los candidatos a Presidencia del Centro de Estudiantes"
                        />

                        {/* Viernes 15 */}
                        <EventCard
                            date="Viernes 15"
                            type="actividad"
                            title="ELECCIONES"
                            description="Día oficial de votaciones"
                        />
                    </div>
                </div>
            </Container>
        </FadeIn>
    );
}

export default CalendarSection;
