import { NWS_REQUEST_TIMEOUT_MS, USER_AGENT } from "../config.js";
import type { NWSError, NWSResult } from "../types.js";

// Helper function for making NWS API requests
export async function makeNWSRequest<T>(url: string): Promise<NWSResult<T>> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(NWS_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`Error making NWS request: HTTP ${response.status}`);
      return { ok: false, error: { kind: "http", status: response.status } };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    console.error("Error making NWS request:", error);
    if (error instanceof Error && error.name === "TimeoutError") {
      return { ok: false, error: { kind: "timeout" } };
    }
    return { ok: false, error: { kind: "network" } };
  }
}

// Human-readable description of a failed NWS request
export function describeNWSError(error: NWSError): string {
  switch (error.kind) {
    case "http":
      return `NWS API returned HTTP ${error.status}`;
    case "timeout":
      return "NWS API request timed out";
    case "network":
      return "Network error while contacting NWS API";
  }
}
