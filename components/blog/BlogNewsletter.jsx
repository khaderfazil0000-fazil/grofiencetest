'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Sparkles } from 'lucide-react'

export default function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1e40af] relative overflow-hidden">
      {/* Decorations */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-300" />
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-200 text-xs font-semibold">Weekly Finance Tips</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Get Weekly Money Tips{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              for Teens
            </span>
          </h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            Join 500+ Indian teenagers getting practical finance wisdom every week. 
            No spam, just actionable tips you can apply immediately.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-white font-bold text-lg mb-1">You're in!</h3>
              <p className="text-blue-200 text-sm">
                Welcome to the Grofience community. Check your email for a confirmation.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder:text-blue-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="bg-white text-blue-700 font-bold px-5 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap"
              >
                Subscribe Free
              </button>
            </form>
          )}

          <p className="text-blue-300/60 text-xs mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
