const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ZONES = ["genius", "excellence", "competence", "incompetence"];
const API_URL = "/.netlify/functions/time-log-state";
const SLOT_COUNT = 48;
const START_MINUTES = 5 * 60;
const stateKey = getStateKey();
const localStorageKey = "neo-time-log-state:" + stateKey;

let state = createDefaultState();
let currentWeek = 1;
let currentDay = 0;
let saveTimer = null;
let serverAvailable = true;
let isLoading = true;
let draggedCardId = null;

function getStateKey() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("key") || "default";
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "default";
}

function createDefaultState() {
  return {
    meta: { version: 4, stateKey, updatedAt: null, savedAt: null },
    setup: { personName: "", incomeGoal: 500000, weeksOff: 2, hoursPerWeek: 40 },
    activities: {},
    manualZones: {},
    zoneOrder: { genius: [], excellence: [], competence: [], incompetence: [] },
    notes: { learning: "", actions: "" }
  };
}

function mergeState(loaded) {
  const base = createDefaultState();
  if (!loaded || typeof loaded !== "object") return base;
  return {
    meta: Object.assign({}, base.meta, loaded.meta || {}),
    setup: Object.assign({}, base.setup, loaded.setup || {}),
    activities: Object.assign({}, base.activities, loaded.activities || {}),
    manualZones: Object.assign({}, base.manualZones, loaded.manualZones || {}),
    zoneOrder: Object.assign({}, base.zoneOrder, loaded.zoneOrder || {}),
    notes: Object.assign({}, base.notes, loaded.notes || {})
  };
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function numberFmt(value, decimals = 1) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: value % 1 ? decimals : 0 });
}

function pctFmt(value) {
  if (value === null || !Number.isFinite(value)) return "--";
  return Math.round(value * 100) + "%";
}

function timeLabel(slot) {
  const total = (START_MINUTES + slot * 30) % (24 * 60);
  const hour24 = Math.floor(total / 60);
  const minute = total % 60;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const displayHour = hour24 % 12 || 12;
  return displayHour + ":" + String(minute).padStart(2, "0") + " " + ampm;
}

function cellId(week, day, slot) {
  return "w" + week + "_d" + day + "_s" + slot;
}

function getEntry(id) {
  return state.activities[id] || { text: "", roi: "", roe: "", result: "" };
}

function setEntryValue(id, field, value) {
  const entry = Object.assign({ text: "", roi: "", roe: "", result: "" }, state.activities[id] || {});
  entry[field] = value;
  if (field === "text" && entry.text.trim() && !entry.roi) {
    const suggestion = suggestROI(entry.text);
    if (suggestion) entry.roi = suggestion;
  }
  if (!entry.text.trim() && !entry.roi && !entry.roe && !entry.result) {
    delete state.activities[id];
  } else {
    state.activities[id] = entry;
  }
  state.meta.updatedAt = new Date().toISOString();
}

function suggestROI(text) {
  const s = String(text || "").toLowerCase();
  const green = ["prospect", "lead", "borrower", "buyer", "client consult", "consultation", "preapproval", "pre-approval", "strategy", "tca", "mortgage coach", "referral", "realtor", "agent", "partner", "annual review", "database call", "past client", "sales call", "webinar", "lunch and learn", "relationship", "offer", "contract meeting", "dreams", "goals"];
  const red = ["email", "inbox", "admin", "data entry", "file setup", "upload", "documents", "docs", "condition", "conditions", "appraisal", "title", "escrow", "pricing", "lock", "rate sheet", "social media", "scroll", "crm cleanup", "calendar", "chasing", "status update", "internal meeting"];
  if (green.some(k => s.includes(k))) return "G";
  if (red.some(k => s.includes(k))) return "R";
  return "";
}

function calculateTargetHourly() {
  const income = Number(state.setup.incomeGoal || 0);
  const weeksOff = Number(state.setup.weeksOff || 0);
  const hours = Number(state.setup.hoursPerWeek || 0);
  const totalHours = Math.max(0, 52 - weeksOff) * hours;
  return totalHours > 0 ? income / totalHours : 0;
}

