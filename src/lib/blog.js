const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Get all blog posts with their metadata
 */
function getAllBlogPosts() {
  try {
    // Check if blog directory exists
    if (!fs.existsSync(BLOG_DIR)) {
      return [];
    }

    const files = fs.readdirSync(BLOG_DIR);

    const posts = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(BLOG_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        return {
          slug: file.replace('.md', ''),
          title: data.title || 'Untitled',
          description: data.description || '',
          date: data.date || new Date().toISOString(),
          author: data.author,
          readTime: data.readTime,
          tags: data.tags || [],
          content,
        };
      })
      // Sort by date (newest first)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/**
 * Get a single blog post by slug
 */
function getBlogPostBySlug(slug) {
  try {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      author: data.author,
      readTime: data.readTime,
      tags: data.tags || [],
      content,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all blog post slugs (for SSG)
 */
function getAllBlogSlugs() {
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      return [];
    }

    const files = fs.readdirSync(BLOG_DIR);
    return files.filter(file => file.endsWith('.md')).map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error getting blog slugs:', error);
    return [];
  }
}

module.exports = {
  getAllBlogPosts,
  getBlogPostBySlug,
  getAllBlogSlugs,
};
