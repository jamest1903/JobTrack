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

### ApplicationStatus

Tracks application-specific progress.

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

**Relations:** has many Applications.

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

**Relations:** has many Jobs.

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
| `dateFound` | DateTime | Default: `now()` |
| `createdAt` | DateTime | Default: `now()` |
| `updatedAt` | DateTime | Auto-updated |
| `companyId` | Int? | FK → Company, SetNull on delete, Indexed |

**Relations:** optionally belongs to Company, has many Applications.

**Indexes:** `companyId`.

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
User
  │
  │
  └──────< (many) Application
```

### Delete Behavior

| Parent | Child | On Delete |
|--------|-------|-----------|
| User | Applications | **Cascade** — all deleted |
| Company | Jobs | **SetNull** — `companyId` becomes null |
| Job | Applications | **Cascade** — all deleted |

---

## Seed Data

`backend/prisma/seed.ts` creates demo data on `prisma db seed`:

| Entity | Data |
|--------|------|
| User | `demo@jobtrack.dev` / `admin` |
| Company | Acme Corp, TechStart Inc |
| Job | Senior Software Engineer, Full Stack Developer |
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
