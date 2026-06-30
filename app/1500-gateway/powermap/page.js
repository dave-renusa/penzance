"use client";

import { useState } from "react";

const issueLabels = {
  all: "All",
  schools: "Schools",
  housing: "Housing",
  infrastructure: "Infrastructure",
  development: "Development",
  transportation: "Transportation",
  preservation: "Preservation",
  business: "Small business",
  governance: "Governance",
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
    summary:
      "Long-serving mayor, educator, former school board member, and regional economic-development connector.",
    influence:
      "Infrastructure backlog, school funding, tourism, regional economic growth, and family-friendly civic life.",
    networks: [
      "Central Rappahannock Regional Library",
      "Fredericksburg Regional Alliance",
      "300th Anniversary Committee",
      "UMW alumni network",
      "Fredericksburg and Stafford school systems",
    ],
    signals: [
      "Current mayor with council service dating back to 2004.",
      "Regional alliance ties connect her to banking, utilities, healthcare, UMW, local government, and development-adjacent actors.",
      "Quoted around infrastructure funding, economic development, tourism, redevelopment, and possible data centers.",
    ],
    issues: ["schools", "infrastructure", "development", "preservation", "governance"],
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
    summary:
      "Downtown restaurant owner, first Black woman elected to council, and visible small-business civic leader.",
    influence:
      "Downtown business health, quality of life, workforce and affordable housing, pedestrian safety, schools, environmental protection, and vulnerable residents.",
    networks: [
      "FOODE",
      "Mercantile",
      "718 Venue",
      "UMW Leadership Colloquium",
      "FAAR",
      "Fred15 / YIMBY Action",
      "Fredericksburg Democratic Committee",
      "Regional culinary network",
    ],
    signals: [
      "Deep downtown business network through FOODE, Mercantile, and 718 Venue.",
      "Endorsed by FAAR, Fred15 / YIMBY Action, and the Fredericksburg Democratic Committee.",
      "Priority mix suggests openness to growth only when quality-of-life, housing, preservation, and resident impacts are addressed.",
    ],
    issues: [
      "business",
      "housing",
      "schools",
      "transportation",
      "preservation",
      "development",
      "governance",
    ],
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
    summary:
      "GIS administrator, former school board chair, transportation committee leader, and new Ward 1 council member.",
    influence:
      "Public safety, public education, core city services, traffic impacts, infrastructure capacity, and data-driven fiscal tradeoffs.",
    networks: [
      "Fredericksburg City School Board",
      "FAMPO CTAC",
      "Stafford County Government",
      "Fredericksburg Democratic Committee",
      "Ward 1 neighborhoods",
    ],
    signals: [
      "No original Technology Overlay District vote because he joined council after the February 2025 approval.",
      "School board and FAMPO history make schools, transportation, and services high-salience.",
      "Document notes he responds best to quantitative maps, traffic modeling, and fiscal impact projections.",
    ],
    issues: ["schools", "infrastructure", "transportation", "development", "governance"],
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
    summary:
      "Urban planner, AICP-certified professional, former Planning Commission chair, and Ward 3 council member.",
    influence:
      "Affordable housing, sustainability, neighborhood character, tenant protections, historic preservation, process legitimacy, and environmental performance.",
    networks: [
      "Fredericksburg Planning Commission",
      "Great Oaks HOA",
      "U.S. Navy",
      "AICP",
      "UMW",
      "VCU",
      "CDBG",
      "Fred15 / YIMBY Action",
      "FAAR",
    ],
    signals: [
      "Chaired the Planning Commission meeting that recommended denying the TOD before later voting yes on council.",
      "Publicly tied data-center revenue to affordable housing and sustainability trust funds.",
      "Document flags sensitivity to transparency, conflicts-of-interest optics, and community impact documentation.",
    ],
    issues: ["housing", "preservation", "development", "governance", "transportation", "infrastructure"],
  },
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
  { id: "charlesPayne", type: "org", x: 738, y: 158, label: "Charles Payne Jr. / Hirschler" },
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
  ["planning", "dataRevenue", ["development", "governance"]],
].map(([source, target, issues]) => ({ source, target, issues }));

