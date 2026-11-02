# Project architecture evidence

Reviewed November 2, 2026. The public diagrams are simplified descriptions of the implementation, not deployment or performance claims. Private source code is not copied into the portfolio.

## Chronos

Source root: `/Users/vishwakaran/Downloads/Chronos`.

- `entrypoints/chronos.content/index.tsx`: platform observers, React Shadow DOM mounting, session/mode controllers, repository proxies.
- `entrypoints/background.ts`: runtime message dispatch, repositories, goals handler, separate goals database, backup API and change broadcasts.
- `storage/db.ts`: extension-owned IndexedDB sessions, checkpoints, mode states, snapshots, and history.
- `storage/goalsDb.ts`: independent goal storage.
- `wxt.config.ts`: research/benchmark entrypoints excluded from ordinary builds.
- `intelligence/semantic/browser/contracts.ts`: no approved production browser model.

The production diagram deliberately separates the experimental EmbeddingGemma classifier from the durable state path. Goals handlers operate for extension pages and resolve conversation references without rewriting core conversation storage.

## AgentOps

Source root: `/Users/vishwakaran/Downloads/Projects/Agentops`.

- `apps/api/app/api/v1/telemetry.py` and `services/telemetry_service.py`: API-key authentication, validation and enqueueing accepted project events (paths below relative to `apps/api/app` unless stated otherwise).
- `core/telemetry_queue.py`: Redis Streams, consumer group, in-memory fallback.
- `workers/telemetry_worker.py`: durable event deduplication, trace/span reconstruction, pricing, persistence before Redis acknowledgement.
- `api/v1/router.py`: versioned project APIs.
- `api/v1/demo.py`: authorized synthetic simulation calls `TelemetryWorker.process_batch_events` directly and scans resulting traces with `ReliabilityService`.
- `core/config.py`, `core/database.py`, `main.py`: default SQLite configuration, SQLAlchemy async database access, embedded ingestion worker.
- `apps/web/src/api/client.ts` (repository root): bearer-token requests under `/api/v1`.
- `apps/web/src/components/DashboardOverview.tsx` (repository root): API queries populate overview data; Run agent invokes the simulator before reloading data.
- `docker-compose.yml` (repository root): PostgreSQL, Redis, API, and workers.

The queue path describes SDK ingestion. The demo path bypasses Redis while using the same ingestion worker and persistent models. Evidence screenshots show synthetic activity, not measured production usage. The diagram does not claim the optional local SQLite/in-memory setup has durable queue delivery.
