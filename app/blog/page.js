'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BlogHero from '@/components/blog/BlogHero'
import BlogCard from '@/components/blog/BlogCard'
import BlogNewsletter from '@/components/blog/BlogNewsletter'
import { BLOG_POSTS, getFeaturedPost, getPostsByCategory } from '@/lib/blog-data'
import { BookOpen, TrendingUp } from 'lucide-react'

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const featuredPost = getFeaturedPost()

  const filteredPosts = useMemo(() => {
    let posts = getPostsByCategory(activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      )
    }
    // Exclude featured from grid
    return posts.filter((p) => !p.featured || activeCategory !== 'All' || searchQuery.trim())
  }, [searchQuery, activeCategory])

  const showFeatured = !searchQuery.trim() && activeCategory === 'All'

  return (
    <>
      {/* SEO Meta is set in metadata export below — this is a client component, 
          so meta is handled in a separate server component or layout */}
      <BlogHero
        onSearch={setSearchQuery}
        onCategoryChange={setActiveCategory}
        activeCategory={activeCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Featured Post */}
        <AnimatePresence mode="wait">
          {showFeatured && featuredPost && (
            <motion.section
              key="featured"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-extrabold text-slate-900">Featured Article</h2>
              </div>
              <BlogCard post={featuredPost} featured />
            </motion.section>
          )}
        </AnimatePresence>

        {/* All Posts Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-extrabold text-slate-900">
                {searchQuery.trim()
                  ? `Search results for "${searchQuery}"`
                  : activeCategory !== 'All'
                  ? `${activeCategory} Articles`
                  : 'Latest Articles'}
              </h2>
            </div>
            <span className="text-sm text-slate-400 font-medium">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filteredPosts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No articles found</h3>
                <p className="text-slate-400 text-sm">
                  Try a different search term or category.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPosts.map((post, index) => (
                  <BlogCard key={post.slug} post={post} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Stats Bar */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 bg-white rounded-3xl border border-slate-100 shadow-sm p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '6+', label: 'Finance Articles' },
              { number: '500+', label: 'Teen Readers' },
              { number: '100%', label: 'India Focused' },
              { number: 'Free', label: 'Always' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-blue-600 mb-1">{stat.number}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      <BlogNewsletter />
    </>
  )
}
