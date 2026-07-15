# CIAR Cars

**A production-grade global automotive marketplace — buy, sell, and rent vehicles across 60+ countries with enterprise admin tooling and serverless-ready architecture.**

> Built for scale, crafted for performance. One codebase powers the public marketplace, seller dashboards, wallet flows, and a full CMS-style admin panel.

<p align="center">
  <br />
  <strong>📸 Screenshot / Demo GIF</strong><br />
  <code>docs/screenshot.png</code> or <code>docs/demo.gif</code>
  <br /><br />
</p>

<p align="center">
  <a href="https://ciar-cars.vercel.app"><strong>Live Demo</strong></a>
  &nbsp;·&nbsp;
  <a href="docs/BACKEND.md">Backend Docs</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/alphacode800-web/Ciar-cars">Repository</a>
</p>

---

## Tech Stack & Key Highlights

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| **Styling** | Tailwind CSS 4 · shadcn/ui · Radix UI · Framer Motion |
| **Data** | Prisma 6 · SQLite (dev) / PostgreSQL (prod) |
| **Auth** | NextAuth.js · bcrypt · role-based access (user / seller / admin) |
| **State** | Zustand · TanStack Query · React Hook Form + Zod |
| **i18n** | Custom translation layer · 5 locales · full RTL (Arabic) |
| **Analytics** | Python FastAPI sidecar (`services/analytics-api`) |
| **Deploy** | Vercel multi-service · standalone output · bundled SQLite |

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/FastAPI-Analytics-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
</p>

### Engineering highlights

- **Service-layer API architecture** — Thin route handlers delegate to typed services (`userService`, `carService`, `walletService`). Shared `createHandler()` wrapper enforces auth, Zod validation, and unified error responses in one place.
- **Serverless SQLite on Vercel** — Read-only filesystem constraints solved by copying the bundled database to `/tmp` at cold start, with `outputFileTracingIncludes` ensuring the DB ships with the serverless bundle.
- **CMS-grade admin without a headless CMS** — News ticker, brand wordmark, hero backgrounds, banners, and homepage sections are stored as `SiteSetting` JSON and edited live from the admin panel.
- **Client view router** — Marketplace flows (listing, detail, wallet, chat, rentals) run as in-app views via Zustand, keeping transitions fast while Next.js handles API routes and SSR shell.

---

## Core Features

- **Multi-country marketplace** — 3,100+ seeded listings across 60+ countries. Country filter persists in `localStorage`; APIs support pagination, sorting, and full-text search with suggest endpoint.
- **Role-based auth** — Buyers, sellers, admins, and super-admins. Registration with phone country codes, wallet balance, and NextAuth session cookies. Admin routes gated via `requireAdmin()` middleware.
- **CIAR Wallet** — Top-up, transaction history, and rental/checkout integration. Wallet mutations run inside Prisma transactions to keep balance and ledger rows consistent.
- **Rentals & bookings** — Availability checks, booking lifecycle, and admin booking management. Rental service encapsulates date overlap logic away from route handlers.
- **Real-time chat (client-ready)** — Chat rooms and messages API with Socket.io client wired for future real-time layer; REST fallback for message history.
- **Admin command center** — Cars, users, payments, bookings, audit logs, navigation builder, homepage sections, appearance (brand + ticker + banners). 20 reusable admin UI primitives in a shared component library.
- **Internationalization** — English, Arabic, French, German, Spanish. RTL layout, locale-aware number/currency formatting, and admin panel translations.
- **Configurable site chrome** — Premium news ticker (TV-style marquee), decorative brand wordmark, payment methods carousel, and theme toggle (light/dark via `next-themes`).

---

## Architecture & Folder Structure

```
ciar-cars/
├── prisma/
│   ├── schema.prisma      # 15+ models: User, Car, Rental, Wallet, Chat, SiteSetting…
│   └── seed.ts            # Full demo data (users, cars, settings, banners)
├── db/
│   └── custom.db          # SQLite database (bundled for Vercel)
├── services/
│   └── analytics-api/     # FastAPI: search suggest, market analytics, health
├── public/
│   └── payments/          # Payment method assets (SVG + branded cards)
└── src/
    ├── app/
    │   ├── api/           # REST routes — thin handlers only
    │   ├── admin/         # Admin shell routes
    │   ├── layout.tsx     # Fonts, theme provider, metadata
    │   └── page.tsx       # SPA view switcher (home, listing, wallet…)
    ├── components/
    │   ├── admin/         # Dashboard sections + 20 reusable admin primitives
    │   ├── home/          # Hero, featured cars, payment banner, stats
    │   ├── layout/        # Navbar, footer, news ticker, mobile nav
    │   └── ui/            # shadcn/ui design system (40+ components)
    ├── hooks/             # useTranslation, useUserDashboard, useAdminTranslation
    ├── lib/
    │   ├── api-handler.ts # createHandler — auth + validation + errors
    │   ├── api-response.ts
    │   ├── db.ts          # Prisma singleton + Vercel /tmp DB copy
    │   ├── news-ticker.ts # Parse/serialize ticker config from SiteSetting
    │   └── brand-wordmark.ts
    ├── services/          # Business logic (car, user, wallet, rental, audit…)
    ├── store/             # Zustand: app view, auth, currency, i18n locale
    ├── types/             # Shared TypeScript domain types
    ├── validators/        # Zod schemas shared by API routes
    └── views/             # Full-page view components (listing, auth, admin…)
```

### Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Thin routes, fat services** | `app/api/*` → `services/*` | Routes stay ~20 lines; business logic is testable and reusable. |
| **Unified API contract** | `api-response.ts` | Every endpoint returns `{ success, data, error, pagination }`. |
| **Custom hooks** | `hooks/` | Data fetching and i18n isolated from presentation. |
| **View-based routing** | `app-store.ts` + `page.tsx` | Instant in-app navigation without remounting the layout shell. |
| **Settings as JSON** | `SiteSetting` model | CMS features without external dependencies; admin serializes/deserializes typed configs. |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 10+ (or pnpm / yarn)
- **Python 3.11+** (optional — analytics API only)

### 1. Clone & install

```bash
git clone https://github.com/alphacode800-web/Ciar-cars.git
cd Ciar-cars
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `file:./db/custom.db` for local SQLite |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Long random string (required in production) |
| `ANALYTICS_API_URL` | `http://localhost:8001` (optional) |
| `INTERNAL_API_KEY` | Shared key for analytics API |

### 3. Database

```bash
npm run db:push      # Apply Prisma schema
npm run db:seed      # Seed users, cars, settings, banners
```

**Demo accounts** (after seed):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ciar.com` | `admin123` |
| User | `omar.ali@email.com` | `demo1234` |

### 4. Run locally

```bash
# Next.js app (port 3000)
npm run dev

# Optional: Python analytics API (port 8001)
npm run analytics:install
npm run analytics:dev
```

Open [http://localhost:3000](http://localhost:3000) · Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

### 5. Production build

```bash
npm run build
npm start
```

---

## Key Engineering Challenges & Decisions

### 1. SQLite on serverless (Vercel)

**Problem:** Vercel serverless functions mount the deployment bundle as read-only. Prisma + SQLite expects a writable `file:` path; writes fail at runtime, and the default relative path may not resolve inside the lambda filesystem.

**Approach:**

1. Ship `db/custom.db` inside the serverless bundle via `outputFileTracingIncludes` in `next.config.ts`.
2. On first request in production, copy the bundled DB to `/tmp/ciar-custom.db` (writable ephemeral storage).
3. Cache the resolved URL on `globalThis` so warm invocations skip the copy.

```typescript
// src/lib/db.ts — simplified
if (process.env.VERCEL && configured.startsWith('file:')) {
  const tmpDb = path.join('/tmp', 'ciar-custom.db');
  if (!fs.existsSync(tmpDb)) {
    fs.copyFileSync(path.join(process.cwd(), 'db', 'custom.db'), tmpDb);
  }
  process.env.DATABASE_URL = `file:${tmpDb}`;
}
```

**Trade-off:** Ephemeral `/tmp` resets on cold starts — acceptable for read-heavy marketplace data; production PostgreSQL is the path for write-heavy scale.

---

### 2. API consistency at scale

**Problem:** 35+ API routes with mixed auth levels, validation rules, and error shapes lead to drift and duplicated try/catch blocks.

**Approach:** A single `createHandler()` factory composes auth (`public` | `user` | `admin`), optional Zod `bodySchema` / `querySchema`, and centralized `handleApiError()`. Services own Prisma calls; routes only wire HTTP to domain logic.

```typescript
export const POST = createHandler(
  async (req, { body, user }) => {
    const result = await walletService.topUp(user!.id, body!);
    return apiSuccess(result);
  },
  { auth: 'user', bodySchema: walletTopUpSchema }
);
```

**Result:** New endpoints follow one pattern. Validation errors, auth failures, and `AppError` instances map to consistent HTTP status codes without per-route boilerplate.

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Prisma generate + Next.js production build |
| `npm run db:push` | Sync schema to database |
| `npm run db:seed` | Full demo seed |
| `npm run db:seed-cars` | Bulk cars by country |
| `npm run analytics:dev` | FastAPI analytics on port 8001 |
| `npm run lint` | ESLint |

---

## Deployment

Deployed on **Vercel** with multi-service config (`vercel.json`):

- **Frontend** — Next.js at `/`
- **Analytics API** — FastAPI at `/_/analytics-api`

Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and a strong `INTERNAL_API_KEY` in Vercel environment variables before going live.

---

## License

Private — All rights reserved.

---

<p align="center">
  <sub>CIAR Cars · Built with Next.js, Prisma, and attention to every millisecond.</sub>
</p>
