import { EventType } from "@ag-ui/core";
import assert from "node:assert/strict";
import test from "node:test";
import { aguiEventToUIMessageChunks } from "./agui-chat-transport.ts";

test("maps AG-UI tool call lifecycle events to AI SDK tool chunks", () => {
  const textPartIds = new Map<string, string>();
  const toolCalls = new Map();

  assert.deepEqual(
    aguiEventToUIMessageChunks(
      {
        type: EventType.TOOL_CALL_START,
        toolCallId: "call-1",
        toolCallName: "fetch_web_page",
      },
      textPartIds,
      toolCalls
    ),
    [
      {
        type: "tool-input-start",
        toolCallId: "call-1",
        toolName: "fetch_web_page",
      },
    ]
  );

  assert.deepEqual(
    aguiEventToUIMessageChunks(
      {
        type: EventType.TOOL_CALL_ARGS,
        toolCallId: "call-1",
        delta: "{\"url\":\"https://example.com\"}",
      },
      textPartIds,
      toolCalls
    ),
    [
      {
        type: "tool-input-delta",
        toolCallId: "call-1",
        inputTextDelta: "{\"url\":\"https://example.com\"}",
      },
    ]
  );

  assert.deepEqual(
    aguiEventToUIMessageChunks(
      {
        type: EventType.TOOL_CALL_END,
        toolCallId: "call-1",
      },
      textPartIds,
      toolCalls
    ),
    [
      {
        type: "tool-input-available",
        toolCallId: "call-1",
        toolName: "fetch_web_page",
        input: { url: "https://example.com" },
      },
    ]
  );

  assert.deepEqual(
    aguiEventToUIMessageChunks(
      {
        type: EventType.TOOL_CALL_RESULT,
        toolCallId: "call-1",
        messageId: "tool-message-1",
        content: "Fetched page text",
      },
      textPartIds,
      toolCalls
    ),
    [
      {
        type: "tool-output-available",
        toolCallId: "call-1",
        output: "Fetched page text",
      },
    ]
  );
});
