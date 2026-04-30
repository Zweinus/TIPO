// TIPO Brain v8
// Tilanus Poorthuis Gezinsassistent
// Sven & Eva — iPad keuken app
// v8: Rocky avatar · Wie-ben-jij selector · Chat history bewaard · Proactief per gebruiker

const { useState, useEffect, useRef } = React;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        "#F5F0E8",
  paper:     "#FDFAF4",
  dark:      "#1E1A14",
  brown:     "#3D2B1F",
  gold:      "#C9A96E",
  goldLight: "#E8D5A3",
  red:       "#7A2020",
  redLight:  "#F5ECEC",
  sand:      "#E8DCC8",
  sandDark:  "#D4C4A8",
  muted:     "#8A7968",
  sven:      "#2C5F8A",
  svenBg:    "#E8F0F8",
  eva:       "#7A4A7A",
  evaBg:     "#F5EEF5",
  green:     "#3A6B4A",
  greenBg:   "#EAF5EC",
};

// ─── Rocky SVG ────────────────────────────────────────────────────────────────
const RockyIcon = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="60 120 280 270" style={{ display: "block" }}>
    {/* Poten */}
    <polygon fill="#7A5A1A" points="148,272 132,268 100,320 114,326"/>
    <polygon fill="#A07828" points="146,270 134,268 104,318 114,324"/>
    <line stroke="#3A2A08" strokeWidth="2" x1="148" y1="272" x2="104" y2="322"/>
    <polygon fill="#7A5A1A" points="252,272 268,268 300,320 286,326"/>
    <polygon fill="#A07828" points="254,270 266,268 296,318 286,324"/>
    <line stroke="#3A2A08" strokeWidth="2" x1="252" y1="272" x2="296" y2="322"/>
    <polygon fill="#7A5A1A" points="132,220 112,208 72,238 82,252"/>
    <polygon fill="#A07828" points="134,222 115,210 76,238 84,250"/>
    <line stroke="#3A2A08" strokeWidth="2" x1="134" y1="220" x2="76" y2="246"/>
    <polygon fill="#7A5A1A" points="268,220 288,208 328,238 318,252"/>
    <polygon fill="#A07828" points="266,222 285,210 324,238 316,250"/>
    <line stroke="#3A2A08" strokeWidth="2" x1="266" y1="220" x2="324" y2="246"/>
    <polygon fill="#7A5A1A" points="184,302 216,302 220,358 200,364 180,358"/>
    <polygon fill="#A07828" points="186,304 214,304 217,355 200,360 183,355"/>
    <line stroke="#3A2A08" strokeWidth="2" x1="184" y1="304" x2="180" y2="362"/>
    <line stroke="#3A2A08" strokeWidth="2" x1="216" y1="304" x2="220" y2="362"/>
    {/* Lichaam */}
    <polygon fill="#5A4010" points="112,288 124,186 200,148 276,186 288,288 258,316 200,322 142,316"/>
    <polygon fill="#A07828" points="124,288 136,220 200,240 190,308 148,308"/>
    <polygon fill="#8A6820" points="276,288 264,220 200,240 210,308 252,308"/>
    <polygon fill="#C9A96E" points="136,220 152,168 200,176 200,240"/>
    <polygon fill="#A07828" points="264,220 248,168 200,176 200,240"/>
    <polygon fill="#E8C87A" points="152,168 178,148 200,158 200,178 168,186"/>
    <polygon fill="#C9A96E" points="248,168 222,148 200,158 200,178 232,186"/>
    <polygon fill="#F0D898" points="178,148 200,136 222,148 216,164 200,168 184,164"/>
    {/* Barsten */}
    <line stroke="#3A2A08" strokeWidth="2.5" x1="200" y1="138" x2="200" y2="242" strokeLinecap="round"/>
    <line stroke="#3A2A08" strokeWidth="1.8" x1="200" y1="242" x2="196" y2="308" strokeLinecap="round"/>
    <line stroke="#3A2A08" strokeWidth="1.5" x1="152" y1="170" x2="168" y2="220" strokeLinecap="round"/>
    <line stroke="#3A2A08" strokeWidth="1.5" x1="248" y1="170" x2="232" y2="220" strokeLinecap="round"/>
    <line stroke="#3A2A08" strokeWidth="1.2" x1="168" y1="220" x2="178" y2="268" strokeLinecap="round"/>
    <line stroke="#3A2A08" strokeWidth="1.2" x1="232" y1="220" x2="222" y2="268" strokeLinecap="round"/>
    {/* Buitenlijn */}
    <polygon fill="none" stroke="#3A2A08" strokeWidth="3" strokeLinejoin="round"
      points="112,288 124,186 200,136 276,186 288,288 258,316 200,322 142,316"/>
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const OWNERS = [
  { id: "sven",  label: "Sven",  color: C.sven,  bg: C.svenBg,  avatar: "S" },
  { id: "eva",   label: "Eva",   color: C.eva,   bg: C.evaBg,   avatar: "E" },
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
  { id: "nu",   label: "Nu",        emoji: "🔥", color: C.red,     light: C.redLight },
  { id: "week", label: "Deze week", emoji: "📅", color: "#8B5E1A", light: "#FDF5E8"  },
  { id: "ooit", label: "Ooit",      emoji: "🌱", color: C.green,   light: C.greenBg  },
];

const ROUTINE_CATS = [
  { id: "leefstijl",  label: "Leefstijl",  emoji: "🏋️" },
  { id: "huishouden", label: "Huishouden", emoji: "🏠" },
  { id: "baby",       label: "Baby",       emoji: "👶" },
];

const DNA_SECTIONS = [
  { id: "thuis",      label: "Thuis & Omgeving",     emoji: "🏡", info: "Waar wonen jullie nu en wat zijn jullie woonwensen? TIPO gebruikt dit bij klusopdrachten en woonadvies.", placeholder: "Bijv. Helmond, rijtjeswoning met tuin. Droom: vrijstaand buiten de stad, veel groen, <30 min van Eindhoven..." },
  { id: "waarden",    label: "Waarden & Leefstijl",  emoji: "🌿", info: "Wat vinden jullie belangrijk in het dagelijks leven? TIPO gebruikt dit bij product- en aankoopadvies.", placeholder: "Bijv. biologisch eten, plasticvrij, bewuste aankopen, kwaliteit boven kwantiteit..." },
  { id: "gezin",      label: "Gezin & Opvoeding",    emoji: "👨‍👩‍👧", info: "Hoe willen jullie als gezin leven? TIPO gebruikt dit bij kinderopvang, babyadvies en gezinsplanning.", placeholder: "Bijv. veel buiten zijn, bewuste schermtijd, warme open sfeer, muziek en sport..." },
  { id: "vrije_tijd", label: "Vrije tijd & Vakanties", emoji: "✈️", info: "Wat voor vakanties en uitjes passen bij jullie? TIPO gebruikt dit bij reis- en weekendadvies.", placeholder: "Bijv. camping Ardennen, wandelen in bergen, kleine B&B, Europa boven verre vluchten..." },
  { id: "financieel", label: "Financiële Kaders",    emoji: "💶", info: "Globale financiële kaders — geen details. TIPO gebruikt dit bij offertes en aankoopadvies.", placeholder: "Bijv. kwaliteit boven prijs, liever 1x goed. Klussen zelf doen waar mogelijk. Sparen voor huis heeft prioriteit..." },
  { id: "doelen",     label: "Gezamenlijke Doelen",  emoji: "🎯", info: "Waar willen jullie over 3-5 jaar staan? Helpt TIPO bij het prioriteren van taken.", placeholder: "Bijv. eigen huis kopen, bewust en gezond leven met de baby, werk-privé balans verbeteren..." },
];

const DEFAULT_TASKS = [
  { id: 1, text: "Huisarts bellen voor baby check-up", done: false, list: "nu", cat: "baby", owner: "eva", notes: "Vraag ook naar vaccinaties planning", deadline: null, milestones: [], bronnen: [], cardChat: [] },
  { id: 2, text: "Luiers bijbestellen", done: false, list: "nu", cat: "baby", owner: "sven", notes: "", deadline: null, milestones: [], bronnen: [], cardChat: [] },
  { id: 3, text: "Kinderopvang vergelijken", done: false, list: "ooit", cat: "baby", owner: "samen", notes: "De Paddestoel, Hummelhoeve, KinderRijk", deadline: null,
    milestones: [
      { id: "m1", text: "Lijst met opties maken", done: true,  owner: "eva" },
      { id: "m2", text: "3 locaties bezoeken",    done: false, owner: "samen" },
      { id: "m3", text: "Keuze maken",            done: false, owner: "samen" },
    ], bronnen: [], cardChat: [] },
  { id: 4, text: "Hypotheek adviesgesprek plannen", done: false, list: "ooit", cat: "nieuw_huis", owner: "sven", notes: "Adviseur: Jan de Vries 06-12345678", deadline: null,
    milestones: [
      { id: "m4", text: "Adviseur contacteren",  done: true,  owner: "sven" },
      { id: "m5", text: "Documenten verzamelen", done: true,  owner: "samen" },
      { id: "m6", text: "Gesprek inplannen",     done: false, owner: "sven" },
    ], bronnen: [], cardChat: [] },
  { id: 5, text: "Zomervakantie bestemming kiezen", done: false, list: "ooit", cat: "vakantie", owner: "samen", notes: "Ideeën: Zuid-Frankrijk, Italië, Kroatië", deadline: null, milestones: [], bronnen: [], cardChat: [] },
];

const DEFAULT_ROUTINES = {
  weekly: [
    { id: "w1", text: "Zone 2 cardio (45 min)",       owner: "sven", emoji: "🫀", cat: "leefstijl",  streak: 4, completions: {} },
    { id: "w2", text: "Zone 2 cardio (45 min)",       owner: "eva",  emoji: "🫀", cat: "leefstijl",  streak: 2, completions: {} },
    { id: "w3", text: "Krachttraining (2x per week)", owner: "sven", emoji: "💪", cat: "leefstijl",  streak: 6, completions: {} },
    { id: "w4", text: "Krachttraining (1x per week)", owner: "eva",  emoji: "💪", cat: "leefstijl",  streak: 1, completions: {} },
    { id: "w5", text: "Slaap check (gem. 7-9u)",      owner: "sven", emoji: "😴", cat: "leefstijl",  streak: 3, completions: {} },
    { id: "w6", text: "Boodschappen doen",            owner: "sven", emoji: "🛒", cat: "huishouden", streak: 8, completions: {} },
    { id: "w7", text: "Huis schoonmaken",             owner: "eva",  emoji: "🏠", cat: "huishouden", streak: 5, completions: {} },
    { id: "w8", text: "Week planning samen",          owner: "samen",emoji: "📋", cat: "huishouden", streak: 2, completions: {} },
  ],
  monthly: [
    { id: "m1", text: "Bloedwaarden checken",   owner: "sven", emoji: "🩸", cat: "leefstijl",  streak: 3, completions: {} },
    { id: "m2", text: "Financiën doornemen",    owner: "sven", emoji: "💶", cat: "huishouden", streak: 5, completions: {} },
    { id: "m3", text: "Supplementen bestellen", owner: "eva",  emoji: "💊", cat: "leefstijl",  streak: 4, completions: {} },
    { id: "m4", text: "Prenatale check-up",     owner: "eva",  emoji: "👶", cat: "baby",       streak: 2, completions: {} },
  ],
};

const RECAP_QUESTIONS = [
  { id: "energy",    label: "Hoe was je energieniveau deze week?", type: "scale", icon: "⚡" },
  { id: "highlight", label: "Wat ging goed of waar ben je trots op?", type: "text", icon: "✨", placeholder: "Bijv. Zone 2 elke dag gehaald…" },
  { id: "struggle",  label: "Waar liep je tegenaan?",               type: "text", icon: "🌊", placeholder: "Bijv. weinig slaap, druk op werk…" },
  { id: "focus",     label: "Wat wil je volgende week beter doen?",  type: "text", icon: "🎯", placeholder: "Bijv. eerder naar bed…" },
];

