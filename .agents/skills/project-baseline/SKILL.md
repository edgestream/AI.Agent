---
name: project-baseline
description: Use for all AI.Agent repository work, including coding, reviews, feature implementation, architecture discussions, setup, verification, and issue execution. Provides repo structure, commands, conventions, and default engineering expectations.
---

# Project Baseline

AI.Agent is a Next.js 16 App Router application using React 19, TypeScript, Tailwind CSS, shadcn/ui, AI Elements, and Vercel AI SDK v6.

## Current shape

- `src/app/page.tsx` is the main chat/workspace surface.
- `src/app/api/chat/route.ts` streams model responses through Vercel AI SDK.
- `src/components/ai-elements/*` contains AI Elements components copied into the repo for customization.
- `src/components/ui/*` contains shadcn/ui primitives.
- `components.json` configures shadcn/ui component generation.
- `package.json` has the canonical scripts.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Start Turbopack dev server: `npm run dev:turbopack`
- Lint: `npm run lint`
- Production build: `npm run build`
- AI SDK DevTools: `npx @ai-sdk/devtools`

## Default workflow

1. Inspect local files before changing code.
2. Prefer existing components and local patterns over new abstractions.
3. Keep feature changes focused on the requested behavior.
4. Use AI Elements for AI message, reasoning, source, prompt, and conversation UI rather than building duplicate chat primitives.
5. Use official docs or MCP for fast-moving framework behavior.
6. Verify with `npm run lint`; run `npm run build` when server routes, rendering, config, dependencies, or framework behavior are touched.

## Coding expectations

- Keep TypeScript types explicit at API boundaries and inferred inside small local scopes.
- Preserve App Router conventions and colocate route-specific logic under `src/app` when appropriate.
- Keep reusable UI in `src/components`; keep utility helpers in `src/lib`.
- Do not introduce new global state or cross-cutting abstractions without a clear need.
- Avoid broad refactors while implementing a feature issue.
- Treat environment variable changes as architecture-affecting and document them in README or issue notes.

## Source references

- Codex skills discovery: https://developers.openai.com/codex/skills
- Codex MCP config: https://developers.openai.com/codex/mcp
