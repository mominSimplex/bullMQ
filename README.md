# BullMQ Demo

A demo project using [BullMQ](https://docs.bullmq.io/) for job queues with Redis, PostgreSQL for persistence, and [Bull Board](https://github.com/felixmosh/bull-board) for monitoring.

## What it does

- **Queue**: Jobs process database rows in chunks (configurable size).
- **Worker**: Fetches pending rows from PostgreSQL, marks them processed, with retries and optional failure simulation.
- **Dashboard**: Bull Board UI to inspect jobs, retries, and queue status.

## Prerequisites

- **Node.js** (v18+)
- **Docker** (for Redis and PostgreSQL)

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Start Redis and PostgreSQL

```bash
docker-compose up -d
```

### 3. Set up the database

```bash
npm run setup-db
```

### 4. Seed sample data (optional, 200 items by default)

```bash
npm run seed
```

### 5. Start the worker (keep this running)

```bash
npm run worker
```

### 6. Enqueue a job (in another terminal)

```bash
npm run enqueue
```

### 7. Open the dashboard

```bash
npm run dashboard
```

Then open **http://localhost:3000/admin/queues** in your browser to see the queue and job status.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run setup-db` | Creates the `items` table in PostgreSQL. |
| `npm run seed` | Creates the table (if needed) and seeds items. Use `SEED_COUNT=500` to change count (default: 200). |
| `npm run worker` | Starts the BullMQ worker (processes jobs). |
| `npm run enqueue` | Enqueues one job. Optional: `npm run enqueue 2` to simulate failure at chunk index 2 (triggers retries). |
| `npm run reset-items` | Sets all items back to `pending` (for re-running the demo). |
| `npm run dashboard` | Starts the Bull Board UI at http://localhost:3000. |

## Environment variables (optional)

Create a `.env` file if you need to override defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL. |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/bullmq_demo` | PostgreSQL connection string. |
| `DASHBOARD_PORT` | `3000` | Port for the Bull Board server. |
| `SEED_COUNT` | `200` | Number of items to seed (used by `npm run seed`). |
| `CHUNK_SIZE` | `50` | Rows per chunk (used when enqueueing). |

## Demo flow

1. Start Redis and Postgres: `docker-compose up -d`
2. Setup and seed: `npm run setup-db` then `npm run seed`
3. Start worker: `npm run worker`
4. Start dashboard: `npm run dashboard` → open http://localhost:3000/admin/queues
5. Enqueue: `npm run enqueue` (in another terminal) — watch the job in the dashboard and logs in the worker terminal
6. To see retries: `npm run enqueue 2` (fails at chunk 2, then retries with backoff)

## Project structure

```
├── src/
│   ├── dashboard.ts       # Bull Board Express server
│   ├── db.ts              # PostgreSQL pool + item helpers
│   └── queue/
│       ├── queue.ts       # BullMQ Queue instance
│       ├── worker.ts      # Worker + chunk processing
│       └── producer.ts    # addJob helper
├── scripts/
│   ├── setup-db.ts        # Create items table
│   ├── seed.ts            # Seed items
│   ├── enqueue.ts         # Enqueue a job
│   └── reset-items.ts    # Reset all items to pending
├── docker-compose.yml    # Redis + PostgreSQL
└── package.json
```

## License

ISC
