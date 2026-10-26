# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Real-time grid frequency dashboard: an Angular 22 frontend and a .NET 10 backend that pushes simulated frequency data over SignalR.

- `frontend/` — the Angular app.
- `backend/GridFrequency.Api` — minimal API: `FrequencySimulator` (pure logic), `SimulationWorker` (pushes a sample every 500 ms via `IHubContext<FrequencyHub>`), `SampleBuffer`, `/api/history`, `/api/disturbance`.
- `backend/GridFrequency.Api.Tests` — xUnit tests.
- `aspire/` — Aspire AppHost and ServiceDefaults. The solution file `GridFrequency.slnx` is at the repo root.

## Backend commands

Run from the repo root: `dotnet build`, `dotnet test`, `dotnet run --project backend/GridFrequency.Api --launch-profile http` (port 5121), `aspire run` (everything, needs the Aspire CLI). The AppHost SDK version must match the installed Aspire CLI version.

## Frontend commands

Run from `frontend/` (pnpm 12, Vitest via the Angular builder, Tailwind CSS v4 through PostCSS):

- `pnpm start` — dev server (`ng serve`)
- `pnpm build` — production build
- `pnpm watch` — development build in watch mode
- `pnpm test` — unit tests (`ng test`, Vitest + jsdom)
- `pnpm exec ng test --include src/app/app.spec.ts` — run a single spec file

There is no lint script configured; formatting is Prettier (`frontend/.prettierrc`).

`frontend/proxy.conf.js` proxies `/api` and `/hubs` to the API: `API_HTTPS`/`API_HTTP` (set by Aspire), else `http://localhost:5121`. The `start` script passes `PORT` to `ng serve --port` (default 4200).

Styling: design tokens live in `frontend/src/styles.css` (`@theme`) together with the shared `.btn`/`.field` classes. Use the tokens (`bg-panel`, `text-muted`, `text-ok`, ...) rather than raw Tailwind colors.

## Conventions

`frontend/CLAUDE.md` holds the Angular/TypeScript rules for this project and applies to all frontend work. Read it before writing frontend code. Several rules differ from older Angular habits, because they target v22:

- No `standalone: true` and no explicit `OnPush`, since both are defaults.
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})`.
- Prefer Signal Forms (`@angular/forms/signals`).
- Use signals, `input()`/`output()`, native control flow and `inject()`.
- Output must pass AXE checks and WCAG AA.

`.mcp.json` (repo root, so it loads when Claude Code starts here) registers the Angular CLI MCP server (`pnpm dlx @angular/cli mcp`) for Angular docs and tooling.
