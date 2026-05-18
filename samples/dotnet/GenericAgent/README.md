# GenericAgent

Sample AG-UI agent server for a generic chat agent.

## Container image

Build the Generic Agent image from the repository root:

```bash
docker build \
  -f samples/dotnet/GenericAgent/Dockerfile \
  -t agent-generic:local .
```

Run the container locally with an OpenAI API key:

```bash
docker run --rm \
  -p 8000:8000 \
  -e OpenAI__ApiKey="${OPENAI_API_KEY}" \
  agent-generic:local
```

Publish a multi-arch image for downstream Kubernetes deployment:

```bash
TAG=dev
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file samples/dotnet/GenericAgent/Dockerfile \
  --tag "ghcr.io/edgestream/agent/agent-generic:${TAG}" \
  --push .
```

The container listens on port `8000`. The OpenAI configuration binds from the
`OpenAI` configuration section, so Kubernetes can provide the API key with an
environment variable such as `OpenAI__ApiKey` or an equivalent configuration
provider.
