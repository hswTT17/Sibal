import {
  fetchApps,
  formatKRW,
  formatKRWCompact,
  getOwnedIds,
  setOwnedIds,
  computeOwnedStats,
  categoryIcon,
} from "./api.js";

const checklistEl = document.getElementById("checklist");
const statGrid = document.getElementById("statGrid");
const resultsList = document.getElementById("resultsList");
const searchInputs = [document.getElementById("desktopSearch"), document.getElementById("mobileSearch")].filter(
  Boolean
);

let apps = [];
let query = "";

function matchesQuery(app, q) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return app.name.toLowerCase().includes(needle) || app.categories.some((c) => c.toLowerCase().includes(needle));
}

function renderStats() {
  const stats = computeOwnedStats(apps, getOwnedIds());
  statGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-label">사용 중인 앱</div>
      <div class="stat-card-value">${stats.ownedCount}/${stats.totalCount}개</div>
    </div>
    <div class="stat-card success">
      <div class="stat-card-label">이번 달 적립 중</div>
      <div class="stat-card-value">${formatKRWCompact(stats.ownedMonthly)}</div>
    </div>
    <div class="stat-card highlight">
      <div class="stat-card-label">놓치고 있는 예상 수익</div>
      <div class="stat-card-value">${formatKRWCompact(stats.missingMonthly)}</div>
    </div>
  `;
}

function renderChecklist() {
  const ownedIds = getOwnedIds();
  const filtered = apps.filter((app) => matchesQuery(app, query));

  checklistEl.innerHTML = "";
  if (filtered.length === 0) {
    checklistEl.innerHTML = `<div class="empty-state">검색 결과가 없어요.</div>`;
    return;
  }

  for (const app of filtered) {
    const row = document.createElement("label");
    row.className = "checklist-row";
    const checked = ownedIds.includes(app.id);
    row.innerHTML = `
      <span class="checklist-icon">${app.iconEmoji}</span>
      <span class="checklist-name">${app.name}</span>
      <span class="checklist-categories">${app.categories.map((c) => categoryIcon(c)).join(" ")} ${app.categories.join(", ")}</span>
      <span class="switch">
        <input type="checkbox" data-id="${app.id}" ${checked ? "checked" : ""} />
        <span class="switch-track"></span>
        <span class="switch-thumb"></span>
      </span>
    `;
    const checkbox = row.querySelector("input");
    checkbox.addEventListener("change", () => {
      const current = getOwnedIds();
      if (checkbox.checked) {
        setOwnedIds([...new Set([...current, app.id])]);
      } else {
        setOwnedIds(current.filter((id) => id !== app.id));
      }
      renderStats();
      renderResults();
    });
    checklistEl.appendChild(row);
  }
}

function renderResults() {
  const stats = computeOwnedStats(apps, getOwnedIds());

  resultsList.innerHTML = "";
  if (stats.notOwned.length === 0) {
    resultsList.innerHTML = `<div class="empty-state">이미 모든 앱을 사용 중이에요! 🎉</div>`;
    return;
  }
  for (const app of stats.notOwned) {
    const row = document.createElement("div");
    row.className = "results-row";
    row.innerHTML = `
      <span class="checklist-icon">${app.iconEmoji}</span>
      <span class="checklist-name">${app.name}</span>
      <span class="income">${formatKRW(app.estimatedMonthlyIncomeKRW)}/월</span>
      <span class="reason">아직 사용하지 않는 ${app.categories[0]} 앱이에요</span>
    `;
    resultsList.appendChild(row);
  }
}

function bindSearch() {
  for (const input of searchInputs) {
    input.addEventListener("input", () => {
      query = input.value;
      for (const other of searchInputs) {
        if (other !== input && other.value !== query) other.value = query;
      }
      renderChecklist();
    });
  }
}

async function init() {
  const data = await fetchApps();
  apps = data.apps;
  renderStats();
  renderChecklist();
  renderResults();
  bindSearch();
}

init();
