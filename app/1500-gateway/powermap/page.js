<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fredericksburg City Council Power Map</title>
  <style>
    :root {
      --ink: #17212b;
      --muted: #66717e;
      --line: #d9e0df;
      --paper: #fbfbf8;
      --panel: #ffffff;
      --blue: #2f6f9f;
      --teal: #257a72;
      --green: #5c7f3d;
      --gold: #b47620;
      --red: #b84f4b;
      --slate: #566374;
      --focus: #0f766e;
      --shadow: 0 10px 30px rgba(23, 33, 43, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: linear-gradient(180deg, #f6f8f7 0%, #edf3f3 52%, #f7f7f1 100%);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }

    button,
    input {
      font: inherit;
    }

    .topbar {
      min-height: 76px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 16px 22px;
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(14px);
    }

    .brand h1 {
      margin: 0;
      font-size: clamp(1.25rem, 1.8vw, 1.9rem);
      line-height: 1.1;
      font-weight: 780;
      letter-spacing: 0;
    }

    .brand p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 0.9rem;
    }

    .stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .stat {
      min-width: 92px;
      padding: 8px 10px;
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 8px;
      text-align: right;
    }

    .stat strong {
      display: block;
      font-size: 1.05rem;
    }

    .stat span {
      display: block;
      color: var(--muted);
      font-size: 0.75rem;
    }

    .app {
      display: grid;
      grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
      gap: 16px;
      padding: 16px;
      max-width: 1440px;
      margin: 0 auto;
    }

    .sidebar,
    .workspace {
      min-width: 0;
    }

    .panel {
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }

    .panel-head {
      padding: 14px 16px 10px;
      border-bottom: 1px solid var(--line);
    }

    .panel-head h2,
    .section-title {
      margin: 0;
      font-size: 0.96rem;
      font-weight: 760;
    }

    .panel-head p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 0.82rem;
      line-height: 1.35;
    }

    .people-list {
      display: grid;
      gap: 10px;
      padding: 12px;
    }

    .person-card {
      display: grid;
      gap: 8px;
      width: 100%;
      border: 1px solid var(--line);
      border-left: 6px solid var(--blue);
      background: #fff;
      color: var(--ink);
      border-radius: 8px;
      text-align: left;
      padding: 12px;
      cursor: pointer;
      transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
    }

    .person-card:hover,
    .person-card:focus-visible {
      transform: translateY(-1px);
      border-color: #a7b9bb;
      box-shadow: 0 10px 22px rgba(23, 33, 43, 0.09);
      outline: none;
    }

    .person-card[aria-pressed="true"] {
      border-color: var(--focus);
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
    }

    .person-card h3 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.15;
      letter-spacing: 0;
    }

    .person-card p {
      margin: 0;
      color: var(--muted);
      font-size: 0.82rem;
      line-height: 1.35;
    }

    .meter {
      height: 7px;
      border-radius: 999px;
      background: #e8ecec;
      overflow: hidden;
    }

    .meter span {
      display: block;
      height: 100%;
      width: calc(var(--value) * 100%);
      background: var(--card-color);
    }

    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      color: var(--muted);
      font-size: 0.76rem;
    }

    .filters {
      margin-top: 16px;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      padding: 12px;
    }

    .filter-button {
      min-height: 38px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--ink);
      cursor: pointer;
    }

    .filter-button:hover,
    .filter-button:focus-visible {
      border-color: #9bb3b2;
      outline: none;
    }

    .filter-button[aria-pressed="true"] {
      background: #123f3d;
      border-color: #123f3d;
      color: #fff;
    }

    .workspace {
      display: grid;
      gap: 16px;
    }

    .map-panel {
      overflow: hidden;
    }

    .map-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 13px 16px;
      border-bottom: 1px solid var(--line);
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      color: var(--muted);
      font-size: 0.78rem;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .swatch {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .swatch.person {
      background: var(--blue);
    }

    .swatch.org {
      background: var(--gold);
      border-radius: 3px;
    }

    .swatch.issue {
      background: var(--teal);
    }

    .map-wrap {
      min-height: 470px;
      background:
        radial-gradient(circle at 15% 18%, rgba(47, 111, 159, 0.09), transparent 23%),
        linear-gradient(135deg, #ffffff 0%, #f8fbfa 100%);
      overflow: hidden;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 470px;
    }

    .link {
      fill: none;
      stroke: #aebcbd;
      stroke-width: 1.8;
      opacity: 0.48;
      transition: opacity 150ms ease, stroke-width 150ms ease, stroke 150ms ease;
    }

    .link.active {
      stroke: #0f766e;
      stroke-width: 3.2;
      opacity: 0.92;
    }

    .link.dim {
      opacity: 0.13;
    }

    .node-shape {
      stroke: #fff;
      stroke-width: 3;
      cursor: pointer;
      filter: drop-shadow(0 7px 12px rgba(23, 33, 43, 0.14));
      transition: opacity 150ms ease, transform 150ms ease;
    }

    .node.dim {
      opacity: 0.32;
    }

    .node-label {
      pointer-events: none;
      font-size: 13px;
      fill: #17212b;
      font-weight: 690;
      paint-order: stroke;
      stroke: rgba(255, 255, 255, 0.88);
      stroke-width: 5px;
      stroke-linejoin: round;
    }

    .node-label.small {
      font-size: 11px;
      font-weight: 650;
    }

    .grid-two {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
      gap: 16px;
    }

    .detail {
      padding: 16px;
    }

    .detail-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 14px;
    }

    .detail h2 {
      margin: 0;
      font-size: 1.35rem;
      letter-spacing: 0;
    }

    .detail .role {
      margin-top: 4px;
      color: var(--muted);
      font-size: 0.9rem;
    }

    .posture {
      min-width: 140px;
      padding: 8px 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      text-align: right;
      background: #f9fbfb;
    }

    .posture strong {
      display: block;
      font-size: 0.88rem;
    }

    .posture span {
      display: block;
      color: var(--muted);
      font-size: 0.74rem;
      margin-top: 2px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 14px 0;
    }

    .fact {
      border-top: 3px solid var(--line);
      padding-top: 9px;
      min-width: 0;
    }

    .fact b {
      display: block;
      font-size: 0.78rem;
      color: var(--muted);
      text-transform: uppercase;
    }

    .fact span {
      display: block;
      margin-top: 4px;
      font-size: 0.94rem;
      line-height: 1.35;
    }

    .tag-row {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 4px 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #fff;
      color: #33414f;
      font-size: 0.78rem;
      line-height: 1.15;
    }

    .note-list {
      display: grid;
      gap: 8px;
      margin: 12px 0 0;
      padding: 0;
      list-style: none;
    }

    .note-list li {
      display: grid;
      grid-template-columns: 7px 1fr;
      gap: 9px;
      color: #33414f;
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .note-list li::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--detail-color);
      margin-top: 7px;
    }

    .quadrant {
      padding: 16px;
    }

    .chart {
      position: relative;
      height: 390px;
      margin-top: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background:
        linear-gradient(90deg, transparent calc(50% - 1px), #b7c5c7 calc(50% - 1px), #b7c5c7 calc(50% + 1px), transparent calc(50% + 1px)),
        linear-gradient(0deg, transparent calc(50% - 1px), #b7c5c7 calc(50% - 1px), #b7c5c7 calc(50% + 1px), transparent calc(50% + 1px)),
        linear-gradient(135deg, rgba(184, 79, 75, 0.08), rgba(37, 122, 114, 0.1));
      overflow: hidden;
    }

    .axis {
      position: absolute;
      color: var(--muted);
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      pointer-events: none;
    }

    .axis.top {
      top: 10px;
      left: 14px;
    }

    .axis.bottom {
      bottom: 10px;
      right: 14px;
    }

    .axis.left {
      bottom: 14px;
      left: 14px;
    }

    .axis.right {
      top: 14px;
      right: 14px;
    }

    .quad-label {
      display: none;
      pointer-events: none;
    }

    .quad-label.a {
      top: 88px;
      right: 30px;
    }

    .quad-label.b {
      top: 88px;
      left: 36px;
    }

    .quad-label.c {
      bottom: 44px;
      left: 36px;
    }

    .quad-label.d {
      bottom: 44px;
      right: 36px;
    }

    .dot {
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #fff;
      transform: translate(-50%, 50%);
      box-shadow: 0 8px 18px rgba(23, 33, 43, 0.18);
      cursor: pointer;
    }

    .dot.selected {
      width: 24px;
      height: 24px;
      box-shadow: 0 0 0 5px rgba(15, 118, 110, 0.16), 0 10px 20px rgba(23, 33, 43, 0.18);
    }

    .dot-label {
      position: absolute;
      transform: translate(-50%, -100%);
      margin-top: -8px;
      min-width: 90px;
      text-align: center;
      color: var(--ink);
      font-weight: 760;
      font-size: 0.78rem;
      pointer-events: none;
    }

    .source-note {
      margin-top: 12px;
      color: var(--muted);
      font-size: 0.78rem;
      line-height: 1.45;
    }

    @media (max-width: 1000px) {
      .app {
        grid-template-columns: 1fr;
      }

      .grid-two {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .filters {
        margin-top: 0;
      }
    }

    @media (max-width: 700px) {
      .topbar {
        position: static;
        align-items: flex-start;
        flex-direction: column;
      }

      .stats {
        justify-content: flex-start;
        width: 100%;
      }

      .stat {
        flex: 1 1 92px;
        text-align: left;
      }

      .app {
        padding: 10px;
      }

      .sidebar {
        grid-template-columns: 1fr;
      }

      .map-toolbar,
      .detail-header {
        align-items: stretch;
        flex-direction: column;
      }

      .posture {
        text-align: left;
      }

      .detail-grid,
      .filter-grid {
        grid-template-columns: 1fr;
      }

      .chart {
        height: 340px;
      }

      .quad-label {
        display: none;
      }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <h1>Fredericksburg City Council Power Map</h1>
      <p>Interaction, affiliation, and issue alignment view from the 5/26 targeted mapping document.</p>
    </div>
    <div class="stats" aria-label="Map summary">
      <div class="stat"><strong id="statPeople">4</strong><span>Council profiles</span></div>
      <div class="stat"><strong id="statNodes">0</strong><span>Mapped nodes</span></div>
      <div class="stat"><strong id="statLinks">0</strong><span>Interactions</span></div>
    </div>
  </header>

  <main class="app">
    <aside class="sidebar">
      <section class="panel">
        <div class="panel-head">
          <h2>Council Members</h2>
          <p>Power is based on formal role, tenure, committee history, and mapped networks.</p>
        </div>
        <div class="people-list" id="peopleList"></div>
      </section>

      <section class="panel filters">
        <div class="panel-head">
          <h2>Issue Lens</h2>
          <p>Filter the map by shared priorities and pressure points.</p>
        </div>
        <div class="filter-grid" id="filterGrid"></div>
      </section>
    </aside>

    <section class="workspace">
      <section class="panel map-panel">
        <div class="map-toolbar">
          <div>
            <h2 class="section-title">Interaction Map</h2>
          </div>
          <div class="legend" aria-label="Map legend">
            <span class="legend-item"><span class="swatch person"></span>Council</span>
            <span class="legend-item"><span class="swatch org"></span>Affiliation</span>
            <span class="legend-item"><span class="swatch issue"></span>Issue</span>
          </div>
        </div>
        <div class="map-wrap">
          <svg id="network" viewBox="0 0 1000 560" role="img" aria-label="Network diagram of Fredericksburg council members, affiliations, and issues"></svg>
        </div>
      </section>

      <section class="grid-two">
        <article class="panel detail" id="detailPanel"></article>
        <article class="panel quadrant">
          <h2 class="section-title">Power / Support Position</h2>
          <div class="chart" id="quadrantChart">
            <div class="axis top">More power</div>
            <div class="axis bottom">More support</div>
            <div class="axis left">Less support</div>
            <div class="axis right">More support</div>
            <div class="quad-label a">High power / supportive</div>
            <div class="quad-label b">High power / skeptical</div>
            <div class="quad-label c">Lower power / skeptical</div>
            <div class="quad-label d">Lower power / supportive</div>
          </div>
          <p class="source-note">Support positions are estimates from the document's public role, endorsement, voting, donor, and issue-priority signals. They should be treated as a planning hypothesis, not a fixed personal stance.</p>
        </article>
      </section>
    </section>
  </main>

  <script>
    const issueLabels = {
      all: "All",
      schools: "Schools",
      housing: "Housing",
      infrastructure: "Infrastructure",
      development: "Development",
      transportation: "Transportation",
      preservation: "Preservation",
      business: "Small business",
      governance: "Governance"
    };

    const people = [
      {
        id: "devine",
        name: "Kerry Devine",
        shortName: "Devine",
        role: "Mayor",
        ward: "Citywide",
        term: "Jan. 1, 2024 - Dec. 31, 2027",
        color: "#2f6f9f",
        power: 0.92,
        support: 0.72,
        posture: "High leverage / revenue-open",
        summary: "Long-serving mayor, educator, former school board member, and regional economic-development connector.",
        influence: "Infrastructure backlog, school funding, tourism, regional economic growth, and family-friendly civic life.",
        networks: ["Central Rappahannock Regional Library", "Fredericksburg Regional Alliance", "300th Anniversary Committee", "UMW alumni network", "Fredericksburg and Stafford school systems"],
        signals: ["Current mayor with council service dating back to 2004.", "Regional alliance ties connect her to banking, utilities, healthcare, UMW, local government, and development-adjacent actors.", "Quoted around infrastructure funding, economic development, tourism, redevelopment, and possible data centers."],
        issues: ["schools", "infrastructure", "development", "preservation", "governance"]
      },
      {
        id: "crump",
        name: "Joy Crump",
        shortName: "Crump",
        role: "Ward 2 Councilor",
        ward: "Ward 2",
        term: "Jan. 1, 2026 - Dec. 31, 2029",
        color: "#b47620",
        power: 0.72,
        support: 0.48,
        posture: "Network-rich / conditional",
        summary: "Downtown restaurant owner, first Black woman elected to council, and visible small-business civic leader.",
        influence: "Downtown business health, quality of life, workforce and affordable housing, pedestrian safety, schools, environmental protection, and vulnerable residents.",
        networks: ["FOODE", "Mercantile", "718 Venue", "UMW Leadership Colloquium", "FAAR", "Fred15 / YIMBY Action", "Fredericksburg Democratic Committee", "Regional culinary network"],
        signals: ["Deep downtown business network through FOODE, Mercantile, and 718 Venue.", "Endorsed by FAAR, Fred15 / YIMBY Action, and the Fredericksburg Democratic Committee.", "Priority mix suggests openness to growth only when quality-of-life, housing, preservation, and resident impacts are addressed."],
        issues: ["business", "housing", "schools", "transportation", "preservation", "development", "governance"]
      },
      {
        id: "rowe",
        name: "Matt Rowe",
        shortName: "Rowe",
        role: "Ward 1 Councilor",
        ward: "Ward 1",
        term: "Jan. 1, 2026 - Dec. 31, 2029",
        color: "#5c7f3d",
        power: 0.66,
        support: 0.58,
        posture: "Data-first / service conditional",
        summary: "GIS administrator, former school board chair, transportation committee leader, and new Ward 1 council member.",
        influence: "Public safety, public education, core city services, traffic impacts, infrastructure capacity, and data-driven fiscal tradeoffs.",
        networks: ["Fredericksburg City School Board", "FAMPO CTAC", "Stafford County Government", "Fredericksburg Democratic Committee", "Ward 1 neighborhoods"],
        signals: ["No original Technology Overlay District vote because he joined council after the February 2025 approval.", "School board and FAMPO history make schools, transportation, and services high-salience.", "Document notes he responds best to quantitative maps, traffic modeling, and fiscal impact projections."],
        issues: ["schools", "infrastructure", "transportation", "development", "governance"]
      },
      {
        id: "finn",
        name: "Susanna Finn",
        shortName: "Finn",
        role: "Ward 3 Councilor",
        ward: "Ward 3",
        term: "Jan. 1, 2026 - Dec. 31, 2029",
        color: "#b84f4b",
        power: 0.82,
        support: 0.63,
        posture: "Process gatekeeper / safeguards",
        summary: "Urban planner, AICP-certified professional, former Planning Commission chair, and Ward 3 council member.",
        influence: "Affordable housing, sustainability, neighborhood character, tenant protections, historic preservation, process legitimacy, and environmental performance.",
        networks: ["Fredericksburg Planning Commission", "Great Oaks HOA", "U.S. Navy", "AICP", "UMW", "VCU", "CDBG", "Fred15 / YIMBY Action", "FAAR"],
        signals: ["Chaired the Planning Commission meeting that recommended denying the TOD before later voting yes on council.", "Publicly tied data-center revenue to affordable housing and sustainability trust funds.", "Document flags sensitivity to transparency, conflicts-of-interest optics, and community impact documentation."],
        issues: ["housing", "preservation", "development", "governance", "transportation", "infrastructure"]
      }
    ];

    const nodes = [
      { id: "devine", type: "person", x: 510, y: 108, label: "Kerry Devine" },
      { id: "crump", type: "person", x: 275, y: 278, label: "Joy Crump" },
      { id: "rowe", type: "person", x: 520, y: 332, label: "Matt Rowe" },
      { id: "finn", type: "person", x: 735, y: 270, label: "Susanna Finn" },
      { id: "schools", type: "issue", x: 185, y: 112, label: "Schools" },
      { id: "infrastructure", type: "issue", x: 385, y: 205, label: "Infrastructure" },
      { id: "tourism", type: "issue", x: 350, y: 124, label: "Tourism" },
      { id: "dataRevenue", type: "issue", x: 630, y: 205, label: "Data center revenue" },
      { id: "housing", type: "issue", x: 850, y: 500, label: "Affordable housing" },
      { id: "transportation", type: "issue", x: 585, y: 438, label: "Traffic and roads" },
      { id: "preservation", type: "issue", x: 725, y: 518, label: "Preservation" },
      { id: "vulnerable", type: "issue", x: 190, y: 504, label: "Vulnerable residents" },
      { id: "smallBusiness", type: "issue", x: 92, y: 222, label: "Small business" },
      { id: "publicSafety", type: "issue", x: 410, y: 430, label: "Public safety" },
      { id: "crrl", type: "org", x: 610, y: 50, label: "CRRL Board" },
      { id: "regionalAlliance", type: "org", x: 830, y: 96, label: "Regional Alliance" },
      { id: "anniversary", type: "org", x: 918, y: 208, label: "300th Committee" },
      { id: "umw", type: "org", x: 370, y: 72, label: "UMW network" },
      { id: "downtown", type: "org", x: 98, y: 320, label: "Downtown businesses" },
      { id: "umwLeadership", type: "org", x: 172, y: 412, label: "UMW Leadership" },
      { id: "faar", type: "org", x: 365, y: 492, label: "FAAR / Realtors" },
      { id: "fred15", type: "org", x: 520, y: 515, label: "Fred15 / YIMBY" },
      { id: "fdc", type: "org", x: 675, y: 450, label: "Democratic Committee" },
      { id: "schoolBoard", type: "org", x: 330, y: 382, label: "School Board" },
      { id: "fampo", type: "org", x: 690, y: 365, label: "FAMPO CTAC" },
      { id: "stafford", type: "org", x: 808, y: 405, label: "Stafford County" },
      { id: "planning", type: "org", x: 895, y: 300, label: "Planning Commission" },
      { id: "greatOaks", type: "org", x: 915, y: 382, label: "Great Oaks HOA" },
      { id: "aicp", type: "org", x: 840, y: 222, label: "AICP" },
      { id: "charlesPayne", type: "org", x: 738, y: 158, label: "Charles Payne Jr. / Hirschler" }
    ];

    const links = [
      ["devine", "schools", ["schools"]],
      ["devine", "infrastructure", ["infrastructure", "development"]],
      ["devine", "tourism", ["development"]],
      ["devine", "dataRevenue", ["development", "infrastructure"]],
      ["devine", "crrl", ["governance"]],
      ["devine", "regionalAlliance", ["development", "governance"]],
      ["devine", "anniversary", ["governance", "development"]],
      ["devine", "umw", ["schools", "governance"]],
      ["devine", "charlesPayne", ["development", "governance"]],
      ["crump", "smallBusiness", ["business", "development"]],
      ["crump", "downtown", ["business", "development"]],
      ["crump", "umwLeadership", ["governance", "business"]],
      ["crump", "faar", ["housing", "development"]],
      ["crump", "fred15", ["housing", "transportation", "development"]],
      ["crump", "fdc", ["governance"]],
      ["crump", "schools", ["schools"]],
      ["crump", "housing", ["housing"]],
      ["crump", "preservation", ["preservation"]],
      ["crump", "vulnerable", ["housing", "governance"]],
      ["rowe", "schools", ["schools"]],
      ["rowe", "schoolBoard", ["schools", "governance"]],
      ["rowe", "fampo", ["transportation", "infrastructure"]],
      ["rowe", "transportation", ["transportation", "infrastructure"]],
      ["rowe", "stafford", ["governance"]],
      ["rowe", "publicSafety", ["governance"]],
      ["rowe", "dataRevenue", ["development", "schools", "infrastructure"]],
      ["rowe", "fdc", ["governance"]],
      ["rowe", "charlesPayne", ["development"]],
      ["finn", "planning", ["development", "governance"]],
      ["finn", "greatOaks", ["housing", "preservation"]],
      ["finn", "aicp", ["governance", "development"]],
      ["finn", "umw", ["schools", "preservation"]],
      ["finn", "housing", ["housing", "development"]],
      ["finn", "preservation", ["preservation"]],
      ["finn", "dataRevenue", ["development", "housing", "infrastructure"]],
      ["finn", "transportation", ["transportation"]],
      ["finn", "fred15", ["housing", "transportation", "development"]],
      ["finn", "faar", ["housing", "development"]],
      ["finn", "fdc", ["governance"]],
      ["finn", "charlesPayne", ["development"]],
      ["faar", "housing", ["housing", "development"]],
      ["fred15", "transportation", ["transportation"]],
      ["fred15", "housing", ["housing"]],
      ["schoolBoard", "schools", ["schools"]],
      ["fampo", "transportation", ["transportation"]],
      ["regionalAlliance", "dataRevenue", ["development"]],
      ["regionalAlliance", "infrastructure", ["infrastructure"]],
      ["planning", "dataRevenue", ["development", "governance"]]
    ].map(([source, target, issues]) => ({ source, target, issues }));

    let selectedId = "devine";
    let activeIssue = "all";

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const personById = new Map(people.map((person) => [person.id, person]));
    const peopleList = document.getElementById("peopleList");
    const filterGrid = document.getElementById("filterGrid");
    const detailPanel = document.getElementById("detailPanel");
    const svg = document.getElementById("network");
    const quadrantChart = document.getElementById("quadrantChart");

    document.getElementById("statNodes").textContent = nodes.length;
    document.getElementById("statLinks").textContent = links.length;

    function issueMatch(list) {
      return activeIssue === "all" || list.includes(activeIssue);
    }

    function personRelevant(person) {
      return activeIssue === "all" || person.issues.includes(activeIssue);
    }

    function connectedToSelected(id) {
      return id === selectedId || links.some((link) => {
        return issueMatch(link.issues) && (
          (link.source === selectedId && link.target === id) ||
          (link.target === selectedId && link.source === id)
        );
      });
    }

    function visibleNode(node) {
      if (activeIssue === "all") return true;
      if (node.type === "person") return personRelevant(personById.get(node.id));
      return links.some((link) => issueMatch(link.issues) && (link.source === node.id || link.target === node.id));
    }

    function clearElement(element) {
      while (element.firstChild) element.removeChild(element.firstChild);
    }

    function make(tag, className, text) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    }

    function renderPeople() {
      clearElement(peopleList);
      people.forEach((person) => {
        const card = make("button", "person-card");
        card.type = "button";
        card.style.setProperty("--card-color", person.color);
        card.style.borderLeftColor = person.color;
        card.setAttribute("aria-pressed", String(person.id === selectedId));
        card.addEventListener("click", () => selectPerson(person.id));

        const title = make("h3", null, person.name);
        const role = make("p", null, `${person.role} - ${person.term}`);
        const meta = make("div", "card-meta");
        meta.append(make("span", null, "Power"));
        meta.append(make("span", null, Math.round(person.power * 100).toString()));
        const meter = make("div", "meter");
        meter.style.setProperty("--value", person.power);
        meter.append(make("span"));
        const posture = make("p", null, person.posture);

        card.append(title, role, meta, meter, posture);
        peopleList.append(card);
      });
    }

    function renderFilters() {
      clearElement(filterGrid);
      Object.entries(issueLabels).forEach(([id, label]) => {
        const button = make("button", "filter-button", label);
        button.type = "button";
        button.setAttribute("aria-pressed", String(id === activeIssue));
        button.addEventListener("click", () => {
          activeIssue = id;
          renderAll();
        });
        filterGrid.append(button);
      });
    }

    function svgEl(tag, attrs = {}) {
      const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
      return element;
    }

    function linkPath(a, b) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const curve = Math.min(70, Math.max(-70, dx * 0.12));
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      return `M ${a.x} ${a.y} Q ${mx + curve} ${my - Math.abs(dy) * 0.08} ${b.x} ${b.y}`;
    }

    function wrapSvgText(group, label, x, y, className) {
      const text = svgEl("text", { x, y, "text-anchor": "middle", class: className });
      const words = label.split(" ");
      const max = className.includes("small") ? 15 : 13;
      const lines = [];
      let line = "";
      words.forEach((word) => {
        const next = line ? `${line} ${word}` : word;
        if (next.length > max && line) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      });
      if (line) lines.push(line);
      lines.slice(0, 3).forEach((content, index) => {
        const tspan = svgEl("tspan", {
          x,
          dy: index === 0 ? "0" : "1.08em"
        });
        tspan.textContent = content;
        text.append(tspan);
      });
      group.append(text);
    }

    function nodeFill(node) {
      if (node.type === "person") return personById.get(node.id).color;
      if (node.type === "issue") return "#257a72";
      return "#b47620";
    }

    function renderNetwork() {
      clearElement(svg);

      const visibleIds = new Set(nodes.filter(visibleNode).map((node) => node.id));
      const visibleLinks = links.filter((link) => issueMatch(link.issues) && visibleIds.has(link.source) && visibleIds.has(link.target));
      const highlighted = new Set([selectedId]);
      visibleLinks.forEach((link) => {
        if (link.source === selectedId) highlighted.add(link.target);
        if (link.target === selectedId) highlighted.add(link.source);
      });

      visibleLinks.forEach((link) => {
        const source = nodeById.get(link.source);
        const target = nodeById.get(link.target);
        const path = svgEl("path", {
          d: linkPath(source, target),
          class: `link ${link.source === selectedId || link.target === selectedId ? "active" : "dim"}`
        });
        const title = svgEl("title");
        title.textContent = `${source.label} -> ${target.label}: ${link.issues.map((id) => issueLabels[id]).join(", ")}`;
        path.append(title);
        svg.append(path);
      });

      nodes.filter(visibleNode).forEach((node) => {
        const group = svgEl("g", {
          class: `node ${connectedToSelected(node.id) ? "" : "dim"}`,
          tabindex: node.type === "person" ? "0" : "-1"
        });
        group.style.cursor = node.type === "person" ? "pointer" : "default";

        if (node.type === "person") {
          const circle = svgEl("circle", {
            cx: node.x,
            cy: node.y,
            r: node.id === selectedId ? 34 : 29,
            fill: nodeFill(node),
            class: "node-shape"
          });
          group.append(circle);
          group.addEventListener("click", () => selectPerson(node.id));
          group.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              selectPerson(node.id);
            }
          });
          wrapSvgText(group, node.label, node.x, node.y + 48, "node-label");
        } else if (node.type === "issue") {
          const circle = svgEl("circle", {
            cx: node.x,
            cy: node.y,
            r: 22,
            fill: nodeFill(node),
            class: "node-shape"
          });
          group.append(circle);
          wrapSvgText(group, node.label, node.x, node.y + 34, "node-label small");
        } else {
          const rect = svgEl("rect", {
            x: node.x - 18,
            y: node.y - 18,
            width: 36,
            height: 36,
            rx: 7,
            fill: nodeFill(node),
            class: "node-shape"
          });
          group.append(rect);
          wrapSvgText(group, node.label, node.x, node.y + 34, "node-label small");
        }

        const title = svgEl("title");
        title.textContent = node.label;
        group.append(title);
        svg.append(group);
      });
    }

    function renderDetail() {
      const person = personById.get(selectedId);
      detailPanel.style.setProperty("--detail-color", person.color);
      clearElement(detailPanel);

      const header = make("div", "detail-header");
      const titleWrap = make("div");
      titleWrap.append(make("h2", null, person.name));
      titleWrap.append(make("div", "role", `${person.role} - ${person.term}`));
      const posture = make("div", "posture");
      posture.append(make("strong", null, person.posture));
      posture.append(make("span", null, `${Math.round(person.power * 100)} power / ${Math.round(person.support * 100)} support`));
      header.append(titleWrap, posture);

      const summary = make("p", null, person.summary);
      summary.style.margin = "0 0 12px";
      summary.style.lineHeight = "1.5";
      summary.style.color = "#33414f";

      const factGrid = make("div", "detail-grid");
      [
        ["Primary influence", person.influence],
        ["Mapped networks", person.networks.slice(0, 4).join(", ")]
      ].forEach(([label, value]) => {
        const fact = make("div", "fact");
        fact.append(make("b", null, label));
        fact.append(make("span", null, value));
        factGrid.append(fact);
      });

      const tags = make("div", "tag-row");
      person.issues.map((id) => issueLabels[id]).forEach((label) => tags.append(make("span", "tag", label)));

      const signalTitle = make("h3", "section-title", "Document Signals");
      signalTitle.style.marginTop = "16px";
      const notes = make("ul", "note-list");
      person.signals.forEach((signal) => notes.append(make("li", null, signal)));

      detailPanel.append(header, summary, factGrid, tags, signalTitle, notes);
    }

    function renderQuadrant() {
      quadrantChart.querySelectorAll(".dot, .dot-label").forEach((element) => element.remove());
      people.forEach((person) => {
        const dot = make("button", `dot ${person.id === selectedId ? "selected" : ""}`);
        dot.type = "button";
        dot.style.left = `${person.support * 100}%`;
        dot.style.bottom = `${person.power * 100}%`;
        dot.style.background = person.color;
        dot.title = `${person.name}: ${Math.round(person.power * 100)} power, ${Math.round(person.support * 100)} support`;
        dot.setAttribute("aria-label", dot.title);
        dot.addEventListener("click", () => selectPerson(person.id));

        const label = make("div", "dot-label", person.shortName);
        label.style.left = `${person.support * 100}%`;
        label.style.bottom = `${person.power * 100}%`;

        quadrantChart.append(label, dot);
      });
    }

    function selectPerson(id) {
      selectedId = id;
      renderAll();
    }

    function renderAll() {
      renderPeople();
      renderFilters();
      renderNetwork();
      renderDetail();
      renderQuadrant();
    }

    renderAll();
  </script>
</body>
</html>
