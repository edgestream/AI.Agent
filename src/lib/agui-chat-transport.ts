import type { Message as AGUIMessage, RunAgentInput } from "@ag-ui/core";
import { EventType } from "@ag-ui/core";
import type {
  ChatRequestOptions,
  ChatTransport,
  UIMessage,
  UIMessageChunk,
} from "ai";

type AGUIChatTransportOptions = {
  api: string | (() => string);
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
  toolCallId?: string;
  toolCallName?: string;
  content?: string;
};

export class AGUIChatTransport implements ChatTransport<UIMessage> {
  private api: string | (() => string);
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
    const response = await this.fetch(resolveApi(this.api), {
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

  setApi(api: string | (() => string)) {
    this.api = api;
  }
}

const resolveApi = (api: string | (() => string)) =>
  typeof api === "function" ? api() : api;

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
    const toolCalls = new Map<string, ToolCallState>();

    super({
      transform(event, controller) {
        for (const chunk of aguiEventToUIMessageChunks(
          event,
          textPartIds,
          toolCalls
        )) {
          controller.enqueue(chunk);
        }
      },
    });
  }
}

type ToolCallState = {
  id: string;
  name: string;
  inputText: string;
  inputAvailable: boolean;
};

export const aguiEventToUIMessageChunks = (
  event: AGUIEvent,
  textPartIds = new Map<string, string>(),
  toolCalls = new Map<string, ToolCallState>()
): UIMessageChunk[] => {
  switch (event.type) {
    case EventType.RUN_STARTED:
      return [{ type: "start" }];
    case EventType.TEXT_MESSAGE_START: {
      const textId = getTextPartId(textPartIds, event.messageId);
      return [{ type: "text-start", id: textId }];
    }
    case EventType.TEXT_MESSAGE_CONTENT: {
      const textId = getTextPartId(textPartIds, event.messageId);
      return [
        {
          type: "text-delta",
          id: textId,
          delta: event.delta ?? "",
        },
      ];
    }
    case EventType.TEXT_MESSAGE_END: {
      const textId = getTextPartId(textPartIds, event.messageId);
      return [{ type: "text-end", id: textId }];
    }
    case EventType.TEXT_MESSAGE_CHUNK: {
      const hadTextPartId = textPartIds.has(event.messageId ?? "default");
      const textId = getTextPartId(textPartIds, event.messageId);
      return [
        ...(hadTextPartId ? [] : [{ type: "text-start" as const, id: textId }]),
        {
          type: "text-delta",
          id: textId,
          delta: event.delta ?? "",
        },
      ];
    }
    case EventType.TOOL_CALL_START: {
      const toolCall = getToolCallState(toolCalls, event);
      return [
        {
          type: "tool-input-start",
          toolCallId: toolCall.id,
          toolName: toolCall.name,
        },
      ];
    }
    case EventType.TOOL_CALL_ARGS: {
      const toolCall = getToolCallState(toolCalls, event);
      const delta = event.delta ?? "";
      toolCall.inputText += delta;
      return [
        {
          type: "tool-input-delta",
          toolCallId: toolCall.id,
          inputTextDelta: delta,
        },
      ];
    }
    case EventType.TOOL_CALL_END: {
      const toolCall = getToolCallState(toolCalls, event);
      toolCall.inputAvailable = true;
      return [
        {
          type: "tool-input-available",
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          input: parseToolInput(toolCall.inputText),
        },
      ];
    }
    case EventType.TOOL_CALL_CHUNK:
      return toolCallChunkToUIMessageChunks(event, toolCalls);
    case EventType.TOOL_CALL_RESULT: {
      const toolCall = getToolCallState(toolCalls, event);
      const chunks: UIMessageChunk[] = [];

      if (!toolCall.inputAvailable) {
        toolCall.inputAvailable = true;
        chunks.push({
          type: "tool-input-available",
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          input: parseToolInput(toolCall.inputText),
        });
      }

      chunks.push({
        type: "tool-output-available",
        toolCallId: toolCall.id,
        output: event.content ?? "",
      });

      return chunks;
    }
    case EventType.RUN_FINISHED:
      return [{ type: "finish-step" }, { type: "finish" }];
    case EventType.RUN_ERROR:
      return [
        {
          type: "error",
          errorText:
            event.message ??
            event.messageText ??
            event.error ??
            "AG-UI run failed.",
        },
      ];
    default:
      return [];
  }
};

const toolCallChunkToUIMessageChunks = (
  event: AGUIEvent,
  toolCalls: Map<string, ToolCallState>
): UIMessageChunk[] => {
  const toolCall = getToolCallState(toolCalls, event);
  const chunks: UIMessageChunk[] = [];

  if (event.toolCallName) {
    chunks.push({
      type: "tool-input-start",
      toolCallId: toolCall.id,
      toolName: toolCall.name,
    });
  }

  if (event.delta) {
    toolCall.inputText += event.delta;
    chunks.push({
      type: "tool-input-delta",
      toolCallId: toolCall.id,
      inputTextDelta: event.delta,
    });
  }

  return chunks;
};

const getToolCallState = (
  toolCalls: Map<string, ToolCallState>,
  event: AGUIEvent
) => {
  const id = event.toolCallId ?? "tool-call";
  const existing = toolCalls.get(id);
  if (existing) {
    if (event.toolCallName) {
      existing.name = event.toolCallName;
    }

    return existing;
  }

  const toolCall = {
    id,
    name: event.toolCallName ?? "tool",
    inputText: "",
    inputAvailable: false,
  };
  toolCalls.set(id, toolCall);
  return toolCall;
};

const parseToolInput = (inputText: string) => {
  if (!inputText.trim()) {
    return {};
  }

  try {
    return JSON.parse(inputText) as unknown;
  } catch {
    return inputText;
  }
};

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
