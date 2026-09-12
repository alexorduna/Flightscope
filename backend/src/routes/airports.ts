import { Router } from "express";
import { searchAirports } from "../data/airports";

export const airportsRouter = Router();

/** GET /api/airports?query=mon  -> filtered list for the autocomplete. */
airportsRouter.get("/", (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query : "";
  res.json(searchAirports(query));
});
