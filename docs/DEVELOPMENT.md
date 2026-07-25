# Development

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for Postgres and Redis)

---

## Setup

```bash
# Clone and install
git clone <repo-url> jobtrack
cd jobtrack
pnpm install

# Start database services
pnpm docker:up

# Run migrations and seed
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev
```

This starts:
- **Frontend** at `http://localhost:5173` (Vite dev server)
- **Backend** at `http://localhost:3000` (NestJS with hot reload)
- **Swagger docs** at `http://localhost:3000/api/docs`
- **Postgres** at `localhost:5432`
- **Redis** at `localhost:6379`

---

## Available Scripts

### Root (`package.json`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend and backend concurrently |
| `pnpm build` | Build both packages |
| `pnpm lint` | Lint both packages |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm test` | Run all tests |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database |
| `pnpm db:reset` | Reset database and re-seed |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm docker:up` | Start Docker services |
| `pnpm docker:down` | Stop Docker services |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Vite dev server (port 5173) |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | ESLint (strict, zero warnings) |
| `pnpm test` | Run Vitest tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:e2e` | Run Playwright E2E tests |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | NestJS with hot reload (port 3000) |
| `pnpm build` | Build for production |
| `pnpm start:prod` | Start production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Run Jest unit tests |
| `pnpm test:e2e` | Run Jest E2E tests |
| `pnpm test:cov` | Run tests with coverage |

---

## Docker Services

```yaml
services:
  postgres:
    image: postgres:16-alpine
    port: 5432
    volume: postgres_data

  redis:
    image: redis:7-alpine
    port: 6379
    volume: redis_data
```

Both use `restart: unless-stopped` and include health checks.

---

## Frontend Details

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Build | Vite + esbuild |
| Language | TypeScript (strict mode) |
| Routing | React Router v6 |
| State | TanStack React Query v5 |
| HTTP | Axios with JWT interceptors |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |

### Path Aliases

`@/` maps to `frontend/src/`. Use in imports:

```ts
import { Button } from '@/components/ui/button';
```

### API Proxy

Vite proxies `/api` to `http://localhost:3000` in development. The Axios client uses `/api` as base URL, so requests work seamlessly in both dev and production.

### Theme

Light/dark mode CSS variables are defined in `index.css` following shadcn/ui conventions. Toggle is not yet implemented.

---

## Backend Details

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Auth | Passport.js + JWT |
| Validation | class-validator |
| Docs | Swagger (OpenAPI) |

### Authentication

- **Access token:** 15-minute expiry, sent in `Authorization: Bearer` header
- **Refresh token:** 7-day expiry, stored bcrypt-hashed in database
- Tokens are rotated on every refresh
- All routes except auth endpoints require a valid JWT

### Validation

Global `ValidationPipe` enforces:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests with unknown properties
- `transform: true` — auto-transforms payloads to DTO instances

### Swagger

Interactive API docs at `http://localhost:3000/api/docs` with Bearer auth support.

---

## Testing

| Package | Framework | Command |
|---------|-----------|---------|
| Frontend unit | Vitest | `pnpm test` (in `frontend/`) |
| Frontend E2E | Playwright | `pnpm test:e2e` (in `frontend/`) |
| Backend unit | Jest | `pnpm test` (in `backend/`) |
| Backend E2E | Jest | `pnpm test:e2e` (in `backend/`) |

---

## Code Style

- **TypeScript:** Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- **Formatting:** Prettier (single quotes, trailing commas, 100-char width, 2-space indent, LF)
- **Linting:** ESLint with TypeScript and React plugins
- **Editor:** EditorConfig for consistent settings across IDEs

---

## Environment Variables

Defined in `.env` at project root:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection URL |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-in-production` | Access token signing key |
| `JWT_EXPIRATION` | `15m` | Access token lifetime |
| `JWT_REFRESH_SECRET` | `your-super-secret-refresh-key-change-in-production` | Refresh token signing key |
| `JWT_REFRESH_EXPIRATION` | `7d` | Refresh token lifetime |
| `PORT` | `3000` | Backend server port |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend origin for CORS |
| `VITE_API_URL` | `http://localhost:3000` | API URL for Vite proxy |

---

## Project Status

### Completed

- Monorepo structure and tooling
- Prisma schema with all models and relationships
- NestJS modules with full CRUD for all entities
- JWT authentication with refresh token rotation
- Swagger API documentation
- Frontend routing, API client, TypeScript types
- Docker Compose for Postgres and Redis
- Database seeding with demo data

### In Progress / Planned

- Frontend page components (currently placeholders)
- shadcn/ui component library population
- Auth context and protected routes
- Dashboard UI with charts
- Forms for CRUD operations
- Error handling and toast notifications
- Dark mode toggle
- Search and filtering UI
- Testing
