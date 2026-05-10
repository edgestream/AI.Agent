---
name: project-baseline
description: Use for all AI.Agent repository work, including coding, reviews, feature implementation, architecture discussions, setup, verification, and issue execution. Provides repo structure, commands, conventions, and default engineering expectations.
---

# Project Baseline

AI.Agent is a Next.js 16 App Router application using React 19, TypeScript, Tailwind CSS, shadcn/ui, AI Elements, Vercel AI SDK v6, AG-UI, and .NET 10 samples/libraries.

## Current shape

- `src/app/page.tsx` is the main chat/workspace surface.
- `src/app/api/chat/route.ts` streams model responses through Vercel AI SDK using the OpenAI Responses provider, AI SDK DevTools middleware, `store: false`, and default model fallback `gpt-5.4`.
- `src/app/api/agents/route.ts` returns configured agent UI metadata for the frontend.
- `src/app/api/agents/[agent]/agui/route.ts` is the same-origin AG-UI proxy used by the browser.
- `src/lib/agent-registry.ts` reads root `agents.json` and resolves configured AG-UI agent endpoints for server-side proxying.
- `src/lib/agui-chat-transport.ts` adapts AG-UI streams for the chat UI, with coverage in `src/lib/agui-chat-transport.test.ts`.
- `src/components/ai-elements/*` contains AI Elements components copied into the repo for customization.
- `src/components/ui/*` contains shadcn/ui primitives.
- `agents.json` is the frontend server configuration for available AG-UI agents, including protocol, endpoint, label, description, icon, and default selection metadata.
- `AI.Agent.slnx` is the root .NET solution. Plain `dotnet build` should build the shared .NET library and samples.
- `dotnet/src/AI.Agent.Client` contains shared .NET `IChatClient` provider registration helpers, including `OpenAISettings` and `AddAIChatClient` / `AddOpenAIChatClient` extension methods.
- `samples/dotnet/GenericAgent`, `samples/dotnet/NewsAgent`, and `samples/dotnet/WeatherAgent` are the current .NET AG-UI samples.
- `src/app/layout.tsx` sets the frontend title to `Agent`.
- `components.json` configures shadcn/ui component generation.
- `package.json` has the canonical scripts.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Test AG-UI chat transport: `npm run test:transport`
- Production build: `npm run build`
- AI SDK DevTools: `npx @ai-sdk/devtools`
- Build .NET projects from repo root: `dotnet build`
- Run GenericAgent sample: `dotnet run --project samples/dotnet/GenericAgent`
- Run NewsAgent sample: `dotnet run --project samples/dotnet/NewsAgent`
- Run WeatherAgent sample: `dotnet run --project samples/dotnet/WeatherAgent`

## Default workflow

1. Inspect local files before changing code.
2. Prefer existing components and local patterns over new abstractions.
3. Keep feature changes focused on the requested behavior.
4. Use AI Elements for AI message, reasoning, source, prompt, and conversation UI rather than building duplicate chat primitives.
5. Use official docs or MCP for fast-moving framework behavior.
6. Verify with `npm run lint`; run `npm run test:transport` when touching AG-UI chat transport behavior.
7. Run `npm run build` when server routes, rendering, config, dependencies, or framework behavior are touched.
8. Run `dotnet build` when touching `AI.Agent.slnx`, `dotnet/**`, `samples/dotnet/**`, .NET launch profiles, or shared .NET configuration.

## Coding expectations

- Keep TypeScript types explicit at API boundaries and inferred inside small local scopes.
- Preserve App Router conventions and colocate route-specific logic under `src/app` when appropriate.
- Keep reusable UI in `src/components`; keep utility helpers in `src/lib`.
- Keep the AG-UI agent registry in `src/lib/agent-registry.ts`; do not move it under `src/lib/server` unless the project standard changes.
- Browser code should call `/api/agents/{agent}/agui`, never direct in-cluster or localhost agent endpoints.
- Update `agents.json` for frontend server-side agent routing changes.
- Keep AG-UI stream-to-chat adaptation in `src/lib/agui-chat-transport.ts` and cover behavior changes with `npm run test:transport`.
- Keep .NET sample `Program.cs` files small; samples should use `AI.Agent.Client` instead of constructing provider clients inline.
- .NET appsettings-bound model classes should use the `Settings` suffix and live in a `Configuration` namespace/folder.
- Preserve consumer-facing .NET DI overloads, such as direct settings and settings factory overloads, when refactoring provider registration.
- Do not introduce new global state or cross-cutting abstractions without a clear need.
- Avoid broad refactors while implementing a feature issue.
- Treat environment variable changes as architecture-affecting and document them in README or issue notes.

## Source references

- Codex skills discovery: https://developers.openai.com/codex/skills
- Codex MCP config: https://developers.openai.com/codex/mcp
