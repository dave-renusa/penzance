// Fetches data from the 1500 Gateway Google Sheet and writes data/1500-gateway.json.
// Run via: node scripts/sync-sheets.js
// Required env vars: GOOGLE_API_KEY, SHEET_ID

const SHEET_ID = process.env.SHEET_ID || "17s3_qtgez3aceNSV29TMjjIgiNjSl-qA";
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("GOOGLE_API_KEY env var is required");
  process.exit(1);
}

// Tab names in the Google Sheet — update these to match your actual tab names
const TABS = {
  kpis: "KPIs",
  highlights: "Weekly Highlights",
  phone: "Phone Program",
  digital: "Digital Metrics",
  decisionMakers: "Decision Makers",
  sentiment: "Sentiment",
  coalition: "Coalition",
  risks: "Risks",
  calendar: "Calendar",
  media: "Media",
};

async function fetchTab(tabName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(tabName)}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch tab "${tabName}": ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.values || [];
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const [headers, ...data] = rows;
  return data
    .filter((r) => r.some(Boolean))
    .map((row) =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), (row[i] || "").trim()]))
    );
}

async function main() {
  console.log("Fetching tabs from Google Sheets…");

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
    mediaRows,
  ] = await Promise.all([
    fetchTab(TABS.kpis),
    fetchTab(TABS.highlights),
    fetchTab(TABS.phone),
    fetchTab(TABS.digital),
    fetchTab(TABS.decisionMakers),
    fetchTab(TABS.sentiment),
    fetchTab(TABS.coalition),
    fetchTab(TABS.risks),
    fetchTab(TABS.calendar),
    fetchTab(TABS.media),
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
  const mediaRaw = rowsToObjects(mediaRows);

  // ── Transform each section to the shape the dashboard expects ──

  const kpis = kpisRaw.map((r) => ({
    label: r.label || r.Label,
    value: r.value || r.Value,
    target: r.target || r.Target,
    status: r.status || r.Status,
    accent: r.accent || r.Accent || "#2563eb",
    progress: Number(r.progress || r.Progress || 0),
  }));

  const weeklyHighlights = highlightsRaw.map((r) => ({
    label: r.label || r.Label,
    value: r.value || r.Value,
    detail: r.detail || r.Detail,
    color: r.color || r.Color || "#2563eb",
  }));

  // Phone program: summary rows first, then per-office breakdown
  const patchStats = phoneRaw
    .filter((r) => r.type === "summary" || r.Type === "summary")
    .map((r) => [r.label || r.Label, r.value || r.Value]);

  const patchOffices = phoneRaw
    .filter((r) => r.type === "office" || r.Type === "office")
    .map((r) => ({
      office: r.office || r.Office,
      live: Number(r.live || r.Live || 0),
      voicemail: Number(r.voicemail || r.Voicemail || 0),
      total: Number(r.total || r.Total || 0),
    }));

  const digitalMetrics = digitalRaw.map((r) => [
    r.label || r.Label,
    r.value || r.Value,
  ]);

  const decisionMakers = decisionMakersRaw.map((r) => ({
    initials: r.initials || r.Initials,
    name: r.name || r.Name,
    role: r.role || r.Role,
    position: r.position || r.Position,
    touches: Number(r.touches || r.Touches || 0),
    influence: r.influence || r.Influence,
    note: r.note || r.Note,
  }));

  const sentiment = sentimentRaw.map((r) => ({
    label: r.label || r.Label,
    value: Number(r.value || r.Value || 0),
    color: r.color || r.Color || "#16a34a",
  }));

  const coalition = coalitionRaw.map((r) => ({
    label: r.label || r.Label,
    value: Number(r.value || r.Value || 0),
    color: r.color || r.Color || "#2563eb",
  }));

  const risks = risksRaw.map((r) => ({
    severity: r.severity || r.Severity,
    title: r.title || r.Title,
    description: r.description || r.Description,
    mitigation: r.mitigation || r.Mitigation,
  }));

  // calendar tab columns: date, title, type, detail
  const events = calendarRaw.map((r) => ({
    date: r.date || r.Date,
    title: r.title || r.Title,
    type: r.type || r.Type,
    detail: r.detail || r.Detail,
  }));

  // media tab columns: outlet, type, reach
  const mediaTargets = mediaRaw.map((r) => [
    r.outlet || r.Outlet || "",
    r.type || r.Type || "",
    r.reach || r.Reach || "",
  ]);

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
    mediaTargets,
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