let nextId  = 20;
let nextMid = 200;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCat   = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[5];
const getList  = (id) => LISTS.find(l => l.id === id) || LISTS[0];
const getOwner = (id) => OWNERS.find(o => o.id === id) || OWNERS[2];
const progress = (ms) => { if (!ms?.length) return null; return Math.round(ms.filter(m => m.done).length / ms.length * 100); };
const getWeekKey  = () => { const n = new Date(); const s = new Date(n.getFullYear(), 0, 1); return `${n.getFullYear()}-W${Math.ceil(((n - s) / 86400000 + s.getDay() + 1) / 7)}`; };
const getMonthKey = () => { const n = new Date(); return `${n.getFullYear()}-M${n.getMonth() + 1}`; };

// ─── Storage ──────────────────────────────────────────────────────────────────
const KEYS = {
  tasks:       "tipo-v5-tasks",
  routines:    "tipo-v5-routines",
  recaps:      "tipo-v5-recaps",
  memory:      "tipo-v5-memory",
  dna:         "tipo-v7-dna",
  activeUser:  "tipo-v8-active-user",
  chatSven:    "tipo-v9-chat-sven",
  chatEva:     "tipo-v9-chat-eva",
  memorySven:  "tipo-v9-memory-sven",
  memoryEva:   "tipo-v9-memory-eva",
};

const chatKeyFor   = (user) => user === "sven" ? KEYS.chatSven   : KEYS.chatEva;
const memKeyFor    = (user) => user === "sven" ? KEYS.memorySven : KEYS.memoryEva;
const MAX_CHAT_MSGS = 20;

async function apiCall(body) {
  const r = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function loadData(key, fallback) {
  try { const r = await apiCall({ action: "load", key }); if (r?.value) return JSON.parse(r.value); } catch (_) {}
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (_) {}
  return fallback;
}

async function saveData(key, value) {
  try { await apiCall({ action: "save", key, value: JSON.stringify(value) }); } catch (_) {}
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

// ─── Claude API ───────────────────────────────────────────────────────────────
async function callClaude(messages, system, maxTokens = 1000) {
  const data = await apiCall({ model: "claude-sonnet-4-5", max_tokens: maxTokens, system, messages });
  return data.content?.find(b => b.type === "text")?.text || "";
}

async function askTIPO(messages, tasks, memory, activeUser) {
  const userName = activeUser === "sven" ? "Sven" : activeUser === "eva" ? "Eva" : null;
  const system = `Je bent TIPO, de persoonlijke AI-assistent van Sven en Eva Tilanus-Poorthuis. Ze verwachten hun eerste baby in september 2026.
${userName ? `De persoon die nu met je praat is: ${userName}.` : "Het is niet bekend wie er nu praat."}

${memory ? `Achtergrond & geheugen:\n${memory}\n` : ""}

Huidige taken:
${JSON.stringify(tasks.map(t => ({ id: t.id, text: t.text, list: t.list, cat: t.cat, owner: t.owner, done: t.done, deadline: t.deadline })), null, 2)}

Owners: sven, eva, samen | Lijsten: nu, week, ooit | Categorieën: huis, baby, financieel, vakantie, nieuw_huis, overig

Als de gebruiker acties wil, voeg een <actions> blok toe aan het EINDE:
<actions>
[
  { "type": "add", "text": "…", "list": "nu|week|ooit", "cat": "…", "owner": "sven|eva|samen", "notes": "" },
  { "type": "done", "id": 123 },
  { "type": "undone", "id": 123 },
  { "type": "delete", "id": 123 },
  { "type": "move", "id": 123, "list": "ooit" },
  { "type": "set_owner", "id": 123, "owner": "eva" },
  { "type": "update_notes", "id": 123, "notes": "…" },
  { "type": "add_milestones", "id": 123, "milestones": [{"text": "stap 1", "owner": "sven"}] }
]
</actions>

Reageer altijd in het Nederlands. Wees warm, concreet en beknopt.`;

  const text = await callClaude(messages, system);
  const match = text.match(/<actions>([\s\S]*?)<\/actions>/);
  let actions = [];
  if (match) { try { actions = JSON.parse(match[1].trim()); } catch (_) {} }
  return { text: text.replace(/<actions>[\s\S]*?<\/actions>/, "").trim(), actions };
}

async function askCardTIPO(messages, task, memory, dna) {
  const system = `Je bent de kaartassistent van TIPO voor Sven en Eva. Je helpt specifiek met deze taak:

Taak: "${task.text}"
Categorie: ${task.cat} | Owner: ${task.owner}
Notities: ${task.notes || "geen"}
Deadline: ${task.deadline || "niet ingesteld"}
Mijlpalen: ${JSON.stringify(task.milestones || [])}
Bronnen: ${JSON.stringify(task.bronnen || [])}

${memory ? `Achtergrond:\n${memory}\n` : ""}
${dna ? `Gezins-DNA:\n${dna}\n` : ""}

Help actief met onderzoek, vergelijking en advies voor DEZE taak. Gebruik web search als dat nuttig is.

Als je acties wil uitvoeren, voeg een <card_actions> blok toe aan het EINDE:
<card_actions>
[
  { "type": "add_milestone", "text": "stap", "owner": "sven|eva|samen" },
  { "type": "done_milestone", "id": "m123" },
  { "type": "add_bron", "label": "omschrijving", "url": "https://..." },
  { "type": "update_notes", "notes": "tekst" }
]
</card_actions>

Reageer in het Nederlands. Wees concreet en proactief.`;

  const data = await apiCall({ model: "claude-sonnet-4-5", max_tokens: 1500, system, messages, tools: [{ type: "web_search_20250305", name: "web_search" }] });
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  const match = text.match(/<card_actions>([\s\S]*?)<\/card_actions>/);
  let actions = [];
  if (match) { try { actions = JSON.parse(match[1].trim()); } catch (_) {} }
  return { text: text.replace(/<card_actions>[\s\S]*?<\/card_actions>/, "").trim(), actions };
}

async function generateProactiveGreeting(tasks, memory, recaps, activeUser) {
  const now = new Date();
  const hour = now.getHours();
  const gr = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const today = now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  const name = activeUser === "sven" ? "Sven" : activeUser === "eva" ? "Eva" : null;

  const overdue  = tasks.filter(t => !t.done && t.deadline && new Date(t.deadline) < now);
  const dueSoon  = tasks.filter(t => { if (t.done || !t.deadline) return false; const d = Math.ceil((new Date(t.deadline) - now) / 86400000); return d >= 0 && d <= 3; });
  const myOpen   = activeUser ? tasks.filter(t => !t.done && t.owner === activeUser) : [];
  const svenOpen = tasks.filter(t => !t.done && t.owner === "sven").length;
  const evaOpen  = tasks.filter(t => !t.done && t.owner === "eva").length;
  const lastRecap = recaps?.[0];

  const ctx = [
    `${gr}${name ? ` ${name}` : ""}! Vandaag is het ${today}.`,
    activeUser ? `Jouw open taken: ${myOpen.length}. Totaal: ${tasks.filter(t => !t.done).length} (Sven: ${svenOpen}, Eva: ${evaOpen}).` : `Open taken: ${tasks.filter(t => !t.done).length} (Sven: ${svenOpen}, Eva: ${evaOpen}).`,
    overdue.length  ? `Overschreden deadlines: ${overdue.map(t => `"${t.text}"`).join(", ")}.` : null,
    dueSoon.length  ? `Deadlines binnen 3 dagen: ${dueSoon.map(t => `"${t.text}"`).join(", ")}.` : null,
    lastRecap ? `Laatste recap: Sven energie ${lastRecap.sven?.energy}/5, Eva energie ${lastRecap.eva?.energy}/5.` : null,
    memory ? `Context: ${memory.slice(0, 300)}` : null,
  ].filter(Boolean).join("\n");

  const system = `Je bent TIPO. Schrijf een warm, direct openingsbericht van max 3 zinnen. ${name ? `Je praat met ${name} persoonlijk.` : "Je weet niet wie er kijkt — spreek beiden aan."} Noem wat opvalt. Sluit af met één concrete vraag. Geen generieke begroeting. Nederlands, geen bullets.`;
  return callClaude([{ role: "user", content: ctx }], system, 280);
}

async function generateRecapInsight(svenAnswers, evaAnswers, tasks) {
  const system = `Je bent TIPO. Analyseer de wekelijkse recap en geef een concreet inzicht van max 3 zinnen. Focus op patronen en één aanbeveling. Nederlands, warm maar direct.`;
  return callClaude([{ role: "user", content: `Sven: energie ${svenAnswers.energy}/5, goed: ${svenAnswers.highlight}, moeilijk: ${svenAnswers.struggle}, focus: ${svenAnswers.focus}\nEva: energie ${evaAnswers.energy}/5, goed: ${evaAnswers.highlight}, moeilijk: ${evaAnswers.struggle}, focus: ${evaAnswers.focus}` }], system, 400);
}


// ─── Geheugen samenvatting ────────────────────────────────────────────────────
async function summarizeConversation(msgs, userName, existingMemory) {
  if (msgs.length < 4) return existingMemory; // te kort om samen te vatten
  const system = `Je bent TIPO. Maak een beknopte samenvatting (max 100 woorden) van dit gesprek met ${userName}. Focus op: wat is besproken, beslissingen, acties, persoonlijke info die relevant is voor toekomstige gesprekken. Schrijf in derde persoon ("${userName} vertelde dat..."). Nederlands.`;
  try {
    const summary = await callClaude(
      [{ role: "user", content: msgs.map(m => `${m.role === "user" ? userName : "TIPO"}: ${m.content}`).join("\n") }],
      system, 200
    );
    const date = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
    const newEntry = `[${date}] ${summary}`;
    const combined = [newEntry, existingMemory].filter(Boolean).join("\n\n");
    // Max 2000 tekens bewaren
    return combined.slice(0, 2000);
  } catch { return existingMemory; }
}

// ─── DNA onboarding via chat ──────────────────────────────────────────────────
async function askDNAOnboarding(messages, dna) {
  const filled = DNA_SECTIONS.filter(s => dna[s.id]?.text);
  const missing = DNA_SECTIONS.filter(s => !dna[s.id]?.text);

  const system = `Je bent TIPO, bezig met het invullen van het Gezins-DNA van Sven en Eva — hun gedeelde waarden, leefstijl en doelen. Dit helpt TIPO om persoonlijker advies te geven.

Al ingevuld: ${filled.map(s => s.label).join(", ") || "niets"}
Nog leeg: ${missing.map(s => `${s.emoji} ${s.label}`).join(", ") || "alles ingevuld!"}

Stel één vraag tegelijk over de volgende lege sectie. Houd het conversationeel en warm. Als de gebruiker antwoord geeft, verwerk dat dan als tekst voor die sectie.

Als je een sectie wil invullen op basis van het gesprek, voeg een <dna_update> blok toe:
<dna_update>
{ "section": "thuis|waarden|gezin|vrije_tijd|financieel|doelen", "text": "de ingevulde tekst" }
</dna_update>

Als alles ingevuld is: feliciteer hen en geef een korte samenvatting van hun Gezins-DNA.
Reageer in het Nederlands, warm en beknopt.`;

  const text = await callClaude(messages, system, 400);
  const match = text.match(/<dna_update>([\s\S]*?)<\/dna_update>/);
  let update = null;
  if (match) { try { update = JSON.parse(match[1].trim()); } catch (_) {} }
  return { text: text.replace(/<dna_update>[\s\S]*?<\/dna_update>/, "").trim(), update };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ ownerId, size = 22, onClick }) {
  const o = getOwner(ownerId);
  return (
    <div onClick={onClick} title={o.label} style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: o.bg, border: `2px solid ${o.color}`, color: o.color, fontSize: size * 0.40, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", cursor: onClick ? "pointer" : "default", fontFamily: "system-ui" }}>{o.avatar}</div>
  );
}

function OwnerPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {OWNERS.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: `1.5px solid ${value === o.id ? o.color : C.sand}`, background: value === o.id ? o.bg : C.paper, color: value === o.id ? o.color : C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
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
  const cycleOwner = (id) => onChange(milestones.map(m => { if (m.id !== id) return m; const idx = OWNERS.findIndex(o => o.id === (m.owner || "samen")); return { ...m, owner: OWNERS[(idx + 1) % OWNERS.length].id }; }));
  const add = () => { if (!newText.trim()) return; onChange([...milestones, { id: `m${nextMid++}`, text: newText.trim(), done: false, owner: newOwner }]); setNewText(""); };
  return (
    <div>
      {milestones.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.sand}` }}>
          <button onClick={() => toggle(m.id)} style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${m.done ? color : C.sandDark}`, background: m.done ? color : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11 }}>{m.done ? "✓" : ""}</button>
          <span style={{ flex: 1, fontSize: 13, color: m.done ? C.muted : C.dark, textDecoration: m.done ? "line-through" : "none", lineHeight: 1.4 }}>{m.text}</span>
          <Avatar ownerId={m.owner} size={20} onClick={() => cycleOwner(m.id)} />
          <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", color: C.sandDark, cursor: "pointer", fontSize: 16, padding: "0 2px" }}>×</button>
        </div>
      ))}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Nieuwe mijlpaal…" style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.dark }} />
          <button onClick={add} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: color, color: "white", fontSize: 16, cursor: "pointer" }}>+</button>
        </div>
        <OwnerPicker value={newOwner} onChange={setNewOwner} />
      </div>
    </div>
  );
}

