import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const metaTags = [
    { name: 'description', content: 'Create original music with AI using Pearl-Sonic. Generate professional royalty-free songs in seconds with artificial intelligence. Perfect for YouTube, podcasts, and commercial use.' },
    { name: 'keywords', content: 'AI music generator, create music with AI, artificial intelligence music, free AI music, music generation, AI song creator, royalty free music, Pearl-Sonic' },
    { name: 'author', content: 'Pearl-Sonic' },
    { name: 'robots', content: 'index, follow' },

    // Open Graph tags
    { property: 'og:title', content: 'Pearl-Sonic - Create Music with AI' },
    { property: 'og:description', content: 'Generate professional music in seconds with AI. 100% copyright-free for YouTube, TikTok, and commercial use.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://pearl-sonic.vercel.app' },
    { property: 'og:image', content: 'https://pearl-sonic.vercel.app/og-image.jpg' },

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Pearl-Sonic - Create Music with AI' },
    { name: 'twitter:description', content: 'Generate professional music in seconds with AI. 100% copyright-free.' },
    { name: 'twitter:image', content: 'https://pearl-sonic.vercel.app/twitter-image.jpg' },
  ];

  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {metaTags.map((tag, i) => (
          <meta key={i} {...tag} />
        ))}
        <link rel="icon" href="/favicon.svg" />
        <link rel="canonical" href="https://pearl-sonic.vercel.app" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
