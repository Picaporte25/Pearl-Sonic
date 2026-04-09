import Head from 'next/head';

export default function BlogSEOHead({
  title = 'Blog - PearlSonic | AI Music Generator',
  description = 'Discover articles, tips, and insights about AI-generated copyright-free music for content creators. Learn how to create professional music without licensing issues.',
  keywords = 'AI music blog, copyright-free music guide, content creator tips, AI music tutorials, royalty-free music articles, PearlSonic blog, AI music generation guide',
  ogImage = '/og-image.jpg',
  canonicalUrl = null,
  article = null, // Para páginas individuales de artículos
  schemaType = 'WebPage', // 'WebPage' o 'Blog' o 'Article'
}) {
  // Schema.org markup
  const getSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: title,
      description: description,
      url: canonicalUrl || 'https://pearl-sonic.xyz/blog',
      publisher: {
        '@type': 'Organization',
        name: 'Pearl-Sonic',
        url: 'https://pearl-sonic.xyz',
        logo: {
          '@type': 'ImageObject',
          url: 'https://pearl-sonic.xyz/logo.png'
        }
      }
    };

    if (schemaType === 'Blog') {
      return {
        ...baseSchema,
        blogPost: [], // Se llena dinámicamente
        about: {
          '@type': 'Thing',
          name: 'AI Music Generation',
          description: 'Artificial intelligence music generation for content creators'
        }
      };
    }

    if (schemaType === 'Article' && article) {
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        image: ogImage,
        author: {
          '@type': 'Person',
          name: article.author || 'PearlSonic Team'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Pearl-Sonic',
          url: 'https://pearl-sonic.xyz',
          logo: {
            '@type': 'ImageObject',
            url: 'https://pearl-sonic.xyz/logo.png'
          }
        },
        datePublished: article.date,
        dateModified: article.date,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        articleSection: 'AI Music',
        keywords: article.tags?.join(', ') || keywords
      };
    }

    return baseSchema;
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Pearl-Sonic Team" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph tags (Facebook, LinkedIn) */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl || 'https://pearl-sonic.xyz/blog'} />
      <meta property="og:site_name" content="PearlSonic" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@PearlSonicAI" />
      <meta name="twitter:creator" content="@PearlSonicAI" />

      {/* Article-specific Open Graph tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.date} />
          <meta property="article:modified_time" content={article.date} />
          <meta property="article:author" content={article.author || 'PearlSonic Team'} />
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional SEO tags */}
      <meta name="theme-color" content="#111111" />
      <meta name="msapplication-TileColor" content="#111111" />

      {/* JSON-LD Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSchema(), null, 2)
        }}
      />

      {/* Favicon */}
      <link rel="icon" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  );
}
