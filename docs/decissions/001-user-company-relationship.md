# ADR-003: User and Company Relationship Model

## Status

Accepted

## Date

2026-07-28

## Context

JobTrack is designed as a self-hosted personal job application tracker.

The initial product goal is not to create a global job marketplace or shared recruitment database. Each user manages their own job search data, including companies, jobs, and applications.

A design decision was required around whether companies should be globally shared entities or owned by individual users.

## Decision

Companies are currently modelled as user-specific records.

Relationship:

User
 |
 +-- Companies
       |
       +-- Jobs
             |
             +-- Applications

A user owns their tracked companies and jobs.

## Alternatives Considered

### Option 1: Global Company Database

Structure:

Company
 |
 +-- Jobs
       |
       +-- Applications
              |
              +-- User

Advantages:
- Multiple users can reference the same company.
- More similar to LinkedIn/recruitment platforms.
- Avoids duplicate company records.

Disadvantages:
- Requires company matching logic.
- Requires handling duplicate companies.
- Adds complexity unnecessary for the current product scope.

### Option 2: User-Owned Companies (Chosen)

Advantages:
- Simple data model.
- Fits personal job tracking use case.
- Better privacy for self-hosted deployments.
- Easier implementation.

Disadvantages:
- Multiple users may create duplicate companies.

## Consequences

The current model supports a personal job tracker.

If JobTrack evolves into a collaborative platform or recruitment marketplace, the company relationship should be redesigned.

Possible future migration:

Remove:
- Company.userId

Add:
- Shared Company table
- UserCompany relationship table if required