const nodeById = new Map(nodes.map((node) => [node.id, node]));
const personById = new Map(people.map((person) => [person.id, person]));

function linkPath(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const curve = Math.min(70, Math.max(-70, dx * 0.12));
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} Q ${mx + curve} ${my - Math.abs(dy) * 0.08} ${b.x} ${b.y}`;
}

function nodeFill(node) {
  if (node.type === "person") return personById.get(node.id).color;
  if (node.type === "issue") return "#257a72";
  return "#b47620";
}

function labelLines(label, small = false) {
  const words = label.split(" ");
  const max = small ? 15 : 13;
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
  return lines.slice(0, 3);
}

function SvgLabel({ label, x, y, small = false }) {
  return (
    <text x={x} y={y} textAnchor="middle" className={`node-label ${small ? "small" : ""}`}>
      {labelLines(label, small).map((line, index) => (
        <tspan key={line} x={x} dy={index === 0 ? "0" : "1.08em"}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function PersonCard({ person, selected, onSelect }) {
  return (
    <button
      type="button"
      className="person-card"
      style={{ "--card-color": person.color, borderLeftColor: person.color }}
      aria-pressed={selected}
      onClick={() => onSelect(person.id)}
    >
      <h3>{person.name}</h3>
      <p>
        {person.role} - {person.term}
      </p>
      <div className="card-meta">
        <span>Power</span>
        <span>{Math.round(person.power * 100)}</span>
      </div>
      <div className="meter" style={{ "--value": person.power }}>
        <span />
      </div>
      <p>{person.posture}</p>
    </button>
  );
}

export default function PowerMapPage() {
  const [selectedId, setSelectedId] = useState("devine");
  const [activeIssue, setActiveIssue] = useState("all");

  const selectedPerson = personById.get(selectedId);

  const issueMatch = (issueList) => activeIssue === "all" || issueList.includes(activeIssue);
  const personRelevant = (person) => activeIssue === "all" || person.issues.includes(activeIssue);
  const visibleNode = (node) => {
    if (activeIssue === "all") return true;
    if (node.type === "person") return personRelevant(personById.get(node.id));
    return links.some((link) => issueMatch(link.issues) && (link.source === node.id || link.target === node.id));
  };

  const visibleIds = new Set(nodes.filter(visibleNode).map((node) => node.id));
  const visibleLinks = links.filter(
    (link) => issueMatch(link.issues) && visibleIds.has(link.source) && visibleIds.has(link.target)
  );

  const connectedToSelected = (id) =>
    id === selectedId ||
    visibleLinks.some(
      (link) => (link.source === selectedId && link.target === id) || (link.target === selectedId && link.source === id)
    );

  return (
    <main className="power-map-page">
      <style>{styles}</style>

      <header className="topbar">
        <div className="brand">
          <h1>Fredericksburg City Council Power Map</h1>
          <p>Interaction, affiliation, and issue alignment view from the 5/26 targeted mapping document.</p>
        </div>
        <div className="stats" aria-label="Map summary">
          <div className="stat">
            <strong>{people.length}</strong>
            <span>Council profiles</span>
          </div>
          <div className="stat">
            <strong>{nodes.length}</strong>
            <span>Mapped nodes</span>
          </div>
          <div className="stat">
            <strong>{links.length}</strong>
            <span>Interactions</span>
          </div>
        </div>
      </header>

      <div className="app">
        <aside className="sidebar">
          <section className="panel">
            <div className="panel-head">
              <h2>Council Members</h2>
              <p>Power is based on formal role, tenure, committee history, and mapped networks.</p>
            </div>
            <div className="people-list">
              {people.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  selected={person.id === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          </section>

          <section className="panel filters">
            <div className="panel-head">
              <h2>Issue Lens</h2>
              <p>Filter the map by shared priorities and pressure points.</p>
            </div>
            <div className="filter-grid">
              {Object.entries(issueLabels).map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className="filter-button"
                  aria-pressed={id === activeIssue}
                  onClick={() => setActiveIssue(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="workspace">
          <section className="panel map-panel">
            <div className="map-toolbar">
              <h2 className="section-title">Interaction Map</h2>
              <div className="legend" aria-label="Map legend">
                <span className="legend-item">
                  <span className="swatch person" />
                  Council
                </span>
                <span className="legend-item">
                  <span className="swatch org" />
                  Affiliation
                </span>
                <span className="legend-item">
                  <span className="swatch issue" />
                  Issue
                </span>
              </div>
            </div>
            <div className="map-wrap">
              <svg viewBox="0 0 1000 560" role="img" aria-label="Network diagram of council members, affiliations, and issues">
                {visibleLinks.map((link) => {
                  const source = nodeById.get(link.source);
                  const target = nodeById.get(link.target);
                  const active = link.source === selectedId || link.target === selectedId;

                  return (
                    <path
                      key={`${link.source}-${link.target}`}
                      d={linkPath(source, target)}
                      className={`link ${active ? "active" : "dim"}`}
                    >
                      <title>
                        {source.label} to {target.label}: {link.issues.map((id) => issueLabels[id]).join(", ")}
                      </title>
                    </path>
                  );
                })}

                {nodes.filter(visibleNode).map((node) => {
                  const isPerson = node.type === "person";
                  const isSelected = node.id === selectedId;
                  const isConnected = connectedToSelected(node.id);
                  const labelY = node.y + (isPerson ? 48 : 34);

                  return (
                    <g
                      key={node.id}
                      className={`node ${isConnected ? "" : "dim"}`}
                      tabIndex={isPerson ? 0 : -1}
                      role={isPerson ? "button" : "img"}
                      onClick={isPerson ? () => setSelectedId(node.id) : undefined}
                      onKeyDown={
                        isPerson
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedId(node.id);
                              }
                            }
                          : undefined
                      }
                    >
                      {isPerson ? (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isSelected ? 34 : 29}
                          fill={nodeFill(node)}
                          className="node-shape"
                        />
                      ) : node.type === "issue" ? (
                        <circle cx={node.x} cy={node.y} r="22" fill={nodeFill(node)} className="node-shape" />
                      ) : (
                        <rect
                          x={node.x - 18}
                          y={node.y - 18}
                          width="36"
                          height="36"
                          rx="7"
                          fill={nodeFill(node)}
                          className="node-shape"
                        />
                      )}
                      <SvgLabel label={node.label} x={node.x} y={labelY} small={!isPerson} />
                      <title>{node.label}</title>
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>

          <section className="grid-two">
            <article className="panel detail" style={{ "--detail-color": selectedPerson.color }}>
              <div className="detail-header">
                <div>
                  <h2>{selectedPerson.name}</h2>
                  <div className="role">
                    {selectedPerson.role} - {selectedPerson.term}
                  </div>
                </div>
                <div className="posture">
                  <strong>{selectedPerson.posture}</strong>
                  <span>
                    {Math.round(selectedPerson.power * 100)} power / {Math.round(selectedPerson.support * 100)} support
                  </span>
                </div>
              </div>

              <p className="summary">{selectedPerson.summary}</p>

              <div className="detail-grid">
                <div className="fact">
                  <b>Primary influence</b>
                  <span>{selectedPerson.influence}</span>
                </div>
                <div className="fact">
                  <b>Mapped networks</b>
                  <span>{selectedPerson.networks.slice(0, 4).join(", ")}</span>
                </div>
              </div>

              <div className="tag-row">
                {selectedPerson.issues.map((id) => (
                  <span className="tag" key={id}>
                    {issueLabels[id]}
                  </span>
                ))}
              </div>

              <h3 className="section-title signal-title">Document Signals</h3>
              <ul className="note-list">
                {selectedPerson.signals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </article>

            <article className="panel quadrant">
              <h2 className="section-title">Power / Support Position</h2>
              <div className="chart">
                <div className="axis top">More power</div>
                <div className="axis bottom">More support</div>
                <div className="axis left">Less support</div>
                <div className="axis right">More support</div>

                {people.map((person) => (
                  <button
                    type="button"
                    key={person.id}
                    className={`dot ${person.id === selectedId ? "selected" : ""}`}
                    style={{
                      left: `${person.support * 100}%`,
                      bottom: `${person.power * 100}%`,
                      background: person.color,
                    }}
                    title={`${person.name}: ${Math.round(person.power * 100)} power, ${Math.round(
                      person.support * 100
                    )} support`}
                    aria-label={`${person.name}: ${Math.round(person.power * 100)} power, ${Math.round(
                      person.support * 100
                    )} support`}
                    onClick={() => setSelectedId(person.id)}
                  />
                ))}

                {people.map((person) => (
                  <div
                    key={`${person.id}-label`}
                    className="dot-label"
                    style={{
                      left: `${person.support * 100}%`,
                      bottom: `${person.power * 100}%`,
                    }}
                  >
                    {person.shortName}
                  </div>
                ))}
              </div>
              <p className="source-note">
                Support positions are estimates from the document&apos;s public role, endorsement, voting, donor, and
                issue-priority signals. They should be treated as a planning hypothesis, not a fixed personal stance.
              </p>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}

const styles = `
  .power-map-page {
    min-height: 100dvh;
    background: linear-gradient(180deg, #f6f8f7 0%, #edf3f3 52%, #f7f7f1 100%);
    color: #17212b;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: 0;
  }

  .power-map-page * {
    box-sizing: border-box;
  }

  .power-map-page button,
  .power-map-page input {
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
    border-bottom: 1px solid #d9e0df;
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
    color: #66717e;
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
    border: 1px solid #d9e0df;
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
    color: #66717e;
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
    border: 1px solid #d9e0df;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(23, 33, 43, 0.08);
  }

  .panel-head {
    padding: 14px 16px 10px;
    border-bottom: 1px solid #d9e0df;
  }

  .panel-head h2,
  .section-title {
    margin: 0;
    font-size: 0.96rem;
    font-weight: 760;
  }

  .panel-head p {
    margin: 4px 0 0;
    color: #66717e;
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
    border: 1px solid #d9e0df;
    border-left: 6px solid #2f6f9f;
    background: #fff;
    color: #17212b;
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
    border-color: #0f766e;
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
    color: #66717e;
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
    color: #66717e;
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
    border: 1px solid #d9e0df;
    border-radius: 8px;
    background: #fff;
    color: #17212b;
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
    border-bottom: 1px solid #d9e0df;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    color: #66717e;
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
    background: #2f6f9f;
  }

  .swatch.org {
    background: #b47620;
    border-radius: 3px;
  }

  .swatch.issue {
    background: #257a72;
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
    color: #66717e;
    font-size: 0.9rem;
  }

  .posture {
    min-width: 140px;
    padding: 8px 10px;
    border: 1px solid #d9e0df;
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
    color: #66717e;
    font-size: 0.74rem;
    margin-top: 2px;
  }

  .summary {
    margin: 0 0 12px;
    line-height: 1.5;
    color: #33414f;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin: 14px 0;
  }

  .fact {
    border-top: 3px solid #d9e0df;
    padding-top: 9px;
    min-width: 0;
  }

  .fact b {
    display: block;
    font-size: 0.78rem;
    color: #66717e;
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
    border: 1px solid #d9e0df;
    border-radius: 999px;
    background: #fff;
    color: #33414f;
    font-size: 0.78rem;
    line-height: 1.15;
  }

  .signal-title {
    margin-top: 16px;
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
    border: 1px solid #d9e0df;
    border-radius: 8px;
    background:
      linear-gradient(90deg, transparent calc(50% - 1px), #b7c5c7 calc(50% - 1px), #b7c5c7 calc(50% + 1px), transparent calc(50% + 1px)),
      linear-gradient(0deg, transparent calc(50% - 1px), #b7c5c7 calc(50% - 1px), #b7c5c7 calc(50% + 1px), transparent calc(50% + 1px)),
      linear-gradient(135deg, rgba(184, 79, 75, 0.08), rgba(37, 122, 114, 0.1));
    overflow: hidden;
  }

  .axis {
    position: absolute;
    color: #66717e;
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
    color: #17212b;
    font-weight: 760;
    font-size: 0.78rem;
    pointer-events: none;
  }

  .source-note {
    margin-top: 12px;
    color: #66717e;
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
  }
`;
