# AI.Agent.Web
Agentic web application using [Next.js](https://nextjs.org/), [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) and the [Agent–User Interaction (AG-UI) Protocol](https://docs.ag-ui.com/introduction).

## Quickstart

Run the web application:

```bash
npm run dev
```

Configure an agent server sample by setting the mandatory `OpenAI:ApiKey` in [`appsettings.json`](./samples/dotnet/AGUINewsAgent/appsettings.json):

```appsettings.json
{
  "OpenAI": {
    "ApiKey": "<Your OpenAI API Key>"
  }
}
```

Run this agent server in another terminal process:

```bash
dotnet run --project samples/dotnet/AGUINewsAgent
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

## Build

Create a production build:

```bash
npm run build
```
