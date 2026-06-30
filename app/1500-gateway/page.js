import rawData from "@/data/1500-gateway.json";

const {
  status,
  kpis,
  weeklyHighlights,
  digitalMetrics,
  patchStats,
  patchOffices,
  decisionMakers,
  sentiment,
  coalition,
  risks,
  events,
  mediaTargets,
} = rawData;

function StatusBadge({ value }) {
  const key = value.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status status-${key}`}>{value}</span>;
}

function Progress({ value, color }) {
  return (
    <div className="progress" aria-label={`${value}%`}>
      <span style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function percent(value, total) {
  return `${Math.round((value / total) * 100)}%`;
}

export default function GatewayPage() {
  const sentimentTotal = sentiment.reduce((sum, item) => sum + item.value, 0);
  const coalitionTotal = coalition.reduce((sum, item) => sum + item.value, 0);
  const livePatchTotal = patchOffices.reduce((sum, office) => sum + office.live, 0);
  const voicemailTotal = patchOffices.reduce((sum, office) => sum + office.voicemail, 0);

  return (
    <main className="gateway-page">
      <section className="top-band">
        <div className="shell dashboard-head">
          <div>
            <p className="eyebrow">Penzance Reports</p>
            <h1>1500 Gateway Community Dashboard</h1>
            <p className="lede">
              Stakeholder mapping, coalition activity, public testimony, voter contact,
              and risk posture for Fredericksburg, VA.
            </p>
          </div>
          <div className="meta-panel">
            <span>Last sync</span>
            <strong>{status.lastSync}</strong>
            <span>Approval outlook</span>
            <strong className="watch-text">{status.outlook}</strong>
            <span>Next milestone</span>
            <strong>{status.nextMilestone}</strong>
          </div>
        </div>
      </section>

      <section className="shell kpi-grid" aria-label="Headline metrics">
        {kpis.map((item) => (
          <article className="kpi-card" key={item.label}>
            <div className="kpi-topline">
              <span>{item.label}</span>
              <StatusBadge value={item.status} />
            </div>
            <strong style={{ color: item.accent }}>{item.value}</strong>
            <p>{item.target}</p>
            <Progress value={item.progress} color={item.accent} />
          </article>
        ))}
      </section>

      <section className="shell main-grid">
        <div className="panel span-8">
          <div className="section-head">
            <div>
              <p className="eyebrow">Week of June 23, 2026</p>
              <h2>Community Engagement Pulse</h2>
            </div>
            <div className="rate-pill">16.9% patch rate</div>
          </div>

          <div className="highlight-grid">
            {weeklyHighlights.map((item) => (
              <article className="highlight" key={item.label}>
                <span style={{ background: item.color }} />
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </article>
            ))}
          </div>

          <div className="split-row">
            <div className="mini-panel">
              <h3>Digital reach</h3>
              <div className="metric-row">
                {digitalMetrics.map(([label, value]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mini-panel">
              <h3>Patch-through phone program</h3>
              <div className="metric-row compact">
                {patchStats.map(([label, value]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="office-table">
            <div className="table-title">
              <h3>Patches by office</h3>
              <span>{livePatchTotal} live / {voicemailTotal} voicemail</span>
            </div>
            {patchOffices.map((office) => (
              <div className="office-row" key={office.office}>
                <strong>{office.office}</strong>
                <div className="stacked-bar">
                  <span
                    className="bar-live"
                    style={{ width: `${(office.live / office.total) * 100}%` }}
                  />
                  <span
                    className="bar-vm"
                    style={{ width: `${(office.voicemail / office.total) * 100}%` }}
                  />
                </div>
                <span>{office.live} live</span>
                <span>{office.voicemail} VM</span>
                <b>{office.total}</b>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel span-4">
          <div className="section-head">
            <div>
              <p className="eyebrow">Sentiment</p>
              <h2>Mapped Stakeholders</h2>
            </div>
            <strong className="large-number">209</strong>
          </div>
          <div className="sentiment-bar">
            {sentiment.map((item) => (
              <span
                key={item.label}
                style={{
                  width: percent(item.value, sentimentTotal),
                  background: item.color,
                }}
              />
            ))}
          </div>
          <div className="legend-list">
            {sentiment.map((item) => (
              <div key={item.label}>
                <span style={{ background: item.color }} />
                <strong>{item.value}</strong>
                <p>{item.label}</p>
                <small>{percent(item.value, sentimentTotal)}</small>
              </div>
            ))}
          </div>
          <div className="callout">
            <span>Net sentiment</span>
            <strong>+29.2%</strong>
          </div>
          <a href="/1500-gateway/supportdetails" className="support-detail-btn">Stakeholder Detail →</a>
        </aside>
      </section>

      <section className="shell panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Council strategy</p>
            <h2>Decision-Maker Status</h2>
          </div>
          <span className="subtle">25 tracked touches</span>
        </div>

        <div className="decision-grid">
          {decisionMakers.map((person) => (
            <article className={`decision-card position-${person.position.toLowerCase().replace(/\s+/g, "-")}`} key={person.name}>
              <div className="decision-top">
                <span className="avatar">{person.initials}</span>
                <div>
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                </div>
                <StatusBadge value={person.position} />
              </div>
              <div className="decision-stats">
                <span>{person.touches} touches</span>
                <span>{person.influence}</span>
              </div>
              <p className="decision-note">{person.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell lower-grid">
        <div className="panel span-6">
          <div className="section-head">
            <div>
              <p className="eyebrow">Coalition</p>
              <h2>Validator Pipeline</h2>
            </div>
            <strong className="large-number">58</strong>
          </div>
          <div className="coalition-bars">
            {coalition.map((item) => (
              <div key={item.label}>
                <div className="bar-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <Progress value={(item.value / coalitionTotal) * 100} color={item.color} />
              </div>
            ))}
          </div>
          <div className="coalition-summary">
            <div>
              <strong>53</strong>
              <span>Secured</span>
            </div>
            <div>
              <strong>5</strong>
              <span>Meetings held</span>
            </div>
            <div>
              <strong>35</strong>
              <span>Validator target</span>
            </div>
          </div>
        </div>

        <div className="panel span-6">
          <div className="section-head">
            <div>
              <p className="eyebrow">Risk posture</p>
              <h2>Active Watch Items</h2>
            </div>
            <strong className="large-number">4</strong>
          </div>
          <div className="risk-list">
            {risks.map((risk) => (
              <article className="risk-item" key={risk.title}>
                <div>
                  <span className={`severity ${risk.severity.toLowerCase()}`}>{risk.severity}</span>
                  <h3>{risk.title}</h3>
                  <p>{risk.description}</p>
                </div>
                <small>{risk.mitigation}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell lower-grid">
        <div className="panel span-5">
          <div className="section-head">
            <div>
              <p className="eyebrow">Calendar</p>
              <h2>Upcoming Milestones</h2>
            </div>
          </div>
          <div className="timeline">
            {events.map((event) => (
              <article key={event.title + event.date}>
                <time>{event.date}</time>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.type}</p>
                  <span>{event.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel span-7">
          <div className="section-head">
            <div>
              <p className="eyebrow">Earned media</p>
              <h2>Priority Media Targets</h2>
            </div>
            <span className="subtle">14 total contacts</span>
          </div>
          <div className="media-table">
            <div className="media-row header">
              <span>Outlet</span>
              <span>Type</span>
              <span>Reach</span>
            </div>
            {mediaTargets.map(([outlet, type, reach]) => (
              <div className="media-row" key={outlet}>
                <strong>{outlet}</strong>
                <span>{type}</span>
                <span>{reach}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        :root {
          color-scheme: light;
          --ink: #102033;
          --muted: #5d6b7c;
          --line: #d9e2ec;
          --surface: #ffffff;
          --wash: #f4f7fb;
          --navy: #0c2340;
          --gold: #d99a22;
          --teal: #0f766e;
          --blue: #2563eb;
          --red: #dc2626;
          --green: #16a34a;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: var(--wash);
        }

        .gateway-page {
          min-height: 100vh;
          padding-bottom: 48px;
          font-family: Arial, Helvetica, sans-serif;
          color: var(--ink);
          background:
            linear-gradient(135deg, rgba(12, 35, 64, 0.96), rgba(15, 118, 110, 0.84)) 0 0 / 100% 360px no-repeat,
            linear-gradient(180deg, #eef3f8, #f8fafc 48%, #eef3f8);
        }

        .shell {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
        }

        .top-band {
          color: white;
          padding: 34px 0 20px;
        }

        .dashboard-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 24px;
          align-items: end;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: inherit;
          opacity: 0.74;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
        }

        h1 {
          max-width: 800px;
          margin-bottom: 12px;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 0.98;
          letter-spacing: 0;
        }

        .lede {
          max-width: 780px;
          margin-bottom: 0;
          color: rgba(255, 255, 255, 0.86);
          font-size: 18px;
          line-height: 1.55;
        }

        .meta-panel {
          display: grid;
          grid-template-columns: 1fr;
          gap: 5px;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
        }

        .meta-panel span {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.68);
        }

        .meta-panel strong {
          margin-bottom: 8px;
          font-size: 16px;
        }

        .watch-text {
          color: #ffd166;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-top: 4px;
        }

        .kpi-card,
        .panel,
        .mini-panel,
        .highlight,
        .decision-card,
        .risk-item {
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--surface);
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
        }

        .kpi-card {
          min-height: 160px;
          padding: 18px;
        }

        .kpi-topline,
        .section-head,
        .decision-top,
        .table-title,
        .bar-label {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .kpi-topline span:first-child {
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.25;
          text-transform: uppercase;
        }

        .kpi-card strong {
          display: block;
          margin: 18px 0 4px;
          font-size: 38px;
          line-height: 1;
        }

        .kpi-card p {
          margin-bottom: 14px;
          color: var(--muted);
          font-size: 13px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-watch,
        .status-neutral {
          background: #fff7ed;
          color: #9a3412;
        }

        .status-on-track,
        .status-support {
          background: #ecfdf5;
          color: #047857;
        }

        .status-lean-oppose,
        .status-oppose {
          background: #fef2f2;
          color: #b91c1c;
        }

        .progress {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: #e8edf4;
        }

        .progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
        }

        .main-grid,
        .lower-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .panel {
          padding: 22px;
        }

        .span-4 {
          grid-column: span 4;
        }

        .span-5 {
          grid-column: span 5;
        }

        .span-6 {
          grid-column: span 6;
        }

        .span-7 {
          grid-column: span 7;
        }

        .span-8 {
          grid-column: span 8;
        }

        .section-head {
          margin-bottom: 18px;
        }

        .section-head .eyebrow {
          color: var(--muted);
          opacity: 1;
        }

        h2 {
          margin-bottom: 0;
          font-size: 24px;
          line-height: 1.15;
        }

        h3 {
          margin-bottom: 6px;
          font-size: 16px;
          line-height: 1.2;
        }

        .rate-pill,
        .subtle {
          color: var(--muted);
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .rate-pill {
          padding: 8px 10px;
          border-radius: 999px;
          background: #fff7ed;
          color: #9a3412;
        }

        .highlight-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .highlight {
          position: relative;
          min-height: 166px;
          padding: 16px;
          overflow: hidden;
        }

        .highlight > span {
          display: block;
          width: 36px;
          height: 5px;
          margin-bottom: 20px;
          border-radius: 999px;
        }

        .highlight p {
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .highlight strong {
          display: block;
          margin-bottom: 10px;
          font-size: 34px;
          line-height: 1;
        }

        .highlight small,
        .risk-item small {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .split-row {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 12px;
          margin-top: 12px;
        }

        .mini-panel {
          padding: 16px;
          box-shadow: none;
          background: #f8fafc;
        }

        .metric-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .metric-row.compact {
          grid-template-columns: repeat(4, 1fr);
        }

        .metric-row strong {
          display: block;
          color: var(--navy);
          font-size: 24px;
          line-height: 1;
        }

        .metric-row span {
          display: block;
          margin-top: 5px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .office-table {
          margin-top: 16px;
        }

        .office-row {
          display: grid;
          grid-template-columns: 150px minmax(130px, 1fr) 70px 60px 44px;
          gap: 12px;
          align-items: center;
          padding: 11px 0;
          border-top: 1px solid var(--line);
          color: var(--muted);
          font-size: 13px;
        }

        .office-row strong,
        .office-row b {
          color: var(--ink);
        }

        .stacked-bar {
          display: flex;
          height: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: #e5eaf0;
        }

        .bar-live {
          background: #2563eb;
        }

        .bar-vm {
          background: #d99a22;
        }

        .large-number {
          color: var(--navy);
          font-size: 36px;
          line-height: 1;
        }

        .sentiment-bar {
          display: flex;
          height: 22px;
          overflow: hidden;
          border-radius: 999px;
          background: #e5e7eb;
        }

        .legend-list {
          display: grid;
          gap: 12px;
          margin-top: 20px;
        }

        .legend-list div {
          display: grid;
          grid-template-columns: 12px 56px 1fr auto;
          gap: 10px;
          align-items: center;
        }

        .legend-list div > span {
          width: 12px;
          height: 12px;
          border-radius: 999px;
        }

        .legend-list p,
        .legend-list small {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }

        .callout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 22px;
          padding: 18px;
          border-radius: 8px;
          background: #ecfdf5;
          color: #047857;
        }

        .callout span {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .callout strong {
          font-size: 30px;
        }

        .support-detail-btn {
          display: block;
          margin-top: 16px;
          padding: 11px 18px;
          background: var(--accent, #0a2240);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 6px;
          text-align: center;
          transition: opacity 0.15s;
        }
        .support-detail-btn:hover { opacity: 0.85; }

        .decision-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .decision-card {
          min-height: 232px;
          padding: 14px;
          box-shadow: none;
        }

        .decision-top {
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr);
          align-items: center;
        }

        .decision-top .status {
          grid-column: 1 / -1;
          justify-self: start;
          margin-top: 8px;
        }

        .avatar {
          display: grid;
          place-items: center;
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: var(--navy);
          color: white;
          font-size: 13px;
          font-weight: 900;
        }

        .decision-card h3 {
          margin: 0;
          font-size: 15px;
        }

        .decision-card p {
          margin-bottom: 0;
        }

        .decision-top p,
        .decision-stats,
        .decision-note {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.45;
        }

        .decision-stats {
          display: grid;
          gap: 7px;
          margin: 16px 0 12px;
          padding: 10px 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          font-weight: 800;
        }

        .position-support {
          border-top: 5px solid var(--green);
        }

        .position-neutral {
          border-top: 5px solid var(--gold);
        }

        .position-lean-oppose {
          border-top: 5px solid var(--red);
        }

        .coalition-bars {
          display: grid;
          gap: 16px;
        }

        .bar-label {
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 800;
        }

        .bar-label strong {
          color: var(--ink);
        }

        .coalition-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 22px;
        }

        .coalition-summary div {
          padding: 14px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .coalition-summary strong {
          display: block;
          color: var(--navy);
          font-size: 28px;
          line-height: 1;
        }

        .coalition-summary span {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
        }

        .risk-list {
          display: grid;
          gap: 12px;
        }

        .risk-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(170px, 0.72fr);
          gap: 18px;
          padding: 14px;
          box-shadow: none;
          background: #fff;
        }

        .risk-item p {
          margin-bottom: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .severity {
          display: inline-block;
          margin-bottom: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .severity.high {
          background: #fef2f2;
          color: #b91c1c;
        }

        .severity.medium {
          background: #fff7ed;
          color: #9a3412;
        }

        .timeline {
          display: grid;
          gap: 14px;
        }

        .timeline article {
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--line);
        }

        .timeline article:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        time {
          display: grid;
          place-items: center;
          height: 54px;
          border-radius: 8px;
          background: var(--navy);
          color: white;
          font-weight: 900;
        }

        .timeline p,
        .timeline span {
          display: block;
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.4;
        }

        .timeline span {
          margin-top: 5px;
          color: #0f766e;
          font-weight: 800;
        }

        .media-table {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 8px;
        }

        .media-row {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr 1fr;
          gap: 14px;
          padding: 11px 14px;
          border-top: 1px solid var(--line);
          color: var(--muted);
          font-size: 13px;
        }

        .media-row:first-child {
          border-top: 0;
        }

        .media-row.header {
          background: var(--navy);
          color: white;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .media-row strong {
          color: var(--ink);
        }

        @media (max-width: 1100px) {
          .kpi-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .span-4,
          .span-5,
          .span-6,
          .span-7,
          .span-8 {
            grid-column: span 12;
          }

        }

        @media (max-width: 760px) {
          .gateway-page {
            background:
              linear-gradient(135deg, rgba(12, 35, 64, 0.98), rgba(15, 118, 110, 0.9)) 0 0 / 100% 520px no-repeat,
              linear-gradient(180deg, #eef3f8, #f8fafc 48%, #eef3f8);
          }

          .dashboard-head,
          .split-row,
          .highlight-grid,
          .kpi-grid,
          .decision-grid,
          .coalition-summary {
            grid-template-columns: 1fr;
          }

          .top-band {
            padding-top: 24px;
          }

          .panel,
          .kpi-card {
            padding: 16px;
          }

          .section-head,
          .kpi-topline,
          .decision-top,
          .table-title {
            align-items: flex-start;
            flex-direction: column;
          }

          .office-row {
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .metric-row,
          .metric-row.compact {
            grid-template-columns: repeat(2, 1fr);
          }

          .risk-item,
          .media-row {
            grid-template-columns: 1fr;
          }

          .timeline article {
            grid-template-columns: 58px 1fr;
          }
        }
      `}</style>
    </main>
  );
}
