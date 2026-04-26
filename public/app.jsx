import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const OWNERS = [
  { id: "sven", label: "Sven", color: "#4A7FA5", bg: "#EEF4F9", avatar: "S" },
  { id: "eva",  label: "Eva",  color: "#9B6B9B", bg: "#F5EEF5", avatar: "E" },
  { id: "samen", label: "Samen", color: "#7A7A7A", bg: "#F0F0F0", avatar: "✦" },
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
  { id: "nu",   label: "Nu",        emoji: "🔥", color: "#C94B3A", light: "#FFF0EE" },
  { id: "week", label: "Deze week", emoji: "📅", color: "#B07218", light: "#FFF8EE" },
  { id: "ooit", label: "Ooit",      emoji: "🌱", color: "#3A7D5C", light: "#F0FBF5" },
];

const DEFAULT_ITEMS = [
  {
    id: 1, text: "Huisarts bellen voor baby check-up", done: false, list: "nu", cat: "baby",
    owner: "eva", notes: "Vraag ook naar vaccinaties planning", milestones: [], aiContent: null,
  },
  {
    id: 2, text: "Luiers bijbestellen", done: false, list: "nu", cat: "baby",
    owner: "sven", notes: "", milestones: [], aiContent: null,
  },
  {
    id: 3, text: "Kinderopvang vergelijken", done: false, list: "ooit", cat: "baby",
    owner: "samen", notes: "De Paddestoel, Hummelhoeve, KinderRijk",
    milestones: [
      { id: "m1", text: "Lijst met opties maken", done: true,  owner: "eva" },
      { id: "m2", text: "3 locaties bezoeken",    done: false, owner: "samen" },
      { id: "m3", text: "Keuze maken",            done: false, owner: "samen" },
    ],
    aiContent: null,
  },
  {
    id: 4, text: "Hypotheek adviesgesprek plannen", done: false, list: "ooit", cat: "nieuw_huis",
    owner: "sven", notes: "Adviseur: Jan de Vries 06-12345678",
    milestones: [
      { id: "m4", text: "Adviseur contacteren",  done: true,  owner: "sven" },
      { id: "m5", text: "Documenten verzamelen", done: true,  owner: "samen" },
      { id: "m6", text: "Gesprek inplannen",     done: false, owner: "sven" },
      { id: "m7", text: "Gesprek voeren",        done: false, owner: "samen" },
    ],
    aiContent: null,
  },
  {
    id: 5, text: "Zomervakantie bestemming kiezen", done: false, list: "ooit", cat: "vakantie",
    owner: "samen", notes: "Ideeën: Zuid-Frankrijk, Italië, Kroatië", milestones: [], aiContent: null,
  },
  {
    id: 6, text: "Spaarrekening baby openen", done: false, list: "ooit", cat: "financieel",
    owner: "sven", notes: "", milestones: [], aiContent: null,
  },
];

let nextId  = 10;
let nextMid = 100;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCat   = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[5];
const getList  = (id) => LISTS.find(l => l.id === id) || LISTS[0];
const getOwner = (id) => OWNERS.find(o => o.id === id) || OWNERS[2];

const progress = (milestones) => {
  if (!milestones?.length) return null;
  return Math.round((milestones.filter(m => m.done).length / milestones.length) * 100);
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "gezins-assistent-v4";

async function loadItems() {
  try {
    const r = await window.storage.get(STORAGE_KEY);
    if (r?.value) return JSON.parse(r.value);
  } catch (_) {}
  return DEFAULT_ITEMS;
}

async function saveItems(items) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(items)); } catch (_) {}
}

// ─── Claude API ───────────────────────────────────────────────────────────────

async function callClaude(messages, systemPrompt, maxTokens = 1000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.find(b => b.type === "text")?.text || "";
}

