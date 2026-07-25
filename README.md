# JobTrack

> A self-hosted job application management platform built with modern web technologies.

## Overview

JobTrack is a full-stack web application designed to help job seekers manage every stage of their job search.

Rather than relying on spreadsheets or multiple websites, JobTrack provides a single place to:

- Track companies and job opportunities
- Manage applications through a Kanban workflow
- Store recruiter contacts and interview notes
- Monitor job search statistics
- Generate AI-assisted cover letters and CV analysis (future milestone)

This project is intended to demonstrate production-level full-stack engineering practices including modern architecture, authentication, testing, Docker, CI/CD, documentation, and cloud deployment.

---

# Goals

The project is being developed as if it were a real SaaS product.

Key goals:

- Clean Architecture
- Modular backend
- Type-safe frontend and backend
- Docker-first development
- Automated testing
- CI/CD pipeline
- Comprehensive documentation
- Self-hostable
- AI integration

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui

## Backend

- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- JWT Authentication

## Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- Nginx (future)
- Let's Encrypt (future)

## Testing

- Vitest
- Playwright
- Supertest

---

# Project Structure

```
jobtrack/
│
├── frontend/
│
├── backend/
│
├── infrastructure/
│
├── docs/
│
├── docker-compose.yml
│
└── README.md
```

---

# MVP Features

## Authentication

- User login
- User registration
- JWT authentication
- Refresh tokens

---

## Dashboard

Display:

- Total applications
- Interviews
- Offers
- Rejections
- Response rate
- Recent activity

---

## Companies

Manage companies including:

- Name
- Website
- Industry
- Location
- Notes

---

## Jobs

Track job opportunities.

Fields include:

- Title
- Company
- Location
- Salary
- Remote / Hybrid / On-site
- Source
- Original Job URL
- Description
- Status
- Date found

---

## Applications

Manage each application.

Fields include:

- Associated Job
- Application status
- Date applied
- CV version
- Cover letter
- Notes

---

## Kanban Board

Visual workflow:

```
Saved
   ↓
Applying
   ↓
Applied
   ↓
Interview
   ↓
Offer
   ↓
Rejected
```

Applications should be draggable between columns.

---

# Future Features

## AI

- Job description analysis
- CV matching
- Cover letter generation
- Interview question generation
- Skill gap analysis

---

## Calendar

- Interview reminders
- Follow-up reminders
- Deadline notifications

---

## Contacts

Store recruiter information.

- Name
- Company
- Email
- Phone
- Notes

---

## Analytics

- Applications per month
- Interview rate
- Offer rate
- Average response time
- Applications by country
- Applications by technology

---

## File Storage

Attach files to applications.

Examples:

- CV
- Cover Letter
- Technical Test
- Offer Letter
- Certificates

---

# Architecture

The application will follow a modular monolith architecture.

```
React
    │
 REST API
    │
 NestJS
    │
 Prisma
    │
 PostgreSQL
```

Backend modules:

- Auth
- Users
- Companies
- Jobs
- Applications
- Dashboard
- AI
- Notifications

---

# Development Workflow

Each feature should follow this process:

1. Create GitHub issue
2. Design the feature
3. Implement backend
4. Implement frontend
5. Write tests
6. Update documentation
7. Open Pull Request
8. Merge into main

---

# Documentation

The `/docs` folder will contain:

- Architecture decisions
- ER diagrams
- API documentation
- Deployment guides
- Screenshots
- Roadmap

---

# Deployment

The application should be fully self-hostable using Docker Compose.

Future deployment targets include:

- Home server
- VPS
- Azure
- AWS
- DigitalOcean

---

# Roadmap

## Phase 1

- Project setup
- Docker
- PostgreSQL
- Authentication
- Companies
- Jobs
- Applications
- Dashboard

## Phase 2

- Kanban board
- File uploads
- Search & filtering
- User settings
- Dark mode

## Phase 3

- AI integration
- Email notifications
- Calendar integration
- Analytics
- Public API

## Phase 4

- Browser extension
- Mobile responsive improvements
- Multi-user workspaces
- Team collaboration

---

# Quality Standards

This project aims to demonstrate senior-level engineering practices.

Every feature should include:

- Strong typing
- Validation
- Error handling
- Logging
- Tests
- Documentation
- Clean code
- Security best practices

---

# License

MIT