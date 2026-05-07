# AI.Agent Repository Instructions

This repository is named AI.Agent. It is a Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, AI Elements, and Vercel AI SDK application.

Codex should use the repo-wide skills in `.agents/skills` for both coding and architecture work. The project is intentionally fully packed with architecture and implementation guidance while the system is still evolving.

Always consider these skills when they match the task:

- `project-baseline`: repository conventions, commands, verification, and feature work expectations.
- `ai-web-architecture`: cross-cutting architecture decisions and implementation direction.
- `vercel-nextjs`: Next.js App Router, Server Components, routing, actions, caching, and rendering strategy.
- `vercel-ai-sdk`: Vercel AI SDK streaming, tool calling, providers, model setup, and AI SDK DevTools.
- `vercel-ai-elements`: AI Elements, shadcn/ui composition, chat rendering, message parts, and AI-native UI components.
- `aspnet-core-project`: ASP.NET Core backend guidance when .NET services are introduced or integrated.
- `dependency-injection`: dependency injection design, service lifetimes, registration, options, and test seams.
- `ag-ui-protocol`: AG-UI protocol design, event streams, state synchronization, human-in-the-loop flows, and frontend/backend agent interaction.
- `openai-api-project`: OpenAI API, model, Responses, streaming, and provider integration guidance.

Prefer official docs and configured MCP servers for fast-moving frameworks. The repo-scoped `.codex/config.toml` configures Microsoft Learn and OpenAI Docs MCP; Context7 is included for live package documentation.

Before implementing a feature, read the issue or task directions and keep edits tightly scoped. Run `npm run lint` for normal UI/code changes and `npm run build` when touching routing, server code, configuration, or package dependencies.
