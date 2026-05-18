# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY AI.Agent.slnx Directory.Solution.props ./
COPY dotnet/src/AI.Agent.Client/AI.Agent.Client.csproj dotnet/src/AI.Agent.Client/
COPY samples/dotnet/GenericAgent/GenericAgent.csproj samples/dotnet/GenericAgent/
RUN dotnet restore samples/dotnet/GenericAgent/GenericAgent.csproj

COPY dotnet/src/AI.Agent.Client dotnet/src/AI.Agent.Client
COPY samples/dotnet/GenericAgent samples/dotnet/GenericAgent
RUN dotnet publish samples/dotnet/GenericAgent/GenericAgent.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
LABEL org.opencontainers.image.source="https://github.com/edgestream/AI.Agent" \
      org.opencontainers.image.title="AI.Agent Generic Agent" \
      org.opencontainers.image.description="Generic AG-UI backend agent for AI.Agent"

ENV ASPNETCORE_HTTP_PORTS=8000 \
    DOTNET_EnableDiagnostics=0

WORKDIR /app
COPY --from=build /app/publish ./

USER app

EXPOSE 8000

ENTRYPOINT ["dotnet", "GenericAgent.dll"]
