# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Real-time grid frequency dashboard: an Angular 22 frontend and a .NET backend that pushes simulated frequency data over SignalR.

The repo is at an early stage. `frontend/` is the freshly generated Angular app skeleton (no feature code yet). `api/` exists but is still empty, so the .NET project and the SignalR hub have not been created.

## Frontend commands

Run from `frontend/` (npm 11, Vitest via the Angular builder, Tailwind CSS v4 through PostCSS):

- `npm start` — dev server (`ng serve`)
- `npm run build` — production build
- `npm run watch` — development build in watch mode
- `npm test` — unit tests (`ng test`, Vitest + jsdom)
- `npx ng test --include src/app/app.spec.ts` — run a single spec file

There is no lint script configured; formatting is Prettier (`frontend/.prettierrc`).

## Conventions

`frontend/CLAUDE.md` holds the Angular/TypeScript rules for this project and applies to all frontend work. Read it before writing frontend code. Several rules differ from older Angular habits, because they target v22:

- No `standalone: true` and no explicit `OnPush`, since both are defaults.
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})`.
- Prefer Signal Forms (`@angular/forms/signals`).
- Use signals, `input()`/`output()`, native control flow and `inject()`.
- Output must pass AXE checks and WCAG AA.

`.mcp.json` (repo root, so it loads when Claude Code starts here) registers the Angular CLI MCP server (`npx @angular/cli mcp`) for Angular docs and tooling.
