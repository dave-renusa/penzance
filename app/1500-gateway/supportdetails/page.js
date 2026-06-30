"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const SUPPORTERS_URL  = "https://dave-renusa.github.io/gateway/data/supporters.json";
const UNION_RALLY_URL = "https://dave-renusa.github.io/gateway/data/union_rally.json";
const ADVOCATES_URL   = "https://dave-renusa.github.io/gateway/data/advocates.json";

const MONTHS = { "01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun","07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec" };

const MONTH_NUM = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};

function parseLeadingDate(text) {
  // "6/2/26", "6/2/2026", "6/2"
  let m = text.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (m) {
    const mo=parseInt(m[1]), day=parseInt(m[2]);
    const yr=m[3]?(m[3].length===2?2000+parseInt(m[3]):parseInt(m[3])):2026;
    if(mo>=1&&mo<=12&&day>=1&&day<=31)
      return `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  // "May 29th", "April 14th –", "June 3rd", "Nov 6th" (Nov–Dec = 2025)
  m = text.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})/i);
  if (m) {
    const mo=MONTH_NUM[m[1].toLowerCase().slice(0,3)], day=parseInt(m[2]);
    if(mo&&day>=1&&day<=31) {
      const yr = mo >= 10 ? 2025 : 2026;
      return `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
  }
  return null;
}

function isoToDisplay(iso) {
  const [yr,mo,day]=iso.split("-");
  return `${MONTHS[mo]} ${parseInt(day)}, ${yr}`;
}

function inferTier(r) {
  const a = (r["Assessment"] || "").toLowerCase();
  if (a.includes("declin") || a.includes("inactive")) return "Declined / Inactive";
  if (a.includes("advocate")) return "Active Advocate";
  if ([3,4,5,6,7].some(i => (r[`Contact #${i}`]||"").trim())) return "Active Advocate";
  if (a.includes("support")) return "Willing Supporter";
  if ((r["3/23 Dinner"]||"").trim()) return "Engaged (Dinner)";
  return "Tracked Contact";
}

function inferSector(r) {
  const t = (r["Type"] || "").trim().toLowerCase();
  if (t.includes("labor")) return "Labor";
  if (t.includes("business")) return "Business";
  if (t.includes("economic")) return "Economic Development";
  if (t.includes("civic") || t.includes("citizen")) return "Civic / Citizens";
  if (t.includes("education")) return "Education";
  return "Other";
}

function buildEvents(r) {
  const events = [];
  if ((r["2/6 Notes"]||"").trim()) {
    events.push({ date:"2026-02-06", date_display:"Feb 06, 2026", source:"2/6 Notes", text:r["2/6 Notes"].trim() });
  }
  if ((r["3/23 Dinner"]||"").trim()) {
    events.push({ date:"2026-03-23", date_display:"Mar 23, 2026", source:"3/23 Dinner", text:"Attended 3/23 Dinner" });
  }
  if ((r["Attending May 12"]||"").trim()) {
    events.push({ date:"2026-05-12", date_display:"May 12, 2026", source:"May 12 Event", text:r["Attending May 12"].trim() });
  }
  for (let i = 1; i <= 7; i++) {
    const val = (r[`Contact #${i}`]||"").trim();
    if (val) events.push({ date:null, date_display:`Contact #${i}`, source:`Contact #${i}`, text:val });
  }
  const notes = (r["Key Issues/Notes"]||"").trim();
  if (notes) {
    notes.split("\n").filter(n=>n.trim()).forEach(n => {
      const trimmed = n.trim();
      const date = parseLeadingDate(trimmed);
      events.push({ date, date_display: date ? isoToDisplay(date) : "Notes", source:"Key Issues/Notes", text:trimmed });
    });
  }
  return events;
}

function transform(rows, source="main") {
  return rows.map((r, idx) => {
    const name = [r["First"], r["Last"]].filter(Boolean).join(" ").trim()
      || (r["Name"]||"").trim();
    if (!name) return null;
    const org = r["Organization"] || r["Organization 2"] || r["Union"] || r["Org"] || "";
    const title = r["Title"] || r["Title 2"] || r["Role"] || "";
    const occupation = [title, org].filter(Boolean).join(", ");
    const sector = source === "union" ? "Labor" : inferSector(r);
    const tier = source === "union" ? "Active Advocate"
      : source === "advocates" ? "Active Advocate"
      : inferTier(r);
    const events = source === "main" ? buildEvents(r) : [];

    // For union rally / advocates, surface notes/commitment as an undated event
    if (source === "union") {
      const notes = (r["Notes"] || r["Key Issues/Notes"] || r["Commitment"] || "").trim();
      if (notes) events.push({ date:null, date_display:"Notes", source:"Union Rally", text:notes });
    }
    if (source === "advocates") {
      const notes = (r["Notes"] || r["Key Issues/Notes"] || r["Commitment"] || r["Ask"] || "").trim();
      if (notes) events.push({ date:null, date_display:"Notes", source:"Advocates List", text:notes });
    }

    const dated = events.filter(e=>e.date).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
    return {
      id:`${source[0]}${idx}`, name, occupation, sector, tier,
      source,
      event_count: events.length,
      first_touch: dated[0]?.date_display||"",
      latest_touch: dated[dated.length-1]?.date_display||"",
      first_touch_iso: dated[0]?.date||"",
      latest_touch_iso: dated[dated.length-1]?.date||"",
      events,
    };
  }).filter(Boolean);
}

