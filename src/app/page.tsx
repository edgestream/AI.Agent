"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [text, setText] = useState("");

  const { sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const trimmed = message.text.trim();
      if (!trimmed) return;
      try {
        await sendMessage({ text: trimmed });
        setText("");
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
    <main className="min-h-screen bg-background p-4">
      <div className="w-full">
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(event) => setText(event.target.value)}
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
            </PromptInputTools>
            <PromptInputSubmit
              onStop={stop}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </main>
  );
}
