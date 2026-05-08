---
name: vercel-nextjs
description: Use for Next.js App Router, React Server Components, Server Actions, route handlers, layouts, routing, streaming, caching, rendering strategy, middleware, deployment behavior, and Next.js architecture.
---

# Vercel Next.js

Use official Next.js docs for current framework behavior. The App Router is file-system based and uses React Server Components, Suspense, and Server Functions.

## Defaults

- Prefer App Router conventions and colocate route-specific code under the app directory.
- Keep components server-side unless they need browser state, event handlers, browser APIs, or client-only libraries.
- Add `"use client"` only at the smallest useful component boundary.
- Route handlers belong under the app directory's `api/**/route.ts` convention.
- Use `npm run build` after route, rendering, metadata, middleware, config, or dependency changes.

## Rendering and data flow

- Make server/client boundaries deliberate and easy to see.
- Keep streaming responses in route handlers or server-side orchestration code.
- Keep backend endpoint resolution server-side when endpoints are private, unstable, or in-cluster.
- Do not expose private backend endpoints through `NEXT_PUBLIC_*` values or call them directly from client components.
- Avoid moving model/provider code into client components.
- Be careful with caching semantics; verify current docs before introducing `fetch` cache options, revalidation, dynamic rendering flags, or route segment config.

## UI implementation

- Compose existing local UI components before adding new primitives.
- Keep page-level layout simple until there is enough complexity to split by route or feature.
- Avoid marketing-page patterns for this product; it is an agentic workspace and should optimize for repeated work.

## Docs

- Next.js App Router: https://nextjs.org/docs/app
- Next.js docs llms index, when available: https://nextjs.org/docs/llms.txt
