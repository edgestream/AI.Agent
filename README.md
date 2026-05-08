# AI.Agent
Agentic Solution Developer Kit (SDK) using [Next.js](https://nextjs.org/), [Vercel AI SDK](https://ai-sdk.dev/docs/introduction), [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) and the [Agent–User Interaction (AG-UI) Protocol](https://docs.ag-ui.com/introduction).

## Quickstart

Run the web application:

```bash
npm run dev
```

Configure an agent server sample by setting the mandatory `OpenAI:ApiKey` in [`appsettings.json`](./samples/dotnet/NewsAgent/appsettings.json):

```appsettings.json
{
  "OpenAI": {
    "ApiKey": "<Your OpenAI API Key>"
  }
}
```

Run this agent server in another terminal process:

```bash
dotnet run --project samples/dotnet/NewsAgent
```

The browser does not call agent servers directly. It calls the Next.js server at
`/api/agents/{agent}/agui`; Next.js resolves the agent's configured in-cluster
AG-UI endpoint from [`agents.json`](./agents.json) and proxies the stream.

```json
{
  "news": {
    "protocol": "AGUI",
    "endpoint": "http://localhost:8000"
  }
}
```

Use `NEXT_PUBLIC_AGENT_ID` to choose the default browser-facing agent id. It
defaults to `news`.

Open [http://localhost:3000](http://localhost:3000) in the browser.

## Build

Create a production build:

```bash
npm run build
```
