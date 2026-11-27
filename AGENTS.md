# Tareeq Academy execution rules

- The Project Lead owns scope, business requirements, architecture, and API contracts.
- Implement only approved Linear tasks. Do not start another task without explicit Project Lead approval.
- Do not introduce unapproved features or architectural changes.
- Preserve unrelated changes and developer comments.
- Backend business logic and authentication belong to the separate backend application.
- Do not invent API contracts, endpoints, or response schemas.
- Verify the implementation before reporting completion and report any unverified checks or failures clearly.
- For approved Public Website Live migrations, follow `docs/public-data-state-policy.md`: preserve approved designs and shared states, prioritize real data, visibly label same-record temporary content, and reuse the existing Backend gap report. Do not migrate other pages without explicit approval.

## Backend API Contract Rules

- The `tareeq-api` Backend is the single source of truth for API contracts.
- Production API documentation is available at `https://api.tareeq-academy.com/docs`.
- Before implementing or modifying any API integration, retrieve and inspect the latest relevant deployed contract from `https://api.tareeq-academy.com/openapi.json`. This is the primary source for deployed Backend API contracts.
- Detect relevant contract changes before modifying Frontend integrations, and distinguish unpublished local Backend changes from deployed Production changes.
- If the local `tareeq-api` repository is accessible, inspect its source code, generated Postman collection, and `docs/admin-frontend-handoff.md` when relevant.
- Never invent endpoints, fields, permissions, or response schemas, and do not rely on previously uploaded or outdated Postman collections.
- Do not require manually uploaded Postman collections when the live OpenAPI specification provides the necessary contract. Request additional Backend source or documentation only when the live specification is incomplete, inconsistent, or does not include an unreleased feature.
- If the live documentation is inaccessible or inconsistent, report the exact blocker instead of assuming a contract.
- Do not automatically modify existing integrations without a relevant approved task.
- Preserve existing functionality and unrelated working-tree changes.

## API Integration Performance Requirements

- Contract verification is a development-time operation only. Never fetch OpenAPI or Postman collections at application runtime.
- Minimize API requests, duplicate fetching, unnecessary refetching, and re-renders.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
