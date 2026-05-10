"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, WrenchIcon } from "lucide-react";
import type { ComponentProps } from "react";
import type { UIMessage } from "ai";

export type ToolPart =
  | Extract<UIMessage["parts"][number], { type: "dynamic-tool" }>
  | Extract<UIMessage["parts"][number], { type: `tool-${string}` }>;

type ToolProps = Omit<ComponentProps<"div">, "part"> & {
  part: ToolPart;
};

export const Tool = ({ className, part, ...props }: ToolProps) => {
  const toolName = getToolName(part);
  const status = getToolStatus(part);

  return (
    <Collapsible
      className={cn(
        "group/tool my-2 rounded-md border bg-muted/35 text-sm",
        className
      )}
      defaultOpen={part.state !== "output-available"}
      {...props}
    >
      <CollapsibleTrigger className="flex min-h-9 w-full items-center gap-2 px-3 py-2 text-left">
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/tool:rotate-90" />
        <WrenchIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">{toolName}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{status}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-3 py-2">
        <div className="space-y-2">
          <ToolValue label="Input" value={part.input} />
          {part.state === "output-available" && (
            <ToolValue label="Result" value={part.output} />
          )}
          {part.state === "output-error" && (
            <ToolValue label="Error" value={part.errorText} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const isToolPart = (
  part: UIMessage["parts"][number]
): part is ToolPart =>
  part.type === "dynamic-tool" || part.type.startsWith("tool-");

const ToolValue = ({ label, value }: { label: string; value: unknown }) => (
  <div className="space-y-1">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded bg-background px-2 py-1.5 font-mono text-xs leading-relaxed">
      {formatToolValue(value)}
    </pre>
  </div>
);

const getToolName = (part: ToolPart) =>
  part.type === "dynamic-tool" ? part.toolName : part.type.replace(/^tool-/, "");

const getToolStatus = (part: ToolPart) => {
  switch (part.state) {
    case "input-streaming":
      return "Preparing";
    case "input-available":
      return "Running";
    case "output-available":
      return "Complete";
    case "output-error":
      return "Failed";
    case "output-denied":
      return "Denied";
    case "approval-requested":
      return "Approval requested";
    case "approval-responded":
      return "Approval recorded";
    default:
      return "Pending";
  }
};

const formatToolValue = (value: unknown) => {
  if (value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
};
