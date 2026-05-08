---
name: aspnet-core-project
description: Use when work involves ASP.NET Core, .NET web APIs, Minimal APIs, controllers, middleware, hosting, configuration, authentication, authorization, SignalR, gRPC, testing, deployment, or integration with a .NET backend service.
---

# ASP.NET Core Project

Use this skill when a feature introduces, changes, or integrates an ASP.NET Core service. This includes .NET web APIs, Minimal APIs, hosting, configuration, middleware, and integration contracts.

## Research rule

Use the configured Microsoft Learn MCP server for current ASP.NET Core guidance before making framework-sensitive decisions.

## Defaults

- Prefer Minimal APIs or small controller surfaces for narrow API features.
- Keep request/response DTOs explicit and version contracts intentionally.
- Put configuration in `IOptions<T>` or `IOptionsMonitor<T>` rather than reading environment variables deep in business logic.
- Keep middleware focused on cross-cutting HTTP concerns.
- Make authentication and authorization policy decisions explicit in architecture notes.
- Add integration tests for public HTTP behavior when a .NET backend exists.

## VS Code debugging

- When a repo uses a VS Code C# Dev Kit launch config with `"type": "dotnet"`, prefer `Properties/launchSettings.json` for per-profile debug environment changes.
- For ASP.NET Core logging duplication during VS Code debugging, suppress the `Debug` logger in the relevant launch profile with `environmentVariables`, for example `Logging__Debug__LogLevel__Default=None`, instead of inventing unsupported `launch.json` properties.
- Keep `.vscode/launch.json` minimal for `dotnet` profiles and use it mainly to point at the project; let `launchSettings.json` carry supported profile settings such as `environmentVariables`, `applicationUrl`, and `commandLineArgs`.

## Integration with the Next.js app

- Treat API contracts as shared architecture, not incidental implementation.
- Define streaming protocol, error shape, auth behavior, and cancellation behavior before coding both sides.
- Do not duplicate business rules in both the frontend and backend unless they are validation hints on the client and authoritative checks on the server.

## Docs

- ASP.NET Core docs: https://learn.microsoft.com/aspnet/core
- Microsoft Learn MCP: https://learn.microsoft.com/en-us/training/support/mcp
