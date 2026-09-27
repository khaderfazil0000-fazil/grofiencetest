'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Clock, Calendar, Tag, ArrowLeft, ArrowRight,
  Share2, Bookmark, User,
} from 'lucide-react'
import { BLOG_AUTHORS } from '@/lib/blog-data'
import BlogCard from './BlogCard'

// Simple markdown-like renderer for the content
function renderContent(content) {
  const lines = content.trim().split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-extrabold text-slate-900 mt-10 mb-4 leading-tight">
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-bold text-slate-800 mt-8 mb-3">
          {line.replace('### ', '')}
        </h3>
      )
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-base font-bold text-slate-700 mt-6 mb-2">
          {line.replace('#### ', '')}
        </h4>
      )
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="my-6 pl-6 border-l-4 border-blue-500 bg-blue-50 py-4 pr-4 rounded-r-xl italic text-blue-900 font-medium text-lg">
          {line.replace('> ', '')}
        </blockquote>
      )
    } else if (line.startsWith('| ')) {
      // Table — collect all table rows
      const tableRows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableRows.push(lines[i].trim())
        i++
      }
      const headers = tableRows[0].split('|').filter((c) => c.trim()).map((c) => c.trim())
      const dataRows = tableRows.slice(2).map((r) =>
        r.split('|').filter((c) => c.trim()).map((c) => c.trim())
      )
      elements.push(
        <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                {headers.map((h, hi) => (
                  <th key={hi} className="px-4 py-3 text-left font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-slate-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    } else if (line.startsWith('- **') || line.startsWith('- ')) {
      // Collect list items
      const listItems = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push(lines[i].trim().replace(/^- /, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-3 text-slate-600">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ul>
      )
      continue
    } else if (line.match(/^\d+\. /)) {
      // Ordered list
      const listItems = []
      while (i < lines.length && lines[i].trim().match(/^\d+\. /)) {
        listItems.push(lines[i].trim().replace(/^\d+\. /, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-3 text-slate-600">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {li + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ol>
      )
      continue
    } else if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
      // Checklist
      const items = []
      while (i < lines.length && (lines[i].trim().startsWith('- [ ]') || lines[i].trim().startsWith('- [x]'))) {
        const checked = lines[i].includes('[x]')
        items.push({ text: lines[i].trim().replace(/^- \[.\] /, ''), checked })
        i++
      }
      elements.push(
        <ul key={`check-${i}`} className="my-4 space-y-2">
          {items.map((item, li) => (
            <li key={li} className="flex items-center gap-3 text-slate-600">
              <span className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center ${item.checked ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'}`}>
                {item.checked && '✓'}
              </span>
              {item.text}
            </li>
          ))}
        </ul>
      )
      continue
    } else if (line === '') {
      // skip blank lines
    } else {
      // Regular paragraph — handle inline **bold**
      elements.push(
        <p
          key={i}
          className="text-slate-600 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-800 font-bold">$1</strong>'),
          }}
        />
      )
    }
    i++
  }

  return elements
}

export default function BlogPostContent({ post, relatedPosts }) {
  const author = BLOG_AUTHORS[post.author]

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Article Header */}
      <div className={`bg-gradient-to-br ${post.coverGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-end pr-16 opacity-10 pointer-events-none">
          <span className="text-[200px] select-none">{post.coverEmoji}</span>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back link */}
          <Link href="/blog">
            <motion.div
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </motion.div>
          </Link>

          {/* Category */}
          <div className="mb-4">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/30">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6 max-w-3xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
                {author?.name?.charAt(0) || 'G'}
              </div>
              <div>
                <span className="font-semibold text-white">{author?.name}</span>
                <span className="mx-2 opacity-50">·</span>
                <span>{author?.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </div>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex gap-12">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Excerpt / Lead */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {post.excerpt}
              </p>
            </div>

            {/* Article Content */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 prose-custom">
              {renderContent(post.content)}
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Share & Bookmark */}
            <div className="mt-8 flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-sm font-semibold text-slate-600">Share this article:</span>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Author Bio */}
            {author && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">
                  {author.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">About the Author</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-0.5">{author.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold mb-2">{author.role}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{author.bio}</p>
                </div>
              </motion.div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                <div className="text-2xl mb-3">🚀</div>
                <h3 className="font-extrabold text-lg mb-2">Start Your Finance Journey</h3>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                  Track expenses, set goals, and build smart money habits with Grofience.
                </p>
                <Link href="/">
                  <button className="w-full bg-white text-blue-700 font-bold py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                    Get Started Free →
                  </button>
                </Link>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-extrabold text-slate-800 text-sm mb-4 flex items-center gap-2">
                    <BookmarkIcon />
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((rp) => (
                      <Link key={rp.slug} href={`/blog/${rp.slug}`}>
                        <div className="group flex gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rp.coverGradient} flex items-center justify-center text-lg flex-shrink-0`}>
                            {rp.coverEmoji}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                              {rp.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{rp.readTime} min read</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Posts — Bottom (mobile + all) */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">More Articles</h2>
              <Link href="/blog">
                <button className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rp, idx) => (
                <BlogCard key={rp.slug} post={rp} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function BookmarkIcon() {
  return (
    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7a2 2 0 00-2 2v16l7-3.5L19 21V5a2 2 0 00-2-2z" />
    </svg>
  )
}
