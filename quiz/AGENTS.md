# LeetTomato Quiz - Architecture Guide

## Overview

Go backend + React/TypeScript frontend. Users search for a LeetCode problem, write a text/pseudocode solution outline, and an LLM grades their response via OpenAI-compatible API with function calling.

Deployed on Fly.io with scale-to-zero. Protected by HTTP basic auth.

## Project Structure

```
quiz/
├── main.go                    # Unified CLI: `quiz server` / `quiz grade`
├── go.mod / go.sum
├── Makefile
├── Dockerfile                 # Multi-stage: node + python + go + debian
├── docker-compose.yml
├── fly.toml
├── .env / .env.example
│
├── scripts/
│   └── build_db.py            # JSON → SQLite (local file or --download from GitHub)
│
├── internal/
│   ├── config/config.go       # Env var loading (.env via godotenv)
│   ├── auth/basic.go          # HTTP basic auth middleware (single password)
│   ├── db/problems.go         # SQLite queries (list, get, search, topics)
│   ├── llm/
│   │   ├── client.go          # OpenAI-compatible HTTP client
│   │   ├── grading.go         # Grading prompt + function schema + Grade()
│   │   └── types.go           # Chat/tool/grading result types
│   └── handler/
│       ├── problems.go        # GET /api/problems, GET /api/problems/{id}, GET /api/topics
│       ├── grading.go         # POST /api/grade
│       └── static.go          # SPA static file serving (index.html fallback)
│
├── frontend/
│   ├── package.json / pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── vite.config.ts         # Proxy /api → Go backend in dev
│   ├── index.html
│   └── src/
│       ├── main.tsx            # Router setup (TanStack Router, code-based)
│       ├── index.css           # Tailwind + Tokyo Night theme variables
│       ├── api/client.ts       # fetch wrappers for all API endpoints
│       ├── types/index.ts      # Problem, GradingResult, etc.
│       ├── routes/
│       │   ├── index.tsx       # Home: search + difficulty filter + paginated list
│       │   └── problem/
│       │       ├── $id.index.tsx   # Problem detail + answer form
│       │       └── $id.result.tsx  # Grading results display
│       └── components/
│           ├── ProblemSearch.tsx
│           ├── ProblemList.tsx
│           ├── ProblemDetail.tsx
│           ├── AnswerForm.tsx
│           ├── GradingResult.tsx
│           ├── DifficultyBadge.tsx
│           └── TopicTag.tsx
│
└── testdata/                  # Sample answers for CLI grading tests
    ├── good-answer.txt
    ├── bad-answer.txt
    └── partial-answer.txt
```

## Database

### SQLite schema

- `problems` — id, source, source_id, slug, title, difficulty, description, examples (JSON), constraints (JSON), hints (JSON), python3_snippet
- `topics` — id, name (unique)
- `problem_topics` — problem_id, topic_id (many-to-many)
- `problems_fts` — FTS5 virtual table on title, with triggers to stay in sync

### Build script: `scripts/build_db.py`

```bash
python3 scripts/build_db.py                    # reads ../merged_problems.json
python3 scripts/build_db.py --download         # fetches from GitHub
python3 scripts/build_db.py --json PATH --db PATH
```

Source: `merged_problems.json` (~19MB, 2913 problems) → `problems.db` (~6.5MB). Uses `INSERT ... ON CONFLICT DO UPDATE` for upsert. Normalizes topics. Rebuilds FTS after import.

## Go Backend

### Dependencies

- `modernc.org/sqlite` — pure Go SQLite (no CGo, simplifies Docker)
- `github.com/joho/godotenv` — .env loading
- Go stdlib `net/http` with Go 1.22+ route patterns

### Config (`.env`)

```
PORT=8080
AUTH_PASSWORD=changeme        # Required for server
DB_PATH=./problems.db
STATIC_DIR=./frontend/dist
LLM_BASE_URL=http://svc-litellm:4000/v1
LLM_API_KEY=                  # Empty for local litellm
LLM_MODEL=claude-sonnet-4-5
```

### CLI

Single binary with subcommands:

```bash
quiz server                                      # Start web server
quiz grade --problem two-sum --answer answer.txt  # CLI grading
quiz grade --problem-id 42                        # By DB id, reads stdin
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/problems` | List/search (`q`, `difficulty`, `topic`, `limit`, `offset`) |
| `GET` | `/api/problems/{id}` | Full problem detail |
| `GET` | `/api/topics` | All topic names |
| `POST` | `/api/grade` | `{problem_id, answer}` → LLM grading |
| `GET` | `/*` | SPA static files (index.html fallback) |

