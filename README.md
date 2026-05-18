# AI.Agent
Agentic Solution Developer Kit (SDK) using [Next.js](https://nextjs.org/), [Vercel AI SDK](https://ai-sdk.dev/docs/introduction), [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) and the [Agent–User Interaction (AG-UI) Protocol](https://docs.ag-ui.com/introduction).

## Quickstart

Configure the sample agents with ASP.NET Core Secret Manager:

```bash
dotnet user-secrets set "OpenAI:ApiKey" "<your OpenAI API key>" --project samples/dotnet/GenericAgent
```

Run the agent servers in separate terminal processes:

```bash
dotnet run --project samples/dotnet/GenericAgent
dotnet run --project samples/dotnet/NewsAgent
dotnet run --project samples/dotnet/WeatherAgent
```

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

## Frontend container image

Build the Next.js frontend image for the local platform:

```bash
docker build -t ai-agent-frontend:local .
```

Run the production server from the image:

```bash
docker run --rm -p 3000:3000 ai-agent-frontend:local
```

Build and publish a multi-arch image for downstream Kubernetes deployment:

```bash
TAG=dev
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag "ghcr.io/edgestream/agent/agent-web:${TAG}" \
  --push .
```

The container listens on port `3000` and runs the standalone Next.js server with
`HOSTNAME=0.0.0.0`. The frontend agent registry is read from
`/app/agents.json`; Kubernetes can replace that file with a ConfigMap mount that
uses the same schema as the repository `agents.json`.
