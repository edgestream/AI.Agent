---
name: ai-web-architecture
description: Use for AI.Agent architecture decisions, feature direction, ADR-style reasoning, cross-cutting design, frontend/backend boundaries, streaming architecture, persistence boundaries, public API contracts, agent interaction flows, and implementation guidance before or during coding.
---

# AI.Agent Architecture

Use this skill whenever a task affects more than one layer, changes public behavior, introduces a durable pattern, or needs implementation direction for future feature issues.

## Architecture posture

- Prefer a small number of clear contracts over many clever abstractions.
- Keep the first implementation simple enough to inspect in one sitting.
- Favor explicit server/client boundaries in Next.js App Router.
- Treat streaming protocol changes, AG-UI event flow, model provider behavior, and dependency lifetimes as architecture decisions.
- Prefer same-origin browser interactions. Browser code should reach agent backends through Next.js route handlers, not direct cross-origin AG-UI calls.
- Keep durable agent routing and frontend agent metadata in explicit configuration, currently root `agents.json`, rather than hidden environment-variable maps.
- Use official docs and MCP before relying on memory for fast-moving APIs.

## Decision output

When asked for architecture guidance, produce:

- Decision summary
- Constraints and assumptions
- Recommended approach
- Rejected alternatives
- Implementation notes for coding agents
- Acceptance criteria
- Verification plan

## Coding handoff

When architecture work leads to implementation:

- Name the files or modules likely to change.
- Call out exact skills that should be used during coding.
- Identify any environment variables, migrations, or deployment effects.
- Identify any `agents.json` schema or routing effects when work changes agent availability or endpoints.
- Define user-visible acceptance criteria, not only implementation details.

## Project sources of truth

- Next.js and React UI behavior belongs in `src/app` and `src/components`.
- Generic AI SDK chat behavior currently enters through `src/app/api/chat/route.ts`.
- Frontend agent metadata enters through `src/app/api/agents/route.ts`.
- AG-UI browser traffic enters through `src/app/api/agents/[agent]/agui/route.ts`, which resolves configured endpoints with `src/lib/agent-registry.ts`.
- Root `agents.json` is the current frontend-server source of truth for agent id, protocol, endpoint, and display metadata.
- AG-UI stream-to-chat adaptation belongs in `src/lib/agui-chat-transport.ts`; changes to that contract should keep transport tests current.
- AI-native UI should compose existing AI Elements components before adding custom renderers.
- `AI.Agent.Client` is the project-owned .NET provider/client registration boundary; samples should not construct provider clients inline.
- ASP.NET Core and DI guidance applies when adding or integrating .NET backend services and shared .NET client registration.
- AG-UI guidance applies when formalizing frontend/backend agent event streams.
