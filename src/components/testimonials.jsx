'use client'

import * as Headless from '@headlessui/react'
import { ArrowLongRightIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'framer-motion'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import useMeasure from 'react-use-measure'
import { Container } from './container'
import { Link } from './link'
import { Heading, Subheading } from './text'
import { FadeIn } from './FadeIn'

const testimonials = [
  {
    img: '/team-2.jpeg',
    name: 'Andrés Carballo',
    title: 'Candidato al Centro de Estudiantes',
    quote:
        'Comprometido con representar la voz de cada estudiante y trabajar por una EECA más inclusiva y moderna.'
  },
  {
    img: '/team-3.jpeg',
    name: 'Adrianna Passanisi',
    title: 'Candidata al Consejo de Escuela',
    quote:
        'Buscando impulsar iniciativas que mejoren la calidad académica y la experiencia estudiantil en la EECA.'
  },
  {
    img: '/team-4.jpeg',
    name: 'Stiven Macias',
    title: 'Candidato al Consejo de Escuela',
    quote:
        'Trabajando por una escuela que ofrezca más oportunidades y espacios de desarrollo para todos.'
  }
]

function TestimonialCard({
  name,
  title,
  img,
  children,
  bounds,
  scrollX,
  ...props
}) {
  let ref = useRef(null)

  let computeOpacity = useCallback(() => {
    let element = ref.current
    if (!element || bounds.width === 0) return 1

    let rect = element.getBoundingClientRect()

    if (rect.left < bounds.left) {
      let diff = bounds.left - rect.left
      let percent = diff / rect.width
      return Math.max(0.5, 1 - percent)
    } else if (rect.right > bounds.right) {
      let diff = rect.right - bounds.right
      let percent = diff / rect.width
      return Math.max(0.5, 1 - percent)
    } else {
      return 1
    }
  }, [ref, bounds.width, bounds.left, bounds.right])

  let opacity = useSpring(computeOpacity(), {
    stiffness: 154,
    damping: 23,
  })

  useLayoutEffect(() => {
    opacity.set(computeOpacity())
  }, [computeOpacity, opacity])

  useMotionValueEvent(scrollX, 'change', () => {
    opacity.set(computeOpacity())
  })

  return (
      <motion.div
          ref={ref}
          style={{opacity}}
          {...props}
          className="relative flex aspect-[9/16] w-72 shrink-0 snap-start scroll-ml-[var(--scroll-padding)] flex-col justify-end overflow-hidden rounded-3xl sm:aspect-[3/4] sm:w-96"
      >
        <img
            alt=""
            src={img}
            className="absolute inset-x-0 top-0 aspect-square w-full object-cover"
        />
        <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
        />
        <figure className="relative p-10">
          <blockquote>
            <p className="relative text-lg/7 text-white">
            <span aria-hidden="true" className="absolute -translate-x-full">
              “
            </span>
              {children}
              <span aria-hidden="true" className="absolute">
              ”
            </span>
            </p>
          </blockquote>
          <figcaption className="mt-6 border-t border-white/20 pt-6">
            <p className="text-sm/6 font-medium text-white">{name}</p>
            <p className="text-sm/6 font-medium">
        <span
            className="bg-gradient-to-r from-[#F5A623] via-[#F7B844] to-[#FFD700] bg-clip-text text-transparent font-medium">
  {title}
</span>
            </p>
          </figcaption>
        </figure>
      </motion.div>
  )
}

function CallToAction() {
  return (
      <div>
        <p className="max-w-sm text-sm/6 text-gray-600">
          ¿Quieres ser parte del cambio? Únete a nuestra comunidad y mantente informado
          de todas las novedades.
        </p>
        <div className="mt-2">
          <Link
              href="https://chat.whatsapp.com/D0Xlg5fBlguHgrdxxx5D0Z?fbclid=PAZXh0bgNhZW0CMTEAAaY5WHxZQYm9NpRSj4zAAYSZ4GgNvn4HkApC2zBcyTrW_s56TZ1dteNpWnw_aem_xCW08WHL1zefK6Z456A34g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm/6 font-medium text-[#1a237e] hover:text-[#F5A623] transition-colors duration-200"
          >
            Unirse al grupo
            <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </Link>
        </div>
      </div>
  )
}

export function Testimonials() {
  let scrollRef = useRef(null)
  let { scrollX } = useScroll({ container: scrollRef })
  let [setReferenceWindowRef, bounds] = useMeasure()
  let [activeIndex, setActiveIndex] = useState(0)

  useMotionValueEvent(scrollX, 'change', (x) => {
    setActiveIndex(Math.floor(x / scrollRef.current.children[0].clientWidth))
  })

  function scrollTo(index) {
    let gap = 32
    let width = scrollRef.current.children[0].offsetWidth
    scrollRef.current.scrollTo({ left: (width + gap) * index })
  }

  return (
    <FadeIn id="team" className="overflow-hidden py-32">
      <Container>
        <div ref={setReferenceWindowRef} className="text-center">
          <Subheading className="text-[#F5A623] tracking-wider">CONOCE A</Subheading>
          <Heading as="h3" className="mt-2 text-[#1a237e] text-balance">
            El equipo que <br className="hidden sm:block" />
            transformará la EECA
          </Heading>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            Unidos por el compromiso de hacer de nuestra escuela un espacio
            de excelencia académica y desarrollo integral.
          </p>
        </div>
      </Container>
      <div
        ref={scrollRef}
        className={clsx([
          'mt-16 flex gap-8 px-[var(--scroll-padding)]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth',
          '[--scroll-padding:max(theme(spacing.6),calc((100vw-theme(maxWidth.2xl))/2))] lg:[--scroll-padding:max(theme(spacing.8),calc((100vw-theme(maxWidth.7xl))/2))]',
        ])}
      >
        {testimonials.map(({ img, name, title, quote }, testimonialIndex) => (
          <TestimonialCard
            key={testimonialIndex}
            name={name}
            title={title}
            img={img}
            bounds={bounds}
            scrollX={scrollX}
            onClick={() => scrollTo(testimonialIndex)}
          >
            {quote}
          </TestimonialCard>
        ))}
        <div className="w-[42rem] shrink-0 sm:w-[54rem]" />
      </div>
      <Container className="mt-16">
        <div className="flex justify-between">
          <CallToAction />
          <div className="hidden sm:flex sm:gap-2">
            {testimonials.map(({ name }, testimonialIndex) => (
              <Headless.Button
                key={testimonialIndex}
                onClick={() => scrollTo(testimonialIndex)}
                data-active={
                  activeIndex === testimonialIndex ? true : undefined
                }
                aria-label={`Scroll to testimonial from ${name}`}
                className={clsx(
                  'size-2.5 rounded-full border border-transparent bg-gray-300 transition',
                  'data-[active]:bg-gray-400 data-[hover]:bg-gray-400',
                  'forced-colors:data-[active]:bg-[Highlight] forced-colors:data-[focus]:outline-offset-4',
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </FadeIn>
  )
}
