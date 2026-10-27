import type { CallToolResult } from "@modelcontextprotocol/server";
import { NWS_API_BASE } from "../config.js";
import { formatForecastPeriod } from "../helpers/formatters.js";
import { describeNWSError, makeNWSRequest } from "../helpers/nws-client.js";
import { errorResult, textResult } from "../helpers/tool-result.js";
import type { ForecastInput } from "../schemas.js";
import type { ForecastResponse, PointsResponse } from "../types.js";

export async function getForecast({
  latitude,
  longitude,
}: ForecastInput): Promise<CallToolResult> {
  // Get grid point data
  const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const pointsResult = await makeNWSRequest<PointsResponse>(pointsUrl);

  if (!pointsResult.ok) {
    // NWS answers 404 for coordinates outside its coverage
    if (
      pointsResult.error.kind === "http" &&
      pointsResult.error.status === 404
    ) {
      return errorResult(
        `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
      );
    }
    return errorResult(
      `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}: ${describeNWSError(pointsResult.error)}`,
    );
  }

  const forecastUrl = pointsResult.data.properties?.forecast;
  if (!forecastUrl) {
    return errorResult("Failed to get forecast URL from grid point data");
  }

  // Get forecast data
  const forecastResult = await makeNWSRequest<ForecastResponse>(forecastUrl);
  if (!forecastResult.ok) {
    return errorResult(
      `Failed to retrieve forecast data: ${describeNWSError(forecastResult.error)}`,
    );
  }

  const periods = forecastResult.data.properties?.periods || [];
  if (periods.length === 0) {
    return textResult("No forecast periods available");
  }

  // Format forecast periods
  const formattedForecast = periods.map(formatForecastPeriod);
  const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;

  return textResult(forecastText);
}
