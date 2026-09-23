# DentalHub / DentFlow

A full-stack dental clinic appointment and patient management prototype (MVP v1).

Patients can book appointments, while doctors and receptionists manage availability and appointment workflows through role-specific dashboards. The current implementation focuses on clinic operations; it does not include a validated AI diagnosis system.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| Real-time | Socket.IO (in-app notifications) |

## Project structure

```
├── client/     # React SPA
└── server/     # Express API + Prisma
```

## Prerequisites

- Node.js **20.19+**, **22.12+**, or **24+** (required for Prisma 7 CLI; v20.9 fails with `ERR_REQUIRE_ESM`)
- PostgreSQL (local, Supabase, or `npx prisma dev` for a local Prisma Postgres)

## Quick start

### 1. Database and dependencies

Copy env and set your Postgres URL:

```bash
cd server
npm install
cp .env.example .env
# Edit DATABASE_URL in .env
```

Apply schema and seed admin user:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Default clinic owner: see `server/CREDENTIALS.md` (`doctor@dentflow.com` / `Doctor@12345` by default)

### 2. API

```bash
cd server
npm run dev
```

API: http://localhost:4000/api/health

### 3. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Patient app: http://localhost:5173 · Staff dashboard (bookmark internally): http://localhost:5173/clinic/login

## MVP v1 modules implemented

- **Authentication** — Register (patients), login, JWT, bcrypt
- **User management** — Doctor adds receptionists; staff book appointments for patients
- **Patient management** — Profile view/update, appointment history via API
- **Appointment booking** — 5-step flow, slot validation, double-booking prevention
- **Doctor availability** — Weekly schedules, 15/30/60 min slot generation
- **Appointment management** — Pending → Confirmed → Completed workflow
- **Notifications** — In-app events + Socket.IO push
- **Dashboards** — Patient portal; receptionist operations; doctor growth analytics (`/api/dashboard/growth`)

## MVP v2 (planned)

Medical records, file uploads (S3), email/SMS reminders, billing, reports, calendar views, waitlist, multi-clinic.

## Custom branding (optional)

See `BRANDING.md` — share logo, clinic name, and hex colors if you want overrides. Defaults: Plus Jakarta Sans, teal `#0d9488`, Framer Motion.

## Design

Plus Jakarta Sans, teal palette, deep teal sidebar, Framer Motion transitions, role-specific navigation.
