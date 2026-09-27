import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import twilio from 'twilio'
import { Resend } from 'resend'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'grofience'
const JWT_SECRET = process.env.JWT_SECRET || 'grofience_secret'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@grofience.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET + '_admin'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// ─── SECURITY WARNINGS ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) console.error('[Grofience] ⚠️  SECURITY: JWT_SECRET env var not set! Using insecure default.')
  if (!process.env.ADMIN_PASSWORD) console.error('[Grofience] ⚠️  SECURITY: ADMIN_PASSWORD env var not set! Using default "admin123".')
  if (!process.env.MONGO_URL) console.error('[Grofience] ⚠️  SECURITY: MONGO_URL env var not set!')
}

let cachedClient = null
async function getDb(retries = 3) {
  // Validate cached connection with a ping before reusing it
  if (cachedClient) {
    try {
      await cachedClient.db('admin').command({ ping: 1 })
      return cachedClient.db(DB_NAME)
    } catch {
      console.warn('[Grofience] Cached DB connection stale — reconnecting...')
      try { await cachedClient.close() } catch {}
      cachedClient = null
    }
  }

  let lastErr
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = new MongoClient(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        retryReads: true,
        // Helps with Atlas SRV DNS resolution on flaky networks
        family: 4,
      })
      await client.connect()
      // Verify the connection is truly alive
      await client.db('admin').command({ ping: 1 })
      cachedClient = client
      if (attempt > 1) console.log(`[Grofience] DB connected on attempt ${attempt}`)
      return client.db(DB_NAME)
    } catch (err) {
      lastErr = err
      console.warn(`[Grofience] DB connect attempt ${attempt}/${retries} failed: ${err.message}`)
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1500ms
        await new Promise(r => setTimeout(r, 500 * attempt))
      }
    }
  }
  throw lastErr
}

// ─── SMS (Twilio) ─────────────────────────────────────────────────────────────
async function sendSms({ to, body }) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) {
    console.warn('[Grofience] Twilio not configured – skipping SMS to:', to)
    return false
  }
  try {
    const client = twilio(sid, token)
    await client.messages.create({ body, from, to })
    return true
  } catch (e) {
    console.error('[Grofience] Twilio error:', e.message)
    return false
  }
}

// ─── RESEND EMAIL ─────────────────────────────────────────────────────────────
async function sendWithResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { sent: false, restricted: false }
  try {
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    })
    const data = await res.json()
    if (!res.ok) {
      // validation_error = Resend free plan restriction (can only send to account owner)
      if (data.name === 'validation_error') {
        // Try fallback sender if we used a custom one
        if (from !== 'onboarding@resend.dev') {
          const res2 = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: 'onboarding@resend.dev', to, subject, html }),
          })
          const data2 = await res2.json()
          if (res2.ok) {
            console.log('[Grofience] Resend fallback sent OK, id:', data2.id)
            return { sent: true, restricted: false }
          }
          if (data2.name === 'validation_error') {
            console.warn('[Grofience] Resend test-mode: can only deliver to account owner email.')
            return { sent: false, restricted: true }
          }
        }
        console.warn('[Grofience] Resend test-mode restriction: can only send to account owner email.')
        return { sent: false, restricted: true }
      }
      console.error('[Grofience] Resend error:', JSON.stringify(data))
      return { sent: false, restricted: false }
    }
    console.log('[Grofience] Resend sent OK, id:', data.id)
    return { sent: true, restricted: false }
  } catch (e) {
    console.error('[Grofience] Resend fetch error:', e.message)
    return { sent: false, restricted: false }
  }
}

// ─── EMAIL (Nodemailer fallback) ──────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Grofience] Email not configured – skipping:', to)
    return false
  }
  try {
    const t = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })
    await t.sendMail({ from: process.env.EMAIL_FROM || `Grofience <${process.env.EMAIL_USER}>`, to, subject, html })
    return true
  } catch (e) {
    console.error('[Grofience] Email error:', e.message)
    return false
  }
}

