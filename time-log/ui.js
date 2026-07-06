function renderAll() {
  renderSetup();
  renderTabs();
  renderDayEditor();
  renderSummary();
  renderNotes();
  renderGeniusGrid();
}

function renderSetup() {
  document.getElementById("personName").value = state.setup.personName || "";
  document.getElementById("incomeGoal").value = state.setup.incomeGoal || "";
  document.getElementById("weeksOff").value = state.setup.weeksOff || "";
  document.getElementById("hoursPerWeek").value = state.setup.hoursPerWeek || "";
  const workingWeeks = Math.max(0, 52 - Number(state.setup.weeksOff || 0));
  const totalHours = workingWeeks * Number(state.setup.hoursPerWeek || 0);
  document.getElementById("targetHourly").textContent = money(calculateTargetHourly()) + "/hr";
  document.getElementById("targetFormula").textContent = money(state.setup.incomeGoal || 0) + " / " + numberFmt(totalHours, 0) + " working hours";
}

function renderNotes() {
  document.getElementById("learningNotes").value = state.notes.learning || "";
  document.getElementById("actionNotes").value = state.notes.actions || "";
}

function renderTabs() {
  const weekTabs = document.getElementById("weekTabs");
  weekTabs.innerHTML = "";
  for (let week = 1; week <= 3; week++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-btn" + (week === currentWeek ? " active" : "");
    button.textContent = "Week " + week;
    button.addEventListener("click", () => { currentWeek = week; renderTabs(); renderDayEditor(); renderSummary(); });
    weekTabs.appendChild(button);
  }
  renderDayTabs();
}

function renderDayTabs() {
  const dayTabs = document.getElementById("dayTabs");
  dayTabs.innerHTML = "";
  for (let day = 0; day < DAYS.length; day++) {
    const stats = computeDayStats(currentWeek, day);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab-btn day-btn" + (day === currentDay ? " active" : "");
    button.innerHTML = DAYS[day].slice(0, 3) + '<span class="mini">' + numberFmt(stats.totalHours) + ' hrs, ' + pctFmt(stats.greenPct) + ' green</span>';
    button.addEventListener("click", () => { currentDay = day; renderTabs(); renderDayEditor(); });
    dayTabs.appendChild(button);
  }
}

function renderSummary() {
  const all = computeAllStats();
  document.getElementById("kpiTotalHours").textContent = numberFmt(all.totalHours);
  document.getElementById("kpiGreenHours").textContent = numberFmt(all.greenHours);
  const pct = document.getElementById("kpiGreenPct");
  pct.textContent = pctFmt(all.greenPct);
  pct.className = "kpi-value " + pctClass(all.greenPct);
  const cards = buildActivityCards();
  document.getElementById("kpiAboveLine").textContent = cards.filter(card => card.zone === "genius" || card.zone === "excellence").length;

  const table = document.getElementById("dailySummaryTable");
  const weekDays = DAYS.map((day, index) => ({ day, stats: computeDayStats(currentWeek, index) }));
  let html = "<thead><tr><th>Week " + currentWeek + " summary</th>" + weekDays.map(d => "<th>" + d.day + "</th>").join("") + "</tr></thead><tbody>";
  html += "<tr><td>Total Hours Logged</td>" + weekDays.map(d => "<td>" + numberFmt(d.stats.totalHours) + "</td>").join("") + "</tr>";
  html += "<tr><td>Total Daily Green Hours</td>" + weekDays.map(d => '<td class="excel-green">' + numberFmt(d.stats.greenHours) + "</td>").join("") + "</tr>";
  html += "<tr><td>Percentage of Green Hours</td>" + weekDays.map(d => '<td class="' + pctClass(d.stats.greenPct) + '">' + pctFmt(d.stats.greenPct) + "</td>").join("") + "</tr>";
  html += "</tbody>";
  table.innerHTML = html;
  renderDayTabs();
}

