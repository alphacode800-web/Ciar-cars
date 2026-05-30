# CIAR Cars — Backend Architecture

## Stack

| Layer | Technology |
|-------|------------|
| API | Next.js App Router (`src/app/api/*`) |
| ORM | Prisma 6 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Validation | Zod (`src/validators/*`) |
| Services | `src/services/*` |
| Analytics (optional) | Python FastAPI (`services/analytics-api/`) |

## Structure

```
src/
  app/api/          → HTTP route handlers (thin)
  services/         → Business logic + Prisma
  validators/       → Zod schemas (shared client/server)
  lib/
    api-response.ts → Unified { success, data, error, pagination }
    api-handler.ts  → createHandler() wrapper
    errors.ts       → AppError, AuthError, ValidationError
    db.ts           → Prisma singleton
```

## Commands

```bash
npm run db:push       # Sync schema to database
npm run db:generate   # Regenerate Prisma client
npm run db:seed       # Full demo seed
npm run db:seed-cars  # Bulk cars by country
npm run analytics:dev # Python analytics API (port 8001)
```

## API Conventions

- **Success:** `{ success: true, data: T, pagination?: {...} }`
- **Error:** `{ success: false, error: string, code?: string, details?: {...} }`
- **Auth:** NextAuth session cookie | Bearer JWT | `X-User-Id` (dev only)

## Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | Public | DB health + stats |
| POST | `/api/auth/register` | Public | User registration |
| POST | `/api/users/wallet/topup` | User | Wallet top-up |
| GET/POST/DELETE | `/api/users/saved-searches` | User | Saved searches |
| GET | `/api/settings` | Public subset / Admin all | Site settings |

## Python Analytics API

```bash
cd services/analytics-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Endpoints:
- `GET /health` — service + DB check
- `GET /search/suggest?q=toyota` — autocomplete
- `GET /analytics/overview` — platform stats (requires `X-Api-Key` header)
- `GET /analytics/market/{country}` — market insight

## Production Checklist

1. Switch `DATABASE_URL` to PostgreSQL
2. Change `provider = "postgresql"` in `schema.prisma`
3. Run `npm run db:migrate`
4. Set strong `NEXTAUTH_SECRET` and `INTERNAL_API_KEY`
5. Remove hardcoded admin credentials from `src/lib/auth.ts`
6. Disable `X-User-Id` auth bypass in production