function emailWrap(body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:Inter,system-ui,sans-serif;background:#f0f4ff;margin:0;padding:32px 16px}
    .c{max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(59,130,246,.12)}
    .h{background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px;text-align:center;color:#fff;font-size:24px;font-weight:800}
    .b{padding:32px} h1{color:#0f172a;font-size:20px;margin:0 0 8px}
    p{color:#475569;line-height:1.6;margin:8px 0}
    .btn{display:inline-block;background:#2563eb;color:#fff!important;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;margin:20px 0}
    .f{padding:20px 32px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8}
  </style></head><body><div class="c">
    <div class="h">grofience</div>
    <div class="b">${body}</div>
    <div class="f">© ${new Date().getFullYear()} Grofience · Grow · Finance · Confidence</div>
  </div></body></html>`
}

function verifyHtml(name, url) {
  return emailWrap(`<h1>Verify your email ✉️</h1>
    <p>Hi <strong>${name}</strong>, welcome to Grofience! Click below to verify your email.</p>
    <div style="text-align:center"><a href="${url}" class="btn">Verify Email</a></div>
    <p style="font-size:12px;color:#94a3b8">Link: ${url}<br>Expires in 24 hours.</p>`)
}

function welcomeHtml(name, verifyUrl) {
  return emailWrap(`
    <h1>Welcome to Grofience, ${name}! 🎉</h1>
    <p>You're now part of a community of teens learning to <strong>grow their finances</strong> with confidence.</p>
    <div style="background:linear-gradient(135deg,#eff6ff,#f0fdf4);border-radius:16px;padding:20px;margin:16px 0">
      <p style="margin:0 0 8px;font-weight:700;color:#1e40af">🚀 Here's what you can do:</p>
      <ul style="margin:0;padding-left:20px;color:#334155">
        <li style="margin:4px 0">📊 <strong>Track income & expenses</strong> every day</li>
        <li style="margin:4px 0">🎯 <strong>Set financial goals</strong> and save towards them</li>
        <li style="margin:4px 0">🏆 <strong>Earn XP & badges</strong> as you build habits</li>
        <li style="margin:4px 0">👥 <strong>Join teen challenges</strong> in the Community</li>
        <li style="margin:4px 0">📚 <strong>Read finance e-books</strong> curated for you</li>
      </ul>
    </div>
    <p>First things first — please verify your email address to unlock all features:</p>
    <div style="text-align:center"><a href="${verifyUrl}" class="btn">✅ Verify My Email</a></div>
    <p style="font-size:12px;color:#94a3b8">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
  `)
}

function parentWelcomeHtml(teenName, parentEmail, studentEmail) {
  return emailWrap(`
    <h1>👋 You've been linked to ${teenName}'s Grofience account</h1>
    <p>Hi there! <strong>${teenName}</strong> has added your email (<strong>${parentEmail}</strong>) as their parent/guardian on <strong>Grofience</strong> — a financial literacy platform for teens.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0">
      <p style="margin:0;color:#166534;font-weight:600">What is Grofience?</p>
      <p style="margin:8px 0 0;color:#166534;font-size:14px">Grofience helps teenagers track their income, expenses, and savings goals to build lifelong money habits. As a linked parent, you can receive periodic progress reports showing their financial activity.</p>
    </div>
    <p><strong>What this means for you:</strong></p>
    <ul style="color:#334155">
      <li style="margin:4px 0">📊 You may receive finance progress reports from ${teenName}</li>
      <li style="margin:4px 0">📧 Reports are only sent when ${teenName} chooses to share them</li>
      <li style="margin:4px 0">🔒 No account or password needed on your end</li>
    </ul>
    <p style="font-size:12px;color:#94a3b8">If ${teenName} did not add your email or if this was a mistake, no action is required — simply ignore this message. Your email will not be used for anything other than optional progress reports.</p>
    <p style="font-size:12px;color:#94a3b8">Teen account: ${studentEmail}</p>
  `)
}

function otpHtml(name, otp) {
  return emailWrap(`<h1>Your Password Reset OTP 🔐</h1>
    <p>Hi <strong>${name}</strong>, use this 6-digit code to reset your Grofience password.</p>
    <div style="background:#eff6ff;border:2px dashed #93c5fd;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
      <span style="font-size:42px;font-weight:900;color:#2563eb;letter-spacing:12px">${otp}</span>
    </div>
    <p style="text-align:center;color:#64748b;font-size:13px">⏱️ This OTP expires in <strong>10 minutes</strong></p>
    <p style="font-size:12px;color:#94a3b8">If you didn't request this, ignore this email.</p>`)
}

function resetHtml(name, url) {
  return emailWrap(`<h1>Reset your password 🔐</h1>
    <p>Hi <strong>${name}</strong>, we received a password reset request.</p>
    <div style="text-align:center"><a href="${url}" class="btn">Reset Password</a></div>
    <p style="font-size:12px;color:#94a3b8">Link: ${url}<br>Expires in 1 hour. If you didn't request this, ignore the email.</p>`)
}

function parentHtml(user, analytics, txs, goals) {
  const rate = Math.round(analytics?.savingsRate || 0)
  const completed = goals.filter(g => g.saved >= g.target && g.target > 0).length
  const tip = rate >= 30
    ? '🌟 Excellent! Saving more than 30% of income.'
    : rate > 0 ? `💡 Saving ${rate}% — encourage them to aim for 30%+.`
    : '⚠️ Expenses exceeded income. Great time for a budgeting talk.'
  return emailWrap(`<h1>📊 ${user.fullName || user.username}'s Finance Report</h1>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:10px;background:#f0fdf4;font-weight:700;color:#166534">💰 Total Income</td><td style="padding:10px;text-align:right;font-weight:800;color:#166534">₹${analytics?.totalIncome || 0}</td></tr>
      <tr><td style="padding:10px;font-weight:700;color:#991b1b">🛒 Total Expenses</td><td style="padding:10px;text-align:right;font-weight:800;color:#991b1b">₹${analytics?.totalExpense || 0}</td></tr>
      <tr><td style="padding:10px;background:#eff6ff;font-weight:700;color:#1e40af">🏦 Net Saved</td><td style="padding:10px;text-align:right;font-weight:800;color:#1e40af">₹${analytics?.totalSaved || 0}</td></tr>
      <tr><td style="padding:10px;font-weight:700;color:#7c3aed">📈 Savings Rate</td><td style="padding:10px;text-align:right;font-weight:800;color:#7c3aed">${rate}%</td></tr>
    </table>
    <p><b>Finance Score:</b> ${analytics?.score || 0}/100 &nbsp;|&nbsp; <b>Transactions:</b> ${txs.length} &nbsp;|&nbsp; <b>Goals:</b> ${goals.length} (${completed} completed)</p>
    <p><b>Level:</b> ${user.level || 1} &nbsp;|&nbsp; <b>XP:</b> ${user.xp || 0} &nbsp;|&nbsp; <b>Badges:</b> ${(user.badges || []).join(', ') || 'None yet'}</p>
    <p style="padding:14px;background:#fef3c7;border-radius:12px;font-size:13px">${tip}</p>
    <p style="font-size:12px;color:#94a3b8">Sent ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>`)
}

// ─── AUTH HELPERS ────────────────────────────────────────────────────────────
function sign(user) { return jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '30d' }) }
function signAdmin(email) { return jwt.sign({ email, role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '12h' }) }
function authUser(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) return null
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}
function authAdmin(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) return null
  try { const d = jwt.verify(token, ADMIN_JWT_SECRET); return d.role === 'admin' ? d : null } catch { return null }
}
function j(data, status = 200) { return NextResponse.json(data, { status }) }

