# FlightScope

Flight search and comparison tool for routes between Mexico and the United
States. Final project for **IS312 - Web Design and Programming** (City
University of Seattle / CETYS).

Team: Alexander Orduña, Jesse Banda, Gabriel Pereira.

## Architecture

Monorepo using **npm workspaces**: a single root `package.json` declares
`frontend/` and `backend/` as workspaces, so one `npm install` at the root
installs both, and one `npm run dev` starts both servers together (via
`concurrently`).

```
Final/
├── backend/   Express + TypeScript (API, cache, mock data, SerpApi integration)
└── frontend/  React + Vite + TypeScript (UI)
```

There is no database and no disk persistence of any kind. All state lives in
memory:

- **Frontend**: `React state` (`useState`/`useReducer` hooks). Refreshing the
  page loses everything (current search, filters, price alerts created).
- **Backend**: an in-memory `Map` acting as a cache of search results.
  Restarting the backend process clears the cache.

### Search request flow

```
User searches MTY -> TIJ, 2026-10-01
        │
        ▼
GET /api/flights/search?origin=MTY&destination=TIJ&date=2026-10-01
        │
        ▼
Is it in the in-memory cache (same origin/destination/date combo)?
   │ yes                                  │ no
   ▼                                      ▼
returns cached data (cached:true)  Is SERPAPI_KEY configured?
                                       │ yes                   │ no
                                       ▼                       ▼
                              tries SerpApi              uses MOCK data
                              (8s timeout)                (source:"mock")
                                │ ok        │ fails
                                ▼           ▼
                        source:"live"   uses MOCK data + warning
                                            (source:"mock")
                                       │
                                       ▼
                              stores in cache and responds to the frontend
```

Every response from `/api/flights/search` and `/api/flights/price-insights`
includes a **`source: "live" | "mock"`** field (and an optional `warning` when
SerpApi failed) so the UI is transparent about where the data came from - it's
shown visibly in the results section.

### SerpApi integration (`google_flights` engine)

The integration code for [SerpApi](https://serpapi.com/google-flights-api) is
**complete and functional** in `backend/src/services/serpapi.ts`, but it stays
**inactive** as long as the `SERPAPI_KEY` environment variable doesn't exist:

1. Copy `backend/.env.example` to `backend/.env`.
2. Add your key: `SERPAPI_KEY=your_key_here`.
3. Restart the backend (`npm run dev`).

No code change is needed to activate it - `isSerpApiEnabled()` is the single
point of control and it's checked at runtime.

Explicit failure handling (everything falls back to mock without crashing the app):

| Situation                          | Handling                                              |
| ----------------------------------- | ------------------------------------------------------ |
| No `SERPAPI_KEY`                    | Mock is used directly, without attempting the real API. |
| Timeout (>8s)                       | `SerpApiTimeoutError` -> mock fallback + warning.       |
| Network error                       | `SerpApiNetworkError` -> mock fallback + warning.       |
| Quota exhausted (HTTP 429 / message)| `SerpApiQuotaError` -> mock fallback + warning.         |
| Unexpected response / invalid JSON  | `SerpApiUnexpectedResponseError` -> mock fallback + warning. |

The in-memory cache (`backend/src/services/cache.ts`, TTL configurable via
`CACHE_TTL_MINUTES`) avoids repeating SerpApi calls for the same search, to
help stay within the 250 searches/month of the free tier once it's active.

### Mock data

`backend/src/data/mockFlights.ts` defines 4 hand-curated routes with
realistic data (airlines, schedules, prices in MXN):

- **MTY ↔ TIJ** (reference route): Aeromexico, Viva Aerobus, Volaris — prices between $3,190 and $3,990 MXN.
- MEX ↔ CUN
- GDL ↔ LAX
- MEX ↔ JFK

Any other airport pair (out of the ~20 available in the autocomplete) falls
back to a deterministic generator (the same origin+destination+date always
produces the same result) so the demo never looks limited to a single route.

## How to run the project

```bash
npm install        # installs both frontend and backend in one shot
npm run dev         # starts the backend (port 4000) and the frontend (port 5173)
```

Open http://localhost:5173. The frontend proxies `/api/*` to the backend in
development (configured in `frontend/vite.config.ts`).

### Environment variables

Copy `backend/.env.example` to `backend/.env` if you want to adjust the port,
the CORS origin, the cache TTL, or activate SerpApi. **This is not required to
run the project** - without a `.env` file, everything works with mock data.

### Testing

```bash
npm run test         # backend unit tests (vitest) and frontend unit tests (vitest + RTL)
npm run test:e2e      # Playwright e2e tests (automatically starts frontend + backend, forced to mock mode)
```

## What's done, what's a prototype, and what's still pending

This distinction is exactly what the course's final report asks for:

### ✅ Fully done and functional

- Express backend with in-memory caching, a robust mock fallback, and
  explicit error handling.
- The 4 data models (`Flight`, `Itinerary`, `Airport`, `PriceAlert`) with
  strict TypeScript typing, no `any`.
- Flight search with an accessible airport autocomplete.
- Filtering (stops, max price, airline) and sorting (price, duration, stops)
  of results, with unit tests.
- Loading, error, and "no results" states across the whole UI, announced to
  screen readers (`aria-live`, `role="alert"`, `role="status"`).
- Price alert toggle (in-memory UI simulation).
- Mobile-first responsive design with its own visual identity.
- Unit tests (Vitest + React Testing Library) for the main components and the
  filtering/sorting logic.
- Basic end-to-end tests with Playwright (search, filters, responsive),
  forced to run against mock data for determinism.

### 🧪 Prototype / simulation (it works, but is intentionally limited)

- **Price alerts**: only in-memory UI state. There's no backend behind it, no
  real notifications are sent (email, push, etc.), and they're lost on page
  refresh. This was a scope decision, not a technical limitation.
- **Price trend view**: when SerpApi is inactive (the default case), or when
  it doesn't return price insights for a given query, the price history is
  generated with a deterministic algorithm, not a real market history.
- **Time zones**: mock flight times are treated as if they were UTC for
  simplicity; there's no real per-airport time zone database.

### ⏳ Pending to connect

- **Real SerpApi API**: the integration code is complete
  (`backend/src/services/serpapi.ts`), but it requires the end user to add
  their own `SERPAPI_KEY` to `backend/.env` (not included in the repository
  for security). Without that key, the project still runs fully, using the
  mock fallback described above.

## Accessibility

- Every form control has a `<label>` explicitly associated with it.
- The airport autocomplete follows the ARIA combobox pattern (arrow-key
  navigation, `aria-expanded`, `aria-activedescendant`, selection with Enter,
  closes with Escape).
- Loading/error states are announced with `aria-live="polite"`,
  `role="status"`, and `role="alert"` as appropriate.
- The price trend chart (SVG) includes an equivalent text summary for screen
  readers.
- High-contrast palette (light text on a dark background) and visible
  keyboard focus on every interactive element.
