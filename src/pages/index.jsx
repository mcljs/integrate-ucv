'use client'


import { BentoCard } from '@/components/bento-card'
import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Gradient } from '@/components/gradient'
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar'
import { Testimonials } from '@/components/testimonials'
import {Heading, Lead, Subheading} from '@/components/text'
import {Activity, BookOpen, Calendar, CalendarCheck, GraduationCap, HeartHandshake, Trophy, Users2} from "lucide-react";
import CalendarSection from "@/components/CalendarSection";
import { Link as LinkScroll } from "react-scroll";
import ProposalSection from "@/components/ProposalSection";


function MathLogo() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.5, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute -left-8 top-1/2 -mt-32 -translate-y-1/2 flex items-center gap-1 select-none"
        >
            <div className="text-[200px] font-serif text-black">
                ∫
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.3, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-[120px] font-serif italic text-[#F5A623] -ml-4 -mt-8"
            >
                x
            </motion.div>
        </motion.div>
    );
}


function Hero() {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative">
            <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-inset ring-black/5"/>
            <Container className="relative">
                <Navbar/>
                <div className="pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32">
                    <div className="relative">
                        <MathLogo/>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="font-display text-balance text-5xl/[0.9] font-medium tracking-tight text-black sm:text-7xl/[0.8] md:text-8xl/[0.8] max-w-4xl ml-32"
                        >
                            Inté<span className="relative">g
                                <motion.span
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl text-[#F5A623]"
                                >
                                    b
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl text-[#F5A623]"
                                >
                                    a
                                </motion.span>
                            </span>rate
                        </motion.h1>
                    </div>

                    <motion.p
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-8 max-w-2xl text-xl/7 font-medium text-gray-900 sm:text-2xl/8"
                    >
                        Movimiento estudiantil comprometido con el futuro de la
                        Escuela de Estadística y Ciencias Actuariales de la UCV
                    </motion.p>

                    {/* Features */}
                    <motion.div
                        className="mt-12 flex flex-wrap gap-6"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        {[
                            { icon: Users2, text: "Representación Estudiantil" },
                            { icon: BookOpen, text: "Excelencia Académica" },
                            { icon: CalendarCheck, text: "Eventos y Actividades" }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.text}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                                className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full shadow-sm hover:bg-white/80 transition-colors"
                            >
                                <feature.icon className="h-5 w-5 text-[#F5A623]"/>
                                <span className="text-gray-900">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className="mt-12 flex flex-col sm:flex-row gap-4"
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8, duration: 0.6 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LinkScroll
                                spy={true}
                                smooth={true}
                                offset={-110}
                                duration={500}
                                to={"propuesta-1"}>
                            <Button variant="accent">
                                Conoce nuestras propuestas
                            </Button>
                            </LinkScroll>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LinkScroll
                                spy={true}
                                smooth={true}
                                offset={-110}
                                duration={900}
                                to={"calendario"}>
                            <Button variant="outline">
                                Calendario electoral
                            </Button>
                            </LinkScroll>
                        </motion.div>
                    </motion.div>
                </div>
            </Container>
        </div>
    );
}

function FeatureSection() {
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const imageAnimation = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div id="propuesta">
            <Container className="mt-16 mb-40">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <Heading as="h1">Conoce nuestras propuestas para la EECA</Heading>
                    <Lead className="mt-6 max-w-3xl">
                        Estamos comprometidos con transformar la Escuela de Estadística y
                        Ciencias Actuariales en un espacio más dinámico, justo y lleno de oportunidades.
                    </Lead>
                </motion.div>

                <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
                    <motion.div
                        className="max-w-lg"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0 }
                        }}
                    >
                        <h2 className="text-2xl font-medium tracking-tight text-[#1a237e]">
                            Nuestra visión
                        </h2>
                        <motion.p
                            className="mt-6 text-sm/6 text-gray-600"
                            variants={fadeIn}
                            transition={{ delay: 0.2 }}
                        >
                            La EECA está lista para un cambio significativo. Es el momento
                            de unirnos y construir juntos la escuela que realmente deseamos.
                            Tu voz y participación son esenciales para este proceso de transformación.
                        </motion.p>
                        <motion.p
                            className="mt-8 text-sm/6 text-gray-600"
                            variants={fadeIn}
                            transition={{ delay: 0.3 }}
                        >
                            Intégrate representa la suma de todas las voces estudiantiles,
                            trabajando unidos para hacer de nuestra escuela un lugar más
                            dinámico y lleno de oportunidades. ¡Ahora es el momento de actuar!
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="pt-20 lg:row-span-2 lg:-mr-16 xl:mr-auto"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 lg:gap-4 xl:gap-8">
                            {[
                                { src: "/escuela.png", alt: "EECA UCV", delay: 0 },
                                { src: "/escuela-2.jpeg", alt: "Estudiantes EECA", delay: 0.2, mt: true },
                                { src: "/escuela-3.jpeg", alt: "Actividades EECA", delay: 0.4 },
                                { src: "/escuela-4.jpeg", alt: "Campus UCV", delay: 0.6, mt: true }
                            ].map((img, index) => (
                                <motion.div
                                    key={img.src}
                                    variants={imageAnimation}
                                    transition={{ delay: img.delay }}
                                    className={`aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 
                                        ${img.mt ? '-mt-8 lg:-mt-32' : ''}`}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <img
                                        alt={img.alt}
                                        src={img.src}
                                        className="block size-full object-cover transform transition-transform hover:scale-105 duration-500"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="max-lg:mt-16 lg:col-span-1"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ delay: 0.4 }}
                    >
                        <Subheading>Nuestros Objetivos</Subheading>
                        <hr className="mt-6 border-t border-gray-200" />
                        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                            {[
                                { label: "Representación", value: "100%" },
                                { label: "Participación", value: "Activa" },
                                { label: "Compromiso", value: "Total" },
                                { label: "Integración", value: "Plena" }
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: { delay: 0.5 + (index * 0.1) }
                                        }
                                    }}
                                    className="flex flex-col gap-y-2 border-b border-dotted border-gray-200 pb-4"
                                >
                                    <dt className="text-sm/6 text-gray-600">{stat.label}</dt>
                                    <dd className="order-first text-5xl font-medium tracking-tight text-[#F5A623]">
                                        {stat.value}
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </motion.div>
                </section>
            </Container>
        </div>
    );
}

