import { getResults, STATE_HTML_PAGES } from "../lib/scraper.js";

const cache = {};
const lastFetch = {};
const CACHE_TTL = 30 * 1000;

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const stateCode = req.query.state;

    if (!stateCode || !STATE_HTML_PAGES[stateCode]) {
      return res.status(400).json({ error: `Invalid or missing ?state= param. Valid: ${Object.keys(STATE_HTML_PAGES).join(", ")}` });
    }

    const now = Date.now();

    if (!cache[stateCode] || now - (lastFetch[stateCode] ?? 0) > CACHE_TTL) {
      cache[stateCode] = await getResults(stateCode);
      lastFetch[stateCode] = now;
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(cache[stateCode]);

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
