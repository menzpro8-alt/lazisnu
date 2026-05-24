# LAZISNU — Agent Guide

3-package monorepo:

```
lazisnu/
├── backend/   # Vanilla PHP REST API (no framework, no Composer)
├── database/  # MySQL schema + seed data (schema.sql)
└── frontend/  # Next.js 16 / React 19 / Tailwind v4
```

See `frontend/AGENTS.md` for frontend-specific development commands and conventions.

### Quick start

```sh
# 1. Database
mariadb -u lazisnu -plazisnu < database/schema.sql

# 2. Backend
cd backend && php -S localhost:8000 router.php

# 3. Frontend
cd frontend && bun run dev
```

### Key facts

- Indonesian-language charity financial app (Zakat/Infaq/Sedekah)
- Org hierarchy: PP (national) → PW → PC → MWC → PR (village)
- Backend: custom JWT auth, PDO/MySQL, `api/index.php?route=` routing with Apache mod_rewrite
- Frontend: static export (`/lazisnu/` base path), JWT in localStorage, no TS, no tests, no linter
- Default login: `admin` / `admin123`
- DB user: `lazisnu` / `lazisnu` (MariaDB/MySQL)
