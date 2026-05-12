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
  name?: string;
  value?: unknown;
  messageId?: string;
  delta?: unknown;
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
    const terminalOutputs = new Map<string, TerminalData>();

    super({
      transform(event, controller) {
        for (const chunk of aguiEventToUIMessageChunks(
          event,
          textPartIds,
          toolCalls,
          terminalOutputs
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

type TerminalData = {
  output: string;
  isStreaming: boolean;
  chunks: Array<{
    output: string;
    isError: boolean;
  }>;
  exitCode?: number;
  title?: string;
};

export const aguiEventToUIMessageChunks = (
  event: AGUIEvent,
  textPartIds = new Map<string, string>(),
  toolCalls = new Map<string, ToolCallState>(),
  terminalOutputs = new Map<string, TerminalData>()
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
          delta: getStringDelta(event),
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
          delta: getStringDelta(event),
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
      const delta = getStringDelta(event);
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
    case EventType.CUSTOM:
      return customEventToUIMessageChunks(event, terminalOutputs);
    case EventType.STATE_DELTA:
      return stateDeltaEventToUIMessageChunks(event, terminalOutputs);
    default:
      return [];
  }
};

const stateDeltaEventToUIMessageChunks = (
  event: AGUIEvent,
  terminalOutputs: Map<string, TerminalData>
): UIMessageChunk[] => {
  const patches = Array.isArray(event.delta) ? event.delta : [];
  return patches.flatMap((patch) => {
    const patchRecord = toRecord(patch);
    if (patchRecord.path !== "/terminalEvents/-") {
      return [];
    }

    return terminalValueToUIMessageChunks(patchRecord.value, terminalOutputs);
  });
};

const customEventToUIMessageChunks = (
  event: AGUIEvent,
  terminalOutputs: Map<string, TerminalData>
): UIMessageChunk[] => {
  if (!event.name?.startsWith("terminal.")) {
    return [];
  }

  return terminalValueToUIMessageChunks(event.value, terminalOutputs);
};

const terminalValueToUIMessageChunks = (
  value: unknown,
  terminalOutputs: Map<string, TerminalData>
): UIMessageChunk[] => {
  const record = toRecord(value);
  const id = typeof record.id === "string" ? record.id : "terminal";
  const outputDelta = typeof record.output === "string" ? record.output : "";
  const isError = record.isError === true;
  const existing = terminalOutputs.get(id) ?? {
    output: "",
    isStreaming: true,
    chunks: [],
  };

  const next = {
    output: existing.output + outputDelta,
    isStreaming:
      typeof record.isStreaming === "boolean"
        ? record.isStreaming
        : existing.isStreaming,
    chunks: outputDelta
      ? [...existing.chunks, { output: outputDelta, isError }]
      : existing.chunks,
    exitCode:
      typeof record.exitCode === "number"
        ? record.exitCode
        : existing.exitCode,
    title: typeof record.title === "string" ? record.title : existing.title,
  };

  terminalOutputs.set(id, next);

  return [
    {
      type: "data-terminal",
      id,
      data: next,
    } as UIMessageChunk,
  ];
};

const getStringDelta = (event: AGUIEvent) =>
  typeof event.delta === "string" ? event.delta : "";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

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

  const delta = getStringDelta(event);
  if (delta) {
    toolCall.inputText += delta;
    chunks.push({
      type: "tool-input-delta",
      toolCallId: toolCall.id,
      inputTextDelta: delta,
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
