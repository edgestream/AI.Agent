import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>())
});

export async function POST(request: Request) {
  const json = await request.json();
  const { messages } = requestSchema.parse(json);
  const openai = createOpenAI({
    baseURL: process.env.OPENAI_BASE_URL
  });
  const model = openai.responses(process.env.OPENAI_MODEL || "gpt-5.4");
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
  for await (const part of result.fullStream) {
    if (part.type === 'text-delta') {
      process.stdout.write(JSON.stringify(part) + '\n');
    }
  }
  return result.toUIMessageStreamResponse();
}
