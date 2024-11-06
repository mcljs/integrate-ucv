import * as Headless from '@headlessui/react';
import { clsx } from 'clsx';
import { Link } from './link';

const variants = {
  primary: clsx(
      'inline-flex items-center justify-center px-6 py-3',
      'rounded-full border border-transparent',
      'bg-gray-900 shadow-md shadow-gray-950/10',
      'whitespace-nowrap text-base font-medium text-white',
      'data-[disabled]:bg-zinc-900/80 data-[hover]:bg-gray-800 data-[disabled]:opacity-40',
      'transition-all duration-200 hover:transform hover:scale-[1.02]',
  ),
  secondary: clsx(
      'relative inline-flex items-center justify-center px-6 py-3',
      'rounded-full border border-gray-200',
      'bg-white/80 backdrop-blur-sm',
      'whitespace-nowrap text-base font-medium text-gray-900',
      'data-[disabled]:bg-white/60 data-[hover]:bg-gray-50 data-[disabled]:opacity-40',
      'transition-all duration-200 hover:transform hover:scale-[1.02]',
  ),
  outline: clsx(
      'inline-flex items-center justify-center px-6 py-3',
      'rounded-full border border-gray-900',
      'bg-transparent',
      'whitespace-nowrap text-base font-medium text-gray-900',
      'data-[disabled]:bg-transparent data-[hover]:bg-gray-50 data-[disabled]:opacity-40',
      'transition-all duration-200 hover:transform hover:scale-[1.02]',
  ),
  accent: clsx(
      'inline-flex items-center justify-center px-6 py-3',
      'rounded-full border border-transparent',
      'bg-black shadow-md shadow-black/10',
      'whitespace-nowrap text-base font-medium text-white',
      'data-[disabled]:bg-black/70 data-[hover]:bg-gray-900 data-[disabled]:opacity-40',
      'transition-all duration-200 hover:transform hover:scale-[1.02]',
  ),
};

export function Button({ variant = 'primary', className, ...props }) {
  className = clsx(className, variants[variant]);

  return typeof props.href === 'undefined'
      ? <Headless.Button {...props} className={className} />
      : <Link {...props} className={className} />;
}