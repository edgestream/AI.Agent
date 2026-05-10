# NewsAgent

Sample AG-UI agent server for fictional satirical news output.

The agent registers the shared `AI.Agent.Tool` web fetch tool as a
Microsoft.Extensions.AI tool named `fetch_web_page`. Prompts that include a URL
or ask for information from a web page should cause the model to fetch bounded
text-only page content before writing a fictional satirical response. The .NET
AG-UI host emits the normal tool-call start, argument, result, and end lifecycle
events, and the Next.js transport renders those events as visible tool parts in
the chat UI.

This sample does not add approval, confirmation, or human-in-the-loop behavior.
