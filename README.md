# Portfolio CMS & Developer Analytics

A full-stack developer portfolio built with **Next.js 16** — a public, data-driven site plus a secure admin CMS, GitHub activity sync, and site traffic analytics.

<img width="1667" height="970" alt="Screenshot 2026-06-07 104653" src="https://github.com/user-attachments/assets/efe5b260-798a-4c76-ab9c-400f5dcdea00" />

## Overview

This project is more than a static portfolio. Content lives in **PostgreSQL** and is managed through an admin panel. Media uploads go to **Supabase Storage** via presigned URLs. GitHub contribution and repository data sync on a schedule (or manually). Public page views and project engagement are tracked for the admin traffic dashboard.

| Layer | Description |
|-------|-------------|
| **Public site** | Home, about, projects, contact, public analytics |
| **Admin CMS** | Profile, projects, technologies, media library, messages |
| **Analytics** | Site traffic (`/admin/traffic`) + GitHub sync (`/admin/analytics`) |

## Features

### Public site

- Data-driven home, about, projects, and contact pages
- Project detail pages with tech stack badges and linked GitHub stats
- Public [`/analytics`](./src/app/(site)/analytics/page.tsx) page — contribution graph, org activity, repository cards
- Contact form with honeypot, rate limiting (Upstash), and optional Resend email
- Resume download tracking via [`/api/resume`](./src/app/api/resume/route.ts)
- SEO metadata, sitemap, robots, motion animations, dark mode

### Admin panel (`/admin`)

- JWT session auth with login rate limiting
- Profile editor (hero image, bio, social links, resume)
- Project CRUD with gallery, technology tags, GitHub repo linking
- Technology management with Simple Icons + custom icon URLs
- Media library with orphan detection and Supabase presigned uploads
- Contact message inbox (pending / read / archived / spam)
- **Site traffic** — page views, visitors, top pages/projects, charts
- **GitHub analytics** — manual sync, contribution preview, repo history charts

## Tech stack

| Category | Tools |
|----------|-------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Motion, Recharts |
| Database | PostgreSQL, Prisma 7 (driver adapter) |
| Storage | Supabase Storage |
| Auth | JWT (jose), bcrypt |
| Email | Resend |
| Rate limits | Upstash Redis |
| GitHub | Octokit, GraphQL contributions API |
| Deploy | Vercel (with cron for GitHub sync) |

## Screenshots

### Public site

| Home | Projects |
|:----:|:--------:|
| <img width="600" height="350" alt="Screenshot 2026-06-07 104653" src="https://github.com/user-attachments/assets/b5fc61ec-93c9-4656-9dce-48610bdf4279" /> | <img width="600" height="350" alt="Screenshot 2026-06-07 104818" src="https://github.com/user-attachments/assets/8763b5db-a352-41aa-9605-0b49aea001e1" />

| Analytics |
|:---------:|
| <img width="800" height="550" alt="Screenshot 2026-06-07 104840" src="https://github.com/user-attachments/assets/d08f10e3-4415-477e-886b-82866a87e4df" /> |

### Admin

| Dashboard | Site traffic |
|:---------:|:------------:|
| <img width="600" height="350" alt="Screenshot 2026-06-07 104907" src="https://github.com/user-attachments/assets/56caaf6f-2c5c-4bc1-ac58-4edea162056c" /> | <img width="600" height="350" alt="Screenshot 2026-06-07 104934" src="https://github.com/user-attachments/assets/00df6234-cfdb-4f19-8c5b-fd05854b2b1f" />


| GitHub analytics |
|:----------------:|
| <img width="800" height="550" alt="Screenshot 2026-06-07 105002" src="https://github.com/user-attachments/assets/0e289bbb-605c-43da-b03c-7780afd95c01" /> |


## Getting started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** (e.g. [Supabase](https://supabase.com))
- **Supabase Storage** bucket for media uploads
- **Recommended:** [Upstash Redis](https://upstash.com) for rate limiting
- **Optional:** [Resend](https://resend.com) for contact emails, GitHub PAT for analytics

### Setup

```bash
git clone <your-repo-url>
cd portfolio
npm install
cp .env.example .env
# Edit .env with your values
npm run db:migrate
npm run db:seed
npm run dev
```

| URL | Purpose |
|-----|---------|
| [http://localhost:3000](http://localhost:3000) | Public site |
| [http://localhost:3000/admin/login](http://localhost:3000/admin/login) | Admin login |

### Environment variables

Copy [`.env.example`](./.env.example) and fill in values:

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | JWT signing secret (32+ random characters) |
| `ADMIN_USERNAME` | Yes | Admin username (used by seed) |
| `ADMIN_PASSWORD` | Yes | Admin password (used by seed) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL for metadata/sitemap |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side uploads) |
| `SUPABASE_STORAGE_BUCKET` | Yes | Storage bucket name (default: `portfolio`) |
| `UPSTASH_REDIS_REST_URL` | Recommended | Rate limit Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Rate limit Redis token |
| `RESEND_API_KEY` | Optional | Contact form email delivery |
| `CONTACT_FROM_EMAIL` | Optional | Sender address (Resend verified domain) |
| `CONTACT_TO_EMAIL` | Optional | Inbox for contact submissions |
| `GITHUB_TOKEN` | Optional | PAT with `read:org` (+ `repo` for private repos) |
| `GITHUB_USERNAME` | Optional | GitHub handle for sync |
| `GITHUB_ORGANIZATIONS` | Optional | Comma-separated org allowlist |
| `CRON_SECRET` | Production | Bearer token for `/api/cron/github-sync` |

Without Upstash, rate limiting is disabled in development. Without Resend/`CONTACT_TO_EMAIL`, messages are saved to the database only.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed profile, projects, technologies, admin user |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
src/
├── app/
│   ├── (site)/          # Public routes
│   ├── (admin)/         # Admin routes (fixed viewport shell)
│   └── api/             # Contact, auth, analytics, cron, resume
├── components/
│   ├── admin/           # CMS UI
│   ├── site/            # Public UI
│   └── ui/              # shadcn primitives
├── lib/
│   ├── analytics/       # Visitor & page view tracking
│   ├── github/          # Sync jobs & GitHub client
│   ├── media/           # Supabase upload helpers
│   └── queries/         # Server-side data fetching
└── generated/prisma/    # Prisma client output
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
docs/
└── screenshots/
```

## Deployment (Vercel)

1. Connect the repo to [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. GitHub cron is configured in [`vercel.json`](./vercel.json) — daily sync at 06:00 UTC via `POST /api/cron/github-sync` with header `Authorization: Bearer <CRON_SECRET>`.
5. Run migrations against production Postgres (`npm run db:migrate` in CI or locally with prod `DATABASE_URL`).
6. Create a Supabase Storage bucket and set `SUPABASE_STORAGE_BUCKET`.
