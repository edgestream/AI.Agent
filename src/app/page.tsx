"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { useChat } from "@ai-sdk/react";
import { AGUIChatTransport } from "@/lib/agui-chat-transport";
import { Fragment, useCallback, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [text, setText] = useState("");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new AGUIChatTransport({
      api: process.env.AGUI_BASE_URL || "http://localhost:8000"
    }),
  });

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
          {(messages.map((message) => (
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
            ))
          )}
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
            <PromptInputTools />
            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </main>
  );
}
