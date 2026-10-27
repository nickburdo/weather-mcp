import type { CallToolResult } from "@modelcontextprotocol/server";

// Wrap plain text into a tool call result
export function textResult(text: string): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}
