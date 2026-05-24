# LAZISNU — Agent Guide

## Repository structure

```
lazisnu/
├── backend/          # PHP REST API (vanilla, no framework)
│   ├── api/          # Route handlers + .htaccess (mod_rewrite → index.php?route=...)
│   ├── config/       # database.php, cors.php
│   ├── helpers/      # jwt.php, response.php
│   └── middleware/   # auth.php
├── database/
│   └── schema.sql    # MySQL schema + seed data (lazisnu_db, utf8mb4)
└── frontend/         # Next.js 16.2.6 / React 19.2.4 / Tailwind v4
    ├── src/
    │   ├── app/          # App Router (login at /, dashboard/* behind auth)
    │   ├── components/   # Sidebar, Modal
    │   ├── contexts/     # AuthContext (JWT in localStorage)
    │   └── lib/          # api.js (fetch wrapper, Rupiah/date formatters)
    └── next.config.mjs   # static export, basePath: /lazisnu, trailingSlash: true
```

## Frontend

- **No TypeScript** — plain JS with `@/*` → `./src/*` path alias (see `jsconfig.json`)
- **No test framework, no linter, no typechecker** configured
- Only 3 scripts: `bun run dev`, `bun run build`, `bun run start` (use `bun`, not `npm` — `npm` is broken)
- Static export via `next build` → outputs to `out/`, served at `/lazisnu/` base path
- Login at `GET /lazisnu/`, dashboard at `GET /lazisnu/dashboard/*`
- JWT stored in `localStorage` key `lazisnu_token`; API base from `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api`)
- All interactive components use `'use client'` directive
- CSS via Tailwind v4 with `@tailwindcss/postcss` plugin; custom CSS in `globals.css` (glass-card, gradient-nu, etc.)

### Development

```sh
cd frontend
bun run dev           # → http://localhost:3000
bun run build         # static export → out/
```

## Backend

- Vanilla PHP (no Laravel/Symfony), no Composer dependencies
- Served via `php -S localhost:8000 router.php` (router script mimics Apache mod_rewrite) or Apache pointing at `backend/`
- API routing: `GET/POST/PUT/DELETE /api/{resource}?route={resource}/{id}/{action}` via Apache mod_rewrite
- No migrations — schema is `database/schema.sql`, apply manually
- Default credentials: `admin` / `admin123`
- JWT secret hardcoded in `helpers/jwt.php` — change for production
- Org hierarchy: `PP → PW → PC → MWC → PR` (national → province → city → district → village)
- Admin users can read/write child orgs; staff users restricted to their own org

### Development

```sh
cd backend
php -S localhost:8000 router.php
```

## Database

- MySQL, database: `lazisnu_db`, charset: `utf8mb4`
- Apply schema: `mariadb -u lazisnu -plazisnu < database/schema.sql`
- Admin password hash in schema is `password_hash('admin123', PASSWORD_DEFAULT)` (bcrypt, cost 12)
- Default admin user hashed with `password_hash('admin123', PASSWORD_DEFAULT)`

## Key conventions

- API responses use `{ success: bool, message: string, data?: ..., errors?: ... }` format
- Indonesian language in UI and API messages
- Rupiah formatting: `formatRupiah()` in `api.js` (Intl.NumberFormat id-ID, no decimals)
- Sidebar menu items defined in `Sidebar.js`; admin-only items in `adminMenuItems`
- All dashboard pages are `'use client'` with `useAuth()` hook for session
