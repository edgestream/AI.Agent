import { readFileSync } from "node:fs";
import { join } from "node:path";

type AgentConfiguration = {
  protocol: "AGUI";
  endpoint: string;
  label?: string;
  description?: string;
  icon?: string;
  default?: boolean;
};

type AgentRegistry = Record<string, AgentConfiguration>;

export type AgentChooserOption = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  default: boolean;
};

const validateOptionalString = (
  agentId: string,
  value: unknown,
  fieldName: "label" | "description" | "icon"
) => {
  if (value !== undefined && (typeof value !== "string" || !value)) {
    throw new Error(
      `Agent '${agentId}' ${fieldName} must be a non-empty string.`
    );
  }
};

const loadAgentRegistry = (): AgentRegistry => {
  const registryPath = join(process.cwd(), "agents.json");
  const parsed = JSON.parse(readFileSync(registryPath, "utf8")) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("agents.json must contain an object.");
  }

  let defaultAgentId: string | undefined;

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

    validateOptionalString(agentId, candidate.label, "label");
    validateOptionalString(agentId, candidate.description, "description");
    validateOptionalString(agentId, candidate.icon, "icon");

    if (
      candidate.default !== undefined &&
      typeof candidate.default !== "boolean"
    ) {
      throw new Error(`Agent '${agentId}' default must be a boolean.`);
    }

    if (candidate.default) {
      if (defaultAgentId) {
        throw new Error(
          `Only one agent can be marked as default. Found '${defaultAgentId}' and '${agentId}'.`
        );
      }

      defaultAgentId = agentId;
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

export const getAgentChooserOptions = (): AgentChooserOption[] => {
  const options = Object.entries(agentRegistry).map(
    ([id, configuration]): AgentChooserOption => ({
      id,
      label: configuration.label ?? id,
      description: configuration.description,
      icon: configuration.icon,
      default: configuration.default ?? false,
    })
  );

  if (options.length === 0) {
    throw new Error("agents.json must configure at least one agent.");
  }

  return options;
};

export const getDefaultAgentId = (): string => {
  const agents = getAgentChooserOptions();
  return agents.find((agent) => agent.default)?.id ?? agents[0].id;
};
