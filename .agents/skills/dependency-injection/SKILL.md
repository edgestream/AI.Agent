---
name: dependency-injection
description: Use for dependency injection design in AI.Agent and related .NET services, including service lifetimes, registration methods, options pattern, factories, service locator avoidance, test seams, middleware injection, scoped services, and ASP.NET Core DI.
---

# Dependency Injection

Use this skill for DI design in ASP.NET Core or any TypeScript service composition that starts to mirror backend dependency patterns.

## ASP.NET Core rules

- Prefer constructor injection for required dependencies.
- Use `IOptions<T>`, `IOptionsSnapshot<T>`, or `IOptionsMonitor<T>` for configuration-driven dependencies.
- Register grouped services with extension methods in `Microsoft.Extensions.DependencyInjection` when the group is meaningful.
- Match lifetimes to ownership: singleton for stateless shared services, scoped for request-bound services, transient for lightweight stateless services.
- Do not inject scoped services into singletons.
- For scoped services in middleware, inject into `Invoke` or `InvokeAsync`, or use factory-based middleware.
- Avoid service locator patterns such as resolving services with `GetService` inside application logic.
- Avoid static access to request context or global state.

## Design checks

- Can the consumer be tested without a real container?
- Does the lifetime match the resource being held?
- Is configuration validated at startup where possible?
- Are factories limited to cases where runtime choice is genuinely needed?
- Does the registration tell a future reader why multiple implementations or keyed services exist?

## Docs

- ASP.NET Core DI: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection
- Microsoft Learn MCP: https://learn.microsoft.com/en-us/training/support/mcp
