import Head from 'next/head';

export default function SEOHead({
  title = 'Pearl-Sonic - Create Music with AI',
  description = 'Create original music with AI using Pearl-Sonic. Generate professional royalty-free songs in seconds with artificial intelligence.',
  keywords = 'AI music generator, create music with AI, artificial intelligence music, free AI music, music generation',
  ogImage = '/og-image.jpg',
  canonicalUrl = null,
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Pearl-Sonic" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* JSON-LD Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Pearl-Sonic',
            description: description,
            url: 'https://pearl-sonic.vercel.app',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0.08',
              priceCurrency: 'USD',
              description: 'AI music generation service'
            },
            featureList: [
              'AI-powered music generation',
              '100% copyright-free music',
              'Instant download',
              'Commercial use allowed',
              '40+ music genres',
              'Custom duration'
            ]
          })
        }}
      />
    </Head>
  );
}
