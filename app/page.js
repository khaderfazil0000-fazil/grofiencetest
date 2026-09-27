'use client'

import dynamic from 'next/dynamic'
const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false })

import LandingPage from '@/components/LandingPage'
import { UIIcon } from '@/components/UIIcon'
import { useState, useEffect, useMemo, useRef, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Target, FileText, Settings, LogOut, Bell, Search,
  Plus, Trash2, Edit2, TrendingUp, TrendingDown, Wallet, PiggyBank,
  Award, Flame, Zap, Trophy, Crown, Star, Menu, X, Moon, Sun,
  ChevronRight, Download, Calendar, Sparkles, Eye, EyeOff, ShieldCheck, BookOpen, Lock, User,
  Users, MessageCircle, Heart, Share2, ThumbsUp, Lightbulb, BookMarked, Send,
  MessageSquare,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

const LOGO_URL = '/grofience-logo.png'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const CATEGORIES = ['Snacks','Gaming','Shopping','Education','Travel','Savings','Others','Allowance']
const CAT_COLORS = {
  Snacks: '#f59e0b', Gaming: '#8b5cf6', Shopping: '#ec4899',
  Education: '#10b981', Travel: '#06b6d4', Savings: '#3b82f6',
  Others: '#64748b', Allowance: '#22c55e',
}
const QUOTES = [
  'Small savings today, big dreams tomorrow.',
  "Don't watch the clock; do what it does. Keep going.",
  'A budget is telling your money where to go.',
  'Wealth is the ability to fully experience life.',
  'Save money and money will save you.',
]

// ============= GLOBAL NOTIFICATION CONTEXT =============
const NotifContext = createContext(null)
function useNotif() { return useContext(NotifContext) }

function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState([])
  const [popups, setPopups] = useState([])

  const push = useCallback((notif) => {
    const id = `notif-${Date.now()}-${Math.random()}`
    const item = { id, time: new Date().toISOString(), ...notif }
    setNotifs(prev => [item, ...prev].slice(0, 30))
    setPopups(prev => [item, ...prev].slice(0, 5))
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 5000)
  }, [])

  const dismiss = useCallback((id) => setPopups(prev => prev.filter(p => p.id !== id)), [])
  const clearAll = useCallback(() => setNotifs([]), [])

  return (
    <NotifContext.Provider value={{ notifs, push, clearAll }}>
      {children}
      <div className="fixed bottom-24 right-4 z-[200] flex flex-col-reverse gap-2 pointer-events-none" style={{maxWidth: '300px'}}>
        <AnimatePresence>
          {popups.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 80, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto w-72 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
            >
              <div className={`h-1 w-full ${p.accentColor || 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
              <div className="flex items-start gap-3 p-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${p.iconBg || 'bg-blue-100'}`}>
                  <UIIcon icon={p.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</div>
                </div>
                <button onClick={() => dismiss(p.id)} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0 -mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotifContext.Provider>
  )
}

// ============= CURRENCY =============
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$', AUD: 'A$' }
function useCurrency(user) {
  const code = user?.currency || 'INR'
  const sym = CURRENCY_SYMBOLS[code] || code
  const fmt = (amount) => `${sym}${Number(amount || 0).toLocaleString()}`
  return { sym, fmt, code }
}

// ============= LOGO COMPONENT =============
function Logo({ className = '', priority = false }) {
  // Transparent PNG — no blend tricks needed, renders crisp on any background
  return (
    <img
      src={LOGO_URL}
      alt="Grofience"
      crossOrigin="anonymous"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-contain w-auto select-none ${className}`}
      draggable={false}
    />
  )
}

// Text-based logo for PDF (avoids CORS/canvas issues)
function TextLogo({ size = 28, dark = false }) {
  return (
    <span style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 800, fontSize: `${size}px`, lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap', display: 'inline-block' }}>
      <span style={{ color: '#3b82f6' }}>gro</span><span style={{ color: dark ? '#ffffff' : '#0f172a' }}>fience</span>
    </span>
  )
}

// API call helper
async function api(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('grofience_token') : null
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// Wait for all images inside a node to fully load (so html2canvas captures them)
async function waitForImages(node) {
  const imgs = Array.from(node.querySelectorAll('img'))
  await Promise.all(imgs.map(img => {
    if (img.complete && img.naturalHeight > 0) return Promise.resolve()
    return new Promise(resolve => {
      const done = () => resolve()
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
      // safety timeout
      setTimeout(done, 3000)
    })
  }))
}

// ============= SPLASH =============
function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 px-6"
      >
        <Logo priority className="h-16 sm:h-20 md:h-24 lg:h-28 max-w-[80vw]" />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm md:text-base font-semibold tracking-[0.3em] text-blue-600">GROW · FINANCE · CONFIDENCE</p>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.6, delay: 0.4 }}
          className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full max-w-[200px]"
        />
      </motion.div>
    </motion.div>
  )
}

// ============= FORGOT PASSWORD MODAL =============
function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState(null)
  const [emailRestricted, setEmailRestricted] = useState(false)
  const [via, setVia] = useState(null)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setStep(1); setEmail(''); setOtp(''); setDevOtp(null); setVia(null)
    setEmailRestricted(false)
    setNewPw(''); setConfirmPw(''); setShowPw(false)
    setLoading(false); setError('')
  }

  function handleClose() { onClose(); setTimeout(reset, 300) }

  async function sendOtp(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return }

      // Email not found — stay on step 1
      if (data.notFound) {
        setError('No account found with this email. Please check and try again.')
        return
      }

      // Resend free-plan restriction or dev mode — OTP shown on screen
      if (data.devOtp) {
        setDevOtp(data.devOtp)
        setOtp(data.devOtp)
        setEmailRestricted(!!data.emailRestricted)
      }
      if (data.via) setVia(data.via)
      setStep(2)
    } catch { setError('Network error. Please try again.') } finally { setLoading(false) }
  }

  async function resetPassword(e) {
    e.preventDefault()
    if (newPw !== confirmPw) { setError('Passwords do not match'); return }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      setStep(3)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">

        {/* STEP 1 — Enter Email */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">🔐</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Forgot Password</h2>
                <p className="text-xs text-gray-500">We'll send a 6-digit OTP to your email</p>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  required type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                {loading ? '⏳ Sending OTP...' : '📨 Send OTP'}
              </button>
              <button type="button" onClick={handleClose} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">Cancel</button>
            </form>
          </>
        )}

        {/* STEP 2 — Enter OTP + New Password */}
        {step === 2 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">📲</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Enter OTP</h2>
                <p className="text-xs text-gray-500">Sent to <strong>{email}</strong></p>
              </div>
            </div>

            {/* Resend free-plan restriction banner */}
            {devOtp && emailRestricted && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="text-xs font-bold text-orange-800 mb-1">Email delivery limited (Resend free plan)</p>
                    <p className="text-xs text-orange-700">Resend's free plan can only send emails to the account owner (<strong>thegrofience@gmail.com</strong>). Your OTP has been generated and is shown below — copy it to continue.</p>
                  </div>
                </div>
                <div className="mt-2 bg-white border border-orange-200 rounded-lg py-2 text-center">
                  <p className="text-xs text-orange-600 mb-0.5">Your OTP</p>
                  <p className="text-3xl font-black text-blue-600 tracking-[8px]">{devOtp}</p>
                </div>
              </div>
            )}

            {/* Dev-mode OTP banner (no email restriction) */}
            {devOtp && !emailRestricted && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-center">
                <p className="text-xs text-amber-700 font-medium mb-1">🛠️ Dev Mode — No email configured. Your OTP:</p>
                <p className="text-3xl font-black text-blue-600 tracking-[8px]">{devOtp}</p>
                <p className="text-[10px] text-amber-600 mt-1">Already filled in below for you.</p>
              </div>
            )}

            {/* Sent via confirmation */}
            {!devOtp && via && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-4 text-center">
                <p className="text-xs text-blue-700">
                  {via === 'sms' ? '📱 OTP sent via SMS — check your phone' : '✅ OTP sent to your email — check your inbox'}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-3">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <form onSubmit={resetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">6-Digit OTP</label>
                <input
                  required type="text" inputMode="numeric" maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-[8px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                <div className="relative">
                  <input
                    required type={showPw ? 'text' : 'password'} value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password</label>
                <input
                  required type="password" value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm mt-1">
                {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); setDevOtp(null) }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">← Back</button>
            </form>
          </>
        )}

        {/* STEP 3 — Success */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-sm text-gray-500 mb-6">Your password has been updated successfully. You can now log in with your new password.</p>
            <button onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all">
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ============= AUTH =============
function AuthPage({ onLogin, onBackToLanding }) {
  const [forgotOpen, setForgotOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* ── LEFT PANEL ── decorative gradient side */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 45%, #4f46e5 100%)' }}>

        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-[480px] h-[480px] bg-white rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-blue-300 rounded-full blur-3xl" />
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/3 right-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Logo top-left */}
        <div className="relative z-10 p-10 flex items-center justify-between">
          <div onClick={onBackToLanding} className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 inline-flex items-center border border-white/20 shadow-xl cursor-pointer hover:bg-white/25 transition">
            <Logo priority className="h-10" />
          </div>
          {onBackToLanding && (
            <button onClick={onBackToLanding} className="text-white/80 hover:text-white text-xs font-semibold bg-white/10 border border-white/20 rounded-full px-4 py-2 transition">
              ← Back to Website
            </button>
          )}
        </div>

        {/* Main hero text */}
        <div className="relative z-10 px-10 pb-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Master Money.<br />
              <span className="text-blue-200">Master Life.</span>
            </h1>
            <p className="mt-4 text-lg text-blue-100 leading-relaxed max-w-sm">
              The gamified way for teens to take control of their money — track, save, and level up.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex gap-4 flex-wrap">
            {[
              { icon: TrendingUp, label: 'Track Income & Expenses', color: 'from-blue-400/30 to-blue-500/20' },
              { icon: Target, label: 'Crush Your Goals', color: 'from-indigo-400/30 to-indigo-500/20' },
              { icon: Trophy, label: 'Earn XP & Badges', color: 'from-violet-400/30 to-violet-500/20' },
            ].map((f, i) => (
              <motion.div key={f.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className={`flex items-center gap-2.5 bg-gradient-to-r ${f.color} backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5`}>
                <f.icon className="w-4 h-4 text-blue-200 flex-shrink-0" />
                <span className="text-sm text-white font-medium">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 px-10 pb-10">
          <p className="text-sm text-blue-200 italic opacity-70">"{QUOTES[0]}"</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── login / signup form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-[420px]">

          <AuthTabs onLogin={onLogin} forgotOpen={forgotOpen} setForgotOpen={setForgotOpen} />

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Having trouble? Use the <button onClick={() => setForgotOpen(true)} className="text-blue-500 hover:underline font-medium">Forgot Password</button> option above to reset your account.
          </p>
        </motion.div>
      </div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  )
}

// ============= AUTH TABS (Login + Signup) =============
function AuthTabs({ onLogin, forgotOpen, setForgotOpen }) {
  const [tab, setTab] = useState('login')

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo priority className="h-12 sm:h-14" />
      </div>
      <div className="h-px bg-gray-100 mb-6" />

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setTab('signup')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'signup' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Create Account
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'login' ? (
          <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
            <LoginForm onLogin={onLogin} onForgot={() => setForgotOpen(true)} />
          </motion.div>
        ) : (
          <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <SignupForm onLogin={onLogin} onSwitchToLogin={() => setTab('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============= LOGIN FORM =============
function LoginForm({ onLogin, onForgot }) {
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [login, setLogin] = useState({ email: '', password: '', remember: true })
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api('auth/login', { method: 'POST', body: JSON.stringify(login) })
      if (login.remember) {
        localStorage.setItem('grofience_token', data.token)
      } else {
        sessionStorage.setItem('grofience_token', data.token)
        localStorage.removeItem('grofience_token')
      }
      toast.success(`Welcome back, ${data.user.username}! 🎉`)
      onLogin(data.user)
    } catch (e) {
      setError(e.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your Grofience account</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <span className="text-base leading-none mt-0.5">⚠️</span>
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email or Username</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></div>
            <input
              required type="text" value={login.email}
              onChange={e => setLogin({ ...login, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-4 h-4" /></div>
            <input
              required type={showPw ? 'text' : 'password'} value={login.password}
              onChange={e => setLogin({ ...login, password: e.target.value })}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <Checkbox
              id="remember-me"
              checked={login.remember}
              onCheckedChange={v => setLogin({ ...login, remember: v })}
              className="rounded-md"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
          </label>
          <button type="button" onClick={onForgot}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors">
            Forgot password?
          </button>
        </div>

        <motion.button
          type="submit" disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Signing in...
            </>
          ) : (
            <>Sign In <ChevronRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">SECURE LOGIN</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Protected with JWT &amp; bcrypt encryption</span>
      </div>
    </>
  )
}

// ============= PRIVACY POLICY MODAL =============
function PrivacyPolicyModal({ open, onClose, onAgree }) {
  const [hasRead, setHasRead] = useState(false)
  const scrollRef = useRef(null)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40
    if (atBottom) setHasRead(true)
  }

  // Reset read state each time modal opens
  useEffect(() => { if (open) setHasRead(false) }, [open])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="policy-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
            style={{ maxHeight: '88vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">Privacy Policy &amp; Terms</h2>
                  <p className="text-xs text-blue-100">Grofience — Student Finance Platform</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Scroll hint */}
            {!hasRead && (
              <div className="flex items-center gap-2 px-6 py-2 bg-amber-50 border-b border-amber-100">
                <span className="text-amber-500 text-base">📜</span>
                <p className="text-xs text-amber-700 font-medium">Please read through the full policy to continue</p>
              </div>
            )}
            {hasRead && (
              <div className="flex items-center gap-2 px-6 py-2 bg-emerald-50 border-b border-emerald-100">
                <span className="text-emerald-500 text-base">✅</span>
                <p className="text-xs text-emerald-700 font-medium">You've read the full policy — you can now agree!</p>
              </div>
            )}

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm text-gray-700"
              style={{ overscrollBehavior: 'contain' }}
            >
              <div>
                <p className="text-xs text-gray-400 mb-4">Last updated: July 2025 &nbsp;·&nbsp; Version 1.0</p>
                <p className="leading-relaxed">Welcome to <strong>Grofience</strong>, a financial literacy platform designed for students and teenagers. By creating an account, you agree to the following Privacy Policy and Terms of Service. Please read them carefully before proceeding.</p>
              </div>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">🔐 1. Data We Collect</h3>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li><strong>Account information:</strong> Full name, username, email address, and password (stored encrypted with bcrypt).</li>
                  <li><strong>Profile details:</strong> Age, phone number, and parent/guardian email (all optional).</li>
                  <li><strong>Financial data:</strong> Budget entries, goals, savings records, and spending categories you create within the app.</li>
                  <li><strong>Usage data:</strong> Login timestamps, feature usage, and device/browser type for analytics and security.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">🎯 2. How We Use Your Data</h3>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li>To provide and personalize your Grofience experience.</li>
                  <li>To generate parent/guardian progress reports (if a parent email is provided).</li>
                  <li>To send important account notifications such as email verification and password reset links.</li>
                  <li>To improve the platform through anonymized analytics.</li>
                  <li>We <strong>never</strong> sell your personal data to third parties.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">🔒 3. Data Security</h3>
                <p className="text-gray-600 leading-relaxed">All passwords are hashed using <strong>bcrypt</strong> before storage. Sessions are managed with <strong>JSON Web Tokens (JWT)</strong>. Data is transmitted over HTTPS. We regularly review our security practices to protect your information.</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">👨‍👩‍👧 4. Parental Consent &amp; Minors</h3>
                <p className="text-gray-600 leading-relaxed">Grofience is designed for students aged 8–25. If you are under 13, we require a parent or guardian email address to be provided. Parents can request access to their child's progress report at any time by contacting us. By registering, you (or your parent/guardian) consent to the collection and use of data as described in this policy.</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">🌐 5. Cookies &amp; Local Storage</h3>
                <p className="text-gray-600 leading-relaxed">We use <strong>browser local storage</strong> to store your authentication token so you stay logged in across sessions. No third-party advertising cookies are used. You may clear local storage at any time to log out.</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">📖 6. Terms of Use</h3>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li>You must provide accurate information when creating an account.</li>
                  <li>You are responsible for maintaining the confidentiality of your password.</li>
                  <li>You agree not to use the platform for any unlawful purpose.</li>
                  <li>Grofience reserves the right to suspend accounts that violate our community guidelines.</li>
                  <li>The financial tools provided are for <strong>educational purposes only</strong> and do not constitute financial advice.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">✏️ 7. Your Rights</h3>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                  <li><strong>Access:</strong> You can view all data associated with your account in the Settings page.</li>
                  <li><strong>Correction:</strong> You can update your profile information at any time.</li>
                  <li><strong>Deletion:</strong> You can request account deletion by contacting support. All personal data will be permanently removed within 30 days.</li>
                  <li><strong>Portability:</strong> You can export your financial data from the Settings page.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">📬 8. Contact Us</h3>
                <p className="text-gray-600 leading-relaxed">If you have questions about this Privacy Policy or your data, please contact us at <strong className="text-blue-600">support@grofience.com</strong>. We will respond within 5 business days.</p>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">🔄 9. Policy Updates</h3>
                <p className="text-gray-600 leading-relaxed">We may update this Privacy Policy from time to time. When we do, we will notify you via email and update the "Last updated" date at the top of this document. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
              </section>

              <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50">
                <p className="text-xs text-blue-700 text-center">By clicking <strong>"I Agree"</strong> below, you confirm that you have read, understood, and agree to Grofience's Privacy Policy and Terms of Service.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={() => { onAgree(); onClose() }}
                disabled={!hasRead}
                whileHover={{ scale: hasRead ? 1.02 : 1 }}
                whileTap={{ scale: hasRead ? 0.97 : 1 }}
                className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: hasRead
                    ? 'linear-gradient(135deg, #2563eb, #4f46e5)'
                    : '#d1d5db',
                  cursor: hasRead ? 'pointer' : 'not-allowed',
                  boxShadow: hasRead ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
                }}
              >
                {!hasRead ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Read to unlock
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    I Agree
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============= SIGNUP FORM =============
function SignupForm({ onLogin, onSwitchToLogin }) {
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const recaptchaRef = useRef(null)
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
    age: '', phone: '', parentEmail: '',
  })

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (!agreedToPolicy) { setError('Please read and agree to the Privacy Policy to continue.'); return }
    if (!recaptchaToken) { setError('Please complete the reCAPTCHA verification.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const data = await api('auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          age: form.age ? Number(form.age) : null,
          phone: form.phone.trim() || null,
          parentEmail: form.parentEmail.trim() || null,
        }),
      })
      localStorage.setItem('grofience_token', data.token)
      toast.success(`Welcome to Grofience, ${data.user.username}! 🎉`)
      onLogin(data.user)
    } catch (e) {
      const msg = e.message || ''
      if (msg.includes('EMAIL_EXISTS')) setError('This email is already registered. Please sign in instead.')
      else if (msg.includes('USERNAME_EXISTS')) setError('That username is taken. Please choose another.')
      else setError(msg || 'Registration failed. Please try again.')
      // Reset reCAPTCHA on error so user can retry
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    } finally { setLoading(false) }
  }

  return (
    <>
      <PrivacyPolicyModal
        open={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        onAgree={() => setAgreedToPolicy(true)}
      />

      <div className="mb-5">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create your account 🚀</h1>
        <p className="mt-1 text-sm text-gray-500">Join Grofience and start your financial journey</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
          <span className="text-base leading-none mt-0.5">⚠️</span>
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
          <input
            required type="text" value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
            <input
              required type="text" value={form.username}
              onChange={e => set('username', e.target.value.replace(/\s/g, '').toLowerCase())}
              placeholder="johndoe"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
          <input
            required type="email" value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
          <div className="relative">
            <input
              required type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
          <div className="relative">
            <input
              required type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Age <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
            <input
              type="number" min="8" max="25" value={form.age}
              onChange={e => set('age', e.target.value)}
              placeholder="16"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
            <input
              type="tel" value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+91 98765..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Parent's Email <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
          <input
            type="email" value={form.parentEmail}
            onChange={e => set('parentEmail', e.target.value)}
            placeholder="parent@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
          />
        </div>

        {/* ── Privacy Policy Checkbox ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
            agreedToPolicy
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
          }`}
          onClick={() => {
            if (!agreedToPolicy) {
              setShowPolicyModal(true)
            } else {
              setAgreedToPolicy(false)
            }
          }}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              agreedToPolicy
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-gray-300 bg-white'
            }`}
          >
            {agreedToPolicy && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
              >
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-snug">
              I have read and agree to the{' '}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowPolicyModal(true) }}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Privacy Policy &amp; Terms of Service
              </button>
            </p>
            {!agreedToPolicy && (
              <p className="text-xs text-gray-400 mt-0.5">Click to read the full policy before agreeing</p>
            )}
            {agreedToPolicy && (
              <p className="text-xs text-emerald-600 mt-0.5 font-medium">✓ Policy accepted</p>
            )}
          </div>
        </motion.div>

        {/* ── reCAPTCHA ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border px-4 py-3 transition-all ${
            recaptchaToken
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Human Verification
          </p>
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
              onErrored={() => setRecaptchaToken(null)}
              theme="light"
            />
          </div>
          {recaptchaToken && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-emerald-600 font-medium text-center mt-2"
            >
              ✓ Verification complete
            </motion.p>
          )}
        </motion.div>

        <motion.button
          type="submit" disabled={loading || !agreedToPolicy || !recaptchaToken}
          whileHover={{ scale: (loading || !agreedToPolicy || !recaptchaToken) ? 1 : 1.01 }}
          whileTap={{ scale: (loading || !agreedToPolicy || !recaptchaToken) ? 1 : 0.98 }}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all text-sm flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Creating account...
            </>
          ) : (
            <>Create Account <ChevronRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">SECURE SIGNUP</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Protected with JWT &amp; bcrypt encryption</span>
      </div>
    </>
  )
}

// ============= SIDEBAR =============
function Sidebar({ active, setActive, onLogout, mobileOpen, setMobileOpen }) {
  const [monthsOpen, setMonthsOpen] = useState(true)
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'ebook', label: 'E-Book', icon: BookOpen },
    { id: 'certificate', label: 'Certificate', icon: Trophy },
    { id: 'parent', label: 'Parent Report', icon: FileText },
    { id: 'community', label: 'Teen Community', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-blue-100 z-40 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 flex flex-col`}
      >
        {/* Logo — click to go home */}
        <div className="px-6 py-5 border-b border-blue-100 flex items-center justify-between">
          <button
            onClick={() => { setActive('dashboard'); setMobileOpen(false) }}
            className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="Go to Dashboard"
          >
            <Logo priority className="h-10 lg:h-11 max-w-[180px]" />
          </button>
          <button className="lg:hidden p-1 rounded-lg hover:bg-blue-50" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.slice(0, 1).map(it => (
            <SidebarItem key={it.id} item={it} active={active === it.id} onClick={() => { setActive(it.id); setMobileOpen(false) }} />
          ))}

          {/* Months collapsible */}
          <button
            onClick={() => setMonthsOpen(!monthsOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 mt-2"
          >
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> MONTHS</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${monthsOpen ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {monthsOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => { setActive(`month-${i}`); setMobileOpen(false) }}
                    className={`w-full flex items-center gap-3 px-6 py-2 text-sm rounded-lg my-0.5 transition-all ${active === `month-${i}` ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-200' : 'text-gray-600 hover:bg-blue-50'}`}
                  >
                    <span className="text-xs font-bold w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span>{m}</span>
                    {active === `month-${i}` && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2">
            {items.slice(1).map(it => (
              <SidebarItem key={it.id} item={it} active={active === it.id} onClick={() => { setActive(it.id); setMobileOpen(false) }} />
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-blue-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.aside>
    </>
  )
}

function SidebarItem({ item, active, onClick }) {
  return (
    <motion.button
      whileHover={{ x: 3 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all relative ${active ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-blue-50'}`}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.label}</span>
      {active && (
        <motion.div layoutId="active-pill" className="absolute right-3">
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      )}
    </motion.button>
  )
}

// ============= NOTIFICATION BELL =============
function NotificationBell({ user, transactions, goals, analytics }) {
  const { notifs, clearAll } = useNotif()
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => { if (!open) setUnreadCount(prev => prev + (notifs.length > 0 ? 1 : 0)) }, [notifs])

  function handleOpen() { setOpen(o => !o); if (!open) setUnreadCount(0) }

  const items = useMemo(() => {
    if (notifs.length > 0) return notifs.slice(0, 15)
    const list = []
    ;(user?.badges || []).slice(0, 3).forEach(b => {
      list.push({ id: `badge-${b}`, icon: '/icons/6.png', title: 'Badge unlocked!', desc: `You earned the "${b}" badge`, time: 'Recent', iconBg: 'bg-amber-100' })
    })
    goals.forEach(g => {
      if (g.target > 0) {
        const pct = (g.saved / g.target) * 100
        if (pct >= 100) list.push({ id: `goal-done-${g.id}`, icon: '/icons/7.png', title: 'Goal completed!', desc: `${g.emoji} ${g.title} hit 100%`, time: 'Recent', iconBg: 'bg-emerald-100' })
        else if (pct >= 75) list.push({ id: `goal-near-${g.id}`, icon: '🔥', title: 'Almost there!', desc: `${g.emoji} ${g.title} is ${Math.round(pct)}% done`, time: 'Recent', iconBg: 'bg-rose-100' })
      }
    })
    if (user?.level && user.level >= 2) list.push({ id: `level-${user.level}`, icon: '👑', title: `Level ${user.level} reached!`, desc: `You're crushing it with ${user.xp} XP`, time: 'Recent', iconBg: 'bg-violet-100' })
    if (transactions.length > 0) {
      const t = transactions[0]
      list.push({ id: `tx-${t.id}`, icon: t.type === 'income' ? '💰' : '🛒', title: t.type === 'income' ? 'Income logged' : 'Expense logged', desc: `${t.type === 'income' ? '+' : '-'}₹${t.amount} · ${t.category}`, time: t.date, iconBg: t.type === 'income' ? 'bg-emerald-100' : 'bg-rose-100' })
    }
    if (analytics?.savingsRate >= 30) list.push({ id: 'rate-good', icon: '/icons/28.png', title: 'Excellent saver!', desc: `${Math.round(analytics.savingsRate)}% savings rate`, time: 'This month', iconBg: 'bg-blue-100' })
    if (list.length === 0) list.push({ id: 'welcome', icon: '👋', title: 'Welcome to Grofience!', desc: 'Add your first transaction to start earning XP', time: 'Now', iconBg: 'bg-blue-100' })
    return list.slice(0, 8)
  }, [notifs, user, transactions, goals, analytics])

  function fmtTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return iso
    const diff = Date.now() - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="p-2 rounded-full hover:bg-blue-50 relative" aria-label="Notifications">
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span key={unreadCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[320px] sm:w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-50"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="font-bold text-sm">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {notifs.length > 0 && <button onClick={clearAll} className="text-[11px] text-white/70 hover:text-white underline">Clear all</button>}
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-blue-50">
              {items.map((it, idx) => (
                <motion.div key={it.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className="flex gap-3 px-4 py-3 hover:bg-blue-50/40 transition">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${it.iconBg || 'bg-blue-100'}`}><UIIcon icon={it.icon} className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{it.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{it.desc}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{fmtTime(it.time)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-4 py-2 bg-blue-50/50 text-center">
              <button onClick={() => setOpen(false)} className="text-xs text-blue-600 font-semibold hover:underline">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============= TOPBAR =============
function TopBar({ user, onMobileToggle, dark, setDark, onRefresh, year, setYear, transactions, goals, analytics, setActive }) {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i)
  const [profileOpen, setProfileOpen] = useState(false)
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-blue-100">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button className="lg:hidden p-1 -ml-1 rounded-lg hover:bg-blue-50" onClick={onMobileToggle} aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActive('dashboard')}
            className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none lg:hidden"
            aria-label="Go to Dashboard"
          >
            <Logo className="h-8 sm:h-9 flex-shrink-0" />
          </button>
          <div className="hidden lg:block min-w-0">
            <h2 className="text-base lg:text-lg font-bold text-gray-900 truncate">Hey, {user?.username || 'Teen'} 👋</h2>
            <p className="text-xs text-gray-500 italic truncate">"{quote}"</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
              <SelectTrigger className="h-9 px-3 rounded-full bg-blue-50 border-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-100 gap-1 w-auto">
                <Calendar className="w-3 h-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <NotificationBell user={user} transactions={transactions} goals={goals} analytics={analytics} />
          {/* Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(p => !p)}
              className="focus:outline-none rounded-full ring-2 ring-blue-200 hover:ring-blue-400 transition-all"
              aria-label="Profile menu"
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-blue-600 text-white text-sm">{(user?.username || 'U')[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-12 z-40 w-64 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-white">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">{(user?.username || 'U')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-white min-w-0">
                      <div className="font-bold truncate">{user?.fullName || user?.username}</div>
                      <div className="text-xs text-blue-100 truncate">{user?.email}</div>
                      <div className="text-xs text-blue-200 mt-0.5">Level {user?.level ?? 0} · {user?.xp || 0} XP</div>
                    </div>
                  </div>
                  {/* Menu items */}
                  <div className="p-2">
                    <button onClick={() => { setActive('settings'); setProfileOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Settings & Profile</div>
                        <div className="text-xs text-gray-400">Edit your info & preferences</div>
                      </div>
                    </button>
                    <button onClick={() => { setActive('certificate'); setProfileOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Award className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">My Certificate</div>
                        <div className="text-xs text-gray-400">View your achievements</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs text-gray-500">🔥 {user?.streak || 0} day streak</span>
                        <span className="text-xs font-semibold text-blue-600">{user?.currency || 'USD'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// ============= ANIMATED COUNTER =============
function Counter({ value, prefix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const dur = 800
    const stepTime = 16
    const steps = dur / stepTime
    const inc = (value - start) / steps
    let curr = start
    const timer = setInterval(() => {
      curr += inc
      if ((inc > 0 && curr >= value) || (inc < 0 && curr <= value) || inc === 0) {
        setDisplay(value); clearInterval(timer)
      } else { setDisplay(curr) }
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return <>{prefix}{Number(display).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}

// ============= SUMMARY CARD =============
function SummaryCard({ icon: Icon, label, value, prefix = '$', accent = 'blue', delay = 0, suffix = '' }) {
  const accents = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-200',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
    rose: 'from-rose-500 to-rose-600 shadow-rose-200',
    purple: 'from-violet-500 to-violet-600 shadow-violet-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
  }
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="p-5 rounded-2xl border-blue-100/50 hover:shadow-xl transition-all bg-white relative overflow-hidden">
        <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${accents[accent]} opacity-10`} />
        <div className="relative z-10">
          <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${accents[accent]} shadow-lg mb-3`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</div>
          <div className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
            <Counter value={value} prefix={prefix} decimals={prefix === '$' ? 0 : 0} />{suffix}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============= DASHBOARD VIEW =============
function DashboardView({ user, transactions, goals, analytics }) {
  const { sym, fmt } = useCurrency(user)
  const monthlyData = useMemo(() => {
    const arr = MONTHS.map((m, i) => ({ name: m.slice(0, 3), saved: 0, income: 0, expense: 0 }))
    transactions.forEach(t => {
      const m = new Date(t.date).getMonth()
      if (t.type === 'income') { arr[m].income += t.amount; arr[m].saved += t.amount }
      else { arr[m].expense += t.amount; arr[m].saved -= t.amount }
    })
    return arr
  }, [transactions])

  const pieData = useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const totalIncome = analytics?.totalIncome || 0
  const totalExpense = analytics?.totalExpense || 0
  const totalSaved = analytics?.totalSaved || 0
  const savingsRate = analytics?.savingsRate || 0
  const score = analytics?.score || 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard icon={TrendingUp} label="Total Income" value={totalIncome} prefix={sym} accent="green" delay={0} />
        <SummaryCard icon={TrendingDown} label="Total Expenses" value={totalExpense} prefix={sym} accent="rose" delay={0.05} />
        <SummaryCard icon={PiggyBank} label="Total Saved" value={totalSaved} prefix={sym} accent="blue" delay={0.1} />
        <SummaryCard icon={Sparkles} label="Savings Rate" value={Math.round(savingsRate)} prefix="" suffix="%" accent="purple" delay={0.15} />
        <SummaryCard icon={Award} label="Finance Score" value={score} prefix="" suffix="/100" accent="amber" delay={0.2} />
      </div>

      {/* Gamification Strip */}
      <GamificationStrip user={user} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card className="p-6 rounded-2xl border-blue-100/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Monthly Savings Overview</h3>
                <p className="text-xs text-gray-500">Your savings trend across the year</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Live</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="cSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #dbeafe' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#cIncome)" />
                <Area type="monotone" dataKey="saved" stroke="#3b82f6" strokeWidth={3} fill="url(#cSaved)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 rounded-2xl border-blue-100/50 h-full">
            <h3 className="font-bold text-gray-900 mb-1">Expense Categories</h3>
            <p className="text-xs text-gray-500 mb-4">Where your money goes</p>
            {pieData.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No expenses yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={CAT_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #dbeafe' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="space-y-1.5 mt-2">
              {pieData.slice(0, 5).map(p => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[p.name] || '#94a3b8' }} />
                    <span className="text-gray-600">{p.name}</span>
                  </div>
                  <span className="font-semibold">{sym}{p.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Goals + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="p-6 rounded-2xl border-blue-100/50">
            <h3 className="font-bold text-gray-900 mb-4">Active Goals</h3>
            <div className="space-y-3">
              {goals.slice(0, 3).map(g => {
                const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{g.emoji} {g.title}</span>
                      <span className="text-gray-500">{fmt(g.saved)} / {fmt(g.target)}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                )
              })}
              {goals.length === 0 && <p className="text-sm text-gray-400">No goals yet — create one!</p>}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card className="p-6 rounded-2xl border-blue-100/50">
            <h3 className="font-bold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-2">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.notes || t.source || t.category}</div>
                      <div className="text-xs text-gray-400">{t.date} · {t.category}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{sym}{t.amount}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-sm text-gray-400">No transactions yet</p>}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ============= GAMIFICATION =============
function GamificationStrip({ user }) {
  const xp = user?.xp || 0
  const level = user?.level ?? 0              // starts at 0
  const xpInLevel = xp % 100                 // progress within current level (0–99)
  const xpToNext = 100 - xpInLevel           // XP needed to reach next level
  const allBadges = [
    { name: 'Money Rookie', icon: '/icons/2.png', color: 'from-green-400 to-green-600' },
    { name: 'Super Saver', icon: '/icons/3.png', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Budget Master', icon: '/icons/38.png', color: 'from-blue-400 to-blue-600' },
    { name: 'Finance Ninja', icon: '/icons/5.png', color: 'from-purple-500 to-purple-700' },
  ]
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
      <Card className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white border-0 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Crown className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <div className="text-xs text-blue-100 uppercase tracking-wider">Level</div>
              <div className="text-3xl font-bold">{level}</div>
              <div className="text-xs text-blue-100">{xp} XP total</div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-300" /> XP to Level {level + 1}</span>
              <span>{xpInLevel}/100</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpInLevel}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Flame className="w-3 h-3 text-orange-300" /> {user?.streak || 0} day streak
            </div>
          </div>
          <div>
            <div className="text-xs text-blue-100 uppercase tracking-wider mb-2">Badges</div>
            <div className="flex gap-2 flex-wrap">
              {allBadges.map(b => {
                const earned = (user?.badges || []).includes(b.name)
                return (
                  <div key={b.name} title={b.name} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition ${earned ? `bg-gradient-to-br ${b.color} shadow-lg` : 'bg-white/10 grayscale opacity-40'}`}>
                    <UIIcon icon={b.icon} className="w-5 h-5" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============= MONTHLY TRACKER =============
function MonthlyTracker({ user, monthIndex, transactions, refresh, year }) {
  const { sym } = useCurrency(user)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const monthName = MONTHS[monthIndex]
  const txs = transactions.filter(t => new Date(t.date).getMonth() === monthIndex)
  const filtered = txs.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false
    if (search && !(t.notes + t.source + t.category).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  async function deleteTx(id) {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    try { await api(`transactions/${id}`, { method: 'DELETE' }); toast.success('Deleted'); refresh() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{monthName} {year} Tracker</h2>
          <p className="text-sm text-gray-500">Manage your {monthName} transactions</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true) }} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 rounded-2xl bg-emerald-50 border-emerald-100">
          <div className="text-xs text-emerald-700 font-semibold">MONEY IN</div>
          <div className="text-2xl font-bold text-emerald-700">{sym}{income}</div>
        </Card>
        <Card className="p-4 rounded-2xl bg-rose-50 border-rose-100">
          <div className="text-xs text-rose-700 font-semibold">MONEY OUT</div>
          <div className="text-2xl font-bold text-rose-700">{sym}{expense}</div>
        </Card>
        <Card className="p-4 rounded-2xl bg-blue-50 border-blue-100">
          <div className="text-xs text-blue-700 font-semibold">NET SAVED</div>
          <div className="text-2xl font-bold text-blue-700">{sym}{income - expense}</div>
        </Card>
      </div>

      <Card className="p-4 lg:p-6 rounded-2xl border-blue-100/50">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="pl-9 rounded-xl" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="md:w-48 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-blue-100">
                <th className="py-3">Date</th>
                <th className="py-3">Money In</th>
                <th className="py-3">Source</th>
                <th className="py-3">Money Out</th>
                <th className="py-3">Category</th>
                <th className="py-3">Notes</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-blue-50 hover:bg-blue-50/40">
                  <td className="py-3 text-gray-600">{t.date}</td>
                  <td className="py-3 text-emerald-600 font-semibold">{t.type === 'income' ? `${sym}${t.amount}` : '-'}</td>
                  <td className="py-3 text-gray-600">{t.source || '—'}</td>
                  <td className="py-3 text-rose-600 font-semibold">{t.type === 'expense' ? `${sym}${t.amount}` : '-'}</td>
                  <td className="py-3"><Badge style={{ background: (CAT_COLORS[t.category] || '#94a3b8') + '20', color: CAT_COLORS[t.category] || '#94a3b8' }} className="font-semibold">{t.category}</Badge></td>
                  <td className="py-3 text-gray-600 max-w-xs truncate">{t.notes}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => { setEditing(t); setOpen(true) }} className="p-1.5 hover:bg-blue-100 rounded-lg mr-1"><Edit2 className="w-4 h-4 text-blue-600" /></button>
                    <button onClick={() => deleteTx(t.id)} className="p-1.5 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4 text-rose-600" /></button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No transactions in {monthName}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(t => (
            <Card key={t.id} className="p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-gray-400">{t.date}</div>
                  <div className="font-semibold">{t.notes || t.source || t.category}</div>
                  <Badge style={{ background: (CAT_COLORS[t.category] || '#94a3b8') + '20', color: CAT_COLORS[t.category] || '#94a3b8' }} className="mt-1">{t.category}</Badge>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{sym}{t.amount}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => { setEditing(t); setOpen(true) }} className="p-1 bg-blue-50 rounded"><Edit2 className="w-3 h-3 text-blue-600" /></button>
                    <button onClick={() => deleteTx(t.id)} className="p-1 bg-rose-50 rounded"><Trash2 className="w-3 h-3 text-rose-600" /></button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No transactions</p>}
        </div>
      </Card>

      <TransactionDialog open={open} setOpen={setOpen} editing={editing} monthIndex={monthIndex} onSaved={refresh} />
    </div>
  )
}

function TransactionDialog({ open, setOpen, editing, monthIndex, onSaved }) {
  const { push: pushNotif } = useNotif()
  const [form, setForm] = useState({ type: 'expense', amount: '', date: '', source: '', category: 'Snacks', notes: '' })
  useEffect(() => {
    if (editing) setForm({ ...editing, amount: String(editing.amount) })
    else {
      const d = new Date()
      d.setMonth(monthIndex ?? d.getMonth())
      setForm({ type: 'expense', amount: '', date: d.toISOString().slice(0, 10), source: '', category: 'Snacks', notes: '' })
    }
  }, [editing, open, monthIndex])

  async function save() {
    try {
      if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return }
      if (editing) {
        await api(`transactions/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
        toast.success('Updated! +2 XP ⚡')
        pushNotif({
          icon: '✏️', title: 'Transaction Updated',
          desc: `${form.type === 'income' ? 'Income' : 'Expense'} of ₹${form.amount} updated`,
          iconBg: 'bg-blue-100', accentColor: 'bg-gradient-to-r from-blue-400 to-indigo-400',
        })
      } else {
        await api('transactions', { method: 'POST', body: JSON.stringify(form) })
        if (form.type === 'income') {
          toast.success('Income added! +5 XP 💰')
          pushNotif({
            icon: '/icons/3.png', title: 'Income Added! +5 XP',
            desc: `₹${form.amount} from ${form.source || form.category} logged successfully`,
            iconBg: 'bg-emerald-100', accentColor: 'bg-gradient-to-r from-emerald-400 to-green-400',
          })
        } else {
          toast.success('Expense logged! +2 XP ⚡')
          pushNotif({
            icon: '/icons/29.png', title: 'Expense Logged! +2 XP',
            desc: `₹${form.amount} spent on ${form.category}${form.notes ? ' · ' + form.notes : ''}`,
            iconBg: 'bg-rose-100', accentColor: 'bg-gradient-to-r from-rose-400 to-pink-400',
          })
        }
      }
      setOpen(false); onSaved()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-2xl">
        <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Transaction</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={form.type === 'income' ? 'default' : 'outline'} className={form.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''} onClick={() => setForm({ ...form, type: 'income', category: 'Allowance' })}>
              <TrendingUp className="w-4 h-4 mr-1" /> Income
            </Button>
            <Button type="button" variant={form.type === 'expense' ? 'default' : 'outline'} className={form.type === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : ''} onClick={() => setForm({ ...form, type: 'expense', category: 'Snacks' })}>
              <TrendingDown className="w-4 h-4 mr-1" /> Expense
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          {form.type === 'income' && (
            <div><Label>Source</Label><Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Allowance, gift, etc." /></div>
          )}
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What is this for?" /></div>
        </div>
        <DialogFooter>
          <Button onClick={save} className="bg-blue-600 hover:bg-blue-700 w-full">{editing ? 'Save Changes' : 'Add Transaction'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============= GOALS VIEW =============
function GoalsView({ user, goals, refresh }) {
  const { sym } = useCurrency(user)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', target: '', saved: '0', emoji: '🎯', deadline: '' })
  const [celebrating, setCelebrating] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', target: '', saved: '', emoji: '🎯', deadline: '' })
  const emojis = ['🎯', '🎧', '🎮', '👟', '📱', '🎤', '🛡️', '✈️', '🚲', '💻', '📚', '🎨']
  const QUICK_AMOUNTS = [5, 10, 20, 50, 100, 500]
  const [customAmounts, setCustomAmounts] = useState({}) // { [goalId]: string }

  async function add() {
    if (!form.title || !form.target) { toast.error('Fill all fields'); return }
    try { await api('goals', { method: 'POST', body: JSON.stringify(form) }); toast.success('Goal created! 🎯'); setOpen(false); setForm({ title: '', target: '', saved: '0', emoji: '🎯', deadline: '' }); refresh() }
    catch (e) { toast.error(e.message) }
  }

  async function addToGoal(g, amount) {
    const newSaved = Math.min(g.target, g.saved + amount)
    await api(`goals/${g.id}`, { method: 'PUT', body: JSON.stringify({ saved: newSaved }) })
    if (newSaved >= g.target && g.saved < g.target) {
      setCelebrating(g)
      setTimeout(() => setCelebrating(null), 3500)
      toast.success(`🎉 Goal "${g.title}" completed! +50 XP`)
    } else {
      toast.success(`+${sym}${amount} saved!`)
    }
    refresh()
  }

  async function deleteGoal(id) {
    if (!confirm('Delete this goal? This cannot be undone.')) return
    await api(`goals/${id}`, { method: 'DELETE' }); toast.success('Goal removed'); refresh()
  }

  function openEdit(g) {
    setEditForm({ title: g.title, target: String(g.target), saved: String(g.saved), emoji: g.emoji || '🎯', deadline: g.deadline || '' })
    setEditingGoal(g)
  }

  async function saveEdit() {
    if (!editForm.title || !editForm.target) { toast.error('Fill all required fields'); return }
    try {
      await api(`goals/${editingGoal.id}`, { method: 'PUT', body: JSON.stringify(editForm) })
      toast.success('Goal updated! ✅'); setEditingGoal(null); refresh()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Goals 🎯</h2>
          <p className="text-sm text-gray-500">Crush your savings targets</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g, i) => {
          const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0
          const done = g.saved >= g.target
          return (
            <motion.div key={g.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
              <Card className={`p-6 rounded-2xl border-2 ${done ? 'border-emerald-300 bg-emerald-50/50' : 'border-blue-100'} relative overflow-hidden`}>
                {done && <Badge className="absolute top-3 right-3 bg-emerald-500 text-white">✓ Complete!</Badge>}
                <div className="text-5xl mb-3">{g.emoji}</div>
                <div className="font-bold text-lg text-gray-900">{g.title}</div>
                <div className="text-sm text-gray-500 mb-3">{sym}{g.saved} / {sym}{g.target}</div>
                <div className="space-y-2">
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{Math.round(pct)}% complete</span>
                    <span className="text-blue-600 font-semibold">{sym}{g.target - g.saved} to go</span>
                  </div>
                  {g.deadline && !done && (
                    <div className={`text-xs flex items-center gap-1 ${new Date(g.deadline) < new Date() ? 'text-rose-500 font-semibold' : 'text-gray-400'}`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(g.deadline) < new Date() ? '⚠ Deadline passed: ' : 'Deadline: '}
                      {new Date(g.deadline).toLocaleDateString()}
                    </div>
                  )}
                  {done && g.deadline && (
                    <div className="text-xs text-emerald-600 flex items-center gap-1">
                      <span>✅</span> Completed before deadline!
                    </div>
                  )}
                </div>
                {!done && (
                  <div className="mt-4 space-y-2">
                    {/* Quick-add preset chips */}
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Quick Add</p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_AMOUNTS.map(a => (
                        <button
                          key={a}
                          onClick={() => addToGoal(g, a)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all active:scale-95"
                        >
                          +{sym}{a}
                        </button>
                      ))}
                    </div>

                    {/* Custom editable amount */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your Amount</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">{sym}</span>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={customAmounts[g.id] ?? ''}
                            onChange={e => setCustomAmounts(prev => ({ ...prev, [g.id]: e.target.value }))}
                            placeholder="Enter amount"
                            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white transition-all"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const amt = parseFloat(customAmounts[g.id])
                            if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
                            addToGoal(g, amt)
                            setCustomAmounts(prev => ({ ...prev, [g.id]: '' }))
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-200 transition-all active:scale-95"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(g)} className="text-blue-600 hover:bg-blue-50 flex-1 text-xs">
                    <Edit2 className="w-3 h-3 mr-1" /> Edit Goal
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteGoal(g.id)} className="text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
        {goals.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3 p-12 text-center text-gray-400 rounded-2xl border-dashed">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No goals yet. Create your first one!</p>
          </Card>
        )}
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-md">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: 3, duration: 0.4 }} className="text-7xl mb-4">{celebrating.emoji}</motion.div>
              <h2 className="text-3xl font-bold mb-2">Goal Crushed! 🎉</h2>
              <p className="text-gray-600 mb-4">You completed "{celebrating.title}"</p>
              <Badge className="bg-yellow-400 text-yellow-900 text-base px-4 py-1">+50 XP earned</Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={v => !v && setEditingGoal(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Edit Goal ✏️</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Goal Title</Label><input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="New Headphones" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target ({sym})</Label><input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editForm.target} onChange={e => setEditForm({ ...editForm, target: e.target.value })} /></div>
              <div><Label>Saved So Far ({sym})</Label><input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editForm.saved} onChange={e => setEditForm({ ...editForm, saved: e.target.value })} /></div>
            </div>
            <div><Label>Deadline (optional)</Label><input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} /></div>
            <div>
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {emojis.map(e => (
                  <button key={e} onClick={() => setEditForm({ ...editForm, emoji: e })} className={`text-2xl p-2 rounded-lg ${editForm.emoji === e ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}>{e}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 w-full">Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>New Goal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Goal Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="New Headphones" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target ({sym})</Label><Input type="number" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="150" /></div>
              <div><Label>Already Saved ({sym})</Label><Input type="number" value={form.saved} onChange={e => setForm({ ...form, saved: e.target.value })} placeholder="0" /></div>
            </div>
            <div><Label>Deadline (optional)</Label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
            <div>
              <Label>Pick an emoji</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {emojis.map(e => (
                  <button key={e} onClick={() => setForm({ ...form, emoji: e })} className={`text-2xl p-2 rounded-lg ${form.emoji === e ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}>{e}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={add} className="bg-blue-600 hover:bg-blue-700 w-full">Create Goal</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============= EMAIL PARENT BUTTON =============
function EmailParentButton({ user }) {
  const [sending, setSending] = useState(false)
  async function send() {
    if (!user?.parentEmail) { toast.error('Add a parent email in Settings first'); return }
    setSending(true)
    try { await api('notifications/parent', { method: 'POST' }); toast.success('Report emailed to parent! 📧') }
    catch (e) { toast.error(e.message) } finally { setSending(false) }
  }
  return (
    <Button onClick={send} disabled={sending} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl">
      {sending ? '⏳ Sending...' : '📧 Email to Parent'}
    </Button>
  )
}

// ============= PARENT REPORT =============
function CircularScore({ value, label, color, icon }) {
  const r = 38
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[100px] h-[100px]">
        <svg className="w-[100px] h-[100px] -rotate-90">
          <circle cx="50" cy="50" r={r} stroke="#e5e7eb" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r={r} stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <UIIcon icon={icon} className="w-4 h-4 mb-0.5" style={{ color }} />
          <span className="text-xl font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <div className="text-xs font-semibold text-gray-600 mt-2 uppercase tracking-wide">{label}</div>
    </div>
  )
}

function ParentReportView({ user, transactions, goals, analytics, logoDataUrl }) {
  const reportRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const logoSrc = logoDataUrl || LOGO_URL

  const consistency = Math.min(100, transactions.length >= 10 ? 90 + Math.min(10, transactions.length - 10) : transactions.length * 9)
  const discipline = Math.max(0, Math.min(100, Math.round(analytics?.savingsRate || 0)))
  const score = analytics?.score || 0

  const expByCat = {}
  transactions.filter(t => t.type === 'expense').forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + t.amount })
  const totalExp = Object.values(expByCat).reduce((s, v) => s + v, 0) || 1
  const catRows = Object.entries(expByCat).sort((a, b) => b[1] - a[1])

  const insights = []
  const topCat = catRows[0]
  if (topCat) insights.push({ icon: '/icons/38.png', text: `Top spending category: ${topCat[0]} (₹${topCat[1]}) — ${Math.round((topCat[1] / totalExp) * 100)}% of expenses.` })
  if (analytics?.savingsRate >= 30) insights.push({ icon: '/icons/28.png', text: `Excellent saver — putting away ${Math.round(analytics.savingsRate)}% of income.` })
  else if (analytics?.savingsRate > 0) insights.push({ icon: '/icons/36.png', text: `Saving ${Math.round(analytics.savingsRate)}% of income — encourage them to aim for 30%+.` })
  else if (transactions.length > 0) insights.push({ icon: '/icons/30.png', text: `Spending exceeds income this period. Great chance for a budgeting talk.` })
  if (goals.length > 0) {
    const completed = goals.filter(g => g.saved >= g.target && g.target > 0).length
    insights.push({ icon: '/icons/7.png', text: `Tracking ${goals.length} active goal${goals.length > 1 ? 's' : ''}${completed ? ` · ${completed} completed!` : ''}.` })
  }
  if ((user?.badges || []).length >= 2) insights.push({ icon: '/icons/6.png', text: `Earned ${user.badges.length} achievement badges so far.` })
  if (insights.length === 0) insights.push({ icon: 'ℹ️', text: 'More insights will appear as your teen logs transactions and creates goals.' })

  // Monthly savings trend for in-PDF chart
  const monthlyTrend = MONTHS.map((m, i) => {
    let income = 0, expense = 0
    transactions.forEach(t => {
      if (new Date(t.date).getMonth() === i) {
        if (t.type === 'income') income += t.amount; else expense += t.amount
      }
    })
    return { name: m.slice(0, 3), saved: income - expense }
  })
  const maxSaved = Math.max(1, ...monthlyTrend.map(m => Math.abs(m.saved)))

  const allBadgeMeta = [
    { name: 'Money Rookie', icon: '/icons/2.png', desc: 'Logged first transaction' },
    { name: 'Super Saver', icon: '/icons/3.png', desc: 'Saved ₹100+' },
    { name: 'Budget Master', icon: '/icons/38.png', desc: 'Logged 10+ transactions' },
    { name: 'Finance Ninja', icon: '/icons/5.png', desc: 'Completed a savings goal' },
  ]

  async function downloadPDF() {
    setDownloading(true)
    try {
      const html2canvasMod = await import('html2canvas')
      const jspdfMod = await import('jspdf')
      const html2canvas = html2canvasMod.default
      const jsPDF = jspdfMod.default || jspdfMod.jsPDF
      const node = reportRef.current
      await waitForImages(node)
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        logging: false,
        onclone: (doc) => {
          // Remove mix-blend-mode which html2canvas doesn't support well
          doc.querySelectorAll('img').forEach(img => {
            img.style.mixBlendMode = 'normal'
            img.style.filter = 'none'
          })
        },
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width
      let heightLeft = imgH
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH, undefined, 'FAST')
      heightLeft -= pageH
      while (heightLeft > 0) {
        position = heightLeft - imgH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH, undefined, 'FAST')
        heightLeft -= pageH
      }
      pdf.save(`grofience-parent-report-${user?.username || 'teen'}.pdf`)
      toast.success('Premium report downloaded! 📄')
    } catch (e) {
      console.error(e)
      toast.error('Could not generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parent Report</h2>
          <p className="text-sm text-gray-500">A premium, printable progress report for parents</p>
        </div>
        <div className="flex gap-2">
          <EmailParentButton user={user} />
          <Button onClick={downloadPDF} disabled={downloading} className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200">
            <Download className="w-4 h-4 mr-1" /> {downloading ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* PDF capture target — pure white, fixed width for crisp PDF, scaled for mobile preview */}
      <div className="report-scroll-wrapper overflow-x-auto -mx-4 lg:mx-0 px-4 lg:px-0">
        <div ref={reportRef} className="bg-white mx-auto shadow-xl rounded-2xl overflow-hidden" style={{ width: '820px', padding: '0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* === COVER HEADER === */}
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%)', padding: '40px 48px', color: 'white' }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(253, 224, 71, 0.15)' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ background: 'white', borderRadius: '14px', padding: '14px 22px', display: 'table', marginBottom: '28px', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}>
                  <img src={logoSrc} alt="Grofience" crossOrigin="anonymous" style={{ height: '40px', width: 'auto', objectFit: 'contain', display: 'block' }} />
                </div>
                <div style={{ fontSize: '12px', letterSpacing: '0.25em', opacity: 0.9, marginBottom: '10px', fontWeight: 600 }}>OFFICIAL PROGRESS REPORT</div>
                <div style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1.1 }}>Parent Insights</div>
                <div style={{ fontSize: '15px', opacity: 0.9, marginTop: '6px' }}>Tracking financial growth & habits</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '12px', padding: '10px 14px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <div style={{ opacity: 0.85 }}>REPORT DATE</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.75, letterSpacing: '0.15em' }}>CONFIDENTIAL</div>
              </div>
            </div>
          </div>

          {/* === TEEN PROFILE BANNER === */}
          <div style={{ padding: '28px 48px', background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '72px', height: '72px', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 8px 20px rgba(59,130,246,0.3)', border: '3px solid white' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 800, boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
                  {(user?.username || 'T')[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.18em', fontWeight: 600 }}>TEEN PROFILE</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{user?.fullName || user?.username}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>@{user?.username}{user?.age ? ` · Age ${user.age}` : ''} · Level {user?.level ?? 0} · {user?.xp || 0} XP</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                  <span>👑</span> Level {user?.level ?? 0}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>{(user?.badges || []).length} badge{(user?.badges || []).length !== 1 ? 's' : ''} earned</div>
              </div>
            </div>
          </div>

          {/* === SCORES (3 CIRCULAR GAUGES) === */}
          <div style={{ padding: '32px 48px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#1e293b' }}>FINANCIAL HEALTH SCORES</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Discipline', value: discipline, color: '#3b82f6', icon: ShieldCheck, sub: 'Income vs Expense ratio' },
                { label: 'Consistency', value: consistency, color: '#10b981', icon: Flame, sub: 'Tracking frequency' },
                { label: 'Overall Score', value: score, color: '#8b5cf6', icon: Award, sub: 'Holistic finance health' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <CircularScore value={s.value} label={s.label} color={s.color} icon={s.icon} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, minHeight: '16px' }}>{s.sub}</div>
                  <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: s.value >= 70 ? '#dcfce7' : s.value >= 40 ? '#fef3c7' : '#fee2e2', color: s.value >= 70 ? '#166534' : s.value >= 40 ? '#92400e' : '#991b1b', letterSpacing: '0.05em' }}>
                    {s.value >= 70 ? 'EXCELLENT' : s.value >= 40 ? 'GOOD' : 'NEEDS WORK'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === KEY METRICS GRID === */}
          <div style={{ padding: '0 48px 32px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#1e293b' }}>FINANCIAL SNAPSHOT</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Total Income', value: `₹${analytics?.totalIncome || 0}`, color: '#10b981', bg: '#ecfdf5', Icon: TrendingUp },
                { label: 'Total Expenses', value: `₹${analytics?.totalExpense || 0}`, color: '#f43f5e', bg: '#fff1f2', Icon: TrendingDown },
                { label: 'Net Saved', value: `₹${analytics?.totalSaved || 0}`, color: '#3b82f6', bg: '#eff6ff', Icon: PiggyBank },
                { label: 'Savings Rate', value: `${Math.round(analytics?.savingsRate || 0)}%`, color: '#8b5cf6', bg: '#f5f3ff', Icon: Sparkles },
              ].map(m => (
                <div key={m.label} style={{ background: m.bg, borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ background: m.color, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', boxShadow: `0 4px 12px ${m.color}40` }}>
                    <m.Icon className="w-4 h-4" style={{ color: 'white' }} />
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em' }}>{m.label.toUpperCase()}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: m.color, marginTop: '2px' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* === MONTHLY SAVINGS TREND BAR CHART === */}
          <div style={{ padding: '0 48px 32px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#1e293b' }}>MONTHLY SAVINGS TREND</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', marginBottom: '8px' }}>
                {monthlyTrend.map(m => {
                  const h = Math.max(2, (Math.abs(m.saved) / maxSaved) * 120)
                  const positive = m.saved >= 0
                  return (
                    <div key={m.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: positive ? '#10b981' : '#f43f5e' }}>
                        {m.saved !== 0 ? `₹${m.saved}` : ''}
                      </div>
                      <div style={{ width: '100%', height: `${h}px`, background: positive ? 'linear-gradient(180deg, #3b82f6, #6366f1)' : 'linear-gradient(180deg, #f87171, #ef4444)', borderRadius: '6px 6px 2px 2px' }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {monthlyTrend.map(m => (
                  <div key={m.name} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{m.name}</div>
                ))}
              </div>
            </div>
          </div>

          {/* === SPENDING BREAKDOWN === */}
          {catRows.length > 0 && (
            <div style={{ padding: '0 48px 32px', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#1e293b' }}>SPENDING BREAKDOWN</div>
              </div>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px' }}>
                {catRows.map(([cat, amt]) => {
                  const pct = Math.round((amt / totalExp) * 100)
                  return (
                    <div key={cat} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CAT_COLORS[cat] || '#94a3b8' }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{cat}</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>₹{amt} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({pct}%)</span></div>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: CAT_COLORS[cat] || '#94a3b8', borderRadius: '4px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* === GOALS PROGRESS === */}
          {goals.length > 0 && (
            <div style={{ padding: '0 48px 32px', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#1e293b' }}>SAVINGS GOALS</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {goals.map(g => {
                  const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0
                  const done = pct >= 100
                  return (
                    <div key={g.id} style={{ background: done ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : 'white', border: `1px solid ${done ? '#86efac' : '#e5e7eb'}`, borderRadius: '14px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '24px' }}>{g.emoji}</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{g.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>₹{g.saved} of ₹{g.target}</div>
                        </div>
                        {done && <div style={{ background: '#10b981', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px' }}>✓ DONE</div>}
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: done ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '4px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', fontWeight: 600 }}>
                        <span style={{ color: '#64748b' }}>{pct}% complete</span>
                        <span style={{ color: done ? '#059669' : '#3b82f6' }}>₹{Math.max(0, g.target - g.saved)} to go</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* === INSIGHTS === */}
          <div style={{ padding: '0 48px 32px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#1e293b' }}>KEY INSIGHTS & RECOMMENDATIONS</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'linear-gradient(90deg, #eff6ff, white)', borderLeft: '3px solid #3b82f6', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ width: '20px', height: '20px' }}><UIIcon icon={ins.icon} className="w-full h-full object-contain" /></div>
                  <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.5, paddingTop: '2px' }}>{ins.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* === ACHIEVEMENTS === */}
          <div style={{ padding: '0 48px 32px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', color: '#1e293b' }}>ACHIEVEMENTS</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {allBadgeMeta.map(b => {
                const earned = (user?.badges || []).includes(b.name)
                return (
                  <div key={b.name} style={{ background: earned ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#f8fafc', borderRadius: '14px', padding: '14px', textAlign: 'center', border: `1px solid ${earned ? '#fcd34d' : '#e5e7eb'}`, opacity: earned ? 1 : 0.5 }}>
                    <div style={{ width: '32px', height: '32px', margin: '0 auto 6px', filter: earned ? 'none' : 'grayscale(1)' }}><UIIcon icon={b.icon} className="w-full h-full object-contain" /></div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{b.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>{b.desc}</div>
                    {earned && <div style={{ marginTop: '6px', fontSize: '9px', fontWeight: 700, color: '#92400e' }}>✓ EARNED</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* === FOOTER === */}
          <div style={{ background: 'transparent', padding: '24px 48px', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={logoSrc} alt="Grofience" crossOrigin="anonymous" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.2em', opacity: 0.85, fontWeight: 600 }}>GROW · FINANCE · CONFIDENCE</div>
                <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>Empowering teens to master money</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px', opacity: 0.7 }}>
              <div>Generated by Grofience</div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============= CERTIFICATE =============
function CertificateView({ user, analytics, transactions, goals, logoDataUrl }) {
  const certRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const logoSrc = logoDataUrl || LOGO_URL
  const score = analytics?.score || 0
  const completedGoals = goals.filter(g => g.target > 0 && g.saved >= g.target).length
  const tier = score >= 80 ? { name: 'Gold Achiever', color: '#f59e0b', accent: '#fde68a' } : score >= 50 ? { name: 'Silver Achiever', color: '#94a3b8', accent: '#e2e8f0' } : { name: 'Bronze Starter', color: '#b45309', accent: '#fed7aa' }
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const certId = `GRO-${(user?.id || 'XXX').slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`

  async function downloadCert() {
    setDownloading(true)
    try {
      const html2canvasMod = await import('html2canvas')
      const jspdfMod = await import('jspdf')
      const html2canvas = html2canvasMod.default
      const jsPDF = jspdfMod.default || jspdfMod.jsPDF
      await waitForImages(certRef.current)
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true, allowTaint: true, logging: false })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / canvas.height
      let w = pageW, h = pageW / ratio
      if (h > pageH) { h = pageH; w = pageH * ratio }
      const x = (pageW - w) / 2, y = (pageH - h) / 2
      pdf.addImage(imgData, 'PNG', x, y, w, h, undefined, 'FAST')
      pdf.save(`grofience-certificate-${user?.username}.pdf`)
      toast.success('Certificate downloaded! 🏆')
    } catch (e) { console.error(e); toast.error('Could not generate certificate') }
    finally { setDownloading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Certificate 🏆</h2>
          <p className="text-sm text-gray-500">A printable certificate of your financial journey</p>
        </div>
        <Button onClick={downloadCert} disabled={downloading} className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200">
          <Download className="w-4 h-4 mr-1" /> {downloading ? 'Generating...' : 'Download Certificate'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div ref={certRef} className="bg-white mx-auto relative" style={{ width: '900px', minHeight: '640px', padding: '32px', fontFamily: 'Georgia, serif' }}>
          {/* Outer ornate frame */}
          <div style={{ position: 'absolute', inset: '20px', border: `4px solid ${tier.color}`, borderRadius: '12px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: '32px', border: `1px solid ${tier.color}`, borderRadius: '8px', pointerEvents: 'none' }} />
          {/* Decorative corner ornaments */}
          {[
            { top: '32px', left: '32px' }, { top: '32px', right: '32px' },
            { bottom: '32px', left: '32px' }, { bottom: '32px', right: '32px' },
          ].map((pos, i) => (
            <div key={i} style={{ position: 'absolute', ...pos, width: '60px', height: '60px', background: `radial-gradient(circle at center, ${tier.accent} 0%, transparent 70%)`, opacity: 0.6 }} />
          ))}

          <div style={{ position: 'relative', padding: '40px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
            {/* Logo at top */}
            <img src={logoSrc} alt="Grofience" crossOrigin="anonymous" style={{ height: '64px', width: 'auto', objectFit: 'contain' }} />

            <div style={{ fontSize: '12px', letterSpacing: '0.4em', color: tier.color, fontWeight: 700, marginTop: '8px' }}>★ CERTIFICATE OF ACHIEVEMENT ★</div>

            <div style={{ fontSize: '52px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'Georgia, serif' }}>Outstanding Saver</div>

            <div style={{ fontSize: '14px', color: '#64748b', maxWidth: '600px', lineHeight: 1.5, fontFamily: 'system-ui, sans-serif' }}>
              This certificate is proudly presented to
            </div>

            <div style={{ fontSize: '40px', fontWeight: 700, color: tier.color, fontFamily: 'Georgia, serif', borderBottom: `2px solid ${tier.accent}`, padding: '4px 40px 8px', letterSpacing: '0.01em' }}>
              {user?.fullName || user?.username}
            </div>

            <div style={{ fontSize: '14px', color: '#475569', maxWidth: '640px', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif', marginTop: '4px' }}>
              In recognition of demonstrating exceptional discipline, consistency, and dedication on the journey to financial mastery. With <strong>{transactions.length}</strong> transactions tracked, <strong>{goals.length}</strong> goals set, and <strong>{completedGoals}</strong> goal{completedGoals !== 1 ? 's' : ''} completed, you have proven that growing money begins with growing habits.
            </div>

            {/* Stats badges */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontFamily: 'system-ui, sans-serif' }}>
              {[
                { label: 'Level', value: user?.level ?? 0, icon: '/icons/12.png' },
                { label: 'XP', value: user?.xp || 0, icon: '/icons/27.png' },
                { label: 'Score', value: `${score}/100`, icon: '/icons/7.png' },
                { label: 'Badges', value: (user?.badges || []).length, icon: '/icons/6.png' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f8fafc', border: `1px solid ${tier.accent}`, borderRadius: '10px', padding: '8px 14px', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ width: '20px', height: '20px' }}><UIIcon icon={s.icon} className="w-full h-full object-contain" /></div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{s.value}</div>
                  <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.1em', fontWeight: 600 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Tier seal */}
            <div style={{ position: 'absolute', right: '70px', top: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: `linear-gradient(135deg, ${tier.color}, ${tier.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${tier.color}40`, border: `3px solid white` }}>
                <div style={{ fontSize: '38px' }}>{score >= 80 ? '🥇' : score >= 50 ? '🥈' : '🥉'}</div>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: tier.color, letterSpacing: '0.15em' }}>{tier.name.toUpperCase()}</div>
            </div>

            {/* Footer signature row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '32px', alignItems: 'flex-end', fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: '4px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '20px', color: tier.color }}>Grofience Team</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', letterSpacing: '0.08em' }}>AUTHORIZED BY</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.15em', marginBottom: '4px' }}>CERTIFICATE ID</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', fontFamily: 'monospace' }}>{certId}</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ borderBottom: '1px solid #94a3b8', paddingBottom: '4px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '20px', color: tier.color }}>{dateStr}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', letterSpacing: '0.08em' }}>DATE ISSUED</div>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '12px', letterSpacing: '0.2em', fontFamily: 'system-ui, sans-serif' }}>
              GROW · FINANCE · CONFIDENCE
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============= WEEKLY CHALLENGES =============
const WEEKLY_CHALLENGES = [
  {
    week: 1,
    title: 'Money Awareness Week',
    subtitle: 'Know where every rupee goes',
    color: 'from-blue-600 to-blue-500',
    light: 'bg-blue-50 border-blue-100',
    accent: 'text-blue-700',
    icon: '/icons/3.png',
    challenges: [
      { day: 'Mon', task: 'Write down every purchase you made yesterday — even tiny ones.', xp: 10 },
      { day: 'Tue', task: 'Calculate how much you spent on snacks & drinks this month.', xp: 10 },
      { day: 'Wed', task: 'List your top 3 "wants" vs your top 3 "needs" right now.', xp: 15 },
      { day: 'Thu', task: 'Ask a parent or guardian what their biggest monthly expense is.', xp: 10 },
      { day: 'Fri', task: "Log ALL of today's spending in Grofience — nothing skipped.", xp: 20 },
      { day: 'Sat', task: 'Review your week — which purchase do you regret most? Why?', xp: 15 },
      { day: 'Sun', task: 'Set a spending limit for next week and write it down.', xp: 20 },
    ],
    tip: '💡 Pro Tip: People who track spending save 20% more on average — just by being aware.',
  },
  {
    week: 3,
    title: 'Goal-Setting & Growth Week',
    subtitle: 'Turn dreams into concrete money goals',
    color: 'from-emerald-600 to-teal-500',
    light: 'bg-emerald-50 border-emerald-100',
    accent: 'text-emerald-700',
    icon: '/icons/7.png',
    challenges: [
      { day: 'Mon', task: 'Write 1 short-term goal (achievable in 1 month) with a price tag.', xp: 15 },
      { day: 'Tue', task: 'Write 1 long-term goal (1 year+) and break it into monthly targets.', xp: 20 },
      { day: 'Wed', task: 'Add both goals to Grofience Goals and set realistic saved amounts.', xp: 25 },
      { day: 'Thu', task: 'Identify one expense you can cut to fund your goal faster.', xp: 15 },
      { day: 'Fri', task: 'Research one way a teen can earn extra income (tutoring, reselling, etc.).', xp: 15 },
      { day: 'Sat', task: 'Transfer (or set aside) a specific amount toward your short-term goal today.', xp: 25 },
      { day: 'Sun', task: 'Share your goal with 1 friend or family member — accountability works!', xp: 20 },
    ],
    tip: '💡 Pro Tip: Writing goals down makes you 42% more likely to achieve them. Add them to Grofience now!',
  },
]

function WeeklyChallenges() {
  const [openWeek, setOpenWeek] = useState(null)
  // checkedTasks is the source of truth (DB-backed with localStorage as fast cache)
  const [checkedTasks, setCheckedTasks] = useState(() => {
    // Seed from localStorage immediately so UI feels instant on load
    try { return JSON.parse(localStorage.getItem('grofience_challenges') || '{}') } catch { return {} }
  })
  const [dbLoaded, setDbLoaded] = useState(false)

  // Load authoritative state from DB on mount, merging with localStorage cache
  useEffect(() => {
    api('challenges/progress').then(d => {
      const dbProgress = d.progress || {}
      setCheckedTasks(dbProgress)
      // Sync localStorage cache to match DB
      try { localStorage.setItem('grofience_challenges', JSON.stringify(dbProgress)) } catch {}
      setDbLoaded(true)
    }).catch(() => {
      // Fallback: keep whatever is in localStorage if DB is unreachable
      setDbLoaded(true)
    })
  }, [])

  async function toggleTask(weekNum, dayIdx) {
    const key = `${weekNum}-${dayIdx}`
    const nextChecked = !checkedTasks[key]
    // Optimistic UI update + localStorage cache
    setCheckedTasks(prev => {
      const next = { ...prev, [key]: nextChecked }
      try { localStorage.setItem('grofience_challenges', JSON.stringify(next)) } catch {}
      return next
    })
    // Persist to DB (fire-and-forget; revert on failure)
    try {
      await api('challenges/progress', {
        method: 'PUT',
        body: JSON.stringify({ key, checked: nextChecked }),
      })
    } catch {
      // Revert optimistic update on error
      setCheckedTasks(prev => {
        const reverted = { ...prev, [key]: !nextChecked }
        try { localStorage.setItem('grofience_challenges', JSON.stringify(reverted)) } catch {}
        return reverted
      })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg">🏆</div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Weekly Challenges</h3>
          <p className="text-xs text-gray-500">Complete daily tasks to build real money habits &amp; earn XP</p>
        </div>
        {!dbLoaded && (
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
            Syncing...
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {WEEKLY_CHALLENGES.map(w => {
          const isOpen = openWeek === w.week
          const completed = w.challenges.filter((_, i) => checkedTasks[`${w.week}-${i}`]).length
          const pct = Math.round((completed / w.challenges.length) * 100)
          const totalXp = w.challenges.filter((_, i) => checkedTasks[`${w.week}-${i}`]).reduce((s, c) => s + c.xp, 0)
          const totalPossibleXp = w.challenges.reduce((s, c) => s + c.xp, 0)
          return (
            <motion.div key={w.week} layout className={`border ${w.light} rounded-2xl overflow-hidden shadow-sm`}>
              {/* Header / Toggle */}
              <button onClick={() => setOpenWeek(isOpen ? null : w.week)} className="w-full text-left focus:outline-none">
                <div className={`bg-gradient-to-r ${w.color} p-5 text-white relative overflow-hidden`}>
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full mb-2">
                        <UIIcon icon={w.icon} className="w-4 h-4 inline-block align-middle" /> WEEK {w.week}
                      </div>
                      <div className="font-bold text-xl leading-tight">{w.title}</div>
                      <div className="text-xs text-white/80 mt-0.5">{w.subtitle}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black">{pct}%</div>
                      <div className="text-[10px] text-white/70">{completed}/{w.challenges.length} done</div>
                      {totalXp > 0 && <div className="text-[10px] text-yellow-200 font-bold mt-0.5">+{totalXp} XP earned</div>}
                    </div>
                  </div>
                  <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="text-[10px] text-white/60 mt-1 text-right">
                    {isOpen ? '▲ collapse' : '▼ tap to expand daily tasks'}
                  </div>
                </div>
              </button>

              {/* Daily Tasks */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {w.challenges.map((ch, i) => {
                        const done = !!checkedTasks[`${w.week}-${i}`]
                        return (
                          <motion.div
                            key={i}
                            whileHover={{ x: 2 }}
                            onClick={() => toggleTask(w.week, i)}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all select-none
                              ${done ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30'}`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all
                              ${done ? 'bg-emerald-500 text-white' : 'border-2 border-gray-200'}`}>
                              {done ? '✓' : ''}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                                  ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{ch.day}</span>
                                <span className="text-[10px] font-bold text-amber-600">+{ch.xp} XP</span>
                              </div>
                              <p className={`text-sm leading-snug ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{ch.task}</p>
                            </div>
                          </motion.div>
                        )
                      })}

                      {/* Pro Tip */}
                      <div className={`mt-2 p-3 rounded-xl ${w.light} border`}>
                        <p className={`text-xs ${w.accent} leading-relaxed`}>{w.tip}</p>
                      </div>

                      {/* Completion trophy */}
                      {completed === w.challenges.length && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mt-2 text-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl"
                        >
                          <div className="text-2xl mb-1">🏆</div>
                          <div className="font-bold text-amber-800 text-sm">Week {w.week} Complete!</div>
                          <div className="text-xs text-amber-600">You earned {totalPossibleXp} XP this week 🎉</div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ============= E-BOOK =============
const EBOOK_CHAPTERS = [
  { title: 'Welcome to Money 101', emoji: '👋', body: 'Money is just a tool. The earlier you understand how to make it work for you, the more freedom and choices you build for your future. This guide is designed for you — a teen ready to take control.' },
  { title: 'The Golden Rule: Pay Yourself First', emoji: '💰', body: 'Every time you receive money — allowance, gifts, side hustle income — set aside 30% before spending anything. This single habit is the foundation of all wealth.' },
  { title: 'Needs vs Wants', emoji: '🤔', body: 'Needs are things you genuinely require (food, school supplies). Wants are things that are nice to have. Both are okay — just label them honestly so you can decide what to prioritize.' },
  { title: 'The 50/30/20 Teen Budget', emoji: '📊', body: '50% on essentials, 30% on fun and personal goals, 20% on savings. Track this in Grofience monthly. Adjust if you live with family — you can flip 50% into savings for big goals.' },
  { title: 'Avoiding the Comparison Trap', emoji: '🚫', body: 'Social media makes everyone look richer than they are. Buying things to fit in is the fastest way to stay broke. Define your own success — your goals, your timeline.' },
  { title: 'Building Your First Side Income', emoji: '🚀', body: 'Tutoring, freelancing, content creation, reselling — there has never been more ways for teens to earn. Start with one skill, charge fairly, save 50% of what you earn.' },
  { title: 'Why Compound Growth Is Magic', emoji: '✨', body: 'If you save $20/week from age 16 to 25 and invest it at 8%, you would have over $14,000 — without earning a single extra dollar after. Time is your superpower.' },
  { title: 'Your Next 30 Days', emoji: '🎯', body: 'Open Grofience. Log every transaction for 30 days. Set 1 short-term goal and 1 long-term goal. Review weekly. By month-end you will know more about money than 95% of adults.' },
]

function EbookView({ user, logoDataUrl }) {
  const ebookRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const logoSrc = logoDataUrl || LOGO_URL
  const [adminBooks, setAdminBooks] = useState([])

  useEffect(() => {
    fetch('/api/books').then(r => r.json()).then(d => setAdminBooks(d.books || [])).catch(() => {})
  }, [])

  async function downloadEbook() {
    setDownloading(true)
    try {
      const html2canvasMod = await import('html2canvas')
      const jspdfMod = await import('jspdf')
      const html2canvas = html2canvasMod.default
      const jsPDF = jspdfMod.default || jspdfMod.jsPDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const pages = ebookRef.current.querySelectorAll('[data-ebook-page]')
      await waitForImages(ebookRef.current)
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true, allowTaint: true, logging: false })
        const imgData = canvas.toDataURL('image/png')
        const imgH = (canvas.height * pageW) / canvas.width
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, Math.min(imgH, pageH), undefined, 'FAST')
      }
      pdf.save(`grofience-teen-money-guide-${user?.username || 'reader'}.pdf`)
      toast.success('E-Book downloaded! 📚 Happy reading!')
    } catch (e) { console.error(e); toast.error('Could not generate ebook') }
    finally { setDownloading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teen Money Mastery 📚</h2>
          <p className="text-sm text-gray-500">Your free guide to mastering money before you turn 20</p>
        </div>
        <Button onClick={downloadEbook} disabled={downloading} className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200">
          <Download className="w-4 h-4 mr-1" /> {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>

      {/* Admin-uploaded books */}
      {adminBooks.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" /> Library from Grofience Team
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminBooks.map(book => (
              <motion.div key={book.id} whileHover={{ y: -4 }} className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 flex flex-col">
                <div className="text-4xl mb-3">{book.coverEmoji}</div>
                <div className="font-bold text-gray-900 text-sm leading-snug mb-1">{book.title}</div>
                <div className="text-xs text-gray-400 mb-2">by {book.author || 'Grofience Team'}</div>
                {book.description && <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{book.description}</p>}
                <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 rounded-xl transition-all mt-auto">
                  <Download className="w-3.5 h-3.5" /> Read / Download PDF
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Weekly Challenges ─────────────────────────── */}
      <WeeklyChallenges />


      <Card className="overflow-hidden rounded-3xl border-blue-100/50">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-6 md:p-10 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white relative">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-yellow-300/15 rounded-full blur-3xl" />
            <div className="relative">
              <Logo className="h-9 mb-4 brightness-0 invert" />
              <div className="text-xs tracking-[0.3em] opacity-90 mb-3">FREE E-BOOK · 8 CHAPTERS</div>
              <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-3">Teen Money Mastery</h3>
              <p className="text-sm md:text-base text-blue-100 mb-6">A modern, no-fluff guide written for Gen Z. Read it in one sitting, apply it for life.</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: '/icons/3.png', text: 'Save smart' },
                  { icon: '/icons/7.png', text: 'Set goals' },
                  { icon: '🚀', text: 'Earn more' },
                  { icon: '✨', text: 'Compound it' },
                ].map(f => (
                  <div key={f.text} className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2 border border-white/20">
                    <UIIcon icon={f.icon} className="w-5 h-5 inline-block align-middle" />
                    <span className="text-xs font-semibold">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 md:p-10">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" /> Table of Contents</h3>
            <div className="space-y-2">
              {EBOOK_CHAPTERS.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50 transition">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <div className="text-lg">{c.emoji}</div>
                  <div className="text-sm font-semibold text-gray-900 truncate">{c.title}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-blue-100 text-xs text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Personalized for {user?.email || 'you'} · subtle watermark embedded
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden render target for PDF (offscreen but rendered) */}
      <div ref={ebookRef} style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none' }}>
        {/* Cover Page */}
        <div data-ebook-page style={{ width: '595px', height: '842px', background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color: 'white', padding: '60px 50px', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-120px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(253,224,71,0.15)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '12px 18px', display: 'inline-block', marginBottom: '40px' }}>
              <img src={logoSrc} alt="Grofience" style={{ height: '36px', width: 'auto' }} />
            </div>
            <div style={{ fontSize: '12px', letterSpacing: '0.4em', opacity: 0.85, marginBottom: '20px' }}>FREE E-BOOK</div>
            <div style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1, marginBottom: '20px', letterSpacing: '-0.02em' }}>Teen Money<br />Mastery</div>
            <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', lineHeight: 1.4 }}>A modern, no-fluff guide to mastering money before you turn 20.</div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>8 CHAPTERS · 5 MIN READ EACH</div>
          </div>
          <div style={{ position: 'absolute', bottom: '50px', left: '50px', right: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px', opacity: 0.7 }}>
            <div>Personalized for: <strong>{user?.email}</strong></div>
            <div>GROW · FINANCE · CONFIDENCE</div>
          </div>
        </div>
        {/* Chapter Pages */}
        {EBOOK_CHAPTERS.map((c, i) => (
          <div key={i} data-ebook-page style={{ width: '595px', height: '842px', background: 'white', padding: '60px 60px', fontFamily: 'Georgia, serif', position: 'relative' }}>
            {/* Watermark */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '36px', color: '#3b82f6', opacity: 0.04, fontWeight: 800, whiteSpace: 'nowrap', pointerEvents: 'none', fontFamily: 'system-ui' }}>
              {user?.email || 'grofience.com'}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3b82f6', paddingBottom: '16px', marginBottom: '32px' }}>
                <img src={logoSrc} alt="Grofience" style={{ height: '24px', width: 'auto' }} />
                <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.15em', fontFamily: 'system-ui' }}>CHAPTER {i + 1} OF {EBOOK_CHAPTERS.length}</div>
              </div>
              <div style={{ fontSize: '70px', marginBottom: '12px' }}>{c.emoji}</div>
              <div style={{ fontSize: '13px', color: '#3b82f6', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '8px', fontFamily: 'system-ui' }}>CHAPTER {i + 1}</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#0f172a', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.01em' }}>{c.title}</div>
              <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>{c.body}</div>
              {/* Pull quote */}
              <div style={{ marginTop: '36px', padding: '20px 24px', borderLeft: '4px solid #3b82f6', background: '#eff6ff', borderRadius: '0 12px 12px 0', fontSize: '14px', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.6, fontFamily: 'Georgia, serif' }}>
                "Small habits, repeated daily, beat huge plans done occasionally."
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '40px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontFamily: 'system-ui' }}>
              <span>Grofience · Teen Money Mastery</span>
              <span>Page {i + 2}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============= SETTINGS =============
function SettingsView({ user, refresh, onLogout }) {
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', username: user?.username || '', currency: user?.currency || 'USD', parentEmail: user?.parentEmail || '', phone: user?.phone || '' })
  const [notifPrefs, setNotifPrefs] = useState({
    goalReminders: user?.notificationPrefs?.goalReminders ?? true,
    weeklyInsights: user?.notificationPrefs?.weeklyInsights ?? true,
    achievementAlerts: user?.notificationPrefs?.achievementAlerts ?? true,
  })
  const [sendingParent, setSendingParent] = useState(false)
  const [resendingVerify, setResendingVerify] = useState(false)
  const [sendingParentWelcome, setSendingParentWelcome] = useState(false)
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  async function saveNotifPref(key, val) {
    const updated = { ...notifPrefs, [key]: val }
    setNotifPrefs(updated)
    try { await api('user/update', { method: 'PUT', body: JSON.stringify({ notificationPrefs: updated }) }) }
    catch (e) { toast.error('Failed to save preference') }
  }

  async function saveProfile() {
    try { await api('user/update', { method: 'PUT', body: JSON.stringify(profile) }); toast.success('Profile updated'); refresh() }
    catch (e) { toast.error(e.message) }
  }
  async function changePw() {
    try { await api('user/password', { method: 'PUT', body: JSON.stringify(pw) }); toast.success('Password changed'); setPw({ currentPassword: '', newPassword: '' }) }
    catch (e) { toast.error(e.message) }
  }
  async function sendParentNotification() {
    setSendingParent(true)
    try { await api('notifications/parent', { method: 'POST' }); toast.success('Report emailed to parent! 📧') }
    catch (e) { toast.error(e.message) } finally { setSendingParent(false) }
  }
  async function resendVerification() {
    setResendingVerify(true)
    try { await api('auth/resend-verification', { method: 'POST' }); toast.success('Verification email sent! Check your inbox.') }
    catch (e) { toast.error(e.message) } finally { setResendingVerify(false) }
  }

  async function sendParentWelcome() {
    setSendingParentWelcome(true)
    try {
      await api('auth/notify-parent', { method: 'POST' })
      toast.success('Welcome email sent to your parent! 📧')
    }
    catch (e) { toast.error(e.message || 'Failed to send email') }
    finally { setSendingParentWelcome(false) }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setUploading(true)
    try {
      // Resize & compress in browser to a square 256x256 base64 data URL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const img = new Image()
          img.onload = () => {
            const size = 256
            const canvas = document.createElement('canvas')
            canvas.width = size; canvas.height = size
            const ctx = canvas.getContext('2d')
            // Cover crop
            const scale = Math.max(size / img.width, size / img.height)
            const w = img.width * scale, h = img.height * scale
            ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
            resolve(canvas.toDataURL('image/jpeg', 0.85))
          }
          img.onerror = reject
          img.src = reader.result
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      await api('user/update', { method: 'PUT', body: JSON.stringify({ avatar: dataUrl }) })
      toast.success('Profile photo updated! 📸')
      refresh()
    } catch (err) { toast.error('Upload failed') } finally { setUploading(false) }
  }

  async function removePhoto() {
    try { await api('user/update', { method: 'PUT', body: JSON.stringify({ avatar: null }) }); toast.success('Photo removed'); refresh() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6 rounded-2xl border-blue-100/50">
          <h3 className="font-bold mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="w-20 h-20 ring-4 ring-blue-100">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">{(user?.username || 'U')[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-white transition disabled:opacity-50"
                  title="Upload photo"
                >
                  {uploading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{user?.username}</div>
                <div className="text-xs text-gray-500">Level {user?.level} · {user?.xp} XP</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-xs text-blue-600 hover:underline font-semibold">
                    {uploading ? 'Uploading...' : 'Upload photo'}
                  </button>
                  {user?.avatar && (
                    <>
                      <span className="text-gray-300">·</span>
                      <button onClick={removePhoto} className="text-xs text-rose-600 hover:underline font-semibold">Remove</button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!user?.emailVerified && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
                <span className="text-lg">✉️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Email not verified</p>
                  <p className="text-xs text-amber-600">Check your inbox or resend the link.</p>
                </div>
                <button onClick={resendVerification} disabled={resendingVerify} className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-60">
                  {resendingVerify ? 'Sending...' : 'Resend'}
                </button>
              </div>
            )}
            {user?.emailVerified && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5">
                <span className="text-base">✅</span>
                <p className="text-sm font-semibold">Email verified</p>
              </div>
            )}
            <div><Label>Full Name</Label><Input value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} /></div>
            <div><Label>Username</Label><Input value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} /></div>

            {/* Parent Email with verification status */}
            <div className="space-y-2">
              <Label>Parent Email</Label>
              <Input
                type="email"
                value={profile.parentEmail}
                onChange={e => setProfile({ ...profile, parentEmail: e.target.value })}
                placeholder="parent@example.com"
              />
              {user?.parentEmail && profile.parentEmail === user.parentEmail && (
                <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium ${
                  user.parentEmailVerified
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span>{user.parentEmailVerified ? '✅' : '⏳'}</span>
                    <span>{user.parentEmailVerified ? 'Parent notified' : 'Parent not yet notified'}</span>
                  </div>
                  {!user.parentEmailVerified && (
                    <button
                      onClick={sendParentWelcome}
                      disabled={sendingParentWelcome}
                      className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold px-2.5 py-1 rounded-lg transition disabled:opacity-60"
                    >
                      {sendingParentWelcome ? 'Sending...' : 'Send Welcome'}
                    </button>
                  )}
                  {user.parentEmailVerified && (
                    <button
                      onClick={sendParentWelcome}
                      disabled={sendingParentWelcome}
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold underline transition disabled:opacity-60"
                    >
                      {sendingParentWelcome ? 'Sending...' : 'Resend'}
                    </button>
                  )}
                </div>
              )}
              {!user?.parentEmail && profile.parentEmail && (
                <p className="text-xs text-blue-500">Save your profile to notify your parent.</p>
              )}
            </div>

            <div><Label>Phone Number</Label><Input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 8900" /></div>
            <div>
              <Label>Currency</Label>
              <Select value={profile.currency} onValueChange={v => setProfile({ ...profile, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveProfile} className="bg-blue-600 hover:bg-blue-700 w-full">Save Profile</Button>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-blue-100/50">
          <h3 className="font-bold mb-4">Security</h3>
          <div className="space-y-3">
            <div><Label>Current Password</Label><Input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} /></div>
            <div><Label>New Password</Label><Input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} /></div>
            <Button onClick={changePw} className="bg-blue-600 hover:bg-blue-700 w-full">Change Password</Button>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-100">
            <h4 className="font-semibold mb-3">Parent Notification</h4>
            <p className="text-xs text-gray-500 mb-3">Send your latest finance report directly to your parent's email.</p>
            {user?.parentEmail ? (
              <button onClick={sendParentNotification} disabled={sendingParent}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all mb-4">
                {sendingParent ? '⏳ Sending...' : '📧 Email Report to Parent'}
              </button>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 text-gray-500 text-sm rounded-xl px-4 py-3 mb-4 text-center">
                Add a Parent Email above to enable notifications
              </div>
            )}
            <h4 className="font-semibold mb-3">Notifications</h4>
            <div className="flex items-center justify-between mb-2"><span className="text-sm">Goal reminders</span><Switch checked={notifPrefs.goalReminders} onCheckedChange={v => saveNotifPref('goalReminders', v)} /></div>
            <div className="flex items-center justify-between mb-2"><span className="text-sm">Weekly insights</span><Switch checked={notifPrefs.weeklyInsights} onCheckedChange={v => saveNotifPref('weeklyInsights', v)} /></div>
            <div className="flex items-center justify-between"><span className="text-sm">Achievement alerts</span><Switch checked={notifPrefs.achievementAlerts} onCheckedChange={v => saveNotifPref('achievementAlerts', v)} /></div>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-100">
            <Button variant="outline" onClick={onLogout} className="w-full text-rose-600 hover:bg-rose-50">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Report Reason Modal
function ReportModal({ postId, postAuthor, open, onClose, onReported }) {
  const [reason, setReason] = useState('Spam')
  const [submitting, setSubmitting] = useState(false)
  const REASONS = ['Spam', 'Inappropriate', 'Misinformation', 'Harassment', 'Other']

  async function submit() {
    setSubmitting(true)
    try {
      await api(`community/posts/${postId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      toast.success('Post reported. Our team will review it shortly.')
      onReported(postId)
      onClose()
    } catch (e) {
      if (e.message?.includes('Already reported')) {
        toast.error('You have already reported this post.')
        onReported(postId)
      } else {
        toast.error(e.message || 'Failed to report')
      }
      onClose()
    } finally { setSubmitting(false) }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-lg">🚩</div>
          <div>
            <div className="font-bold text-gray-900 text-sm">Report Post</div>
            <div className="text-xs text-gray-400">by @{postAuthor}</div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-3">Why are you reporting this post?</p>
        <div className="space-y-1.5 mb-4">
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                reason === r ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 hover:border-rose-200 hover:bg-rose-50/50 text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-bold transition"
          >
            {submitting ? 'Reporting...' : 'Report'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}


// Default fallback data (used when admin hasn't set any data yet)
const DEFAULT_CHALLENGES = [
  { emoji: '☕', title: 'No Café Week', desc: 'Skip bought drinks for 7 days', xp: 50, participants: 128 },
  { emoji: '🛒', title: 'List Shopping Only', desc: 'Only buy what is on your list', xp: 40, participants: 94 },
  { emoji: '📝', title: 'Track Everything', desc: 'Log every expense for 7 days', xp: 60, participants: 207 },
  { emoji: '🎮', title: 'Game-Free Weekend', desc: 'Save your gaming budget this weekend', xp: 30, participants: 73 },
]
const DEFAULT_FINANCE_TIPS = [
  { icon: '/icons/36.png', title: 'Emergency Fund First', desc: 'Always keep 3 months of expenses saved before investing' },
  { icon: '/icons/4.png', title: 'Compound Interest', desc: 'Start saving early — money doubles every 7 years at 10% returns' },
  { icon: '/icons/7.png', title: 'SMART Goals', desc: 'Make Specific, Measurable, Achievable, Relevant, Time-bound goals' },
  { icon: '/icons/16.png', title: 'Avoid Impulse Buys', desc: 'Wait 24 hours before any unplanned purchase over ₹500' },
]
const DEFAULT_RESOURCES = [
  { title: '📖 Rich Dad Poor Dad — Key Lessons', type: 'Article', mins: 5, url: 'https://www.investopedia.com/articles/personal-finance/120615/rich-dad-poor-dad-book-review.asp' },
  { title: '🎥 How Compound Interest Works', type: 'Video', mins: 8, url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/compound-interest-tutorial/v/introduction-to-compound-interest' },
  { title: '📊 Budgeting for Teenagers', type: 'Guide', mins: 12, url: 'https://www.nerdwallet.com/article/finance/budgeting-for-teens' },
  { title: '💰 Your First Investment', type: 'Article', mins: 6, url: 'https://www.investopedia.com/articles/younginvestors/10/what-is-an-investment.asp' },
]
const DEFAULT_HEADER = { members: '2.4k', postsToday: 148, liveChallenges: 4, symbol: '🚀' }
function CommunityView({ user }) {
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [postText, setPostText] = useState('')
  const [postTag, setPostTag] = useState('Post')
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('feed')
  const [joined, setJoined] = useState(() => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('grofience_joined_challenges') || '{}') } catch { return {} }
  })
  const [waLink, setWaLink] = useState('')
  // Report/flag modal
  const [reportModal, setReportModal] = useState(null) // { postId, postAuthor }
  const [reportedPosts, setReportedPosts] = useState(new Set()) // local set of already-reported post IDs
  // Admin-managed community content
  const [headerStats, setHeaderStats] = useState(DEFAULT_HEADER)
  const [financeTips, setFinanceTips] = useState(DEFAULT_FINANCE_TIPS)
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES)
  const [resources, setResources] = useState(DEFAULT_RESOURCES)

  // Fetch posts from MongoDB
  async function fetchPosts() {
    try {
      const d = await api('community/posts')
      setPosts(d.posts || [])
    } catch { setPosts([]) }
    finally { setLoadingPosts(false) }
  }
  useEffect(() => { fetchPosts() }, [])

  // Fetch joined challenges from MongoDB on mount
  useEffect(() => {
    api('community/challenges/joined').then(d => {
      if (d.joined) {
        setJoined(d.joined)
        try { localStorage.setItem('grofience_joined_challenges', JSON.stringify(d.joined)) } catch {}
      }
    }).catch(() => {})
  }, [])

  // Helper to toggle joining a challenge with persistence
  async function toggleJoined(idx, status) {
    const next = { ...joined, [idx]: status }
    setJoined(next)
    try { localStorage.setItem('grofience_joined_challenges', JSON.stringify(next)) } catch {}
    try {
      await api('community/challenges/joined', {
        method: 'POST',
        body: JSON.stringify({ joined: next }),
      })
    } catch {}
  }

  // Fetch all admin-managed community content in one call
  useEffect(() => {
    api('community/config').then(d => {
      if (d.header) setHeaderStats(d.header)
      if (d.tips) setFinanceTips(d.tips)
      if (d.challenges) setChallenges(d.challenges)
      if (d.resources) setResources(d.resources)
      setWaLink(d.whatsappLink || '')
    }).catch(() => {})
  }, [])

  // Toggle like — saved to DB per user
  async function toggleLike(postId) {
    // Optimistic update
    setPosts(p => p.map(post =>
      post.id === postId
        ? { ...post, likes: post.likedByMe ? post.likes - 1 : post.likes + 1, likedByMe: !post.likedByMe }
        : post
    ))
    try {
      await api(`community/posts/${postId}/like`, { method: 'PUT' })
    } catch {
      fetchPosts() // revert on error
    }
  }

  // Submit post → save to DB
  async function submitPost() {
    if (!postText.trim() || submitting) return
    setSubmitting(true)
    try {
      const d = await api('community/posts', {
        method: 'POST',
        body: JSON.stringify({ content: postText.trim(), tag: postTag, avatar: '😊' }),
      })
      setPosts(p => [d.post, ...p])
      setPostText('')
      toast.success('Post shared with the community! 🎉')
    } catch (e) { toast.error(e.message || 'Failed to post') }
    finally { setSubmitting(false) }
  }

  // Delete own post
  async function deletePost(postId) {
    if (!confirm('Delete this post?')) return
    try {
      await api(`community/posts/${postId}`, { method: 'DELETE' })
      setPosts(p => p.filter(post => post.id !== postId))
      toast.success('Post deleted')
    } catch { toast.error('Failed to delete') }
  }

  const tabs = [{ id: 'feed', label: 'Feed', icon: MessageCircle }, { id: 'tips', label: 'Tips', icon: Lightbulb }, { id: 'challenges', label: 'Challenges', icon: Flame }]
  const tagColors = { Tip: 'bg-blue-100 text-blue-700', Achievement: 'bg-emerald-100 text-emerald-700', Challenge: 'bg-amber-100 text-amber-700', Post: 'bg-purple-100 text-purple-700' }
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">{headerStats.symbol || '🌟'}</div>
          <div>
            <h2 className="text-2xl font-bold">Teen Community {headerStats.symbol || '🌟'}</h2>
            <p className="text-violet-200 text-sm">Share tips, celebrate wins & grow together</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex gap-6 text-sm">
            <div className="text-center"><div className="text-2xl font-bold">{headerStats.members}</div><div className="text-violet-200">Members</div></div>
            <div className="text-center"><div className="text-2xl font-bold">{headerStats.postsToday}</div><div className="text-violet-200">Posts Today</div></div>
            <div className="text-center"><div className="text-2xl font-bold">{headerStats.liveChallenges}</div><div className="text-violet-200">Live Challenges</div></div>
          </div>
          {/* WhatsApp Join Button */}
          {waLink ? (
            <a
              href={waLink}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] transition-colors text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-green-900/30"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Join WhatsApp Group
            </a>
          ) : (
            <span className="text-xs text-violet-300 bg-white/10 px-3 py-2 rounded-xl">💬 Community link coming soon</span>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* FEED TAB */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Composer */}
          <Card className="p-4 rounded-2xl border-blue-100">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {(user?.username || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={postText} onChange={e => setPostText(e.target.value)}
                  placeholder="Share a money tip, achievement or ask for advice... 💬"
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[80px]"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">{postText.length}/280</span>
                  <Button onClick={submitPost} disabled={!postText.trim()} className="bg-violet-600 hover:bg-violet-700 rounded-xl h-9 px-4 text-sm gap-2">
                    <Send className="w-3.5 h-3.5" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts */}
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 rounded-2xl border-blue-100 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{post.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{post.author}</span>
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{post.badge}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[post.tag] || 'bg-gray-100 text-gray-600'}`}>{post.tag}</span>
                      <span className="text-xs text-gray-400 ml-auto">{post.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-all ${post.likedByMe ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}>
                        <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-rose-500' : ''}`} />{post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 font-medium transition-colors">
                        <MessageCircle className="w-4 h-4" />{post.comments}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent('💬 Grofience Teen Community:\n\n' + post.content + '\n\n— @' + post.author + (waLink ? '\nJoin us: ' + waLink : ''))}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#25D366] font-medium transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        WhatsApp
                      </a>
                      {/* Own post: show delete. Other's posts: show flag */}
                      <div className="ml-auto">
                        {post.userId === user?.id ? (
                          <button
                            onClick={() => deletePost(post.id)}
                            className="flex items-center gap-1 text-xs text-gray-300 hover:text-rose-500 font-medium transition-colors"
                            title="Delete your post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setReportModal({ postId: post.id, postAuthor: post.author })}
                            disabled={reportedPosts.has(post.id)}
                            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                              reportedPosts.has(post.id)
                                ? 'text-gray-200 cursor-not-allowed'
                                : 'text-gray-300 hover:text-orange-500'
                            }`}
                            title={reportedPosts.has(post.id) ? 'Already reported' : 'Report this post'}
                          >
                            🚩
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Report Modal */}
          {reportModal && (
            <ReportModal
              postId={reportModal.postId}
              postAuthor={reportModal.postAuthor}
              open={!!reportModal}
              onClose={() => setReportModal(null)}
              onReported={(postId) => setReportedPosts(prev => new Set([...prev, postId]))}
            />
          )}
        </div>
      )}

      {/* TIPS TAB */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {financeTips.map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-5 rounded-2xl border-blue-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-8 h-8 mb-3"><UIIcon icon={tip.icon} className="w-full h-full object-contain" /></div>
                  <div className="font-bold text-gray-900 mb-1">{tip.title}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{tip.desc}</div>
                </Card>
              </motion.div>
            ))}
          </div>
          {/* Learning Resources */}
          <Card className="p-5 rounded-2xl border-violet-100 bg-violet-50/50">
            <div className="flex items-center gap-2 mb-4"><BookMarked className="w-5 h-5 text-violet-600" /><h3 className="font-bold text-gray-900">Learning Resources</h3></div>
            <div className="space-y-3">
              {resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-violet-100 hover:border-violet-300 hover:shadow-md cursor-pointer transition-all no-underline">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{r.title}</div>
                    <div className="text-xs text-gray-400">{r.type} · {r.mins} min read</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">

          {/* ── Challenges Joined ─────────────────────── */}
          {Object.values(joined).some(Boolean) ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-base">✅</div>
                <h3 className="font-bold text-gray-900 text-base">Challenges Joined</h3>
                <span className="ml-auto text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                  {Object.values(joined).filter(Boolean).length} active
                </span>
              </div>
              <div className="space-y-3">
                {challenges.filter((_, i) => joined[i]).map((c, origIdx) => {
                  const idx = challenges.indexOf(c)
                  const pct = Math.min(100, Math.round(((c.participants + 1) / 300) * 100))
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="p-4 rounded-2xl border-emerald-200 bg-emerald-50/60">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">{c.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">{c.title}</span>
                              <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">JOINED</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">+{c.xp} XP</span>
                              <span className="text-xs text-gray-400">{c.participants + 1} teens joined</span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                                <span>Community progress</span><span>{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                          </div>
                          <button
                            onClick={() => { toggleJoined(idx, false); toast.success('Left challenge') }}
                            className="text-xs text-gray-400 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 flex-shrink-0"
                            title="Leave challenge"
                          >Leave</button>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-dashed border-blue-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold text-blue-800 text-sm">No challenges joined yet</div>
              <div className="text-xs text-blue-500 mt-1">Accept a challenge below to get started and earn XP!</div>
            </div>
          )}

          {/* ── New Challenges ─────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-base">🏆</div>
              <h3 className="font-bold text-gray-900 text-base">New Challenges</h3>
              <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                This Week
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-center">
              <div className="text-xs text-amber-700 font-medium">⚡ Complete challenges to earn XP and unlock badges!</div>
            </div>
            <div className="space-y-3">
              {challenges.filter((_, i) => !joined[i]).map((c, filteredIdx) => {
                const idx = challenges.indexOf(c)
                return (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: filteredIdx * 0.08 }}>
                    <Card className="p-5 rounded-2xl border-blue-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{c.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900">{c.title}</div>
                          <div className="text-sm text-gray-500">{c.desc}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">+{c.xp} XP</span>
                            <span className="text-xs text-gray-400">{c.participants} teens joined</span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { toggleJoined(idx, true); toast.success(`Joined "${c.title}"! 🎯`) }}
                          className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-md shadow-violet-200 transition-all flex items-center gap-1.5"
                        >
                          <span>Accept</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                      <div className="mt-3">
                        <Progress value={Math.min(100, Math.round((c.participants / 300) * 100))} className="h-1.5" />
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
              {challenges.filter((_, i) => !joined[i]).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🎊</div>
                  <div className="font-semibold text-sm">You've joined all challenges!</div>
                  <div className="text-xs mt-1">Check back next week for new ones.</div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ============= SUPPORT CHAT BUBBLE =============
function SupportChat({ user }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState(0)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  // Poll unread count every 15 seconds while closed; fetch full inbox on open
  useEffect(() => {
    if (!user) return
    async function pollUnread() {
      try {
        const d = await api('messages/unread')
        setUnread(d.unread || 0)
      } catch {}
    }
    pollUnread()
    const t = setInterval(pollUnread, 15000)
    return () => clearInterval(t)
  }, [user])

  useEffect(() => {
    if (open && user) fetchInbox()
  }, [open, user])

  // Auto-refresh when chat is open
  useEffect(() => {
    if (!open || !user) return
    const t = setInterval(fetchInbox, 8000)
    return () => clearInterval(t)
  }, [open, user])

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function fetchInbox() {
    setLoading(prev => messages.length === 0 ? true : prev)
    try {
      const d = await api('messages/inbox')
      setMessages(d.messages || [])
      setUnread(0)
    } catch {}
    finally { setLoading(false) }
  }

  async function sendReply(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderRole: 'student',
      senderName: user.fullName || user.username,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      readByAdmin: false,
    }
    setMessages(prev => [...prev, tempMsg])
    setText('')
    try {
      const d = await api('messages/reply', { method: 'POST', body: JSON.stringify({ text: tempMsg.text }) })
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? d.message : m))
    } catch { setMessages(prev => prev.filter(m => m.id !== tempMsg.id)); toast.error('Failed to send message') }
    finally { setSending(false) }
  }

  function fmtTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    const diff = Date.now() - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden"
            style={{ height: '480px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Grofience Support</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-blue-100 text-[11px]">We typically reply quickly</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition p-1">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {/* Welcome message */}
              <div className="flex justify-start">
                <div>
                  <div className="bg-white border border-blue-100 px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm text-gray-700 shadow-sm max-w-[260px]">
                    👋 Hi <strong>{user.fullName || user.username}</strong>! How can we help you today?
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 ml-1">Grofience Support</div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.map(msg => {
                const isStudent = msg.senderRole === 'student'
                return (
                  <div key={msg.id} className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                    <div>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[240px] ${
                        isStudent
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white border border-blue-100 text-gray-700 rounded-bl-md shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`text-[10px] text-gray-400 mt-0.5 ${isStudent ? 'text-right mr-1' : 'ml-1'}`}>
                        {fmtTime(msg.createdAt)}
                        {isStudent && msg.readByAdmin && <span className="ml-1 text-blue-400"> ✓ Seen</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendReply} className="px-3 py-3 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(e) } }}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ maxHeight: '80px', overflowY: 'auto' }}
                />
                <button type="submit" disabled={!text.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all flex-shrink-0">
                  <Send size={15} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors"
        aria-label="Open support chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare size={22} />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}

// ============= ROOT APP =============
function App() {
  const [view, setView] = useState('splash') // splash, auth, app
  const [active, setActive] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const { push: pushNotif } = useNotif()
  const prevBadgesRef = useRef([])
  const prevLevelRef = useRef(1)
  const prevEmailVerifiedRef = useRef(null)
  const prevGoalsCompletedRef = useRef(new Set())
  const dataLoadedRef = useRef(false) // true after first refresh — prevents firing notifs on initial load

  // Pre-fetch logo as base64 so html2canvas always renders it in PDFs
  useEffect(() => {
    fetch(LOGO_URL).then(r => r.blob()).then(blob => {
      const reader = new FileReader()
      reader.onload = () => setLogoDataUrl(reader.result)
      reader.readAsDataURL(blob)
    }).catch(() => {})
  }, [])

  // bootstrap — check localStorage first, then sessionStorage
  useEffect(() => {
    const token = localStorage.getItem('grofience_token') || sessionStorage.getItem('grofience_token')
    if (!token) return
    api('auth/me').then(d => {
      const u = d.user
      // Seed refs so no false notifications fire on first data load
      prevBadgesRef.current = u.badges || []
      prevLevelRef.current = u.level ?? 0
      prevEmailVerifiedRef.current = u.emailVerified
      setUser(u)
      setView('app')
    }).catch(() => {
      localStorage.removeItem('grofience_token')
      sessionStorage.removeItem('grofience_token')
    })
  }, [])

  async function refresh() {
    const [t, g, a] = await Promise.all([api('transactions'), api('goals'), api('analytics')])
    setTransactions(t.transactions || [])
    const newGoals = g.goals || []
    setGoals(newGoals)
    setAnalytics(a)
    if (a?.user) {
      const newUser = a.user
      if (dataLoadedRef.current) {
        // ── Only fire notifications after the first load ──
        // Detect newly earned badges
        const newBadges = (newUser.badges || []).filter(b => !prevBadgesRef.current.includes(b))
        newBadges.forEach(b => {
          pushNotif({
            icon: '/icons/6.png', title: 'Badge Unlocked! 🎉',
            desc: `You earned the "${b}" badge! Keep it up!`,
            iconBg: 'bg-amber-100', accentColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
          })
        })
        // Detect level up
        if (newUser.level > prevLevelRef.current && prevLevelRef.current > 0) {
          pushNotif({
            icon: '👑', title: `Level ${newUser.level} Reached! 🚀`,
            desc: `Amazing! You leveled up to Level ${newUser.level} with ${newUser.xp} XP total!`,
            iconBg: 'bg-violet-100', accentColor: 'bg-gradient-to-r from-violet-500 to-indigo-500',
          })
        }
        // Detect email verification
        if (prevEmailVerifiedRef.current === false && newUser.emailVerified === true) {
          pushNotif({
            icon: '/icons/1.png', title: 'Email Verified!',
            desc: 'Your email is now verified. All features are unlocked! 🎉',
            iconBg: 'bg-emerald-100', accentColor: 'bg-gradient-to-r from-emerald-400 to-green-500',
          })
        }
        // Detect newly completed goals
        newGoals.forEach(g => {
          if (g.target > 0 && g.saved >= g.target && !prevGoalsCompletedRef.current.has(g.id)) {
            pushNotif({
              icon: '/icons/7.png', title: 'Goal Completed! 🎉',
              desc: `${g.emoji || '🎯'} "${g.title}" is 100% funded! Amazing work!`,
              iconBg: 'bg-emerald-100', accentColor: 'bg-gradient-to-r from-emerald-400 to-teal-500',
            })
          }
        })
      }
      // Always update refs (seeds them on first load, tracks changes on subsequent loads)
      prevBadgesRef.current = newUser.badges || []
      prevLevelRef.current = newUser.level ?? 0
      prevEmailVerifiedRef.current = newUser.emailVerified
      prevGoalsCompletedRef.current = new Set(
        newGoals.filter(g => g.target > 0 && g.saved >= g.target).map(g => g.id)
      )
      dataLoadedRef.current = true
      setUser(newUser)
    }
  }

  useEffect(() => { if (view === 'app') refresh().catch(() => {}) }, [view])

  function handleLogin(u) {
    // Seed refs with current user data so we don't fire false notifications on first load
    prevBadgesRef.current = u.badges || []
    prevLevelRef.current = u.level || 1
    prevEmailVerifiedRef.current = u.emailVerified
    setUser(u)
    setView('app')
    // Welcome back notification
    pushNotif({
      icon: '👋', title: `Welcome back, ${u.username || u.fullName}!`,
      desc: `You have ${u.xp || 0} XP and are Level ${u.level ?? 0}. Keep going!`,
      iconBg: 'bg-blue-100', accentColor: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    })
  }
  function logout() {
    localStorage.removeItem('grofience_token')
    sessionStorage.removeItem('grofience_token')
    setUser(null); setView('auth'); setActive('dashboard')
    toast.success('Logged out')
  }

  if (view === 'splash') return <Splash onDone={() => setView(user ? 'app' : 'landing')} />
  if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} onLogin={() => setView('auth')} />
  if (view === 'auth') return <AuthPage onLogin={handleLogin} onBackToLanding={() => setView('landing')} />

  const monthMatch = active.startsWith('month-') ? Number(active.split('-')[1]) : null
  // Filter all data by selected year
  const txByYear = transactions.filter(t => new Date(t.date).getFullYear() === year)

  return (
    <div className={`min-h-screen flex ${dark ? 'dark bg-gray-950' : 'bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20'}`}>
      <Sidebar active={active} setActive={setActive} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} dark={dark} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={user} onMobileToggle={() => setMobileOpen(true)} dark={dark} setDark={setDark} onRefresh={refresh} year={year} setYear={setYear} transactions={transactions} goals={goals} analytics={analytics} setActive={setActive} />
        <main className={`flex-1 p-4 lg:p-8 overflow-x-hidden ${dark ? 'text-gray-100' : ''}`}>
          {/* Email not verified banner */}
          {user && !user.emailVerified && (
            <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-amber-800">
                <span className="text-lg">📧</span>
                <span className="text-sm font-medium">Please verify your email address to unlock all features.</span>
              </div>
              <button onClick={() => setActive('settings')} className="text-xs font-bold text-amber-700 underline hover:text-amber-900">
                Go to Settings →
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {active === 'dashboard' && <DashboardView user={user} transactions={txByYear} goals={goals} analytics={analytics} />}
              {monthMatch !== null && <MonthlyTracker user={user} monthIndex={monthMatch} transactions={txByYear} refresh={refresh} year={year} />}
              {active === 'goals' && <GoalsView user={user} goals={goals} refresh={refresh} />}
              {active === 'ebook' && <EbookView user={user} logoDataUrl={logoDataUrl} />}
              {active === 'certificate' && <CertificateView user={user} analytics={analytics} transactions={transactions} goals={goals} logoDataUrl={logoDataUrl} />}
              {active === 'parent' && <ParentReportView user={user} transactions={transactions} goals={goals} analytics={analytics} logoDataUrl={logoDataUrl} />}
              {active === 'community' && <CommunityView user={user} />}
              {active === 'settings' && <SettingsView user={user} refresh={refresh} onLogout={logout} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* Floating support chat bubble */}
      <SupportChat user={user} />
    </div>
  )
}

export default function RootPage() {
  return (
    <NotifProvider>
      <App />
    </NotifProvider>
  )
}
