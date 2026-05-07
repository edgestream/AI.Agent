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
- Define user-visible acceptance criteria, not only implementation details.

## Project sources of truth

- Next.js and React UI behavior belongs in `src/app` and `src/components`.
- AI streaming behavior currently enters through `src/app/api/chat/route.ts`.
- AI-native UI should compose existing AI Elements components before adding custom renderers.
- ASP.NET Core and DI guidance applies when adding or integrating .NET backend services.
- AG-UI guidance applies when formalizing frontend/backend agent event streams.
