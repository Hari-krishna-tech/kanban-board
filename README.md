# Learning Kanban Dashboard

A full-stack Kanban board for organizing and tracking your learning journey. Built with Next.js, TypeScript, PostgreSQL, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon DB)
- **ORM:** Prisma 7
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query + Zustand
- **DnD:** dnd-kit
- **Auth:** NextAuth v5 (Google OAuth)
- **Charts:** Recharts

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd kanban-board
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=generate-a-secret  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
```

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env.local`

### 4. Set up database

```bash
# Push schema to Neon DB
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Kanban Board** — Drag-and-drop tasks across Backlog, Learning, Practicing, and Completed columns
- **Task Cards** — Title, description, priority, tags, due date, progress, subtasks, resources, time tracking
- **Learning Types** — Mark tasks as Concept, Project, or Revision
- **Insights Dashboard** — Weekly completion chart, learning streak, time spent, category breakdown
- **Search & Filters** — Global search, filter by priority and tags
- **Dark Mode** — System-aware with manual toggle
- **Keyboard Shortcuts:**
  - `/` — Focus search
  - `n` — New task
  - `Esc` — Close dialogs

## Project Structure

```
app/
├── (auth)/login/         # Google sign-in page
├── (dashboard)/
│   ├── board/            # Kanban board
│   └── insights/         # Stats dashboard
├── api/auth/             # NextAuth route
actions/                  # Server actions (task, board, subtask, etc.)
components/
├── dashboard/            # Sidebar, header
├── kanban/               # Board, column, task-card, task-dialog
└── ui/                   # shadcn/ui components
lib/                      # Auth config, Prisma client, utils
prisma/                   # Schema + migrations
store/                    # Zustand UI store
types/                    # TypeScript types
```

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