function BronnenEditor({ bronnen, onChange, color }) {
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const add = () => { if (!newLabel.trim() || !newUrl.trim()) return; const url = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`; onChange([...bronnen, { id: `b${Date.now()}`, label: newLabel.trim(), url }]); setNewLabel(""); setNewUrl(""); setAdding(false); };
  const remove = (id) => onChange(bronnen.filter(b => b.id !== id));
  return (
    <div>
      {bronnen.map(b => (
        <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.sand}` }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🔗</span>
          <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: color, textDecoration: "none", lineHeight: 1.4, wordBreak: "break-all" }}>{b.label}</a>
          <button onClick={() => remove(b.id)} style={{ background: "none", border: "none", color: C.sandDark, cursor: "pointer", fontSize: 16, padding: "0 2px", flexShrink: 0 }}>×</button>
        </div>
      ))}
      {adding ? (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Omschrijving" style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.dark }} />
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Link (bijv. www.example.nl)" onKeyDown={e => e.key === "Enter" && add()} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.dark }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: "7px", borderRadius: 9, border: `1px solid ${C.sand}`, background: "none", color: C.muted, fontSize: 12, cursor: "pointer" }}>Annuleer</button>
            <button onClick={add} style={{ flex: 2, padding: "7px", borderRadius: 9, border: "none", background: color, color: "white", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Toevoegen</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ marginTop: 8, width: "100%", padding: "7px", borderRadius: 9, border: `1px dashed ${color}`, background: "transparent", color: color, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif" }}>+ Bron toevoegen</button>
      )}
    </div>
  );
}

// ─── Kaart-chat ───────────────────────────────────────────────────────────────
function CardChat({ task, onUpdateTask, memory, dna, onClose }) {
  const list = getList(task.list);
  const [msgs, setMsgs] = useState(task.cardChat || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { onUpdateTask({ cardChat: msgs }); }, [msgs]);

  const applyCardActions = (actions, currentTask) => {
    let updated = { ...currentTask };
    for (const a of actions) {
      if (a.type === "add_milestone") updated = { ...updated, milestones: [...(updated.milestones || []), { id: `m${nextMid++}`, text: a.text, done: false, owner: a.owner || "samen" }] };
      else if (a.type === "done_milestone") updated = { ...updated, milestones: (updated.milestones || []).map(m => m.id === a.id ? { ...m, done: true } : m) };
      else if (a.type === "add_bron") updated = { ...updated, bronnen: [...(updated.bronnen || []), { id: `b${Date.now()}`, label: a.label, url: a.url }] };
      else if (a.type === "update_notes") updated = { ...updated, notes: a.notes };
    }
    return updated;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const { text, actions } = await askCardTIPO(newMsgs.map(m => ({ role: m.role, content: m.content })), task, memory, dna);
      if (actions.length > 0) { const updated = applyCardActions(actions, task); onUpdateTask(updated); }
      setMsgs(prev => [...prev, { role: "assistant", content: text }]);
    } catch { setMsgs(prev => [...prev, { role: "assistant", content: "Sorry, er ging iets mis." }]); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid #2A2520`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: C.gold, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Kaartassistent</div>
          <div style={{ color: "#666", fontSize: 11, marginTop: 1, fontFamily: "'Georgia', serif" }}>{task.text.length > 40 ? task.text.slice(0, 40) + "…" : task.text}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 22 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "#555", fontSize: 13, fontFamily: "'Georgia', serif", lineHeight: 1.6 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, opacity: 0.6 }}><RockyIcon size={40} /></div>
            Ik help je met <strong style={{ color: C.gold }}>{task.text}</strong>.<br/>Stel een vraag of vraag me iets uit te zoeken.
          </div>
        )}
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? C.gold : "#252218", color: msg.role === "user" ? C.dark : "#E8E0D0", fontSize: 14, lineHeight: 1.6, fontFamily: "'Georgia', serif", whiteSpace: "pre-wrap" }}>{msg.content}</div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: "#252218", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}</div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ padding: "10px 14px 16px", borderTop: "1px solid #252218", flexShrink: 0, display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Vraag de kaartassistent iets…" style={{ flex: 1, padding: "10px 14px", borderRadius: 22, border: "1px solid #333", background: "#1A1710", color: "#E8E0D0", fontSize: 13, fontFamily: "'Georgia', serif", outline: "none" }} />
        <button onClick={send} disabled={loading} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", flexShrink: 0, background: loading ? "#333" : C.gold, color: C.dark, cursor: loading ? "default" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
      </div>
    </div>
  );
}

