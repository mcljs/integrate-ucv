import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="es">
                <Head>
                    <link
                        rel="stylesheet"
                        href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&display=swap"
                    />
                    <link
                        rel="alternate"
                        type="application/rss+xml"
                        title="Intégrate - EECA UCV"
                        href="/blog/feed.xml"
                    />
                </Head>
                <body className="text-gray-950 antialiased">
                <Main />
                <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
