# grid-frequency-dashboard

Real-time dashboard for the grid frequency of the Nordic synchronous area (nominal 50 Hz), built with Angular 22 and .NET 10, using SignalR.

> **The data is simulated.** The backend generates a mean-reverting random walk around 50 Hz, and you can trigger a disturbance (sudden generation loss, down to about 49.4 Hz) from the UI. No real grid data is used.

## Structure

| Folder | What |
| --- | --- |
| `frontend/` | Angular 22 app (signals, Signal Forms, `httpResource`, Tailwind CSS, Vitest) |
| `backend/GridFrequency.Api/` | .NET 10 minimal API: simulator, SignalR hub, history endpoint |
| `backend/GridFrequency.Api.Tests/` | xUnit tests |
| `aspire/` | Aspire AppHost and ServiceDefaults (optional, for running everything together) |

## Run it

Prerequisites: .NET 10 SDK, Node.js and pnpm.

### Option 1: Aspire (everything in one command)

Needs the [Aspire CLI](https://aspire.dev/get-started/install-cli/) (13.x) and a trusted dev certificate (`dotnet dev-certs https --trust`).

```bash
pnpm --dir frontend install
aspire run
```

The Aspire dashboard (logs, traces, metrics) opens, starts the API, then the Angular app. Open the `frontend` link in the dashboard.

### Option 2: Backend and frontend separately

```bash
# terminal 1
dotnet run --project backend/GridFrequency.Api --launch-profile http   # http://localhost:5121

# terminal 2
cd frontend
pnpm install
pnpm start                                                             # http://localhost:4200
```

`frontend/proxy.conf.js` forwards `/api` and `/hubs` (WebSocket) to the backend. Without Aspire it falls back to `http://localhost:5121`.

## Tests and builds

```bash
dotnet build && dotnet test
cd frontend && pnpm build && pnpm exec ng test --watch=false
```

## API

- `GET /api/history?minutes=N` returns the samples of the last N minutes (1–15) from the in-memory buffer.
- `POST /api/disturbance` triggers a disturbance.
- SignalR hub at `/hubs/frequency`: the server pushes a `sample` message every 500 ms.

## Design notes

