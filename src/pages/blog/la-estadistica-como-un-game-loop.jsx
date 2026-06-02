import dynamic from 'next/dynamic'
import { NextSeo } from 'next-seo'
import { Container } from '@/components/container'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const BlogContent = dynamic(() => import('@/components/blog/BlogEstadisticaContent'), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto py-32 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#F5A623] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 font-mono">cargando artículo...</p>
      </div>
    </div>
  ),
})

export default function BlogEstadisticaGameLoop() {
  return (
    <>
      <NextSeo
        title={`La estadística como un game loop | ${process.env.NEXT_PUBLIC_SITE_TITLE}`}
        description="Media, desviación estándar, correlación y pruebas de hipótesis con Python. Para propedéutico y primer semestre de la EECA — UCV."
        canonical={`${process.env.NEXT_PUBLIC_URL}/blog/la-estadistica-como-un-game-loop`}
        openGraph={{
          type: 'article',
          locale: 'es_VE',
          url: `${process.env.NEXT_PUBLIC_URL}/blog/la-estadistica-como-un-game-loop`,
          site_name: process.env.NEXT_PUBLIC_SITE_TITLE,
          title: `La estadística como un game loop | ${process.env.NEXT_PUBLIC_SITE_TITLE}`,
          description: 'Media, desviación estándar, correlación y pruebas de hipótesis con Python. Para propedéutico y primer semestre de la EECA.',
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_URL}/blog/estadistica-game-loop.png`,
              width: 1200,
              height: 630,
              alt: 'La estadística como un game loop',
            },
          ],
          article: {
            publishedTime: '2026-06-02T00:00:00Z',
            authors: [process.env.NEXT_PUBLIC_URL],
            tags: ['estadística', 'python', 'EECA', 'UCV', 'propedéutico'],
          },
        }}
        twitter={{
          cardType: 'summary_large_image',
          handle: process.env.NEXT_PUBLIC_PARTNER_TWITTER,
        }}
        additionalMetaTags={[
          {
            name: 'twitter:image',
            content: `${process.env.NEXT_PUBLIC_URL}/blog/estadistica-game-loop.png`,
          },
          {
            property: 'og:locale',
            content: 'es_VE',
          },
          {
            property: 'keywords',
            content: 'estadística, python, EECA, UCV, propedéutico, media, desviación estándar, correlación',
          },
          {
            name: 'theme-color',
            content: '#FFF0E1',
          },
        ]}
        additionalLinkTags={[
          { rel: 'icon', href: '/favicon.ico' },
          { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
          { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        ]}
      />

      <div className="bg-white min-h-screen">
        <div
          aria-hidden="true"
          className="fixed right-0 top-0 text-[28vw] font-serif font-bold text-[#1a237e]/[0.025] leading-none select-none pointer-events-none overflow-hidden z-0"
        >
          μ
        </div>

        <div className="relative z-10">
          <Container>
            <Navbar />
          </Container>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#F5A623]/30 to-transparent" />

          <Container>
            <BlogContent />
          </Container>
        </div>

        <Footer />
      </div>
    </>
  )
}