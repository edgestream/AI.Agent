import { getAgentEndpoint } from "@/lib/agent-registry";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    agent: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { agent } = await params;

  try {
    const endpoint = getAgentEndpoint(agent);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        Accept: request.headers.get("accept") ?? "text/event-stream",
      },
      body: await request.text(),
      cache: "no-store",
      signal: request.signal,
    });

    if (!response.body) {
      return new NextResponse(null, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AG-UI request failed.",
      },
      {
        status: 502,
      }
    );
  }
}