async function askAssistant(messages, items) {
  const system = `Je bent een warme, praktische Nederlandse gezinsassistent voor Sven en Eva. Ze hebben samen een baby en beheren hun huishouden, financiën en toekomstplannen.

Huidige taken (JSON):
${JSON.stringify(items, null, 2)}

Beschikbare owners: sven, eva, samen
Beschikbare lijsten: nu, week, ooit  
Beschikbare categorieën: huis, baby, financieel, vakantie, nieuw_huis, overig

Als de gebruiker acties wil, voeg dan een <actions> blok toe aan het EINDE van je bericht:

<actions>
[
  { "type": "add", "text": "titel", "list": "nu|week|ooit", "cat": "cat", "owner": "sven|eva|samen", "notes": "" },
  { "type": "done",         "id": 123 },
  { "type": "undone",       "id": 123 },
  { "type": "delete",       "id": 123 },
  { "type": "move",         "id": 123, "list": "ooit" },
  { "type": "set_owner",    "id": 123, "owner": "eva" },
  { "type": "update_notes", "id": 123, "notes": "tekst" }
]
</actions>

Reageer altijd in het Nederlands. Wees beknopt en warm.`;

  const text = await callClaude(messages, system);
  const match = text.match(/<actions>([\s\S]*?)<\/actions>/);
  let actions = [];
  if (match) { try { actions = JSON.parse(match[1].trim()); } catch (_) {} }
  return { text: text.replace(/<actions>[\s\S]*?<\/actions>/, "").trim(), actions };
}

