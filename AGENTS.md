# AI.Agent Repository Instructions

This repository is named AI.Agent. It is a Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, AI Elements, Vercel AI SDK, AG-UI, and .NET 10 sample/application workspace.

Codex should use the repo-wide skills in `.agents/skills` for both coding and architecture work. The project is intentionally fully packed with architecture and implementation guidance while the system is still evolving.

Always consider these skills when they match the task:

- `project-baseline`: repository conventions, commands, verification, and feature work expectations.
- `skill-governance`: boundaries for editing `AGENTS.md`, repo skills, and coding-agent instructions.
- `github-issue`: GitHub issue creation workflow for assignees, labels, issue type, project #6 metadata, and dependency relationships.
- `ai-web-architecture`: cross-cutting architecture decisions and implementation direction.
- `vercel-nextjs`: Next.js App Router, Server Components, routing, actions, caching, and rendering strategy.
- `vercel-ai-sdk`: Vercel AI SDK streaming, tool calling, providers, model setup, and AI SDK DevTools.
- `vercel-ai-elements`: AI Elements, shadcn/ui composition, chat rendering, message parts, and AI-native UI components.
- `aspnet-core-project`: ASP.NET Core backend guidance when .NET services are introduced or integrated.
- `dependency-injection`: dependency injection design, service lifetimes, registration, options, and test seams.
- `ag-ui-protocol`: AG-UI protocol design, event streams, state synchronization, human-in-the-loop flows, and frontend/backend agent interaction.
- `openai-api-project`: OpenAI API, model, Responses, streaming, and provider integration guidance.

Prefer official docs and configured MCP servers for fast-moving frameworks. The repo-scoped `.codex/config.toml` configures Microsoft Learn and OpenAI Docs MCP; Context7 is included for live package documentation.

Current architecture notes:

- Browser code must not call AG-UI agent servers directly. The browser calls same-origin Next.js route handlers under `/api/agents/{agent}/agui`.
- Agent endpoints are configured in root [`agents.json`](./agents.json). The current schema maps an agent id to AG-UI protocol, endpoint, and UI metadata.
- `src/lib/agent-registry.ts` is the server-side registry reader for `agents.json`. It lives in `src/lib`, not `src/lib/server`.
- `src/app/api/agents/route.ts` exposes configured agent metadata to the frontend without exposing backend-only implementation details.
- `src/app/api/agents/[agent]/agui/route.ts` proxies AG-UI requests and streams the backend response. Do not add frontend capability discovery unless the architecture is explicitly changed.
- .NET projects are included in the root [`AI.Agent.slnx`](./AI.Agent.slnx), so `dotnet build` should work from the repository root.
- `dotnet/src/AI.Agent.Client` contains shared .NET client/provider registration helpers. Samples should consume this library instead of constructing OpenAI clients inline.
- `samples/dotnet/GenericAgent`, `samples/dotnet/NewsAgent`, and `samples/dotnet/WeatherAgent` are the current .NET AG-UI samples. The old `AGUINewsAgent` sample and `samples/dotnet/Samples.slnx` have been replaced.

Before implementing a feature, read the issue or task directions and keep edits tightly scoped. Run `npm run lint` for normal UI/code changes, `npm run test:transport` when touching AG-UI chat transport behavior, and `npm run build` when touching routing, server code, configuration, or package dependencies. Run `dotnet build` when touching any .NET library, sample, solution, configuration, or launch profile.
