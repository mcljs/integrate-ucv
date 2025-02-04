import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars2Icon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { Link } from './link';
import { Link as LinkScroll } from "react-scroll";
import { PlusGrid, PlusGridItem, PlusGridRow } from './plus-grid';
import { useRouter } from 'next/router';

const allLinks = [
  { href: '/', label: 'Inicio', type: 'link' },
  { href: 'propuesta', label: 'Propuesta', type: 'scroll', showOnlyOnHome: true },
  { href: 'calendario', label: 'Calendario', type: 'scroll', showOnlyOnHome: true },
  { href: 'cambio', label: 'Cambio', type: 'scroll', showOnlyOnHome: true },
  { href: '/biblioteca', label: 'Biblioteca Digital', type: 'link' },
  { href: '/sorteo', label: 'Sorteo', type: 'link' }
];

const NavLink = ({ href, label, type, className }) => {
  if (type === 'scroll') {
    return (
      <LinkScroll
        to={href}
        smooth={true}
        offset={-70}
        duration={500}
        className={className}
      >
        {label}
      </LinkScroll>
    );
  }
  
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
};

function useNavigationLinks() {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  // Filtra los enlaces basados en la página actual
  const visibleLinks = allLinks.filter(link => {
    if (link.showOnlyOnHome) {
      return isHomePage;
    }
    return true;
  });

  return visibleLinks;
}

function DesktopNav() {
  const links = useNavigationLinks();

  return (
    <nav className="relative hidden lg:flex">
      {links.map(({ href, label, type }) => (
        <PlusGridItem key={href} className="relative flex cursor-pointer">
          <NavLink
            href={href}
            label={label}
            type={type}
            className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-[hover]:bg-black/[2.5%]"
          />
        </PlusGridItem>
      ))}
    </nav>
  );
}

function MobileNavButton() {
  return (
    <DisclosureButton
      className="flex size-12 items-center justify-center self-center rounded-lg data-[hover]:bg-black/5 lg:hidden"
      aria-label="Open main menu"
    >
      <Bars2Icon className="size-6" />
    </DisclosureButton>
  );
}

function MobileNav() {
  const links = useNavigationLinks();

  return (
    <DisclosurePanel className="lg:hidden relative z-10">
      <div className="flex flex-col gap-6 py-4">
        {links.map(({ href, label, type }, linkIndex) => (
          <motion.div
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{
              duration: 0.15,
              ease: 'easeInOut',
              rotateX: { duration: 0.3, delay: linkIndex * 0.1 },
            }}
            key={href}
          >
            <NavLink
              href={href}
              label={label}
              type={type}
              className="text-base font-medium text-gray-950"
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute left-1/2 w-screen -translate-x-1/2">
        <div className="absolute inset-x-0 top-0 border-t border-black/5" />
        <div className="absolute inset-x-0 top-2 border-t border-black/5" />
      </div>
    </DisclosurePanel>
  );
}

export function Navbar({ banner }) {
  return (
    <Disclosure as="header" className="pt-12 sm:pt-16">
      <PlusGrid>
        <PlusGridRow className="relative flex justify-between">
          <div className="relative flex gap-6">
            <PlusGridItem className="py-3">
              <Link href="/" title="Home">
                <img src="/logo-1.png" alt="logo" className="h-12" />
              </Link>
            </PlusGridItem>
            {banner && (
              <div className="relative hidden items-center py-3 lg:flex">
                {banner}
              </div>
            )}
          </div>
          <DesktopNav />
          <MobileNavButton />
        </PlusGridRow>
      </PlusGrid>
      <MobileNav />
    </Disclosure>
  );
}