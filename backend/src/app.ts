import express from "express";
import cors from "cors";
import { airportsRouter } from "./routes/airports";
import { flightsRouter } from "./routes/flights";
import { isSerpApiEnabled } from "./services/serpapi";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", serpApiEnabled: isSerpApiEnabled() });
  });

  app.use("/api/airports", airportsRouter);
  app.use("/api/flights", flightsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found." });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[app] unhandled error:", err);
    res.status(500).json({ error: "Internal server error." });
  });

  return app;
}
