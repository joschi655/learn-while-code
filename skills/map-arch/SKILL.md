---
description: "Scan the current repository and produce a compact architecture summary. Kolb's Conceptualization phase — build a mental model of the whole system. Use when: 'map architecture', 'show me the architecture', 'repo overview', 'what does this project do', 'how is this structured'."
---

# Map Architecture — Conceptualization Phase

Scans the repo and produces a structured architecture brief. This is Kolb's **Conceptualization** phase — moving from individual code encounters to a whole-system mental model.

## Learning Principle

> "Abstract conceptualization transforms scattered observations into a coherent model." — Kolb
>
> You've seen individual patterns (Express routes, Zustand stores, CF manifests). Now step back and see how they connect into a system. Understanding architecture means knowing which components exist, how data flows between them, and what each layer depends on.

## Instructions

1. Detect the project root (nearest `.git/` or `package.json`/`pyproject.toml`/`Cargo.toml`)
2. Scan for architecture signals:
   - **Entrypoints:** `main.ts`, `index.ts`, `app.py`, `main.go`, `Dockerfile CMD/ENTRYPOINT`
   - **Frameworks:** Express, React, Vue, Flask, FastAPI, Next.js, Vite (check deps in package.json, requirements.txt)
   - **API Layer:** Route files, OpenAPI specs, GraphQL schemas
   - **Database/Storage:** Prisma schema, SQL migrations, S3 configs, Redis configs
   - **Auth:** XSUAA, JWT, OAuth configs, auth middleware
   - **Background Jobs:** Worker files, queue configs, cron definitions
   - **Deployment:** Dockerfile, manifest.yml, docker-compose.yml, CI configs, Terraform
   - **External Services:** API clients, MCP servers, webhook endpoints
3. Check `package.json` scripts (or equivalent) for how to run/build/test
4. Output a structured summary
5. Record any detected patterns against the concept tracker — this is a learning opportunity

## Output Format

```
# [Project Name] Architecture

## Stack
- **Runtime:** Node.js 20 / Python 3.12 / ...
- **Framework:** Express 5 / React 19 / ...
- **Build:** Vite / webpack / ...
- **Language:** TypeScript / Python / ...

## Entrypoints
- `src/server/index.ts` — Express API server (port 3001)
- `src/dashboard/main.tsx` — React SPA entry

## API Layer
- GET /api/issues — Fetch JIRA issues
- POST /api/validate — Run validation agent

## Data Layer
- JSON file cache (.cache/)
- S3 Object Store

## Auth
- XSUAA OAuth2 + JWT validation

## Deployment
- Cloud Foundry (manifest.yml), nodejs_buildpack, 1GB RAM

## External Dependencies
- JIRA REST API (via MCP connector)
- Anthropic Claude API (via proxy)

## How to Run
- `bun dev` / `npm run dev:all`

## Concepts Detected
- express-middleware [encountered]
- cloud-foundry-deployment [unseen → encountered]
```

## Gotchas
- Focus on architecture-relevant files, not every file in the repo.
- If the repo is a monorepo with multiple apps, describe each separately.
- This is a great first command to run in a new repo — it bootstraps your mental model.
