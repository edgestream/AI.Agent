import type { Message as AGUIMessage, RunAgentInput } from "@ag-ui/core";
import { EventType } from "@ag-ui/core";
import type {
  ChatRequestOptions,
  ChatTransport,
  UIMessage,
  UIMessageChunk,
} from "ai";

type AGUIChatTransportOptions = {
  api: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
};

type SendMessagesOptions = {
  trigger: "submit-message" | "regenerate-message";
  chatId: string;
  messageId: string | undefined;
  messages: UIMessage[];
  abortSignal: AbortSignal | undefined;
} & ChatRequestOptions;

type AGUIEvent = {
  type?: string;
  messageId?: string;
  delta?: string;
  message?: string;
  error?: string;
  messageText?: string;
};

export class AGUIChatTransport implements ChatTransport<UIMessage> {
  private readonly api: string;
  private readonly headers?: HeadersInit;
  private readonly credentials?: RequestCredentials;
  private readonly fetch: typeof fetch;

  constructor({
    api,
    headers,
    credentials,
    fetch: fetchImplementation,
  }: AGUIChatTransportOptions) {
    this.api = api;
    this.headers = headers;
    this.credentials = credentials;
    this.fetch = fetchImplementation ?? globalThis.fetch.bind(globalThis);
  }

  async sendMessages({
    chatId,
    messages,
    abortSignal,
    headers,
    body,
    metadata,
  }: SendMessagesOptions): Promise<ReadableStream<UIMessageChunk>> {
    const response = await this.fetch(this.api, {
      method: "POST",
      credentials: this.credentials,
      headers: {
        "Content-Type": "application/json",
        ...headersToRecord(this.headers),
        ...headersToRecord(headers),
      },
      body: JSON.stringify({
        threadId: chatId,
        runId: crypto.randomUUID(),
        state: {},
        messages: toAGUIMessages(messages),
        tools: [],
        context: [],
        forwardedProps: {
          ...body,
          metadata,
        },
      } satisfies RunAgentInput),
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "AG-UI request failed.");
    }

    if (!response.body) {
      throw new Error("AG-UI response body is empty.");
    }

    return response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new SSEToAGUIEventStream())
      .pipeThrough(new AGUIEventToUIMessageChunkStream());
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}

const toAGUIMessages = (messages: UIMessage[]): AGUIMessage[] =>
  messages
    .map((message): AGUIMessage | null => {
      const text = message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");

      if (!text) {
        return null;
      }

      if (message.role === "user") {
        return {
          id: message.id,
          role: "user",
          content: text,
        };
      }

      if (message.role === "assistant") {
        return {
          id: message.id,
          role: "assistant",
          content: text,
        };
      }

      if (message.role === "system") {
        return {
          id: message.id,
          role: "system",
          content: text,
        };
      }

      return null;
    })
    .filter((message): message is AGUIMessage => message !== null);

const headersToRecord = (
  headers: HeadersInit | undefined
): Record<string, string> => {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers;
};

class SSEToAGUIEventStream extends TransformStream<string, AGUIEvent> {
  constructor() {
    let buffer = "";

    super({
      transform(chunk, controller) {
        buffer += chunk;

        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";

        for (const event of events) {
          const data = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");

          if (!data || data === "[DONE]") {
            continue;
          }

          controller.enqueue(JSON.parse(data) as AGUIEvent);
        }
      },
      flush(controller) {
        const data = buffer
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");

        if (data && data !== "[DONE]") {
          controller.enqueue(JSON.parse(data) as AGUIEvent);
        }
      },
    });
  }
}

class AGUIEventToUIMessageChunkStream extends TransformStream<
  AGUIEvent,
  UIMessageChunk
> {
  constructor() {
    const textPartIds = new Map<string, string>();

    super({
      transform(event, controller) {
        switch (event.type) {
          case EventType.RUN_STARTED:
            controller.enqueue({ type: "start" });
            break;
          case EventType.TEXT_MESSAGE_START: {
            const textId = getTextPartId(textPartIds, event.messageId);
            controller.enqueue({ type: "text-start", id: textId });
            break;
          }
          case EventType.TEXT_MESSAGE_CONTENT: {
            const textId = getTextPartId(textPartIds, event.messageId);
            controller.enqueue({
              type: "text-delta",
              id: textId,
              delta: event.delta ?? "",
            });
            break;
          }
          case EventType.TEXT_MESSAGE_END: {
            const textId = getTextPartId(textPartIds, event.messageId);
            controller.enqueue({ type: "text-end", id: textId });
            break;
          }
          case EventType.TEXT_MESSAGE_CHUNK: {
            const hadTextPartId = textPartIds.has(event.messageId ?? "default");
            const textId = getTextPartId(textPartIds, event.messageId);
            if (!hadTextPartId) {
              controller.enqueue({ type: "text-start", id: textId });
            }
            controller.enqueue({
              type: "text-delta",
              id: textId,
              delta: event.delta ?? "",
            });
            break;
          }
          case EventType.RUN_FINISHED:
            controller.enqueue({ type: "finish-step" });
            controller.enqueue({ type: "finish" });
            break;
          case EventType.RUN_ERROR:
            controller.enqueue({
              type: "error",
              errorText:
                event.message ??
                event.messageText ??
                event.error ??
                "AG-UI run failed.",
            });
            break;
        }
      },
    });
  }
}

const getTextPartId = (
  textPartIds: Map<string, string>,
  messageId: string | undefined
) => {
  const key = messageId ?? "default";
  const existing = textPartIds.get(key);
  if (existing) {
    return existing;
  }

  const textPartId = `text-${textPartIds.size + 1}`;
  textPartIds.set(key, textPartId);
  return textPartId;
};
