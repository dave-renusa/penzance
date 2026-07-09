// Fetches data from the 1500 Gateway Google Sheet and writes data/1500-gateway.json.
// Run via: node scripts/sync-sheets.js
// Required env vars: GOOGLE_SERVICE_ACCOUNT_JSON, SHEET_ID

const SHEET_ID = process.env.SHEET_ID || "147Tl2ahMg0-sGrkKKQtk0f_tuy2AXba3fu7VH9WZD9Q";

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  console.error("GOOGLE_SERVICE_ACCOUNT_JSON env var is required");
  process.exit(1);
}
const serviceAccount = JSON.parse(serviceAccountJson);

// Get a short-lived OAuth2 access token using the service account private key
async function getAccessToken() {
  const { createSign } = await import("crypto");
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");
  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(serviceAccount.private_key, "base64url");
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

// Tab names in the Google Sheet — update these to match your actual tab names
const TABS = {
  kpis: "KPI Targets",
  highlights: "Activity Log",
  phone: "Activity Log",
  digital: "Activity Log",
  decisionMakers: "Decision Makers",
  sentiment: "Sentiment Trend",
  coalition: "Coalition",
  risks: "Risks",
  calendar: "Upcoming Events",
  mediaActivity: "Earned Media Activity",
};

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchTab(tabName, token, attempts = 4) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tabName)}`;
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let retryable = true; // network/fetch errors are transient — retry them
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.values || [];
      }
      const text = await res.text();
      // A renamed/deleted tab returns 400 "Unable to parse range". Don't fail the
      // whole sync over one missing tab — log it and treat the tab as empty.
      if (res.status === 400 && /unable to parse range/i.test(text)) {
        console.warn(`  ⚠ tab "${tabName}" not found in the sheet — skipping (treated as empty)`);
        return [];
      }
      // Fail fast on other non-transient responses like 403/404; retry 429/5xx
      retryable = RETRYABLE_STATUS.has(res.status);
      lastErr = new Error(`Failed to fetch tab "${tabName}": ${res.status} ${text}`);
    } catch (err) {
      lastErr = err;
    }
    if (!retryable || attempt === attempts) break;
    const backoff = 500 * 2 ** (attempt - 1); // 0.5s, 1s, 2s
    console.warn(`  ⚠ tab "${tabName}" attempt ${attempt}/${attempts} failed, retrying in ${backoff}ms…`);
    await sleep(backoff);
  }
  throw lastErr;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  // Skip title/description rows — find the first row with 3+ non-empty cells as the header
  const headerIdx = rows.findIndex((r) => r.filter(Boolean).length >= 3);
  if (headerIdx === -1) return [];
  const headers = rows[headerIdx];
  const data = rows.slice(headerIdx + 1);
  return data
    .filter((r) => r.some(Boolean))
    .map((row) =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), (row[i] || "").trim()]))
    );
}

// The "Earned Media Activity" tab has repeating headers (two "Contact Type",
// "Note"/"Notes"), so parse it positionally instead of by header name:
// Date | Outlet | Reporter | Contact Type | Note | Contact Date | Contact Type | Notes
function parseMediaActivity(rows) {
  if (!rows.length) return [];
  const headerIdx = rows.findIndex((r) => r.filter(Boolean).length >= 3);
  if (headerIdx === -1) return [];
  return rows
    .slice(headerIdx + 1)
    .filter((r) => (r[1] || "").trim()) // must have an outlet
    .map((r) => {
      const cell = (i) => (r[i] || "").trim();
      const note = cell(4);
      const followUpNote = cell(7);
      const text = `${note} ${followUpNote}`.toLowerCase();
      let status = { key: "exploring", label: "Exploring" };
      if (/respond|provided answ|setting meeting|\bmeeting\b|answered|interview/.test(text)) {
        status = { key: "engaged", label: "Engaged" };
      } else if (/no response|left vm|voicemail|waiting/.test(text)) {
        status = { key: "pending", label: "Awaiting reply" };
      }
      return {
        outlet: cell(1),
        reporter: cell(2),
        date: cell(5) || cell(0), // most recent contact date
        channel: cell(6) || cell(3), // most recent contact type
        note: followUpNote || note,
        status,
      };
    });
}

async function main() {
  console.log("Fetching tabs from Google Sheets…");
  const token = await getAccessToken();

  const [
    kpiRows,
    highlightRows,
    phoneRows,
    digitalRows,
    dmRows,
    sentimentRows,
    coalitionRows,
    riskRows,
    calRows,
    mediaActivityRows,
  ] = await Promise.all([
    fetchTab(TABS.kpis, token),
    fetchTab(TABS.highlights, token),
    fetchTab(TABS.phone, token),
    fetchTab(TABS.digital, token),
    fetchTab(TABS.decisionMakers, token),
    fetchTab(TABS.sentiment, token),
    fetchTab(TABS.coalition, token),
    fetchTab(TABS.risks, token),
    fetchTab(TABS.calendar, token),
    fetchTab(TABS.mediaActivity, token),
  ]);

  const kpisRaw = rowsToObjects(kpiRows);
  const highlightsRaw = rowsToObjects(highlightRows);
  const phoneRaw = rowsToObjects(phoneRows);
  const digitalRaw = rowsToObjects(digitalRows);
  const decisionMakersRaw = rowsToObjects(dmRows);
  const sentimentRaw = rowsToObjects(sentimentRows);
  const coalitionRaw = rowsToObjects(coalitionRows);
  const risksRaw = rowsToObjects(riskRows);
  const calendarRaw = rowsToObjects(calRows);
  const mediaActivity = parseMediaActivity(mediaActivityRows);

  // ── Transform each section to the shape the dashboard expects ──

  const kpiAccents = {
    "Stakeholders Mapped": "#2563eb",
    "Net Sentiment %": "#0f766e",
    "Decision-Maker Touches": "#d97706",
    "Coalition Validators": "#16a34a",
    "Active Risk Items": "#dc2626",
  };

  const kpis = kpisRaw.map((r) => {
    const label = r["KPI"] || "";
    const value = r["Current Value"] || "";
    const target = r["Target"] || "";
    const status = r["Status"] || "";
    const targetNum = parseFloat(target.replace(/[^0-9.]/g, "")) || 0;
    const valueNum = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    const progress = targetNum > 0 ? Math.min(100, Math.round((valueNum / targetNum) * 100)) : 0;
    return { label, value, target: `Target ${target}`, status, accent: kpiAccents[label] || "#2563eb", progress };
  });

  // Activity Log: group by Type for highlights; count unique types for digital metrics
  const activityTypes = [...new Set(highlightsRaw.map((r) => r["Type"]).filter(Boolean))];
  const weeklyHighlights = activityTypes.map((type, i) => {
    const rows = highlightsRaw.filter((r) => r["Type"] === type);
    const colors = ["#2563eb", "#7c3aed", "#0891b2", "#c2410c", "#16a34a", "#d97706"];
    return {
      label: type,
      value: String(rows.length),
      detail: rows.map((r) => r["Stakeholder/Target"] || r["Notes"]).filter(Boolean).slice(0, 2).join("; ") || "",
      color: colors[i % colors.length],
    };
  });

  // patchStats and patchOffices not in this sheet — keep empty
  const patchStats = [];
  const patchOffices = [];
  const digitalMetrics = [];

  const decisionMakers = decisionMakersRaw.map((r) => ({
    initials: r["Initials"] || "",
    name: r["Name"] || "",
    role: r["Role"] || r["District/Body"] || "",
    position: r["Position"] || "",
    touches: Number(r["Meetings Held"] || 0),
    influence: r["District/Body"] || "",
    note: r["Key Concerns / Notes"] || "",
  }));

  // Sentiment: use the most recent week's row
  const latestSentiment = sentimentRaw[sentimentRaw.length - 1] || {};
  const sentimentTotal = Number(latestSentiment["Total Mapped"] || 0);
  const sentiment = [
    { label: "Support", value: Number(latestSentiment["Support"] || 0) + Number(latestSentiment["Lean Support"] || 0), color: "#16a34a" },
    { label: "Neutral", value: Number(latestSentiment["Neutral"] || 0), color: "#d97706" },
    { label: "Oppose", value: Number(latestSentiment["Oppose"] || 0) + Number(latestSentiment["Lean Oppose"] || 0), color: "#dc2626" },
  ];

  // Coalition: count by Status
  const coalitionSecured = coalitionRaw.filter((r) => (r["Status"] || "").toLowerCase().includes("secur")).length;
  const coalitionOrgs = coalitionRaw.filter((r) => r["Type"] === "Organization").length;
  const coalitionAdvocates = coalitionRaw.filter((r) => r["Type"] === "Individual").length;
  const coalition = [
    { label: "Willing advocates", value: coalitionAdvocates, color: "#2563eb" },
    { label: "Supportive organizations", value: coalitionOrgs, color: "#0f766e" },
    { label: "Secured validators", value: coalitionSecured, color: "#9333ea" },
  ];

  const risks = risksRaw
    .filter((r) => (r["Status"] || "").toLowerCase() === "active")
    .map((r) => ({
      severity: r["Severity"] || "",
      title: r["Title"] || "",
      description: r["Description"] || "",
      mitigation: r["Mitigation Plan"] || "",
    }));

  const events = calendarRaw.map((r) => ({
    date: r["Date"] || "",
    title: r["Event"] || "",
    type: r["Type"] || "",
    detail: r["Status / Detail"] || "",
  }));

  // ── Status header metadata (pulled from KPIs sheet row 0 or a meta tab) ──
  const meta = kpisRaw[0] || {};

  const output = {
    syncedAt: new Date().toISOString(),
    status: {
      lastSync: meta.lastSync || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      outlook: meta.outlook || "Watch",
      nextMilestone: meta.nextMilestone || "",
    },
    kpis,
    weeklyHighlights,
    patchStats,
    patchOffices,
    digitalMetrics,
    decisionMakers,
    sentiment,
    coalition,
    risks,
    events,
    mediaActivity,
  };

  const fs = await import("fs");
  const path = await import("path");
  const outPath = path.join(process.cwd(), "data", "1500-gateway.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`✓ Written ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
