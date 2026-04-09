import BlogLayout from '@/components/BlogLayout';
import Link from 'next/link';
import { getAllBlogPosts } from '../../lib/blog';
import { format } from 'date-fns';
import { getUserFromToken } from '@/lib/auth';

export async function getServerSideProps(context) {
  const user = await getUserFromToken(context);
  const posts = getAllBlogPosts();

  return {
    props: {
      posts,
      user,
      credits: user?.credits || 0,
    },
  };
}

export default function BlogPage({ posts, user, credits }) {
  return (
    <BlogLayout
      title="Blog - PearlSonic | AI Music Generator & Copyright-Free Music Guide"
      description="Discover articles, tips, and insights about AI-generated copyright-free music for content creators. Learn how to create professional music without licensing issues, avoid copyright strikes on YouTube, and save money with AI music generation."
      keywords="AI music blog, copyright-free music guide, content creator tips, AI music tutorials, royalty-free music articles, PearlSonic blog, AI music generation guide, avoid YouTube copyright strikes, content creation music, podcast music, YouTube background music"
      canonicalUrl="https://pearl-sonic.xyz/blog"
      schemaType="Blog"
      user={user}
      credits={credits}
    >
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-16">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Blog
            </h1>
            <p className="text-lg text-gray-400">
              Articles, tips, and insights about copyright-free music and content creation
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No articles yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="border border-[#333333] rounded-lg bg-[#1a1a1a] hover:border-[#444444] transition-colors p-6"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                      <time>
                        {format(new Date(post.date), 'MMMM d, yyyy')}
                      </time>
                      {post.readTime && (
                        <>
                          <span>·</span>
                          <span>{post.readTime}</span>
                        </>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors">
                      {post.title}
                    </h2>

                    {post.description && (
                      <p className="text-gray-400 text-lg leading-relaxed mb-4">
                        {post.description}
                      </p>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
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
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </BlogLayout>
  );
}
