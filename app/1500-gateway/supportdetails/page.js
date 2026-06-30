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
        :root{--navy:#0A2240;--navy-mid:#163356;--navy-light:#2C4A73;--gold:#C8963C;--gold-light:#E8C679;--red:#B03030;--cream:#F5F3EE;--cream-dark:#E8E5DD;--white:#FFFFFF;--text:#1A1A1A;--text-muted:#6B6B6B;--border:#D9D5CB;--green:#2E7D5B;--orange:#C4711F;}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Source Sans 3',sans-serif;background:var(--cream);color:var(--text);font-size:15px;line-height:1.5;}
        h1,h2,h3,h4{font-family:'Bebas Neue',sans-serif;font-weight:400;letter-spacing:0.5px;}
        .americana-stripe{height:4px;background:var(--red);}
        .gold-stripe{height:3px;background:var(--gold);}
        .hdr{background:var(--navy);color:var(--white);padding:24px 40px 20px;border-bottom:4px solid var(--gold);}
        .hdr-top{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px;}
        .hdr-title{font-family:'Bebas Neue',sans-serif;font-size:38px;letter-spacing:1.5px;line-height:1;}
        .hdr-sub{font-size:13px;color:var(--gold-light);margin-top:6px;letter-spacing:1px;text-transform:uppercase;}
        .hdr-meta{text-align:right;font-size:12px;color:var(--cream-dark);}
        .hdr-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--gold-light);text-decoration:none;letter-spacing:0.5px;margin-bottom:8px;}
        .hdr-back:hover{color:var(--white);}
        .nav{background:var(--navy-mid);padding:0 40px;display:flex;gap:4px;border-bottom:1px solid rgba(255,255,255,0.1);}
        .nav button{background:none;border:none;color:rgba(255,255,255,0.65);padding:14px 20px;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1.2px;cursor:pointer;border-bottom:3px solid transparent;transition:all 0.15s;}
        .nav button:hover{color:var(--white);}
        .nav button.active{color:var(--white);border-bottom-color:var(--gold);}
        .container{max-width:1400px;margin:0 auto;padding:32px 40px;}
        @media(max-width:768px){.container{padding:16px;}.hdr{padding:16px 20px;}.nav{padding:0 16px;overflow-x:auto;}.hdr-title{font-size:26px;}}
        .stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:32px;}
        .stat-card{background:var(--white);border:1px solid var(--border);border-top:4px solid var(--navy);padding:18px 20px;}
        .stat-card.gold{border-top-color:var(--gold);}
        .stat-card.green{border-top-color:var(--green);}
        .stat-label{font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-muted);font-weight:600;}
        .stat-value{font-family:'Bebas Neue',sans-serif;font-size:52px;line-height:1;color:var(--navy);margin-top:4px;}
        .stat-card.gold .stat-value{color:var(--gold);}
        .stat-card.green .stat-value{color:var(--green);}
        .stat-foot{font-size:12px;color:var(--text-muted);margin-top:4px;}
        .tab-content{display:none;}.tab-content.active{display:block;}
        .section{background:var(--white);border:1px solid var(--border);margin-bottom:32px;}
        .section-head{background:var(--navy);color:var(--white);padding:12px 20px;display:flex;justify-content:space-between;align-items:center;}
        .section-head h2{font-size:20px;letter-spacing:1px;}
        .section-head .head-meta{font-size:12px;color:var(--gold-light);letter-spacing:0.5px;text-transform:uppercase;}
        .sector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;padding:24px;}
        .sector-card{background:var(--cream);border:1px solid var(--border);border-left:5px solid var(--navy);padding:16px 18px;cursor:pointer;transition:all 0.15s;}
        .sector-card:hover{background:var(--white);border-left-color:var(--gold);transform:translateY(-2px);box-shadow:0 4px 12px rgba(10,34,64,0.08);}
        .sector-card.active{background:var(--navy);color:var(--white);border-left-color:var(--gold);}
        .sector-card.active .sec-meta{color:var(--gold-light);}
        .sec-name{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;line-height:1;}
        .sec-count{font-family:'Bebas Neue',sans-serif;font-size:34px;line-height:1;color:var(--navy);margin-top:6px;}
        .sector-card.active .sec-count{color:var(--gold);}
        .sec-meta{font-size:12px;color:var(--text-muted);margin-top:6px;}
        .sec-bar{margin-top:10px;display:flex;height:7px;background:var(--cream-dark);overflow:hidden;}
        .tier-legend{display:flex;gap:16px;flex-wrap:wrap;padding:14px 20px;background:var(--cream);border-top:1px solid var(--border);border-bottom:1px solid var(--border);align-items:center;}
        .tier-legend-item{display:flex;align-items:center;gap:7px;font-size:12px;}
        .tier-legend-bar{width:14px;height:12px;}
        .tier-legend strong{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);}
        .filter-bar{display:flex;gap:10px;flex-wrap:wrap;padding:14px 20px;background:var(--cream);border-bottom:1px solid var(--border);align-items:center;}
        .filter-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:700;}
        .filter-bar select,.filter-bar input{font-family:'Source Sans 3',sans-serif;font-size:14px;padding:6px 10px;border:1px solid var(--border);background:var(--white);color:var(--text);}
        .filter-bar input{min-width:200px;}
        .filter-bar button{font-family:'Bebas Neue',sans-serif;letter-spacing:1px;padding:6px 14px;border:1px solid var(--navy);background:var(--white);color:var(--navy);cursor:pointer;font-size:14px;}
        .filter-bar button:hover{background:var(--navy);color:var(--white);}
        .results-count{margin-left:auto;font-size:13px;color:var(--text-muted);}
        .people-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;padding:20px;}
        .person-card{background:var(--white);border:1px solid var(--border);padding:14px 16px;cursor:pointer;transition:all 0.15s;position:relative;border-left:4px solid var(--navy-light);}
        .person-card:hover{border-color:var(--gold);transform:translateY(-1px);box-shadow:0 4px 12px rgba(10,34,64,0.1);}
        .person-card.tier-advocate{border-left-color:var(--green);}
        .person-card.tier-supporter{border-left-color:var(--gold);}
        .person-card.tier-engaged{border-left-color:var(--navy-light);}
        .person-card.tier-declined{border-left-color:var(--red);opacity:0.7;}
        .person-card.source-union::after{content:'UNION';position:absolute;top:8px;right:8px;font-size:9px;font-weight:700;letter-spacing:1px;background:var(--gold);color:var(--white);padding:2px 5px;}
        .person-name{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:0.5px;color:var(--navy);}
        .person-occ{font-size:12px;color:var(--text-muted);line-height:1.35;margin-top:3px;min-height:28px;}
        .person-meta{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid var(--border);}
        .tier-pill{font-size:10px;text-transform:uppercase;letter-spacing:1px;padding:3px 7px;font-weight:700;}
        .pill-advocate{background:#DCEFE6;color:var(--green);}
        .pill-supporter{background:#FAEFD3;color:var(--orange);}
        .pill-engaged{background:var(--cream);color:var(--text-muted);}
        .pill-declined{background:#F5E0E0;color:var(--red);}
        .pill-tracked{background:var(--cream-dark);color:var(--text-muted);}
        .person-touches{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--navy);line-height:1;}
        .person-touches small{font-size:10px;color:var(--text-muted);display:block;letter-spacing:1px;text-transform:uppercase;font-family:'Source Sans 3',sans-serif;}
        .empty{text-align:center;padding:60px 20px;color:var(--text-muted);}
        .modal-overlay{display:none;position:fixed;inset:0;background:rgba(10,34,64,0.7);z-index:1000;align-items:flex-start;justify-content:center;padding:60px 20px;overflow-y:auto;}
        .modal-overlay.open{display:flex;}
        .modal{background:var(--cream);width:100%;max-width:700px;border:1px solid var(--border);}
        .modal-head{background:var(--navy);color:var(--white);padding:18px 22px;border-bottom:3px solid var(--gold);position:relative;}
        .modal-head h2{font-size:26px;line-height:1;}
        .modal-head p{font-size:13px;color:var(--gold-light);margin-top:4px;}
        .modal-close{position:absolute;top:12px;right:12px;background:none;border:1px solid rgba(255,255,255,0.3);color:var(--white);width:28px;height:28px;cursor:pointer;font-size:16px;line-height:1;}
        .modal-close:hover{background:var(--red);border-color:var(--red);}
        .modal-body{padding:22px;max-height:60vh;overflow-y:auto;}
        .modal-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
        .modal-stat{background:var(--white);border:1px solid var(--border);padding:10px;text-align:center;}
        .modal-stat-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:700;}
        .modal-stat-value{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--navy);line-height:1;margin-top:4px;}
        .timeline{position:relative;padding-left:22px;}
        .timeline::before{content:'';position:absolute;left:4px;top:8px;bottom:8px;width:2px;background:var(--cream-dark);}
        .timeline-event{position:relative;padding-bottom:16px;}
        .timeline-event::before{content:'';position:absolute;left:-20px;top:6px;width:10px;height:10px;background:var(--gold);border:2px solid var(--white);border-radius:50%;box-shadow:0 0 0 1px var(--cream-dark);}
        .timeline-date{font-family:'Bebas Neue',sans-serif;font-size:13px;color:var(--navy);letter-spacing:1px;}
        .timeline-source{font-size:11px;color:var(--text-muted);margin-left:7px;font-style:italic;}
        .timeline-text{font-size:13px;color:var(--text);margin-top:3px;line-height:1.5;}
        .monthly-bars{display:flex;align-items:stretch;gap:10px;height:240px;padding:16px 0 0;border-bottom:2px solid var(--navy);margin:0 24px 24px;}
        .monthly-bar{flex:1;display:flex;flex-direction:column;align-items:center;min-width:0;justify-content:flex-end;}
        .bar-stack{width:100%;max-width:70px;display:flex;flex-direction:column;justify-content:flex-end;flex:1;min-height:0;}
        .bar-block{width:100%;position:relative;transition:opacity 0.15s;min-height:24px;}
        .bar-block:hover{opacity:0.85;}
        .bar-value{color:var(--white);font-family:'Bebas Neue',sans-serif;font-size:16px;text-align:center;padding:3px 0;line-height:1;}
        .bar-label{font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:0.5px;color:var(--navy);margin-top:6px;text-align:center;}
        .bar-label small{display:block;font-family:'Source Sans 3',sans-serif;font-size:10px;color:var(--text-muted);letter-spacing:0;font-weight:400;margin-top:1px;}
        .activity-month-head{background:var(--navy);color:var(--white);padding:7px 14px;font-family:'Bebas Neue',sans-serif;letter-spacing:1.5px;font-size:15px;margin:20px 24px 0;}
        .activity-row{display:grid;grid-template-columns:80px 1fr;gap:14px;padding:12px 24px;border-bottom:1px solid var(--border);cursor:pointer;}
        .activity-row:hover{background:var(--cream);}
        .activity-date{font-family:'Bebas Neue',sans-serif;color:var(--navy);font-size:14px;letter-spacing:1px;}
        .tbl-wrap{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;font-size:14px;}
        thead tr{background:var(--navy);color:var(--white);}
        th{text-align:left;padding:9px 12px;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;font-size:12px;}
        td{padding:9px 12px;border-bottom:1px solid var(--border);}
        tr.tbl-row{cursor:pointer;}
        tr.tbl-row:hover td{background:var(--cream);}
        .adv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;padding:24px;}
        .adv-card{background:var(--white);border:1px solid var(--border);border-top:4px solid var(--green);padding:18px 20px;cursor:pointer;transition:all 0.15s;}
        .adv-card:hover{box-shadow:0 4px 16px rgba(10,34,64,0.12);transform:translateY(-2px);}
        .adv-card.union{border-top-color:var(--gold);}
        .adv-name{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.5px;color:var(--navy);}
        .adv-org{font-size:13px;color:var(--text-muted);margin-top:3px;}
        .adv-badge{display:inline-block;margin-top:10px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;}
        .adv-badge.green{background:#DCEFE6;color:var(--green);}
        .adv-badge.gold{background:#FAEFD3;color:var(--orange);}
        .adv-notes{font-size:13px;color:var(--text-muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--border);line-height:1.5;}
        .footer{margin-top:40px;}
        .footer-bar{background:var(--navy);color:var(--cream-dark);padding:16px 40px;font-size:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;letter-spacing:0.5px;}
        .footer-bar strong{color:var(--gold-light);font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1.5px;}
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="americana-stripe" />
      <header className="hdr">
        <Link href="/1500-gateway" className="hdr-back">← Back to Dashboard</Link>
        <div className="hdr-top">
          <div>
            <div className="hdr-title">1500 GATEWAY — SUPPORTER COALITION</div>
            <div className="hdr-sub">Fredericksburg, VA · Stakeholder Detail</div>
          </div>
          <div className="hdr-meta">
            <strong style={{color:"var(--gold-light)",display:"block",fontSize:"13px"}}>PENZANCE DEVELOPMENT</strong>
            Source: Supporter tracking database
          </div>
        </div>
      </header>
      <div className="gold-stripe" />

      <nav className="nav">
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
      </nav>

      <div className="container">
        {loading && <div style={{textAlign:"center",padding:"60px",color:"var(--text-muted)",fontFamily:"Bebas Neue",fontSize:"24px",letterSpacing:"2px"}}>LOADING COALITION DATA…</div>}
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
                <span className="head-meta">Click a sector to filter supporters below</span>
              </div>
              <div className="sector-grid">
                {derived.sectors.map(s=>(
                  <div key={s.sector} className={`sector-card${activeSector===s.sector?" active":""}`} onClick={()=>setActiveSector(activeSector===s.sector?null:s.sector)}>
                    <div className="sec-name">{s.sector}</div>
                    <div className="sec-count">{s.total}</div>
                    <div className="sec-meta">{s.active_advocate} active advocates · {s.willing_supporter} supporters</div>
                    <div className="sec-bar">
                      {s.active_advocate>0&&<div style={{width:`${(s.active_advocate/s.total)*100}%`,background:"var(--green)"}} />}
                      {s.willing_supporter>0&&<div style={{width:`${(s.willing_supporter/s.total)*100}%`,background:"var(--gold)"}} />}
                      {s.engaged_dinner>0&&<div style={{width:`${(s.engaged_dinner/s.total)*100}%`,background:"var(--navy-light)"}} />}
                      {s.tracked>0&&<div style={{width:`${(s.tracked/s.total)*100}%`,background:"var(--cream-dark)"}} />}
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
                <div className="tier-legend-item"><div className="tier-legend-bar" style={{background:"var(--navy-light)"}} />Engaged (Dinner)</div>
                <div className="tier-legend-item"><div className="tier-legend-bar" style={{background:"var(--cream-dark)"}} />Tracked Contact</div>
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
                  ? <div className="empty"><div style={{fontFamily:"Bebas Neue",fontSize:"40px",color:"var(--cream-dark)"}}>No matches</div><p>Adjust your filters.</p></div>
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
                <span className="head-meta">Sortable, filterable view</span>
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
                      const tierColor={"Active Advocate":"var(--green)","Willing Supporter":"var(--orange)","Engaged (Dinner)":"var(--text-muted)","Declined / Inactive":"var(--red)","Tracked Contact":"var(--text-muted)"}[p.tier];
                      return (
                        <tr key={p.id} className="tbl-row" onClick={()=>setModal(p)} style={{background:p.source==="union"?"#FFFAED":""}}>
                          <td style={{fontWeight:600}}>{p.name}{p.source==="union"&&<span style={{marginLeft:6,fontSize:10,fontWeight:700,letterSpacing:1,background:"var(--gold)",color:"var(--white)",padding:"1px 5px"}}>UNION</span>}</td>
                          <td style={{fontSize:13}}>{p.sector}</td>
                          <td style={{fontSize:13,color:"var(--text-muted)"}}>{p.occupation||"—"}</td>
                          <td><span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px",color:tierColor,fontWeight:700}}>{p.tier}</span></td>
                          <td style={{textAlign:"center",fontFamily:"Bebas Neue",fontSize:18,color:"var(--navy)"}}>{p.event_count}</td>
                          <td style={{textAlign:"center",fontSize:12}}>{p.first_touch||"—"}</td>
                          <td style={{textAlign:"center",fontSize:12}}>{p.latest_touch||"—"}</td>
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
                <span className="head-meta">{advocates?.length||0} total · Green = coalition list · Gold = union rally</span>
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
                      <span style={{marginLeft:8,fontSize:12,color:"var(--text-muted)"}}>{p.sector}</span>
                    </div>
                    {p.events.length>0&&(
                      <div className="adv-notes">
                        {p.events[0].text.slice(0,140)}{p.events[0].text.length>140?"…":""}
                      </div>
                    )}
                  </div>
                ))}
                {(advocates||[]).length===0&&(
                  <div className="empty" style={{gridColumn:"1/-1"}}><div style={{fontFamily:"Bebas Neue",fontSize:"32px",color:"var(--cream-dark)"}}>No advocates loaded</div><p>Check that Union Rally and Advocates sheets are published.</p></div>
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
                        <div className="bar-label">{m.month}<small>{m.unique} people</small></div>
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
                            <div><strong style={{color:"var(--navy)"}}>{e.name}</strong><span style={{color:"var(--text-muted)",fontSize:13}}> · {e.occupation||""}</span></div>
                            <div style={{fontSize:14,marginTop:3}}>{e.text}</div>
                            <div style={{fontSize:11,color:"var(--text-muted)",marginTop:3,fontStyle:"italic"}}>Source: {e.source}</div>
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
        <div style={{display:"flex",height:6}}>
          <div style={{background:"var(--red)",flex:1}} />
          <div style={{background:"var(--white)",flex:1}} />
          <div style={{background:"var(--navy)",flex:1}} />
        </div>
        <div className="footer-bar">
          <span><strong>RENUSA</strong>&nbsp; Public affairs and community engagement</span>
          <span>Confidential · Penzance / 1500 Gateway</span>
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
                <div className="modal-stat"><div className="modal-stat-label">Tier</div><div className="modal-stat-value" style={{fontSize:16}}>{modal.tier}</div></div>
                <div className="modal-stat"><div className="modal-stat-label">Source</div><div className="modal-stat-value" style={{fontSize:16}}>{modal.source==="union"?"Union Rally":modal.source==="advocates"?"Advocates":modal.sector}</div></div>
              </div>
              <h3 style={{fontSize:16,color:"var(--navy)",marginBottom:12,letterSpacing:1}}>Engagement Notes</h3>
              <div className="timeline">
                {modal.events.slice().sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")).map((e,i)=>(
                  <div key={i} className="timeline-event">
                    <span className="timeline-date">{e.date_display}</span>
                    <span className="timeline-source">via {e.source}</span>
                    <div className="timeline-text">{e.text}</div>
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
