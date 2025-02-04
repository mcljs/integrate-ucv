import '@/styles/tailwind.css';
import { DefaultSeo } from 'next-seo';
import config from '../config';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {

    const SchemaMarkup = () => (
        <Head>
            <script type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: 'Intégrate EECA-UCV',
                    description: 'Movimiento estudiantil de la EECA-UCV comprometido con transformar la escuela en un espacio de excelencia académica y desarrollo integral. ¡Sé parte del cambio!',
                    url: process.env.NEXT_PUBLIC_URL,
                    logo: `${process.env.NEXT_PUBLIC_URL}/logo.png`,
                    sameAs: [
                        process.env.NEXT_PUBLIC_INSTAGRAM
                    ],
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: 'Caracas',
                        addressRegion: 'Distrito Capital',
                        addressCountry: 'VE'
                    },
                    subOrganization: {
                        '@type': 'EducationalOrganization',
                        name: 'Escuela de Estadística y Ciencias Actuariales',
                        parentOrganization: {
                            '@type': 'EducationalOrganization',
                            name: 'Universidad Central de Venezuela'
                        }
                    },
                    potentialAction: {
                        '@type': 'JoinAction',
                        name: 'Únete a Intégrate',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${process.env.NEXT_PUBLIC_URL}`,
                            actionPlatform: [
                                'http://schema.org/DesktopWebPlatform',
                                'http://schema.org/MobileWebPlatform'
                            ]
                        }
                    }
                })}
            </script>
        </Head>
    );


    return (
        <>
        <Toaster
  position="top-center"
  reverseOrder={false}
/>
            <SchemaMarkup />
            <DefaultSeo {...config} />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
