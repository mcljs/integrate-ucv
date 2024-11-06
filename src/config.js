export default {
    title: `${process.env.NEXT_PUBLIC_SITE_TITLE}`,
    description: process.env.NEXT_PUBLIC_PRODUCT_DESCRIPTION,
    author: `${process.env.NEXT_PUBLIC_PARTNER_FIRST_NAME}`,
    canonical: process.env.NEXT_PUBLIC_URL,
    additionalLinkTags: [
        {
            rel: 'icon',
            href: `/favicon.ico`,
        },
        {
            rel: 'apple-touch-icon',
            href: '/apple-touch-icon.png',
            sizes: '180x180'
        },
        {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: '/favicon-32x32.png'
        } 
    ],
    additionalMetaTags: [
        {
            name: 'twitter:image',
            content: `/welcome.png`
        },
        {
            property: 'author',
            content: `${process.env.NEXT_PUBLIC_PARTNER_FIRST_NAME}`,
        },
        {
            property: 'keywords',
            content: process.env.NEXT_PUBLIC_SEO_KEYWORDS,
        },
        {
            name: 'theme-color',
            content: '#FFF0E1'
        },
        {
            property: 'og:locale',
            content: 'es_VE'
        }
    ],
    twitter: {
        cardType: 'summary_large_image',
        handle: `${process.env.NEXT_PUBLIC_PARTNER_TWITTER}`,
    

    },
    openGraph: {
        type: 'website',
        locale: 'es_VE',
        url: process.env.NEXT_PUBLIC_URL,
        site_name: process.env.NEXT_PUBLIC_SITE_TITLE,
        profile: {
            firstName: process.env.NEXT_PUBLIC_PARTNER_FIRST_NAME,
        },
        images: [
            {
                url: `/welcome.png`,
                width: 1200,
                height: 620,
            },
        ],
    },

}