function renderDayEditor() {
  document.getElementById("dayEditorTitle").innerHTML = "Week " + currentWeek + ", " + DAYS[currentDay] + "<small>30-minute business-task blocks</small>";
  const tbody = document.getElementById("logTbody");
  tbody.innerHTML = "";
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const id = cellId(currentWeek, currentDay, slot);
    const entry = getEntry(id);
    const row = document.createElement("tr");
    row.dataset.cellId = id;
    setRowClass(row, entry);
    row.innerHTML = '<td class="time-cell">' + timeLabel(slot) + '</td>' +
      '<td><textarea class="activity-input" data-field="text" placeholder="Business task only"></textarea></td>' +
      '<td><select class="compact-select rg-select" data-field="roi"><option value="">Select</option><option value="G">G</option><option value="R">R</option></select></td>' +
      '<td><select class="compact-select" data-field="roe"><option value="">Energy</option><option value="high">High</option><option value="neutral">Neutral</option><option value="low">Low</option></select></td>' +
      '<td><select class="compact-select" data-field="result"><option value="">Results</option><option value="strong">Strong</option><option value="okay">Okay</option><option value="poor">Poor</option></select></td>';
    tbody.appendChild(row);
    row.querySelector('[data-field="text"]').value = entry.text || "";
    const roiSelect = row.querySelector('[data-field="roi"]');
    roiSelect.value = entry.roi || "";
    setSelectClass(roiSelect);
    row.querySelector('[data-field="roe"]').value = entry.roe || "";
    row.querySelector('[data-field="result"]').value = entry.result || "";
  }
}

function setRowClass(row, entry) {
  row.classList.remove("is-green", "is-red");
  if (entry.roi === "G") row.classList.add("is-green");
  if (entry.roi === "R") row.classList.add("is-red");
}

function setSelectClass(select) {
  if (!select.classList.contains("rg-select")) return;
  select.classList.toggle("is-g", select.value === "G");
  select.classList.toggle("is-r", select.value === "R");
}

document.addEventListener("input", event => {
  const target = event.target;
  if (["personName", "incomeGoal", "weeksOff", "hoursPerWeek"].includes(target.id)) {
    state.setup[target.id] = target.id === "personName" ? target.value : Number(target.value || 0);
    renderSetup();
    scheduleSave();
    return;
  }
  if (target.id === "learningNotes") {
    state.notes.learning = target.value;
    scheduleSave();
    return;
  }
  if (target.id === "actionNotes") {
    state.notes.actions = target.value;
    scheduleSave();
    return;
  }
  const field = target.dataset.field;
  if (field) {
    const row = target.closest("tr");
    const id = row.dataset.cellId;
    setEntryValue(id, field, target.value);
    const entry = getEntry(id);
    if (field === "text") {
      const roiSelect = row.querySelector('[data-field="roi"]');
      if (roiSelect.value !== entry.roi) roiSelect.value = entry.roi || "";
      setSelectClass(roiSelect);
    }
    setRowClass(row, entry);
    if (field === "roi") setSelectClass(target);
    renderSummary();
    renderGeniusGrid();
    scheduleSave();
  }
});

document.addEventListener("change", event => {
  const field = event.target.dataset.field;
  if (!field) return;
  const row = event.target.closest("tr");
  const id = row.dataset.cellId;
  setEntryValue(id, field, event.target.value);
  const entry = getEntry(id);
  setRowClass(row, entry);
  if (field === "roi") setSelectClass(event.target);
  renderSummary();
  renderGeniusGrid();
  scheduleSave();
});

document.getElementById("saveNowBtn").addEventListener("click", saveState);

document.getElementById("clearDayBtn").addEventListener("click", () => {
  if (!window.confirm("Clear all entries for Week " + currentWeek + ", " + DAYS[currentDay] + "?")) return;
  for (let slot = 0; slot < SLOT_COUNT; slot++) delete state.activities[cellId(currentWeek, currentDay, slot)];
  state.meta.updatedAt = new Date().toISOString();
  renderDayEditor();
  renderSummary();
  renderGeniusGrid();
  scheduleSave();
});

document.getElementById("resetGridBtn").addEventListener("click", () => {
  if (!window.confirm("Reset all manual Genius Grid moves and use the automatic logic again?")) return;
  state.manualZones = {};
  state.zoneOrder = { genius: [], excellence: [], competence: [], incompetence: [] };
  state.meta.updatedAt = new Date().toISOString();
  renderGeniusGrid();
  renderSummary();
  scheduleSave();
});

window.addEventListener("beforeunload", () => {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
    if (serverAvailable && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
      navigator.sendBeacon(API_URL + "?key=" + encodeURIComponent(stateKey), blob);
    }
  } catch (error) {}
});

loadSavedState();
