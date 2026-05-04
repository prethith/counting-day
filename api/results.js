import { STATE_HTML_PAGES } from "../lib/scraper.js";

const GIST_URL = "https://gist.githubusercontent.com/prethith/f1a144a3d8837f25029e2921bbf37e80/raw/results.json";

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const stateCode = req.query.state;

    if (!stateCode || !STATE_HTML_PAGES[stateCode]) {
      return res.status(400).json({
        error: `Invalid or missing ?state= param. Valid: ${Object.keys(STATE_HTML_PAGES).join(", ")}`,
      });
    }

    const gistRes = await fetch(GIST_URL, { cache: "no-store" });

    if (!gistRes.ok) throw new Error(`Gist fetch failed: ${gistRes.status}`);

    const all = await gistRes.json();
    const stateData = all[stateCode];

    if (!stateData) throw new Error(`No data for state ${stateCode}`);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(stateData);

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
