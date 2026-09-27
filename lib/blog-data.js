// lib/blog-data.js
// Static blog post data for Grofience — SEO-optimized teen finance articles

export const BLOG_CATEGORIES = [
  'All',
  'Budgeting',
  'Savings',
  'Investing',
  'UPI & Payments',
  'Money Mindset',
  'Goals',
]

export const BLOG_AUTHORS = {
  priya: {
    name: 'Priya Sharma',
    role: 'Financial Literacy Coach',
    avatar: '/blog/authors/priya.png',
    bio: 'Priya has 8+ years of experience teaching teenagers about money management and personal finance across India.',
  },
  arjun: {
    name: 'Arjun Mehta',
    role: 'Teen Finance Educator',
    avatar: '/blog/authors/arjun.png',
    bio: 'Arjun is a certified financial planner passionate about helping Indian teens build wealth from a young age.',
  },
  sneha: {
    name: 'Sneha Patel',
    role: 'Youth Money Coach',
    avatar: '/blog/authors/sneha.png',
    bio: 'Sneha specializes in gamified financial education and has helped 500+ teens achieve their first savings goals.',
  },
}

export const BLOG_POSTS = [
  {
    id: 1,
    slug: 'how-to-budget-as-a-teenager-in-india',
    title: 'How to Budget as a Teenager in India: A Complete Beginner\'s Guide',
    excerpt: 'Learn how to manage your pocket money, track expenses, and start saving — even on a ₹1,000/month allowance. This step-by-step guide is built for Indian teens.',
    category: 'Budgeting',
    author: 'priya',
    publishedAt: '2024-12-15',
    updatedAt: '2025-01-10',
    readTime: 8,
    tags: ['budgeting', 'pocket money', 'teens', 'india', 'expense tracking'],
    featured: true,
    coverGradient: 'from-blue-600 to-indigo-700',
    coverEmoji: '💰',
    seo: {
      metaTitle: 'How to Budget as a Teenager in India | Grofience',
      metaDescription: 'A complete guide to budgeting for Indian teens. Learn how to manage pocket money, track daily expenses, and save money starting today — no matter how small your allowance.',
    },
    content: `
## Why Budgeting Matters for Teens in India

Most Indian teens receive anywhere from ₹500 to ₹5,000 per month as pocket money. Whether it's for snacks, outings, or online purchases — money goes fast. Learning to budget early isn't just a skill, it's a superpower.

> "A budget is telling your money where to go instead of wondering where it went." — Dave Ramsey

The good news? You don't need a spreadsheet or a financial advisor. You just need a simple system — and we'll build one right here.

## The 50-30-20 Rule: Adapted for Indian Teens

The classic budgeting rule works beautifully for teens too. Here's how to apply it:

- **50% — Needs**: School canteen, stationery, travel
- **30% — Wants**: Snacks, gaming, outings with friends
- **20% — Savings**: Your future self will thank you

### Example: ₹2,000 Monthly Allowance

| Category | Percentage | Amount |
|----------|-----------|--------|
| Needs (canteen, bus pass) | 50% | ₹1,000 |
| Wants (movies, food) | 30% | ₹600 |
| Savings (goals) | 20% | ₹400 |

## Step 1: Track Every Rupee for 7 Days

Before you budget, you need to know where your money goes. For one week, write down every purchase — even that ₹10 chai.

Use Grofience's expense tracker to log automatically by category. After 7 days, you'll see your spending patterns clearly.

## Step 2: Identify Your "Money Leaks"

Money leaks are small, unplanned expenses that add up. Common teen money leaks in India:

- Daily cold drinks or snacks (₹30–50/day = ₹900–1,500/month!)
- Impulse buying during online sales (Meesho, Amazon)
- Recharging for OTT or gaming platforms spontaneously

## Step 3: Set a Savings Goal

Budgeting without a goal is like driving without a destination. Ask yourself:
- Do you want a new phone accessory?
- Are you saving for a trip with friends?
- Want to buy your first book collection?

Set a specific goal amount and a deadline. Grofience will show you how much to save each week automatically.

## Step 4: Use the Envelope Method (Digital Version)

Create virtual "envelopes" for each spending category:

1. Open Grofience
2. Set monthly limits for Snacks, Travel, Entertainment
3. Get alerts when you're near the limit

## Step 5: Review Every Sunday

Spend 5 minutes every Sunday reviewing your week:
- Did you stay within your budget?
- Where did you overspend?
- What will you do differently next week?

Consistency beats perfection every time.

## Common Budgeting Mistakes Teens Make

### Mistake 1: Saving "Whatever is Left"
Save first, spend second. Move your savings the moment you get money — don't wait till the end of the month.

### Mistake 2: Forgetting Irregular Expenses
Birthdays, school trips, festivals — plan for them. Add a small "Miscellaneous" envelope of 5% for surprises.

### Mistake 3: Giving Up After One Bad Week
One bad week doesn't ruin your budget. Reset and keep going. Progress, not perfection.

## The Power of Starting Early

If a 16-year-old saves ₹400/month and invests it in a SIP with 12% returns, by age 30 they'll have **₹1.8 lakhs+**. Starting just 5 years later halves the result.

Time is your biggest wealth-building asset as a teen.

## Quick Start Checklist

- [ ] Download Grofience app
- [ ] Log your first expense today
- [ ] Set one savings goal this week
- [ ] Tell one friend about budgeting

You've got this. The best time to start managing your money was yesterday. The second-best time is right now.
    `,
  },
  {
    id: 2,
    slug: 'what-is-sip-for-teenagers-india',
    title: 'What is SIP? How Indian Teens Can Start Investing with Just ₹500/Month',
    excerpt: 'SIP (Systematic Investment Plan) isn\'t just for adults. Discover how Indian teenagers can start their investment journey with as little as ₹500 and let compounding do the magic.',
    category: 'Investing',
    author: 'arjun',
    publishedAt: '2025-01-08',
    updatedAt: '2025-01-08',
    readTime: 7,
    tags: ['SIP', 'mutual funds', 'investing', 'teenagers', 'compounding', 'india'],
    featured: false,
    coverGradient: 'from-emerald-500 to-teal-600',
    coverEmoji: '📈',
    seo: {
      metaTitle: 'What is SIP for Teenagers in India? Start with ₹500 | Grofience',
      metaDescription: 'Learn what SIP (Systematic Investment Plan) is and how Indian teens can start investing with just ₹500/month. Understand compounding and mutual funds simply.',
    },
    content: `
## What is SIP? The Simple Explanation

SIP stands for **Systematic Investment Plan**. It's a way to invest a fixed amount in mutual funds every month — automatically. Think of it like an EMI, but instead of paying for something, you're building wealth.

> Investing a small amount consistently is more powerful than investing a large amount occasionally.

## Why Teens Should Care About SIP

Most adults wish they'd started investing as teenagers. Here's the brutal truth about time and money:

| Start Age | Monthly SIP | Rate | Value at 30 |
|-----------|------------|------|-------------|
| 15 | ₹500 | 12% | ₹2.1 Lakhs |
| 20 | ₹500 | 12% | ₹1.1 Lakhs |
| 25 | ₹500 | 12% | ₹0.5 Lakhs |

Starting 10 years earlier gives you **4x the wealth** for the same monthly amount. This is the magic of compound interest.

## How Does SIP Actually Work?

Here's the step-by-step:

1. **Choose a mutual fund** — For beginners, index funds (Nifty 50) are best
2. **Set an amount** — Minimum ₹500/month in most funds
3. **Set a date** — Money auto-deducts from your account monthly
4. **Stay invested** — Don't panic during market dips

## Types of Mutual Funds for Teen Beginners

### 1. Index Funds (Best for Beginners)
These track the Nifty 50 or Sensex. Low cost, diversified, and have historically returned 12–14% annually.

**Example**: Nifty 50 Index Fund (Nippon, UTI)

### 2. Large Cap Funds
These invest in India's biggest companies. Safer than mid/small cap but slightly lower returns.

### 3. Hybrid Funds
A mix of equity (stocks) and debt (bonds). Good for medium-risk tolerance.

## Can Teens Open a SIP Account?

Yes! Here's how:

- **Under 18**: A parent/guardian needs to open a minor account or joint account
- **18+**: You can open your own Demat + mutual fund account (Zerodha, Groww, etc.)
- **Documents needed**: PAN card, Aadhaar, bank account

## The Compound Interest Magic — Explained Simply

Imagine a snowball rolling down a hill. The longer it rolls, the bigger it gets — not just from new snow, but from the snow it's already collected. That's compounding.

₹500/month at 12% annual returns:
- After 5 years: ₹40,700
- After 10 years: ₹1,16,000
- After 15 years: ₹2,50,000

You invested only ₹90,000. The rest — ₹1,60,000 — came from compounding.

## Common SIP Myths Busted

**Myth**: "I need a lot of money to invest"
**Truth**: You can start with ₹500/month

**Myth**: "SIP is risky, I can lose everything"
**Truth**: Diversified index funds have never given negative returns over any 10-year period in India

**Myth**: "I need to time the market"
**Truth**: Time IN the market beats timing the market every time

## How Grofience Helps You Track SIP Goals

Use Grofience's Goals feature to:
- Set a target amount (e.g., ₹50,000 for a laptop)
- Track your monthly SIP contributions
- See a projected growth chart
- Get motivated with streak rewards

## Action Steps This Week

1. Talk to your parents about opening a SIP account
2. Research Nifty 50 index funds on Groww or Zerodha
3. Set a savings goal in Grofience toward your first investment
4. Read about one mutual fund per week

The earlier you start, the wealthier you'll be. That's not motivation — that's mathematics.
    `,
  },
  {
    id: 3,
    slug: 'upi-safety-tips-for-teenagers',
    title: 'UPI Safety Tips Every Indian Teenager Must Know in 2025',
    excerpt: 'UPI scams targeting teens are rising rapidly. Learn how to use PhonePe, Google Pay, and Paytm safely — and never lose money to online fraud again.',
    category: 'UPI & Payments',
    author: 'sneha',
    publishedAt: '2025-01-20',
    updatedAt: '2025-01-20',
    readTime: 6,
    tags: ['UPI', 'PhonePe', 'Google Pay', 'scams', 'safety', 'digital payments', 'india'],
    featured: false,
    coverGradient: 'from-violet-600 to-purple-700',
    coverEmoji: '🔐',
    seo: {
      metaTitle: 'UPI Safety Tips for Teenagers 2025 | Grofience',
      metaDescription: 'Learn how to stay safe while using UPI apps like PhonePe, Google Pay, and Paytm. Essential UPI fraud prevention tips every Indian teen must know.',
    },
    content: `
## Why UPI Safety Matters for Teens

India processes over 15 billion UPI transactions per month. Teenagers are the fastest-growing UPI user segment — and unfortunately, also the fastest-growing fraud victim segment.

In 2024, cybercrime losses from UPI scams exceeded ₹1,000 crore. Many victims are under 25.

Understanding UPI safety isn't optional anymore. It's essential financial literacy.

## The 5 Most Common UPI Scams Targeting Teens

### 1. Fake Cashback / Lottery Scam
**How it works**: You receive a message "Congratulations! You've won ₹5,000 cashback. Scan this QR code to claim."

**The trap**: Scanning a QR code to RECEIVE money makes no sense. You can only receive money via UPI ID or phone number — never via QR scan. Scanning that QR sends THEM your money.

### 2. Screen Sharing Scam
**How it works**: Scammer calls pretending to be bank support, asks you to install AnyDesk or TeamViewer.

**The trap**: Once you give screen access, they see your OTP and UPI PIN and drain your account instantly.

### 3. Fake Gaming Reward Scam
**How it works**: "Win ₹10,000 in BGMI/Free Fire! Send ₹99 entry fee via UPI."

**The trap**: The "prize" never arrives. The ₹99 is gone.

### 4. College/School Fee Phishing
**How it works**: You receive a fake WhatsApp message from someone claiming to be your school admin with a new UPI ID for fee payment.

**The trap**: Always verify fee UPI IDs directly on the school's official website.

### 5. "Request Money" Confusion
**How it works**: Scammer sends you a "Request Money" notification. You click approve thinking you're receiving money.

**The trap**: "Request" means THEY want money FROM YOU. Approving sends them your money.

## The Golden Rules of UPI Safety

### Rule 1: PIN is Only for Sending
Your UPI PIN is ONLY entered when you are SENDING money. You NEVER need a PIN to receive money. If anyone asks for your PIN to "receive" money, it's a scam.

### Rule 2: QR Code = You're Paying
When you scan a QR code, you are paying. Always. No exceptions. There is no such thing as a "receive money QR code."

### Rule 3: Never Share OTP
Your bank will NEVER call you for OTP. NPCI will NEVER call you for OTP. No legitimate entity ever needs your OTP over a phone call.

### Rule 4: Verify Before Sending
Before sending money, always:
- Double-check the recipient's UPI ID
- Verify the name that appears after entering the ID
- Never rush — scammers create urgency to make you skip this step

### Rule 5: Use Transaction Limits
Set daily UPI transaction limits in your bank's app. Most banks allow you to cap this at ₹1,000–₹5,000 for added safety.

## How to Spot a UPI Scam Message

Red flags in any message:
- Extreme urgency ("Act in the next 10 minutes!")
- Unbelievably high rewards (₹50,000 for doing nothing)
- Requests to share your screen, OTP, or PIN
- Unofficial WhatsApp groups or unknown senders
- Grammatical errors and unprofessional language

## What to Do If You're Scammed

1. **Call 1930** (National Cyber Crime Helpline) immediately
2. **Block the UPI ID** within your payment app
3. **File a complaint** at cybercrime.gov.in
4. **Tell your parents** — the sooner, the better chance of recovery
5. **Report to your bank** within 24 hours for a possible reversal

## Setting Up Safe UPI Habits

- Enable biometric lock for your UPI apps
- Set transaction notifications for every payment
- Never save UPI PIN in notes or messages
- Review your transaction history weekly
- Use Grofience to track all UPI spending by category

UPI is one of India's greatest financial innovations. Use it smartly, use it safely.
    `,
  },
  {
    id: 4,
    slug: 'how-to-save-money-as-a-student-india',
    title: 'How to Save Money as a Student in India: 15 Practical Tips That Actually Work',
    excerpt: 'Saving money as an Indian student feels impossible — until you know these 15 practical strategies. From cutting canteen costs to building a ₹10,000 emergency fund, here\'s your playbook.',
    category: 'Savings',
    author: 'priya',
    publishedAt: '2025-02-05',
    updatedAt: '2025-02-05',
    readTime: 9,
    tags: ['savings', 'student', 'india', 'money tips', 'frugal living', 'pocket money'],
    featured: false,
    coverGradient: 'from-amber-500 to-orange-600',
    coverEmoji: '🐷',
    seo: {
      metaTitle: 'How to Save Money as a Student in India: 15 Tips | Grofience',
      metaDescription: 'Practical money-saving tips for Indian students. Learn how to cut expenses, build a savings habit, and create an emergency fund even on a small allowance.',
    },
    content: `
## Why Saving is Hard for Students (And How to Fix It)

You probably already know you should save. The problem isn't knowledge — it's the environment. Peer pressure to eat out, the latest phone, trendy clothes, gaming credits. The temptation is real.

But here's what no one tells you: **saving is a skill**. Like any skill, it gets easier with practice.

These 15 tips are designed for real Indian student life — not theoretical personal finance advice.

## Savings Tips 1–5: The Daily Wins

### Tip 1: Carry a Water Bottle
Buying packaged water or cold drinks daily? That's ₹20–40 per day = ₹600–1,200/month. Carry a water bottle everywhere.

### Tip 2: Eat Breakfast at Home
Skipping home breakfast and buying from the canteen costs 3–4x more. Eating at home saves ₹50–100/day.

### Tip 3: Use the Library
Textbooks, reference books, novels — your school or college library has most of them. Zero cost.

### Tip 4: Split Streaming Costs
Share Netflix, Spotify, and YouTube Premium with 3–4 friends. Cut your cost from ₹499 to ₹125/month.

### Tip 5: Walk or Cycle Short Distances
Auto/cab for every 1 km trip adds up fast. Walk or cycle for anything under 2 km — it's also healthier.

## Savings Tips 6–10: The Weekly Moves

### Tip 6: Meal Prep on Sundays
Cook 2–3 snack/meal items on Sunday that can last through the week. Massively cuts canteen spending.

### Tip 7: Buy Stationery in Bulk
Don't buy pens and notebooks one at a time. Buy in bulk at the start of the term — it's 30–40% cheaper.

### Tip 8: Use Student Discounts
Most students don't know their ID card unlocks:
- Student Spotify/Apple Music plans (50% off)
- GitHub Student Pack (free)
- Museum and monument entries (75% off)
- Some railway ticket discounts

### Tip 9: Plan Outings in Advance
Spontaneous outings always cost more. Plan with friends a week ahead, set a group budget, and split everything clearly.

### Tip 10: Unsubscribe from Temptation
Unfollow influencers who make you want to buy things. Unsubscribe from shopping emails. Out of sight, out of mind — and out of cart.

## Savings Tips 11–15: The Big Shifts

### Tip 11: Pay Yourself First
The moment you receive money — allowance, gift money, freelance work — immediately transfer 20% to a savings account or piggy bank app before spending anything.

### Tip 12: Use the 24-Hour Rule for Purchases Over ₹500
Before any non-essential purchase above ₹500, wait 24 hours. If you still want it the next day, it's likely not an impulse buy.

### Tip 13: Track Every Expense for 30 Days
Use Grofience for 30 days without changing any behavior — just tracking. You'll naturally spend less when you see the numbers.

### Tip 14: Set Micro-Goals
"Save ₹10,000 by December" feels abstract. Instead: "Save ₹500 this week." Small wins build momentum.

### Tip 15: Create a No-Spend Challenge
Pick one day per week where you spend absolutely ₹0. It's surprisingly fun once you start treating it like a game.

## Building Your First ₹10,000 Emergency Fund

An emergency fund is money set aside for unexpected needs — a medical expense, broken phone screen, emergency travel.

**Target**: ₹10,000
**Timeline**: 6–12 months
**Strategy**: Save ₹800–1,600/month, depending on your allowance

Once you have it, don't touch it unless it's a genuine emergency. This one fund will save you from debt, stress, and borrowing from parents during emergencies.

## The Savings Mindset Shift

Stop thinking of saving as "giving up things." Think of it as **buying your future self freedom**.

Every ₹100 you save today is ₹100 your future self doesn't need to stress about. That's freedom.

Use Grofience's savings streak feature to stay motivated — 7-day streaks, 30-day streaks, and achievement badges make saving genuinely fun.
    `,
  },
  {
    id: 5,
    slug: 'financial-goals-for-teenagers-india',
    title: 'Top 7 Financial Goals Every Indian Teenager Should Set Right Now',
    excerpt: 'From building a ₹10,000 emergency fund to saving for college, here are the 7 most important financial goals every Indian teen should pursue — with exact action plans for each.',
    category: 'Goals',
    author: 'arjun',
    publishedAt: '2025-02-18',
    updatedAt: '2025-02-18',
    readTime: 7,
    tags: ['financial goals', 'teens', 'india', 'savings goals', 'planning', 'future'],
    featured: false,
    coverGradient: 'from-rose-500 to-pink-600',
    coverEmoji: '🎯',
    seo: {
      metaTitle: 'Top 7 Financial Goals for Indian Teenagers | Grofience',
      metaDescription: 'Discover the 7 most important financial goals every Indian teenager should set. Includes action plans, timelines, and how to track progress using Grofience.',
    },
    content: `
## Why Teens Need Financial Goals

Goals are what separate intentional money management from random spending. Without a goal, every rupee you save is just a number. With a goal, every rupee has purpose.

Studies show that people with written financial goals are 10x more likely to achieve financial success. For teenagers, setting goals early trains the brain to delay gratification — the single most important financial skill.

## Goal 1: Build a ₹10,000 Emergency Fund

**Why**: Life is unpredictable. Phone breaks, medical need, unexpected expense — an emergency fund means you never need to ask for money in a crisis.

**Timeline**: 6–12 months
**Monthly target**: ₹833–1,667
**Where to keep it**: Savings account, NOT easily accessible (no UPI linked)

**Action step**: Open a separate savings account and auto-transfer your target amount on the 1st of every month.

## Goal 2: Go 30 Days Without Borrowing Money

**Why**: Financial independence starts with not needing anyone else's money for everyday needs.

**How**: Budget your allowance tightly enough to never run out mid-month. Use Grofience's weekly budget tracker to stay on track.

**Reward yourself**: When you complete 30 days, celebrate with a small, planned purchase.

## Goal 3: Save for One Major Personal Goal

**Why**: Saving toward something you personally want is the most powerful motivator.

**Examples**: New headphones (₹3,000), a camera (₹15,000), a trip with friends (₹8,000), latest phone accessory

**How**: Set a specific goal in Grofience. See the countdown. Watch your savings grow toward it.

## Goal 4: Understand Your Family's Finances

**Why**: Most teens have no idea what their household earns, spends, or owes. This creates financial blind spots.

**How**: Ask your parents one financial question per month. Learn about:
- What the monthly household budget looks like
- How EMI works (for home loans, car loans)
- What insurance your family has

Understanding context makes you a smarter financial decision-maker.

## Goal 5: Earn Your First ₹1,000 Independently

**Why**: Earning your own money, even a small amount, changes your relationship with money permanently.

**Ideas for teens**:
- Tutoring juniors or neighbors (₹200–500/session)
- Selling handmade crafts on Instagram
- Freelance poster design or logo making (Canva + Fiverr)
- YouTube or blog content about topics you love

The goal isn't the money — it's the experience of earning it.

## Goal 6: Complete 30 Days of Daily Expense Logging

**Why**: Awareness is the foundation of financial intelligence. 30 days of consistent tracking reveals your true spending patterns.

**How**: Log every transaction in Grofience for 30 consecutive days. Use the streak feature to stay consistent.

**What you'll learn**: You'll discover your top 3 money leaks — guaranteed.

## Goal 7: Read or Watch 12 Finance Resources This Year

**Why**: Financial literacy is self-taught. The teens who learn it become the adults who build wealth.

**One resource per month** — books, YouTube channels, podcasts:
- Book: "Rich Dad Poor Dad" (simplified version)
- YouTube: Ankur Warikoo, Labour Law Advisor, CA Rachana Ranade
- Podcast: "Paisa Vaisa" by Anupam Gupta

**Bonus**: Share one thing you learned with a friend each month. Teaching reinforces learning.

## How to Track Your Progress

Use Grofience's Goals feature to:
- Create each of these goals as a separate card
- Set target amounts and deadlines
- Log contributions and milestones
- Earn badges for completing goals

You can have multiple goals active at once. The app shows you how much to contribute to each goal weekly.

## The Most Important Thing

Don't try to achieve all 7 goals at once. Pick 2–3 to focus on this month. Complete them. Then add more.

Progress over perfection. Every small win matters.
    `,
  },
  {
    id: 6,
    slug: 'money-mindset-for-teenagers',
    title: 'The Money Mindset Every Teenager Needs: Think Rich Before You Earn Rich',
    excerpt: 'Your relationship with money starts in your head. Discover the 5 mindset shifts that separate financially successful teens from the rest — and how to rewire your money beliefs today.',
    category: 'Money Mindset',
    author: 'sneha',
    publishedAt: '2025-03-01',
    updatedAt: '2025-03-01',
    readTime: 6,
    tags: ['money mindset', 'psychology', 'teens', 'wealth', 'financial habits', 'personal growth'],
    featured: false,
    coverGradient: 'from-cyan-500 to-sky-600',
    coverEmoji: '🧠',
    seo: {
      metaTitle: 'Money Mindset for Teenagers: 5 Shifts to Think Rich | Grofience',
      metaDescription: 'Discover the 5 money mindset shifts every teenager needs to build lasting wealth. Learn how your beliefs about money shape your financial future.',
    },
    content: `
## Your Money Mindset: Why It Matters More Than Your Allowance

Two teens can receive the exact same ₹2,000 allowance. One will have nothing left in a week. The other will have ₹500 saved and a plan for the rest.

The difference isn't income — it's mindset.

Your beliefs about money determine how you earn it, spend it, save it, and grow it. The great news? Mindset is changeable at any age — and teens are the BEST positioned to change it because your habits aren't yet fully formed.

## Mindset Shift 1: From "I Can't Afford It" → "How Can I Afford It?"

The poor mindset closes the door. The rich mindset looks for a window.

**Poor mindset**: "I can't buy that ₹5,000 camera. I don't have money."

**Rich mindset**: "How long would I need to save to buy that camera? What if I tutored 2 juniors per week? I could have it in 3 months."

The rich mindset doesn't mean reckless spending — it means creative problem solving around financial goals.

**Practice**: Every time you say "I can't afford it," replace it with "How could I afford it?" Even if you don't act on it, you're training your brain to see possibility.

## Mindset Shift 2: From "Saving is Sacrifice" → "Saving is Self-Investment"

When you save ₹500, you're not losing ₹500. You're investing in your future self's options.

Money = Options. The more you save, the more options your future self has — to travel, to start a business, to handle an emergency calmly, to NOT depend on someone else.

> Saving is voting for your future self.

## Mindset Shift 3: From "Rich People are Lucky" → "Rich People Made Specific Choices"

Luck plays a tiny role. Choices play a massive role.

Most wealthy people in India weren't born rich. They made consistent, disciplined choices:
- They saved before spending
- They invested early
- They didn't buy status symbols they couldn't afford
- They kept learning about money

These are choices, not luck. And choices are in your control.

## Mindset Shift 4: From Instant Gratification → Delayed Gratification

The ability to wait for something better is one of the highest-value mental skills a teen can develop.

The famous Stanford Marshmallow Experiment showed that children who could delay eating one marshmallow (to receive two later) grew up to be significantly more financially successful as adults.

In practice:
- Wait 24 hours before buying anything over ₹500
- Build toward a goal instead of making impulse purchases
- Find satisfaction in the journey, not just the destination

Every time you delay gratification, you're strengthening this mental muscle.

## Mindset Shift 5: From "Money is Complicated" → "Money is a Learnable Skill"

Many teens feel intimidated by finance — interest rates, mutual funds, compound interest, SIP. It sounds like adult stuff.

But finance is just a set of skills. Like cooking or coding — you learn it step by step.

Start with the basics:
- Week 1: Understand income vs. expenses
- Week 2: Learn what a budget is
- Week 3: Understand compound interest
- Week 4: Learn what a mutual fund is

By the end of one month, you'll know more about personal finance than most adults.

## How to Rewire Your Money Beliefs

### 1. Audit Your Money Language
For one week, notice every thought or sentence you have about money. Write them down. Are they mostly negative? ("Money is hard to get," "Rich people are greedy") — that's your current money story. You can rewrite it.

### 2. Surround Yourself with Financial Role Models
Follow Indian finance educators on YouTube: Ankur Warikoo, CA Rachana Ranade, Labour Law Advisor. Their content rewires how you think about money — for free.

### 3. Use Grofience to Build Identity
When you track expenses daily and hit savings goals, you start to see yourself as someone who is "good with money." That identity shift is the most powerful thing that can happen to a teen's financial life.

### 4. Celebrate Small Wins
Saved ₹200 this week? That's a win. Celebrate it. Tell yourself "I'm good at this." Identity builds through evidence.

## The Teen Advantage

Adults often have decades of bad money habits to unlearn. You don't. You're starting fresh, with the world's most powerful financial tool in your hands: **time**.

Your mindset + time = unlimited financial potential.

Start now. Think rich first. The earning and saving follows naturally.
    `,
  },
]

export function getBlogPost(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null
}

export function getRelatedPosts(currentSlug, category, limit = 3) {
  return BLOG_POSTS.filter(
    (p) => p.slug !== currentSlug && p.category === category
  ).slice(0, limit)
}

export function getFeaturedPost() {
  return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0]
}

export function getLatestPosts(limit = 3) {
  return [...BLOG_POSTS]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit)
}

export function getPostsByCategory(category) {
  if (!category || category === 'All') return BLOG_POSTS
  return BLOG_POSTS.filter((p) => p.category === category)
}
