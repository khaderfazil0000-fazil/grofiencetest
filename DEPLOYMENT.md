# 🚀 Deploying Grofience to the Internet (Free Tier)

This guide walks you through deploying your Grofience app **for free** using:
- **GitHub** — to host your code
- **MongoDB Atlas** — free cloud database (512 MB)
- **Vercel** — free hosting for Next.js (perfect fit, made by the same team)

Total time: **~10 minutes**. No credit card required.

---

## 📝 Step 1: Push the Code to GitHub

### 1.1 Create a GitHub account & repository
1. Sign up at [github.com](https://github.com) (free)
2. Click the **+** icon (top-right) → **New repository**
3. Name it `grofience` (or anything you like)
4. Choose **Private** or **Public** (your call)
5. **Do NOT** initialize with README/license/.gitignore (we already have these)
6. Click **Create repository**

### 1.2 Upload your code

Download the project archive (ask your developer or use the export from your dev environment), then:

```bash
# Extract the archive
unzip grofience.zip
cd grofience

# Initialize git and push to your new repo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/grofience.git
git push -u origin main
```

> **Don't have git installed?** Get it from [git-scm.com](https://git-scm.com/downloads).
>
> **Prefer drag-and-drop?** On the new GitHub repo page, click **uploading an existing file** and drag the entire project folder in. Commit at the bottom.

✅ Your code is now on GitHub.

---

## 🗄️ Step 2: Create a Free MongoDB Database (Atlas)

### 2.1 Sign up
1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free, no credit card)
3. Choose **Build a Database** → **M0 Free** tier
4. Pick a cloud provider & region (any closest to you)
5. Cluster name: `grofience-cluster`
6. Click **Create Deployment**

### 2.2 Create a database user
1. **Username**: `grofience_admin`
2. **Password**: click **Autogenerate Secure Password** → **COPY IT NOW** (you'll need it)
3. Click **Create Database User**

### 2.3 Allow connections from anywhere (so Vercel can connect)
1. Click **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (sets `0.0.0.0/0`)
4. Click **Confirm**

### 2.4 Get your connection string
1. Click **Database** → **Connect** on your cluster
2. Choose **Drivers** → Driver: `Node.js`, Version: latest
3. Copy the connection string — looks like:
   ```
   mongodb+srv://grofience_admin:<password>@grofience-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Replace `<password>`** with the password you copied in 2.2
5. Save this string — you'll paste it into Vercel next

✅ Your database is ready.

---

## ▲ Step 3: Deploy to Vercel (Free)

### 3.1 Sign up with GitHub
1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Click **Continue with GitHub** — authorize Vercel to read your repos

### 3.2 Import your project
1. On Vercel dashboard, click **Add New** → **Project**
2. Find your `grofience` repo → click **Import**
3. **Framework Preset**: Vercel auto-detects Next.js ✅
4. **Root Directory**: leave as `./`
5. **Build Command**: leave default (`yarn build`)
6. **Output Directory**: leave default

### 3.3 Add environment variables (CRITICAL)

Click **Environment Variables** and add the following (one by one):

| Name | Value |
| ---- | ----- |
| `MONGO_URL` | *(paste the Atlas connection string from Step 2.4)* |
| `DB_NAME` | `grofience` |
| `JWT_SECRET` | *(generate a long random string, see tip below)* |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app-name.vercel.app` *(you can update this after deploy)* |
| `CORS_ORIGINS` | `*` |

> 💡 **Generating a JWT_SECRET**: open [randomkeygen.com](https://randomkeygen.com/) and copy any "CodeIgniter Encryption Key" — or run `openssl rand -base64 48` in a terminal.

### 3.4 Deploy
Click **Deploy** — Vercel builds and deploys in ~2 minutes.

When done, you'll see something like:
```
✅ https://grofience-xxxxx.vercel.app
```

🎉 **That's your live app!** Open it in a new tab.

### 3.5 Update NEXT_PUBLIC_BASE_URL
Go back to **Settings** → **Environment Variables** → edit `NEXT_PUBLIC_BASE_URL` to match the actual URL Vercel gave you. Then **Redeploy** (Deployments tab → latest → ⋮ → Redeploy).

---

## 🌐 Step 4 (Optional): Custom Domain

If you own `grofience.com`:

1. In Vercel → your project → **Settings** → **Domains**
2. Add `grofience.com` and follow DNS instructions (Vercel guides you)
3. Update `NEXT_PUBLIC_BASE_URL` to `https://grofience.com` → Redeploy

Domains can be bought from Namecheap, Cloudflare, GoDaddy etc. (~$10-15/year).

---

## 🔄 Updating Your Deployed App

Any time you push to GitHub `main` branch, Vercel **automatically redeploys**.

```bash
git add .
git commit -m "Fixed bug / added feature"
git push
# → Vercel auto-deploys in 1-2 minutes
```

---

## 🚫 Troubleshooting

### "Database connection failed" / 500 errors
- Verify `MONGO_URL` env var on Vercel matches your Atlas connection string exactly
- Confirm Network Access allows `0.0.0.0/0` in Atlas
- Confirm the password in the URL doesn't contain unescaped special characters (URL-encode them)

### "Build failed" on Vercel
- Check the build logs in Vercel → Deployments → latest → logs
- Most common: missing env vars or wrong Node version. Vercel uses Node 20+ by default — should work.

### Login works locally but not on Vercel
- `JWT_SECRET` env var must be set on Vercel (same value across redeploys)
- Clear your browser localStorage and try again

### "Module not found" errors
- Run `yarn install` locally and commit the updated `yarn.lock`, then push.

---

## 🏗️ Future: Splitting Into 3 Domains (Optional)

Once you're growing and want the **public app / admin panel / API** on separate domains as in the original spec:

```
grofience.com           → public teen app (Vercel)
admin.grofience.com     → admin panel       (Vercel, separate project)
api.grofience.com       → backend API       (Vercel or Render)
```

This app is already structured to support that:
1. Fork the repo into 3 (or use Vercel monorepo)
2. In each Vercel project, set the same `MONGO_URL` env
3. Point each domain via DNS → each Vercel project
4. Add an `ADMIN_API_URL` env to your admin project pointing to `api.grofience.com`

We can guide you through this when you're ready — ping your developer.

---

## 💡 Costs at a Glance

| Service | Free Tier | When to upgrade |
| ------- | --------- | --------------- |
| GitHub | Unlimited public/private repos | Never needed |
| Vercel | 100 GB bandwidth/mo, unlimited deploys | At ~10k+ daily users |
| MongoDB Atlas | 512 MB storage, shared cluster | At ~5k+ active users |
| Custom domain | $10-15/year (optional) | When you go pro |

**Up to a few hundred users — 💰 $0/month.**

---

Questions? Open an issue on the GitHub repo or ask your developer.

Happy launching! 🚀
