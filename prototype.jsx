import { useState } from "react";

const INIT_COWS = [
  { id: "C-001", name: "Mentari", breed: "Friesian Holstein", dob: "2020-03-12", gender: "Female", weight: 480, status: "Lactating", tag: "FH-4821" },
  { id: "C-002", name: "Melati",  breed: "Limousin",          dob: "2019-07-04", gender: "Female", weight: 510, status: "Dry",       tag: "LM-2219" },
  { id: "C-003", name: "Bumi",    breed: "Simmental",         dob: "2021-01-20", gender: "Male",   weight: 620, status: "Active",    tag: "SM-3301" },
];

const INIT_MILKING = [
  { id: "M-001", cowId: "C-001", cowName: "Mentari", date: "2024-11-20", session: "Morning", volume: 12.5, fat: 3.8, protein: 3.2, notes: "" },
  { id: "M-002", cowId: "C-001", cowName: "Mentari", date: "2024-11-20", session: "Evening", volume: 10.2, fat: 3.9, protein: 3.1, notes: "Slightly less than usual" },
  { id: "M-003", cowId: "C-002", cowName: "Melati",  date: "2024-11-19", session: "Morning", volume: 14.1, fat: 4.1, protein: 3.4, notes: "" },
];

const INIT_EVENTS = [
  { id: "E-001", cowId: "C-001", cowName: "Mentari", date: "2024-11-15", type: "Health Check", description: "Routine vaccination - FMD booster", vet: "drh. Santoso", followUp: "2024-12-15" },
  { id: "E-002", cowId: "C-002", cowName: "Melati",  date: "2024-11-10", type: "Breeding",     description: "Artificial insemination performed", vet: "drh. Lestari",  followUp: "2024-12-10" },
  { id: "E-003", cowId: "C-003", cowName: "Bumi",    date: "2024-11-08", type: "Weighing",     description: "Monthly weight check - gained 12kg", vet: "-",             followUp: "-" },
];

const BREEDS   = ["Friesian Holstein", "Limousin", "Simmental", "Brahman", "Ongole", "Madura", "Bali"];
const STATUSES = ["Lactating", "Dry", "Pregnant", "Active", "Quarantine", "Sold"];
const SESSIONS = ["Morning", "Afternoon", "Evening"];
const ETYPES   = ["Health Check", "Breeding", "Weighing", "Vaccination", "Treatment", "Calving", "Deworming", "Hoof Trim"];

const STATUS_STYLE = {
  Lactating:  { background: "#e8f5e2", color: "#2d6a1f", border: "1px solid #b7dca8" },
  Dry:        { background: "#fdf3e3", color: "#7a4f1a", border: "1px solid #f0c98a" },
  Pregnant:   { background: "#fce4ec", color: "#880e4f", border: "1px solid #f48fb1" },
  Active:     { background: "#e3f2fd", color: "#1565c0", border: "1px solid #90caf9" },
  Quarantine: { background: "#fce4ec", color: "#b71c1c", border: "1px solid #ef9a9a" },
  Sold:       { background: "#f3e5f5", color: "#6a1b9a", border: "1px solid #ce93d8" },
};

const EVENT_ICON = {
  "Health Check": "🩺", Breeding: "🧬", Weighing: "⚖️",
  Vaccination: "💉", Treatment: "💊", Calving: "🐄",
  Deworming: "🔬", "Hoof Trim": "✂️",
};

const SESSION_STYLE = {
  Morning:   { background: "#fdf3e3", color: "#7a4f1a", border: "1px solid #f0c98a" },
  Afternoon: { background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" },
  Evening:   { background: "#e8eaf6", color: "#283593", border: "1px solid #9fa8da" },
};

const genId = (prefix, list) => `${prefix}-${String(list.length + 1).padStart(3, "0")}`;
const todayStr = () => new Date().toISOString().split("T")[0];

const inp = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #d6cbba", background: "#faf7f2",
  fontFamily: "monospace", fontSize: 13, color: "#3a2e20",
  outline: "none", boxSizing: "border-box",
};