// ─── HANDLER ─────────────────────────────────────────────────────────────────
async function handle(request, { params }) {
  const path = (params?.path || []).join('/')
  const method = request.method

  // ADMIN LOGIN — does NOT need DB (checks env vars only)
  if (path === 'admin/login' && method === 'POST') {
    const { email, password } = await request.json()
    if (!email || !password) return j({ error: 'Missing credentials' }, 400)
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return j({ error: 'Invalid admin credentials' }, 401)
    return j({ token: signAdmin(email), admin: { email, role: 'admin' } })
  }

  // All other routes need the database
  let db
  try {
    db = await getDb()
  } catch (err) {
    console.error('[Grofience] DB connection failed:', err.message)
    return j({ error: 'Database connection failed. Please try again.' }, 503)
  }

  // ADMIN STATS
  if (path === 'admin/stats' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const week = new Date(); week.setDate(week.getDate() - 7)
    return j({ totalUsers: users.length, newToday: users.filter(u => new Date(u.createdAt) >= today).length, newThisWeek: users.filter(u => new Date(u.createdAt) >= week).length, users: users.map(({ _id, ...u }) => u) })
  }

  // ADMIN USER DETAIL — get full profile + analytics for one user
  if (path.startsWith('admin/users/') && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const userId = path.split('/')[2]
    const user = await db.collection('users').findOne({ id: userId }, { projection: { password: 0, verificationToken: 0 } })
    if (!user) return j({ error: 'User not found' }, 404)
    const [txs, goals] = await Promise.all([
      db.collection('transactions').find({ userId }).toArray(),
      db.collection('goals').find({ userId }).toArray(),
    ])
    const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
    const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
    const goalsAchieved = goals.filter(g => g.target > 0 && g.saved >= g.target).length
    const { _id, ...safe } = user
    // Build certificate code from user id (same format as cert search)
    const certCode = `GRO-${(safe.id || '').slice(0, 8).toUpperCase()}-${new Date(safe.createdAt || Date.now()).getFullYear()}`
    return j({ user: { ...safe, certCode }, analytics: { totalIncome, totalExpense, goalsAchieved, totalGoals: goals.length, txCount: txs.length } })
  }

  // ADMIN DELETE USER
  if (path.startsWith('admin/users/') && method === 'DELETE') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const userId = path.split('/')[2]
    await Promise.all([
      db.collection('users').deleteOne({ id: userId }),
      db.collection('transactions').deleteMany({ userId }),
      db.collection('goals').deleteMany({ userId }),
    ])
    return j({ success: true })
  }

  // ADMIN CERTIFICATE SEARCH — find student by cert ID (GRO-XXXXXXXX-YYYY)
  if (path === 'admin/certificate-search' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const url = new URL(request.url)
    const certId = (url.searchParams.get('certId') || '').trim().toUpperCase()
    if (!certId) return j({ error: 'Certificate ID required' }, 400)
    const match = certId.match(/^GRO-([A-Z0-9]{8})-(\d{4})$/)
    if (!match) return j({ error: 'Invalid format. Expected: GRO-XXXXXXXX-YYYY' }, 400)
    const idPrefix = match[1].toLowerCase()
    const users = await db.collection('users').find({}).toArray()
    const user = users.find(u => (u.id || '').toLowerCase().startsWith(idPrefix))
    if (!user) return j({ error: 'No student found with this certificate ID' }, 404)
    const [txs, goals] = await Promise.all([
      db.collection('transactions').find({ userId: user.id }).sort({ date: -1 }).toArray(),
      db.collection('goals').find({ userId: user.id }).sort({ createdAt: -1 }).toArray(),
    ])
    const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalSaved = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0
    const score = Math.max(0, Math.min(100, Math.round(savingsRate * 0.7 + (goals.length ? 15 : 0) + (txs.length > 5 ? 15 : txs.length * 2))))
    const completedGoals = goals.filter(g => g.target > 0 && g.saved >= g.target).length
    const { password: _p, verificationToken: _v, _id, ...safe } = user
    return j({
      user: safe,
      analytics: { totalIncome, totalExpense, totalSaved, savingsRate, score, txCount: txs.length, goalCount: goals.length, completedGoals },
      transactions: txs.map(({ _id, ...t }) => t),
      goals: goals.map(({ _id, ...g }) => g),
    })
  }

  // ADMIN BOOKS — GET (list all books)
  if (path === 'admin/books' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const books = await db.collection('books').find({}).sort({ createdAt: -1 }).toArray()
    return j({ books: books.map(({ _id, ...b }) => b) })
  }

  // ADMIN BOOKS — POST (add new book)
  if (path === 'admin/books' && method === 'POST') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    if (!body.title || !body.pdfUrl) return j({ error: 'Title and PDF URL are required' }, 400)
    const book = {
      id: uuidv4(),
      title: body.title,
      description: body.description || '',
      pdfUrl: body.pdfUrl,
      coverEmoji: body.coverEmoji || '📚',
      author: body.author || 'Grofience Team',
      createdAt: new Date().toISOString(),
    }
    await db.collection('books').insertOne(book)
    const { _id, ...safe } = book
    return j({ book: safe })
  }

  // ADMIN BOOKS — DELETE
  if (path.startsWith('admin/books/') && method === 'DELETE') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const bookId = path.split('/')[2]
    await db.collection('books').deleteOne({ id: bookId })
    return j({ success: true })
  }

  // PUBLIC BOOKS — GET (for frontend E-Book page)
  if (path === 'books' && method === 'GET') {
    const books = await db.collection('books').find({}).sort({ createdAt: -1 }).toArray()
    return j({ books: books.map(({ _id, ...b }) => b) })
  }

  // COMMUNITY POSTS — GET (public feed, newest first, max 50)
  if (path === 'community/posts' && method === 'GET') {
    const posts = await db.collection('community_posts').find({}).sort({ createdAt: -1 }).limit(50).toArray()
    const u = authUser(request)
    return j({ posts: posts.map(({ _id, ...p }) => ({ ...p, likedByMe: u ? (p.likedBy || []).includes(u.id) : false })) })
  }

  // COMMUNITY POSTS — POST (create, auth required)
  if (path === 'community/posts' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    if (!body.content?.trim()) return j({ error: 'Content required' }, 400)
    if (body.content.length > 280) return j({ error: 'Max 280 characters' }, 400)
    const user = await db.collection('users').findOne({ id: u.id })
    const post = {
      id: uuidv4(),
      userId: u.id,
      author: user?.username || 'Member',
      fullName: user?.fullName || user?.username || 'Member',
      avatar: body.avatar || '😊',
      badge: user?.badges?.[0] || 'Member',
      content: body.content.trim(),
      tag: body.tag || 'Post',
      likes: 0,
      likedBy: [],
      comments: 0,
      createdAt: new Date().toISOString(),
    }
    await db.collection('community_posts').insertOne(post)
    const { _id, ...safe } = post
    return j({ post: { ...safe, likedByMe: false } })
  }

  // COMMUNITY POSTS — PUT like toggle (auth required)
  if (path.startsWith('community/posts/') && path.endsWith('/like') && method === 'PUT') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const postId = path.split('/')[2]
    const post = await db.collection('community_posts').findOne({ id: postId })
    if (!post) return j({ error: 'Post not found' }, 404)
    const likedBy = post.likedBy || []
    const alreadyLiked = likedBy.includes(u.id)
    if (alreadyLiked) {
      await db.collection('community_posts').updateOne({ id: postId }, { $pull: { likedBy: u.id }, $inc: { likes: -1 } })
    } else {
      await db.collection('community_posts').updateOne({ id: postId }, { $addToSet: { likedBy: u.id }, $inc: { likes: 1 } })
    }
    return j({ liked: !alreadyLiked })
  }

  // COMMUNITY POSTS — DELETE own post
  if (path.startsWith('community/posts/') && path.split('/').length === 3 && method === 'DELETE') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const postId = path.split('/')[2]
    await db.collection('community_posts').deleteOne({ id: postId, userId: u.id })
    return j({ success: true })
  }

  // COMMUNITY POSTS — POST report/flag a post
  if (path.match(/^community\/posts\/[^/]+\/report$/) && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const postId = path.split('/')[2]
    const post = await db.collection('community_posts').findOne({ id: postId })
    if (!post) return j({ error: 'Post not found' }, 404)
    if (post.userId === u.id) return j({ error: 'Cannot report your own post' }, 400)
    // Prevent duplicate reports from same user
    const existing = await db.collection('post_reports').findOne({ postId, reporterId: u.id })
    if (existing) return j({ error: 'Already reported' }, 409)
    const body = await request.json().catch(() => ({}))
    const report = {
      id: uuidv4(),
      postId,
      postContent: post.content,
      postAuthor: post.author,
      reporterId: u.id,
      reporterUsername: u.username,
      reason: body.reason || 'Other',
      createdAt: new Date().toISOString(),
    }
    await db.collection('post_reports').insertOne(report)
    // Increment report count on the post itself
    await db.collection('community_posts').updateOne({ id: postId }, { $inc: { reportCount: 1 } })
    const { _id, ...safe } = report
    return j({ success: true, report: safe })
  }

  // SIGNUP
  if (path === 'auth/signup' && method === 'POST') {
    const { fullName, username, email, password, age, parentEmail, phone } = await request.json()
    if (!email || !password || !username) return j({ error: 'Missing fields' }, 400)
    if (await db.collection('users').findOne({ email })) return j({ error: 'EMAIL_EXISTS', message: 'This email is already registered. Please log in instead.' }, 400)
    if (await db.collection('users').findOne({ username })) return j({ error: 'USERNAME_EXISTS', message: 'This username is already taken. Please choose another.' }, 400)
    const verificationToken = uuidv4()
    const parentToken = parentEmail ? uuidv4() : null
    const user = {
      id: uuidv4(), fullName: fullName || username, username, email,
      password: await bcrypt.hash(password, 10),
      phone: phone || null, age: age || null,
      parentEmail: parentEmail || null,
      parentEmailVerified: false,
      parentVerificationToken: parentToken,
      currency: 'INR', xp: 0, level: 0, streak: 0, lastActivityDate: null,
      badges: [], avatar: null, emailVerified: false, verificationToken,
      createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(),
    }
    await db.collection('users').insertOne(user)
    const token = sign(user)
    const { password: _p, verificationToken: _v, parentVerificationToken: _pt, _id, ...safe } = user
    const verifyUrl = `${BASE_URL}/verify-email?token=${verificationToken}`
    // Send rich welcome email with verification link (try Resend first, then SMTP)
    const welcomeEmailHtml = welcomeHtml(user.fullName || username, verifyUrl)
    sendWithResend({ to: email, subject: `Welcome to Grofience, ${user.fullName || username}! 🎉 — Please verify your email`, html: welcomeEmailHtml })
      .then(r => { if (!r.sent) sendEmail({ to: email, subject: `Welcome to Grofience, ${user.fullName || username}! 🎉`, html: welcomeEmailHtml }) })
      .catch(() => {})
    // If parent email provided, send parent welcome email
    if (parentEmail) {
      const pHtml = parentWelcomeHtml(user.fullName || username, parentEmail, email)
      sendWithResend({ to: parentEmail, subject: `${user.fullName || username} added you as their parent on Grofience 👨‍👩‍👧`, html: pHtml })
        .then(r => { if (!r.sent) sendEmail({ to: parentEmail, subject: `${user.fullName || username} added you as their parent on Grofience 👨‍👩‍👧`, html: pHtml }) })
        .catch(() => {})
    }
    return j({ token, user: safe })
  }

  // LOGIN
  if (path === 'auth/login' && method === 'POST') {
    const { email, password } = await request.json()
    const user = await db.collection('users').findOne({ $or: [{ email }, { username: email }] })
    if (!user || !await bcrypt.compare(password, user.password)) return j({ error: 'Invalid credentials' }, 401)
    const today = new Date().toISOString().slice(0, 10)
    const last = user.lastActivityDate
    let streak = user.streak || 0
    if (last) {
      const diff = Math.floor((new Date(today) - new Date(last)) / 86400000)
      streak = diff === 1 ? streak + 1 : diff > 1 ? 1 : streak
    } else { streak = 1 }
    await db.collection('users').updateOne({ id: user.id }, { $set: { lastLoginAt: new Date().toISOString(), streak, lastActivityDate: today } })
    const token = sign(user)
    const { password: _p, verificationToken: _v, _id, ...safe } = user
    return j({ token, user: { ...safe, lastLoginAt: new Date().toISOString(), streak } })
  }

  // GET ME
  if (path === 'auth/me' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const user = await db.collection('users').findOne({ id: u.id })
    if (!user) return j({ error: 'Not found' }, 404)
    const { password: _p, verificationToken: _v, _id, ...safe } = user
    return j({ user: safe })
  }

  // VERIFY EMAIL
  if (path === 'auth/verify-email' && method === 'POST') {
    const { token } = await request.json()
    if (!token) return j({ error: 'Missing token' }, 400)
    const user = await db.collection('users').findOne({ verificationToken: token })
    if (!user) return j({ error: 'Invalid or expired link' }, 400)
    await db.collection('users').updateOne({ id: user.id }, { $set: { emailVerified: true, verificationToken: null } })
    return j({ success: true, name: user.fullName || user.username })
  }

  // RESEND VERIFICATION
  if (path === 'auth/resend-verification' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const user = await db.collection('users').findOne({ id: u.id })
    if (!user) return j({ error: 'Not found' }, 404)
    if (user.emailVerified) return j({ error: 'Already verified' }, 400)
    const verificationToken = uuidv4()
    await db.collection('users').updateOne({ id: u.id }, { $set: { verificationToken } })
    const verifyUrl = `${BASE_URL}/verify-email?token=${verificationToken}`
    // Use Resend (primary) → Nodemailer (fallback)
    const resendResult = await sendWithResend({ to: user.email, subject: 'Verify your Grofience email ✉️', html: verifyHtml(user.username, verifyUrl) })
    if (resendResult.sent) return j({ success: true })
    const emailSent = await sendEmail({ to: user.email, subject: 'Verify your Grofience email ✉️', html: verifyHtml(user.username, verifyUrl) })
    if (!emailSent) return j({ error: 'Email service unavailable. Please try again later.' }, 503)
    return j({ success: true })
  }

  // SEND PARENT WELCOME / NOTIFICATION EMAIL
  if (path === 'auth/notify-parent' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const user = await db.collection('users').findOne({ id: u.id })
    if (!user) return j({ error: 'Not found' }, 404)
    if (!user.parentEmail) return j({ error: 'No parent email set' }, 400)
    const pHtml = parentWelcomeHtml(user.fullName || user.username, user.parentEmail, user.email)
    const subject = `${user.fullName || user.username} added you as their parent on Grofience 👨‍👩‍👧`
    const resendResult = await sendWithResend({ to: user.parentEmail, subject, html: pHtml })
    if (resendResult.sent) return j({ success: true })
    const emailSent = await sendEmail({ to: user.parentEmail, subject, html: pHtml })
    if (!emailSent) return j({ error: 'Email service not configured' }, 503)
    return j({ success: true })
  }

  // FORGOT PASSWORD — OTP via Resend Email → SMS → Dev fallback
  if (path === 'auth/forgot-password' && method === 'POST') {
    const { email } = await request.json()
    if (!email) return j({ error: 'Email required' }, 400)
    const normalizedEmail = email.toLowerCase().trim()
    const user = await db.collection('users').findOne({ email: normalizedEmail })
    if (!user) {
      return j({ success: true, notFound: true })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await db.collection('password_resets').deleteMany({ userId: user.id })
    await db.collection('password_resets').insertOne({ userId: user.id, email: normalizedEmail, otp, expiresAt, createdAt: new Date().toISOString() })
    const name = user.fullName || user.username

    // 1️⃣ Try Resend (primary)
    const resendResult = await sendWithResend({ to: user.email, subject: `${otp} is your Grofience OTP 🔐`, html: otpHtml(name, otp) })
    if (resendResult.sent) return j({ success: true, via: 'email' })

    // 2️⃣ Try Twilio SMS
    const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
    if (twilioConfigured && user.phone) {
      const smsSent = await sendSms({ to: user.phone, body: `Your Grofience OTP is: ${otp}. Valid for 10 minutes.` })
      if (smsSent) return j({ success: true, via: 'sms' })
    }

    // 3️⃣ Try Nodemailer (SMTP fallback)
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    if (emailConfigured) {
      const smtpSent = await sendEmail({ to: user.email, subject: `${otp} is your Grofience OTP 🔐`, html: otpHtml(name, otp) })
      if (smtpSent) return j({ success: true, via: 'email' })
    }

    // 4️⃣ Dev / restricted fallback — always show OTP on screen
    const isDev = process.env.NODE_ENV !== 'production'
    const isResendRestricted = resendResult.restricted
    if (isDev || isResendRestricted) {
      const note = isResendRestricted
        ? 'Resend free plan can only send to the account owner email. OTP shown on screen.'
        : 'No email/SMS configured — OTP shown below (dev mode only).'
      console.warn('[Grofience] OTP fallback (on-screen):', otp, '—', note)
      return j({ success: true, devOtp: otp, devNote: note, emailRestricted: isResendRestricted })
    }

    // In production with no providers at all
    console.error('[Grofience] ❌ OTP delivery FAILED for', normalizedEmail)
    return j({ error: 'Could not send OTP — email service is not configured. Please contact support.' }, 503)
  }

  // RESET PASSWORD — accepts email + OTP + new password
  if (path === 'auth/reset-password' && method === 'POST') {
    const { email, otp, newPassword } = await request.json()
    if (!email || !otp || !newPassword) return j({ error: 'Missing fields' }, 400)
    if (newPassword.length < 6) return j({ error: 'Password must be at least 6 characters' }, 400)
    const normalizedEmail = email.toLowerCase().trim()
    const otpClean = String(otp).trim()
    const user = await db.collection('users').findOne({ email: normalizedEmail })
    if (!user) return j({ error: 'Invalid email or OTP' }, 400)
    const reset = await db.collection('password_resets').findOne({ userId: user.id })
    if (!reset) return j({ error: 'No OTP found. Please request a new one.' }, 400)
    if (new Date(reset.expiresAt) < new Date()) {
      await db.collection('password_resets').deleteOne({ userId: user.id })
      return j({ error: 'OTP expired. Please request a new one.' }, 400)
    }
    if (reset.otp !== otpClean) return j({ error: 'Invalid OTP. Please check and try again.' }, 400)
    await db.collection('users').updateOne({ id: user.id }, { $set: { password: await bcrypt.hash(newPassword, 10) } })
    await db.collection('password_resets').deleteOne({ userId: user.id })
    return j({ success: true })
  }

  // USER UPDATE
  if (path === 'user/update' && method === 'PUT') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const updates = await request.json()
    const allowed = ['fullName', 'username', 'currency', 'avatar', 'parentEmail', 'phone', 'notificationPrefs']
    const set = {}
    for (const k of allowed) if (updates[k] !== undefined) set[k] = updates[k]
    // If parent email changed, reset verification status and send welcome email
    const existingUser = await db.collection('users').findOne({ id: u.id })
    if (updates.parentEmail !== undefined && updates.parentEmail !== existingUser?.parentEmail) {
      if (updates.parentEmail) {
        // New or changed parent email — reset verification status
        set.parentEmailVerified = false
        set.parentVerificationToken = uuidv4()
        // Fire-and-forget: send parent welcome email
        const pHtml = parentWelcomeHtml(
          updates.fullName || existingUser?.fullName || existingUser?.username,
          updates.parentEmail,
          existingUser?.email
        )
        const subject = `${updates.fullName || existingUser?.fullName || existingUser?.username} added you as their parent on Grofience 👨‍👩‍👧`
        sendWithResend({ to: updates.parentEmail, subject, html: pHtml })
          .then(r => { if (!r.sent) sendEmail({ to: updates.parentEmail, subject, html: pHtml }) })
          .catch(() => {})
      } else {
        // Parent email removed — clear verification
        set.parentEmailVerified = false
        set.parentVerificationToken = null
      }
    }
    await db.collection('users').updateOne({ id: u.id }, { $set: set })
    const user = await db.collection('users').findOne({ id: u.id })
    const { password: _p, verificationToken: _v, parentVerificationToken: _pt, _id, ...safe } = user
    return j({ user: safe })
  }

  // CHANGE PASSWORD
  if (path === 'user/password' && method === 'PUT') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const { currentPassword, newPassword } = await request.json()
    const user = await db.collection('users').findOne({ id: u.id })
    if (!await bcrypt.compare(currentPassword, user.password)) return j({ error: 'Wrong current password' }, 400)
    await db.collection('users').updateOne({ id: u.id }, { $set: { password: await bcrypt.hash(newPassword, 10) } })
    return j({ success: true })
  }

  // TRANSACTIONS GET
  if (path === 'transactions' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const txs = await db.collection('transactions').find({ userId: u.id }).sort({ date: -1 }).toArray()
    return j({ transactions: txs.map(({ _id, ...t }) => t) })
  }

  // TRANSACTIONS POST
  if (path === 'transactions' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    const tx = {
      id: uuidv4(), userId: u.id,
      date: body.date || new Date().toISOString().slice(0, 10),
      type: body.type || 'expense',
      amount: Number(body.amount || 0),
      source: body.source || '', category: body.category || 'Others', notes: body.notes || '',
      createdAt: new Date().toISOString(),
    }
    await db.collection('transactions').insertOne(tx)
    await db.collection('users').updateOne({ id: u.id }, { $inc: { xp: tx.type === 'income' ? 5 : 2 } })
    await recomputeBadges(db, u.id)
    const { _id, ...safe } = tx
    return j({ transaction: safe })
  }

  // TRANSACTIONS PUT
  if (path.startsWith('transactions/') && method === 'PUT') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const id = path.split('/')[1]
    const body = await request.json()
    const set = {}
    for (const k of ['date', 'type', 'amount', 'source', 'category', 'notes']) {
      if (body[k] !== undefined) set[k] = k === 'amount' ? Number(body[k]) : body[k]
    }
    await db.collection('transactions').updateOne({ id, userId: u.id }, { $set: set })
    await recomputeBadges(db, u.id)
    return j({ success: true })
  }

  // TRANSACTIONS DELETE
  if (path.startsWith('transactions/') && method === 'DELETE') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    await db.collection('transactions').deleteOne({ id: path.split('/')[1], userId: u.id })
    await recomputeBadges(db, u.id)
    return j({ success: true })
  }

  // GOALS GET
  if (path === 'goals' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const goals = await db.collection('goals').find({ userId: u.id }).sort({ createdAt: -1 }).toArray()
    return j({ goals: goals.map(({ _id, ...g }) => g) })
  }

  // GOALS POST
  if (path === 'goals' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    const g = { id: uuidv4(), userId: u.id, title: body.title, target: Number(body.target || 0), saved: Number(body.saved || 0), emoji: body.emoji || '🎯', deadline: body.deadline || null, createdAt: new Date().toISOString() }
    await db.collection('goals').insertOne(g)
    const { _id, ...safe } = g
    return j({ goal: safe })
  }

  // GOALS PUT
  if (path.startsWith('goals/') && method === 'PUT') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const id = path.split('/')[1]
    const body = await request.json()
    const set = {}
    for (const k of ['title', 'target', 'saved', 'emoji', 'deadline']) {
      if (body[k] !== undefined) set[k] = ['target', 'saved'].includes(k) ? Number(body[k]) : body[k]
    }
    await db.collection('goals').updateOne({ id, userId: u.id }, { $set: set })
    if (body.saved !== undefined) {
      const g = await db.collection('goals').findOne({ id, userId: u.id })
      if (g && g.saved >= g.target) await db.collection('users').updateOne({ id: u.id }, { $inc: { xp: 50 } })
    }
    return j({ success: true })
  }

  // GOALS DELETE
  if (path.startsWith('goals/') && method === 'DELETE') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    await db.collection('goals').deleteOne({ id: path.split('/')[1], userId: u.id })
    return j({ success: true })
  }

  // ANALYTICS
  if (path === 'analytics' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const [txs, goals, user] = await Promise.all([
      db.collection('transactions').find({ userId: u.id }).toArray(),
      db.collection('goals').find({ userId: u.id }).toArray(),
      db.collection('users').findOne({ id: u.id }),
    ])
    const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalSaved = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0
    const score = Math.max(0, Math.min(100, Math.round(savingsRate * 0.7 + (goals.length ? 15 : 0) + (txs.length > 5 ? 15 : txs.length * 2))))
    const { password: _p, verificationToken: _v, _id, ...safeUser } = user
    return j({ totalIncome, totalExpense, totalSaved, savingsRate, score, txCount: txs.length, goalCount: goals.length, user: safeUser })
  }

  // PARENT NOTIFICATION
  if (path === 'notifications/parent' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const [user, txs, goals] = await Promise.all([
      db.collection('users').findOne({ id: u.id }),
      db.collection('transactions').find({ userId: u.id }).toArray(),
      db.collection('goals').find({ userId: u.id }).toArray(),
    ])
    if (!user?.parentEmail) return j({ error: 'No parent email set. Add it in Settings.' }, 400)
    const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalSaved = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0
    const score = Math.max(0, Math.min(100, Math.round(savingsRate * 0.7 + (goals.length ? 15 : 0) + (txs.length > 5 ? 15 : txs.length * 2))))
    const analytics = { totalIncome, totalExpense, totalSaved, savingsRate, score }
    const subject = `📊 ${user.fullName || user.username}'s Grofience Progress Report`
    const html = parentHtml(user, analytics, txs, goals)
    // Try Resend first, then nodemailer fallback
    const resendSent = await sendWithResend({ to: user.parentEmail, subject, html })
    if (resendSent) return j({ success: true })
    const emailSent = await sendEmail({ to: user.parentEmail, subject, html })
    if (!emailSent) return j({ error: 'Email service not configured. Set RESEND_API_KEY or EMAIL_USER in .env.local' }, 503)
    return j({ success: true })
  }

  // ─── COMMUNITY SETTINGS ───────────────────────────────────────────────────────

  // ADMIN: GET community settings (whatsapp link etc.)
  if (path === 'admin/community' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const settings = await db.collection('settings').findOne({ key: 'community' })
    return j({ whatsappLink: settings?.whatsappLink || '' })
  }

  // ADMIN: POST update community settings
  if (path === 'admin/community' && method === 'POST') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    await db.collection('settings').updateOne(
      { key: 'community' },
      { $set: { key: 'community', whatsappLink: body.whatsappLink || '', updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return j({ success: true })
  }

  // PUBLIC: GET community settings (for students)
  if (path === 'community/settings' && method === 'GET') {
    const settings = await db.collection('settings').findOne({ key: 'community' })
    return j({ whatsappLink: settings?.whatsappLink || '' })
  }

  // ─── TEEN COMMUNITY ADMIN ROUTES ─────────────────────────────────────────────

  // ADMIN: GET community header stats & symbol
  if (path === 'admin/community/header' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const s = await db.collection('settings').findOne({ key: 'community_header' })
    return j({ members: s?.members || '2.4k', postsToday: s?.postsToday ?? 148, liveChallenges: s?.liveChallenges ?? 4, symbol: s?.symbol || '🚀' })
  }

  // ADMIN: POST update community header stats & symbol
  if (path === 'admin/community/header' && method === 'POST') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    await db.collection('settings').updateOne(
      { key: 'community_header' },
      { $set: { key: 'community_header', members: body.members || '2.4k', postsToday: body.postsToday ?? 148, liveChallenges: body.liveChallenges ?? 4, symbol: body.symbol || '🚀', updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return j({ success: true })
  }

  // ADMIN: GET community finance tips
  if (path === 'admin/community/tips' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const s = await db.collection('settings').findOne({ key: 'community_tips' })
    return j({ tips: s?.tips || [] })
  }

  // ADMIN: POST update community finance tips
  if (path === 'admin/community/tips' && method === 'POST') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    await db.collection('settings').updateOne(
      { key: 'community_tips' },
      { $set: { key: 'community_tips', tips: body.tips || [], updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return j({ success: true })
  }

  // ADMIN: GET community challenges
  if (path === 'admin/community/challenges' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const s = await db.collection('settings').findOne({ key: 'community_challenges' })
    return j({ challenges: s?.challenges || [] })
  }

  // ADMIN: POST update community challenges
  if (path === 'admin/community/challenges' && method === 'POST') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    await db.collection('settings').updateOne(
      { key: 'community_challenges' },
      { $set: { key: 'community_challenges', challenges: body.challenges || [], updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return j({ success: true })
  }

  // ADMIN: GET community learning resources
  if (path === 'admin/community/resources' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const s = await db.collection('settings').findOne({ key: 'community_resources' })
    return j({ resources: s?.resources || [] })
  }

  // ADMIN: POST update community learning resources
  if (path === 'admin/community/resources' && method === 'POST') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    await db.collection('settings').updateOne(
      { key: 'community_resources' },
      { $set: { key: 'community_resources', resources: body.resources || [], updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return j({ success: true })
  }

  // ADMIN: GET all community posts (for admin management)
  if (path === 'admin/community/posts' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const posts = await db.collection('community_posts').find({}).sort({ createdAt: -1 }).limit(100).toArray()
    return j({ posts: posts.map(({ _id, ...p }) => p) })
  }

  // ADMIN: DELETE any community post (also wipes associated reports)
  if (path.startsWith('admin/community/posts/') && !path.endsWith('/reports') && method === 'DELETE') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const postId = path.split('/')[3]
    await db.collection('community_posts').deleteOne({ id: postId })
    await db.collection('post_reports').deleteMany({ postId })
    return j({ success: true })
  }

  // ADMIN: GET all flagged/reported posts (grouped by post)
  if (path === 'admin/community/reports' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const reports = await db.collection('post_reports').find({}).sort({ createdAt: -1 }).toArray()
    const grouped = {}
    for (const r of reports) {
      if (!grouped[r.postId]) {
        grouped[r.postId] = { postId: r.postId, postContent: r.postContent, postAuthor: r.postAuthor, reports: [] }
      }
      const { _id, ...safeR } = r
      grouped[r.postId].reports.push(safeR)
    }
    return j({ flaggedPosts: Object.values(grouped) })
  }

  // ADMIN: DELETE (dismiss) a single report without deleting the post
  if (path.startsWith('admin/community/reports/') && method === 'DELETE') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const reportId = path.split('/')[3]
    const report = await db.collection('post_reports').findOneAndDelete({ id: reportId })
    if (report) {
      await db.collection('community_posts').updateOne({ id: report.postId }, { $inc: { reportCount: -1 } })
    }
    return j({ success: true })
  }

  // ADMIN: Dismiss ALL reports for a post (keep the post, clear flags)
  if (path.match(/^admin\/community\/posts\/[^/]+\/reports$/) && method === 'DELETE') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const postId = path.split('/')[3]
    await db.collection('post_reports').deleteMany({ postId })
    await db.collection('community_posts').updateOne({ id: postId }, { $set: { reportCount: 0 } })
    return j({ success: true })
  }

  // ─── WEEKLY CHALLENGE PROGRESS (per-account DB persistence) ──────────────────

  // GET challenge progress for authenticated user
  if (path === 'challenges/progress' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const doc = await db.collection('challenge_progress').findOne({ userId: u.id })
    return j({ progress: doc?.progress || {} })
  }

  // PUT (upsert) a single challenge task toggle
  if (path === 'challenges/progress' && method === 'PUT') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    const { key, checked } = body
    if (!key || typeof checked !== 'boolean') return j({ error: 'key and checked required' }, 400)
    await db.collection('challenge_progress').updateOne(
      { userId: u.id },
      { $set: { [`progress.${key}`]: checked, updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return j({ success: true })
  }

  // GET joined community challenges for authenticated user
  if (path === 'community/challenges/joined' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const doc = await db.collection('joined_community_challenges').findOne({ userId: u.id })
    return j({ joined: doc?.joined || {} })
  }

  // POST update joined community challenges for authenticated user
  if (path === 'community/challenges/joined' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    await db.collection('joined_community_challenges').updateOne(
      { userId: u.id },
      { $set: { userId: u.id, joined: body.joined || {}, updatedAt: new Date().toISOString() } },
      { upsert: true }
    )
    return j({ success: true })
  }

  // PUBLIC: GET full community config (for student frontend — tips, challenges, resources, header, whatsapp)
  if (path === 'community/config' && method === 'GET') {
    const [header, tips, challenges, resources, settings] = await Promise.all([
      db.collection('settings').findOne({ key: 'community_header' }),
      db.collection('settings').findOne({ key: 'community_tips' }),
      db.collection('settings').findOne({ key: 'community_challenges' }),
      db.collection('settings').findOne({ key: 'community_resources' }),
      db.collection('settings').findOne({ key: 'community' }),
    ])
    return j({
      header: { members: header?.members || '2.4k', postsToday: header?.postsToday ?? 148, liveChallenges: header?.liveChallenges ?? 4, symbol: header?.symbol || '🚀' },
      tips: tips?.tips?.length > 0 ? tips.tips : null,
      challenges: challenges?.challenges?.length > 0 ? challenges.challenges : null,
      resources: resources?.resources?.length > 0 ? resources.resources : null,
      whatsappLink: settings?.whatsappLink || '',
    })
  }

  // ─── MESSAGING ────────────────────────────────────────────────────────────────

  // ADMIN: GET all conversations (one per student, latest message + unread count)
  if (path === 'admin/messages' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).toArray()
    // Group by recipientId (student)
    const convMap = {}
    for (const msg of messages) {
      const key = msg.recipientId
      if (!convMap[key]) {
        convMap[key] = {
          studentId: msg.recipientId,
          studentName: msg.senderRole === 'student' ? msg.senderName : msg.recipientName || '',
          lastMessage: msg.text,
          lastAt: msg.createdAt,
          unread: 0,
        }
      }
      if (!msg.readByAdmin && msg.senderRole === 'student') convMap[key].unread++
    }
    // Fetch usernames for any missing student names
    const studentIds = Object.keys(convMap)
    const usersArr = studentIds.length > 0
      ? await db.collection('users').find({ id: { $in: studentIds } }, { projection: { id: 1, username: 1, fullName: 1 } }).toArray()
      : []
    const userMap = {}
    usersArr.forEach(u => { userMap[u.id] = u.fullName || u.username })
    const conversations = studentIds.map(id => ({
      ...convMap[id],
      studentName: userMap[id] || convMap[id].studentName || id,
    })).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
    return j({ conversations })
  }

  // ADMIN: GET full thread with a student
  if (path.startsWith('admin/messages/') && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const studentId = path.split('/')[2]
    const messages = await db.collection('messages').find({ recipientId: studentId }).sort({ createdAt: 1 }).toArray()
    // Mark all student messages as read by admin
    await db.collection('messages').updateMany(
      { recipientId: studentId, senderRole: 'student', readByAdmin: false },
      { $set: { readByAdmin: true } }
    )
    const user = await db.collection('users').findOne({ id: studentId }, { projection: { id: 1, username: 1, fullName: 1, email: 1 } })
    return j({ messages: messages.map(({ _id, ...m }) => m), student: user ? { id: user.id, name: user.fullName || user.username, email: user.email } : null })
  }

  // ADMIN: POST send message to a student
  if (path.startsWith('admin/messages/') && method === 'POST') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const studentId = path.split('/')[2]
    const body = await request.json()
    if (!body.text?.trim()) return j({ error: 'Message text required' }, 400)
    const user = await db.collection('users').findOne({ id: studentId }, { projection: { id: 1, username: 1, fullName: 1 } })
    if (!user) return j({ error: 'Student not found' }, 404)
    const msg = {
      id: uuidv4(),
      recipientId: studentId,
      recipientName: user.fullName || user.username,
      senderId: 'admin',
      senderRole: 'admin',
      senderName: 'Grofience Support',
      text: body.text.trim(),
      readByAdmin: true,
      readByStudent: false,
      createdAt: new Date().toISOString(),
    }
    await db.collection('messages').insertOne(msg)
    const { _id, ...safe } = msg
    return j({ message: safe })
  }

  // STUDENT: GET inbox (messages from admin)
  if (path === 'messages/inbox' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const messages = await db.collection('messages').find({ recipientId: u.id }).sort({ createdAt: 1 }).toArray()
    const unread = messages.filter(m => m.senderRole === 'admin' && !m.readByStudent).length
    // Mark admin messages as read by student
    await db.collection('messages').updateMany(
      { recipientId: u.id, senderRole: 'admin', readByStudent: false },
      { $set: { readByStudent: true } }
    )
    return j({ messages: messages.map(({ _id, ...m }) => m), unread })
  }

  // STUDENT: POST reply to admin
  if (path === 'messages/reply' && method === 'POST') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const body = await request.json()
    if (!body.text?.trim()) return j({ error: 'Message text required' }, 400)
    const user = await db.collection('users').findOne({ id: u.id })
    const msg = {
      id: uuidv4(),
      recipientId: u.id,
      recipientName: user?.fullName || user?.username || u.username,
      senderId: u.id,
      senderRole: 'student',
      senderName: user?.fullName || user?.username || u.username,
      text: body.text.trim(),
      readByAdmin: false,
      readByStudent: true,
      createdAt: new Date().toISOString(),
    }
    await db.collection('messages').insertOne(msg)
    const { _id, ...safe } = msg
    return j({ message: safe })
  }

  // STUDENT: GET unread count (lightweight poll)
  if (path === 'messages/unread' && method === 'GET') {
    const u = authUser(request)
    if (!u) return j({ error: 'Unauthorized' }, 401)
    const count = await db.collection('messages').countDocuments({ recipientId: u.id, senderRole: 'admin', readByStudent: false })
    return j({ unread: count })
  }

  // ADMIN: GET unread count across all students
  if (path === 'admin/messages/unread' && method === 'GET') {
    if (!authAdmin(request)) return j({ error: 'Unauthorized' }, 401)
    const count = await db.collection('messages').countDocuments({ senderRole: 'student', readByAdmin: false })
    return j({ unread: count })
  }

  return j({ error: 'Not found', path }, 404)
}

async function recomputeBadges(db, userId) {
  const user = await db.collection('users').findOne({ id: userId })
  if (!user) return
  const txs = await db.collection('transactions').find({ userId }).toArray()
  const goals = await db.collection('goals').find({ userId }).toArray()
  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const saved = totalIncome - totalExpense
  const badges = new Set(user.badges || [])
  if (txs.length >= 1) badges.add('Money Rookie')
  if (saved >= 100) badges.add('Super Saver')
  if (txs.length >= 10) badges.add('Budget Master')
  if (goals.some(g => g.saved >= g.target && g.target > 0)) badges.add('Finance Ninja')
  const xp = user.xp || 0
  const level = Math.floor(xp / 100)   // Level 0 = 0–99 XP, Level 1 = 100–199 XP, etc.
  await db.collection('users').updateOne({ id: userId }, { $set: { badges: Array.from(badges), level } })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
