---
name: ag-ui-protocol
description: Use for AG-UI Protocol work in AI.Agent, including agent-user event streams, frontend/backend agent interaction, state synchronization, messages, tools, interrupts, reasoning visibility, stream serialization, human-in-the-loop workflows, and Direct to LLM integration.
---

# AG-UI Protocol

AG-UI is an open, lightweight, event-based protocol for connecting user-facing applications to agentic backends. Use it when AI.Agent needs a formal frontend/backend agent interaction contract rather than ad hoc chat messages.

## Research rule

Fetch the AG-UI docs index before detailed implementation work:

- https://docs.ag-ui.com/llms.txt

Then load only the relevant docs page for the task, such as events, state, tools, interrupts, reasoning, serialization, clients, or server quickstart.

## Design defaults

- Treat AG-UI as the user-facing interaction protocol, distinct from MCP for tools/data and A2A for agent-to-agent coordination.
- Model the event stream before implementing UI.
- Define event ownership: which events come from the user, frontend runtime, agent backend, model/tool calls, and infrastructure.
- Preserve enough event history for restore, branching, debugging, and compaction decisions.
- Make interrupts and resumes explicit; do not hide human-in-the-loop states inside generic text messages.
- Keep reasoning visibility intentional and policy-aware.

## AI.Agent integration questions

- Does this feature need raw AI SDK UIMessage streaming, AG-UI events, or both?
- Which message parts map cleanly to existing AI Elements renderers?
- What state is authoritative on the frontend, backend, and model runtime?
- How are cancellation, retry, resume, and error events represented?
- How will event streams be tested without a live model?

## Docs

- AG-UI overview: https://docs.ag-ui.com/introduction
- AG-UI LLM docs index: https://docs.ag-ui.com/llms.txt
- AG-UI GitHub: https://github.com/ag-ui-protocol/ag-ui
