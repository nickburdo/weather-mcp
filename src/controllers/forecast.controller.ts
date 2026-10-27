import type { CallToolResult } from "@modelcontextprotocol/server";
import { NWS_API_BASE } from "../config.js";
import { formatForecastPeriod } from "../helpers/formatters.js";
import { makeNWSRequest } from "../helpers/nws-client.js";
import { textResult } from "../helpers/tool-result.js";
import type { ForecastInput } from "../schemas.js";
import type { ForecastResponse, PointsResponse } from "../types.js";

export async function getForecast({
  latitude,
  longitude,
}: ForecastInput): Promise<CallToolResult> {
  // Get grid point data
  const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

  if (!pointsData) {
    return textResult(
      `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
    );
  }

  const forecastUrl = pointsData.properties?.forecast;
  if (!forecastUrl) {
    return textResult("Failed to get forecast URL from grid point data");
  }

  // Get forecast data
  const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
  if (!forecastData) {
    return textResult("Failed to retrieve forecast data");
  }

  const periods = forecastData.properties?.periods || [];
  if (periods.length === 0) {
    return textResult("No forecast periods available");
  }

  // Format forecast periods
  const formattedForecast = periods.map(formatForecastPeriod);
  const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;

  return textResult(forecastText);
}
