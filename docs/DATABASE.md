# Database

PostgreSQL 16 (Alpine) managed via Prisma ORM.

---

## Connection

| Property | Value |
|----------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `jobtrack` |
| User | `jobtrack` |
| Password | `jobtrack_dev_password` |

URL format: `postgresql://jobtrack:jobtrack_dev_password@localhost:5432/jobtrack`

---

## Enums

### WorkType

| Value | Description |
|-------|-------------|
| `REMOTE` | Fully remote position |
| `HYBRID` | Partial remote, partial on-site |
| `ONSITE` | Fully on-site position |

### JobStatus

| Value | Description |
|-------|-------------|
| `SAVED` | Bookmarked, not yet applied |
| `APPLYING` | In the process of applying |
| `APPLIED` | Application submitted |
| `INTERVIEW` | Interview stage |
| `OFFER` | Received offer |
| `REJECTED` | Rejected |

### ApplicationStatus

Same values as `JobStatus`. Tracks application-specific progress.

---

## Models

### User

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | Int | PK, autoincrement |
| `email` | String | Unique |
| `name` | String | |
| `password` | String | bcrypt hash (12 rounds) |
| `refreshToken` | String? | bcrypt hash, null when logged out |
| `createdAt` | DateTime | Default: `now()` |
| `updatedAt` | DateTime | Auto-updated |

**Relations:** has many Companies, Jobs, Applications.

---

### Company

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | Int | PK, autoincrement |
| `name` | String | |
| `website` | String? | |
| `industry` | String? | |
| `location` | String? | |
| `notes` | String? | |
| `createdAt` | DateTime | Default: `now()` |
| `updatedAt` | DateTime | Auto-updated |
| `userId` | Int | FK → User, Cascade delete, Indexed |

**Relations:** belongs to User, has many Jobs.

---

### Job

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | Int | PK, autoincrement |
| `title` | String | |
| `location` | String? | |
| `salary` | Int? | |
| `workType` | WorkType? | REMOTE, HYBRID, ONSITE |
| `source` | String? | Where the job was found |
| `url` | String? | Link to job posting |
| `description` | String? | |
| `status` | JobStatus | Default: `SAVED` |
| `dateFound` | DateTime | Default: `now()` |
| `createdAt` | DateTime | Default: `now()` |
| `updatedAt` | DateTime | Auto-updated |
| `userId` | Int | FK → User, Cascade delete, Indexed |
| `companyId` | Int? | FK → Company, SetNull on delete, Indexed |

**Relations:** belongs to User, optionally belongs to Company, has many Applications.

**Indexes:** `userId`, `companyId`, `status`.

---

### Application

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | Int | PK, autoincrement |
| `status` | ApplicationStatus | Default: `SAVED` |
| `appliedDate` | DateTime? | When the application was submitted |
| `cvVersion` | String? | Which CV version was used |
| `coverLetter` | String? | Cover letter content |
| `notes` | String? | |
| `createdAt` | DateTime | Default: `now()` |
| `updatedAt` | DateTime | Auto-updated |
| `userId` | Int | FK → User, Cascade delete, Indexed |
| `jobId` | Int | FK → Job, Cascade delete, Indexed |

**Relations:** belongs to User, belongs to Job.

**Indexes:** `userId`, `jobId`, `status`.

---

## Relationships

```
User (1) ──────< (many) Company
  │
  ├──────< (many) Job
  │                 │
  │                 └──< (many) Application
  │
  └──────< (many) Application
```

### Delete Behavior

| Parent | Child | On Delete |
|--------|-------|-----------|
| User | Companies | **Cascade** — all deleted |
| User | Jobs | **Cascade** — all deleted |
| User | Applications | **Cascade** — all deleted |
| Company | Jobs | **SetNull** — `companyId` becomes null |
| Job | Applications | **Cascade** — all deleted |

---

## Seed Data

`backend/prisma/seed.ts` creates demo data on `prisma db seed`:

| Entity | Data |
|--------|------|
| User | `demo@jobtrack.dev` / `password123` |
| Company | Acme Corp, TechStart Inc |
| Job | Senior Software Engineer (APPLIED), Full Stack Developer (INTERVIEW) |
| Application | One for each job |

---

## Migrations

```bash
# Create a migration after schema changes
pnpm db:migrate

# Reset database and re-seed
pnpm db:reset

# Open Prisma Studio (visual DB browser)
pnpm db:studio

# Seed manually
pnpm db:seed
```

Migrations are stored in `backend/prisma/migrations/` and applied sequentially.
