function normalizeActivity(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?]+$/g, "");
}

function hashText(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash) + text.charCodeAt(i);
  return (hash >>> 0).toString(36);
}

function scoreROE(value) {
  if (value === "high") return 3;
  if (value === "neutral") return 2;
  if (value === "low") return 1;
  return 0;
}

function scoreResult(value) {
  if (value === "strong") return 3;
  if (value === "okay") return 2;
  if (value === "poor") return 1;
  return 0;
}

function labelFromScore(avg, type) {
  if (!avg) return "unknown";
  if (type === "roe") {
    if (avg >= 2.5) return "high";
    if (avg >= 1.75) return "neutral";
    return "low";
  }
  if (avg >= 2.5) return "strong";
  if (avg >= 1.5) return "okay";
  return "poor";
}

function buildActivityCards() {
  const groups = new Map();
  for (let week = 1; week <= 3; week++) {
    for (let day = 0; day < DAYS.length; day++) {
      for (let slot = 0; slot < SLOT_COUNT; slot++) {
        const entry = getEntry(cellId(week, day, slot));
        const text = String(entry.text || "").trim();
        if (!text) continue;
        const norm = normalizeActivity(text);
        if (!groups.has(norm)) {
          groups.set(norm, { id: "act_" + hashText(norm), title: text, hours: 0, green: 0, red: 0, suggested: "", roeScores: [], resultScores: [] });
        }
        const group = groups.get(norm);
        group.hours += 0.5;
        const roi = entry.roi || suggestROI(text);
        if (roi === "G") group.green += 1;
        if (roi === "R") group.red += 1;
        if (!entry.roi && roi) group.suggested = roi;
        const roeScore = scoreROE(entry.roe);
        if (roeScore) group.roeScores.push(roeScore);
        const resultScore = scoreResult(entry.result);
        if (resultScore) group.resultScores.push(resultScore);
      }
    }
  }
  return Array.from(groups.values()).map(group => {
    const roi = group.green > group.red ? "G" : group.red > group.green ? "R" : group.suggested;
    const roeAvg = group.roeScores.length ? group.roeScores.reduce((a, b) => a + b, 0) / group.roeScores.length : 0;
    const resultAvg = group.resultScores.length ? group.resultScores.reduce((a, b) => a + b, 0) / group.resultScores.length : 0;
    const roe = labelFromScore(roeAvg, "roe");
    const result = labelFromScore(resultAvg, "result");
    const autoZone = autoZoneFor(roi, roe, result);
    const manualZone = state.manualZones[group.id];
    return Object.assign(group, { roi, roe, result, autoZone, manualZone, zone: manualZone || autoZone, flags: flagsFor(roi, roe, result, group) });
  });
}

function autoZoneFor(roi, roe, result) {
  if (roi === "G") {
    if (roe === "high") return "genius";
    if (roe === "low") return "competence";
    return "excellence";
  }
  if (roi === "R") {
    if (roe === "low" && (result === "poor" || result === "unknown")) return "incompetence";
    return "competence";
  }
  if (roe === "high" || roe === "neutral") return "excellence";
  return "competence";
}

function flagsFor(roi, roe, result, group) {
  const flags = [];
  if (!roi) flags.push("Needs ROI rating. Choose G or R from the time log.");
  if (roe === "unknown") flags.push("Needs ROE rating. Choose high, neutral, or low energy.");
  if (roi === "G" && roe === "low") flags.push("High ROI / low ROE: delegate it or redesign the execution so it creates energy.");
  if (roi === "R" && (roe === "high" || roe === "neutral")) flags.push("Low ROI / positive ROE: increase the payoff or accept the income tradeoff consciously.");
  if (roi === "R" && roe === "low" && (result === "poor" || result === "unknown")) flags.push("Low ROI / low ROE: avoid, delegate, or remove this first.");
  if (group.suggested && !group.green && !group.red) flags.push("ROI was suggested from keywords. Override it if the suggestion is wrong.");
  return flags;
}

function syncZoneOrder(cards) {
  const byId = new Map(cards.map(card => [card.id, card]));
  ZONES.forEach(zone => {
    const existing = Array.isArray(state.zoneOrder[zone]) ? state.zoneOrder[zone] : [];
    state.zoneOrder[zone] = existing.filter(id => byId.has(id) && byId.get(id).zone === zone);
  });
  cards.forEach(card => {
    if (!state.zoneOrder[card.zone]) state.zoneOrder[card.zone] = [];
    if (!state.zoneOrder[card.zone].includes(card.id)) state.zoneOrder[card.zone].push(card.id);
  });
}

function orderedCardsForZone(cards, zone) {
  const byId = new Map(cards.filter(card => card.zone === zone).map(card => [card.id, card]));
  const order = state.zoneOrder[zone] || [];
  const ordered = order.map(id => byId.get(id)).filter(Boolean);
  const missing = Array.from(byId.values()).filter(card => !order.includes(card.id));
  missing.sort((a, b) => b.hours - a.hours || a.title.localeCompare(b.title));
  return ordered.concat(missing);
}

