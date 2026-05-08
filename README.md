# AI.Agent
Agentic Solution Developer Kit (SDK) using [Next.js](https://nextjs.org/), [Vercel AI SDK](https://ai-sdk.dev/docs/introduction), [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) and the [Agent–User Interaction (AG-UI) Protocol](https://docs.ag-ui.com/introduction).

## Quickstart

Run the web application:

```bash
npm run dev
```

Configure the `NewsAgent` sample with ASP.NET Core Secret Manager. Set the required API key:

```bash
dotnet user-secrets set "OpenAI:ApiKey" "<your OpenAI API key>" --project samples/dotnet/NewsAgent
```

Run this agent server in another terminal process:

```bash
dotnet run --project samples/dotnet/NewsAgent
```

Configure the web application's [`agents.json`](./agents.json) to proxy the streams:

```json
{
  "news": {
    "protocol": "AGUI",
    "endpoint": "http://localhost:8000"
  }
}
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

## Build

Create a production build:

```bash
npm run build
```
