# v2 Plan: Code review fixes

**Status:** Approved (2026-10-27)
**Branch:** `fix/code-review-findings`
**Based on:** code review of `src/` after v1 (see [v1-plan.md](v1-plan.md))

## Goal

Fix the confirmed code review findings in the weather MCP server. Finding 7 (contact info in `User-Agent`) is skipped by decision: NWS recommends but does not require it.

## Steps

1. Create branch `fix/code-review-findings` from `main`.
2. Save this plan to `docs/plans/v2-plan.md`.
3. **Finding 1, active alerts only.** In `alerts.controller.ts`, change the URL from `/alerts?area=` to `/alerts/active?area=`. Per NWS docs, `/alerts` returns alerts issued over the past seven days, while `/alerts/active` returns active alerts only.
4. **Finding 4, state code validation.** In `schemas.ts`, replace `.length(2)` with `.regex(/^[A-Za-z]{2}$/)`, keeping the description. `encodeURIComponent` is not needed because the value can only contain Latin letters.
5. **Finding 2, zero temperature.** In `formatters.ts`, use `??` instead of `||` for `period.temperature`. String fields keep `||` so an empty string is shown as "Unknown".
6. **Finding 3, error flag.** Add `errorResult(text): CallToolResult` to `helpers/tool-result.ts`, returning `{ content: [...], isError: true }`. Switch every failure branch in both controllers (4 today) to `errorResult`. "No active alerts" and "No forecast periods available" stay on `textResult`: they are empty results, not errors.
7. **Finding 5, timeout.**
   - Add `NWS_REQUEST_TIMEOUT_MS = 10_000` to `config.ts`.
   - Pass `signal: AbortSignal.timeout(NWS_REQUEST_TIMEOUT_MS)` to `fetch` in `nws-client.ts`.
8. **Finding 6, distinguish error kinds.**
   - Add to `types.ts`:
     ```ts
     type NWSError = { kind: "http"; status: number } | { kind: "timeout" } | { kind: "network" };
     type NWSResult<T> = { ok: true; data: T } | { ok: false; error: NWSError };
     ```
   - `makeNWSRequest<T>()` returns `NWSResult<T>` instead of `T | null`. An HTTP error gives `http` with the status, a timeout gives `timeout`, other failures (network, JSON parsing) give `network`. Logging to `console.error` is kept.
   - Add `describeNWSError(error): string` to `nws-client.ts`, e.g. "NWS API returned HTTP 503", "NWS API request timed out", "Network error while contacting NWS API".
   - In `forecast.controller.ts`, a failed `/points` request gives the "This location may not be supported… (only US locations are supported)" message only for HTTP 404. Other errors give "Failed to retrieve grid point data for coordinates: …: <error description>".
   - Other failure messages are extended with the error description, e.g. `Failed to retrieve alerts data: NWS API returned HTTP 503`.
9. **Finding 8, optional fields.** In `types.ts`, make `AlertsResponse.features`, `PointsResponse.properties`, `ForecastResponse.properties` and `ForecastResponse.properties.periods` optional. The controller guards stay and now match the types.
10. **Verification:**
    - `npm run build`;
    - Inspector `tools/list` with `--protocol-era modern` and `legacy`;
    - real calls through Inspector (`--method tools/call`) against the NWS API:
      - `get_alerts` with `state=CA` returns active alerts only, or "No active alerts";
      - `get_forecast` for Sacramento (`38.58, -121.49`) returns a forecast;
      - `get_forecast` for Moscow (`55.75, 37.62`) returns `isError: true` with the US-only message;
      - `get_alerts` with `state=#x` fails validation.

Commit and merge into `main` happen after verification.

## Decision log

- README changes from the previous step were committed to `main` separately before branching.
- Errors are marked with a separate `errorResult()` helper, not a boolean parameter on `textResult()`.
- Finding 7 (contact in `User-Agent`) is skipped.
- Response types are made optional to match the defensive guards, instead of removing the guards.
- Timeout: 10 seconds.
- Real requests to the NWS API during verification are allowed.
