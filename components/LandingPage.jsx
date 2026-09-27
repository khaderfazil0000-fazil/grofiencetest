'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ShieldCheck, Sparkles, MessageCircle, ChevronDown, BookOpen,
  ArrowRight, Gamepad2, IndianRupee, Zap, Clock, Calendar, Menu, X, Home, Info, HelpCircle, Phone
} from 'lucide-react'
import { getLatestPosts, BLOG_AUTHORS } from '@/lib/blog-data'

const LOGO_URL = '/grofience-logo.png'

export default function LandingPage({ onGetStarted, onLogin }) {
  const [activeFaq, setActiveFaq] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleWhatsApp = () => {
    window.open('https://wa.me/?text=Hi%20Grofience!%20I%20want%20to%20know%20more%20about%20the%20teen%20financial%20literacy%20program.', '_blank')
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const faqs = [
    {
      q: 'What age group is Grofience designed for?',
      a: 'Grofience is engineered specifically for teenagers aged 13 to 19, focusing on practical money habits, budgeting, and financial decision-making suitable for Indian teens.'
    },
    {
      q: 'How is Grofience tailored to the Indian financial system?',
      a: 'Unlike US/UK finance apps, Grofience is 100% India-focused. We cover UPI payment habits, Indian fixed deposits (FD), Systematic Investment Plans (SIPs), EMIs, and real Indian middle-class money scenarios.'
    },
    {
      q: 'How do parents track their teen’s progress?',
      a: 'Parents receive monthly insight reports summarizing savings habits, budget adherence, and completed goals without invading the teen’s privacy.'
    },
    {
      q: 'Are the financial games and simulations really coming soon?',
      a: 'Yes! Our interactive virtual SIP runner, salary month survival game, and stock market simulator are currently in final development and launching very soon.'
    },
    {
      q: 'Is Grofience free to use?',
      a: 'Teens can get started completely free to track expenses, set savings goals, and unlock rewards as they build lifelong financial discipline.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* ── TOP HEADER / NAVIGATION ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img src={LOGO_URL} alt="Grofience" className="h-9 sm:h-10 w-auto object-contain" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('home')} className="hover:text-blue-600 transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-600 transition-colors">About</button>
            <button onClick={() => scrollToSection('why-grofience')} className="hover:text-blue-600 transition-colors">Why Grofience</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-blue-600 transition-colors">Testimonials</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-blue-600 transition-colors">FAQ</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-blue-600 transition-colors">Contact</button>
            <Link href="/blog" className="hover:text-blue-600 transition-colors text-blue-600 font-bold">Blog</Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Us</span>
            </button>
            <button
              onClick={onLogin || onGetStarted}
              className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Right: Get Started + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onLogin || onGetStarted}
              className="inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5 text-slate-700" />
                  </motion.span>
                ) : (
                  <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5 text-slate-700" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-white border-t border-slate-100 shadow-xl"
            >
              <div className="px-4 pt-4 pb-6 space-y-1">
                {/* Nav Links */}
                {[
                  { label: 'Home', section: 'home' },
                  { label: 'About', section: 'about' },
                  { label: 'Why Grofience', section: 'why-grofience' },
                  { label: 'Testimonials', section: 'testimonials' },
                  { label: 'FAQ', section: 'faq' },
                  { label: 'Contact', section: 'contact' },
                ].map((item) => (
                  <button
                    key={item.section}
                    onClick={() => { scrollToSection(item.section); setMobileMenuOpen(false) }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  📝 Blog
                </Link>

                {/* Divider */}
                <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
                  {/* WhatsApp */}
                  <button
                    onClick={() => { handleWhatsApp(); setMobileMenuOpen(false) }}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors active:scale-95 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    WhatsApp Us
                  </button>
                  {/* Get Started */}
                  <button
                    onClick={() => { (onLogin || onGetStarted)?.(); setMobileMenuOpen(false) }}
                    className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-95 shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── STATS BANNER (WHITE BACKGROUND AS IN PDF) ── */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-100">
            
            {/* Stat 1 */}
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2563eb] tracking-tight">100+</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">TEENS EMPOWERED</div>
            </div>

            {/* Stat 2 */}
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2563eb] tracking-tight">100+</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">FAMILIES TRUSTED</div>
            </div>

            {/* Stat 3 */}
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2563eb] tracking-tight flex items-center justify-center gap-1">
                <span>4.9/5</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">PARENT RATING</div>
            </div>

            {/* Stat 4 */}
            <div className="px-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2563eb] tracking-tight">₹1,00,000+</div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">MOCK PORTFOLIOS RUN</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HERO SECTION ── */}
      <section id="home" className="relative py-16 sm:py-20 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            <span className="text-[#2563eb]">financially confident</span><br />
            before entering adulthood.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We saw a generation walking into salaries, EMIs, and investments without a map. Grofience is that map — a <span className="font-semibold text-slate-900 underline decoration-blue-500/40">practical, parent-trusted</span> program that turns money into a habit.
          </p>

          {/* CTA Row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-base px-8 py-3.5 rounded-full shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Start Free Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-base px-8 py-3.5 rounded-full shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              <span>Talk to Parent Counselor</span>
            </button>
          </div>

          {/* 3 HERO VALUE CARDS (EXACT STYLING AS PDF) */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs relative">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Parent-trusted</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Designed with parents, verified by educators.</p>
            </div>

            {/* Card 2 (India-first with yellow floating India - Focused badge) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs relative mt-4 sm:mt-0">
              
              {/* Yellow floating India - Focused callout badge */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                className="absolute -top-3.5 right-4 z-20"
              >
                <div className="relative bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-amber-400/30 border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>India - Focused</span>
                  <div className="absolute -bottom-1 right-4 w-2 h-2 bg-yellow-400 rotate-45" />
                </div>
              </motion.div>

              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center mb-4">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">India-first</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Built for UPI, FD, EMI, SIPs — no US/UK textbooks.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs relative">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Habit-driven</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Confidence comes from rituals, not lectures.</p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ENGAGING CURRICULUM SECTION (WHITE CARDS AS IN PDF) ── */}
      <section id="why-grofience" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              We don't lecture teens.<br />
              <span className="text-[#2563eb]">We engage them.</span>
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Every module is engineered for the way Indian teens think, scroll, and decide — so the money mindset sticks long after the session ends.
            </p>
          </div>

          {/* 2 Feature Cards Grid (Both White Cards with subtle borders as in PDF) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Teen-First Activities */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col justify-between relative">
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    INTERACTIVE
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">Teen-First Activities</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Hands-on exercises designed the way teens actually learn — short, visual, story-led, built around real-Indian money scenarios.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                  Money story circles
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                  Real-world case decks
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                  Peer challenges
                </span>
              </div>
            </div>

            {/* Card 2: Financial Games & Simulations (WITH ATTRACTIVE FLOATING COMING SOON BADGE ABOVE) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col justify-between relative mt-4 sm:mt-0">
              
              {/* ATTRACTIVE FLOATING "COMING SOON" BUBBLE FLOATING ABOVE THE CARD */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute -top-4 right-4 sm:right-6 z-20"
              >
                <div className="relative bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-lg shadow-amber-400/40 border border-amber-300 flex items-center gap-1.5 tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span className="font-extrabold text-[11px]">COMING SOON</span>
                  {/* Speech bubble pointer triangle */}
                  <div className="absolute -bottom-1 right-5 w-2.5 h-2.5 bg-yellow-400 rotate-45 rounded-2xs" />
                </div>
              </motion.div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    VERIFIED
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">Financial Games & Simulations</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Run a virtual SIP. Survive a salary month. Beat the EMI boss. Learning sticks when teens wish, lose, and try again.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                  Stock market sim
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                  Market games
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                  Compound interest quests
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="py-16 bg-[#f8fafc] border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              From Bengaluru to Kochi to Delhi, families are watching their teens transform from anxious spenders into confident planners.
            </p>
          </div>

          {/* 4 Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Card 1: Rakesh Iyer (CIRCLED IN RED IN PDF - FEATURED HIGHLIGHT) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-red-400/80 shadow-md relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                ★ Highlighted Review
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563eb] font-bold text-xs flex items-center justify-center">
                  RI
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Rakesh Iyer</h4>
                  <p className="text-xs text-slate-500">Parent of 14 yr old · Mumbai</p>
                </div>
              </div>

              <div className="flex text-amber-400 gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 text-xs sm:text-sm italic leading-relaxed">
                "The team is warm, professional, and they actually understand Indian middle-class realities. Highly recommended."
              </p>
            </div>

            {/* Card 2: Divya Shetty */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563eb] font-bold text-xs flex items-center justify-center">
                  DS
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Divya Shetty</h4>
                  <p className="text-xs text-slate-500">Parent of 15 yr old · Pune</p>
                </div>
              </div>

              <div className="flex text-amber-400 gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 text-xs sm:text-sm italic leading-relaxed">
                "She used to spend her entire allowance in 3 days. Now she has goals, savings, and a real plan. Proud parent moment."
              </p>
            </div>

            {/* Card 3: Vikram Nair */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563eb] font-bold text-xs flex items-center justify-center">
                  VN
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Vikram Nair</h4>
                  <p className="text-xs text-slate-500">Parent of 16 yr old · Chennai</p>
                </div>
              </div>

              <div className="flex text-amber-400 gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 text-xs sm:text-sm italic leading-relaxed">
                "They make money feel exciting and within reach. My son is genuinely curious now."
              </p>
            </div>

            {/* Card 4: Meera Joshi */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563eb] font-bold text-xs flex items-center justify-center">
                  MJ
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Meera Joshi</h4>
                  <p className="text-xs text-slate-500">Parent of 13 yr old · Ahmedabad</p>
                </div>
              </div>

              <div className="flex text-amber-400 gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 text-xs sm:text-sm italic leading-relaxed">
                "He's heading to college next year and I'm not anxious anymore. Grofience gave him the confidence I wish I had at his age."
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-slate-900 flex items-center justify-between text-sm sm:text-base hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── BLOG TEASER SECTION ── */}
      <section className="py-20 bg-gradient-to-br from-[#f0f7ff] to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Grofience Blog
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Latest Money Tips for Teens
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              Practical, India-focused financial wisdom written just for you. Read. Learn. Grow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {getLatestPosts(3).map((post, idx) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className={`h-40 bg-gradient-to-br ${post.coverGradient} relative overflow-hidden cursor-pointer`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-7xl opacity-25 select-none">{post.coverEmoji}</span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/90 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                          {BLOG_AUTHORS[post.author]?.name?.charAt(0) || 'G'}
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{BLOG_AUTHORS[post.author]?.name?.split(' ')[0]}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {post.readTime} min
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-8 py-3.5 rounded-full shadow-lg transition-all text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Explore All Articles
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-slate-500 py-8 text-xs border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Grofience" className="h-7 w-auto object-contain" />
            <span>© {new Date().getFullYear()} Grofience. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-500">
            <button onClick={() => scrollToSection('home')} className="hover:text-slate-900 transition">Home</button>
            <button onClick={() => scrollToSection('why-grofience')} className="hover:text-slate-900 transition">Why Grofience</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-slate-900 transition">Testimonials</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-slate-900 transition">FAQ</button>
            <Link href="/blog" className="hover:text-blue-600 transition font-semibold text-blue-500">Blog</Link>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP BUTTON (AS IN PDF) ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleWhatsApp}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
          title="WhatsApp Support"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
        </button>
      </div>

    </div>
  )
}
