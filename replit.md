# New National Advertising

The company website and admin content-management tools for New National Advertising.

## Run & Operate

- `pnpm --filter @workspace/new-national-advertising run dev` — run the website
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — typecheck all workspace packages
- `pnpm run build` — build the API server and website
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and schemas from OpenAPI
- Without Firebase server credentials, the API uses a local JSON-backed Firestore-compatible store for development.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Website: React, Vite, Tailwind CSS, Wouter, TanStack Query
- API: Express 5, Firebase Admin SDK, local Firestore-compatible fallback
- Admin sign-in: Firebase Authentication
- API contracts: OpenAPI, Orval-generated React Query hooks and Zod schemas

## Where things live

- `artifacts/new-national-advertising/src/` — public website and admin interface
- `artifacts/new-national-advertising/public/` — website images and branding assets
- `artifacts/api-server/src/routes/` — catalog, CMS, projects, requests, storage, and admin APIs
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/api-client-react/` and `lib/api-zod/` — generated API clients and validation schemas
- `attached_assets/` and `screenshots/` — repository media and reference captures

## Architecture decisions

- Firebase-backed data is used when server credentials are configured; local development otherwise uses a JSON-backed Firestore-compatible adapter.
- The web artifact serves at `/`; the shared API server is routed under `/api`.

## Product

Visitors can explore advertising and print services, equipment, and past projects, and contact the company. Administrators can manage site content and catalog data after Firebase authentication is configured.

## User preferences

The requested source repository is `https://github.com/Nasty-Developer/New-National-Advertising-2`.

## Gotchas

- Keep the generated API hooks and schemas synchronized with `lib/api-spec/openapi.yaml` by running codegen after contract changes.
- Firebase admin and storage features require Firebase server credentials; do not make them prerequisites for the public website preview.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
