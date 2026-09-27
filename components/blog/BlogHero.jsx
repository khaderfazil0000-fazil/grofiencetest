'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen } from 'lucide-react'
import { BLOG_CATEGORIES } from '@/lib/blog-data'

export default function BlogHero({ onSearch, onCategoryChange, activeCategory }) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (e) => {
    setSearchValue(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1e40af] py-24 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6"
        >
          <BookOpen className="w-4 h-4 text-blue-300" />
          <span className="text-blue-200 text-sm font-semibold">Financial Literacy for Indian Teens</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5"
        >
          The Grofience{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
            Blog
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Practical money wisdom for Indian teenagers. Budgeting tips, SIP guides, UPI safety, 
          savings hacks — written specifically for you.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-lg mx-auto mb-10"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearch}
              placeholder="Search articles… e.g. 'SIP', 'UPI safety', 'budgeting'"
              className="w-full bg-white text-slate-800 pl-12 pr-5 py-4 rounded-2xl shadow-2xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-white text-blue-700 shadow-lg shadow-blue-900/30 scale-105'
                  : 'bg-white/10 backdrop-blur-sm text-blue-200 border border-white/20 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
