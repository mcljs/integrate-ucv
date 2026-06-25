// app/danos/page.jsx
// ----------------------------------------------------------------------
// ESTE archivo es el que arregla el "ReferenceError: window is not defined".
// Cargamos MapaDanos con ssr:false para que leaflet NUNCA corra en el servidor.
// Nota: como usa { ssr:false }, este archivo NO puede llevar 'use client'
// si lo dejas como Server Component... pero next/dynamic con ssr:false sí
// requiere cliente. Por eso marcamos 'use client' aquí. Funciona igual.

'use client'

import { NextSeo } from 'next-seo'
import dynamic from 'next/dynamic'

const MapaDanos = dynamic(() => import('@/components/MapaDanos'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-amber-50/30 text-sm font-semibold text-slate-500">
      Cargando mapa…
    </div>
  ),
})

export default function PageDanos() {
  return <>
     <NextSeo
          title={`Reporte y Mapa de Daños | ${process.env.NEXT_PUBLIC_SITE_TITLE}`}
        />
        <MapaDanos />
  </>
}