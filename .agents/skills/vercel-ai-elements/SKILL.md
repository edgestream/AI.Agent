---
name: vercel-ai-elements
description: Use for AI Elements in AI.Agent, including chat UI, message rendering, MessageResponse, Conversation, PromptInput, reasoning, sources, attachments, tool-call UI, shadcn/ui composition, and AI-native interface work.
---

# Vercel AI Elements

AI Elements are pre-built, customizable React components for AI applications. This repo already vendors AI Elements into `src/components/ai-elements`.

## AI.Agent defaults

- Render AI text with `MessageResponse`; do not render raw markdown text directly.
- Use `Message`, `MessageContent`, and `Conversation` patterns for chat surfaces.
- Use `PromptInput` components for prompt composition rather than building a separate text area stack.
- Add new AI-specific UI under `src/components/ai-elements` when it extends the AI Elements vocabulary.
- Add general primitives under `src/components/ui` only when they are reusable outside AI surfaces.

## Installation and updates

- Prefer local edits to vendored components when customizing behavior for this repo.
- For new upstream components, use the AI Elements CLI or shadcn registry flow and review the diff carefully.
- Keep `components.json` and import aliases consistent with the existing shadcn setup.

## UX expectations

- Show streaming, loading, empty, error, and stopped states clearly.
- Keep controls compact and work-focused.
- Use icons for familiar actions when the existing component set supports them.
- Avoid duplicating message rendering logic in page files once it becomes complex.

## Docs

- AI Elements GitHub: https://github.com/vercel/ai-elements
- AI Elements registry: https://elements.ai-sdk.dev
