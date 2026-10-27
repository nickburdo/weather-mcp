import { McpServer } from "@modelcontextprotocol/server";
import { getAlerts } from "./controllers/alerts.controller.js";
import { getForecast } from "./controllers/forecast.controller.js";
import { alertsInputSchema, forecastInputSchema } from "./schemas.js";

// Build a server instance and register its tools. serveStdio calls this
// whenever it needs an instance, so every call must return a fresh one.
export function createServer() {
  const server = new McpServer({
    name: "weather",
    version: "1.0.0",
  });

  server.registerTool(
    "get_alerts",
    {
      description: "Get weather alerts for a state",
      inputSchema: alertsInputSchema,
    },
    getAlerts,
  );

  server.registerTool(
    "get_forecast",
    {
      description: "Get weather forecast for a location",
      inputSchema: forecastInputSchema,
    },
    getForecast,
  );

  return server;
}
