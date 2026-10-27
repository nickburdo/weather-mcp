export interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

export interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

export interface AlertsResponse {
  features?: AlertFeature[];
}

export interface PointsResponse {
  properties?: {
    forecast?: string;
  };
}

export interface ForecastResponse {
  properties?: {
    periods?: ForecastPeriod[];
  };
}

export type NWSError =
  | { kind: "http"; status: number }
  | { kind: "timeout" }
  | { kind: "network" };

export type NWSResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: NWSError };
