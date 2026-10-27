# v1 Plan: Weather MCP server with modular structure

**Status:** Approved (2026-10-27)
**Branch:** `feature/weather-server`
**Source:** [Build an MCP server](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server) (TypeScript section)

## Goal

Implement the weather MCP server from the official tutorial, split into modules instead of a single file. Logic and response texts stay identical to the tutorial; only the code layout changes.

## Target structure

```
src/
├── index.ts                     # Entry point: serveStdio(createServer)
├── server.ts                    # createServer(): McpServer + registerTool × 2
├── config.ts                    # NWS_API_BASE, USER_AGENT
├── types.ts                     # NWS API interfaces
├── schemas.ts                   # Zod input schemas + inferred input types
├── helpers/
│   ├── nws-client.ts            # makeNWSRequest<T>()
│   ├── formatters.ts            # formatAlert(), formatForecastPeriod()
│   └── tool-result.ts           # textResult()
└── controllers/
    ├── alerts.controller.ts     # getAlerts()
    └── forecast.controller.ts   # getForecast()
```

## Steps

1. Create branch `feature/weather-server` from `main`.
2. `config.ts`: export `NWS_API_BASE` and `USER_AGENT`.
3. `types.ts`: move interfaces `AlertFeature`, `ForecastPeriod`, `AlertsResponse`, `PointsResponse`, `ForecastResponse`.
4. `schemas.ts`:
   - `alertsInputSchema` (`state`) and `forecastInputSchema` (`latitude`, `longitude`);
   - `AlertsInput` and `ForecastInput` types via `z.infer` (kept next to the schemas they derive from, not in `types.ts`).
5. `helpers/nws-client.ts`: move `makeNWSRequest<T>()`, importing constants from `config.ts`.
6. `helpers/formatters.ts`:
   - move `formatAlert()`;
   - extract the inline forecast period formatting from `.map()` into `formatForecastPeriod()`.
7. `helpers/tool-result.ts`: `textResult(text): CallToolResult` returning `{ content: [{ type: "text", text }] }` (`CallToolResult` is exported by `@modelcontextprotocol/server`).
8. `controllers/alerts.controller.ts`: `getAlerts({ state }: AlertsInput): Promise<CallToolResult>` with the `get_alerts` handler logic.
9. `controllers/forecast.controller.ts`: `getForecast({ latitude, longitude }: ForecastInput): Promise<CallToolResult>` with the `get_forecast` handler logic.
10. `server.ts`: `createServer()` registers both tools; tool descriptions stay here, schemas and controllers are imported.
11. `index.ts`: only `serveStdio(createServer, { onerror })` and the startup `console.error`.
12. Use `.js` extensions in all relative imports (required by `"moduleResolution": "Node16"`).
13. README: update "Project structure" and remove the "Once the server is implemented" wording.
14. Verification:
    - `npm run build` via Git Bash (`chmod` is available there);
    - `npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/list` with `--protocol-era modern`, then `legacy`; both must list `get_alerts` and `get_forecast`.

Committing is out of scope of this plan and happens on explicit request.

## Decision log

- Additional layers beyond types/helpers/controllers: `config.ts`, `server.ts` separate from `index.ts`, separate Zod schemas, `textResult()` helper.
- Helpers are grouped by purpose (`nws-client`, `formatters`, `tool-result`), not one function per file.
- Controller file naming: `<name>.controller.ts`.
- Branch name: `feature/weather-server`.
- Plan is stored in `docs/plans/`; running the MCP Inspector via `npx` is allowed.
