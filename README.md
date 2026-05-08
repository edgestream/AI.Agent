# AI.Agent
Agentic Solution Developer Kit (SDK) using [Next.js](https://nextjs.org/), [Vercel AI SDK](https://ai-sdk.dev/docs/introduction), [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) and the [Agent–User Interaction (AG-UI) Protocol](https://docs.ag-ui.com/introduction).

## Quickstart

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

Configure the web application's agents in [`agents.json`](./agents.json):

```json
{
  "news": {
    "protocol": "AGUI",
    "endpoint": "http://localhost:8000"
  }
}
```

Run the web application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

## Build

Create a production build:

```bash
npm run build
```
