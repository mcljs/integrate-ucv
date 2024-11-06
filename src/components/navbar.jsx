import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars2Icon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { Link } from './link';
import { Link as LinkScroll } from "react-scroll";
import { PlusGrid, PlusGridItem, PlusGridRow } from './plus-grid';

const links = [
  { href: 'propuesta', label: 'Propuesta' },
  { href: 'calendario', label: 'Calendario' },
    { href: 'cambio', label: 'Cambio' },
];

function DesktopNav() {
  return (
      <nav className="relative hidden lg:flex">
        {links.map(({ href, label }) => (
            <PlusGridItem key={href} className="relative flex cursor-pointer">
              <LinkScroll
                  to={href}
                  smooth={true}
                  offset={-70} // Adjust the offset for fixed headers if needed
                  duration={500}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-950 bg-blend-multiply data-[hover]:bg-black/[2.5%]"
              >
                {label}
              </LinkScroll>
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
  return (
      <DisclosurePanel className="lg:hidden">
        <div className="flex flex-col gap-6 py-4">
          {links.map(({ href, label }, linkIndex) => (
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
                <LinkScroll
                    to={href}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    className="text-base font-medium text-gray-950"
                >
                  {label}
                </LinkScroll>
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
                  <img src={"/logo-1.png"} alt="logo" className="h-12" />
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
