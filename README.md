# AI.Agent
Agentic Solution Developer Kit (SDK) using [Next.js](https://nextjs.org/), [Vercel AI SDK](https://ai-sdk.dev/docs/introduction), [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) and the [Agent–User Interaction (AG-UI) Protocol](https://docs.ag-ui.com/introduction).

## Quickstart

Configure the sample agents with ASP.NET Core Secret Manager. Set the required API key for each agent you want to run:

```bash
dotnet user-secrets set "OpenAI:ApiKey" "<your OpenAI API key>" --project samples/dotnet/NewsAgent
dotnet user-secrets set "OpenAI:ApiKey" "<your OpenAI API key>" --project samples/dotnet/WeatherAgent
```

Run the agent servers in separate terminal processes:

```bash
dotnet run --project samples/dotnet/NewsAgent
dotnet run --project samples/dotnet/WeatherAgent
```

Configure the web application's [`agents.json`](./agents.json) to proxy the streams and provide chooser metadata:

```json
{
  "news": {
    "protocol": "AGUI",
    "endpoint": "http://localhost:8000",
    "label": "News",
    "description": "Fictional satirical headlines",
    "icon": "news",
    "default": true
  },
  "weather": {
    "protocol": "AGUI",
    "endpoint": "http://localhost:8001",
    "label": "Weather",
    "description": "Forecasts and weather Q&A",
    "icon": "cloud-sun"
  }
}
```

Add another agent by adding an entry to `agents.json` with a unique id, `protocol: "AGUI"`, its same-machine or in-cluster `endpoint`, and optional `label`, `description`, `icon`, and `default` metadata. The browser only receives the chooser metadata; it continues to send prompts through same-origin `/api/agents/{agent}/agui` routes.

Run the web application in another terminal process:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

## Build

Create a production build:

```bash
npm run build
```
