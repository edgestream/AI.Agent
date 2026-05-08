import { ChatSurface } from "@/app/chat-surface";
import { getAgentChooserOptions, getDefaultAgentId } from "@/lib/agent-registry";

export default function Home() {
  return (
    <ChatSurface
      agents={getAgentChooserOptions()}
      defaultAgentId={getDefaultAgentId()}
    />
  );
}
