---
name: vercel-nextjs
description: Use for Next.js App Router, React Server Components, Server Actions, route handlers, layouts, routing, streaming, caching, rendering strategy, middleware, deployment behavior, and Next.js 16 architecture in AI.Agent.
---

# Vercel Next.js

Use official Next.js docs for current framework behavior. The App Router is file-system based and uses React Server Components, Suspense, and Server Functions.

## AI.Agent defaults

- Prefer App Router conventions under `src/app`.
- Keep components server-side unless they need browser state, event handlers, browser APIs, or client-only libraries.
- Add `"use client"` only at the smallest useful component boundary.
- Route handlers belong under `src/app/api/**/route.ts`.
- Use `npm run build` after route, rendering, metadata, middleware, config, or dependency changes.

## Rendering and data flow

- Make server/client boundaries deliberate and easy to see.
- Keep streaming responses in route handlers or server-side orchestration code.
- Avoid moving model/provider code into client components.
- Be careful with caching semantics; verify current docs before introducing `fetch` cache options, revalidation, dynamic rendering flags, or route segment config.

## UI implementation

- Compose existing `src/components/ui` and `src/components/ai-elements` first.
- Keep page-level layout in `src/app/page.tsx` until there is enough complexity to split by route or feature.
- Avoid marketing-page patterns for this product; it is an agentic workspace and should optimize for repeated work.

## Docs

- Next.js App Router: https://nextjs.org/docs/app
- Next.js docs llms index, when available: https://nextjs.org/docs/llms.txt