function computeDayStats(week, day) {
  let totalBlocks = 0;
  let greenBlocks = 0;
  let redBlocks = 0;
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const entry = getEntry(cellId(week, day, slot));
    if (entry.text && entry.text.trim()) totalBlocks += 1;
    if (entry.roi === "G") greenBlocks += 1;
    if (entry.roi === "R") redBlocks += 1;
  }
  const totalHours = totalBlocks / 2;
  const greenHours = greenBlocks / 2;
  const redHours = redBlocks / 2;
  return { totalHours, greenHours, redHours, greenPct: totalHours > 0 ? greenHours / totalHours : null };
}

function computeAllStats() {
  let totalHours = 0;
  let greenHours = 0;
  let redHours = 0;
  for (let week = 1; week <= 3; week++) {
    for (let day = 0; day < DAYS.length; day++) {
      const stats = computeDayStats(week, day);
      totalHours += stats.totalHours;
      greenHours += stats.greenHours;
      redHours += stats.redHours;
    }
  }
  return { totalHours, greenHours, redHours, greenPct: totalHours > 0 ? greenHours / totalHours : null };
}

function pctClass(value) {
  if (value === null || !Number.isFinite(value)) return "excel-neutral";
  if (value >= 0.7) return "excel-green";
  if (value >= 0.45) return "excel-yellow";
  return "excel-red";
}

function updateStatus(label, mode) {
  const pill = document.getElementById("saveStatus");
  pill.classList.toggle("error", mode === "error");
  pill.innerHTML = '<span class="save-dot"></span>' + label;
}

function updateLastSaved() {
  const savedAt = state.meta && state.meta.savedAt;
  document.getElementById("lastSavedLabel").textContent = savedAt ? new Date(savedAt).toLocaleString() : "Not saved yet";
  document.getElementById("storageModeLabel").textContent = serverAvailable ? "Website" : "Local fallback";
}

async function loadSavedState() {
  document.getElementById("stateKeyLabel").textContent = stateKey;
  updateStatus("Loading", "normal");
  try {
    const response = await fetch(API_URL + "?key=" + encodeURIComponent(stateKey), { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Save function returned " + response.status);
    const payload = await response.json();
    if (payload && payload.state) {
      state = mergeState(payload.state);
    } else {
      const local = localStorage.getItem(localStorageKey);
      state = local ? mergeState(JSON.parse(local)) : createDefaultState();
    }
    serverAvailable = true;
    updateStatus("Loaded", "normal");
  } catch (error) {
    serverAvailable = false;
    try {
      const local = localStorage.getItem(localStorageKey);
      state = local ? mergeState(JSON.parse(local)) : createDefaultState();
    } catch (localError) {
      state = createDefaultState();
    }
    updateStatus("Local only", "error");
  }
  isLoading = false;
  renderAll();
  updateLastSaved();
}

function scheduleSave() {
  if (isLoading) return;
  localStorage.setItem(localStorageKey, JSON.stringify(state));
  window.clearTimeout(saveTimer);
  updateStatus(serverAvailable ? "Saving" : "Local only", serverAvailable ? "normal" : "error");
  saveTimer = window.setTimeout(saveState, 700);
}

async function saveState() {
  state.meta.updatedAt = new Date().toISOString();
  localStorage.setItem(localStorageKey, JSON.stringify(state));
  if (!serverAvailable) {
    updateStatus("Local only", "error");
    updateLastSaved();
    return;
  }
  try {
    const response = await fetch(API_URL + "?key=" + encodeURIComponent(stateKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
    if (!response.ok) throw new Error("Save failed with " + response.status);
    const payload = await response.json();
    if (payload && payload.savedAt) state.meta.savedAt = payload.savedAt;
    localStorage.setItem(localStorageKey, JSON.stringify(state));
    updateStatus("Saved", "normal");
  } catch (error) {
    serverAvailable = false;
    updateStatus("Local only", "error");
  }
  updateLastSaved();
}
