# Architecture

JobTrack is a self-hosted job application management platform built as a **pnpm monorepo** with two workspace packages: `frontend/` and `backend/`.

```
jobtrack/
├── frontend/          React SPA (Vite + TypeScript)
├── backend/           REST API (NestJS + Prisma)
├── docs/              Documentation
├── infrastructure/    Future infrastructure configs
├── docker-compose.yml Postgres + Redis services
└── package.json       Root monorepo scripts
```

---

## System Overview

```
┌─────────────┐      HTTP/JSON      ┌──────────────┐      SQL       ┌──────────┐
│   Frontend   │ ──────────────────► │   Backend    │ ─────────────► │ Postgres │
│  React+Vite  │ ◄────────────────── │   NestJS     │ ◄───────────── │   16     │
│  Port 5173   │   API responses     │  Port 3000   │   Prisma ORM   │ Port 5432│
└─────────────┘                      └──────────────┘                └──────────┘
                                          │
                                          │ Caching
                                          ▼
                                     ┌──────────┐
                                     │  Redis   │
                                     │ Port 6379│
                                     └──────────┘
```

Vite proxies `/api` requests to the backend during development, so the frontend makes requests to `/api` without worrying about CORS or ports.

---

## Frontend

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack React Query, React Router v6

### Structure

```
frontend/src/
├── api/
│   └── client.ts          Axios instance with JWT interceptors
├── components/
│   └── ui/                shadcn/ui components (not yet populated)
├── hooks/                 Custom React hooks (empty)
├── lib/
│   └── utils.ts           cn() utility for Tailwind class merging
├── pages/                 Page components (empty - placeholder routes)
├── types/
│   └── index.ts           TypeScript interfaces for all entities
├── App.tsx                 Route definitions
├── main.tsx               Entry point with providers
└── index.css              Tailwind + shadcn/ui theme variables
```

### Routing

| Path | Page | Status |
|------|------|--------|
| `/` | Welcome/Home | Placeholder |
| `/login` | Login | Placeholder |
| `/register` | Register | Placeholder |
| `/dashboard` | Dashboard | Placeholder |
| `/companies` | Companies | Placeholder |
| `/jobs` | Jobs | Placeholder |
| `/applications` | Applications | Placeholder |

### State Management

- **Server state:** TanStack React Query (5min stale time, 1 retry)
- **Auth state:** Planned (no context/provider yet)
- **Local state:** React useState/useReducer

### API Client

`api/client.ts` configures Axios with:
- Base URL `/api` (proxied to backend)
- **Request interceptor:** Attaches `Authorization: Bearer <token>` from localStorage
- **Response interceptor:** Auto-refreshes expired tokens on 401 responses; redirects to `/login` on failure

---

## Backend

**Stack:** NestJS, Prisma ORM, PostgreSQL, Passport.js, class-validator, Swagger

### Module Architecture

```
AppModule
├── ConfigModule (global)     Loads .env variables
├── PrismaModule (global)     Database access for all modules
├── AuthModule                Registration, login, JWT tokens
├── UsersModule               User profile
├── CompaniesModule           Company CRUD
├── JobsModule                Job CRUD with status filtering
├── ApplicationsModule         Application CRUD with status filtering
└── DashboardModule           Statistics and recent activity
```

### Structure

```
backend/src/
├── auth/
│   ├── dto/                  RegisterDto, LoginDto
│   ├── guards/               JwtAuthGuard
│   ├── strategies/           JwtStrategy (Passport)
│   ├── auth.controller.ts    POST register/login/refresh/logout
│   ├── auth.module.ts
│   └── auth.service.ts       Token generation, bcrypt hashing
├── users/
│   ├── dto/                  CreateUserDto
│   ├── users.controller.ts   GET /users/me
│   └── users.service.ts
├── companies/
│   ├── dto/                  CreateCompanyDto, UpdateCompanyDto
│   ├── companies.controller.ts  Full CRUD
│   └── companies.service.ts
├── jobs/
│   ├── dto/                  CreateJobDto, UpdateJobDto
│   ├── jobs.controller.ts    Full CRUD + status filter
│   └── jobs.service.ts
├── applications/
│   ├── dto/                  CreateApplicationDto, UpdateApplicationDto
│   ├── applications.controller.ts  Full CRUD + status filter
│   └── applications.service.ts
├── dashboard/
│   ├── dashboard.controller.ts  GET stats, GET recent
│   └── dashboard.service.ts
├── prisma/
│   └── prisma.service.ts     Database connection lifecycle
└── main.ts                   Bootstrap, global config, Swagger
```

### API Endpoints

All endpoints are prefixed with `/api`. All except auth endpoints require a valid JWT.

#### Auth (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get tokens |
| POST | `/api/auth/refresh` | Refresh access token |

#### Auth (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/logout` | Invalidate refresh token |

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |

#### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/companies` | Create company |
| GET | `/api/companies` | List all user's companies |
| GET | `/api/companies/:id` | Get single company |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Delete company |

#### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs` | List jobs (optional `?status=` filter) |
| GET | `/api/jobs/:id` | Get single job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

#### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Create application |
| GET | `/api/applications` | List applications (optional `?status=` filter) |
| GET | `/api/applications/:id` | Get single application |
| PUT | `/api/applications/:id` | Update application |
| DELETE | `/api/applications/:id` | Delete application |

#### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Application counts by status, response rate |
| GET | `/api/dashboard/recent` | Recently updated applications (default limit: 10) |

### Authentication Flow

```
Register/Login
    │
    ├──► Password hashed with bcrypt (12 rounds)
    ├──► Access token created (JWT, 15min expiry)
    ├──► Refresh token created (JWT, 7day expiry, bcrypt-hashed in DB)
    │
    ▼
Frontend stores both tokens in localStorage
    │
    ▼
Each API request ──► Bearer <accessToken> header
    │
    ├── 200 OK ──► Success
    │
    └── 401 Unauthorized ──► Auto-refresh
        │
        ├── POST /api/auth/refresh with refreshToken
        │   ├──► Verify hash against stored value
        │   ├──► Rotate both tokens
        │   └──► Retry original request
        │
        └── Refresh failed ──► Clear localStorage, redirect to /login
```

### Global Configuration

- **ValidationPipe:** `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **CORS:** Enabled for `http://localhost:5173` with credentials
- **Swagger:** Available at `/api/docs` with Bearer auth support

---

## Shared Conventions

- All database queries are scoped to the authenticated user via `userId` from the JWT
- DELETE operations use cascade: deleting a User removes their Companies, Jobs, and Applications
- Deleting a Company sets `companyId` to null on associated Jobs (does not delete Jobs)
- All timestamps use `createdAt` / `updatedAt` convention
- Status enums (`JobStatus`, `ApplicationStatus`) share the same values: `SAVED`, `APPLYING`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`