// ─── TAKEN TAB ────────────────────────────────────────────────────────────────
function TasksTab({ tasks, setTasks, memory, dna, recaps, filterOwner, activeUser, setActiveUser, chatHistories, setChatHistories, userMemories, setUserMemories }) {
  const [tab, setTab] = useState("nu");
  const [filterCat, setFilterCat] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newCat, setNewCat] = useState("huis");
  const [newList, setNewList] = useState("nu");
  const [newOwner, setNewOwner] = useState("samen");
  const [newDeadline, setNewDeadline] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [detailView, setDetailView] = useState("info");
  const [draftNotes, setDraftNotes] = useState("");
  const [editNotes, setEditNotes] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [greetingDone, setGreetingDone] = useState(false);
  const [chatInited, setChatInited] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);
  // Sla chat op per gebruiker als msgs veranderen
  useEffect(() => {
    if (!activeUser || chatMsgs.length === 0) return;
    const key = chatKeyFor(activeUser);
    const trimmed = chatMsgs.slice(-MAX_CHAT_MSGS);
    setChatHistories(prev => ({ ...prev, [activeUser]: trimmed }));
    saveData(key, trimmed);
  }, [chatMsgs]);

  const currentList = getList(tab);
  const detailItem  = tasks.find(t => t.id === detailId);
  const visible = tasks.filter(t => t.list === tab && (!filterCat || t.cat === filterCat) && (!filterOwner || t.owner === filterOwner));
  const todo = visible.filter(t => !t.done);
  const done = visible.filter(t => t.done);
  const countFor = (lid) => tasks.filter(t => t.list === lid && !t.done).length;

  const toggleTask     = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask     = (id) => { setTasks(prev => prev.filter(t => t.id !== id)); if (detailId === id) setDetailId(null); };
  const cycleOwner     = (id) => setTasks(prev => prev.map(t => { if (t.id !== id) return t; const idx = OWNERS.findIndex(o => o.id === (t.owner || "samen")); return { ...t, owner: OWNERS[(idx + 1) % OWNERS.length].id }; }));
  const updateMilestones = (id, ms) => setTasks(prev => prev.map(t => t.id === id ? { ...t, milestones: ms } : t));
  const updateBronnen    = (id, br) => setTasks(prev => prev.map(t => t.id === id ? { ...t, bronnen: br } : t));
  const updateTask       = (id, patch) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  const saveNotes        = () => { setTasks(prev => prev.map(t => t.id === detailId ? { ...t, notes: draftNotes } : t)); setEditNotes(false); };
  const openDetail       = (task) => { setDetailId(task.id); setDraftNotes(task.notes || ""); setEditNotes(false); setDetailView("info"); };

  const addTask = () => {
    if (!newText.trim()) return;
    setTasks(prev => [...prev, { id: nextId++, text: newText.trim(), done: false, list: newList, cat: newCat, owner: newOwner, notes: newNotes.trim(), deadline: newDeadline || null, milestones: [], bronnen: [], cardChat: [] }]);
    setNewText(""); setNewNotes(""); setNewDeadline(""); setAdding(false);
  };

  const applyActions = (actions, prev) => {
    let updated = [...prev];
    for (const a of actions) {
      if (a.type === "add") updated.push({ id: nextId++, text: a.text, done: false, list: a.list || "nu", cat: a.cat || "overig", owner: a.owner || "samen", notes: a.notes || "", deadline: null, milestones: [], bronnen: [], cardChat: [] });
      else if (a.type === "done")         updated = updated.map(t => t.id === a.id ? { ...t, done: true }  : t);
      else if (a.type === "undone")       updated = updated.map(t => t.id === a.id ? { ...t, done: false } : t);
      else if (a.type === "delete")       updated = updated.filter(t => t.id !== a.id);
      else if (a.type === "move")         updated = updated.map(t => t.id === a.id ? { ...t, list: a.list } : t);
      else if (a.type === "set_owner")    updated = updated.map(t => t.id === a.id ? { ...t, owner: a.owner } : t);
      else if (a.type === "update_notes") updated = updated.map(t => t.id === a.id ? { ...t, notes: a.notes } : t);
      else if (a.type === "add_milestones") {
        const newMs = (a.milestones || []).map(m => ({ id: `m${nextMid++}`, text: m.text, done: false, owner: m.owner || "samen" }));
        const target = updated.find(t => t.id === a.id) || updated[updated.length - 1];
        if (target) updated = updated.map(t => t.id === target.id ? { ...t, milestones: [...(t.milestones || []), ...newMs] } : t);
      }
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
      const { text, actions } = await askTIPO(newMsgs.map(m => ({ role: m.role, content: m.content })), tasks, memory, activeUser);
      if (actions.length > 0) setTasks(prev => applyActions(actions, prev));
      setChatMsgs(prev => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      setApiError(err.message);
      setChatMsgs(prev => [...prev, { role: "assistant", content: "Sorry, er ging iets mis." }]);
    }
    setChatLoading(false);
  };

  const openChat = async () => {
    setChatOpen(true);
    if (!activeUser) { setShowUserPicker(true); return; }
    // Laad history voor deze gebruiker als nog niet ingeladen
    if (!chatInited) {
      setChatInited(true);
      const history = chatHistories[activeUser] || [];
      if (history.length > 0) {
        setChatMsgs(history);
        setGreetingDone(true);
        return;
      }
      // Geen history: genereer greeting
      setGreetingDone(true);
      setChatLoading(true);
      try {
        const userMem = userMemories[activeUser] || "";
        const fullMem = [memory, userMem].filter(Boolean).join("\n");
        const greeting = await generateProactiveGreeting(tasks, fullMem, recaps, activeUser);
        setChatMsgs([{ role: "assistant", content: greeting }]);
      } catch {
        setChatMsgs([{ role: "assistant", content: "Hoi! 👋 Wat kan ik voor jullie doen?" }]);
      }
      setChatLoading(false);
    }
  };

  const selectUser = async (userId) => {
    // Vat huidig gesprek samen als er berichten zijn
    if (activeUser && chatMsgs.length >= 4) {
      const existingMem = userMemories[activeUser] || "";
      const userName = activeUser === "sven" ? "Sven" : "Eva";
      summarizeConversation(chatMsgs, userName, existingMem).then(summary => {
        if (summary !== existingMem) {
          setUserMemories(prev => ({ ...prev, [activeUser]: summary }));
          saveData(memKeyFor(activeUser), summary);
        }
      });
    }
    setActiveUser(userId);
    setShowUserPicker(false);
    setChatInited(true);
    // Laad history voor nieuwe gebruiker
    const history = chatHistories[userId] || [];
    if (history.length > 0) {
      setChatMsgs(history);
      setGreetingDone(true);
      return;
    }
    // Geen history: genereer greeting
    setChatMsgs([]);
    setGreetingDone(true);
    setChatLoading(true);
    try {
      const userMem = userMemories[userId] || "";
      const fullMem = [memory, userMem].filter(Boolean).join("\n");
      const greeting = await generateProactiveGreeting(tasks, fullMem, recaps, userId);
      setChatMsgs([{ role: "assistant", content: greeting }]);
    } catch {
      setChatMsgs([{ role: "assistant", content: "Hoi! Wat kan ik voor je doen?" }]);
    }
    setChatLoading(false);
  };

  const TaskRow = ({ task, faded = false }) => {
    const cat = getCat(task.cat);
    const pct = progress(task.milestones);
    const deadlineColor = (() => { if (!task.deadline || faded) return null; const d = Math.ceil((new Date(task.deadline) - new Date()) / 86400000); if (d < 0) return C.red; if (d <= 3) return "#B05A00"; if (d <= 7) return "#8B5E1A"; return C.muted; })();
    const deadlineLabel = (() => { if (!task.deadline || faded) return null; const d = Math.ceil((new Date(task.deadline) - new Date()) / 86400000); if (d < 0) return `${Math.abs(d)}d te laat`; if (d === 0) return "Vandaag!"; if (d === 1) return "Morgen"; return `${d}d`; })();
    return (
      <div style={{ padding: "13px 0", borderBottom: `1px solid ${C.sand}`, opacity: faded ? 0.5 : 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <button onClick={() => toggleTask(task.id)} style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: faded ? "none" : `2px solid ${currentList.color}`, background: faded ? currentList.color : "transparent", cursor: "pointer", color: "white", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{faded ? "✓" : ""}</button>
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => openDetail(task)}>
            <div style={{ fontSize: 15, color: faded ? C.muted : C.dark, lineHeight: 1.45, textDecoration: faded ? "line-through" : "none", fontFamily: "'Georgia', serif" }}>{task.text}</div>
            <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: C.muted }}>{cat.emoji} {cat.label}</span>
              {task.notes    && <span style={{ fontSize: 10, color: C.sandDark }}>· 📝</span>}
              {task.bronnen?.length > 0 && <span style={{ fontSize: 10, color: C.sandDark }}>· 🔗{task.bronnen.length}</span>}
              {task.cardChat?.length > 0 && <span style={{ fontSize: 10, color: C.gold }}>· ✦{task.cardChat.filter(m => m.role === "assistant").length}</span>}
              {pct !== null  && <span style={{ fontSize: 10, color: pct === 100 ? currentList.color : C.sandDark }}>· {pct}%</span>}
              {deadlineLabel && <span style={{ fontSize: 10, color: deadlineColor, background: `${deadlineColor}18`, padding: "1px 7px", borderRadius: 8, fontWeight: 600 }}>⏱ {deadlineLabel}</span>}
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
      {apiError && <div style={{ background: C.redLight, borderBottom: `1px solid ${C.red}33`, padding: "8px 20px", fontSize: 12, color: C.red, display: "flex", justifyContent: "space-between" }}><span>⚠️ {apiError}</span><button onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer" }}>×</button></div>}

      {/* List tabs */}
      <div style={{ display: "flex", background: C.dark, padding: "0 20px", flexShrink: 0 }}>
        {LISTS.map(list => { const count = countFor(list.id); const active = tab === list.id; return (
          <button key={list.id} onClick={() => { setTab(list.id); setFilterCat(null); }} style={{ flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer", color: active ? list.color : "#AAA", borderBottom: active ? `2.5px solid ${list.color}` : "2.5px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "'Georgia', serif" }}>
            <span style={{ fontSize: 15 }}>{list.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400 }}>{list.label}</span>
            {count > 0 && <span style={{ background: active ? list.color : "#333", color: "white", borderRadius: 8, padding: "1px 6px", fontSize: 10, fontFamily: "monospace" }}>{count}</span>}
          </button>
        ); })}
      </div>

      {/* Cat filters */}
      <div style={{ display: "flex", gap: 5, padding: "10px 16px", overflowX: "auto", background: C.sand, borderBottom: `1px solid ${C.sandDark}`, scrollbarWidth: "none", flexShrink: 0 }}>
        {[{ id: null, label: "Alles", emoji: "" }, ...CATEGORIES].map(cat => {
          const isAll = cat.id === null; const count = isAll ? null : tasks.filter(t => t.list === tab && t.cat === cat.id && !t.done).length;
          if (!isAll && count === 0 && filterCat !== cat.id) return null;
          const active = isAll ? !filterCat : filterCat === cat.id;
          return <button key={cat.id ?? "all"} onClick={() => setFilterCat(isAll ? null : filterCat === cat.id ? null : cat.id)} style={{ padding: "5px 11px", borderRadius: 14, border: "none", background: active ? C.dark : C.paper, color: active ? C.gold : C.brown, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif", whiteSpace: "nowrap", flexShrink: 0 }}>{cat.emoji && <span style={{ marginRight: 3 }}>{cat.emoji}</span>}{cat.label}{count > 0 && <span style={{ marginLeft: 4, color: active ? `${C.gold}88` : C.sandDark }}>({count})</span>}</button>;
        })}
      </div>

      {/* Task list */}
      <div style={{ flex: 1, padding: "8px 20px", overflowY: "auto" }}>
        {todo.length === 0 && done.length === 0 && <div style={{ textAlign: "center", padding: "52px 0", color: C.sandDark, fontSize: 14 }}><div style={{ fontSize: 34, marginBottom: 10 }}>✨</div><div style={{ fontFamily: "'Georgia', serif" }}>Geen taken hier</div></div>}
        {todo.map(t => <TaskRow key={t.id} task={t} />)}
        {done.length > 0 && <div style={{ marginTop: 16 }}><div style={{ fontSize: 9, letterSpacing: 2, color: C.sandDark, textTransform: "uppercase", marginBottom: 8 }}>Afgerond ({done.length})</div>{done.map(t => <TaskRow key={t.id} task={t} faded />)}</div>}
      </div>

      {/* Add task */}
      <div style={{ padding: "10px 20px 24px", borderTop: `1px solid ${C.sand}`, background: C.bg, flexShrink: 0 }}>
        {adding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input autoFocus value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Escape" && setAdding(false)} placeholder="Wat moet er gebeuren?" style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${currentList.color}`, fontSize: 15, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.dark }} />
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notities (optioneel)..." rows={2} style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: C.brown, resize: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>⏱ Deadline</span>
              <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: newDeadline ? C.dark : C.muted }} />
              {newDeadline && <button onClick={() => setNewDeadline("")} style={{ background: "none", border: "none", color: C.sandDark, cursor: "pointer", fontSize: 18 }}>×</button>}
            </div>
            <OwnerPicker value={newOwner} onChange={setNewOwner} />
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => <button key={cat.id} onClick={() => setNewCat(cat.id)} style={{ padding: "6px 10px", borderRadius: 9, border: "none", background: newCat === cat.id ? C.dark : C.sand, color: newCat === cat.id ? C.gold : C.brown, fontSize: 15, cursor: "pointer", flexShrink: 0 }}>{cat.emoji}</button>)}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {LISTS.map(list => <button key={list.id} onClick={() => setNewList(list.id)} style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: "none", background: newList === list.id ? list.color : C.sand, color: newList === list.id ? "white" : C.brown, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>{list.emoji} {list.label}</button>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAdding(false); setNewText(""); setNewNotes(""); }} style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${C.sand}`, background: "none", color: C.muted, fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Annuleer</button>
              <button onClick={addTask} style={{ flex: 2, padding: "11px", borderRadius: 12, border: "none", background: currentList.color, color: "white", fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: 700 }}>Voeg toe</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setAdding(true); setNewList(tab); }} style={{ width: "100%", padding: "13px", borderRadius: 12, border: `1.5px dashed ${currentList.color}`, background: currentList.light, color: currentList.color, fontSize: 15, cursor: "pointer", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ fontSize: 20 }}>+</span> Nieuwe taak</button>
        )}
      </div>

      {/* Detail panel */}
      {detailItem && (() => {
        const cat = getCat(detailItem.cat); const list = getList(detailItem.list); const owner = getOwner(detailItem.owner);
        return (
          <>
            <div onClick={() => { saveNotes(); setDetailId(null); }} style={{ position: "fixed", inset: 0, background: "rgba(30,26,20,0.55)", zIndex: 10 }} />
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: detailView === "chat" ? C.dark : C.paper, borderRadius: "22px 22px 0 0", zIndex: 11, boxShadow: "0 -12px 48px rgba(0,0,0,0.25)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: detailView === "chat" ? "#333" : C.sand, margin: "16px auto 0" }} />
              <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <button onClick={() => { toggleTask(detailItem.id); setDetailId(null); }} style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 2, border: detailItem.done ? "none" : `2px solid ${list.color}`, background: detailItem.done ? list.color : "transparent", cursor: "pointer", color: "white", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>{detailItem.done ? "✓" : ""}</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: detailView === "chat" ? "#E8E0D0" : (detailItem.done ? C.muted : C.dark), lineHeight: 1.4, textDecoration: detailItem.done ? "line-through" : "none", fontFamily: "'Georgia', serif" }}>{detailItem.text}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: list.light, color: list.color }}>{list.emoji} {list.label}</span>
                      <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: C.sand, color: C.brown }}>{cat.emoji} {cat.label}</span>
                      <span onClick={() => cycleOwner(detailItem.id)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: owner.bg, color: owner.color, cursor: "pointer" }}>{owner.avatar} {owner.label}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${detailView === "chat" ? "#2A2520" : C.sand}` }}>
                  <button onClick={() => setDetailView("info")} style={{ flex: 1, padding: "8px 4px 10px", border: "none", background: "none", cursor: "pointer", color: detailView === "info" ? list.color : C.muted, borderBottom: detailView === "info" ? `2px solid ${list.color}` : "2px solid transparent", fontSize: 12, fontFamily: "'Georgia', serif" }}>📋 Info & Mijlpalen</button>
                  <button onClick={() => setDetailView("chat")} style={{ flex: 1, padding: "8px 4px 10px", border: "none", background: "none", cursor: "pointer", color: detailView === "chat" ? C.gold : C.muted, borderBottom: detailView === "chat" ? `2px solid ${C.gold}` : "2px solid transparent", fontSize: 12, fontFamily: "'Georgia', serif" }}>
                    Kaartassistent {detailItem.cardChat?.length > 0 ? `(${detailItem.cardChat.filter(m => m.role === "assistant").length})` : ""}
                  </button>
                </div>
              </div>

              {detailView === "info" && (
                <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 30px" }}>
                  <div style={{ background: C.sand, borderRadius: 14, padding: "13px 15px", marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>📝 Notities</div>
                    {editNotes ? <textarea autoFocus value={draftNotes} onChange={e => setDraftNotes(e.target.value)} rows={3} style={{ width: "100%", border: "none", background: "transparent", fontSize: 14, fontFamily: "'Georgia', serif", color: C.dark, outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box" }} /> : <div onClick={() => setEditNotes(true)} style={{ fontSize: 14, color: draftNotes ? C.dark : C.sandDark, lineHeight: 1.6, cursor: "text", minHeight: 38, fontFamily: "'Georgia', serif" }}>{draftNotes || "Tik om notities toe te voegen..."}</div>}
                    {editNotes && <button onClick={saveNotes} style={{ marginTop: 8, padding: "7px 16px", borderRadius: 9, border: "none", background: list.color, color: "white", fontSize: 13, cursor: "pointer" }}>Opslaan</button>}
                  </div>
                  <div style={{ background: C.sand, borderRadius: 14, padding: "13px 15px", marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>⏱ Deadline</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="date" value={detailItem.deadline || ""} onChange={e => setTasks(prev => prev.map(t => t.id === detailItem.id ? { ...t, deadline: e.target.value || null } : t))} style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.sandDark}`, fontSize: 13, fontFamily: "'Georgia', serif", background: C.paper, outline: "none", color: detailItem.deadline ? C.dark : C.muted }} />
                      {detailItem.deadline && (() => { const d = Math.ceil((new Date(detailItem.deadline) - new Date()) / 86400000); const col = d < 0 ? C.red : d <= 3 ? "#B05A00" : d <= 7 ? "#8B5E1A" : C.green; return <span style={{ fontSize: 12, color: col, fontWeight: 600 }}>{d < 0 ? `${Math.abs(d)}d te laat` : d === 0 ? "Vandaag!" : d === 1 ? "Morgen" : `Nog ${d}d`}</span>; })()}
                      {detailItem.deadline && <button onClick={() => setTasks(prev => prev.map(t => t.id === detailItem.id ? { ...t, deadline: null } : t))} style={{ background: "none", border: "none", color: C.sandDark, cursor: "pointer", fontSize: 18 }}>×</button>}
                    </div>
                  </div>
                  <div style={{ background: C.sand, borderRadius: 14, padding: "13px 15px", marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>🔗 Bronnen</div>
                    <BronnenEditor bronnen={detailItem.bronnen || []} onChange={br => updateBronnen(detailItem.id, br)} color={list.color} />
                  </div>
                  <div style={{ background: C.sand, borderRadius: 14, padding: "13px 15px", marginBottom: 12 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>🎯 Mijlpalen</div>
                    {detailItem.milestones?.length > 0 && <div style={{ marginBottom: 12 }}><ProgressBar milestones={detailItem.milestones} color={list.color} /></div>}
                    <MilestoneEditor milestones={detailItem.milestones || []} onChange={ms => updateMilestones(detailItem.id, ms)} color={list.color} />
                  </div>
                  <button onClick={() => removeTask(detailItem.id)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1px solid ${C.sand}`, background: "none", color: C.sandDark, fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Verwijder taak</button>
                </div>
              )}

              {detailView === "chat" && (
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <CardChat task={detailItem} onUpdateTask={(patch) => updateTask(detailItem.id, patch)} memory={memory} dna={dna} onClose={() => setDetailId(null)} />
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* TIPO globale chat */}
      {chatOpen && (
        <>
          <div onClick={() => setChatOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(30,26,20,0.65)", zIndex: 20 }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.dark, borderRadius: "22px 22px 0 0", zIndex: 21, display: "flex", flexDirection: "column", height: "74vh", boxShadow: "0 -12px 48px rgba(0,0,0,0.45)" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #2A2520", flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "#333", margin: "0 auto 14px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2A2218", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <RockyIcon size={30} />
                  </div>
                  <div>
                    <div style={{ color: C.gold, fontSize: 13, fontFamily: "'Georgia', serif", fontWeight: 700 }}>TIPO</div>
                    {activeUser ? (
                      <button onClick={() => setShowUserPicker(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeUser === "sven" ? C.sven : C.eva }} />
                        <span style={{ fontSize: 11, color: "#666" }}>{activeUser === "sven" ? "Sven" : "Eva"}</span>
                        <span style={{ fontSize: 10, color: "#444" }}>↓</span>
                      </button>
                    ) : (
                      <div style={{ fontSize: 11, color: "#555" }}>Wie ben jij?</div>
                    )}
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 24 }}>×</button>
              </div>
            </div>

            {/* Wie-ben-jij picker */}
            {showUserPicker && (
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #2A2520", flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 10, textAlign: "center" }}>Wie praat er nu met TIPO?</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ id: "sven", label: "Sven", color: C.sven, bg: C.svenBg }, { id: "eva", label: "Eva", color: C.eva, bg: C.evaBg }].map(u => (
                    <button key={u.id} onClick={() => selectUser(u.id)} style={{ flex: 1, padding: "12px", borderRadius: 14, border: `1.5px solid ${u.color}`, background: u.bg, color: u.color, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>{u.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMsgs.length === 0 && !chatLoading && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#555", fontSize: 13, fontFamily: "'Georgia', serif" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: 0.7 }}><RockyIcon size={56} /></div>
                  Klaar om jullie te helpen.
                </div>
              )}
              {chatMsgs.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? C.gold : "#252218", color: msg.role === "user" ? C.dark : "#E8E0D0", fontSize: 14, lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: "#252218", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}</div>}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 16px 30px", borderTop: "1px solid #252218", flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Vraag TIPO iets…" style={{ flex: 1, padding: "11px 15px", borderRadius: 24, border: "1px solid #333", background: "#1A1710", color: "#E8E0D0", fontSize: 14, fontFamily: "'Georgia', serif", outline: "none" }} />
              <button onClick={sendChat} disabled={chatLoading} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0, background: chatLoading ? "#333" : C.gold, color: C.dark, cursor: chatLoading ? "default" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
            </div>
          </div>
        </>
      )}

      {/* Rocky floating button */}
      {!chatOpen && (
        <button onClick={openChat} style={{ position: "fixed", bottom: 88, right: 16, width: 56, height: 56, borderRadius: "50%", background: C.dark, border: `2px solid ${C.gold}44`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.35)", zIndex: 5, padding: 4, overflow: "hidden" }} title="TIPO openen">
          <RockyIcon size={48} />
        </button>
      )}
    </div>
  );
}

// ─── ROUTINES TAB ─────────────────────────────────────────────────────────────
function RoutinesTab({ routines, setRoutines, filterOwner }) {
  const [period, setPeriod] = useState("weekly");
  const [filter, setFilter] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newEmoji, setNewEmoji] = useState("✅");
  const [newOwner, setNewOwner] = useState("sven");
  const [newCat, setNewCat] = useState("leefstijl");

  const weekKey = getWeekKey(); const monthKey = getMonthKey();
  const key = period === "weekly" ? weekKey : monthKey;

  const toggle = (id) => setRoutines(prev => ({ ...prev, [period]: prev[period].map(r => { if (r.id !== id) return r; const comps = r.completions || {}; const done = !comps[key]; return { ...r, completions: { ...comps, [key]: done || undefined }, streak: done ? (r.streak || 0) + 1 : Math.max(0, (r.streak || 0) - 1) }; }) }));
  const cycleOwner = (id) => setRoutines(prev => ({ ...prev, [period]: prev[period].map(r => { if (r.id !== id) return r; const owners = OWNERS.filter(o => o.id !== "samen"); const idx = owners.findIndex(o => o.id === r.owner); return { ...r, owner: owners[(idx + 1) % owners.length].id }; }) }));
  const addRoutine = () => { if (!newText.trim()) return; setRoutines(prev => ({ ...prev, [period]: [...prev[period], { id: `${period[0]}${Date.now()}`, text: newText.trim(), emoji: newEmoji, owner: newOwner, cat: newCat, streak: 0, completions: {} }] })); setNewText(""); setAdding(false); };

  const activeFilter = filterOwner || filter;
  const visible = routines[period].filter(r => !activeFilter || r.owner === activeFilter);
  const cats = ["leefstijl", "huishouden", "baby"].filter(c => visible.some(r => r.cat === c));
  const stats = OWNERS.filter(o => o.id !== "samen").map(o => { const mine = routines[period].filter(r => r.owner === o.id); const done = mine.filter(r => (r.completions || {})[key]).length; const pct = mine.length ? Math.round(done / mine.length * 100) : 0; return { ...o, done, total: mine.length, pct, maxStreak: mine.length ? Math.max(...mine.map(r => r.streak || 0)) : 0 }; });
  const leader = stats[0].pct >= stats[1].pct ? stats[0] : stats[1];
  const EMOJIS = ["🫀","💪","😴","🧘","🥗","💊","🩸","🛒","🏠","📋","💶","👶","✨","📖","🚶"];

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", background: C.dark, padding: "0 20px" }}>
        {[{ id: "weekly", label: "Wekelijks", emoji: "🔥" }, { id: "monthly", label: "Maandelijks", emoji: "📅" }].map(p => <button key={p.id} onClick={() => setPeriod(p.id)} style={{ flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer", color: period === p.id ? C.gold : "#AAA", borderBottom: period === p.id ? `2.5px solid ${C.gold}` : "2.5px solid transparent", fontSize: 12, fontFamily: "'Georgia', serif" }}>{p.emoji} {p.label}</button>)}
      </div>
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ background: C.dark, borderRadius: 18, padding: "18px 20px", marginBottom: 18 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 14, opacity: 0.8 }}>Scorebord</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {stats.map(s => (
              <div key={s.id} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "13px 14px", border: s.id === leader.id && s.pct > 0 ? `1px solid ${C.gold}44` : "1px solid transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 7 }}><Avatar ownerId={s.id} size={24} /><span style={{ color: "#E0D8CC", fontSize: 13, fontFamily: "'Georgia', serif" }}>{s.label}</span></div>{s.id === leader.id && s.pct > 0 && <span>👑</span>}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                    <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke={s.pct === 100 ? C.gold : s.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - s.pct / 100)}`} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 10, fontWeight: 700, color: s.pct === 100 ? C.gold : "#E8E0D0", fontFamily: "monospace" }}>{s.pct}%</span></div>
                  </div>
                  <div><div style={{ color: "#888", fontSize: 11 }}>{s.done}/{s.total}</div>{s.maxStreak > 0 && <div style={{ color: C.gold, fontSize: 11, marginTop: 2 }}>🔥 {s.maxStreak}×</div>}</div>
                </div>
              </div>
            ))}
          </div>
          {(() => { const tot = stats.reduce((a, s) => a + s.total, 0); const don = stats.reduce((a, s) => a + s.done, 0); const pct = tot ? Math.round(don / tot * 100) : 0; return <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>GEZAMENLIJK</span><span style={{ fontSize: 9, color: pct === 100 ? C.gold : "#555", fontFamily: "monospace" }}>{don}/{tot}</span></div><div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.gold : `linear-gradient(90deg, ${C.sven}, ${C.eva})`, borderRadius: 2, transition: "width 0.5s" }} /></div></div>; })()}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button onClick={() => setFilter(null)} style={{ padding: "5px 12px", borderRadius: 14, border: "none", fontSize: 11, cursor: "pointer", background: !activeFilter ? C.dark : C.sand, color: !activeFilter ? C.gold : C.brown, fontFamily: "'Georgia', serif" }}>Iedereen</button>
          {OWNERS.filter(o => o.id !== "samen").map(o => <button key={o.id} onClick={() => setFilter(activeFilter === o.id ? null : o.id)} style={{ padding: "5px 12px", borderRadius: 14, border: `1px solid ${activeFilter === o.id ? o.color : C.sand}`, background: activeFilter === o.id ? o.bg : C.paper, color: activeFilter === o.id ? o.color : C.muted, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>{o.avatar} {o.label}</button>)}
        </div>
        {cats.map(cat => { const items = visible.filter(r => r.cat === cat); if (!items.length) return null; const catInfo = ROUTINE_CATS.find(c => c.id === cat); return <div key={cat} style={{ marginBottom: 20 }}><div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>{catInfo?.emoji} {catInfo?.label}</div>{items.map(r => { const done = !!(r.completions || {})[key]; return <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 14, marginBottom: 8, background: done ? `${C.sand}88` : C.paper, border: `1px solid ${done ? C.sandDark : C.sand}` }}><button onClick={() => toggle(r.id)} style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, border: `2px solid ${done ? C.gold : C.sandDark}`, background: done ? C.gold : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13 }}>{done ? "✓" : ""}</button><span style={{ fontSize: 18, flexShrink: 0 }}>{r.emoji}</span><div style={{ flex: 1 }}><div style={{ fontSize: 14, color: done ? C.muted : C.dark, textDecoration: done ? "line-through" : "none", fontFamily: "'Georgia', serif", lineHeight: 1.3 }}>{r.text}</div>{(r.streak || 0) > 0 && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>🔥 {r.streak}× op rij</div>}</div><div onClick={() => cycleOwner(r.id)} style={{ cursor: "pointer" }}><Avatar ownerId={r.owner} size={26} /></div></div>; })}</div>; })}
        {adding && <div style={{ background: C.paper, borderRadius: 16, padding: 16, marginBottom: 14, border: `1.5px solid ${C.gold}` }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, marginBottom: 12, textTransform: "uppercase" }}>Nieuwe routine</div>
          <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === "Enter" && addRoutine()} placeholder="Omschrijving..." autoFocus style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box", marginBottom: 10, color: C.dark }} />
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>{EMOJIS.map(em => <button key={em} onClick={() => setNewEmoji(em)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${newEmoji === em ? C.gold : C.sand}`, background: newEmoji === em ? `${C.gold}20` : C.paper, fontSize: 16, cursor: "pointer" }}>{em}</button>)}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>{OWNERS.filter(o => o.id !== "samen").map(o => <button key={o.id} onClick={() => setNewOwner(o.id)} style={{ flex: 1, padding: "7px", borderRadius: 10, border: `1.5px solid ${newOwner === o.id ? o.color : C.sand}`, background: newOwner === o.id ? o.bg : C.paper, color: newOwner === o.id ? o.color : C.muted, fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" }}>{o.avatar} {o.label}</button>)}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>{ROUTINE_CATS.map(c => <button key={c.id} onClick={() => setNewCat(c.id)} style={{ flex: 1, padding: "6px", borderRadius: 10, border: "none", background: newCat === c.id ? C.dark : C.sand, color: newCat === c.id ? C.gold : C.brown, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>{c.emoji} {c.label}</button>)}</div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={() => setAdding(false)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${C.sand}`, background: "none", color: C.muted, fontSize: 13, cursor: "pointer" }}>Annuleer</button><button onClick={addRoutine} style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Toevoegen</button></div>
        </div>}
        {!adding && <button onClick={() => setAdding(true)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: `1.5px dashed ${C.gold}`, background: `${C.gold}10`, color: C.gold, fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>+ Routine toevoegen</button>}
      </div>
    </div>
  );
}

// ─── RECAP TAB ────────────────────────────────────────────────────────────────
function RecapTab({ tasks, recaps, setRecaps, setMemory }) {
  const [view, setView] = useState("overview");
  const [svenDone, setSvenDone] = useState(false); const [evaDone, setEvaDone] = useState(false);
  const [svenAns, setSvenAns] = useState(null); const [evaAns, setEvaAns] = useState(null);
  const [insight, setInsight] = useState(null); const [insightLoading, setInsightLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reminderDay, setReminderDay] = useState("zondag"); const [reminderTime, setReminderTime] = useState("09:00");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => { const today = new Date().toLocaleDateString("nl-NL", { weekday: "long" }); const thisWeek = getWeekKey(); const alreadyDone = recaps.some(r => { const d = r.date ? new Date(r.date) : null; if (!d) return false; const rW = `${d.getFullYear()}-W${Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7)}`; return rW === thisWeek; }); if (today === reminderDay && !alreadyDone && !svenDone && !evaDone) setShowAlert(true); }, [reminderDay, recaps]);

  const weekLabel = (() => { const n = new Date(); return `Week ${getWeekKey().split("W")[1]} · ${n.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`; })();

  const genInsight = async (sa, ea) => {
    setInsightLoading(true);
    try { const text = await generateRecapInsight(sa, ea, tasks); setInsight(text); const nr = { week: weekLabel, date: new Date().toISOString(), sven: sa, eva: ea, insight: text }; const upd = [nr, ...recaps].slice(0, 12); setRecaps(upd); const ms = `Recap ${weekLabel}: Sven energie ${sa.energy}/5 (${sa.highlight}), Eva energie ${ea.energy}/5 (${ea.highlight}). TIPO: ${text}`; setMemory(prev => (prev ? `${ms}\n\n${prev}` : ms).slice(0, 2000)); } catch (_) { setInsight("Kon geen inzicht genereren."); }
    setInsightLoading(false);
  };

  const RecapForm = ({ owner, onDone }) => {
    const o = OWNERS.find(o2 => o2.id === owner); const [answers, setAnswers] = useState({ energy: 0 }); const [step, setStep] = useState(0);
    const q = RECAP_QUESTIONS[step]; const isLast = step === RECAP_QUESTIONS.length - 1; const canNext = q.type === "scale" ? answers.energy > 0 : (answers[q.id] || "").trim().length > 2;
    const next = () => { if (isLast) { onDone(answers); return; } setStep(s => s + 1); };
    return (
      <div style={{ background: C.paper, borderRadius: 18, padding: 20, border: `1px solid ${C.sand}` }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>{RECAP_QUESTIONS.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? o.color : C.sand, transition: "background 0.3s" }} />)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><span style={{ fontSize: 22 }}>{q.icon}</span><div style={{ fontSize: 14, color: C.dark, fontFamily: "'Georgia', serif", lineHeight: 1.4 }}>{q.label}</div></div>
        {q.type === "scale" ? <div style={{ display: "flex", gap: 8 }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setAnswers(a => ({ ...a, energy: n }))} style={{ flex: 1, padding: "12px 4px", borderRadius: 12, border: `1.5px solid ${answers.energy >= n ? o.color : C.sand}`, background: answers.energy >= n ? `${o.color}18` : C.paper, fontSize: 22, cursor: "pointer" }}>{["😴","😐","🙂","😊","🔥"][n-1]}</button>)}</div>
          : <textarea value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} placeholder={q.placeholder} rows={3} autoFocus style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.sand}`, fontSize: 14, fontFamily: "'Georgia', serif", color: C.dark, outline: "none", resize: "none", lineHeight: 1.6, background: "white", boxSizing: "border-box", marginTop: 8 }} />}
        <button onClick={next} disabled={!canNext} style={{ width: "100%", marginTop: 16, padding: "13px", borderRadius: 12, border: "none", background: canNext ? o.color : C.sand, color: canNext ? "white" : C.muted, fontSize: 14, cursor: canNext ? "pointer" : "default", fontFamily: "'Georgia', serif", fontWeight: 700 }}>{isLast ? "Afronden ✓" : "Volgende →"}</button>
      </div>
    );
  };

  if (view === "recap-sven") return <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 0" }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><Avatar ownerId="sven" size={34} /><div><div style={{ fontSize: 15, color: C.dark, fontFamily: "'Georgia', serif" }}>Sven's check-in</div><div style={{ fontSize: 11, color: C.muted }}>4 vragen · ~2 minuten</div></div></div><RecapForm owner="sven" onDone={a => { setSvenAns(a); setSvenDone(true); setView("overview"); }} /></div>;
  if (view === "recap-eva") return <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 0" }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><Avatar ownerId="eva" size={34} /><div><div style={{ fontSize: 15, color: C.dark, fontFamily: "'Georgia', serif" }}>Eva's check-in</div><div style={{ fontSize: 11, color: C.muted }}>4 vragen · ~2 minuten</div></div></div><RecapForm owner="eva" onDone={a => { setEvaAns(a); setEvaDone(true); setView("overview"); }} /></div>;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 0" }}>
      {showAlert && <div style={{ background: C.gold, borderRadius: 14, padding: "13px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 22 }}>📊</span><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "'Georgia', serif" }}>Recap tijd!</div><div style={{ fontSize: 11, color: C.brown }}>Wekelijkse check-in staat klaar.</div></div><button onClick={() => setShowAlert(false)} style={{ background: "none", border: "none", color: C.brown, cursor: "pointer", fontSize: 20 }}>×</button></div>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}><button onClick={() => setShowSettings(!showSettings)} style={{ padding: "7px 14px", borderRadius: 12, border: `1px solid ${C.sand}`, background: showSettings ? C.dark : C.paper, color: showSettings ? C.gold : C.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif" }}>⚙️ Herinnering</button></div>
      {showSettings && <div style={{ background: C.paper, borderRadius: 18, padding: 18, marginBottom: 16, border: `1px solid ${C.sand}` }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 14 }}>⚙️ Herinnering</div>
        <div style={{ marginBottom: 12 }}><div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Dag</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{["ma","di","wo","do","vr","za","zo"].map((d, i) => { const full = ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"][i]; return <button key={d} onClick={() => setReminderDay(full)} style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: reminderDay === full ? C.dark : C.sand, color: reminderDay === full ? C.gold : C.brown, fontSize: 11, cursor: "pointer" }}>{d}</button>; })}</div></div>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Tijdstip</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{["07:00","08:00","09:00","10:00","19:00","20:00"].map(t => <button key={t} onClick={() => setReminderTime(t)} style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: reminderTime === t ? C.dark : C.sand, color: reminderTime === t ? C.gold : C.brown, fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>{t}</button>)}</div></div>
        <div style={{ background: `${C.gold}18`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.brown, fontFamily: "'Georgia', serif" }}>📲 Elke <strong>{reminderDay}</strong> om <strong>{reminderTime}</strong></div>
        <button onClick={() => setShowSettings(false)} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Opslaan</button>
      </div>}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>{weekLabel} — invullen</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{ owner: "sven", done: svenDone, action: () => setView("recap-sven") }, { owner: "eva", done: evaDone, action: () => setView("recap-eva") }].map(({ owner, done, action }) => { const o = OWNERS.find(o2 => o2.id === owner); return <button key={owner} onClick={action} style={{ flex: 1, padding: "18px 14px", borderRadius: 18, cursor: done ? "default" : "pointer", border: `1.5px solid ${done ? o.color : C.sand}`, background: done ? o.bg : C.paper, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Avatar ownerId={owner} size={40} /><div style={{ fontSize: 13, color: done ? o.color : C.dark, fontFamily: "'Georgia', serif" }}>{o.label}</div><div style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: done ? o.color : C.sand, color: done ? "white" : C.muted }}>{done ? "✓ Gedaan" : "Invullen →"}</div></button>; })}
        </div>
      </div>
      {svenDone && evaDone && <div style={{ background: C.dark, borderRadius: 18, padding: "16px 18px", marginBottom: 18 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>✦ TIPO Inzicht</div>
        {!insight && !insightLoading && <button onClick={() => genInsight(svenAns, evaAns)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Genereer inzicht</button>}
        {insightLoading && <div style={{ display: "flex", gap: 5, padding: "10px 0" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}</div>}
        {insight && <div style={{ fontSize: 13, color: "#E8E0D0", lineHeight: 1.75, fontFamily: "'Georgia', serif" }}>{insight}</div>}
      </div>}
      {recaps.length > 0 && <div style={{ marginBottom: 24 }}><div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>Vorige recaps</div>{recaps.map((recap, i) => <div key={i} style={{ background: C.paper, borderRadius: 16, padding: "14px 16px", marginBottom: 10, border: `1px solid ${C.sand}` }}><div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{recap.week}</div><div style={{ display: "flex", gap: 10, marginBottom: 10 }}>{[{ o: OWNERS[0], a: recap.sven }, { o: OWNERS[1], a: recap.eva }].map(({ o, a }) => <div key={o.id} style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><Avatar ownerId={o.id} size={18} /><span style={{ fontSize: 11, color: o.color }}>{o.label}</span><span style={{ fontSize: 14 }}>{["😴","😐","🙂","😊","🔥"][(a?.energy || 1) - 1]}</span></div>{a?.highlight && <div style={{ fontSize: 11, color: C.brown, lineHeight: 1.5 }}>✨ {a.highlight}</div>}{a?.focus && <div style={{ fontSize: 11, color: C.brown, lineHeight: 1.5, marginTop: 2 }}>🎯 {a.focus}</div>}</div>)}</div>{recap.insight && <div style={{ background: `${C.gold}14`, borderRadius: 10, padding: "8px 12px", fontSize: 11, color: C.brown, lineHeight: 1.5 }}>✦ {recap.insight}</div>}</div>)}</div>}
    </div>
  );
}

// ─── PROFIEL + GEZINS-DNA ─────────────────────────────────────────────────────
const BLUEPRINT_PILLARS = [
  { id: "slaap",      label: "Slaap",                    emoji: "😴", attia: "7-9u per nacht, consistent ritme, koele kamer, geen schermen voor bed" },
  { id: "bewegen",    label: "Bewegen",                  emoji: "💪", attia: "Zone 2 cardio 3-4x/week, kracht 2-3x/week, VO2max training 1x/week" },
  { id: "voeding",    label: "Voeding",                  emoji: "🥗", attia: "Voldoende eiwit (1.6-2.2g/kg), weinig ultrabewerkt, stabiele bloedsuiker" },
  { id: "supps",      label: "Supplementen & Medicatie", emoji: "💊", attia: "Creatine, omega-3, vitamine D3+K2, magnesium — op basis van bloedwaarden" },
  { id: "emotioneel", label: "Emotionele Gezondheid",    emoji: "🧠", attia: "Stressmanagement, sociale verbinding, therapie/coaching, zingeving" },
];
const BLUEPRINT_KEYS = { sven: "tipo-v5-blueprint-sven", eva: "tipo-v5-blueprint-eva" };

function GezinsDNA({ dna, setDna }) {
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [draftLinks, setDraftLinks] = useState([]);
  const [newLinkLabel, setNewLinkLabel] = useState(""); const [newLinkUrl, setNewLinkUrl] = useState(""); const [addingLink, setAddingLink] = useState(false);
  const [saved, setSaved] = useState(false); const [showInfo, setShowInfo] = useState(null);
  const [onboarding, setOnboarding] = useState(false);
  const [onboardMsgs, setOnboardMsgs] = useState([]);
  const [onboardInput, setOnboardInput] = useState("");
  const [onboardLoading, setOnboardLoading] = useState(false);
  const onboardEndRef = useRef(null);

  useEffect(() => { onboardEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [onboardMsgs]);

  const filledCount = DNA_SECTIONS.filter(s => dna[s.id]?.text).length;
  const openEdit = (s) => { setEditingId(s.id); setDraftText(dna[s.id]?.text || ""); setDraftLinks(dna[s.id]?.links || []); setAddingLink(false); setNewLinkLabel(""); setNewLinkUrl(""); };
  const saveSection = () => { const upd = { ...dna, [editingId]: { text: draftText, links: draftLinks } }; setDna(upd); saveData(KEYS.dna, upd); setEditingId(null); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const addLink = () => { if (!newLinkLabel.trim() || !newLinkUrl.trim()) return; const url = newLinkUrl.startsWith("http") ? newLinkUrl : `https://${newLinkUrl}`; setDraftLinks(prev => [...prev, { id: `l${Date.now()}`, label: newLinkLabel.trim(), url }]); setNewLinkLabel(""); setNewLinkUrl(""); setAddingLink(false); };
  const removeLink = (id) => setDraftLinks(prev => prev.filter(l => l.id !== id));

  const startOnboarding = async () => {
    setOnboarding(true);
    setOnboardMsgs([]);
    setOnboardLoading(true);
    try {
      const { text } = await askDNAOnboarding([], dna);
      setOnboardMsgs([{ role: "assistant", content: text }]);
    } catch { setOnboardMsgs([{ role: "assistant", content: "Hoi! Laten we jullie Gezins-DNA samen invullen. Vertel me eerst: waar wonen jullie nu, en wat voor woning dromen jullie van?" }]); }
    setOnboardLoading(false);
  };

  const sendOnboard = async () => {
    if (!onboardInput.trim() || onboardLoading) return;
    const userMsg = { role: "user", content: onboardInput.trim() };
    const newMsgs = [...onboardMsgs, userMsg];
    setOnboardMsgs(newMsgs);
    setOnboardInput("");
    setOnboardLoading(true);
    try {
      const { text, update } = await askDNAOnboarding(newMsgs.map(m => ({ role: m.role, content: m.content })), dna);
      if (update) {
        const upd = { ...dna, [update.section]: { ...(dna[update.section] || {}), text: update.text } };
        setDna(upd);
        saveData(KEYS.dna, upd);
      }
      setOnboardMsgs(prev => [...prev, { role: "assistant", content: text }]);
    } catch { setOnboardMsgs(prev => [...prev, { role: "assistant", content: "Sorry, probeer opnieuw." }]); }
    setOnboardLoading(false);
  };

  if (onboarding) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${C.sand}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: C.gold, letterSpacing: 1 }}>✦ Gezins-DNA Onboarding</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{filledCount}/{DNA_SECTIONS.length} secties ingevuld</div>
        </div>
        <button onClick={() => setOnboarding(false)} style={{ background: "none", border: `1px solid ${C.sand}`, borderRadius: 10, padding: "5px 12px", color: C.muted, fontSize: 11, cursor: "pointer" }}>Terug</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {onboardMsgs.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? C.gold : C.sand, color: msg.role === "user" ? C.dark : C.brown, fontSize: 14, lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>{msg.content}</div>
          </div>
        ))}
        {onboardLoading && <div style={{ display: "flex", gap: 5, padding: "10px 14px", background: C.sand, borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}</div>}
        <div ref={onboardEndRef} />
      </div>
      <div style={{ padding: "10px 16px 28px", borderTop: `1px solid ${C.sand}`, display: "flex", gap: 8 }}>
        <input value={onboardInput} onChange={e => setOnboardInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendOnboard()} placeholder="Typ je antwoord…"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 22, border: `1px solid ${C.sandDark}`, background: C.paper, color: C.dark, fontSize: 13, fontFamily: "'Georgia', serif", outline: "none" }} />
        <button onClick={sendOnboard} disabled={onboardLoading} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", flexShrink: 0, background: onboardLoading ? C.sand : C.gold, color: C.dark, cursor: onboardLoading ? "default" : "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 40px" }}>
      <div style={{ background: C.dark, borderRadius: 18, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: C.gold, textTransform: "uppercase", marginBottom: 8, opacity: 0.8 }}>Gezins-DNA</div>
        <div style={{ fontSize: 14, color: "#E8E0D0", fontFamily: "'Georgia', serif", lineHeight: 1.6, marginBottom: 12 }}>Jullie gedeelde waarden, visie en context. TIPO gebruikt dit bij elk advies.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${filledCount / DNA_SECTIONS.length * 100}%`, background: C.gold, borderRadius: 2, transition: "width 0.5s" }} /></div><span style={{ fontSize: 11, color: C.gold, fontFamily: "monospace" }}>{filledCount}/{DNA_SECTIONS.length}</span></div>
        <button onClick={startOnboarding} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>
          ✦ {filledCount === 0 ? "Vul in met TIPO" : "Verder invullen met TIPO"}
        </button>
      </div>
      {DNA_SECTIONS.map(section => {
        const data = dna[section.id] || {}; const hasText = !!data.text; const hasLinks = (data.links || []).length > 0; const isEditing = editingId === section.id;
        return (
          <div key={section.id} style={{ background: C.paper, borderRadius: 16, padding: "16px 18px", marginBottom: 12, border: `1px solid ${hasText ? C.sandDark : C.sand}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: hasText || isEditing ? 12 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{section.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: "'Georgia', serif" }}>{section.label}</div>
                    <button onClick={() => setShowInfo(showInfo === section.id ? null : section.id)} style={{ background: "none", border: `1px solid ${C.sandDark}`, borderRadius: "50%", width: 18, height: 18, fontSize: 10, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>i</button>
                  </div>
                  {!hasText && !isEditing && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Nog niet ingevuld</div>}
                </div>
              </div>
              <button onClick={() => isEditing ? setEditingId(null) : openEdit(section)} style={{ padding: "5px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, background: "none", color: C.muted, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>{isEditing ? "Annuleer" : hasText ? "Bewerk" : "Invullen"}</button>
            </div>
            {showInfo === section.id && <div style={{ background: `${C.gold}15`, borderRadius: 10, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: C.brown, lineHeight: 1.55, fontFamily: "'Georgia', serif", borderLeft: `3px solid ${C.gold}` }}>ℹ️ {section.info}</div>}
            {hasText && !isEditing && <div style={{ fontSize: 13, color: C.brown, lineHeight: 1.65, fontFamily: "'Georgia', serif", marginBottom: hasLinks ? 10 : 0 }}>{data.text}</div>}
            {hasLinks && !isEditing && <div style={{ marginTop: 8 }}>{(data.links || []).map(l => <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", fontSize: 12, color: C.sven, textDecoration: "none" }}><span>🔗</span> {l.label}</a>)}</div>}
            {isEditing && <div>
              <textarea autoFocus value={draftText} onChange={e => setDraftText(e.target.value)} placeholder={section.placeholder} rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.gold}`, fontSize: 13, fontFamily: "'Georgia', serif", color: C.dark, outline: "none", resize: "none", lineHeight: 1.65, background: "white", boxSizing: "border-box", marginBottom: 12 }} />
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>🔗 Bronnen & Links</div>
                {draftLinks.map(l => <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.sand}` }}><span style={{ fontSize: 13, flex: 1, color: C.sven, fontFamily: "'Georgia', serif" }}>{l.label}</span><button onClick={() => removeLink(l.id)} style={{ background: "none", border: "none", color: C.sandDark, cursor: "pointer", fontSize: 16 }}>×</button></div>)}
                {addingLink ? <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Omschrijving" style={{ padding: "8px 12px", borderRadius: 9, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", outline: "none", color: C.dark }} />
                  <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="URL" onKeyDown={e => e.key === "Enter" && addLink()} style={{ padding: "8px 12px", borderRadius: 9, border: `1px solid ${C.sand}`, fontSize: 13, fontFamily: "'Georgia', serif", outline: "none", color: C.dark }} />
                  <div style={{ display: "flex", gap: 6 }}><button onClick={() => setAddingLink(false)} style={{ flex: 1, padding: "7px", borderRadius: 9, border: `1px solid ${C.sand}`, background: "none", color: C.muted, fontSize: 12, cursor: "pointer" }}>Annuleer</button><button onClick={addLink} style={{ flex: 2, padding: "7px", borderRadius: 9, border: "none", background: C.gold, color: C.dark, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Toevoegen</button></div>
                </div> : <button onClick={() => setAddingLink(true)} style={{ marginTop: 8, padding: "6px 12px", borderRadius: 9, border: `1px dashed ${C.sandDark}`, background: "none", color: C.muted, fontSize: 12, cursor: "pointer" }}>+ Link toevoegen</button>}
              </div>
              <button onClick={saveSection} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: C.gold, color: C.dark, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>{saved ? "Opgeslagen ✓" : "Opslaan"}</button>
            </div>}
          </div>
        );
      })}
    </div>
  );
}

