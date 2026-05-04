import * as cheerio from "cheerio";

/* -----------------------------
   CONFIG
----------------------------- */

export const STATE_HTML_PAGES = {
  S03: 7,
  S11: 7,
  S22: 12,
  S25: 15,
  U07: 2,
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Referer": "https://results.eci.gov.in/ResultAcGenMay2026/index.htm",
  "Origin": "https://results.eci.gov.in",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "Sec-CH-UA": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
  "Connection": "keep-alive",
};

/* -----------------------------
   PARTY NORMALIZATION
----------------------------- */

const PARTY_NORMALIZATION = {
  // Kerala - LDF
  "Communist Party of India (Marxist)": "CPI(M)",
  "CPI(M)": "CPI(M)",
  "CPM": "CPM",
  "Communist Party of India": "CPI",
  "CPI": "CPI",
  "Nationalist Congress Party": "NCP",
  "NCP": "NCP",
  "Kerala Congress (M)": "KC(M)",
  "Kerala Congress (Mani)": "KC(M)",
  "KC(M)": "KC(M)",
  "KC-M": "KC-M",
  "Janata Dal (Secular)": "JD(S)",
  "JD(S)": "JD(S)",
  "Revolutionary Socialist Party": "RSP",
  "RSP": "RSP",
  "Forward Bloc": "FB",
  "FB": "FB",
  "Lok Janashakti Dal": "LJD",
  "LJD": "LJD",
  "Revolutionary Marxist Party of India": "RMP",
  "RMPI": "RMP",
  "RMP": "RMP",
  "Revolutionary Marxist Party of India (Leninist)": "RMPOI",
  "RMPOI": "RMPOI",
  "Indian Socialist Janata Dal": "ISJD",
  "ISJD": "ISJD",
  "Communist Marxist Party": "CMC",
  "CMC": "CMC",
  "CMPKSC": "CMPKSC",
  "KEC": "KEC",
  "KEC(M)": "KEC(M)",
  "KEC(J)": "KEC(J)",
  "Kerala Congress": "KC",

  // Kerala - UDF
  "Indian National Congress": "INC",
  "INC": "INC",
  "Indian Union Muslim League": "IUML",
  "IUML": "IUML",

  // Kerala / national - NDA
  "Bharatiya Janata Party": "BJP",
  "BJP": "BJP",
  "BDJS": "BDJS",
  "GHSS": "GHSS",

  // West Bengal
  "All India Trinamool Congress": "AITC",
  "AITC": "AITC",
  "TMC": "AITC",
  "All India Forward Bloc": "AIFB",
  "AIFB": "AIFB",
  "Revolutionary Socialist Party of India": "RSPI",

  // Tamil Nadu
  "Dravida Munnetra Kazhagam": "DMK",
  "DMK": "DMK",
  "All India Anna Dravida Munnetra Kazhagam": "AIADMK",
  "AIADMK": "AIADMK",
  "Pattali Makkal Katchi": "PMK",
  "PMK": "PMK",
  "Marumalarchi Dravida Munnetra Kazhagam": "MDMK",
  "MDMK": "MDMK",
  "Viduthalai Chiruthaigal Katchi": "VCK",
  "VCK": "VCK",
  "Tamilaga Vettri Kazhagam": "TVK",
  "TVK": "TVK",
  "Tamil Maanila Congress": "TMC(M)",
  "TMC(M)": "TMC(M)",
  "Communist Party of India (Marxist-Leninist) Liberation": "CPI(ML)",
  "CPI(ML)": "CPI(ML)",
  "AMMK": "AMMK",
  "NTK": "NTK",

  // Assam
  "Asom Gana Parishad": "AGP",
  "AGP": "AGP",
  "United People's Party Liberal": "UPPL",
  "UPPL": "UPPL",
  "Bodoland People's Front": "BPF",
  "BPF": "BPF",
  "All India United Democratic Front": "AIUDF",
  "AIUDF": "AIUDF",
  "Raijor Dal": "RD",
  "RD": "RD",

  // Puducherry
  "All India N.R. Congress": "AINRC",
  "AINRC": "AINRC",
  "Dravida Munnetra Kazhagam Pondicherry": "DMK",
};

/* -----------------------------
   HELPERS
----------------------------- */

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeParty(name = "") {
  const cleaned = clean(name)
    .replace(/iParty.*$/i, "")
    .replace(/Party Wise.*$/i, "")
    .trim();

  return PARTY_NORMALIZATION[cleaned] || cleaned;
}

/* -----------------------------
   FETCHERS
----------------------------- */

async function fetchECIJson() {
  const url = `https://results.eci.gov.in/ResultAcGenMay2026/election-json-S25-live.json`;

  const res = await fetch(url, { headers: HEADERS });

  if (!res.ok) throw new Error(`JSON fetch failed: ${res.status}`);

  return res.json();
}

async function fetchHtmlPage(stateCode, pageNum) {
  const url = `https://results.eci.gov.in/ResultAcGenMay2026/statewise${stateCode}${pageNum}.htm`;

  const res = await fetch(url, { headers: HEADERS });

  if (!res.ok) throw new Error(`HTML page ${stateCode}/${pageNum} failed: ${res.status}`);

  return res.text();
}

/* -----------------------------
   HTML PARSER (CHEERIO)
----------------------------- */

function parseHtml(html, pageNum) {
  const $ = cheerio.load(html);
  const results = {};

  $("table tr").each((_, row) => {
    const cols = $(row).find("td");
    if (cols.length !== 31) return;

    const acNo = Number(clean($(cols[1]).text()));

    results[acNo] = {
      id: String(acNo),
      constituencyNo: acNo,
      constituency: clean($(cols[0]).text()),
      leadingCandidate: clean($(cols[2]).text()),
      leadingParty: normalizeParty($(cols[4]).text()),
      trailingCandidate: clean($(cols[15]).text()),
      trailingParty: normalizeParty($(cols[17]).text()),
      margin: Number(clean($(cols[28]).text()).replace(/,/g, "")),
      round: clean($(cols[29]).text()),
      status: clean($(cols[30]).text()),
      sourcePage: pageNum,
    };
  });

  return results;
}

/* -----------------------------
   MERGE
----------------------------- */

function mergeData(eciJson, htmlResults, stateCode) {
  const stateData = eciJson[stateCode];

  if (!stateData?.chartData) {
    throw new Error(`chartData missing for state ${stateCode}`);
  }

  const constituencies = stateData.chartData
    .map(row => {
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
    })
    .filter(Boolean);

  return {
    updatedAt: new Date().toISOString(),
    constituencies,
  };
}

/* -----------------------------
   MAIN EXPORTS
----------------------------- */

export async function getResults(stateCode, eciJson = null) {
  if (!eciJson) eciJson = await fetchECIJson();

  const htmlResults = {};
  const totalPages = STATE_HTML_PAGES[stateCode] || 1;

  for (let i = 1; i <= totalPages; i++) {
    const html = await fetchHtmlPage(stateCode, i);
    Object.assign(htmlResults, parseHtml(html, i));
  }

  return mergeData(eciJson, htmlResults, stateCode);
}

export async function getAllResults() {
  const eciJson = await fetchECIJson();
  const results = {};

  for (const stateCode of Object.keys(STATE_HTML_PAGES)) {
    results[stateCode] = await getResults(stateCode, eciJson);
  }

  return results;
}
