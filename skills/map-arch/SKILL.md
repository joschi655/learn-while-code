---
description: "Scan the current repository and produce a compact architecture summary. Shows entrypoints, frameworks, API layer, DB/storage, auth, deployment, and external services. Use when: 'map architecture', 'show me the architecture', 'repo overview', 'what does this project do'."
---

# Map Architecture

Scans the current repo and produces a structured architecture brief.

## Instructions

1. Detect the project root (find nearest `.git/` or `package.json`/`pyproject.toml`/`Cargo.toml`)
2. Scan for architecture signals:
   - **Entrypoints:** `main.ts`, `index.ts`, `app.py`, `main.go`, `Dockerfile CMD/ENTRYPOINT`
   - **Frameworks:** Express, React, Vue, Flask, FastAPI, Next.js, Vite (check package.json, requirements.txt)
   - **API Layer:** Route files, OpenAPI specs, GraphQL schemas
   - **Database/Storage:** Prisma schema, SQL migrations, S3 configs, Redis configs
   - **Auth:** XSUAA, JWT, OAuth configs, auth middleware
   - **Background Jobs:** Worker files, queue configs, cron definitions
   - **Deployment:** Dockerfile, manifest.yml, docker-compose.yml, CI configs, Terraform
   - **External Services:** API clients, MCP servers, webhook endpoints
3. Check `package.json` scripts for how to run/build/test
4. Output a structured summary

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
- ...

## Data Layer
- JSON file cache (.cache/)
- S3 Object Store (BTP)
- ...

## Auth
- XSUAA OAuth2 + JWT validation
- ...

## Deployment
- Cloud Foundry (manifest.yml)
- nodejs_buildpack, 1GB RAM
- ...

## External Dependencies
- JIRA REST API (via MCP connector)
- Anthropic Claude (via Hyperspace proxy)
- ...

## How to Run
- `bun dev` / `npm run dev:all`
- ...
```

## Gotchas
- Don't list every file. Focus on architecture-relevant files.
- If the repo has multiple apps (monorepo), describe each separately.
- Record detected patterns against the concept tracker — this is a learning opportunity.
