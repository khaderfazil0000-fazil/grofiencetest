import { notFound } from 'next/navigation'
import { getBlogPost, getRelatedPosts, BLOG_AUTHORS } from '@/lib/blog-data'
import BlogPostContent from '@/components/blog/BlogPostContent'
import BlogNewsletter from '@/components/blog/BlogNewsletter'

// Generate static params for all blog posts
export async function generateStaticParams() {
  const { BLOG_POSTS } = await import('@/lib/blog-data')
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

// Dynamic SEO metadata per post
export async function generateMetadata({ params }) {
  const post = getBlogPost(params.slug)
  if (!post) return { title: 'Post Not Found | Grofience Blog' }

  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription,
    keywords: post.tags.join(', '),
    authors: [{ name: BLOG_AUTHORS[post.author]?.name || 'Grofience Team' }],
    openGraph: {
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [BLOG_AUTHORS[post.author]?.name || 'Grofience Team'],
      tags: post.tags,
      siteName: 'Grofience Blog',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
    },
    alternates: {
      canonical: `https://grofience.com/blog/${post.slug}`,
    },
  }
}

export default function BlogPostPage({ params }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(post.slug, post.category, 3)

  // JSON-LD Structured Data for Google rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: BLOG_AUTHORS[post.author]?.name || 'Grofience Team',
      jobTitle: BLOG_AUTHORS[post.author]?.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grofience',
      logo: {
        '@type': 'ImageObject',
        url: 'https://grofience.com/grofience-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://grofience.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(' ').length,
    timeRequired: `PT${post.readTime}M`,
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BlogPostContent post={post} relatedPosts={relatedPosts} />
      <BlogNewsletter />
    </>
  )
}
