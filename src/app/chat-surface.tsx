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
import {
  BotIcon,
  CheckIcon,
  ChevronDownIcon,
  CloudSunIcon,
  Globe2Icon,
  NewspaperIcon,
} from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type ChatSurfaceProps = {
  agents: AgentChooserOption[];
  defaultAgentId: string;
};

export function ChatSurface({ agents, defaultAgentId }: ChatSurfaceProps) {
  const [text, setText] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(defaultAgentId);
  const selectedAgent =
    agents.find((agent) => agent.id === selectedAgentId) ?? agents[0];

  const transport = useMemo(
    () =>
      new AGUIChatTransport({
        api: `/api/agents/${selectedAgent.id}/agui`,
      }),
    [selectedAgent.id]
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: `agui-${selectedAgent.id}`,
    transport,
  });

  const handleAgentSelect = useCallback(
    (agentId: string) => {
      if (agentId === selectedAgent.id) {
        return;
      }

      stop();
      setText("");
      setSelectedAgentId(agentId);
    },
    [selectedAgent.id, stop]
  );

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const trimmed = message.text.trim();
      if (!trimmed) return;
      try {
        setText("");
        await sendMessage({ text: trimmed });
      } catch (error) {
        toast.error("The request could not be sent.", {
          description:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [sendMessage]
  );

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
              placeholder=""
              onChange={(event) => setText(event.target.value)}
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <AgentChooser
                agents={agents}
                onSelect={handleAgentSelect}
                selectedAgent={selectedAgent}
              />
            </PromptInputTools>
            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </main>
  );
}

type AgentChooserProps = {
  agents: AgentChooserOption[];
  selectedAgent: AgentChooserOption;
  onSelect: (agentId: string) => void;
};

function AgentChooser({
  agents,
  selectedAgent,
  onSelect,
}: AgentChooserProps) {
  return (
    <PromptInputActionMenu>
      <PromptInputActionMenuTrigger
        aria-label="Select agent"
        className="max-w-44"
        size="sm"
        tooltip="Select agent"
      >
        <AgentIcon className="size-4" icon={selectedAgent.icon} />
        <span className="truncate">{selectedAgent.label}</span>
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </PromptInputActionMenuTrigger>
      <PromptInputActionMenuContent className="w-64">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgent.id;

          return (
            <PromptInputActionMenuItem
              className="items-start gap-2 py-2"
              key={agent.id}
              onSelect={() => onSelect(agent.id)}
            >
              <AgentIcon
                className="mt-0.5 size-4 text-muted-foreground"
                icon={agent.icon}
              />
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
              {isSelected && <CheckIcon className="mt-0.5 size-4" />}
            </PromptInputActionMenuItem>
          );
        })}
      </PromptInputActionMenuContent>
    </PromptInputActionMenu>
  );
}

type AgentIconProps = {
  icon?: string;
  className?: string;
};

function AgentIcon({ icon, className }: AgentIconProps) {
  switch (icon) {
    case "cloud-sun":
      return <CloudSunIcon className={className} />;
    case "globe":
      return <Globe2Icon className={className} />;
    case "news":
      return <NewspaperIcon className={className} />;
    default:
      return <BotIcon className={className} />;
  }
}
