# Tareeq Academy Frontend

Arabic-first frontend foundation for Tareeq Academy, an educational consulting platform for students interested in studying abroad. This repository currently implements the approved project setup, design tokens, shared public layout, and a minimal homepage only.

## Technology

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- shadcn/ui-compatible configuration and reusable Button primitive
- Axios for HTTP transport and TanStack Query for client-side server state

## Getting started

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local` and set the API base URL when it is available.
3. Install dependencies and start development:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev        # Start the local development server
npm run typecheck  # Run TypeScript validation
npm run lint       # Run ESLint
npm run build      # Create a production build
npm run start      # Serve a production build
```

## Environment configuration

`NEXT_PUBLIC_API_BASE_URL` is the public browser origin of the separately deployed Backend REST API, for example `https://api.example.com`. `API_BASE_URL` is the server-side origin. Do **not** add `/api/v1` to either value: the Axios clients append that namespace.

Browser requests fail clearly when `NEXT_PUBLIC_API_BASE_URL` is missing. Server requests prefer `API_BASE_URL` and temporarily fall back to `NEXT_PUBLIC_API_BASE_URL` until a private backend origin is available. No deployed backend URL is configured yet.

The frontend uses Backend-managed HttpOnly cookie sessions. Browser Axios requests opt into credentials; cross-origin cookie transmission still depends on backend CORS, cookie attributes, deployment domains, and browser cookie policies. The frontend neither stores nor reads tokens, and does not implement authentication flows or a BFF.

## Data access architecture

The browser flow is: component → approved query/mutation hook → API resource function → browser Axios client → Hono REST backend. Server-rendered operations use the separate server-only Axios client directly; they do not use a Next.js proxy.

`QueryProvider` configures one stable TanStack Query client for the application. Generic centralized keys in `api/query-keys.ts` support future resource list, detail, filter, and targeted-invalidation patterns without defining unapproved business resources.

## Structure

- `app/` — App Router layout, global styles, and the minimal public homepage
- `components/layout/` — shared responsive container, header, and footer
- `components/ui/` — reusable shadcn/ui-compatible primitives
- `api/` — browser/server Axios transports, normalized errors, and centralized query keys
- `hook/queries/` — future approved `useQuery` hooks
- `hook/mutations/` — future approved `useMutation` hooks
- `providers/` — client-side infrastructure providers
- `lib/` — small shared utilities

## Brand note

The current navy, muted gold, and warm off-white values are explicitly provisional centralized tokens in `app/globals.css`. Replace them after receiving the official brand palette and logo.
