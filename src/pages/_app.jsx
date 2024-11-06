import '@/styles/tailwind.css';
import { DefaultSeo } from 'next-seo';
import config from '../config';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <DefaultSeo {...config} />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
