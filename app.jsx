// TIPO Brain v5
// Tilanus Poorthuis Gezinsassistent
// Sven & Eva — iPad keuken app

const { useState, useEffect, useRef, useCallback } = React;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       "#F5F0E8",
  paper:    "#FDFAF4",
  dark:     "#1E1A14",
  brown:    "#3D2B1F",
  gold:     "#C9A96E",
  goldLight:"#E8D5A3",
  red:      "#7A2020",
  redLight: "#F5ECEC",
  sand:     "#E8DCC8",
  sandDark: "#D4C4A8",
  muted:    "#8A7968",
  sven:     "#2C5F8A",
  svenBg:   "#E8F0F8",
  eva:      "#7A4A7A",
  evaBg:    "#F5EEF5",
  green:    "#3A6B4A",
  greenBg:  "#EAF5EC",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const OWNERS = [
  { id: "sven",  label: "Sven",  color: C.sven, bg: C.svenBg, avatar: "S" },
  { id: "eva",   label: "Eva",   color: C.eva,  bg: C.evaBg,  avatar: "E" },
  { id: "samen", label: "Samen", color: C.green, bg: C.greenBg, avatar: "✦" },
];

const CATEGORIES = [
  { id: "huis",       label: "Huis",       emoji: "🏠" },
  { id: "baby",       label: "Baby",       emoji: "👶" },
  { id: "financieel", label: "Financieel", emoji: "💶" },
  { id: "vakantie",   label: "Vakantie",   emoji: "✈️" },
  { id: "nieuw_huis", label: "Nieuw huis", emoji: "🏡" },
  { id: "overig",     label: "Overig",     emoji: "📌" },
];

const LISTS = [
  { id: "nu",   label: "Nu",        emoji: "🔥", color: C.red,   light: C.redLight },
  { id: "week", label: "Deze week", emoji: "📅", color: "#8B5E1A", light: "#FDF5E8" },
  { id: "ooit", label: "Ooit",      emoji: "🌱", color: C.green, light: C.greenBg },
];

const ROUTINE_CATS = [
  { id: "leefstijl",  label: "Leefstijl",  emoji: "🏋️" },
  { id: "huishouden", label: "Huishouden", emoji: "🏠" },
  { id: "baby",       label: "Baby",       emoji: "👶" },
];

const DEFAULT_TASKS = [
  { id: 1, text: "Huisarts bellen voor baby check-up", done: false, list: "nu", cat: "baby", owner: "eva", notes: "Vraag ook naar vaccinaties planning", milestones: [], aiContent: null },
  { id: 2, text: "Luiers bijbestellen", done: false, list: "nu", cat: "baby", owner: "sven", notes: "", milestones: [], aiContent: null },
  { id: 3, text: "Kinderopvang vergelijken", done: false, list: "ooit", cat: "baby", owner: "samen", notes: "De Paddestoel, Hummelhoeve, KinderRijk",
    milestones: [
      { id: "m1", text: "Lijst met opties maken", done: true, owner: "eva" },
      { id: "m2", text: "3 locaties bezoeken", done: false, owner: "samen" },
      { id: "m3", text: "Keuze maken", done: false, owner: "samen" },
    ], aiContent: null },
  { id: 4, text: "Hypotheek adviesgesprek plannen", done: false, list: "ooit", cat: "nieuw_huis", owner: "sven", notes: "Adviseur: Jan de Vries 06-12345678",
    milestones: [
      { id: "m4", text: "Adviseur contacteren", done: true, owner: "sven" },
      { id: "m5", text: "Documenten verzamelen", done: true, owner: "samen" },
      { id: "m6", text: "Gesprek inplannen", done: false, owner: "sven" },
    ], aiContent: null },
  { id: 5, text: "Zomervakantie bestemming kiezen", done: false, list: "ooit", cat: "vakantie", owner: "samen", notes: "Ideeën: Zuid-Frankrijk, Italië, Kroatië", milestones: [], aiContent: null },
];

const DEFAULT_ROUTINES = {
  weekly: [
    { id: "w1", text: "Zone 2 cardio (45 min)", owner: "sven", emoji: "🫀", cat: "leefstijl", streak: 4 },
    { id: "w2", text: "Zone 2 cardio (45 min)", owner: "eva",  emoji: "🫀", cat: "leefstijl", streak: 2 },
    { id: "w3", text: "Krachttraining (2x per week)", owner: "sven", emoji: "💪", cat: "leefstijl", streak: 6 },
    { id: "w4", text: "Krachttraining (1x per week)", owner: "eva",  emoji: "💪", cat: "leefstijl", streak: 1 },
    { id: "w5", text: "Slaap check (gem. 7-9u)", owner: "sven", emoji: "😴", cat: "leefstijl", streak: 3 },
    { id: "w6", text: "Boodschappen doen", owner: "sven", emoji: "🛒", cat: "huishouden", streak: 8 },
    { id: "w7", text: "Huis schoonmaken", owner: "eva",  emoji: "🏠", cat: "huishouden", streak: 5 },
    { id: "w8", text: "Week planning samen", owner: "samen", emoji: "📋", cat: "huishouden", streak: 2 },
  ],
  monthly: [
    { id: "m1", text: "Bloedwaarden checken", owner: "sven", emoji: "🩸", cat: "leefstijl", streak: 3 },
    { id: "m2", text: "Financiën doornemen", owner: "sven", emoji: "💶", cat: "huishouden", streak: 5 },
    { id: "m3", text: "Supplementen bestellen", owner: "eva",  emoji: "💊", cat: "leefstijl", streak: 4 },
    { id: "m4", text: "Prenatale check-up", owner: "eva",  emoji: "👶", cat: "baby", streak: 2 },
  ],
};

const RECAP_QUESTIONS = [
  { id: "energy",    label: "Hoe was je energieniveau deze week?", type: "scale",  icon: "⚡" },
  { id: "highlight", label: "Wat ging goed of waar ben je trots op?", type: "text", icon: "✨", placeholder: "Bijv. Zone 2 elke dag gehaald, goed gesprek gehad..." },
  { id: "struggle",  label: "Waar liep je tegenaan?", type: "text", icon: "🌊", placeholder: "Bijv. weinig slaap, druk op werk..." },
  { id: "focus",     label: "Wat wil je volgende week beter doen?", type: "text", icon: "🎯", placeholder: "Bijv. eerder naar bed, meer bewegen..." },
];

let nextId  = 20;
let nextMid = 200;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCat   = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[5];
const getList  = (id) => LISTS.find(l => l.id === id) || LISTS[0];
const getOwner = (id) => OWNERS.find(o => o.id === id) || OWNERS[2];

const progress = (ms) => {
  if (!ms?.length) return null;
  return Math.round(ms.filter(m => m.done).length / ms.length * 100);
};

