import { getResults } from "../lib/scraper.js";

let cache = null;
let lastFetch = 0;
const CACHE_TTL = 30 * 1000; // 30s cache

export default async function handler(req, res) {
  try {
    // -----------------------------
    // ✅ CORS (required for local dev)
    // -----------------------------
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const now = Date.now();

    // -----------------------------
    // ⚡ Cache layer (prevents re-scraping)
    // -----------------------------
    if (!cache || now - lastFetch > CACHE_TTL) {
      cache = await getResults();
      lastFetch = now;
    }

    // -----------------------------
    // Response headers
    // -----------------------------
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(cache);

  } catch (err) {
    console.error("API Error:", err);

    return res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  }
}