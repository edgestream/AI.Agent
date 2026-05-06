import { convertToModelMessages, streamText, type UIMessage, wrapLanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { z } from "zod";

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>())
});

export async function POST(request: Request) {
  const json = await request.json();
  const { messages } = requestSchema.parse(json);
  const openai = createOpenAI({ baseURL: process.env.OPENAI_API_BASE });
  const openai_model = openai.responses(process.env.OPENAI_MODEL || "gpt-5.4");
  const model = wrapLanguageModel({ model: openai_model, middleware: devToolsMiddleware() });
  const result = streamText({
    model,
    providerOptions: {
      openai: {
        store: false,
        instructions: "You are a helpful assistant"
      }
    },
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
