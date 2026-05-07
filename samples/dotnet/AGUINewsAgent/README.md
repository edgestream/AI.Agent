# AGUINewsAgent

Sample AG-UI agent server for fictional satirical news output.

## Configuration

Set `OpenAI:ApiKey` in [`appsettings.json`](/home/dev/workspace/AI.Web/samples/dotnet/AGUINewsAgent/appsettings.json):

```json
{
  "OpenAI": {
    "ApiKey": "<Your OpenAI API Key>"
  }
}
```

Optional:

```json
{
  "OpenAI": {
    "Endpoint": "https://api.openai.com/v1",
    "Model": "gpt-5.4"
  }
}
```

## Quickstart

Run the agent server:

```bash
dotnet run --project samples/dotnet/AGUINewsAgent
```

Run the web app in another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
