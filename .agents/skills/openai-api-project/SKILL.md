---
name: openai-api-project
description: Use for OpenAI API work in AI.Agent, including model selection, Responses API behavior, OpenAI provider configuration through Vercel AI SDK, streaming, tool calls, structured outputs, prompts, safety, environment variables, and migration to current OpenAI models.
---

# OpenAI API Project

Use this skill whenever a task touches model selection, prompts, OpenAI provider setup, API routes that call models, streaming behavior, tool calls, structured outputs, or model migration.

## Research rule

Use the configured OpenAI Docs MCP server for current OpenAI API docs and model guidance before changing model-specific behavior.

## AI.Agent defaults

- Keep OpenAI API access server-side.
- Use environment variables for provider base URL and model names.
- Keep `OPENAI_API_BASE` optional unless a deployment requires a custom gateway.
- Prefer explicit model configuration in route/server code over hidden client behavior.
- Keep prompts and system instructions reviewable; avoid burying critical behavior in UI copy.
- Preserve streaming behavior unless the issue explicitly changes the interaction model.
- Treat model upgrades as behavior changes that need verification.

## Current integration notes

- `src/app/api/chat/route.ts` uses `createOpenAI`, `openai.responses`, `wrapLanguageModel`, `devToolsMiddleware`, and `streamText`.
- The default model currently falls back to `gpt-5.4`.
- The route currently passes `store: false`.

## Docs

- OpenAI developer docs: https://developers.openai.com
- OpenAI Docs MCP: https://developers.openai.com/mcp
- Vercel AI SDK OpenAI provider docs: https://ai-sdk.dev/providers/ai-sdk-providers/openai
