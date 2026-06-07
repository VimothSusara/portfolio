# Portfolio CMS & Developer Analytics

A full-stack developer portfolio built with **Next.js 16** — a public, data-driven site plus a secure admin CMS, GitHub activity sync, and site traffic analytics.

![Home page](./docs/screenshots/home.svg)

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
| ![Home](./docs/screenshots/home.svg) | ![Projects](./docs/screenshots/projects.svg) |

| Analytics |
|:---------:|
| ![Public analytics](./docs/screenshots/analytics-public.svg) |

### Admin

| Dashboard | Site traffic |
|:---------:|:------------:|
| ![Admin dashboard](./docs/screenshots/admin-dashboard.svg) | ![Admin traffic](./docs/screenshots/admin-traffic.svg) |

| GitHub analytics |
|:----------------:|
| ![GitHub analytics](./docs/screenshots/admin-github.svg) |

> Replace SVG placeholders with real PNG/WebP captures — see [`docs/screenshots/CAPTURE.md`](./docs/screenshots/CAPTURE.md).

## Architecture

```mermaid
flowchart TB
    subgraph public [Public site]
        Pages[Server Components]
        Tracker[Page view tracker]
    end

    subgraph admin [Admin panel]
        CMS[CMS pages]
        Traffic[Traffic dashboard]
        GH[GitHub sync UI]
    end

    subgraph api [API routes]
        Contact[/api/contact]
        Analytics[/api/analytics/*]
        Cron[/api/cron/github-sync]
    end

    subgraph data [Data layer]
        DB[(PostgreSQL)]
        Storage[(Supabase Storage)]
        Redis[(Upstash Redis)]
        GitHub[GitHub API]
    end

    Pages --> DB
    Tracker --> Analytics --> DB
    CMS --> DB
    CMS --> Storage
    Contact --> DB
    Contact --> Redis
    GH --> GitHub --> DB
    Cron --> GitHub
    Traffic --> DB
```

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

Default admin credentials come from `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` (seed defaults: `admin` / `admin123` — **change before production**).

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
