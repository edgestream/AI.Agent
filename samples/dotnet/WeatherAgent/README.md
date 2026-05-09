# WeatherAgent

AG-UI sample agent for weather questions and forecast-style responses.

Configure the required API key with ASP.NET Core Secret Manager:

```bash
dotnet user-secrets set "OpenAI:ApiKey" "<your OpenAI API key>" --project samples/dotnet/WeatherAgent
```

Run the sample:

```bash
dotnet run --project samples/dotnet/WeatherAgent
```

The default launch profile listens on `http://localhost:8001`, matching the root `agents.json` entry.