function renderGeniusGrid() {
  const cards = buildActivityCards();
  syncZoneOrder(cards);
  ZONES.forEach(zone => {
    const body = document.getElementById("zone-" + zone);
    body.innerHTML = "";
    const zoneCards = orderedCardsForZone(cards, zone);
    if (!zoneCards.length) {
      const empty = document.createElement("div");
      empty.className = "empty-zone";
      empty.textContent = "No activities here yet.";
      body.appendChild(empty);
    } else {
      zoneCards.forEach(card => body.appendChild(renderCard(card)));
    }
  });
  renderTopLists(cards);
  wireDragZones();
}

function renderCard(card) {
  const el = document.createElement("article");
  el.className = "grid-card" + (card.manualZone ? " is-manual" : "");
  el.draggable = true;
  el.dataset.cardId = card.id;
  el.innerHTML = '<h4>' + escapeHTML(card.title) + '</h4>' +
    '<div class="card-meta">' +
    '<span class="chip">' + numberFmt(card.hours) + ' hrs</span>' +
    '<span class="chip ' + (card.roi === "G" ? "green" : card.roi === "R" ? "red" : "yellow") + '">ROI ' + (card.roi || "?") + '</span>' +
    '<span class="chip ' + (card.roe === "high" ? "green" : card.roe === "low" ? "red" : "yellow") + '">ROE ' + titleCase(card.roe) + '</span>' +
    '<span class="chip">' + titleCase(card.result) + ' results</span>' +
    '</div>' +
    (card.flags.length ? '<div class="flag">' + escapeHTML(card.flags[0]) + '</div>' : '') +
    '<div class="card-actions"><select class="move-select" aria-label="Move activity"><option value="">Move to</option><option value="genius">Genius</option><option value="excellence">Excellence</option><option value="competence">Competence</option><option value="incompetence">Incompetence</option></select>' +
    (card.manualZone ? '<button type="button" class="mini-button auto-card">Auto</button>' : '<span class="chip">Auto</span>') + '</div>';
  el.addEventListener("dragstart", event => {
    draggedCardId = card.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
  });
  el.addEventListener("dragover", event => event.preventDefault());
  el.addEventListener("drop", event => {
    event.preventDefault();
    const dragged = event.dataTransfer.getData("text/plain") || draggedCardId;
    const targetZone = el.closest(".zone").dataset.zone;
    moveCard(dragged, targetZone, card.id);
  });
  el.querySelector(".move-select").addEventListener("change", event => {
    if (event.target.value) moveCard(card.id, event.target.value, null);
  });
  const auto = el.querySelector(".auto-card");
  if (auto) auto.addEventListener("click", () => resetCardToAuto(card.id));
  return el;
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function titleCase(value) {
  if (!value || value === "unknown") return "Unknown";
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function wireDragZones() {
  document.querySelectorAll(".zone-body").forEach(body => {
    body.addEventListener("dragover", event => { event.preventDefault(); body.classList.add("drag-over"); });
    body.addEventListener("dragleave", () => body.classList.remove("drag-over"));
    body.addEventListener("drop", event => {
      event.preventDefault();
      body.classList.remove("drag-over");
      const id = event.dataTransfer.getData("text/plain") || draggedCardId;
      const zone = body.closest(".zone").dataset.zone;
      moveCard(id, zone, null);
    });
  });
}

function moveCard(cardId, zone, beforeId) {
  if (!cardId || !ZONES.includes(zone)) return;
  state.manualZones[cardId] = zone;
  ZONES.forEach(z => { state.zoneOrder[z] = (state.zoneOrder[z] || []).filter(id => id !== cardId); });
  if (!state.zoneOrder[zone]) state.zoneOrder[zone] = [];
  if (beforeId && beforeId !== cardId) {
    const index = state.zoneOrder[zone].indexOf(beforeId);
    if (index >= 0) state.zoneOrder[zone].splice(index, 0, cardId);
    else state.zoneOrder[zone].push(cardId);
  } else {
    state.zoneOrder[zone].push(cardId);
  }
  state.meta.updatedAt = new Date().toISOString();
  renderGeniusGrid();
  renderSummary();
  scheduleSave();
}

function resetCardToAuto(cardId) {
  delete state.manualZones[cardId];
  ZONES.forEach(z => { state.zoneOrder[z] = (state.zoneOrder[z] || []).filter(id => id !== cardId); });
  state.meta.updatedAt = new Date().toISOString();
  renderGeniusGrid();
  renderSummary();
  scheduleSave();
}

function renderTopLists(cards) {
  const doMore = orderedCardsForZone(cards, "genius").concat(orderedCardsForZone(cards, "excellence")).slice(0, 5);
  const avoid = orderedCardsForZone(cards, "incompetence").concat(orderedCardsForZone(cards, "competence")).slice(0, 5);
  fillTopList("topDoMore", doMore);
  fillTopList("topAvoid", avoid);
}

function fillTopList(id, items) {
  const list = document.getElementById(id);
  list.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "No activities yet.";
    list.appendChild(li);
    return;
  }
  items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = '<strong>' + escapeHTML(item.title) + '</strong><span>' + numberFmt(item.hours) + ' hrs, ' + titleCase(item.zone) + '</span>';
    list.appendChild(li);
  });
}