All routes behind HTTP basic auth. Username ignored, password checked with `crypto/subtle.ConstantTimeCompare`.

### Static File Serving

Go serves built frontend from `STATIC_DIR`. Files on disk served directly; everything else falls back to `index.html` for SPA routing.

## LLM Grading

### Function calling approach

Uses OpenAI-compatible chat completions with `tool_choice` forced to `submit_grading`.

### Grading criteria (all bool + comment)

- **`pattern_identified`** — Correct algorithmic pattern (hash map, two-pointer, BFS, DP, etc.)
- **`solution_works`** — Approach produces correct results for all inputs
- **`complexity_analysis`** — Both time AND space complexity correctly stated
- **`optimal_solution`** — Best known time complexity achieved
- **`overall_feedback`** — 2-3 sentence constructive summary

### Prompt construction

System prompt: expert grader role with strict criteria definitions.
User prompt: problem title/ID/difficulty + full description + examples + constraints + python3 signature + candidate answer.

## Frontend

### Stack

React 18, TypeScript, TanStack Router (code-based routes), Tailwind CSS v4, Vite

### Vite dev config

Proxies `/api` → `http://localhost:8080` with basic auth header injected. The `Authorization` header is hardcoded as base64 for dev only.

### Routes

- `/` — Search bar, difficulty filter buttons (color-coded), paginated problem list with left-border accent by difficulty
- `/problem/$id` — Problem detail (description, examples, constraints, hints, python3 snippet) + answer textarea + submit button
- `/problem/$id/result` — Score (0-4) with pass/fail per criterion, comments, overall feedback. Stored in `sessionStorage`.

## Styling

Tokyo Night theme via CSS custom properties in `index.css`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg-main` | `#1a1b26` | Page background |
| `--color-bg-surface` | `#1f2335` | Card backgrounds |
| `--color-bg-elevated` | `#24283b` | Hover states |
| `--color-bg-highlight` | `#283457` | Active highlights |
| `--color-fg-main` | `#c0caf5` | Body text |
| `--color-fg-bright` | `#e0e4f5` | Headings, emphasis |
| `--color-fg-muted` | `#565f89` | Secondary text |
| `--color-tn-red` | `#f7768e` | Hard difficulty, errors |
| `--color-tn-green` | `#9ece6a` | Easy difficulty, pass |
| `--color-tn-yellow` | `#e0af68` | Medium difficulty |
| `--color-tn-blue` | `#7aa2f7` | Primary actions, links |
| `--color-tn-purple` | `#bb9af7` | Accents, gradients |
| `--color-border` | `#2f3552` | Card/section borders |

Tailwind uses these as `bg-bg-main`, `text-tn-blue`, etc.

## Build & Deploy

### Local development

```bash
make dev-backend    # go run . server
make dev-frontend   # cd frontend && pnpm dev (proxies /api to :8080)
make build-db       # python3 scripts/build_db.py
make grade ARGS="--problem two-sum --answer testdata/good-answer.txt"
```

### Docker

```bash
docker compose build   # Multi-stage: node 25 + python 3.13 + go 1.25 + debian bookworm-slim
docker compose up      # Runs on :8080
```

All base images pinned to SHA256 multi-arch manifest digests. Python stage downloads `merged_problems.json` from GitHub (avoids needing gitignored file in build context).

### Fly.io

```bash
fly deploy
fly secrets set AUTH_PASSWORD=... LLM_API_KEY=... LLM_BASE_URL=...
```

Config: `leettomato-quiz`, region `sjc`, shared-cpu-1x/256MB, scale-to-zero (`auto_stop_machines = 'stop'`, `min_machines_running = 0`).

## Testing

### CLI grading

```bash
go run . grade --problem two-sum --answer testdata/good-answer.txt
go run . grade --problem two-sum --answer testdata/bad-answer.txt
go run . grade --problem two-sum --answer testdata/partial-answer.txt
```

### Web UI (Playwright MCP)

Start both dev servers, then:

1. Navigate to `http://localhost:5173/`
2. Verify problem list loads (2913 problems)
3. Search "two sum" → verify filtered results
4. Click difficulty filters → verify correct filtering
5. Click a problem → verify detail page (description, examples, constraints, hints, signature)
6. Type answer in textarea, submit → verify grading results (4 criteria + feedback)
7. Test production server at `http://localhost:8080/` (basic auth gate)
8. Screenshot key states for visual verification

### Build verification

```bash
cd frontend && pnpm run build    # TypeScript + Vite must succeed
cd .. && go build -o /dev/null . # Go must compile
docker compose build             # Full Docker build must succeed
```