function ProfielTab({ memory, setMemory, dna, setDna }) {
  const [profielTab, setProfielTab] = useState("persoonlijk");
  const [person, setPerson] = useState("sven");
  const [blueprints, setBlueprints] = useState({ sven: {}, eva: {} });
  const [editing, setEditing] = useState(null); const [draftText, setDraftText] = useState(""); const [saved, setSaved] = useState(false);
  const [tipoContexts, setTipoContexts] = useState({ sven: "", eva: "" });
  const [editContext, setEditContext] = useState(false);

  useEffect(() => {
    Promise.all([loadData("tipo-v8-context-sven", ""), loadData("tipo-v8-context-eva", "")])
      .then(([s, e]) => setTipoContexts({ sven: s, eva: e }));
  }, []);
  useEffect(() => { Promise.all([loadData(BLUEPRINT_KEYS.sven, {}), loadData(BLUEPRINT_KEYS.eva, {})]).then(([s, e]) => setBlueprints({ sven: s, eva: e })); }, []);

  const tipoContext = tipoContexts[person] || "";
  const setTipoContext = (val) => setTipoContexts(prev => ({ ...prev, [person]: val }));

  const buildMemory = (bp, ctxs) => {
    const bs = Object.entries(bp.sven || {}).map(([k, v]) => { const p = BLUEPRINT_PILLARS.find(x => x.id === k); return v ? `Sven ${p?.label}: ${v}` : null; }).filter(Boolean).join(" | ");
    const be = Object.entries(bp.eva  || {}).map(([k, v]) => { const p = BLUEPRINT_PILLARS.find(x => x.id === k); return v ? `Eva ${p?.label}: ${v}` : null; }).filter(Boolean).join(" | ");
    return [ctxs.sven ? `Sven extra: ${ctxs.sven}` : null, ctxs.eva ? `Eva extra: ${ctxs.eva}` : null, bs, be].filter(Boolean).join("\n");
  };
  const savePillar = () => { const upd = { ...blueprints, [person]: { ...blueprints[person], [editing]: draftText } }; setBlueprints(upd); saveData(BLUEPRINT_KEYS[person], upd[person]); setEditing(null); const nm = buildMemory(upd, tipoContexts); setMemory(nm); saveData("tipo-v5-memory", nm); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const saveContext = () => { const upd = { ...tipoContexts, [person]: tipoContext }; setTipoContexts(upd); saveData(`tipo-v8-context-${person}`, tipoContext); const nm = buildMemory(blueprints, upd); setMemory(nm); saveData("tipo-v5-memory", nm); setEditContext(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const currentBp = blueprints[person] || {}; const o = OWNERS.find(o => o.id === person);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", background: C.sand, borderBottom: `1px solid ${C.sandDark}`, flexShrink: 0 }}>
        <button onClick={() => setProfielTab("persoonlijk")} style={{ flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer", color: profielTab === "persoonlijk" ? C.dark : C.muted, borderBottom: profielTab === "persoonlijk" ? `2.5px solid ${C.dark}` : "2.5px solid transparent", fontSize: 12, fontFamily: "'Georgia', serif" }}>👤 Persoonlijk</button>
        <button onClick={() => setProfielTab("gezin")} style={{ flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer", color: profielTab === "gezin" ? C.dark : C.muted, borderBottom: profielTab === "gezin" ? `2.5px solid ${C.gold}` : "2.5px solid transparent", fontSize: 12, fontFamily: "'Georgia', serif" }}>🏡 Gezins-DNA</button>
      </div>
      {profielTab === "persoonlijk" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 40px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["sven", "eva"].map(p => { const ow = OWNERS.find(o => o.id === p); const filled = Object.keys(blueprints[p] || {}).filter(k => blueprints[p][k]).length; return <button key={p} onClick={() => setPerson(p)} style={{ flex: 1, padding: "14px", borderRadius: 16, cursor: "pointer", border: `1.5px solid ${person === p ? ow.color : C.sand}`, background: person === p ? ow.bg : C.paper, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><Avatar ownerId={p} size={36} /><div style={{ fontSize: 13, color: person === p ? ow.color : C.dark, fontFamily: "'Georgia', serif" }}>{ow.label}</div><div style={{ fontSize: 10, color: C.muted }}>{filled}/{BLUEPRINT_PILLARS.length} pijlers</div></button>; })}
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>🏗 Leefstijl Blueprint — {o?.label}</div>
            {BLUEPRINT_PILLARS.map(pillar => { const value = currentBp[pillar.id] || ""; const isEditing = editing === pillar.id; return (
              <div key={pillar.id} style={{ background: C.paper, borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1px solid ${value ? C.sandDark : C.sand}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isEditing ? 10 : value ? 8 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{pillar.emoji}</span><div><div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "'Georgia', serif" }}>{pillar.label}</div>{!value && !isEditing && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Nog niet ingevuld</div>}</div></div>
                  <button onClick={() => { setEditing(isEditing ? null : pillar.id); setDraftText(value); }} style={{ padding: "5px 12px", borderRadius: 10, border: `1px solid ${C.sand}`, background: "none", color: C.muted, fontSize: 11, cursor: "pointer" }}>{isEditing ? "Annuleer" : value ? "Bewerk" : "Invullen"}</button>
                </div>
                {!value && !isEditing && <div style={{ fontSize: 11, color: C.sandDark, fontStyle: "italic", lineHeight: 1.5, marginTop: 6 }}>💡 Attia: {pillar.attia}</div>}
                {value && !isEditing && <div style={{ fontSize: 13, color: C.brown, lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>{value}</div>}
                {isEditing && <div><div style={{ fontSize: 11, color: C.sandDark, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>💡 {pillar.attia}</div><textarea autoFocus value={draftText} onChange={e => setDraftText(e.target.value)} placeholder={`Beschrijf ${o?.label}'s protocol...`} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${o?.color}`, fontSize: 13, fontFamily: "'Georgia', serif", color: C.dark, outline: "none", resize: "none", lineHeight: 1.6, background: "white", boxSizing: "border-box" }} /><button onClick={savePillar} style={{ marginTop: 8, padding: "8px 18px", borderRadius: 10, border: "none", background: o?.color, color: "white", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Opslaan {saved ? "✓" : ""}</button></div>}
              </div>
            ); })}
          </div>
          <div style={{ background: C.dark, borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={{ fontSize: 9, letterSpacing: 2, color: C.gold, textTransform: "uppercase" }}>✦ Extra TIPO Context</div><button onClick={() => setEditContext(!editContext)} style={{ padding: "5px 12px", borderRadius: 10, border: "none", background: editContext ? "#333" : C.gold, color: editContext ? "#AAA" : C.dark, fontSize: 11, cursor: "pointer" }}>{editContext ? "Annuleer" : "Bewerk"}</button></div>
            {editContext ? <div><textarea value={tipoContext} onChange={e => setTipoContext(e.target.value)} placeholder="Extra context — bijv. knieblessure, medicatie, zwangerschapdetails..." rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: "#2A2218", color: "#E8E0D0", fontSize: 13, fontFamily: "'Georgia', serif", outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box" }} /><button onClick={saveContext} style={{ marginTop: 8, padding: "8px 18px", borderRadius: 10, border: "none", background: C.gold, color: C.dark, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>{saved ? "Opgeslagen ✓" : "Opslaan"}</button></div>
              : <div style={{ fontSize: 13, color: tipoContext ? "#C8C0B0" : "#555", lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>{tipoContext || "Nog geen extra context."}</div>}
          </div>
        </div>
      )}
      {profielTab === "gezin" && <GezinsDNA dna={dna} setDna={setDna} />}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab]                   = useState("taken");
  const [filterOwner, setFilterOwner]   = useState(null);
  const [tasks, setTasks]               = useState(null);
  const [routines, setRoutines]         = useState(null);
  const [recaps, setRecaps]             = useState([]);
  const [memory, setMemory]             = useState("");
  const [dna, setDna]                   = useState({});
  const [chatHistories, setChatHistories] = useState({ sven: [], eva: [] });
  const [userMemories, setUserMemories]   = useState({ sven: "", eva: "" });
  const [activeUser, setActiveUser]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [editBabyDate, setEditBabyDate] = useState(false);
  const [babyDateStr, setBabyDateStr]   = useState("2026-09-01");

  const babyDate = new Date(babyDateStr);
  const daysLeft = Math.max(0, Math.ceil((babyDate - new Date()) / 86400000));
  const babyBorn = new Date() > babyDate;

  const dnaString = DNA_SECTIONS.map(s => { const d = dna[s.id]; if (!d?.text) return null; const links = (d.links || []).map(l => `${l.label}: ${l.url}`).join(", "); return `${s.label}: ${d.text}${links ? ` [${links}]` : ""}`; }).filter(Boolean).join("\n");

  useEffect(() => {
    Promise.all([
      loadData(KEYS.tasks,       DEFAULT_TASKS),
      loadData(KEYS.routines,    DEFAULT_ROUTINES),
      loadData(KEYS.recaps,      []),
      loadData(KEYS.memory,      ""),
      loadData(KEYS.dna,         {}),
      loadData(KEYS.chatSven,   []),
      loadData(KEYS.chatEva,    []),
      loadData(KEYS.memorySven, ""),
      loadData(KEYS.memoryEva,  ""),
      loadData(KEYS.activeUser, null),
    ]).then(([t, r, rc, m, d, cs, ce, ms, me, au]) => {
      setTasks(t); setRoutines(r); setRecaps(rc); setMemory(m); setDna(d);
      setChatHistories({ sven: cs, eva: ce });
      setUserMemories({ sven: ms, eva: me });
      setActiveUser(au);
      setLoading(false);
    });
  }, []);

  useEffect(() => { if (tasks)              saveData(KEYS.tasks,       tasks);       }, [tasks]);
  useEffect(() => { if (routines)           saveData(KEYS.routines,    routines);    }, [routines]);
  useEffect(() => { if (recaps.length)      saveData(KEYS.recaps,      recaps);      }, [recaps]);
  useEffect(() => { if (memory)             saveData(KEYS.memory,      memory);      }, [memory]);
  useEffect(() => { if (Object.keys(dna).length) saveData(KEYS.dna,   dna);         }, [dna]);
  // chat history wordt per gebruiker opgeslagen in TasksTab
  useEffect(() => { if (activeUser)         saveData(KEYS.activeUser,  activeUser);  }, [activeUser]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.dark }}>
      <div style={{ marginBottom: 16, opacity: 0.9 }}><RockyIcon size={72} /></div>
      <div style={{ color: C.gold, fontSize: 22, marginBottom: 16, letterSpacing: -0.5, fontFamily: "'Georgia', serif" }}>TIPO Brain</div>
      <div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, animation: `tipoFade 1.2s ${i*0.2}s infinite` }} />)}</div>
      <style>{`@keyframes tipoFade { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );

  const openCount = tasks.filter(t => !t.done).length;
  const fullMemory = `${memory}${dnaString ? `\n\nGezins-DNA:\n${dnaString}` : ""}`;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "22px 22px 0", flexShrink: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 3, opacity: 0.7 }}>Tilanus · Poorthuis</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 400, color: "#F5F0E8", letterSpacing: -0.5 }}>TIPO Brain</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!babyBorn && daysLeft > 0 && (
              <div onClick={() => setEditBabyDate(!editBabyDate)} style={{ background: "#2A2218", borderRadius: 12, padding: "5px 10px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 14, color: C.gold, fontWeight: 700, fontFamily: "monospace" }}>{daysLeft}</div>
                <div style={{ fontSize: 8, color: "#555", letterSpacing: 1 }}>👶 DAGEN</div>
              </div>
            )}
            {babyBorn && <div style={{ background: "#2A2218", borderRadius: 12, padding: "5px 10px", textAlign: "center" }}><div style={{ fontSize: 16 }}>👶</div><div style={{ fontSize: 8, color: C.gold, letterSpacing: 1 }}>GEBOREN!</div></div>}
            {editBabyDate && (
              <div style={{ position: "absolute", top: 60, right: 16, background: C.dark, borderRadius: 14, padding: "12px 14px", zIndex: 50, border: `1px solid ${C.gold}44`, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>👶 UITGEREKENDE DATUM</div>
                <input type="date" value={babyDateStr} onChange={e => setBabyDateStr(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.gold}44`, background: "#2A2218", color: "#E8E0D0", fontSize: 13, outline: "none", fontFamily: "monospace" }} />
                <button onClick={() => setEditBabyDate(false)} style={{ marginTop: 8, width: "100%", padding: "7px", borderRadius: 9, border: "none", background: C.gold, color: C.dark, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Opslaan</button>
              </div>
            )}
            <span style={{ color: "#AAA", fontSize: 12 }}>{openCount} open</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button onClick={() => setFilterOwner(null)} style={{ padding: "5px 13px", borderRadius: 14, border: "none", fontSize: 12, cursor: "pointer", background: !filterOwner ? "#3A3528" : "transparent", color: !filterOwner ? "#F5F0E8" : "#888", fontFamily: "'Georgia', serif" }}>Iedereen</button>
          {OWNERS.map(o => <button key={o.id} onClick={() => setFilterOwner(filterOwner === o.id ? null : o.id)} style={{ padding: "5px 13px", borderRadius: 14, border: `1px solid ${filterOwner === o.id ? o.color : "#444"}`, background: filterOwner === o.id ? o.bg : "transparent", color: filterOwner === o.id ? o.color : "#999", fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif" }}>{o.label}</button>)}
        </div>
        <div style={{ display: "flex" }}>
          {[{ id: "taken", label: "Taken", emoji: "✓" }, { id: "routines", label: "Routines", emoji: "🔄" }, { id: "recap", label: "Recap", emoji: "📊" }, { id: "profiel", label: "Profiel", emoji: "👤" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 4px 12px", border: "none", background: "none", cursor: "pointer", color: tab === t.id ? C.gold : "#AAA", borderBottom: tab === t.id ? `2.5px solid ${C.gold}` : "2.5px solid transparent", fontSize: 11, fontFamily: "'Georgia', serif" }}>{t.emoji} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tab === "taken"    && <TasksTab tasks={tasks} setTasks={setTasks} memory={fullMemory} dna={dnaString} recaps={recaps} filterOwner={filterOwner} activeUser={activeUser} setActiveUser={setActiveUser} chatHistories={chatHistories} setChatHistories={setChatHistories} userMemories={userMemories} setUserMemories={setUserMemories} />}
        {tab === "routines" && <RoutinesTab routines={routines} setRoutines={setRoutines} filterOwner={filterOwner} />}
        {tab === "recap"    && <RecapTab tasks={tasks} recaps={recaps} setRecaps={setRecaps} setMemory={setMemory} />}
        {tab === "profiel"  && <ProfielTab memory={memory} setMemory={setMemory} dna={dna} setDna={setDna} />}
      </div>

      <style>{`
        @keyframes tipoFade { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
// redeploy
// fix
// redeploy
// fix2
