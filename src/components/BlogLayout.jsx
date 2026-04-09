import BlogHeader from './BlogHeader';
import Footer from './Footer';
import BlogSEOHead from './BlogSEOHead';

export default function BlogLayout({ children, title, description, keywords, canonicalUrl, article = null, schemaType = 'WebPage', user = null, credits = 0 }) {
  const defaultTitle = 'Blog - PearlSonic | AI Music Generator';
  const defaultDescription = 'Discover articles, tips, and insights about AI-generated copyright-free music for content creators. Learn how to create professional music without licensing issues.';
  const defaultKeywords = 'AI music blog, copyright-free music guide, content creator tips, AI music tutorials, royalty-free music articles, PearlSonic blog, AI music generation guide';

  return (
    <>
      <BlogSEOHead
        title={title || defaultTitle}
        description={description || defaultDescription}
        keywords={keywords || defaultKeywords}
        canonicalUrl={canonicalUrl}
        article={article}
        schemaType={schemaType}
      />
      <div className="flex flex-col min-h-screen">
        <BlogHeader user={user} credits={credits} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
