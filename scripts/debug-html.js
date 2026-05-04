import * as cheerio from "cheerio";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,*/*",
  "Accept-Language": "en-IN,en;q=0.9",
  "Referer": "https://results.eci.gov.in/ResultAcGenMay2026/index.htm",
};

const STATE = process.argv[2] || "S11";
const PAGE  = process.argv[3] || "1";

const url = `https://results.eci.gov.in/ResultAcGenMay2026/statewise${STATE}${PAGE}.htm`;
console.log("Fetching:", url);

const res = await fetch(url, { headers: HEADERS });
console.log("Status:", res.status);

const html = await res.text();
const $ = cheerio.load(html);

let rowCount = 0;
const colCounts = {};

$("table tr").each((i, row) => {
  const cols = $(row).find("td");
  const n = cols.length;
  colCounts[n] = (colCounts[n] ?? 0) + 1;

  if (i < 5 && n > 0) {
    console.log(`\nRow ${i} (${n} cols):`);
    cols.each((j, td) => console.log(`  [${j}]: ${$(td).text().replace(/\s+/g, " ").trim().slice(0, 60)}`));
  }
  rowCount++;
});

console.log("\nTotal rows:", rowCount);
console.log("Column count distribution:", colCounts);