async function prepareTask(item) {
  const system = `Je bent een Nederlandse gezinsassistent die taken voorbereidt voor een jong gezin (Sven en Eva, baby). 
Geef praktische, concrete hulp: ideeën, bronnen, stappenplan, aandachtspunten. Gebruik emoji's spaarzaam. Markdown mag (##, -, **bold**). Wees concreet en beknopt — max 400 woorden.`;

  const text = await callClaude(
    [{ role: "user", content: `Bereid deze taak voor mij voor: "${item.text}"\n\nContext: ${item.notes || "geen"}` }],
    system,
    1200,
  );
  return text;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OwnerBadge({ ownerId, size = "sm", onClick }) {
  const o = getOwner(ownerId || "samen");
  const sz = size === "sm" ? 20 : 26;
  return (
    <div
      onClick={onClick}
      title={o.label}
      style={{
        width: sz, height: sz, borderRadius: "50%",
        background: o.bg, border: `1.5px solid ${o.color}`,
        color: o.color, fontSize: sz * 0.45, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: onClick ? "pointer" : "default", flexShrink: 0,
        fontFamily: "system-ui",
      }}
    >{o.avatar}</div>
  );
}

function OwnerPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {OWNERS.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flex: 1, padding: "6px 4px", borderRadius: 8, border: `1.5px solid ${value === o.id ? o.color : "#DDD"}`,
          background: value === o.id ? o.bg : "white",
          color: value === o.id ? o.color : "#888",
          fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        }}>
          <span style={{ fontFamily: "system-ui", fontWeight: 700 }}>{o.avatar}</span> {o.label}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ milestones, color }) {
  const pct = progress(milestones);
  if (pct === null) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: "#AAA", letterSpacing: 1 }}>VOORTGANG</span>
        <span style={{ fontSize: 10, color: pct === 100 ? color : "#AAA", fontFamily: "monospace" }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "#E8E5DF", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? color : `${color}99`, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function MilestoneEditor({ milestones, onChange, color }) {
  const [newText, setNewText]   = useState("");
  const [newOwner, setNewOwner] = useState("samen");

  const toggle    = (id) => onChange(milestones.map(m => m.id === id ? { ...m, done: !m.done } : m));
  const remove    = (id) => onChange(milestones.filter(m => m.id !== id));
  const cycleOwner = (id) => {
    onChange(milestones.map(m => {
      if (m.id !== id) return m;
      const idx = OWNERS.findIndex(o => o.id === (m.owner || "samen"));
      return { ...m, owner: OWNERS[(idx + 1) % OWNERS.length].id };
    }));
  };
  const add = () => {
    if (!newText.trim()) return;
    onChange([...milestones, { id: `m${nextMid++}`, text: newText.trim(), done: false, owner: newOwner }]);
    setNewText("");
  };

  return (
    <div>
      {milestones.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #EDEAE5" }}>
          <button onClick={() => toggle(m.id)} style={{
            width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${m.done ? color : "#CCC"}`,
            background: m.done ? color : "none", cursor: "pointer", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10,
          }}>{m.done ? "✓" : ""}</button>
          <span style={{ flex: 1, fontSize: 13, color: m.done ? "#AAA" : "#333", textDecoration: m.done ? "line-through" : "none" }}>
            {m.text}
          </span>
          <OwnerBadge ownerId={m.owner} size="sm" onClick={() => cycleOwner(m.id)} />
          <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", color: "#DDD", cursor: "pointer", fontSize: 14, padding: "0 2px" }}>×</button>
        </div>
      ))}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Nieuwe mijlpaal..."
            style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1px solid #DDD", fontSize: 12, fontFamily: "'Georgia', serif", background: "white", outline: "none" }}
          />
          <button onClick={add} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: color, color: "white", fontSize: 14, cursor: "pointer" }}>+</button>
        </div>
        <OwnerPicker value={newOwner} onChange={setNewOwner} />
      </div>
    </div>
  );
}

function AIContent({ content, loading, color }) {
  if (loading) return (
    <div style={{ display: "flex", gap: 4, padding: "12px 0" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, opacity: 0.5, animation: `pulse 1.2s ${i*0.2}s infinite` }} />
      ))}
    </div>
  );
  if (!content) return null;

  // Simple markdown renderer
  const lines = content.split("\n");
  return (
    <div style={{ fontSize: 13, color: "#333", lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#1C1C1A", marginTop: 12, marginBottom: 4 }}>{line.slice(3)}</div>;
        if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }}>· {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}</div>;
        if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
        return <div key={i} style={{ marginBottom: 2 }}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</div>;
      })}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [items, setItems]         = useState(null);
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
    { role: "assistant", content: "Hoi Sven en Eva! 👋 Ik ben jullie gezinsassistent. Ik kan taken beheren, voorbereiden en ideeën aandragen. Wat kan ik voor jullie doen?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { loadItems().then(setItems); }, []);
  useEffect(() => { if (items) saveItems(items); }, [items]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  if (!items) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", color: "#AAA", fontSize: 16 }}>
      Laden...
    </div>
  );

  const applyActions = (actions, prev) => {
    let updated = [...prev];
    for (const a of actions) {
      if (a.type === "add")          updated.push({ id: nextId++, text: a.text, done: false, list: a.list || "nu", cat: a.cat || "overig", owner: a.owner || "samen", notes: a.notes || "", milestones: [], aiContent: null });
      else if (a.type === "done")         updated = updated.map(i => i.id === a.id ? { ...i, done: true }  : i);
      else if (a.type === "undone")       updated = updated.map(i => i.id === a.id ? { ...i, done: false } : i);
      else if (a.type === "delete")       updated = updated.filter(i => i.id !== a.id);
      else if (a.type === "move")         updated = updated.map(i => i.id === a.id ? { ...i, list: a.list } : i);
      else if (a.type === "set_owner")    updated = updated.map(i => i.id === a.id ? { ...i, owner: a.owner } : i);
      else if (a.type === "update_notes") updated = updated.map(i => i.id === a.id ? { ...i, notes: a.notes } : i);
    }
    return updated;
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const { text, actions } = await askAssistant(newMsgs.map(m => ({ role: m.role, content: m.content })), items);
      if (actions.length > 0) setItems(prev => applyActions(actions, prev));
      setChatMsgs(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setChatMsgs(prev => [...prev, { role: "assistant", content: "Sorry, er ging iets mis. Probeer opnieuw." }]);
    }
    setChatLoading(false);
  };

  const handlePrepare = async (item) => {
    setAiLoading(true);
    try {
      const content = await prepareTask(item);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, aiContent: content } : i));
    } catch { }
    setAiLoading(false);
  };

  const currentList  = LISTS.find(l => l.id === tab);
  const detailItem   = items.find(i => i.id === detailId);

  const visibleItems = items.filter(i =>
    i.list === tab &&
    (!filterCat   || i.cat   === filterCat) &&
    (!filterOwner || i.owner === filterOwner)
  );
  const todo = visibleItems.filter(i => !i.done);
  const done = visibleItems.filter(i => i.done);

  const toggleItem      = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const removeItem      = (id) => { setItems(prev => prev.filter(i => i.id !== id)); if (detailId === id) setDetailId(null); };
  const updateMilestones = (id, ms) => setItems(prev => prev.map(i => i.id === id ? { ...i, milestones: ms } : i));
  const countFor         = (lid) => items.filter(i => i.list === lid && !i.done).length;
  const saveNotes        = () => { setItems(prev => prev.map(i => i.id === detailId ? { ...i, notes: draftNotes } : i)); setEditNotes(false); };
  const cycleItemOwner   = (id) => setItems(prev => prev.map(i => {
    if (i.id !== id) return i;
    const idx = OWNERS.findIndex(o => o.id === (i.owner || "samen"));
    return { ...i, owner: OWNERS[(idx + 1) % OWNERS.length].id };
  }));

  const openDetail = (item) => { setDetailId(item.id); setDraftNotes(item.notes || ""); setEditNotes(false); };

  const addItem = () => {
    if (!newText.trim()) return;
    setItems(prev => [...prev, { id: nextId++, text: newText.trim(), done: false, list: newList, cat: newCat, owner: newOwner, notes: newNotes.trim(), milestones: [], aiContent: null }]);
    setNewText(""); setNewNotes(""); setAdding(false);
  };

  // ── TaskRow ──────────────────────────────────────────────────────────────────

  const TaskRow = ({ item, faded = false }) => {
    const cat   = getCat(item.cat);
    const pct   = progress(item.milestones);
    const owner = getOwner(item.owner);
    return (
      <div style={{ padding: "12px 0", borderBottom: "1px solid #E8E5DF", opacity: faded ? 0.45 : 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <button onClick={() => toggleItem(item.id)} style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
            border: faded ? "none" : `2px solid ${currentList.color}`,
            background: faded ? currentList.color : "none",
            cursor: "pointer", color: "white", fontSize: 11,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{faded ? "✓" : ""}</button>

          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => openDetail(item)}>
            <div style={{ fontSize: 15, color: faded ? "#888" : "#2A2A26", lineHeight: 1.4, textDecoration: faded ? "line-through" : "none" }}>
              {item.text}
            </div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#AAA" }}>{cat.emoji} {cat.label}</span>
              {item.notes    && <span style={{ fontSize: 10, color: "#C8C4BE" }}>· 📝</span>}
              {item.aiContent && <span style={{ fontSize: 10, color: "#C8C4BE" }}>· ✦ AI</span>}
              {pct !== null  && <span style={{ fontSize: 10, color: pct === 100 ? currentList.color : "#C8C4BE" }}>· {pct}%</span>}
            </div>
            {pct !== null && !faded && <ProgressBar milestones={item.milestones} color={currentList.color} />}
          </div>

          <OwnerBadge ownerId={item.owner} size="sm" onClick={() => cycleItemOwner(item.id)} />
          <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 18, padding: "0 2px", flexShrink: 0 }}>×</button>
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F1", fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column", maxWidth: 500, margin: "0 auto", position: "relative", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "22px 22px 12px", background: "#1C1C1A" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 3 }}>Gezinsassistent</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 400, color: "#F7F5F1", letterSpacing: -0.5 }}>Sven & Eva</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#444", fontSize: 12 }}>{items.filter(i => !i.done).length} open</span>
            <button onClick={() => setChatOpen(true)} style={{
              background: "#2A2A28", border: "none", borderRadius: 18, padding: "6px 12px",
              color: "#C9A96E", fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif",
              display: "flex", alignItems: "center", gap: 5,
            }}>✦ Assistent</button>
          </div>
        </div>
        {/* Owner filter */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <button onClick={() => setFilterOwner(null)} style={{
            padding: "4px 10px", borderRadius: 14, border: "none", fontSize: 11, cursor: "pointer",
            background: !filterOwner ? "#3A3A38" : "transparent", color: !filterOwner ? "#F7F5F1" : "#555",
            fontFamily: "'Georgia', serif",
          }}>Iedereen</button>
          {OWNERS.map(o => (
            <button key={o.id} onClick={() => setFilterOwner(filterOwner === o.id ? null : o.id)} style={{
              padding: "4px 10px", borderRadius: 14, border: `1px solid ${filterOwner === o.id ? o.color : "#333"}`,
              background: filterOwner === o.id ? o.bg : "transparent",
              color: filterOwner === o.id ? o.color : "#555",
              fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
            }}>{o.avatar} {o.label}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#1C1C1A", padding: "0 20px", gap: 4 }}>
        {LISTS.map(list => {
          const count = countFor(list.id);
          const isActive = tab === list.id;
          return (
            <button key={list.id} onClick={() => { setTab(list.id); setFilterCat(null); }} style={{
              flex: 1, padding: "9px 4px 11px", border: "none", background: "none", cursor: "pointer",
              fontFamily: "'Georgia', serif", color: isActive ? list.color : "#555",
              borderBottom: isActive ? `2.5px solid ${list.color}` : "2.5px solid transparent",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 14 }}>{list.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 400 }}>{list.label}</span>
              {count > 0 && <span style={{ background: isActive ? list.color : "#333", color: "white", borderRadius: 8, padding: "1px 5px", fontSize: 10, fontFamily: "monospace" }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 5, padding: "9px 16px", overflowX: "auto", background: "#EFEDE8", borderBottom: "1px solid #E0DDD7", scrollbarWidth: "none" }}>
        {[{ id: null, label: "Alles", emoji: "" }, ...CATEGORIES].map(cat => {
          const isAll  = cat.id === null;
          const count  = isAll ? null : items.filter(i => i.list === tab && i.cat === cat.id && !i.done).length;
          if (!isAll && count === 0 && filterCat !== cat.id) return null;
          const active = isAll ? !filterCat : filterCat === cat.id;
          return (
            <button key={cat.id ?? "all"} onClick={() => setFilterCat(isAll ? null : (filterCat === cat.id ? null : cat.id))} style={{
              padding: "4px 10px", borderRadius: 14, border: "none",
              background: active ? "#1C1C1A" : "white", color: active ? "white" : "#555",
              fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
              display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {cat.emoji && <span>{cat.emoji}</span>}<span>{cat.label}</span>
              {count > 0 && <span style={{ color: active ? "#888" : "#CCC" }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div style={{ flex: 1, padding: "10px 20px 8px", overflowY: "auto" }}>
        {todo.length === 0 && done.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#BBB", fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>Geen taken hier
          </div>
        )}
        {todo.map(item => <TaskRow key={item.id} item={item} />)}
        {done.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#BBB", textTransform: "uppercase", marginBottom: 6 }}>Afgerond ({done.length})</div>
            {done.map(item => <TaskRow key={item.id} item={item} faded />)}
          </div>
        )}
      </div>

      {/* Add */}
      <div style={{ padding: "10px 20px 28px", borderTop: "1px solid #E0DDD7", background: "#F7F5F1" }}>
        {adding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input autoFocus value={newText} onChange={e => setNewText(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") setAdding(false); }}
              placeholder="Wat moet er gebeuren?"
              style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${currentList.color}`, fontSize: 15, fontFamily: "'Georgia', serif", background: "white", outline: "none", color: "#2A2A26" }}
            />
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notities (optioneel)..." rows={2}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1.5px solid #D8D4CE", fontSize: 13, fontFamily: "'Georgia', serif", background: "white", outline: "none", color: "#555", resize: "none", lineHeight: 1.5 }}
            />
            <OwnerPicker value={newOwner} onChange={setNewOwner} />
            <div style={{ display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setNewCat(cat.id)} style={{
                  padding: "5px 9px", borderRadius: 8, border: "none",
                  background: newCat === cat.id ? "#1C1C1A" : "#EAE7E2",
                  color: newCat === cat.id ? "white" : "#666",
                  fontSize: 14, cursor: "pointer", flexShrink: 0,
                }}>{cat.emoji}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {LISTS.map(list => (
                <button key={list.id} onClick={() => setNewList(list.id)} style={{
                  flex: 1, padding: "6px 4px", borderRadius: 8, border: "none",
                  background: newList === list.id ? list.color : "#EAE7E2",
                  color: newList === list.id ? "white" : "#777",
                  fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
                }}>{list.emoji} {list.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAdding(false); setNewText(""); setNewNotes(""); }} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #D8D4CE",
                background: "none", color: "#888", fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif",
              }}>Annuleer</button>
              <button onClick={addItem} style={{
                flex: 2, padding: "10px", borderRadius: 10, border: "none",
                background: currentList.color, color: "white", fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: 600,
              }}>Voeg toe</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setAdding(true); setNewList(tab); }} style={{
            width: "100%", padding: "12px", borderRadius: 10,
            border: `1.5px dashed ${currentList.color}`, background: currentList.light, color: currentList.color,
            fontSize: 15, cursor: "pointer", fontFamily: "'Georgia', serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}><span style={{ fontSize: 20 }}>+</span> Nieuwe taak toevoegen</button>
        )}
      </div>

      {/* Detail panel */}
      {detailItem && (() => {
        const cat  = getCat(detailItem.cat);
        const list = getList(detailItem.list);
        const owner = getOwner(detailItem.owner);
        return (
          <>
            <div onClick={() => { saveNotes(); setDetailId(null); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 10 }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, background: "#FAFAF8",
              borderRadius: "20px 20px 0 0", padding: "18px 20px 36px", zIndex: 11,
              boxShadow: "0 -8px 32px rgba(0,0,0,0.18)", maxHeight: "88vh", overflowY: "auto",
            }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#D8D4CE", margin: "0 auto 16px" }} />

              {/* Title + owner */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <button onClick={() => { toggleItem(detailItem.id); setDetailId(null); }} style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                  border: detailItem.done ? "none" : `2px solid ${list.color}`,
                  background: detailItem.done ? list.color : "none",
                  cursor: "pointer", color: "white", fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{detailItem.done ? "✓" : ""}</button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, color: detailItem.done ? "#AAA" : "#1C1C1A", lineHeight: 1.4, textDecoration: detailItem.done ? "line-through" : "none" }}>
                    {detailItem.text}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: list.light, color: list.color }}>{list.emoji} {list.label}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#EFEDE8", color: "#666" }}>{cat.emoji} {cat.label}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: owner.bg, color: owner.color, cursor: "pointer" }}
                      onClick={() => cycleItemOwner(detailItem.id)}>
                      {owner.avatar} {owner.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: "#F2F0EB", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#AAA", textTransform: "uppercase", marginBottom: 8 }}>📝 Notities</div>
                {editNotes ? (
                  <textarea autoFocus value={draftNotes} onChange={e => setDraftNotes(e.target.value)} rows={3} placeholder="Voeg notities toe..."
                    style={{ width: "100%", border: "none", background: "transparent", fontSize: 14, fontFamily: "'Georgia', serif", color: "#2A2A26", outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box" }}
                  />
                ) : (
                  <div onClick={() => setEditNotes(true)} style={{ fontSize: 14, color: draftNotes ? "#2A2A26" : "#C0BCB5", lineHeight: 1.6, cursor: "text", minHeight: 36 }}>
                    {draftNotes || "Tik om notities toe te voegen..."}
                  </div>
                )}
                {editNotes && <button onClick={saveNotes} style={{ marginTop: 8, padding: "6px 14px", borderRadius: 8, border: "none", background: list.color, color: "white", fontSize: 13, cursor: "pointer" }}>Opslaan</button>}
              </div>

              {/* AI preparation */}
              <div style={{ background: "#1C1C1A", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: detailItem.aiContent || aiLoading ? 10 : 0 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#C9A96E", textTransform: "uppercase" }}>✦ AI Voorbereiding</div>
                  <button
                    onClick={() => handlePrepare(detailItem)}
                    disabled={aiLoading}
                    style={{
                      padding: "5px 12px", borderRadius: 8, border: "none",
                      background: aiLoading ? "#333" : "#C9A96E", color: "#1C1C1A",
                      fontSize: 11, cursor: aiLoading ? "default" : "pointer", fontFamily: "'Georgia', serif",
                    }}
                  >{aiLoading ? "Laden..." : detailItem.aiContent ? "Ververs" : "Bereid voor"}</button>
                </div>
                {(detailItem.aiContent || aiLoading) && (
                  <div style={{ color: "#E8E4DC" }}>
                    <AIContent content={detailItem.aiContent} loading={aiLoading} color="#C9A96E" />
                  </div>
                )}
                {!detailItem.aiContent && !aiLoading && (
                  <div style={{ fontSize: 12, color: "#444" }}>Laat Claude ideeën, bronnen en stappen genereren voor deze taak.</div>
                )}
              </div>

              {/* Milestones */}
              <div style={{ background: "#F2F0EB", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#AAA", textTransform: "uppercase", marginBottom: 10 }}>🎯 Mijlpalen</div>
                {detailItem.milestones?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <ProgressBar milestones={detailItem.milestones} color={list.color} />
                  </div>
                )}
                <MilestoneEditor milestones={detailItem.milestones || []} onChange={(ms) => updateMilestones(detailItem.id, ms)} color={list.color} />
              </div>

              <button onClick={() => removeItem(detailItem.id)} style={{
                width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #E0DDD7",
                background: "none", color: "#C0BCB5", fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif",
              }}>Verwijder taak</button>
            </div>
          </>
        );
      })()}

      {/* Chat panel */}
      {chatOpen && (
        <>
          <div onClick={() => setChatOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 20 }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, background: "#1C1C1A",
            borderRadius: "20px 20px 0 0", zIndex: 21, display: "flex", flexDirection: "column",
            height: "72vh", boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
          }}>
            <div style={{ padding: "16px 20px 10px", borderBottom: "1px solid #2A2A28", flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#333", margin: "0 auto 12px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#C9A96E", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>✦ Gezinsassistent</div>
                  <div style={{ color: "#444", fontSize: 11, marginTop: 1 }}>Beheer taken, vraag ideeën, wijs toe</div>
                </div>
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 22 }}>×</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMsgs.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "84%", padding: "9px 13px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "#C9A96E" : "#252523",
                    color: msg.role === "user" ? "#1C1C1A" : "#E0DCD4",
                    fontSize: 14, lineHeight: 1.55, fontFamily: "'Georgia', serif",
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: 4, padding: "9px 13px", background: "#252523", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A96E", animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: "10px 16px 28px", borderTop: "1px solid #252523", flexShrink: 0, display: "flex", gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Bijv: voeg kinderwagen toe voor Sven..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 22, border: "1px solid #333", background: "#222220", color: "#E0DCD4", fontSize: 14, fontFamily: "'Georgia', serif", outline: "none" }}
              />
              <button onClick={sendChat} disabled={chatLoading} style={{
                width: 42, height: 42, borderRadius: "50%", border: "none",
                background: chatLoading ? "#333" : "#C9A96E", color: "#1C1C1A",
                cursor: chatLoading ? "default" : "pointer", fontSize: 18, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>↑</button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}
