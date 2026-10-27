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

// Wrap plain text into a tool call result flagged as an error
export function errorResult(text: string): CallToolResult {
  return {
    ...textResult(text),
    isError: true,
  };
}
