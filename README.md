# AI.Agent
Agentic Solution Developer Kit (SDK) using [Next.js](https://nextjs.org/), [Vercel AI SDK](https://ai-sdk.dev/docs/introduction), [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) and the [Agent–User Interaction (AG-UI) Protocol](https://docs.ag-ui.com/introduction).

## Quickstart

Configure the sample agents with ASP.NET Core Secret Manager. Set the required API key for each agent you want to run:

```bash
dotnet user-secrets set "OpenAI:ApiKey" "<your OpenAI API key>" --project samples/dotnet/GenericAgent
```

Run the agent servers in separate terminal processes:

```bash
dotnet run --project samples/dotnet/GenericAgent
dotnet run --project samples/dotnet/WeatherAgent
```

Run the web application in another terminal process:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in the browser.

In `agents.json`, set `icon` to `default` to use the built-in VS Code-style agent glyph for a generic agent. Any other `icon` value is rendered from Material Symbols, for example `partly_cloudy_day`.

## Build

Create a production build:

```bash
npm run build
```