const selStyle = {
  ...inp,
  appearance: "none", cursor: "pointer",
};

function Fld({ label, children, col = 1 }) {
  return (
    <div style={{ gridColumn: `span ${col}` }}>
      <div style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a7d6b", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

export default function App() {
  const [tab, setTab]         = useState("cows");
  const [modal, setModal]     = useState(null);
  const [cows, setCows]       = useState(INIT_COWS);
  const [milking, setMilking] = useState(INIT_MILKING);
  const [events, setEvents]   = useState(INIT_EVENTS);
  const [toast, setToast]     = useState(null);

  const [cf, setCf] = useState({ name:"", breed: BREEDS[0], dob:"", gender:"Female", weight:"", status: STATUSES[0], tag:"", sire:"", dam:"" });
  const [mf, setMf] = useState({ cowId:"", date: todayStr(), session: SESSIONS[0], volume:"", fat:"", protein:"", notes:"" });
  const [ef, setEf] = useState({ cowId:"", date: todayStr(), type: ETYPES[0], description:"", vet:"", followUp:"" });

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const saveCow = () => {
    if (!cf.name || !cf.tag || !cf.dob) { flash("⚠ Name, tag and DOB required"); return; }
    setCows(p => [...p, { ...cf, id: genId("C", p), weight: +cf.weight || 0 }]);
    setCf({ name:"", breed: BREEDS[0], dob:"", gender:"Female", weight:"", status: STATUSES[0], tag:"", sire:"", dam:"" });
    setModal(null); flash("Cow registered ✓");
  };

  const saveMilk = () => {
    if (!mf.cowId || !mf.volume) { flash("⚠ Select cow and enter volume"); return; }
    const cow = cows.find(c => c.id === mf.cowId);
    setMilking(p => [...p, { ...mf, id: genId("M", p), cowName: cow?.name || "", volume: +mf.volume, fat: +mf.fat || 0, protein: +mf.protein || 0 }]);
    setMf({ cowId:"", date: todayStr(), session: SESSIONS[0], volume:"", fat:"", protein:"", notes:"" });
    setModal(null); flash("Milking session saved ✓");
  };

  const saveEvent = () => {
    if (!ef.cowId || !ef.description) { flash("⚠ Select cow and add description"); return; }
    const cow = cows.find(c => c.id === ef.cowId);
    setEvents(p => [...p, { ...ef, id: genId("E", p), cowName: cow?.name || "" }]);
    setEf({ cowId:"", date: todayStr(), type: ETYPES[0], description:"", vet:"", followUp:"" });
    setModal(null); flash("Event logged ✓");
  };

  const femaleCows  = cows.filter(c => c.gender === "Female");
  const totalMilkL  = milking.reduce((a, b) => a + b.volume, 0).toFixed(1);
  const overdueCount = events.filter(e => e.followUp && e.followUp !== "-" && e.followUp < todayStr()).length;

  const TABS = [
    { key:"cows",    label:"🐄 Herd",   count: cows.length },
    { key:"milking", label:"🥛 Milking", count: milking.length },
    { key:"events",  label:"📋 Events",  count: events.length },
  ];

  const STATS = [
    { icon:"🐄", label:"Total Herd",     value: cows.length,                                    sub:`${femaleCows.length} females` },
    { icon:"🥛", label:"Lactating",      value: cows.filter(c=>c.status==="Lactating").length,  sub:"active producers" },
    { icon:"🧴", label:"Total Milk (L)", value: totalMilkL,                                     sub:`${milking.length} sessions` },
    { icon:"⚠️", label:"Follow-ups Due", value: overdueCount,                                   sub:"need attention", warn: overdueCount > 0 },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f0ead8", fontFamily:"Georgia, serif", color:"#3a2e20" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .fade { animation: fadeUp 0.35s ease both; }
        .row:hover { background: rgba(139,111,71,0.05); padding-left: 6px; }
        .row { transition: all 0.15s; }
        input, select, textarea { transition: border-color 0.2s, box-shadow 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: #8b6f47 !important; box-shadow: 0 0 0 3px rgba(139,111,71,0.12) !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d6cbba; border-radius: 2px; }
      `}</style>

      {/* NAV */}
      <div style={{ background:"#2e2416", padding:"0 28px" }}>
        <div style={{ maxWidth:1060, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>🐄</span>
            <div>
              <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.2em", color:"#7a6a52", textTransform:"uppercase" }}>Ranch OS</div>
              <div style={{ fontFamily:"Georgia, serif", fontWeight:"bold", fontSize:14, color:"#f5f0e8" }}>Cattle Farm Manager</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: tab===t.key ? "#f5f0e8" : "transparent",
                color: tab===t.key ? "#2e2416" : "#9a8a72",
                border:"none", padding:"7px 16px", borderRadius:100,
                fontFamily:"monospace", fontSize:11, letterSpacing:"0.06em",
                cursor:"pointer", transition:"all 0.2s",
              }}>
                {t.label} <span style={{ opacity:0.5, fontSize:10 }}>({t.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"28px 28px" }}>

        {/* STATS */}
        <div className="fade" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ background:"#faf6ee", borderRadius:14, border:"1px solid #e0d4c0", padding:"16px 18px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:24 }}>{s.icon}</span>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"monospace", fontWeight:"bold", fontSize:22, color: s.warn?"#c0392b":"#2e2416" }}>{s.value}</div>
                  <div style={{ fontFamily:"monospace", fontSize:9, color:"#8a7d6b", letterSpacing:"0.08em", textTransform:"uppercase" }}>{s.label}</div>
                </div>
              </div>
              <div style={{ fontFamily:"monospace", fontSize:10, color:"#b0a090", marginTop:8 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── HERD TAB ── */}
        {tab === "cows" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:"bold", margin:0 }}>Herd Registry</h2>
                <p style={{ fontFamily:"monospace", fontSize:11, color:"#8a7d6b", marginTop:3 }}>All registered cattle</p>
              </div>
              <button onClick={() => setModal("cow")} style={{ background:"#2e2416", color:"#f5f0e8", border:"none", padding:"10px 20px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer", letterSpacing:"0.06em" }}>
                + Register Cow
              </button>
            </div>

            <div style={{ background:"#faf6ee", borderRadius:14, border:"1px solid #e0d4c0", overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"44px 1fr 150px 100px 90px 110px", gap:14, padding:"10px 20px", borderBottom:"1.5px solid #e8e0d4" }}>
                {["","Animal","Breed","Born","Weight","Status"].map((h,i) => (
                  <div key={i} style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8a7d6b" }}>{h}</div>
                ))}
              </div>
              {cows.map((cow, i) => (
                <div key={cow.id} className="row" style={{ display:"grid", gridTemplateColumns:"44px 1fr 150px 100px 90px 110px", gap:14, padding:"13px 20px", alignItems:"center", borderBottom: i < cows.length-1 ? "1px solid #ede7dc" : "none" }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#f0e4d0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, border:"1.5px solid #e0d0b8" }}>
                    {cow.gender === "Female" ? "🐄" : "🐂"}
                  </div>
                  <div>
                    <div style={{ fontWeight:"bold", fontSize:14 }}>{cow.name}</div>
                    <div style={{ fontFamily:"monospace", fontSize:10, color:"#8a7d6b", marginTop:2 }}>{cow.id} · {cow.tag}</div>
                  </div>
                  <div style={{ fontFamily:"monospace", fontSize:11, color:"#6a5a48" }}>{cow.breed}</div>
                  <div style={{ fontFamily:"monospace", fontSize:11, color:"#8a7d6b" }}>{cow.dob}</div>
                  <div style={{ fontFamily:"monospace", fontSize:12, color:"#6a5a48" }}>{cow.weight} kg</div>
                  <div>
                    <span style={{ ...STATUS_STYLE[cow.status], display:"inline-block", padding:"3px 10px", borderRadius:100, fontFamily:"monospace", fontSize:10 }}>
                      {cow.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MILKING TAB ── */}
        {tab === "milking" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:"bold", margin:0 }}>Milking Records</h2>
                <p style={{ fontFamily:"monospace", fontSize:11, color:"#8a7d6b", marginTop:3 }}>Production log per session</p>
              </div>
              <button onClick={() => setModal("milk")} style={{ background:"#2e2416", color:"#f5f0e8", border:"none", padding:"10px 20px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer", letterSpacing:"0.06em" }}>
                + Log Session
              </button>
            </div>

            <div style={{ background:"#faf6ee", borderRadius:14, border:"1px solid #e0d4c0", overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 110px 100px 90px 70px 70px 1fr", gap:12, padding:"10px 20px", borderBottom:"1.5px solid #e8e0d4" }}>
                {["Cow","Date","Session","Volume","Fat %","Protein %","Notes"].map((h,i) => (
                  <div key={i} style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8a7d6b" }}>{h}</div>
                ))}
              </div>
              {milking.map((r, i) => (
                <div key={r.id} className="row" style={{ display:"grid", gridTemplateColumns:"1fr 110px 100px 90px 70px 70px 1fr", gap:12, padding:"13px 20px", alignItems:"center", borderBottom: i < milking.length-1 ? "1px solid #ede7dc" : "none" }}>
                  <div>
                    <div style={{ fontWeight:"bold", fontSize:13 }}>{r.cowName}</div>
                    <div style={{ fontFamily:"monospace", fontSize:10, color:"#8a7d6b" }}>{r.cowId}</div>
                  </div>
                  <div style={{ fontFamily:"monospace", fontSize:11, color:"#6a5a48" }}>{r.date}</div>
                  <div>
                    <span style={{ ...SESSION_STYLE[r.session], display:"inline-block", padding:"3px 9px", borderRadius:100, fontFamily:"monospace", fontSize:10 }}>
                      {r.session}
                    </span>
                  </div>
                  <div style={{ fontFamily:"monospace", fontWeight:"bold", fontSize:14, color:"#2e2416" }}>{r.volume}L</div>
                  <div style={{ fontFamily:"monospace", fontSize:12, color:"#6a5a48" }}>{r.fat}%</div>
                  <div style={{ fontFamily:"monospace", fontSize:12, color:"#6a5a48" }}>{r.protein}%</div>
                  <div style={{ fontFamily:"monospace", fontSize:11, color:"#8a7d6b", fontStyle:"italic" }}>{r.notes || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === "events" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:"bold", margin:0 }}>Event Log</h2>
                <p style={{ fontFamily:"monospace", fontSize:11, color:"#8a7d6b", marginTop:3 }}>Health, breeding and farm events</p>
              </div>
              <button onClick={() => setModal("event")} style={{ background:"#2e2416", color:"#f5f0e8", border:"none", padding:"10px 20px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer", letterSpacing:"0.06em" }}>
                + Log Event
              </button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {events.map(ev => {
                const overdue = ev.followUp && ev.followUp !== "-" && ev.followUp < todayStr();
                return (
                  <div key={ev.id} style={{ background:"#faf6ee", borderRadius:14, border:"1px solid #e0d4c0", borderLeft: overdue ? "4px solid #c0392b" : "4px solid #e0d4c0", padding:"16px 20px", display:"grid", gridTemplateColumns:"42px 1fr auto", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:"#f0e4d0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, border:"1.5px solid #e0d0b8", flexShrink:0 }}>
                      {EVENT_ICON[ev.type] || "📋"}
                    </div>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:5 }}>
                        <span style={{ fontWeight:"bold", fontSize:14 }}>{ev.cowName}</span>
                        <span style={{ background:"#f0e4d0", color:"#7a5a3a", border:"1px solid #e0d0b8", padding:"2px 9px", borderRadius:100, fontFamily:"monospace", fontSize:9, letterSpacing:"0.08em" }}>{ev.type}</span>
                        <span style={{ fontFamily:"monospace", fontSize:10, color:"#8a7d6b" }}>{ev.date}</span>
                      </div>
                      <div style={{ fontFamily:"monospace", fontSize:12, color:"#6a5a48" }}>{ev.description}</div>
                      {ev.vet !== "-" && <div style={{ fontFamily:"monospace", fontSize:10, color:"#8a7d6b", marginTop:5 }}>👨‍⚕️ {ev.vet}</div>}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      {ev.followUp && ev.followUp !== "-" && (
                        <div style={{ padding:"4px 10px", borderRadius:8, fontFamily:"monospace", fontSize:10, background: overdue?"#fdecea":"#f0e8da", color: overdue?"#c0392b":"#8a7d6b", border:`1px solid ${overdue?"#f1a1a1":"#e0d4c0"}` }}>
                          {overdue ? "⚠️ " : "📅 "}Follow-up: {ev.followUp}
                        </div>
                      )}
                      <div style={{ fontFamily:"monospace", fontSize:9, color:"#c0b0a0", marginTop:4 }}>{ev.id}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL OVERLAY ── */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position:"fixed", inset:0, background:"rgba(20,14,6,0.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#faf6ee", borderRadius:18, width:"100%", maxWidth:560, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.3)", animation:"modalIn 0.22s ease", border:"1px solid #e0d4c0" }}>

            {/* Modal head */}
            <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #ede7dc", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <h3 style={{ margin:0, fontSize:17, fontWeight:"bold" }}>
                  {modal==="cow" ? "🐄 Register New Cow" : modal==="milk" ? "🥛 Log Milking Session" : "📋 Log Farm Event"}
                </h3>
                <p style={{ margin:"4px 0 0", fontFamily:"monospace", fontSize:10, color:"#8a7d6b" }}>
                  {modal==="cow" ? "Add animal to herd registry" : modal==="milk" ? "Record production data" : "Record health or farm event"}
                </p>
              </div>
              <button onClick={() => setModal(null)} style={{ background:"#f0e4d0", border:"none", width:30, height:30, borderRadius:8, cursor:"pointer", fontSize:15, color:"#8a7d6b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            <div style={{ padding:"22px 24px 24px" }}>

              {/* COW FORM */}
              {modal === "cow" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <Fld label="Name *"><input style={inp} value={cf.name} onChange={e=>setCf(p=>({...p,name:e.target.value}))} placeholder="e.g. Mentari" /></Fld>
                  <Fld label="Ear Tag *"><input style={inp} value={cf.tag} onChange={e=>setCf(p=>({...p,tag:e.target.value}))} placeholder="e.g. FH-4821" /></Fld>
                  <Fld label="Breed">
                    <select style={selStyle} value={cf.breed} onChange={e=>setCf(p=>({...p,breed:e.target.value}))}>
                      {BREEDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Gender">
                    <select style={selStyle} value={cf.gender} onChange={e=>setCf(p=>({...p,gender:e.target.value}))}>
                      <option>Female</option><option>Male</option>
                    </select>
                  </Fld>
                  <Fld label="Date of Birth *"><input style={inp} type="date" value={cf.dob} onChange={e=>setCf(p=>({...p,dob:e.target.value}))} /></Fld>
                  <Fld label="Weight (kg)"><input style={inp} type="number" value={cf.weight} onChange={e=>setCf(p=>({...p,weight:e.target.value}))} placeholder="e.g. 480" /></Fld>
                  <Fld label="Status">
                    <select style={selStyle} value={cf.status} onChange={e=>setCf(p=>({...p,status:e.target.value}))}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Sire (Father)"><input style={inp} value={cf.sire} onChange={e=>setCf(p=>({...p,sire:e.target.value}))} placeholder="Bull ID or name" /></Fld>
                  <Fld label="Dam (Mother)" col={2}><input style={inp} value={cf.dam} onChange={e=>setCf(p=>({...p,dam:e.target.value}))} placeholder="Cow ID or name" /></Fld>
                  <div style={{ gridColumn:"span 2", display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
                    <button onClick={()=>setModal(null)} style={{ background:"transparent", border:"1.5px solid #d6cbba", color:"#8a7d6b", padding:"9px 18px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer" }}>Cancel</button>
                    <button onClick={saveCow} style={{ background:"#2e2416", color:"#f5f0e8", border:"none", padding:"10px 20px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer" }}>Register Cow</button>
                  </div>
                </div>
              )}

              {/* MILKING FORM */}
              {modal === "milk" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <Fld label="Select Cow *" col={2}>
                    <select style={selStyle} value={mf.cowId} onChange={e=>setMf(p=>({...p,cowId:e.target.value}))}>
                      <option value="">— choose cow —</option>
                      {femaleCows.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                    </select>
                  </Fld>
                  <Fld label="Date"><input style={inp} type="date" value={mf.date} onChange={e=>setMf(p=>({...p,date:e.target.value}))} /></Fld>
                  <Fld label="Session">
                    <select style={selStyle} value={mf.session} onChange={e=>setMf(p=>({...p,session:e.target.value}))}>
                      {SESSIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Volume (Liters) *"><input style={inp} type="number" value={mf.volume} onChange={e=>setMf(p=>({...p,volume:e.target.value}))} placeholder="e.g. 12.5" /></Fld>
                  <Fld label="Fat Content (%)"><input style={inp} type="number" value={mf.fat} onChange={e=>setMf(p=>({...p,fat:e.target.value}))} placeholder="e.g. 3.8" /></Fld>
                  <Fld label="Protein (%)" col={2}><input style={inp} type="number" value={mf.protein} onChange={e=>setMf(p=>({...p,protein:e.target.value}))} placeholder="e.g. 3.2" /></Fld>
                  <Fld label="Notes" col={2}><textarea style={{...inp, resize:"vertical"}} rows={2} value={mf.notes} onChange={e=>setMf(p=>({...p,notes:e.target.value}))} placeholder="Any observations..." /></Fld>
                  <div style={{ gridColumn:"span 2", display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
                    <button onClick={()=>setModal(null)} style={{ background:"transparent", border:"1.5px solid #d6cbba", color:"#8a7d6b", padding:"9px 18px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer" }}>Cancel</button>
                    <button onClick={saveMilk} style={{ background:"#2e2416", color:"#f5f0e8", border:"none", padding:"10px 20px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer" }}>Save Record</button>
                  </div>
                </div>
              )}

              {/* EVENT FORM */}
              {modal === "event" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <Fld label="Select Cow *" col={2}>
                    <select style={selStyle} value={ef.cowId} onChange={e=>setEf(p=>({...p,cowId:e.target.value}))}>
                      <option value="">— choose cow —</option>
                      {cows.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                    </select>
                  </Fld>
                  <Fld label="Event Type">
                    <select style={selStyle} value={ef.type} onChange={e=>setEf(p=>({...p,type:e.target.value}))}>
                      {ETYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Date"><input style={inp} type="date" value={ef.date} onChange={e=>setEf(p=>({...p,date:e.target.value}))} /></Fld>
                  <Fld label="Description *" col={2}><textarea style={{...inp, resize:"vertical"}} rows={3} value={ef.description} onChange={e=>setEf(p=>({...p,description:e.target.value}))} placeholder="Describe the event in detail..." /></Fld>
                  <Fld label="Veterinarian / Officer"><input style={inp} value={ef.vet} onChange={e=>setEf(p=>({...p,vet:e.target.value}))} placeholder="drh. Name" /></Fld>
                  <Fld label="Follow-up Date"><input style={inp} type="date" value={ef.followUp} onChange={e=>setEf(p=>({...p,followUp:e.target.value}))} /></Fld>
                  <div style={{ gridColumn:"span 2", display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
                    <button onClick={()=>setModal(null)} style={{ background:"transparent", border:"1.5px solid #d6cbba", color:"#8a7d6b", padding:"9px 18px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer" }}>Cancel</button>
                    <button onClick={saveEvent} style={{ background:"#2e2416", color:"#f5f0e8", border:"none", padding:"10px 20px", borderRadius:100, fontFamily:"monospace", fontSize:11, cursor:"pointer" }}>Log Event</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, background:"#2e2416", color:"#f5f0e8", padding:"12px 20px", borderRadius:10, fontFamily:"monospace", fontSize:12, boxShadow:"0 8px 24px rgba(0,0,0,0.3)", animation:"slideRight 0.3s ease" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
