import type { CallToolResult } from "@modelcontextprotocol/server";
import { NWS_API_BASE } from "../config.js";
import { formatAlert } from "../helpers/formatters.js";
import { makeNWSRequest } from "../helpers/nws-client.js";
import { textResult } from "../helpers/tool-result.js";
import type { AlertsInput } from "../schemas.js";
import type { AlertsResponse } from "../types.js";

export async function getAlerts({
  state,
}: AlertsInput): Promise<CallToolResult> {
  const stateCode = state.toUpperCase();
  const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
  const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

  if (!alertsData) {
    return textResult("Failed to retrieve alerts data");
  }

  const features = alertsData.features || [];
  if (!features.length) {
    return textResult(`No active alerts for ${stateCode}`);
  }

  const formattedAlerts = features.map(formatAlert);
  const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

  return textResult(alertsText);
}
