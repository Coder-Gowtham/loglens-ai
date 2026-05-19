# LogLens AI — Resume & Interview Notes

## One-line summary

Built an AI-powered log analysis platform with JWT auth, async BullMQ processing, OpenAI structured insights, Redis caching, and a React dashboard.

## Resume bullets

- Designed and shipped **LogLens AI**, a full-stack log intelligence platform using **Node.js, Express, PostgreSQL, Prisma, Redis, BullMQ, OpenAI, and React**
- Implemented **JWT authentication**, multi-tenant project scoping, and **Zod** request validation across auth, logs, and projects
- Built an **async AI pipeline** with BullMQ workers, retry/backoff, and log status tracking (`pending` → `processing` → `completed`)
- Integrated **OpenAI structured JSON output** for severity classification, root-cause analysis, and remediation suggestions
- Added **Redis caching** for paginated log queries with targeted invalidation after writes and worker completion
- Delivered a **React dashboard** with auth flows, search/filter, pagination, log ingestion UI, and re-analysis polling
- Containerized the stack with **Docker Compose** (API, worker, frontend, Postgres, Redis) for one-command local deployment

## System design talking points

1. **Why a queue?** AI calls are slow and rate-limited; decoupling keeps API responsive and enables retries.
2. **Why separate worker?** Scale AI throughput independently; API replicas stay stateless.
3. **How is tenancy enforced?** Every log query joins through `Project.userId`.
4. **Cache invalidation:** Pattern-based delete on mutation; user-scoped cache keys prevent cross-tenant leaks.
5. **API-key ingest:** Supports machine clients without JWT while binding logs to a single project.

## Trade-offs made

- `redis.keys("logs:*")` is simple for MVP; production should use SCAN or cache versioning
- Polling for job status in the UI instead of WebSockets (lower complexity)
- Single OpenAI model (`gpt-4.1-mini`) with structured output for predictable parsing

## Possible extensions

- WebSocket or SSE for real-time log and analysis updates
- Dead-letter queue for permanently failed jobs
- Per-project rate limits and usage metering
- Grafana-style visualization and alert rules
