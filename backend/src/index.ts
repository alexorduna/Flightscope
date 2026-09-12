import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { isSerpApiEnabled } from "./services/serpapi";

const PORT = Number(process.env.PORT) || 4000;

const app = createApp();

app.listen(PORT, () => {
  const mode = isSerpApiEnabled() ? "real SerpApi data (google_flights)" : "MOCK data (SERPAPI_KEY not configured)";
  console.log(`FlightScope backend listening on http://localhost:${PORT}`);
  console.log(`Active data source: ${mode}`);
});
