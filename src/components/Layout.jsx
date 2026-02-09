import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
// import { useEffect } from 'react';

export default function Layout({ children, title = 'Sound-Weaver', user = null, credits = 0 }) {
  // Comentado temporalmente - descomenta las siguientes líneas cuando tengas credenciales de PayPal reales
  /*
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=ARS&intent=capture&disable-funding`;
    script.async = true;
    script.onload = () => {
      console.log('PayPal SDK loaded');
    };
    document.body.appendChild(script);
  }, []);
  */

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Create music with artificial intelligence - Sound-Weaver" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header user={user} credits={credits} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
