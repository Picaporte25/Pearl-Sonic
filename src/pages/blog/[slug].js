import BlogLayout from '@/components/BlogLayout';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote';
import { getBlogPostBySlug } from '../../lib/blog';
import { format } from 'date-fns';
import { getUserFromToken } from '@/lib/auth';

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);
  const { slug } = context.params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  const { serialize } = require('next-mdx-remote/serialize');
  const mdxSource = await serialize(post.content);

  return {
    props: {
      post: {
        ...post,
        mdxSource,
      },
      user,
      credits: user?.credits || 0,
    },
  };
}

export default function BlogPostPage({ post, user, credits }) {
  if (!post) {
    return (
      <BlogLayout title="Article Not Found - PearlSonic">
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111111] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
            <Link href="/blog" className="text-blue-400 hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout
      title={`${post.title} - PearlSonic Blog`}
      description={post.description}
      keywords={post.tags?.join(', ') || 'AI music, copyright-free music, content creation'}
      canonicalUrl={`https://pearl-sonic.xyz/blog/${post.slug}`}
      article={{
        title: post.title,
        description: post.description,
        date: post.date,
        author: post.author,
        tags: post.tags
      }}
      schemaType="Article"
      user={user}
      credits={credits}
    >
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-6 py-12">
          {/* Article Header */}
          <header className="mb-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
            >
              ← All Articles
            </Link>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              <time>
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </time>
              {post.readTime && (
                <>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </>
              )}
              {post.author && (
                <>
                  <span>·</span>
                  <span>By {post.author}</span>
                </>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-[#222222] text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none prose-invert">
            <MDXRemote
              {...post.mdxSource}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-6 mb-3">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-6">{children}</p>,
                a: ({ children, href }) => {
                  // Si el enlace apunta a generate, hacer un botón CTA
                  if (href?.includes('/generate')) {
                    return (
                      <a
                        href={href}
                        className="block w-full text-center my-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
                        target={href?.startsWith('http') ? '_blank' : undefined}
                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {children}
                      </a>
                    );
                  }

                  return (
                    <a
                      href={href}
                      className="text-blue-400 underline hover:text-blue-300 transition-colors"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  );
                },
                ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-300">{children}</ol>,
                li: ({ children }) => <li className="text-gray-300">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#444444] pl-4 italic my-6 text-gray-400">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => (
                  <code
                    className={`bg-[#222222] text-gray-100 px-2 py-1 rounded text-sm ${className || ''}`}
                  >
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-[#0a0a0a] text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 border border-[#333333]">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-8">
                    <table className="min-w-full border border-[#444444] rounded-lg overflow-hidden shadow-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gradient-to-r from-[#1a1a1a] to-[#222222] border-b-2 border-[#555555]">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-[#333333]">
                    {children}
                  </tbody>
                ),
                th: ({ children }) => (
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {children}
                  </td>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-[#1a1a1a] transition-colors">
                    {children}
                  </tr>
                ),
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                hr: () => <hr className="my-8 border-t-2 border-[#333333]" />,
                div: ({ children, style }) => (
                  <div style={style}>{children}</div>
                ),
              }}
            />
          </article>

          {/* Back to Blog */}
          <div className="mt-16 pt-8 border-t border-[#333333]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
            >
              ← Back to all articles
            </Link>
          </div>
        </main>
      </div>
    </BlogLayout>
  );
}
