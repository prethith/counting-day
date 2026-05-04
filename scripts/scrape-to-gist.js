import { getAllResults } from "../lib/scraper.js";

const { GH_TOKEN, GIST_ID } = process.env;

if (!GH_TOKEN || !GIST_ID) {
  console.error("Missing GH_TOKEN or GIST_ID");
  process.exit(1);
}

const results = await getAllResults();

const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${GH_TOKEN}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
  body: JSON.stringify({
    files: {
      "results.json": {
        content: JSON.stringify(results),
      },
    },
  }),
});

if (!res.ok) {
  const text = await res.text();
  console.error("Gist update failed:", res.status, text);
  process.exit(1);
}

const firstState = Object.keys(results)[0];
console.log("Gist updated at", results[firstState].updatedAt);
console.log("States:", Object.keys(results).join(", "));
