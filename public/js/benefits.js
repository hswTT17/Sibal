import { fetchApps, formatKRW } from "./api.js";

const STORAGE_KEY = "ownedAppIds";

const checklistEl = document.getElementById("checklist");
const computeBtn = document.getElementById("computeBtn");
const resultsPanel = document.getElementById("resultsPanel");
const resultsTotal = document.getElementById("resultsTotal");
const resultsList = document.getElementById("resultsList");

let apps = [];

function getOwnedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function setOwnedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function renderChecklist() {
  const ownedIds = getOwnedIds();
  checklistEl.innerHTML = "";
  for (const app of apps) {
    const row = document.createElement("label");
    row.className = "checklist-row";
    row.innerHTML = `
      <input type="checkbox" data-id="${app.id}" ${ownedIds.includes(app.id) ? "checked" : ""} />
      <span class="checklist-icon">${app.iconEmoji}</span>
      <span class="checklist-name">${app.name}</span>
      <span class="checklist-categories">${app.categories.join(", ")}</span>
    `;
    const checkbox = row.querySelector("input");
    checkbox.addEventListener("change", () => {
      const current = getOwnedIds();
      if (checkbox.checked) {
        setOwnedIds([...new Set([...current, app.id])]);
      } else {
        setOwnedIds(current.filter((id) => id !== app.id));
      }
    });
    checklistEl.appendChild(row);
  }
}

function computeRecommendations(allApps, ownedIds) {
  const notOwned = allApps.filter((a) => !ownedIds.includes(a.id));
  const sorted = [...notOwned].sort(
    (a, b) => b.estimatedMonthlyIncomeKRW - a.estimatedMonthlyIncomeKRW
  );
  const total = sorted.reduce((sum, a) => sum + a.estimatedMonthlyIncomeKRW, 0);
  return { sorted, total };
}

function renderResults() {
  const ownedIds = getOwnedIds();
  const { sorted, total } = computeRecommendations(apps, ownedIds);

  resultsTotal.textContent = `${formatKRW(total)}/월`;
  resultsList.innerHTML = "";

  if (sorted.length === 0) {
    resultsList.innerHTML = `<div class="empty-state">이미 모든 앱을 사용 중이에요! 🎉</div>`;
  } else {
    for (const app of sorted) {
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

  resultsPanel.classList.remove("hidden");
}

computeBtn.addEventListener("click", renderResults);

async function init() {
  const data = await fetchApps();
  apps = data.apps;
  renderChecklist();
}

init();
