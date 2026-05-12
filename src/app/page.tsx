"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Terminal,
  TerminalContent,
  TerminalHeader,
  TerminalTitle,
} from "@/components/ai-elements/terminal";
import { isToolPart, Tool } from "@/components/ai-elements/tool";
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import type { AgentChooserOption } from "@/lib/agent-registry";
import { AGUIChatTransport } from "@/lib/agui-chat-transport";
import { useChat } from "@ai-sdk/react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

type AgentBootstrapResponse = {
  agents: AgentChooserOption[];
  defaultAgentId: string;
};

type TerminalPart = {
  type: "data-terminal";
  data: {
    output?: string;
    chunks?: Array<{
      output: string;
      isError?: boolean;
    }>;
    exitCode?: number;
    isStreaming?: boolean;
    title?: string;
  };
};

const isTerminalPart = (part: unknown): part is TerminalPart =>
  Boolean(
    part &&
      typeof part === "object" &&
      "type" in part &&
      part.type === "data-terminal" &&
      "data" in part &&
      part.data &&
      typeof part.data === "object"
  );

const isTerminalToolPart = (
  part: Parameters<typeof isToolPart>[0]
): boolean =>
  isToolPart(part) &&
  (part.type === "tool-run_terminal" ||
    (part.type === "dynamic-tool" && part.toolName === "run_terminal"));

export default function Home() {
  const [text, setText] = useState("");
  const [agents, setAgents] = useState<AgentChooserOption[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [transport] = useState(() => new AGUIChatTransport({ api: "" }));

  const selectedAgent =
    agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];

  const { messages, sendMessage, status, stop } = useChat({
    transport,
  });

  useEffect(() => {
    transport.setApi(
      selectedAgentId ? `/api/agents/${selectedAgentId}/agui` : ""
    );
  }, [selectedAgentId, transport]);

  useEffect(() => {
    let cancelled = false;

    const loadAgents = async () => {
      try {
        const response = await fetch("/api/agents", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error((await response.text()) || "Failed to load agents.");
        }

        const payload = (await response.json()) as AgentBootstrapResponse;
        if (cancelled) {
          return;
        }

        setAgents(payload.agents);
        setSelectedAgentId(payload.defaultAgentId);
      } catch (error) {
        if (cancelled) {
          return;
        }

        toast.error("The configured agents could not be loaded.", {
          description:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    void loadAgents();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (message: PromptInputMessage) => {
    const trimmed = message.text.trim();
    if (!trimmed || !selectedAgentId) {
      return;
    }

    try {
      setText("");
      await sendMessage({ text: trimmed });
    } catch (error) {
      toast.error("The request could not be sent.", {
        description:
          error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <main className="px-4 py-6">
      {messages.length > 0 && (
        <div className="pb-6">
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <Fragment key={`${message.id}-${index}`}>
                        <MessageResponse>{part.text}</MessageResponse>
                      </Fragment>
                    );
                  }

                  if (isToolPart(part)) {
                    if (isTerminalToolPart(part)) {
                      return null;
                    }

                    return <Tool key={`${message.id}-${index}`} part={part} />;
                  }

                  if (isTerminalPart(part)) {
                    return (
                      <Terminal
                        className="my-2 rounded-md"
                        chunks={part.data.chunks}
                        isStreaming={part.data.isStreaming}
                        key={`${message.id}-${index}`}
                        output={part.data.output ?? ""}
                      >
                        <TerminalHeader>
                          <TerminalTitle>{part.data.title}</TerminalTitle>
                        </TerminalHeader>
                        <TerminalContent />
                      </Terminal>
                    );
                  }

                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
        </div>
      )}
      <div className="bg-background/95">
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              disabled={!selectedAgent}
              onChange={(event) => setText(event.target.value)}
              placeholder={
                selectedAgent ? "" : "Loading configured agents..."
              }
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger
                  aria-label="Select agent"
                  className="max-w-48"
                  disabled={!selectedAgent}
                  size="sm"
                  tooltip="Select agent"
                >
                  {!selectedAgent?.icon || selectedAgent.icon === "default" ? (
                    <span
                      aria-hidden="true"
                      className="codicon codicon-agent size-4 shrink-0"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="material-symbols-rounded text-[18px]"
                    >
                      {selectedAgent.icon}
                    </span>
                  )}
                  <span className="truncate">
                    {selectedAgent?.label ?? "Loading"}
                  </span>
                  <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent className="w-64">
                  {agents.map((agent) => (
                    <PromptInputActionMenuItem
                      className="items-start gap-2 py-2"
                      key={agent.id}
                      onSelect={() => setSelectedAgentId(agent.id)}
                    >
                      {!agent.icon || agent.icon === "default" ? (
                        <span
                          aria-hidden="true"
                          className="codicon codicon-agent mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="material-symbols-rounded mt-0.5 text-[18px] text-muted-foreground"
                        >
                          {agent.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {agent.label}
                        </span>
                        {agent.description && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {agent.description}
                          </span>
                        )}
                      </span>
                      {agent.id === selectedAgentId && (
                        <CheckIcon className="mt-0.5 size-4" />
                      )}
                    </PromptInputActionMenuItem>
                  ))}
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </main>
  );
}
