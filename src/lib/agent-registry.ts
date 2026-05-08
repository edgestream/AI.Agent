import { readFileSync } from "node:fs";
import { join } from "node:path";

type AgentConfiguration = {
  protocol: "AGUI";
  endpoint: string;
};

type AgentRegistry = Record<string, AgentConfiguration>;

const loadAgentRegistry = (): AgentRegistry => {
  const registryPath = join(process.cwd(), "agents.json");
  const parsed = JSON.parse(readFileSync(registryPath, "utf8")) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("agents.json must contain an object.");
  }

  for (const [agentId, configuration] of Object.entries(parsed)) {
    if (
      !configuration ||
      typeof configuration !== "object" ||
      Array.isArray(configuration)
    ) {
      throw new Error(`Agent '${agentId}' configuration must be an object.`);
    }

    const candidate = configuration as Partial<AgentConfiguration>;
    if (candidate.protocol !== "AGUI") {
      throw new Error(`Agent '${agentId}' must use the AGUI protocol.`);
    }

    if (typeof candidate.endpoint !== "string" || !candidate.endpoint) {
      throw new Error(`Agent '${agentId}' endpoint is required.`);
    }
  }

  return parsed as AgentRegistry;
};

const agentRegistry = loadAgentRegistry();

export const getAgentEndpoint = (agentId: string): URL => {
  const configuration = agentRegistry[agentId];
  if (!configuration) {
    throw new Error(`Agent '${agentId}' is not configured.`);
  }

  return new URL(configuration.endpoint);
};
