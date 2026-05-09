"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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
                  if (part.type !== "text") {
                    return null;
                  }

                  return (
                    <Fragment key={`${message.id}-${index}`}>
                      <MessageResponse>{part.text}</MessageResponse>
                    </Fragment>
                  );
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
                    <svg
                      aria-hidden="true"
                      className="size-4 shrink-0"
                      fill="none"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M10.887 15H8.5a.5.5 0 0 1 0-1h2.387a.999.999 0 0 0 .865-.5l2.888-5a.998.998 0 0 0 0-1l-2.935-5.084A.837.837 0 0 0 10.983 2a.828.828 0 0 0-.795.587l-3.422 11.12A1.821 1.821 0 0 1 5.016 15a1.838 1.838 0 0 1-1.587-.916L.495 9a2.001 2.001 0 0 1 0-2l2.887-5c.355-.617 1.019-1 1.731-1H7.5a.5.5 0 0 1 0 1H5.113a.999.999 0 0 0-.865.5l-2.888 5a.998.998 0 0 0 0 1l2.935 5.084a.835.835 0 0 0 .722.416.828.828 0 0 0 .795-.588L9.234 2.293A1.82 1.82 0 0 1 10.984 1c.652 0 1.261.351 1.587.916L15.506 7a2.003 2.003 0 0 1 0 2.001L12.619 14c-.355.617-1.02 1-1.732 1Z"
                        fill="currentColor"
                      />
                    </svg>
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
                        <svg
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M10.887 15H8.5a.5.5 0 0 1 0-1h2.387a.999.999 0 0 0 .865-.5l2.888-5a.998.998 0 0 0 0-1l-2.935-5.084A.837.837 0 0 0 10.983 2a.828.828 0 0 0-.795.587l-3.422 11.12A1.821 1.821 0 0 1 5.016 15a1.838 1.838 0 0 1-1.587-.916L.495 9a2.001 2.001 0 0 1 0-2l2.887-5c.355-.617 1.019-1 1.731-1H7.5a.5.5 0 0 1 0 1H5.113a.999.999 0 0 0-.865.5l-2.888 5a.998.998 0 0 0 0 1l2.935 5.084a.835.835 0 0 0 .722.416.828.828 0 0 0 .795-.588L9.234 2.293A1.82 1.82 0 0 1 10.984 1c.652 0 1.261.351 1.587.916L15.506 7a2.003 2.003 0 0 1 0 2.001L12.619 14c-.355.617-1.02 1-1.732 1Z"
                            fill="currentColor"
                          />
                        </svg>
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
