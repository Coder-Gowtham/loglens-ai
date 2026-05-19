# LogLens AI

AI-powered log monitoring and analysis platform. Ingest application logs, process them asynchronously with BullMQ, analyze them with OpenAI, and explore insights in a React dashboard.

## Features

- JWT authentication with protected APIs
- Multi-tenant log access scoped to user projects
- Log CRUD, search, severity filtering, and pagination
- Redis caching for paginated log lists
- BullMQ background worker for AI analysis
- Structured OpenAI output (severity, summary, cause, fix)
- Re-analysis queue flow with job status tracking
- API-key log ingestion (`POST /ingest/logs`)
- Docker Compose for local full-stack runs

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, Prisma, Redis, BullMQ, OpenAI, Zod, JWT

**Frontend:** React, TypeScript, Vite, React Router

**DevOps:** Docker, Docker Compose, Nginx (frontend production image)

## Project Structure

```text
loglens-ai/
├── backend/          # Express API + Prisma + worker
├── frontend/         # React dashboard
├── docker-compose.yml
└── docs/             # Architecture and resume notes
```

## Quick Start (Local)

### 1. Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, and Redis connection values in `backend/.env`.

### 2. Database & services

Start PostgreSQL and Redis, then:

```bash
cd backend
npm install
npx prisma migrate deploy
npm run dev
```

In a second terminal:

```bash
cd backend
npm run worker
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, register, create a project, and submit logs.

## Docker

```bash
# From repo root — set OPENAI_API_KEY in shell or .env
docker compose up --build
```

| Service   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:8080  |
| Backend   | http://localhost:5000  |
| Postgres  | localhost:5432         |
| Redis     | localhost:6379         |

## API Reference

### Auth

| Method | Path             | Auth | Description        |
|--------|------------------|------|--------------------|
| POST   | `/auth/register` | No   | Register user      |
| POST   | `/auth/login`    | No   | Login              |
| GET    | `/auth/me`       | JWT  | Current user       |

### Projects

| Method | Path             | Auth | Description        |
|--------|------------------|------|--------------------|
| POST   | `/projects`      | JWT  | Create project     |
| GET    | `/projects`      | JWT  | List user projects |
| GET    | `/projects/:id`  | JWT  | Get project        |

### Logs

| Method | Path                    | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| POST   | `/logs`                 | JWT  | Create log (queues AI)   |
| GET    | `/logs`                 | JWT  | List logs (paginated)    |
| GET    | `/logs/:id`             | JWT  | Get log + analysis       |
| PATCH  | `/logs/:id`             | JWT  | Update log               |
| DELETE | `/logs/:id`             | JWT  | Delete log               |
| POST   | `/logs/:id/reanalyze`   | JWT  | Re-queue AI analysis     |

**Query params for `GET /logs`:** `page`, `limit`, `search`, `severity`

### Ingest (API key)

| Method | Path            | Auth        | Description                    |
|--------|-----------------|-------------|--------------------------------|
| POST   | `/ingest/logs`  | `X-API-Key` | Ingest log for project API key |

### Health

| Method | Path      | Description                          |
|--------|-----------|--------------------------------------|
| GET    | `/health` | API + database + Redis health checks |

## AI Processing Flow

```text
Client creates log → PostgreSQL (status: pending)
                  → BullMQ job (log-analysis)
                  → Worker: OpenAI structured analysis
                  → LogAnalysis saved, status: completed
                  → Frontend polls / refreshes list
```

## Security

- Password hashing with bcrypt
- JWT on protected routes
- Logs scoped to authenticated user's projects
- Zod validation on auth, logs, and projects
- Global and auth rate limiting
- Helmet security headers

## Documentation

- [Architecture & system design](docs/ARCHITECTURE.md)
- [Resume & interview notes](docs/RESUME.md)

## Scripts

| Location  | Command           | Purpose              |
|-----------|-------------------|----------------------|
| backend   | `npm run dev`     | API dev server       |
| backend   | `npm run worker`  | AI queue worker      |
| backend   | `npm run build`   | Compile TypeScript   |
| frontend  | `npm run dev`     | Vite dev server      |
| frontend  | `npm run build`   | Production build     |

## License

MIT
