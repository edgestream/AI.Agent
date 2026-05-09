import {
  getAgentChooserOptions,
  getDefaultAgentId,
} from "@/lib/agent-registry";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    agents: getAgentChooserOptions(),
    defaultAgentId: getDefaultAgentId(),
  });
}
