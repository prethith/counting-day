import { JSDOM } from "jsdom";

/* -----------------------------
   CONFIG
----------------------------- */

const STATE_CODE = "S11";

const STATE_HTML_PAGES = {
  S03: 6,
  S11: 7,
  S22: 15,
  S25: 15,
  U07: 1,
};

const HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Accept: "text/html,application/json",
  Referer: "https://results.eci.gov.in/",
};

/* -----------------------------
   PARTY NORMALIZATION (STRICT)
   MUST MATCH partyAlliance KEYS
----------------------------- */

const PARTY_NORMALIZATION = {
  // Congress family
  "Indian National Congress": "INC",
  "INC": "INC",

  "Indian Union Muslim League": "IUML",
  "IUML": "IUML",

  // Kerala Congress family
  "Kerala Congress": "KC",
  "Kerala Congress (M)": "KC(M)",
  "Kerala Congress (Mani)": "KC(M)",
  "KC(M)": "KC(M)",
  "KC-M": "KC-M",

  "KEC": "KEC",
  "KEC(M)": "KEC(M)",
  "KEC(J)": "KEC(J)",

  // Left block (IMPORTANT: match your alliance keys exactly)
  "Communist Party of India (Marxist)": "CPI(M)",
  "CPI(M)": "CPI(M)",

  "CPM": "CPM",

  "Communist Party of India": "CPI",
  "CPI": "CPI",

  "Nationalist Congress Party": "NCP",
  "NCP": "NCP",

  "Revolutionary Socialist Party": "RSP",
  "RSP": "RSP",

  "Revolutionary Marxist Party of India": "RMP",
  "RMPI": "RMP",
  "RMP": "RMP",

  "Revolutionary Marxist Party of India (Leninist)": "RMPOI",
  "RMPOI": "RMPOI",

  "Janata Dal (Secular)": "JD(S)",
  "JD(S)": "JD(S)",

  "Forward Bloc": "FB",
  "FB": "FB",

  "Lok Janashakti Dal": "LJD",
  "LJD": "LJD",

  "Indian Socialist Janata Dal": "ISJD",
  "ISJD": "ISJD",

  "Communist Marxist Party": "CMC",
  "CMC": "CMC",

  "CMPKSC": "CMPKSC",

  // NDA
  "Bharatiya Janata Party": "BJP",
  "BJP": "BJP",

  "BDJS": "BDJS",
  "GHSS": "GHSS",
};

/* -----------------------------
   HELPERS
----------------------------- */

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeParty(name = "") {
  const cleaned = clean(name)
    .replace(/iParty.*$/i, "")        // removes ECI injected UI junk
    .replace(/Party Wise.*$/i, "")    // removes trend text
    .trim();

  return PARTY_NORMALIZATION[cleaned] || cleaned;
}

/* -----------------------------
   FETCHERS
----------------------------- */

async function fetchECIJson() {
  const url = `https://results.eci.gov.in/ResultAcGenMay2026/election-json-${STATE_CODE}-live.json`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`JSON fetch failed: ${res.status}`);

  return res.json();
}

async function fetchHtmlPage(pageNum) {
  const url = `https://results.eci.gov.in/ResultAcGenMay2026/statewise${STATE_CODE}${pageNum}.htm`;

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTML page ${pageNum} failed: ${res.status}`);

  return res.text();
}

/* -----------------------------
   HTML PARSER
----------------------------- */

function parseHtml(html, pageNum) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const rows = [...document.querySelectorAll("table tr")].filter(row => {
    const tds = [...row.children].filter(el => el.tagName === "TD");
    return tds.length === 9;
  });

  const results = {};

  rows.forEach(row => {
    const cols = [...row.children].filter(el => el.tagName === "TD");

    const acNo = Number(clean(cols[1].textContent));

    const leadingParty = normalizeParty(cols[3].textContent);
    const trailingParty = normalizeParty(cols[5].textContent);

    results[acNo] = {
      id: String(acNo),
      constituencyNo: acNo,

      constituency: clean(cols[0].textContent),

      leadingCandidate: clean(cols[2].textContent),
      leadingParty,

      trailingCandidate: clean(cols[4].textContent),
      trailingParty,

      margin: Number(clean(cols[6].textContent).replace(/,/g, "")),
      round: clean(cols[7].textContent),
      status: clean(cols[8].textContent),

      sourcePage: pageNum,
    };
  });

  return results;
}

/* -----------------------------
   MERGE WITH ECI JSON
----------------------------- */

function mergeData(eciJson, htmlResults) {
  const stateData = eciJson[STATE_CODE];

  if (!stateData?.chartData) {
    throw new Error("chartData missing from ECI JSON");
  }

  const constituencies = stateData.chartData.map(row => {
    const acNo = row[2];
    const extra = htmlResults[acNo];

    if (!extra) return null;

    return {
      id: String(acNo),
      constituencyNo: acNo,

      constituency: extra.constituency,

      leadingCandidate: extra.leadingCandidate,
      leadingParty: extra.leadingParty,

      trailingCandidate: extra.trailingCandidate,
      trailingParty: extra.trailingParty,

      margin: extra.margin,
      round: extra.round,
      status: extra.status,
    };
  }).filter(Boolean);

  return {
    updatedAt: new Date().toISOString(),
    constituencies,
  };
}

/* -----------------------------
   MAIN EXPORT (Vercel API)
----------------------------- */

export async function getResults() {
  const eciJson = await fetchECIJson();

  let htmlResults = {};

  const totalPages = STATE_HTML_PAGES[STATE_CODE] || 1;

  for (let i = 1; i <= totalPages; i++) {
    const html = await fetchHtmlPage(i);
    Object.assign(htmlResults, parseHtml(html, i));
  }

  return mergeData(eciJson, htmlResults);
}