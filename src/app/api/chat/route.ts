import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  model: z.string().optional(),
  webSearch: z.boolean().optional(),
});

export const maxDuration = 30;

export async function POST(request: Request) {
  const json = await request.json();
  const { messages, model, webSearch } = requestSchema.parse(json);

  const selectedModel = webSearch ? "perplexity/sonar" : model;

  const result = streamText({
    model: selectedModel ?? "openai/gpt-4.1-mini",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
