<div align="center">

<br/>

<img src="./public/grofience-logo.png" alt="Grofience Logo" height="80" />

<br/><br/>

# 🌱 Grofience — Teen Finance Tracker

### **Grow · Finance · Confidence**

> A premium, gamified personal finance platform built for teenagers.  
> Track money, crush goals, earn XP, and master money before you turn 20.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer-Motion-FF0080?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

[🚀 Live Demo](#) &nbsp;·&nbsp; [📖 Docs](#-api-endpoints) &nbsp;·&nbsp; [🐛 Report Bug](issues) &nbsp;·&nbsp; [💡 Request Feature](issues)

<br/>

---

</div>

## 📸 Overview

Grofience is a **full-stack Next.js** web app that turns personal finance into a game for teenagers. With XP systems, streaks, badges, parent reports, and beautiful animated dashboards — it makes money management actually fun.

```
✅ Track income & expenses   ✅ Set & smash savings goals   ✅ Earn XP & unlock badges
✅ Generate parent reports   ✅ Compete in weekly challenges ✅ Read finance e-books
✅ OTP-based password reset  ✅ Admin dashboard             ✅ Certificate of completion
```

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Auth & Security
- JWT + bcrypt secure login
- OTP-based password reset (Email / SMS)
- Email verification flow
- Remember Me (persistent sessions)
- Admin-only panel with separate JWT

</td>
<td width="50%">

### 📊 Dashboard & Analytics
- Real-time income / expense / savings cards
- Area, Pie & Bar charts (Recharts)
- Finance Score (0–100)
- 12 monthly trackers with CRUD
- Year selector (5-year range)

</td>
</tr>
<tr>
<td width="50%">

### 🎮 Gamification
- XP system (earn on every action)
- Level-up system
- 🔥 Daily streaks
- 4 unlockable badges:
  - 🥇 Money Rookie
  - 💰 Super Saver
  - 📋 Budget Master
  - 🥷 Finance Ninja

</td>
<td width="50%">

### 📚 Learning & Growth
- **Free E-Book** — 8-chapter teen money guide
- **Weekly Challenges** — Week 1 & Week 3 daily tasks
- Check-off tasks and earn XP
- Admin-uploadable PDF library
- Certificate of Financial Mastery (downloadable)

</td>
</tr>
<tr>
<td width="50%">

### 👨‍👩‍👧 Parent Features
- Email parent progress reports
- Finance score, savings rate, goal stats
- XP, level & badge summary
- Powered by Resend / Nodemailer

</td>
<td width="50%">

### 🛠️ Admin Panel
- Separate admin login (`/admin`)
- View all registered students
- Upload e-books (PDF links)
- Certificate ID search
- Delete user accounts

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | SSR, routing, API routes |
| **Frontend** | React 18, Tailwind CSS | UI & styling |
| **Components** | shadcn/ui, Radix UI | Accessible component library |
| **Animation** | Framer Motion | Transitions & micro-animations |
| **Charts** | Recharts | Dashboard data visualizations |
| **Icons** | Lucide React | Icon library |
| **Backend** | Next.js API Routes | Serverless REST API |
| **Database** | MongoDB (Atlas) | User data, transactions, goals |
| **Auth** | JWT + bcryptjs | Secure token-based auth |
| **Email OTP** | Resend → Nodemailer | Password reset delivery |
| **SMS OTP** | Twilio | SMS fallback for OTP |
| **PDF** | html2canvas + jsPDF | Certificate & report downloads |
| **Deployment** | Vercel | Edge hosting, free tier |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Link |
|------|---------|------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Yarn | 1.x | `npm install -g yarn` |
| MongoDB | Atlas (free) | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/<your-username>/grofience.git
cd grofience

# Install dependencies
yarn install
```

### 2️⃣ Configure Environment

```bash
# Copy the example env file
cp .env.example .env.local
```

Then edit `.env.local` with your credentials:

```env
# ── Required ──────────────────────────────────────────────────────
MONGO_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
DB_NAME=grofience
JWT_SECRET=your_super_secret_jwt_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ── Admin Login ───────────────────────────────────────────────────
ADMIN_EMAIL=admin@grofience.com
ADMIN_PASSWORD=Admin@123

# ── Email OTP (Resend) ────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx

# ── SMS OTP (Twilio) — optional ───────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3️⃣ Run Locally

```bash
yarn dev
# → Open http://localhost:3000
```

**That's it! 🎉** Sign up, add a transaction, and watch the XP roll in.

---

## 🌐 Deploy for Free

Deploy the full stack in **under 10 minutes** using:

```
Vercel (frontend + API)  +  MongoDB Atlas (database)  =  100% FREE
```

> See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete step-by-step walkthrough.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📁 Project Structure

```
grofience/
│
├── app/
│   ├── api/[[...path]]/
│   │   └── route.js          ← 🔌 Entire REST API (auth, txns, goals, OTP, admin)
│   ├── admin/
│   │   └── page.js           ← 🛡️ Admin dashboard (separate auth)
│   ├── verify-email/
│   │   └── page.js           ← ✉️ Email verification landing page
│   ├── reset-password/
│   │   └── page.js           ← 🔑 Password reset page
│   ├── page.js               ← 🏠 Main app (splash → auth → dashboard)
│   ├── layout.js             ← 📐 Root HTML layout
│   └── globals.css           ← 🎨 Global styles
│
├── components/
│   └── ui/                   ← 🧩 shadcn/ui components
│
├── lib/
│   └── utils.js              ← 🔧 Utility helpers
│
├── public/
│   └── grofience-logo.png    ← 🖼️ Brand logo
│
├── .env.example              ← 📋 Environment variable template
├── .env.local                ← 🔒 Your secrets (git-ignored)
├── next.config.js
├── tailwind.config.js
├── package.json
├── DEPLOYMENT.md             ← 🚀 Production deployment guide
└── README.md                 ← 📖 You are here
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MONGO_URL` | ✅ | MongoDB Atlas connection string |
| `DB_NAME` | ✅ | Database name (`grofience`) |
| `JWT_SECRET` | ✅ | Random string for signing user JWTs |
| `ADMIN_JWT_SECRET` | ✅ | Random string for admin JWTs |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Public URL (e.g., `https://yourapp.vercel.app`) |
| `ADMIN_EMAIL` | ✅ | Admin panel login email |
| `ADMIN_PASSWORD` | ✅ | Admin panel login password |
| `RESEND_API_KEY` | ⚡ | [resend.com](https://resend.com) API key for OTP emails |
| `TWILIO_ACCOUNT_SID` | 🔵 | Twilio Account SID (SMS OTP fallback) |
| `TWILIO_AUTH_TOKEN` | 🔵 | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | 🔵 | Twilio sender number |
| `EMAIL_USER` | 🔵 | Gmail address (SMTP fallback) |
| `EMAIL_PASS` | 🔵 | Gmail App Password |

> ✅ = Required &nbsp; ⚡ = Strongly recommended &nbsp; 🔵 = Optional fallback

> ⚠️ **Never commit `.env.local` to git.** It's already in `.gitignore`.

---

## 📝 API Reference

All routes are served from `/api/[...path]`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login → returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/auth/verify-email` | ❌ | Verify email with token |
| `POST` | `/api/auth/resend-verification` | ✅ | Resend verification email |
| `POST` | `/api/auth/forgot-password` | ❌ | Send OTP to email |
| `POST` | `/api/auth/reset-password` | ❌ | Reset password with OTP |

### User

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `PUT` | `/api/user/update` | ✅ | Update profile fields |
| `PUT` | `/api/user/password` | ✅ | Change password |

### Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/transactions` | ✅ | List all transactions |
| `POST` | `/api/transactions` | ✅ | Add new transaction |
| `PUT` | `/api/transactions/:id` | ✅ | Update transaction |
| `DELETE` | `/api/transactions/:id` | ✅ | Delete transaction |

### Goals

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/goals` | ✅ | List all goals |
| `POST` | `/api/goals` | ✅ | Create new goal |
| `PUT` | `/api/goals/:id` | ✅ | Update goal (add savings) |
| `DELETE` | `/api/goals/:id` | ✅ | Delete goal |

### Analytics & Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/analytics` | ✅ | Finance score, totals, charts |
| `POST` | `/api/notifications/parent` | ✅ | Email parent progress report |

### Admin *(separate JWT)*

| Method | Endpoint | Admin | Description |
|--------|----------|:-----:|-------------|
| `POST` | `/api/admin/login` | ❌ | Admin login |
| `GET` | `/api/admin/stats` | ✅ | All users & platform stats |
| `DELETE` | `/api/admin/users/:id` | ✅ | Delete a user |
| `GET/POST` | `/api/admin/books` | ✅ | List / upload e-books |
| `DELETE` | `/api/admin/books/:id` | ✅ | Delete an e-book |
| `GET` | `/api/admin/certificate-search` | ✅ | Find user by certificate ID |

---

## 🧪 Test the API

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alex Smith",
    "username": "alex_money",
    "email": "alex@example.com",
    "password": "pass1234",
    "age": 16
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "password": "pass1234"}'

# Add a transaction (use token from login)
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "income", "amount": 500, "source": "Allowance", "category": "Allowance"}'
```

---

## 🗺️ Roadmap

- [x] JWT Auth with OTP password reset
- [x] Monthly transaction tracking
- [x] Goals with progress & XP rewards
- [x] Gamification (XP, levels, streaks, badges)
- [x] Parent email reports
- [x] Certificate of Financial Mastery
- [x] Admin panel with user management
- [x] E-Book reader + weekly challenges
- [x] Community teen posts
- [ ] Push notifications
- [ ] Budget planner with AI suggestions
- [ ] Multi-user family plan

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to your fork
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please follow the existing code style and make sure the dev server builds cleanly before submitting.

---

## 📄 License

```
MIT License — Copyright (c) 2024 Grofience

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software.
```

Free for personal use, commercial use, and modification. See [LICENSE](LICENSE) for full text.

---

## 🙏 Credits & Acknowledgements

Built with love using these amazing open-source projects:

| | | |
|--|--|--|
| [Next.js](https://nextjs.org) | [React](https://react.dev) | [MongoDB](https://www.mongodb.com) |
| [Tailwind CSS](https://tailwindcss.com) | [shadcn/ui](https://ui.shadcn.com) | [Framer Motion](https://www.framer.com/motion/) |
| [Recharts](https://recharts.org) | [Resend](https://resend.com) | [Lucide Icons](https://lucide.dev) |

---

<div align="center">

<br/>

**Made with ❤️ and lots of ☕**

<br/>

[![Grofience](https://img.shields.io/badge/🌱_Grofience-Grow_·_Finance_·_Confidence-2563eb?style=for-the-badge)](https://grofience.com)

<br/>

*"Small savings today, big dreams tomorrow."*

<br/>

</div>
