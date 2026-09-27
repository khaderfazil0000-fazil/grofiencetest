'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, Calendar, ArrowRight, Tag } from 'lucide-react'
import { BLOG_AUTHORS } from '@/lib/blog-data'

export default function BlogCard({ post, index = 0, featured = false }) {
  const author = BLOG_AUTHORS[post.author]

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500"
      >
        {/* Cover */}
        <div className={`relative h-72 bg-gradient-to-br ${post.coverGradient} overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl opacity-30 select-none">{post.coverEmoji}</span>
          </div>
          {/* Featured badge */}
          <div className="absolute top-5 left-5">
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/30">
              ⭐ Featured Article
            </span>
          </div>
          {/* Category */}
          <div className="absolute bottom-5 left-5">
            <span className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-slate-500 leading-relaxed mb-6 text-sm">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {author?.name?.charAt(0) || 'G'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{author?.name}</p>
                <p className="text-xs text-slate-400">{author?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>
          </div>

          <Link href={`/blog/${post.slug}`}>
            <motion.div
              whileHover={{ x: 4 }}
              className="mt-6 inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors"
            >
              Read Full Article
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
    >
      {/* Cover */}
      <Link href={`/blog/${post.slug}`}>
        <div className={`relative h-48 bg-gradient-to-br ${post.coverGradient} overflow-hidden cursor-pointer`}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl opacity-30 select-none">{post.coverEmoji}</span>
          </div>
          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {BLOG_AUTHORS[post.author]?.name?.charAt(0) || 'G'}
            </div>
            <span className="text-xs font-semibold text-slate-600">{BLOG_AUTHORS[post.author]?.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {post.readTime} min
          </div>
        </div>
      </div>
    </motion.article>
  )
}
