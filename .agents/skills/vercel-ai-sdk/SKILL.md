---
name: vercel-ai-sdk
description: Use for Vercel AI SDK v6 work in AI.Agent, including streamText, useChat, UIMessage streams, tool calling, model providers, OpenAI provider configuration, AI SDK DevTools, stream protocols, message persistence, and chatbot API routes.
---

# Vercel AI SDK

AI.Agent uses Vercel AI SDK v6 with `ai`, `@ai-sdk/react`, `@ai-sdk/openai`, and `@ai-sdk/devtools`.

## Current integration

- API route: `src/app/api/chat/route.ts`
- Client hook: `useChat` from `@ai-sdk/react`
- Transport: `DefaultChatTransport`
- Server streaming: `streamText`
- Message conversion: `convertToModelMessages`
- Response shape: `toUIMessageStreamResponse()`
- DevTools middleware: `devToolsMiddleware()`

## Defaults

- Keep provider and model setup server-side.
- Validate request payloads before calling model APIs.
- Preserve UIMessage stream compatibility unless intentionally changing the client renderer.
- Use `providerOptions.openai.instructions` or a better-defined system instruction strategy for model behavior.
- Keep `store: false` unless persistence is intentionally designed.
- Use AI SDK DevTools during local streaming/debugging work: `npx @ai-sdk/devtools`.

## When adding tools or structured output

- Define tool input schemas with `zod`.
- Keep tool side effects explicit and verifiable.
- Render tool states through AI Elements-compatible message parts where possible.
- Update acceptance criteria to include streaming states, failure states, and final result shape.

## Docs

- AI SDK docs: https://ai-sdk.dev/docs
- AI SDK llms index: https://ai-sdk.dev/llms.txt
- Vercel AI SDK GitHub: https://github.com/vercel/ai