function buildStats(people) {
  const sectorMap = {};
  people.forEach(p => {
    if (!sectorMap[p.sector]) sectorMap[p.sector] = { sector:p.sector, total:0, active_advocate:0, willing_supporter:0, engaged_dinner:0, tracked:0, declined:0 };
    const s = sectorMap[p.sector];
    s.total++;
    if (p.tier==="Active Advocate") s.active_advocate++;
    else if (p.tier==="Willing Supporter") s.willing_supporter++;
    else if (p.tier==="Engaged (Dinner)") s.engaged_dinner++;
    else if (p.tier==="Declined / Inactive") s.declined++;
    else s.tracked++;
  });

  const monthMap = {};
  people.forEach(p => {
    p.events.forEach(e => {
      if (e.date && e.date >= "2026-01-01") {
        const ym = e.date.slice(0,7);
        if (!monthMap[ym]) monthMap[ym] = { events:0, people:new Set() };
        monthMap[ym].events++;
        monthMap[ym].people.add(p.id);
      }
    });
  });

  return {
    stats: {
      total: people.length,
      advocates: people.filter(p=>p.tier==="Active Advocate").length,
      supporters: people.filter(p=>p.tier==="Willing Supporter").length,
      dinner: people.filter(p=>p.tier==="Engaged (Dinner)").length,
      touchpoints: people.reduce((s,p)=>s+p.events.filter(e=>e.date).length, 0),
    },
    sectors: Object.values(sectorMap).sort((a,b)=>b.total-a.total),
    monthly: Object.entries(monthMap).sort((a,b)=>a[0].localeCompare(b[0])).map(([ym,d])=>{
      const [yr,mo] = ym.split("-");
      return { month:`${MONTHS[mo]} ${yr}`, events:d.events, unique:d.people.size };
    }),
  };
}

const TIER_CLASS = { "Active Advocate":"advocate","Willing Supporter":"supporter","Engaged (Dinner)":"engaged","Declined / Inactive":"declined","Tracked Contact":"tracked" };