function Team() {
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div id="cambio">
            <Container className="mt-32">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <Subheading className="text-[#F5A623]">Nuestro Equipo</Subheading>
                    <Heading as="h3" className="mt-2">
                        Un equipo comprometido con el cambio.
                    </Heading>
                    <Lead className="mt-6 max-w-3xl text-gray-600">
                        Somos estudiantes de la EECA unidos por una visión común: transformar
                        nuestra escuela en un espacio de excelencia académica y desarrollo integral.
                    </Lead>
                </motion.div>

                <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <motion.div
                        className="max-w-lg"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.p
                            className="text-sm/6 text-gray-600"
                            variants={fadeUp}
                        >
                            Intégrate nace de la suma de experiencias y anhelos de estudiantes
                            que, como tú, buscan una EECA más dinámica y participativa.
                            Entendemos los desafíos diarios de nuestra comunidad porque los
                            vivimos de primera mano.
                        </motion.p>
                        <motion.p
                            className="mt-8 text-sm/6 text-gray-600"
                            variants={fadeUp}
                            transition={{ delay: 0.3 }}
                        >
                            Nuestro equipo combina diferentes perspectivas y años de la
                            carrera, unidos por el compromiso de representar verdaderamente
                            las necesidades de cada estudiante. Creemos en el poder de la
                            integración y la participación activa para construir la escuela
                            que todos merecemos.
                        </motion.p>
                        <motion.div
                            className="mt-8"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <a href="https://www.instagram.com/integrate_ucv/">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="accent"
                                        className="w-full sm:w-auto bg-gradient-to-r from-[#F5A623] to-[#F7B844] hover:opacity-90"
                                    >
                                        Únete al movimiento
                                    </Button>
                                </motion.div>
                            </a>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="max-lg:order-first max-lg:max-w-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="aspect-[4/3] overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-[#1a237e]/5 to-[#F5A623]/5 p-1"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative h-full w-full overflow-hidden rounded-xl">
                                <img
                                    alt="Equipo Intégrate"
                                    src="/team-1.jpeg"
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Valores del equipo */}
                <motion.div
                    className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                >
                    {[
                        {
                            title: "Compromiso",
                            description: "Dedicados a representar y defender los intereses de todos los estudiantes."
                        },
                        {
                            title: "Integración",
                            description: "Sumando todas las voces para construir una mejor escuela."
                        },
                        {
                            title: "Innovación",
                            description: "Buscando nuevas formas de mejorar la experiencia estudiantil."
                        }
                    ].map((valor, index) => (
                        <motion.div
                            key={valor.title}
                            className="rounded-2xl bg-[#1a237e]/5 p-6 hover:bg-[#1a237e]/10 transition-colors"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            whileHover={{
                                scale: 1.02,
                                transition: { duration: 0.2 }
                            }}
                        >
                            <h4 className="text-lg font-semibold text-[#1a237e]">{valor.title}</h4>
                            <p className="mt-2 text-sm text-gray-600">
                                {valor.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </div>
    );
}


export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <main>

        <div className="bg-gradient-to-b from-white from-50% to-gray-100 py-32">
          <FeatureSection />
          <Team />
        </div>
          <ProposalSection />
          <CalendarSection />
      </main>
      <Testimonials />
      <Footer />
    </div>
  )
}
