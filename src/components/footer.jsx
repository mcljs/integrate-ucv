import { PlusGrid, PlusGridItem, PlusGridRow } from '@/components/plus-grid';
import { Button } from './button';
import { Container } from './container';
import { Gradient } from './gradient';
import { Link } from './link';
import { Subheading } from './text';
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Link as LinkScroll } from "react-scroll";

function CallToAction() {
  return (
    <div className="relative pb-16 pt-20 text-center sm:py-24">
      <hgroup>
        <Subheading className="text-zinc-700">¡Únete al movimiento!</Subheading>
        <p className="mt-6 text-3xl font-medium tracking-tight text-black sm:text-5xl">
          ¿Listo para ser parte del cambio?
          <br />
          Tu voz es importante.
        </p>
      </hgroup>
      <p className="mx-auto mt-6 max-w-xl text-base/6 text-gray-600">
        Sé parte de la transformación de nuestra escuela.
        Juntos podemos construir la EECA que queremos.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <LinkScroll
              to={`propuesta-1`}
              smooth={true}
              offset={-70}
              duration={500}
              className="text-base font-medium text-gray-950"
          >
        <Button
            variant="primary"
        >
          Conoce nuestras propuestas
        </Button>
          </LinkScroll>
        <Button 
          variant="outline"
          href="https://www.instagram.com/integrate_ucv/"
        >
            Únete al movimiento
        </Button>
      </div>
    </div>
  )
}

function SocialLinks() {
  return (
    <div className="flex gap-6">
      <Link
        href="https://www.instagram.com/integrate_ucv/"
        target="_blank"
        aria-label="Síguenos en Instagram"
        className="text-[#1a237e] hover:text-[#F5A623] transition-colors duration-200"
      >
        <Instagram className="size-6" />
      </Link>
      <Link
        href="https://chat.whatsapp.com/D0Xlg5fBlguHgrdxxx5D0Z?fbclid=PAZXh0bgNhZW0CMTEAAaY5WHxZQYm9NpRSj4zAAYSZ4GgNvn4HkApC2zBcyTrW_s56TZ1dteNpWnw_aem_xCW08WHL1zefK6Z456A34g"
        target="_blank"
        aria-label="Contáctanos por WhatsApp"
        className="text-[#1a237e] hover:text-[#F5A623] transition-colors duration-200"
      >
        <MessageCircle className="size-6" />
      </Link>
    </div>
  )
}

function QuickLinks() {
  const links = [
    { name: 'Propuestas', href: '/propuestas' },
    { name: 'Equipo', href: '/equipo' },
    { name: 'Calendario', href: '/calendario' },
    { name: 'Contáctanos', href: '/contacto' },
  ]

  return (
    <nav className="flex gap-6">
      {links.map(link => (
        <Link
          key={link.name}
          href={link.href}
          className="text-sm text-gray-600 hover:text-[#1a237e] transition-colors duration-200"
        >
          {link.name}
        </Link>
      ))}
    </nav>
  )
}

function Copyright() {
  return (
    <div className="text-sm/6 text-gray-600">
      &copy; {new Date().getFullYear()} Intégrate EECA-UCV.
      <br />
      <span className="text-xs">
        Movimiento estudiantil comprometido con el futuro de la EECA
      </span>
    </div>
  )
}

export function Footer() {
  return (
    <footer>
      <Gradient className="relative">
        <div className="absolute inset-2 rounded-4xl bg-gradient-to-b from-white/80 to-white/95" />
        <Container>
          <CallToAction />
          <PlusGrid className="pb-16">
            <PlusGridRow>
              <div className="grid grid-cols-1 gap-y-10 pb-6 lg:grid-cols-3 lg:gap-8">
                <div className="col-span-1 flex flex-col gap-4">
                  <PlusGridItem className="pt-6 lg:pb-6">
                      <div className="flex">
                          <img src="/logo-1.png" alt="Logo Intégrate" className="w-28 h-auto"/>
                          <img src="/ucv.png" alt="Logo Intégrate" className="w-28 h-auto"/>
                      </div>

                    <div className="mt-4">
                      <SocialLinks />
                    </div>
                  </PlusGridItem>
                </div>
              </div>
            </PlusGridRow>
            <PlusGridRow className="flex flex-col sm:flex-row justify-between gap-4 border-t border-gray-200 pt-8">
              <PlusGridItem className="py-3">
                <Copyright />
              </PlusGridItem>
              <PlusGridItem className="py-3">
                <QuickLinks />
              </PlusGridItem>
            </PlusGridRow>
          </PlusGrid>
        </Container>
      </Gradient>
    </footer>
  )
}