export default function SupportDetails() {
  const [people, setPeople]         = useState(null);
  const [advocates, setAdvocates]   = useState(null);
  const [derived, setDerived]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeSector, setActiveSector] = useState(null);
  const [activeTab, setActiveTab]   = useState("coalition");
  const [search, setSearch]         = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [sort, setSort]             = useState("touches");
  const [tableSort, setTableSort]   = useState("touches");
  const [modal, setModal]           = useState(null);

  useEffect(() => {
    Promise.allSettled([
      fetch(SUPPORTERS_URL).then(r=>r.json()),
      fetch(UNION_RALLY_URL).then(r=>r.json()),
      fetch(ADVOCATES_URL).then(r=>r.json()),
    ]).then(([suppRes, rallyRes, advRes]) => {
      const suppPeople  = suppRes.status==="fulfilled"  ? transform(suppRes.value, "main") : [];
      const rallyPeople = rallyRes.status==="fulfilled" ? transform(rallyRes.value, "union") : [];
      const advPeople   = advRes.status==="fulfilled"   ? transform(advRes.value, "advocates") : [];

      const allPeople = [...suppPeople, ...rallyPeople];
      setPeople(allPeople);
      setAdvocates([
        ...allPeople.filter(p=>p.tier==="Active Advocate"),
        ...advPeople.filter(p=>!allPeople.some(a=>a.name===p.name)),
      ]);
      setDerived(buildStats(allPeople));
      setLoading(false);
    }).catch(e=>{ setError(e.message); setLoading(false); });
  }, []);

  function filtered() {
    if (!people) return [];
    let list = people.slice();
    if (activeSector) list = list.filter(p=>p.sector===activeSector);
    if (search) { const q=search.toLowerCase(); list=list.filter(p=>p.name.toLowerCase().includes(q)||(p.occupation||"").toLowerCase().includes(q)); }
    if (tierFilter) list = list.filter(p=>p.tier===tierFilter);
    if (sort==="touches") list.sort((a,b)=>b.event_count-a.event_count||a.name.localeCompare(b.name));
    else if (sort==="recent") list.sort((a,b)=>(b.latest_touch_iso||"").localeCompare(a.latest_touch_iso||"")||a.name.localeCompare(b.name));
    else list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  }

  function tableSorted() {
    if (!people) return [];
    let list = people.slice();
    if (tableSort==="touches") list.sort((a,b)=>b.event_count-a.event_count||a.name.localeCompare(b.name));
    else if (tableSort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
    else list.sort((a,b)=>a.sector.localeCompare(b.sector)||b.event_count-a.event_count);
    return list;
  }

  return (
    <>
      <style>{`
        :root{color-scheme:light;--ink:#102033;--muted:#5d6b7c;--line:#d9e2ec;--surface:#ffffff;--wash:#f4f7fb;--navy:#0c2340;--gold:#d99a22;--teal:#0f766e;--blue:#2563eb;--red:#dc2626;--green:#16a34a;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:Arial,Helvetica,sans-serif;background:var(--wash);color:var(--ink);font-size:15px;line-height:1.5;}
        h1,h2,h3,h4{margin:0;}

        /* Header */
        .sd-page{min-height:100vh;padding-bottom:48px;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:linear-gradient(135deg,rgba(12,35,64,0.96),rgba(15,118,110,0.84)) 0 0/100% 280px no-repeat,linear-gradient(180deg,#eef3f8,#f8fafc 48%,#eef3f8);}
        .hdr{color:#fff;padding:28px 0 20px;}
        .shell{width:min(1180px,calc(100% - 32px));margin:0 auto;}
        .hdr-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7);text-decoration:none;margin-bottom:14px;}
        .hdr-back:hover{color:#fff;}
        .hdr-top{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;}
        .hdr-title{font-size:clamp(28px,4vw,52px);font-weight:900;line-height:1;letter-spacing:-.01em;}
        .hdr-sub{font-size:13px;color:rgba(255,255,255,.65);margin-top:6px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
        .hdr-meta{text-align:right;font-size:12px;color:rgba(255,255,255,.6);}
        .hdr-meta strong{display:block;color:var(--gold);font-size:13px;font-weight:800;letter-spacing:.05em;}

        /* Nav */
        .nav{background:rgba(12,35,64,.55);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,.12);}
        .nav-inner{display:flex;gap:2px;padding:0;width:min(1180px,calc(100% - 32px));margin:0 auto;overflow-x:auto;}
        .nav button{background:none;border:none;color:rgba(255,255,255,.6);padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-bottom:3px solid transparent;transition:all .15s;white-space:nowrap;}
        .nav button:hover{color:#fff;}
        .nav button.active{color:#fff;border-bottom-color:var(--gold);}

        /* Container */
        .container{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:28px 0 0;}

        /* Stat cards */
        .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:28px;}
        .stat-card{background:var(--surface);border:1px solid var(--line);border-radius:8px;border-top:4px solid var(--navy);padding:18px 20px;box-shadow:0 14px 40px rgba(15,23,42,.06);}
        .stat-card.gold{border-top-color:var(--gold);}
        .stat-card.green{border-top-color:var(--green);}
        .stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:800;}
        .stat-value{font-size:48px;font-weight:900;line-height:1;color:var(--navy);margin-top:6px;}
        .stat-card.gold .stat-value{color:var(--gold);}
        .stat-card.green .stat-value{color:var(--green);}
        .stat-foot{font-size:12px;color:var(--muted);margin-top:4px;}

        /* Tabs */
        .tab-content{display:none;}.tab-content.active{display:block;}

        /* Section panels */
        .section{background:var(--surface);border:1px solid var(--line);border-radius:8px;margin-bottom:20px;overflow:hidden;box-shadow:0 14px 40px rgba(15,23,42,.06);}
        .section-head{background:var(--navy);color:#fff;padding:14px 22px;display:flex;justify-content:space-between;align-items:center;}
        .section-head h2{font-size:18px;font-weight:800;letter-spacing:.02em;}
        .section-head .head-meta{font-size:12px;color:rgba(255,255,255,.6);font-weight:700;letter-spacing:.05em;text-transform:uppercase;}

        /* Sector grid */
        .sector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;padding:20px;}
        .sector-card{background:var(--wash);border:1px solid var(--line);border-left:4px solid var(--navy);border-radius:6px;padding:16px 18px;cursor:pointer;transition:all .15s;}
        .sector-card:hover{background:var(--surface);border-left-color:var(--gold);transform:translateY(-2px);box-shadow:0 4px 12px rgba(15,23,42,.08);}
        .sector-card.active{background:var(--navy);color:#fff;border-left-color:var(--gold);}
        .sector-card.active .sec-meta{color:rgba(255,255,255,.6);}
        .sector-card.active .sec-count{color:var(--gold);}
        .sec-name{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;}
        .sec-count{font-size:32px;font-weight:900;line-height:1;color:var(--navy);margin-top:6px;}
        .sec-meta{font-size:12px;color:var(--muted);margin-top:4px;}
        .sec-bar{margin-top:10px;display:flex;height:6px;background:var(--line);border-radius:999px;overflow:hidden;}

        /* Tier legend + filter bar */
        .tier-legend{display:flex;gap:16px;flex-wrap:wrap;padding:12px 20px;background:var(--wash);border-bottom:1px solid var(--line);align-items:center;}
        .tier-legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);}
        .tier-legend-bar{width:12px;height:10px;border-radius:2px;}
        .tier-legend strong{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:800;}
        .filter-bar{display:flex;gap:10px;flex-wrap:wrap;padding:12px 20px;background:var(--wash);border-bottom:1px solid var(--line);align-items:center;}
        .filter-label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:800;}
        .filter-bar select,.filter-bar input{font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink);}
        .filter-bar input{min-width:200px;}
        .filter-bar button{font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:6px 14px;border:1px solid var(--navy);border-radius:6px;background:var(--surface);color:var(--navy);cursor:pointer;}
        .filter-bar button:hover{background:var(--navy);color:#fff;}
        .results-count{margin-left:auto;font-size:13px;color:var(--muted);}

        /* People grid */
        .people-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;padding:20px;}
        .person-card{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:14px 16px;cursor:pointer;transition:all .15s;position:relative;border-left:4px solid var(--line);}
        .person-card:hover{border-color:var(--gold);transform:translateY(-1px);box-shadow:0 4px 12px rgba(15,23,42,.1);}
        .person-card.tier-advocate{border-left-color:var(--green);}
        .person-card.tier-supporter{border-left-color:var(--gold);}
        .person-card.tier-engaged{border-left-color:var(--teal);}
        .person-card.tier-declined{border-left-color:var(--red);opacity:.7;}
        .person-card.source-union::after{content:'UNION';position:absolute;top:8px;right:8px;font-size:9px;font-weight:800;letter-spacing:.1em;background:var(--gold);color:#fff;padding:2px 6px;border-radius:3px;}
        .person-name{font-size:15px;font-weight:800;color:var(--navy);}
        .person-occ{font-size:12px;color:var(--muted);line-height:1.35;margin-top:3px;min-height:28px;}
        .person-meta{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid var(--line);}
        .tier-pill{font-size:10px;text-transform:uppercase;letter-spacing:.08em;padding:3px 8px;border-radius:999px;font-weight:800;}
        .pill-advocate{background:#ecfdf5;color:#047857;}
        .pill-supporter{background:#fffbeb;color:#92400e;}
        .pill-engaged{background:#f0fdfa;color:#0f766e;}
        .pill-declined{background:#fef2f2;color:#b91c1c;}
        .pill-tracked{background:var(--wash);color:var(--muted);}
        .person-touches{font-size:22px;font-weight:900;color:var(--navy);line-height:1;}
        .person-touches small{font-size:10px;color:var(--muted);display:block;letter-spacing:.08em;text-transform:uppercase;font-weight:700;}
        .empty{text-align:center;padding:60px 20px;color:var(--muted);}

        /* Modal */
        .modal-overlay{display:none;position:fixed;inset:0;background:rgba(12,35,64,.7);z-index:1000;align-items:flex-start;justify-content:center;padding:60px 20px;overflow-y:auto;}
        .modal-overlay.open{display:flex;}
        .modal{background:var(--surface);width:100%;max-width:680px;border-radius:10px;overflow:hidden;box-shadow:0 24px 64px rgba(12,35,64,.3);}
        .modal-head{background:var(--navy);color:#fff;padding:20px 24px;border-bottom:3px solid var(--gold);position:relative;}
        .modal-head h2{font-size:24px;font-weight:900;line-height:1;}
        .modal-head p{font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;}
        .modal-close{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#fff;width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:16px;line-height:1;}
        .modal-close:hover{background:var(--red);border-color:var(--red);}
        .modal-body{padding:22px;max-height:60vh;overflow-y:auto;background:var(--wash);}
        .modal-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
        .modal-stat{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px;text-align:center;}
        .modal-stat-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:800;}
        .modal-stat-value{font-size:24px;font-weight:900;color:var(--navy);line-height:1;margin-top:4px;}
        .modal-h3{font-size:14px;font-weight:800;color:var(--navy);margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em;}

        /* Timeline (modal) */
        .tl{position:relative;padding-left:22px;}
        .tl::before{content:'';position:absolute;left:4px;top:8px;bottom:8px;width:2px;background:var(--line);}
        .tl-event{position:relative;padding-bottom:16px;}
        .tl-event::before{content:'';position:absolute;left:-20px;top:6px;width:10px;height:10px;background:var(--gold);border:2px solid var(--surface);border-radius:50%;box-shadow:0 0 0 1px var(--line);}
        .tl-date{font-size:12px;font-weight:800;color:var(--navy);letter-spacing:.05em;text-transform:uppercase;}
        .tl-source{font-size:11px;color:var(--muted);margin-left:7px;font-style:italic;}
        .tl-text{font-size:13px;color:var(--ink);margin-top:3px;line-height:1.5;}

        /* Monthly bars */
        .monthly-bars{display:flex;align-items:stretch;gap:10px;height:220px;padding:16px 0 0;border-bottom:2px solid var(--line);margin:0 22px 22px;}
        .monthly-bar{flex:1;display:flex;flex-direction:column;align-items:center;min-width:0;justify-content:flex-end;}
        .bar-stack{width:100%;max-width:64px;display:flex;flex-direction:column;justify-content:flex-end;flex:1;min-height:0;}
        .bar-block{width:100%;position:relative;transition:opacity .15s;min-height:20px;border-radius:4px 4px 0 0;}
        .bar-block:hover{opacity:.85;}
        .bar-value{color:#fff;font-size:14px;font-weight:900;text-align:center;padding:3px 0;line-height:1;}
        .bar-lbl{font-size:11px;font-weight:800;color:var(--navy);margin-top:6px;text-align:center;text-transform:uppercase;letter-spacing:.05em;}
        .bar-lbl small{display:block;font-size:10px;color:var(--muted);font-weight:400;margin-top:1px;text-transform:none;letter-spacing:0;}

        /* Activity log */
        .activity-month-head{background:var(--navy);color:#fff;padding:7px 16px;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin:18px 0 0;}
        .activity-row{display:grid;grid-template-columns:80px 1fr;gap:14px;padding:12px 20px;border-bottom:1px solid var(--line);cursor:pointer;}
        .activity-row:hover{background:var(--wash);}
        .activity-date{font-size:13px;font-weight:800;color:var(--navy);}

        /* Table */
        .tbl-wrap{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;font-size:13px;}
        thead tr{background:var(--navy);color:#fff;}
        th{text-align:left;padding:10px 14px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;}
        td{padding:10px 14px;border-bottom:1px solid var(--line);}
        tr.tbl-row{cursor:pointer;}
        tr.tbl-row:hover td{background:var(--wash);}

        /* Advocates grid */
        .adv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;padding:20px;}
        .adv-card{background:var(--surface);border:1px solid var(--line);border-top:4px solid var(--green);border-radius:8px;padding:18px 20px;cursor:pointer;transition:all .15s;box-shadow:0 2px 8px rgba(15,23,42,.04);}
        .adv-card:hover{box-shadow:0 8px 24px rgba(15,23,42,.1);transform:translateY(-2px);}
        .adv-card.union{border-top-color:var(--gold);}
        .adv-name{font-size:16px;font-weight:800;color:var(--navy);}
        .adv-org{font-size:12px;color:var(--muted);margin-top:3px;}
        .adv-badge{display:inline-flex;align-items:center;margin-top:10px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:999px;}
        .adv-badge.green{background:#ecfdf5;color:#047857;}
        .adv-badge.gold{background:#fffbeb;color:#92400e;}
        .adv-notes{font-size:12px;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--line);line-height:1.5;}

        /* Footer */
        .footer{margin-top:48px;}
        .footer-bar{background:var(--navy);color:rgba(255,255,255,.6);padding:16px 0;font-size:12px;}
        .footer-inner{width:min(1180px,calc(100% - 32px));margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;}
        .footer-bar strong{color:var(--gold);font-weight:800;font-size:14px;letter-spacing:.05em;}

        @media(max-width:768px){
          .hdr-title{font-size:26px;}
          .stats-row{grid-template-columns:repeat(2,1fr);}
          .people-grid,.adv-grid{grid-template-columns:1fr;}
          .modal-stats{grid-template-columns:1fr 1fr;}
        }
      `}</style>

      <div className="sd-page">
        <header className="hdr">
          <div className="shell">
            <Link href="/1500-gateway" className="hdr-back">← Back to Dashboard</Link>
            <div className="hdr-top">
              <div>
                <div className="hdr-title">1500 Gateway — Supporter Coalition</div>
                <div className="hdr-sub">Fredericksburg, VA · Stakeholder Detail</div>
              </div>
              <div className="hdr-meta">
                <strong>Penzance Development</strong>
                Source: Supporter tracking database
              </div>
            </div>
          </div>
        </header>

        <nav className="nav">
          <div className="nav-inner">
            {[
              ["coalition","Coalition"],
              ["people","All Supporters"],
              ["advocates","Advocates"],
              ["timeline","Activity Timeline"],
            ].map(([id,label])=>(
              <button key={id} className={activeTab===id?"active":""} onClick={()=>setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="container">
          {loading && <div style={{textAlign:"center",padding:"60px",color:"var(--muted)",fontSize:"18px",fontWeight:800,letterSpacing:".05em",textTransform:"uppercase"}}>Loading coalition data…</div>}
          {error && <div style={{textAlign:"center",padding:"60px",color:"var(--red)"}}>Error loading data: {error}</div>}

          {derived && <>
            {/* Stats */}
            <div className="stats-row">
              <div className="stat-card green">
                <div className="stat-label">Active Advocates</div>
                <div className="stat-value">{derived.stats.advocates}</div>
                <div className="stat-foot">Multiple council contacts</div>
              </div>
              <div className="stat-card gold">
                <div className="stat-label">Willing Supporters</div>
                <div className="stat-value">{derived.stats.supporters}</div>
                <div className="stat-foot">Confirmed supporters</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Dinner Guests</div>
                <div className="stat-value">{derived.stats.dinner}</div>
                <div className="stat-foot">3/23 dinner attendees</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total in Coalition</div>
                <div className="stat-value">{derived.stats.total}</div>
                <div className="stat-foot">Across all sectors</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Touchpoints</div>
                <div className="stat-value">{derived.stats.touchpoints}</div>
                <div className="stat-foot">Dated engagement events</div>
              </div>
            </div>

            {/* Coalition Tab */}
            <div className={`tab-content${activeTab==="coalition"?" active":""}`}>
              <div className="section">
                <div className="section-head">
                  <h2>Coalition By Sector</h2>
                  <span className="head-meta">Click a sector to filter below</span>
                </div>
                <div className="sector-grid">
                  {derived.sectors.map(s=>(
                    <div key={s.sector} className={`sector-card${activeSector===s.sector?" active":""}`} onClick={()=>setActiveSector(activeSector===s.sector?null:s.sector)}>
                      <div className="sec-name">{s.sector}</div>
                      <div className="sec-count">{s.total}</div>
                      <div className="sec-meta">{s.active_advocate} advocates · {s.willing_supporter} supporters</div>
                      <div className="sec-bar">
                        {s.active_advocate>0&&<div style={{width:`${(s.active_advocate/s.total)*100}%`,background:"var(--green)"}} />}
                        {s.willing_supporter>0&&<div style={{width:`${(s.willing_supporter/s.total)*100}%`,background:"var(--gold)"}} />}
                        {s.engaged_dinner>0&&<div style={{width:`${(s.engaged_dinner/s.total)*100}%`,background:"var(--teal)"}} />}
                        {s.tracked>0&&<div style={{width:`${(s.tracked/s.total)*100}%`,background:"var(--line)"}} />}
                        {s.declined>0&&<div style={{width:`${(s.declined/s.total)*100}%`,background:"var(--red)"}} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <div className="section-head">
                  <h2>{activeSector||"All Supporters"}</h2>
                  <span className="head-meta">Click a card for engagement detail</span>
                </div>
                <div className="tier-legend">
                  <strong>Tier:</strong>
                  <div className="tier-legend-item"><div className="tier-legend-bar" style={{background:"var(--green)"}} />Active Advocate</div>
                  <div className="tier-legend-item"><div className="tier-legend-bar" style={{background:"var(--gold)"}} />Willing Supporter</div>
                  <div className="tier-legend-item"><div className="tier-legend-bar" style={{background:"var(--teal)"}} />Engaged (Dinner)</div>
                  <div className="tier-legend-item"><div className="tier-legend-bar" style={{background:"var(--line)"}} />Tracked Contact</div>
                  <div className="tier-legend-item"><div className="tier-legend-bar" style={{background:"var(--red)"}} />Declined</div>
                </div>
                <div className="filter-bar">
                  <span className="filter-label">Search</span>
                  <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or organization…" />
                  <span className="filter-label">Tier</span>
                  <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)}>
                    <option value="">All</option>
                    <option>Active Advocate</option>
                    <option>Willing Supporter</option>
                    <option>Engaged (Dinner)</option>
                    <option>Tracked Contact</option>
                    <option>Declined / Inactive</option>
                  </select>
                  <span className="filter-label">Sort</span>
                  <select value={sort} onChange={e=>setSort(e.target.value)}>
                    <option value="touches">Most touches</option>
                    <option value="recent">Most recent</option>
                    <option value="name">Name A–Z</option>
                  </select>
                  <button onClick={()=>{setSearch("");setTierFilter("");setSort("touches");setActiveSector(null);}}>Reset</button>
                  <span className="results-count">{filtered().length} of {people.length}</span>
                </div>
                <div className="people-grid">
                  {filtered().length===0
                    ? <div className="empty"><p style={{fontSize:18,fontWeight:800}}>No matches</p><p style={{marginTop:6}}>Adjust your filters.</p></div>
                    : filtered().map(p=>(
                      <div key={p.id} className={`person-card tier-${TIER_CLASS[p.tier]}${p.source==="union"?" source-union":""}`} onClick={()=>setModal(p)}>
                        <div className="person-name">{p.name}</div>
                        <div className="person-occ">{p.occupation||"No role recorded"}</div>
                        <div className="person-meta">
                          <span className={`tier-pill pill-${TIER_CLASS[p.tier]}`}>{p.tier}</span>
                          <div className="person-touches">{p.event_count}<small>touches</small></div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* All Supporters Tab */}
            <div className={`tab-content${activeTab==="people"?" active":""}`}>
              <div className="section">
                <div className="section-head">
                  <h2>Complete Supporter Roster</h2>
                  <span className="head-meta">Sortable view</span>
                </div>
                <div className="filter-bar">
                  <span className="filter-label">Sort</span>
                  <select value={tableSort} onChange={e=>setTableSort(e.target.value)}>
                    <option value="touches">Most touches</option>
                    <option value="name">Name A–Z</option>
                    <option value="sector">By sector</option>
                  </select>
                </div>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Sector</th><th>Role / Org</th><th>Tier</th><th>Touches</th><th>First</th><th>Latest</th></tr></thead>
                    <tbody>
                      {tableSorted().map(p=>{
                        const tierColor={"Active Advocate":"var(--green)","Willing Supporter":"#92400e","Engaged (Dinner)":"var(--teal)","Declined / Inactive":"var(--red)","Tracked Contact":"var(--muted)"}[p.tier];
                        return (
                          <tr key={p.id} className="tbl-row" onClick={()=>setModal(p)} style={{background:p.source==="union"?"#fffbeb":""}}>
                            <td style={{fontWeight:700}}>{p.name}{p.source==="union"&&<span style={{marginLeft:6,fontSize:9,fontWeight:800,letterSpacing:".08em",background:"var(--gold)",color:"#fff",padding:"2px 5px",borderRadius:3}}>UNION</span>}</td>
                            <td style={{fontSize:12,color:"var(--muted)"}}>{p.sector}</td>
                            <td style={{fontSize:12,color:"var(--muted)"}}>{p.occupation||"—"}</td>
                            <td><span style={{fontSize:10,textTransform:"uppercase",letterSpacing:".06em",color:tierColor,fontWeight:800}}>{p.tier}</span></td>
                            <td style={{textAlign:"center",fontSize:18,fontWeight:900,color:"var(--navy)"}}>{p.event_count}</td>
                            <td style={{textAlign:"center",fontSize:12,color:"var(--muted)"}}>{p.first_touch||"—"}</td>
                            <td style={{textAlign:"center",fontSize:12,color:"var(--muted)"}}>{p.latest_touch||"—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Advocates Tab */}
            <div className={`tab-content${activeTab==="advocates"?" active":""}`}>
              <div className="section">
                <div className="section-head">
                  <h2>Active Advocates</h2>
                  <span className="head-meta">{advocates?.length||0} total · Green = coalition · Gold = union rally</span>
                </div>
                <div className="adv-grid">
                  {(advocates||[]).map(p=>(
                    <div key={p.id} className={`adv-card${p.source==="union"?" union":""}`} onClick={()=>setModal(p)}>
                      <div className="adv-name">{p.name}</div>
                      <div className="adv-org">{p.occupation||"No role recorded"}</div>
                      <div>
                        <span className={`adv-badge ${p.source==="union"?"gold":"green"}`}>
                          {p.source==="union"?"Union Rally":"Active Advocate"}
                        </span>
                        <span style={{marginLeft:8,fontSize:12,color:"var(--muted)"}}>{p.sector}</span>
                      </div>
                      {p.events.length>0&&(
                        <div className="adv-notes">
                          {p.events[0].text.slice(0,140)}{p.events[0].text.length>140?"…":""}
                        </div>
                      )}
                    </div>
                  ))}
                  {(advocates||[]).length===0&&(
                    <div className="empty" style={{gridColumn:"1/-1"}}><p style={{fontSize:16,fontWeight:800}}>No advocates loaded</p><p style={{marginTop:6}}>Check that Union Rally and Advocates sheets are published.</p></div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Tab */}
            <div className={`tab-content${activeTab==="timeline"?" active":""}`}>
              <div className="section">
                <div className="section-head">
                  <h2>Monthly Engagement Volume</h2>
                  <span className="head-meta">Dated events by month</span>
                </div>
                {derived.monthly.length===0
                  ? <div className="empty"><p>No dated events recorded.</p></div>
                  : <div className="monthly-bars">
                    {(()=>{
                      const max=Math.max(...derived.monthly.map(m=>m.events),1);
                      return derived.monthly.map(m=>(
                        <div key={m.month} className="monthly-bar">
                          <div className="bar-stack">
                            <div className="bar-block" style={{height:`${(m.events/max)*100}%`,background:"var(--navy)"}}>
                              <div className="bar-value">{m.events}</div>
                            </div>
                          </div>
                          <div className="bar-lbl">{m.month}<small>{m.unique} people</small></div>
                        </div>
                      ));
                    })()}
                  </div>
                }
              </div>
              <div className="section">
                <div className="section-head">
                  <h2>Campaign Activity Log</h2>
                  <span className="head-meta">All dated contact events</span>
                </div>
                {(()=>{
                  const allEvents=[];
                  (people||[]).forEach(p=>p.events.forEach(e=>{
                    if(e.date && e.date >= "2026-01-01") allEvents.push({...e,name:p.name,occupation:p.occupation,pid:p.id,person:p});
                  }));
                  allEvents.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
                  let prevMonth=null;
                  return allEvents.length===0
                    ? <div className="empty"><p>No dated events to display.</p></div>
                    : allEvents.map((e,i)=>{
                      const ym=e.date.slice(0,7);
                      const [yr,mo]=ym.split("-");
                      const monthLabel=`${MONTHS[mo]?.toUpperCase()} ${yr}`;
                      return (
                        <div key={i}>
                          {monthLabel!==prevMonth&&(prevMonth=monthLabel,<div className="activity-month-head">{monthLabel}</div>)}
                          <div className="activity-row" onClick={()=>setModal(e.person)}>
                            <div className="activity-date">{e.date_display.replace(", 2026","")}</div>
                            <div>
                              <div><strong style={{color:"var(--navy)"}}>{e.name}</strong><span style={{color:"var(--muted)",fontSize:13}}> · {e.occupation||""}</span></div>
                              <div style={{fontSize:13,marginTop:3,color:"var(--ink)"}}>{e.text}</div>
                              <div style={{fontSize:11,color:"var(--muted)",marginTop:3,fontStyle:"italic"}}>Source: {e.source}</div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          </>}
        </div>

        <div className="footer">
          <div className="footer-bar">
            <div className="footer-inner">
              <span><strong>RenUSA</strong> · Public affairs and community engagement</span>
              <span>Confidential · Penzance / 1500 Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal&&(
        <div className="modal-overlay open" onClick={e=>{if(e.target.className.includes("modal-overlay"))setModal(null);}}>
          <div className="modal">
            <div className="modal-head">
              <button className="modal-close" onClick={()=>setModal(null)}>×</button>
              <h2>{modal.name}</h2>
              <p>{modal.occupation||"No role recorded"} · {modal.sector}</p>
            </div>
            <div className="modal-body">
              <div className="modal-stats">
                <div className="modal-stat"><div className="modal-stat-label">Touchpoints</div><div className="modal-stat-value">{modal.event_count}</div></div>
                <div className="modal-stat"><div className="modal-stat-label">Tier</div><div className="modal-stat-value" style={{fontSize:14}}>{modal.tier}</div></div>
                <div className="modal-stat"><div className="modal-stat-label">Source</div><div className="modal-stat-value" style={{fontSize:14}}>{modal.source==="union"?"Union Rally":modal.source==="advocates"?"Advocates":modal.sector}</div></div>
              </div>
              <p className="modal-h3">Engagement Notes</p>
              <div className="tl">
                {modal.events.slice().sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")).map((e,i)=>(
                  <div key={i} className="tl-event">
                    <span className="tl-date">{e.date_display}</span>
                    <span className="tl-source">via {e.source}</span>
                    <div className="tl-text">{e.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
