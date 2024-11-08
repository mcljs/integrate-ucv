'use client'

import { motion } from 'framer-motion';
import { Container } from '@/components/container';
import {
    Users2, BookOpen, MessageSquare, GraduationCap,
    Trophy, Share2, Bell, FileSpreadsheet,
    BookMarked, Notebook, School, LibraryBig
} from 'lucide-react';

function ProposalCard({ title, icon: Icon, items, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
            <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-[#F5A623]/10">
                        <Icon className="w-8 h-8 text-[#F5A623]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1a237e]">{title}</h3>
                </div>
                <ul className="space-y-4">
                    {items.map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: delay + 0.1 * index }}
                            className="flex items-start gap-3"
                        >
                            <div className="mt-1 p-1 rounded-full bg-[#F5A623]/10">
                                <item.icon className="w-4 h-4 text-[#F5A623]" />
                            </div>
                            <div className="text-gray-700">
                                {item.title && (
                                    <span className="font-semibold block">{item.title}</span>
                                )}
                                {item.description}
                            </div>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

function ProposalSection() {
    const proposals = [
        {
            title: "Participación Integral",
            icon: Trophy,
            items: [
                {
                    icon: Users2,
                    title: "EQUIPOS DEPORTIVOS",
                    description: "Impulsar la formación de equipos en Futbol, Basket, Voleybol, tenis de mesa, etc."
                },
                {
                    icon: Share2,
                    title: "CLUBS",
                    description: "Fomentar la apertura de clubs de diferentes disciplinas en la escuela intersemestrales."
                },
                {
                    icon: Bell,
                    title: "PROFONDOS",
                    description: "Organización en conjunto de vendimias u otras opciones para apoyar emprendimientos de estudiantes."
                },
                {
                    icon: BookOpen,
                    title: "UCV SOS",
                    description: "Difusión de Información de Interés por la seguridad y formación de los estudiantes."
                }
            ]
        },
        {
            title: "Comunicación Directa",
            icon: MessageSquare,
            items: [
                {
                    icon: Users2,
                    title: "COMUNIDAD",
                    description: "Whatsapp para la EECA (Centralizar Información)"
                },
                {
                    icon: Bell,
                    title: "COMUNICACIÓN ABIERTA",
                    description: "Canal con los estudiantes para conocer y atender las situaciones"
                },
                {
                    icon: FileSpreadsheet,
                    title: "REPORTE DE GESTIÓN",
                    description: "Público en las cuentas de la EECA sobre logros y proyectos en proceso"
                },
                {
                    icon: BookMarked,
                    title: "COMUNICADOS",
                    description: "Precisos con información de interés de CE, CF o CU."
                }
            ]
        },
        {
            title: "Cooperación Académica",
            icon: School,
            items: [
                {
                    icon: GraduationCap,
                    title: "UNIDAD DE ASESORAMIENTO ACADÉMICO DE LA EECA",
                    description: "Construir una Red de tutores para las materias de mayor dificultad"
                },
                {
                    icon: LibraryBig,
                    title: "SIMULACROS DE EVALUACIONES",
                    description: "Para la preparación óptima"
                },
                {
                    icon: BookOpen,
                    title: "BIBLIOTECA DIGITAL ACTUALIZADA",
                    description: "Incorporación sistemática de libros, guías, materiales de apoyo profesorales, modelos de exámenes parciales y otras evaluaciones asignadas para facilitar tu preparación académica."
                },
                {
                    icon: Notebook,
                    title: "BANCO DE CUADERNOS",
                    description: "Proporcionados por estudiantes"
                }
            ]
        }
    ];

    return (
        <div id="propuesta-1" className="mx-2 mt-2 rounded-4xl bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)] py-32">
            <Container>
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-[#1a237e] mb-4"
                    >
                        Nuestras Propuestas
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600"
                    >
                        Construyendo juntos el futuro de la EECA
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {proposals.map((proposal, index) => (
                        <ProposalCard
                            key={proposal.title}
                            {...proposal}
                            delay={0.2 * index}
                        />
                    ))}
                </div>
            </Container>
        </div>
    );
}

export default ProposalSection;