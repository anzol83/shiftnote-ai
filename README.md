# ShiftNote AI

**Professional NDIS documentation for Australian disability support workers — powered by AI.**

ShiftNote AI converts rough shift notes into polished, compliant documentation in seconds. Built specifically for disability support workers who need to generate progress notes and incident reports quickly and accurately.

---

## Features

- **Progress Note Generator** — Converts rough shift notes into professional NDIS-style progress notes
- **Incident Report Generator** — Generates structured ABCD incident reports (Antecedent, Behaviour, De-escalation, Consequence)
- **Secure History** — Save, search, filter, copy and delete all your documents
- **Mobile-First Design** — Works beautifully on phones, tablets, and desktops
- **Dark Mode by Default** — Premium SaaS design optimised for readability

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk |
| Database | MongoDB Atlas + Mongoose |
| AI | Anthropic Claude API |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shiftnote-ai.git
cd shiftnote-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB Atlas
MONGODB_URI=mongodb+srv://...

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Setting Up Third-Party Services

### Clerk (Authentication)

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Enable **Email/Password** and **Google** sign-in methods
4. Enable **Email Verification** in the Email/Password settings
5. Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the Clerk Dashboard
6. In Clerk Dashboard → Redirects, set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### MongoDB Atlas (Database)

1. Create an account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user with read/write access
4. Whitelist your IP (or `0.0.0.0/0` for all IPs during development)
5. Get your connection string from **Connect → Drivers**
6. Replace `<password>` with your database user password
7. Add the connection string as `MONGODB_URI`

### Anthropic (AI)

1. Create an account at [console.anthropic.com](https://console.anthropic.com)
2. Go to **API Keys** and create a new key
3. Add the key as `ANTHROPIC_API_KEY`

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Add environment variables

In the Vercel project settings → **Environment Variables**, add all variables from your `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
MONGODB_URI
ANTHROPIC_API_KEY
```

### 4. Update Clerk settings for production

In Clerk Dashboard → **Domains**, add your Vercel production URL.

### 5. Deploy

Click **Deploy** in Vercel. Your app will be live in ~2 minutes.

---

## Project Structure

```
shiftnote-ai/
├── app/
│   ├── api/
│   │   ├── documents/          # CRUD for saved documents
│   │   │   └── [id]/           # Single document operations
│   │   ├── generate/
│   │   │   ├── progress-note/  # Claude AI generation
│   │   │   └── incident-report/
│   │   └── dashboard/          # Stats endpoint
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard shell with nav
│   │   ├── page.tsx            # Dashboard home
│   │   ├── progress-note/
│   │   ├── incident-report/
│   │   └── history/
│   ├── sign-in/
│   ├── sign-up/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── documents/             # Generated document display
│   ├── forms/                 # Progress note + incident forms
│   ├── layout/                # Navigation
│   └── ui/                    # shadcn/ui components
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── db.ts                  # MongoDB connection
│   ├── prompts.ts             # Claude AI system prompts
│   ├── utils.ts
│   └── validations.ts         # Zod schemas
├── models/
│   ├── Document.ts            # Mongoose document model
│   └── User.ts                # Mongoose user model
├── types/
│   └── index.ts
├── middleware.ts              # Clerk auth middleware
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/generate/progress-note` | Generate a progress note via Claude |
| `POST` | `/api/generate/incident-report` | Generate an incident report via Claude |
| `GET` | `/api/documents` | Fetch user's documents (supports `type`, `search`, `limit` query params) |
| `POST` | `/api/documents` | Save a document |
| `GET` | `/api/documents/[id]` | Get a single document |
| `DELETE` | `/api/documents/[id]` | Delete a document |
| `GET` | `/api/dashboard` | Get dashboard stats |

All routes are protected by Clerk authentication.

---

## Important Notes

- **This is not a clinical tool.** Support workers must always review and verify AI-generated documentation before submission.
- The AI is instructed never to invent information, speculate, or make assumptions. It only uses what you provide.
- Incident reports include a mandatory safety notice reminding workers they remain responsible for accuracy.

---

## License

MIT