const getWeekKey = () => {
  const n = new Date();
  const start = new Date(n.getFullYear(), 0, 1);
  const week = Math.ceil(((n - start) / 86400000 + start.getDay() + 1) / 7);
  return `${n.getFullYear()}-W${week}`;
};

const getMonthKey = () => {
  const n = new Date();
  return `${n.getFullYear()}-M${n.getMonth() + 1}`;
};

// ─── Storage ──────────────────────────────────────────────────────────────────
const KEYS = {
  tasks:    "tipo-v5-tasks",
  routines: "tipo-v5-routines",
  completions: "tipo-v5-completions",
  recaps:   "tipo-v5-recaps",
  memory:   "tipo-v5-memory",
};

async function apiCall(body) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function loadData(key, fallback) {
  try {
    const r = await apiCall({ action: "load", key });
    if (r?.value) return JSON.parse(r.value);
  } catch (_) {}
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return fallback;
}

async function saveData(key, value) {
  try { await apiCall({ action: "save", key, value: JSON.stringify(value) }); } catch (_) {}
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

// ─── Claude API ───────────────────────────────────────────────────────────────
async function callClaude(messages, system, maxTokens = 1000) {
  const data = await apiCall({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages });
  return data.content?.find(b => b.type === "text")?.text || "";
}

async function askTIPO(messages, tasks, memory) {
  const system = `Je bent TIPO, de persoonlijke AI-assistent van Sven en Eva Tilanus-Poorthuis. Ze verwachten hun eerste baby in september 2025 en beheren samen hun huishouden, gezondheid en toekomstplannen.

${memory ? `Geheugen uit eerdere gesprekken:\n${memory}\n` : ""}

Huidige taken:
${JSON.stringify(tasks, null, 2)}

Owners: sven, eva, samen | Lijsten: nu, week, ooit | Categorieën: huis, baby, financieel, vakantie, nieuw_huis, overig

Als de gebruiker acties wil, voeg een <actions> blok toe aan het EINDE:
<actions>
[
  { "type": "add", "text": "...", "list": "nu|week|ooit", "cat": "...", "owner": "sven|eva|samen", "notes": "" },
  { "type": "done", "id": 123 },
  { "type": "undone", "id": 123 },
  { "type": "delete", "id": 123 },
  { "type": "move", "id": 123, "list": "ooit" },
  { "type": "set_owner", "id": 123, "owner": "eva" },
  { "type": "update_notes", "id": 123, "notes": "..." }
]
</actions>

Reageer altijd in het Nederlands. Wees warm, concreet en beknopt. Je kent Peter Attia's principes (Zone 2, kracht, slaap, voeding) en GTD/Tiny Habits methodieken.`;

  const text = await callClaude(messages, system);
  const match = text.match(/<actions>([\s\S]*?)<\/actions>/);
  let actions = [];
  if (match) { try { actions = JSON.parse(match[1].trim()); } catch (_) {} }
  return { text: text.replace(/<actions>[\s\S]*?<\/actions>/, "").trim(), actions };
}

async function prepareTask(task) {
  const system = `Je bent TIPO, assistent van Sven en Eva (baby verwacht september 2025). Bereid taken concreet voor: ideeën, bronnen, stappenplan, aandachtspunten. Gebruik Markdown (##, -, **bold**). Max 350 woorden. Schrijf in het Nederlands.`;
  return callClaude(
    [{ role: "user", content: `Bereid voor: "${task.text}"\n\nContext: ${task.notes || "geen"}` }],
    system, 1200
  );
}

async function generateRecapInsight(svenAnswers, evaAnswers, tasks) {
  const system = `Je bent TIPO, assistent van Sven en Eva. Analyseer hun wekelijkse recap en geef een concreet, persoonlijk inzicht van max 3 zinnen. Focus op patronen, prioriteiten en één concrete aanbeveling. Nederlands, warm maar direct.`;
  return callClaude(
    [{ role: "user", content: `Sven's week:\n- Energie: ${svenAnswers.energy}/5\n- Goed: ${svenAnswers.highlight}\n- Moeilijk: ${svenAnswers.struggle}\n- Focus: ${svenAnswers.focus}\n\nEva's week:\n- Energie: ${evaAnswers.energy}/5\n- Goed: ${evaAnswers.highlight}\n- Moeilijk: ${evaAnswers.struggle}\n- Focus: ${evaAnswers.focus}\n\nOpen taken: ${tasks.filter(t => !t.done).length}` }],
    system, 400
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ ownerId, size = 22, onClick }) {
  const o = getOwner(ownerId);
  return (
    <div onClick={onClick} title={o.label} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: o.bg, border: `2px solid ${o.color}`,
      color: o.color, fontSize: size * 0.40, fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: onClick ? "pointer" : "default", fontFamily: "system-ui",
    }}>{o.avatar}</div>
  );
}

function OwnerPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {OWNERS.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flex: 1, padding: "7px 4px", borderRadius: 10,
          border: `1.5px solid ${value === o.id ? o.color : C.sand}`,
          background: value === o.id ? o.bg : C.paper,
          color: value === o.id ? o.color : C.muted,
          fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        }}>
          <span style={{ fontFamily: "system-ui", fontWeight: 800 }}>{o.avatar}</span> {o.label}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ milestones, color }) {
  const pct = progress(milestones);
  if (pct === null) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>Voortgang</span>
        <span style={{ fontSize: 9, color: pct === 100 ? color : C.muted, fontFamily: "monospace" }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: C.sand, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? color : `${color}CC`, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function MilestoneEditor({ milestones, onChange, color }) {
  const [newText, setNewText] = useState("");
  const [newOwner, setNewOwner] = useState("samen");

  const toggle = (id) => onChange(milestones.map(m => m.id === id ? { ...m, done: !m.done } : m));
  const remove = (id) => onChange(milestones.filter(m => m.id !== id));
  const cycleOwner = (id) => onChange(milestones.map(m => {
    if (m.id !== id) return m;
    const idx = OWNERS.findIndex(o => o.id === (m.owner || "samen"));
    return { ...m, owner: OWNERS[(idx + 1) % OWNERS.length].id };
  }));
  const add = () => {
    if (!newText.trim()) return;
    onChange([...milestones, { id: `m${nextMid++}`, text: newText.trim(), done: false, owner: newOwner }]);
    setNewText("");
  };

  return (
    <div>
      {milestones.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.sand}` }}>
          <button onClick={() => toggle(m.id)} style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            border: `1.5px solid ${m.done ? color : C.sandDark}`,
            background: m.done ? color : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 11,
          }}>{m.done ? "✓" : ""}</button>
          <span style={{ flex: 1, fontSize: 13, color: m.done ? C.muted : C.dark, textDecoration: m.done ? "line-through" : "none", lineHeight: 1.4 }}>{m.text}</span>
          <Avatar ownerId={m.owner} size={20} onClick={() => cycleOwner(m.id)} />
          <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", color: C.sandDark, cursor: "pointer", fontSize: 16, padding: "0 2px" }}>×</button>
        </div>
      ))}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Nieuwe mijlpaal..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.dark }}
          />
          <button onClick={add} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: color, color: "white", fontSize: 16, cursor: "pointer" }}>+</button>
        </div>
        <OwnerPicker value={newOwner} onChange={setNewOwner} />
      </div>
    </div>
  );
}

function AIContent({ content, loading, color }) {
  if (loading) return (
    <div style={{ display: "flex", gap: 5, padding: "14px 0" }}>
      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}
    </div>
  );
  if (!content) return null;
  return (
    <div style={{ fontSize: 13, color: "#E8E4DC", lineHeight: 1.75 }}>
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 700, fontSize: 14, color: C.goldLight, marginTop: 14, marginBottom: 5 }}>{line.slice(3)}</div>;
        if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 14, marginBottom: 3, color: "#D0CAC0" }}>· {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}</div>;
        if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
        return <div key={i} style={{ marginBottom: 3 }}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</div>;
      })}
    </div>
  );
}

// ─── TAKEN TAB ────────────────────────────────────────────────────────────────
function TasksTab({ tasks, setTasks, memory }) {
  const [tab, setTab]             = useState("nu");
  const [filterCat, setFilterCat] = useState(null);
  const [filterOwner, setFilterOwner] = useState(null);
  const [adding, setAdding]       = useState(false);
  const [newText, setNewText]     = useState("");
  const [newNotes, setNewNotes]   = useState("");
  const [newCat, setNewCat]       = useState("huis");
  const [newList, setNewList]     = useState("nu");
  const [newOwner, setNewOwner]   = useState("samen");
  const [detailId, setDetailId]   = useState(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [editNotes, setEditNotes] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatMsgs, setChatMsgs]   = useState([
    { role: "assistant", content: "Hoi Sven en Eva! 👋 Ik ben TIPO. Ik kan taken beheren, voorbereiden en ideeën aandragen. Wat kan ik voor jullie doen?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [apiError, setApiError]   = useState(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  const currentList = getList(tab);
  const detailItem  = tasks.find(t => t.id === detailId);

  const visible = tasks.filter(t =>
    t.list === tab &&
    (!filterCat   || t.cat   === filterCat) &&
    (!filterOwner || t.owner === filterOwner)
  );
  const todo = visible.filter(t => !t.done);
  const done = visible.filter(t => t.done);

  const countFor = (lid) => tasks.filter(t => t.list === lid && !t.done).length;

  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id) => { setTasks(prev => prev.filter(t => t.id !== id)); if (detailId === id) setDetailId(null); };
  const cycleOwner = (id) => setTasks(prev => prev.map(t => {
    if (t.id !== id) return t;
    const idx = OWNERS.findIndex(o => o.id === (t.owner || "samen"));
    return { ...t, owner: OWNERS[(idx + 1) % OWNERS.length].id };
  }));
  const updateMilestones = (id, ms) => setTasks(prev => prev.map(t => t.id === id ? { ...t, milestones: ms } : t));
  const saveNotes = () => { setTasks(prev => prev.map(t => t.id === detailId ? { ...t, notes: draftNotes } : t)); setEditNotes(false); };
  const openDetail = (task) => { setDetailId(task.id); setDraftNotes(task.notes || ""); setEditNotes(false); };

  const addTask = () => {
    if (!newText.trim()) return;
    setTasks(prev => [...prev, { id: nextId++, text: newText.trim(), done: false, list: newList, cat: newCat, owner: newOwner, notes: newNotes.trim(), milestones: [], aiContent: null }]);
    setNewText(""); setNewNotes(""); setAdding(false);
  };

  const applyActions = (actions, prev) => {
    let updated = [...prev];
    for (const a of actions) {
      if (a.type === "add")          updated.push({ id: nextId++, text: a.text, done: false, list: a.list || "nu", cat: a.cat || "overig", owner: a.owner || "samen", notes: a.notes || "", milestones: [], aiContent: null });
      else if (a.type === "done")         updated = updated.map(t => t.id === a.id ? { ...t, done: true }  : t);
      else if (a.type === "undone")       updated = updated.map(t => t.id === a.id ? { ...t, done: false } : t);
      else if (a.type === "delete")       updated = updated.filter(t => t.id !== a.id);
      else if (a.type === "move")         updated = updated.map(t => t.id === a.id ? { ...t, list: a.list } : t);
      else if (a.type === "set_owner")    updated = updated.map(t => t.id === a.id ? { ...t, owner: a.owner } : t);
      else if (a.type === "update_notes") updated = updated.map(t => t.id === a.id ? { ...t, notes: a.notes } : t);
    }
    return updated;
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    setApiError(null);
    const userMsg = { role: "user", content: chatInput.trim() };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const { text, actions } = await askTIPO(newMsgs.map(m => ({ role: m.role, content: m.content })), tasks, memory);
      if (actions.length > 0) setTasks(prev => applyActions(actions, prev));
      setChatMsgs(prev => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      setApiError(err.message);
      setChatMsgs(prev => [...prev, { role: "assistant", content: "Sorry, er ging iets mis. Probeer opnieuw." }]);
    }
    setChatLoading(false);
  };

  const handlePrepare = async (task) => {
    setAiLoading(true);
    setApiError(null);
    try {
      const content = await prepareTask(task);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, aiContent: content } : t));
    } catch (err) { setApiError(err.message); }
    setAiLoading(false);
  };

  // Spraak (Kippie)
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setApiError("Spraak niet ondersteund in deze browser");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "nl-NL";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const TaskRow = ({ task, faded = false }) => {
    const cat = getCat(task.cat);
    const pct = progress(task.milestones);
    return (
      <div style={{ padding: "13px 0", borderBottom: `1px solid ${C.sand}`, opacity: faded ? 0.5 : 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <button onClick={() => toggleTask(task.id)} style={{
            width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
            border: faded ? "none" : `2px solid ${currentList.color}`,
            background: faded ? currentList.color : "transparent",
            cursor: "pointer", color: "white", fontSize: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{faded ? "✓" : ""}</button>

          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => openDetail(task)}>
            <div style={{ fontSize: 15, color: faded ? C.muted : C.dark, lineHeight: 1.45, textDecoration: faded ? "line-through" : "none", fontFamily: "'Georgia', serif" }}>
              {task.text}
            </div>
            <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: C.muted }}>{cat.emoji} {cat.label}</span>
              {task.notes    && <span style={{ fontSize: 10, color: C.sandDark }}>· 📝</span>}
              {task.aiContent && <span style={{ fontSize: 10, color: C.gold }}>· ✦</span>}
              {pct !== null  && <span style={{ fontSize: 10, color: pct === 100 ? currentList.color : C.sandDark }}>· {pct}%</span>}
            </div>
            {pct !== null && !faded && <ProgressBar milestones={task.milestones} color={currentList.color} />}
          </div>

          <Avatar ownerId={task.owner} size={24} onClick={() => cycleOwner(task.id)} />
          <button onClick={() => removeTask(task.id)} style={{ background: "none", border: "none", color: C.sandDark, cursor: "pointer", fontSize: 20, padding: "0 2px", flexShrink: 0, lineHeight: 1 }}>×</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Error banner */}
      {apiError && (
        <div style={{ background: C.redLight, borderBottom: `1px solid ${C.red}33`, padding: "8px 20px", fontSize: 12, color: C.red, display: "flex", justifyContent: "space-between" }}>
          <span>⚠️ {apiError}</span>
          <button onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* List tabs */}
      <div style={{ display: "flex", background: C.dark, padding: "0 20px", gap: 4, flexShrink: 0 }}>
        {LISTS.map(list => {
          const count = countFor(list.id);
          const active = tab === list.id;
          return (
            <button key={list.id} onClick={() => { setTab(list.id); setFilterCat(null); }} style={{
              flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer",
              color: active ? list.color : "#666",
              borderBottom: active ? `2.5px solid ${list.color}` : "2.5px solid transparent",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              fontFamily: "'Georgia', serif",
            }}>
              <span style={{ fontSize: 15 }}>{list.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{list.label}</span>
              {count > 0 && <span style={{ background: active ? list.color : "#333", color: "white", borderRadius: 8, padding: "1px 6px", fontSize: 10, fontFamily: "monospace" }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Cat filters */}
      <div style={{ display: "flex", gap: 5, padding: "10px 16px", overflowX: "auto", background: C.sand, borderBottom: `1px solid ${C.sandDark}`, scrollbarWidth: "none", flexShrink: 0 }}>
        {[{ id: null, label: "Alles", emoji: "" }, ...CATEGORIES].map(cat => {
          const isAll = cat.id === null;
          const count = isAll ? null : tasks.filter(t => t.list === tab && t.cat === cat.id && !t.done).length;
          if (!isAll && count === 0 && filterCat !== cat.id) return null;
          const active = isAll ? !filterCat : filterCat === cat.id;
          return (
            <button key={cat.id ?? "all"} onClick={() => setFilterCat(isAll ? null : filterCat === cat.id ? null : cat.id)} style={{
              padding: "5px 11px", borderRadius: 14, border: "none",
              background: active ? C.dark : C.paper, color: active ? C.gold : C.brown,
              fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {cat.emoji && <span style={{ marginRight: 3 }}>{cat.emoji}</span>}{cat.label}
              {count > 0 && <span style={{ marginLeft: 4, color: active ? C.gold + "88" : C.sandDark }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div style={{ flex: 1, padding: "8px 20px", overflowY: "auto" }}>
        {todo.length === 0 && done.length === 0 && (
          <div style={{ textAlign: "center", padding: "52px 0", color: C.sandDark, fontSize: 14 }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>✨</div>
            <div style={{ fontFamily: "'Georgia', serif" }}>Geen taken hier</div>
          </div>
        )}
        {todo.map(t => <TaskRow key={t.id} task={t} />)}
        {done.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: C.sandDark, textTransform: "uppercase", marginBottom: 8 }}>Afgerond ({done.length})</div>
            {done.map(t => <TaskRow key={t.id} task={t} faded />)}
          </div>
        )}
      </div>

      {/* Add task */}
      <div style={{ padding: "10px 20px 24px", borderTop: `1px solid ${C.sand}`, background: C.bg, flexShrink: 0 }}>
        {adding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input autoFocus value={newText} onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === "Escape" && setAdding(false)}
              placeholder="Wat moet er gebeuren?"
              style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${currentList.color}`, fontSize: 15, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.dark }}
            />
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notities (optioneel)..." rows={2}
              style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.brown, resize: "none", lineHeight: 1.5 }}
            />
            <OwnerPicker value={newOwner} onChange={setNewOwner} />
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setNewCat(cat.id)} style={{
                  padding: "6px 10px", borderRadius: 9, border: "none",
                  background: newCat === cat.id ? C.dark : C.sand,
                  color: newCat === cat.id ? C.gold : C.brown,
                  fontSize: 15, cursor: "pointer", flexShrink: 0,
                }}>{cat.emoji}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {LISTS.map(list => (
                <button key={list.id} onClick={() => setNewList(list.id)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 10, border: "none",
                  background: newList === list.id ? list.color : C.sand,
                  color: newList === list.id ? "white" : C.brown,
                  fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
                }}>{list.emoji} {list.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAdding(false); setNewText(""); setNewNotes(""); }} style={{
                flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${C.sand}`,
                background: "none", color: C.muted, fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif",
              }}>Annuleer</button>
              <button onClick={addTask} style={{
                flex: 2, padding: "11px", borderRadius: 12, border: "none",
                background: currentList.color, color: "white", fontSize: 14, cursor: "pointer",
                fontFamily: "'Georgia', serif", fontWeight: 700,
              }}>Voeg toe</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setAdding(true); setNewList(tab); }} style={{
            width: "100%", padding: "13px", borderRadius: 12,
            border: `1.5px dashed ${currentList.color}`, background: currentList.light, color: currentList.color,
            fontSize: 15, cursor: "pointer", fontFamily: "'Georgia', serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}><span style={{ fontSize: 20 }}>+</span> Nieuwe taak</button>
        )}
      </div>

      {/* Detail panel */}
      {detailItem && (() => {
        const cat   = getCat(detailItem.cat);
        const list  = getList(detailItem.list);
        const owner = getOwner(detailItem.owner);
        return (
          <>
            <div onClick={() => { saveNotes(); setDetailId(null); }} style={{ position: "fixed", inset: 0, background: "rgba(30,26,20,0.55)", zIndex: 10 }} />
            <div style={{
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 480, background: C.paper,
              borderRadius: "22px 22px 0 0", padding: "20px 22px 38px", zIndex: 11,
              boxShadow: "0 -12px 48px rgba(0,0,0,0.25)", maxHeight: "88vh", overflowY: "auto",
            }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: C.sand, margin: "0 auto 18px" }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <button onClick={() => { toggleTask(detailItem.id); setDetailId(null); }} style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                  border: detailItem.done ? "none" : `2px solid ${list.color}`,
                  background: detailItem.done ? list.color : "transparent",
                  cursor: "pointer", color: "white", fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{detailItem.done ? "✓" : ""}</button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, color: detailItem.done ? C.muted : C.dark, lineHeight: 1.4, textDecoration: detailItem.done ? "line-through" : "none", fontFamily: "'Georgia', serif" }}>
                    {detailItem.text}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: list.light, color: list.color }}>{list.emoji} {list.label}</span>
                    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: C.sand, color: C.brown }}>{cat.emoji} {cat.label}</span>
                    <span onClick={() => cycleOwner(detailItem.id)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: owner.bg, color: owner.color, cursor: "pointer" }}>
                      {owner.avatar} {owner.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: C.sand, borderRadius: 14, padding: "13px 15px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>📝 Notities</div>
                {editNotes ? (
                  <textarea autoFocus value={draftNotes} onChange={e => setDraftNotes(e.target.value)} rows={3}
                    style={{ width: "100%", border: "none", background: "transparent", fontSize: 14, fontFamily: "'Georgia', serif", color: C.dark, outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box" }}
                  />
                ) : (
                  <div onClick={() => setEditNotes(true)} style={{ fontSize: 14, color: draftNotes ? C.dark : C.sandDark, lineHeight: 1.6, cursor: "text", minHeight: 38, fontFamily: "'Georgia', serif" }}>
                    {draftNotes || "Tik om notities toe te voegen..."}
                  </div>
                )}
                {editNotes && <button onClick={saveNotes} style={{ marginTop: 8, padding: "7px 16px", borderRadius: 9, border: "none", background: list.color, color: "white", fontSize: 13, cursor: "pointer" }}>Opslaan</button>}
              </div>

              {/* AI preparation */}
              <div style={{ background: C.dark, borderRadius: 14, padding: "13px 15px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: detailItem.aiContent || aiLoading ? 12 : 0 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>✦ TIPO Voorbereiding</div>
                  <button onClick={() => handlePrepare(detailItem)} disabled={aiLoading} style={{
                    padding: "6px 13px", borderRadius: 9, border: "none",
                    background: aiLoading ? "#333" : C.gold, color: C.dark,
                    fontSize: 11, cursor: aiLoading ? "default" : "pointer", fontFamily: "'Georgia', serif", fontWeight: 700,
                  }}>{aiLoading ? "Laden..." : detailItem.aiContent ? "Ververs" : "Bereid voor"}</button>
                </div>
                {(detailItem.aiContent || aiLoading) && <AIContent content={detailItem.aiContent} loading={aiLoading} color={C.gold} />}
                {!detailItem.aiContent && !aiLoading && <div style={{ fontSize: 12, color: "#555", fontFamily: "'Georgia', serif" }}>Laat TIPO ideeën, bronnen en stappen genereren.</div>}
              </div>

              {/* Milestones */}
              <div style={{ background: C.sand, borderRadius: 14, padding: "13px 15px", marginBottom: 12 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>🎯 Mijlpalen</div>
                {detailItem.milestones?.length > 0 && <div style={{ marginBottom: 12 }}><ProgressBar milestones={detailItem.milestones} color={list.color} /></div>}
                <MilestoneEditor milestones={detailItem.milestones || []} onChange={ms => updateMilestones(detailItem.id, ms)} color={list.color} />
              </div>

              <button onClick={() => removeTask(detailItem.id)} style={{
                width: "100%", padding: "11px", borderRadius: 12, border: `1px solid ${C.sand}`,
                background: "none", color: C.sandDark, fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif",
              }}>Verwijder taak</button>
            </div>
          </>
        );
      })()}

      {/* Chat panel */}
      {chatOpen && (
        <>
          <div onClick={() => setChatOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(30,26,20,0.65)", zIndex: 20 }} />
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 480, background: C.dark,
            borderRadius: "22px 22px 0 0", zIndex: 21,
            display: "flex", flexDirection: "column", height: "74vh",
            boxShadow: "0 -12px 48px rgba(0,0,0,0.45)",
          }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #2A2520", flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#333", margin: "0 auto 14px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: C.gold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>✦ TIPO</div>
                  <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>Beheer taken · vraag advies · wijs toe</div>
                </div>
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 24 }}>×</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMsgs.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%", padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user" ? C.gold : "#252218",
                    color: msg.role === "user" ? C.dark : "#E8E0D0",
                    fontSize: 14, lineHeight: 1.6, fontFamily: "'Georgia', serif",
                  }}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: "#252218", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: "10px 16px 30px", borderTop: "1px solid #252218", flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
              {/* Kippie spraakknop */}
              <button onClick={startListening} style={{
                width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
                background: isListening ? C.red : "#2A2520",
                color: isListening ? "white" : C.gold, fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: isListening ? "tipoFade 1s infinite" : "none",
              }} title="Kippie — spreek je bericht in">🎙️</button>

              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder={isListening ? "Luisteren..." : "Vraag TIPO iets..."}
                style={{ flex: 1, padding: "11px 15px", borderRadius: 24, border: "1px solid #333", background: "#1A1710", color: "#E8E0D0", fontSize: 14, fontFamily: "'Georgia', serif", outline: "none" }}
              />
              <button onClick={sendChat} disabled={chatLoading} style={{
                width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
                background: chatLoading ? "#333" : C.gold, color: C.dark,
                cursor: chatLoading ? "default" : "pointer", fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>↑</button>
            </div>
          </div>
        </>
      )}

      {/* Chat button (floating) */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} style={{
          position: "fixed", bottom: 90, right: 20,
          width: 52, height: 52, borderRadius: "50%",
          background: C.dark, border: `2px solid ${C.gold}`,
          color: C.gold, fontSize: 20, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 5,
        }} title="TIPO openen">✦</button>
      )}
    </div>
  );
}

// ─── ROUTINES TAB ─────────────────────────────────────────────────────────────
function RoutinesTab({ routines, setRoutines }) {
  const [period, setPeriod]   = useState("weekly");
  const [filter, setFilter]   = useState(null);
  const [adding, setAdding]   = useState(false);
  const [newText, setNewText] = useState("");
  const [newEmoji, setNewEmoji] = useState("✅");
  const [newOwner, setNewOwner] = useState("sven");
  const [newCat, setNewCat]   = useState("leefstijl");

  const weekKey  = getWeekKey();
  const monthKey = getMonthKey();
  const key = period === "weekly" ? weekKey : monthKey;

  const toggle = (id) => {
    setRoutines(prev => ({
      ...prev,
      [period]: prev[period].map(r => {
        if (r.id !== id) return r;
        const comps = r.completions || {};
        const done = !comps[key];
        return { ...r, completions: { ...comps, [key]: done || undefined }, streak: done ? (r.streak || 0) + 1 : Math.max(0, (r.streak || 0) - 1) };
      }),
    }));
  };

  const cycleOwner = (id) => {
    setRoutines(prev => ({
      ...prev,
      [period]: prev[period].map(r => {
        if (r.id !== id) return r;
        const owners = OWNERS.filter(o => o.id !== "samen");
        const idx = owners.findIndex(o => o.id === r.owner);
        return { ...r, owner: owners[(idx + 1) % owners.length].id };
      }),
    }));
  };

  const addRoutine = () => {
    if (!newText.trim()) return;
    const id = `${period[0]}${Date.now()}`;
    setRoutines(prev => ({
      ...prev,
      [period]: [...prev[period], { id, text: newText.trim(), emoji: newEmoji, owner: newOwner, cat: newCat, streak: 0, completions: {} }],
    }));
    setNewText(""); setAdding(false);
  };

  const visible = routines[period].filter(r => !filter || r.owner === filter);
  const cats = ["leefstijl", "huishouden", "baby"].filter(c => visible.some(r => r.cat === c));

  // Score
  const stats = OWNERS.filter(o => o.id !== "samen").map(o => {
    const mine = routines[period].filter(r => r.owner === o.id);
    const done = mine.filter(r => (r.completions || {})[key]).length;
    const pct  = mine.length ? Math.round(done / mine.length * 100) : 0;
    return { ...o, done, total: mine.length, pct, maxStreak: mine.length ? Math.max(...mine.map(r => r.streak || 0)) : 0 };
  });
  const leader = stats[0].pct >= stats[1].pct ? stats[0] : stats[1];

  const EMOJIS = ["🫀","💪","😴","🧘","🥗","💊","🩸","🛒","🏠","📋","💶","👶","✨","📖","🚶"];

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {/* Period tabs */}
      <div style={{ display: "flex", background: C.dark, padding: "0 20px" }}>
        {[{ id: "weekly", label: "Wekelijks", emoji: "🔥" }, { id: "monthly", label: "Maandelijks", emoji: "📅" }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer",
            color: period === p.id ? C.gold : "#555",
            borderBottom: period === p.id ? `2.5px solid ${C.gold}` : "2.5px solid transparent",
            fontSize: 12, fontFamily: "'Georgia', serif",
          }}>{p.emoji} {p.label}</button>
        ))}
      </div>

      <div style={{ padding: "16px 18px 0" }}>
        {/* Score */}
        <div style={{ background: C.dark, borderRadius: 18, padding: "18px 20px", marginBottom: 18 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14, opacity: 0.8 }}>Scorebord</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {stats.map(s => (
              <div key={s.id} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "13px 14px", border: s.id === leader.id && s.pct > 0 ? `1px solid ${C.gold}44` : "1px solid transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Avatar ownerId={s.id} size={24} />
                    <span style={{ color: "#E0D8CC", fontSize: 13, fontFamily: "'Georgia', serif" }}>{s.label}</span>
                  </div>
                  {s.id === leader.id && s.pct > 0 && <span>👑</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                    <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke={s.pct === 100 ? C.gold : s.color}
                        strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - s.pct / 100)}`}
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: s.pct === 100 ? C.gold : "#E8E0D0", fontFamily: "monospace" }}>{s.pct}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#888", fontSize: 11 }}>{s.done}/{s.total}</div>
                    {s.maxStreak > 0 && <div style={{ color: C.gold, fontSize: 11, marginTop: 2 }}>🔥 {s.maxStreak}×</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(() => {
            const tot = stats.reduce((a, s) => a + s.total, 0);
            const don = stats.reduce((a, s) => a + s.done, 0);
            const pct = tot ? Math.round(don / tot * 100) : 0;
            return (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>GEZAMENLIJK</span>
                  <span style={{ fontSize: 9, color: pct === 100 ? C.gold : "#555", fontFamily: "monospace" }}>{don}/{tot}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.gold : `linear-gradient(90deg, ${C.sven}, ${C.eva})`, borderRadius: 2, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Owner filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button onClick={() => setFilter(null)} style={{ padding: "5px 12px", borderRadius: 14, border: "none", fontSize: 11, cursor: "pointer", background: !filter ? C.dark : C.sand, color: !filter ? C.gold : C.brown, fontFamily: "'Georgia', serif" }}>Iedereen</button>
          {OWNERS.filter(o => o.id !== "samen").map(o => (
            <button key={o.id} onClick={() => setFilter(filter === o.id ? null : o.id)} style={{
              padding: "5px 12px", borderRadius: 14, border: `1px solid ${filter === o.id ? o.color : C.sand}`,
              background: filter === o.id ? o.bg : C.paper, color: filter === o.id ? o.color : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
            }}>{o.avatar} {o.label}</button>
          ))}
        </div>

        {/* Routines */}
        {cats.map(cat => {
          const items = visible.filter(r => r.cat === cat);
          if (!items.length) return null;
          const catInfo = ROUTINE_CATS.find(c => c.id === cat);
          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>{catInfo?.emoji} {catInfo?.label}</div>
              {items.map(r => {
                const done = !!(r.completions || {})[key];
                return (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 11,
                    padding: "12px 14px", borderRadius: 14, marginBottom: 8,
                    background: done ? `${C.sand}88` : C.paper,
                    border: `1px solid ${done ? C.sandDark : C.sand}`,
                  }}>
                    <button onClick={() => toggle(r.id)} style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${done ? C.gold : C.sandDark}`,
                      background: done ? C.gold : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: 13, transition: "all 0.2s",
                    }}>{done ? "✓" : ""}</button>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{r.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: done ? C.muted : C.dark, textDecoration: done ? "line-through" : "none", fontFamily: "'Georgia', serif", lineHeight: 1.3 }}>{r.text}</div>
                      {(r.streak || 0) > 0 && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>🔥 {r.streak}× op rij</div>}
                    </div>
                    <div onClick={() => cycleOwner(r.id)} style={{ cursor: "pointer" }}>
                      <Avatar ownerId={r.owner} size={26} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Add form */}
        {adding && (
          <div style={{ background: C.paper, borderRadius: 16, padding: 16, marginBottom: 14, border: `1.5px solid ${C.gold}` }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, marginBottom: 12, textTransform: "uppercase" }}>Nieuwe routine</div>
            <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && addRoutine()}
              placeholder="Omschrijving..." autoFocus
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box", marginBottom: 10, color: C.dark }}
            />
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setNewEmoji(em)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${newEmoji === em ? C.gold : C.sand}`, background: newEmoji === em ? `${C.gold}20` : C.paper, fontSize: 16, cursor: "pointer" }}>{em}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {OWNERS.filter(o => o.id !== "samen").map(o => (
                <button key={o.id} onClick={() => setNewOwner(o.id)} style={{
                  flex: 1, padding: "7px", borderRadius: 10, border: `1.5px solid ${newOwner === o.id ? o.color : C.sand}`,
                  background: newOwner === o.id ? o.bg : C.paper, color: newOwner === o.id ? o.color : C.muted,
                  fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif",
                }}>{o.avatar} {o.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {ROUTINE_CATS.map(c => (
                <button key={c.id} onClick={() => setNewCat(c.id)} style={{
                  flex: 1, padding: "6px", borderRadius: 10, border: "none",
                  background: newCat === c.id ? C.dark : C.sand,
                  color: newCat === c.id ? C.gold : C.brown,
                  fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
                }}>{c.emoji} {c.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setAdding(false)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${C.sand}`, background: "none", color: C.muted, fontSize: 13, cursor: "pointer" }}>Annuleer</button>
              <button onClick={addRoutine} style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Toevoegen</button>
            </div>
          </div>
        )}

        {!adding && (
          <button onClick={() => setAdding(true)} style={{
            width: "100%", padding: "13px", borderRadius: 12,
            border: `1.5px dashed ${C.gold}`, background: `${C.gold}10`, color: C.gold,
            fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24,
          }}>+ Routine toevoegen</button>
        )}
      </div>
    </div>
  );
}

// ─── RECAP TAB ────────────────────────────────────────────────────────────────
function RecapTab({ tasks, recaps, setRecaps, setMemory }) {
  const [view, setView]         = useState("overview");
  const [svenDone, setSvenDone] = useState(false);
  const [evaDone, setEvaDone]   = useState(false);
  const [svenAns, setSvenAns]   = useState(null);
  const [evaAns, setEvaAns]     = useState(null);
  const [insight, setInsight]   = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reminderDay, setReminderDay]   = useState("zondag");
  const [reminderTime, setReminderTime] = useState("09:00");

  const weekLabel = (() => {
    const n = new Date();
    return `Week ${getWeekKey().split("W")[1]} · ${n.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`;
  })();

  const generateInsight = async (sa, ea) => {
    setInsightLoading(true);
    try {
      const text = await generateRecapInsight(sa, ea, tasks);
      setInsight(text);
      // Sla recap op
      const newRecap = { week: weekLabel, date: new Date().toISOString(), sven: sa, eva: ea, insight: text };
      const updated = [newRecap, ...recaps].slice(0, 12);
      setRecaps(updated);
      // Update geheugen
      const memSummary = `Recap ${weekLabel}: Sven energie ${sa.energy}/5 (${sa.highlight}), Eva energie ${ea.energy}/5 (${ea.highlight}). TIPO inzicht: ${text}`;
      setMemory(prev => (prev ? `${memSummary}\n\n${prev}` : memSummary).slice(0, 2000));
    } catch (_) { setInsight("Kon geen inzicht genereren. Probeer later opnieuw."); }
    setInsightLoading(false);
  };

  const RecapForm = ({ owner, onDone }) => {
    const o = OWNERS.find(o2 => o2.id === owner);
    const [answers, setAnswers] = useState({ energy: 0 });
    const [step, setStep] = useState(0);
    const q = RECAP_QUESTIONS[step];
    const isLast = step === RECAP_QUESTIONS.length - 1;
    const canNext = q.type === "scale" ? answers.energy > 0 : (answers[q.id] || "").trim().length > 2;

    const next = () => {
      if (isLast) { onDone(answers); return; }
      setStep(s => s + 1);
    };

    return (
      <div style={{ background: C.paper, borderRadius: 18, padding: 20, border: `1px solid ${C.sand}` }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
          {RECAP_QUESTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? o.color : C.sand, transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>{q.icon}</span>
          <div style={{ fontSize: 14, color: C.dark, fontFamily: "'Georgia', serif", lineHeight: 1.4 }}>{q.label}</div>
        </div>
        {q.type === "scale" ? (
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setAnswers(a => ({ ...a, energy: n }))} style={{
                flex: 1, padding: "12px 4px", borderRadius: 12,
                border: `1.5px solid ${answers.energy >= n ? o.color : C.sand}`,
                background: answers.energy >= n ? `${o.color}18` : C.paper,
                fontSize: 22, cursor: "pointer", transition: "all 0.15s",
              }}>{["😴","😐","🙂","😊","🔥"][n-1]}</button>
            ))}
          </div>
        ) : (
          <textarea value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
            placeholder={q.placeholder} rows={3} autoFocus
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.sand}`, fontSize: 14, fontFamily: "'Georgia', serif", color: C.dark, outline: "none", resize: "none", lineHeight: 1.6, background: "white", boxSizing: "border-box", marginTop: 8 }}
          />
        )}
        <button onClick={next} disabled={!canNext} style={{
          width: "100%", marginTop: 16, padding: "13px", borderRadius: 12, border: "none",
          background: canNext ? o.color : C.sand, color: canNext ? "white" : C.muted,
          fontSize: 14, cursor: canNext ? "pointer" : "default", fontFamily: "'Georgia', serif", fontWeight: 700,
        }}>{isLast ? "Afronden ✓" : "Volgende →"}</button>
      </div>
    );
  };

  if (view === "recap-sven") return (
    <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Avatar ownerId="sven" size={34} />
        <div>
          <div style={{ fontSize: 15, color: C.dark, fontFamily: "'Georgia', serif" }}>Sven's check-in</div>
          <div style={{ fontSize: 11, color: C.muted }}>4 vragen · ~2 minuten</div>
        </div>
      </div>
      <RecapForm owner="sven" onDone={a => { setSvenAns(a); setSvenDone(true); setView("overview"); }} />
    </div>
  );

  if (view === "recap-eva") return (
    <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Avatar ownerId="eva" size={34} />
        <div>
          <div style={{ fontSize: 15, color: C.dark, fontFamily: "'Georgia', serif" }}>Eva's check-in</div>
          <div style={{ fontSize: 11, color: C.muted }}>4 vragen · ~2 minuten</div>
        </div>
      </div>
      <RecapForm owner="eva" onDone={a => { setEvaAns(a); setEvaDone(true); setView("overview"); }} />
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 0" }}>

      {/* Settings */}
      {showSettings && (
        <div style={{ background: C.paper, borderRadius: 18, padding: 18, marginBottom: 16, border: `1px solid ${C.sand}` }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>⚙️ Herinnering</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Dag</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["ma","di","wo","do","vr","za","zo"].map((d, i) => {
                const full = ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"][i];
                return (
                  <button key={d} onClick={() => setReminderDay(full)} style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: reminderDay === full ? C.dark : C.sand, color: reminderDay === full ? C.gold : C.brown, fontSize: 11, cursor: "pointer" }}>{d}</button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Tijdstip</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["07:00","08:00","09:00","10:00","11:00","19:00","20:00"].map(t => (
                <button key={t} onClick={() => setReminderTime(t)} style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: reminderTime === t ? C.dark : C.sand, color: reminderTime === t ? C.gold : C.brown, fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ background: `${C.gold}18`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.brown, fontFamily: "'Georgia', serif" }}>
            📲 Elke <strong>{reminderDay}</strong> om <strong>{reminderTime}</strong>
          </div>
          <button onClick={() => setShowSettings(false)} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Opslaan</button>
        </div>
      )}

      {/* Check-in cards */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>
          {weekLabel} — invullen
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { owner: "sven", done: svenDone, action: () => setView("recap-sven") },
            { owner: "eva",  done: evaDone,  action: () => setView("recap-eva") },
          ].map(({ owner, done, action }) => {
            const o = OWNERS.find(o2 => o2.id === owner);
            return (
              <button key={owner} onClick={action} style={{
                flex: 1, padding: "18px 14px", borderRadius: 18, cursor: done ? "default" : "pointer",
                border: `1.5px solid ${done ? o.color : C.sand}`,
                background: done ? o.bg : C.paper,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                <Avatar ownerId={owner} size={40} />
                <div style={{ fontSize: 13, color: done ? o.color : C.dark, fontFamily: "'Georgia', serif" }}>{o.label}</div>
                <div style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: done ? o.color : C.sand, color: done ? "white" : C.muted }}>
                  {done ? "✓ Gedaan" : "Invullen →"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TIPO insight als beide klaar */}
      {svenDone && evaDone && (
        <div style={{ background: C.dark, borderRadius: 18, padding: "16px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>✦ TIPO Inzicht</div>
          {!insight && !insightLoading && (
            <button onClick={() => generateInsight(svenAns, evaAns)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>
              Genereer inzicht
            </button>
          )}
          {insightLoading && (
            <div style={{ display: "flex", gap: 5, padding: "10px 0" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}
            </div>
          )}
          {insight && <div style={{ fontSize: 13, color: "#E8E0D0", lineHeight: 1.75, fontFamily: "'Georgia', serif" }}>{insight}</div>}
        </div>
      )}

      {/* Vorige recaps */}
      {recaps.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>Vorige recaps</div>
          {recaps.map((recap, i) => (
            <div key={i} style={{ background: C.paper, borderRadius: 16, padding: "14px 16px", marginBottom: 10, border: `1px solid ${C.sand}` }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, fontFamily: "'Georgia', serif" }}>{recap.week}</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                {[{ o: OWNERS[0], a: recap.sven }, { o: OWNERS[1], a: recap.eva }].map(({ o, a }) => (
                  <div key={o.id} style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <Avatar ownerId={o.id} size={18} />
                      <span style={{ fontSize: 11, color: o.color, fontFamily: "'Georgia', serif" }}>{o.label}</span>
                      <span style={{ fontSize: 14 }}>{["😴","😐","🙂","😊","🔥"][(a?.energy || 1) - 1]}</span>
                    </div>
                    {a?.highlight && <div style={{ fontSize: 11, color: C.brown, lineHeight: 1.5, fontFamily: "'Georgia', serif" }}>✨ {a.highlight}</div>}
                    {a?.focus && <div style={{ fontSize: 11, color: C.brown, lineHeight: 1.5, marginTop: 2, fontFamily: "'Georgia', serif" }}>🎯 {a.focus}</div>}
                  </div>
                ))}
              </div>
              {recap.insight && (
                <div style={{ background: `${C.gold}14`, borderRadius: 10, padding: "8px 12px", fontSize: 11, color: C.brown, lineHeight: 1.5, fontFamily: "'Georgia', serif" }}>
                  ✦ {recap.insight}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]           = useState("taken");
  const [filterOwner, setFilterOwner] = useState(null);
  const [tasks, setTasks]       = useState(null);
  const [routines, setRoutines] = useState(null);
  const [recaps, setRecaps]     = useState([]);
  const [memory, setMemory]     = useState("");
  const [loading, setLoading]   = useState(true);

  // Baby countdown
  const babyDate = new Date("2025-09-01");
  const daysLeft = Math.max(0, Math.ceil((babyDate - new Date()) / 86400000));

  useEffect(() => {
    Promise.all([
      loadData(KEYS.tasks, DEFAULT_TASKS),
      loadData(KEYS.routines, DEFAULT_ROUTINES),
      loadData(KEYS.recaps, []),
      loadData(KEYS.memory, ""),
    ]).then(([t, r, rc, m]) => {
      setTasks(t); setRoutines(r); setRecaps(rc); setMemory(m);
      setLoading(false);
    });
  }, []);

  useEffect(() => { if (tasks) saveData(KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { if (routines) saveData(KEYS.routines, routines); }, [routines]);
  useEffect(() => { if (recaps.length) saveData(KEYS.recaps, recaps); }, [recaps]);
  useEffect(() => { if (memory) saveData(KEYS.memory, memory); }, [memory]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.dark, fontFamily: "'Georgia', serif" }}>
      <div style={{ color: C.gold, fontSize: 28, marginBottom: 12, letterSpacing: -1 }}>TIPO Brain</div>
      <div style={{ display: "flex", gap: 5 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}
      </div>
      <style>{`@keyframes tipoFade { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );

  const openCount = tasks.filter(t => !t.done).length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>

      {/* Header */}
      <div style={{ background: C.dark, padding: "22px 22px 0", flexShrink: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 3, opacity: 0.7 }}>Tilanus · Poorthuis</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 400, color: "#F5F0E8", letterSpacing: -0.5 }}>TIPO Brain</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {daysLeft > 0 && (
              <div style={{ background: "#2A2218", borderRadius: 12, padding: "5px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, fontFamily: "monospace" }}>{daysLeft}</div>
                <div style={{ fontSize: 8, color: "#555", letterSpacing: 1 }}>DAGEN</div>
              </div>
            )}
            <span style={{ color: "#444", fontSize: 12 }}>{openCount} open</span>
          </div>
        </div>

        {/* Owner filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button onClick={() => setFilterOwner(null)} style={{ padding: "4px 11px", borderRadius: 14, border: "none", fontSize: 11, cursor: "pointer", background: !filterOwner ? "#3A3528" : "transparent", color: !filterOwner ? "#F5F0E8" : "#555", fontFamily: "'Georgia', serif" }}>Iedereen</button>
          {OWNERS.map(o => (
            <button key={o.id} onClick={() => setFilterOwner(filterOwner === o.id ? null : o.id)} style={{
              padding: "4px 11px", borderRadius: 14, border: `1px solid ${filterOwner === o.id ? o.color : "#333"}`,
              background: filterOwner === o.id ? o.bg : "transparent",
              color: filterOwner === o.id ? o.color : "#555",
              fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
            }}>{o.avatar} {o.label}</button>
          ))}
        </div>

        {/* Main tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {[
            { id: "taken",    label: "Taken",    emoji: "✓" },
            { id: "routines", label: "Routines", emoji: "🔄" },
            { id: "recap",    label: "Recap",    emoji: "📊" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer",
              color: tab === t.id ? C.gold : "#555",
              borderBottom: tab === t.id ? `2.5px solid ${C.gold}` : "2.5px solid transparent",
              fontSize: 12, fontFamily: "'Georgia', serif",
            }}>{t.emoji} {t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tab === "taken"    && <TasksTab tasks={tasks} setTasks={setTasks} memory={memory} />}
        {tab === "routines" && <RoutinesTab routines={routines} setRoutines={setRoutines} />}
        {tab === "recap"    && <RecapTab tasks={tasks} recaps={recaps} setRecaps={setRecaps} setMemory={setMemory} />}
      </div>

      <style>{`
        @keyframes tipoFade { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
