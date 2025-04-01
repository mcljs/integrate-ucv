'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import { Container } from '@/components/container';
import { Navbar } from '@/components/navbar';

const RCompilerApp = dynamic(
  () => import('@/components/RCompilerApp'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(245,166,35,0.15)_100%)] min-h-screen">
          <NextSeo
             title={`Editor R | ${process.env.NEXT_PUBLIC_SITE_TITLE}`}
           />
     
      <Container className="">
          <Navbar />
        
    
        <RCompilerApp />
        
     
      </Container>
    </div>
  );
}