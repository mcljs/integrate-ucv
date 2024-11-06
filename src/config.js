export default {
    title: `${process.env.NEXT_PUBLIC_SITE_TITLE}`,
    description: process.env.NEXT_PUBLIC_PRODUCT_DESCRIPTION,
    author: `${process.env.NEXT_PUBLIC_PARTNER_FIRST_NAME} ${process.env.NEXT_PUBLIC_PARTNER_LAST_NAME}`,
    additionalLinkTags: [
        {
            rel: 'icon',
            href: `/favicon.ico`,
        },
    ],
    additionalMetaTags: [
        {
            property: 'author',
            content: `${process.env.NEXT_PUBLIC_PARTNER_FIRST_NAME}`,
        },
        {
            property: 'keywords',
            content: process.env.NEXT_PUBLIC_SEO_KEYWORDS,
        },
    ],
    twitter: {
        cardType: 'summary_large_image',
        handle: `${process.env.NEXT_PUBLIC_PARTNER_TWITTER}`,
    },
    openGraph: {
        type: 'website',
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
