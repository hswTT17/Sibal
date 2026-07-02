import {
  fetchApps,
  formatKRW,
  formatKRWCompact,
  getOwnedIds,
  getOwnedRecords,
  setAppOwned,
  computeOwnedStats,
  computeCumulativeEstimate,
  computeTier,
  getActivityLog,
  getSystemAlerts,
  setSystemAlert,
  categoryIcon,
  timeAgoLabel,
} from "./api.js";
import { initHeaderBell } from "./nav.js";

const profileHeader = document.getElementById("profileHeader");
const statGrid = document.getElementById("statGrid");
const barChart = document.getElementById("barChart");
const favoriteGrid = document.getElementById("favoriteGrid");
const activityList = document.getElementById("activityList");
const activityMoreBtn = document.getElementById("activityMoreBtn");
const checklistEl = document.getElementById("checklistEl");
const checklistSearch = document.getElementById("checklistSearch");
const resultsList = document.getElementById("resultsList");
const reminderToggle = document.getElementById("reminderToggle");
const hotDealToggle = document.getElementById("hotDealToggle");

let apps = [];
let query = "";
let activityExpanded = false;

function matchesQuery(app, q) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return app.name.toLowerCase().includes(needle) || app.categories.some((c) => c.toLowerCase().includes(needle));
}

function renderProfile() {
  const ownedIds = getOwnedIds();
  const tier = computeTier(ownedIds.length);
  profileHeader.innerHTML = `
    <div class="profile-header-left">
      <div class="profile-avatar"><span class="material-symbols-outlined" style="font-size: 30px">person</span></div>
      <div>
        <p class="profile-name">나의 앱테크</p>
        <span class="profile-tier">${tier.emoji} ${tier.label} 등급</span>
      </div>
    </div>
    <a href="#alerts" class="profile-settings-btn" aria-label="설정">
      <span class="material-symbols-outlined">settings</span>
    </a>
  `;
}

function renderStats() {
  const stats = computeOwnedStats(apps, getOwnedIds());
  const dailyEstimate = Math.round(stats.ownedMonthly / 30);
  const cumulative = computeCumulativeEstimate(apps, getOwnedRecords());
  statGrid.innerHTML = `
    <div class="stat-card highlight">
      <div class="stat-card-label">오늘의 예상 수익</div>
      <div class="stat-card-value">${formatKRWCompact(dailyEstimate)}</div>
    </div>
    <div class="stat-card success">
      <div class="stat-card-label">이번 달 적립 중</div>
      <div class="stat-card-value">${formatKRWCompact(stats.ownedMonthly)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">누적 예상 수익</div>
      <div class="stat-card-value">${formatKRWCompact(cumulative)}</div>
    </div>
  `;
}

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

function renderBarChart() {
  const stats = computeOwnedStats(apps, getOwnedIds());
  const dailyEstimate = Math.round(stats.ownedMonthly / 30);
  const heightPct = stats.ownedMonthly > 0 ? 62 : 8;
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 .. Sun=6

  barChart.innerHTML = "";
  WEEK_DAYS.forEach((day, i) => {
    const isToday = i === todayIndex;
    const col = document.createElement("div");
    col.className = "bar-chart-col" + (isToday ? " bar-chart-col--today" : "");
    col.innerHTML = `
      <div class="bar-chart-fill" style="height: ${heightPct}%" title="${isToday ? formatKRWCompact(dailyEstimate) : ""}"></div>
      <span class="bar-chart-day">${day}</span>
    `;
    barChart.appendChild(col);
  });
}

function renderFavorites() {
  const owned = apps.filter((a) => getOwnedIds().includes(a.id)).slice(0, 7);
  favoriteGrid.innerHTML = "";
  for (const app of owned) {
    const item = document.createElement("a");
    item.className = "favorite-item";
    item.href = `/app?id=${app.id}`;
    item.innerHTML = `
      <span class="favorite-icon">${app.iconEmoji}</span>
      <span class="favorite-label">${app.name}</span>
    `;
    favoriteGrid.appendChild(item);
  }
  const addItem = document.createElement("a");
  addItem.className = "favorite-item";
  addItem.href = "#checklist";
  addItem.innerHTML = `
    <span class="favorite-icon add"><span class="material-symbols-outlined">add</span></span>
    <span class="favorite-label">추가</span>
  `;
  favoriteGrid.appendChild(addItem);
}

function renderActivity() {
  const log = getActivityLog();
  const visible = activityExpanded ? log : log.slice(0, 5);

  activityList.innerHTML = "";
  if (log.length === 0) {
    activityList.innerHTML = `<div class="empty-state">아직 활동 내역이 없어요. 아래 체크리스트에서 앱을 선택해보세요.</div>`;
    activityMoreBtn.style.display = "none";
    return;
  }

  for (const entry of visible) {
    const app = apps.find((a) => a.id === entry.appId);
    const row = document.createElement("div");
    row.className = "activity-row";
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px">
        <span class="activity-icon ${entry.action}">
          <span class="material-symbols-outlined" style="font-size: 18px">${entry.action === "add" ? "add_circle" : "remove_circle"}</span>
        </span>
        <div>
          <p class="activity-title">${entry.iconEmoji || ""} ${entry.appName} ${entry.action === "add" ? "사용 시작" : "체크 해제"}</p>
          <p class="activity-time">${timeAgoLabel(entry.ts)}</p>
        </div>
      </div>
      <span class="activity-tag ${entry.action}">
        ${entry.action === "add" && app ? `+ 예상 ${formatKRWCompact(app.estimatedMonthlyIncomeKRW)}/월` : "-"}
      </span>
    `;
    activityList.appendChild(row);
  }

  activityMoreBtn.style.display = log.length > 5 ? "block" : "none";
  activityMoreBtn.textContent = activityExpanded ? "접기" : "전체 활동 보기";
}

activityMoreBtn.addEventListener("click", () => {
  activityExpanded = !activityExpanded;
  renderActivity();
});

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
      setAppOwned(app, checkbox.checked);
      renderProfile();
      renderStats();
      renderBarChart();
      renderFavorites();
      renderActivity();
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

function renderAlerts() {
  const alerts = getSystemAlerts();
  reminderToggle.checked = alerts.rewardReminder;
  hotDealToggle.checked = alerts.hotDeal;
}

reminderToggle.addEventListener("change", async () => {
  setSystemAlert("rewardReminder", reminderToggle.checked);
  if (reminderToggle.checked && "Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
  initHeaderBell();
});

hotDealToggle.addEventListener("change", () => {
  setSystemAlert("hotDeal", hotDealToggle.checked);
  initHeaderBell();
});

checklistSearch.addEventListener("input", () => {
  query = checklistSearch.value;
  renderChecklist();
});

function focusHash() {
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function init() {
  initHeaderBell();
  const data = await fetchApps();
  apps = data.apps;
  renderProfile();
  renderStats();
  renderBarChart();
  renderFavorites();
  renderActivity();
  renderChecklist();
  renderResults();
  renderAlerts();
  focusHash();
}

init();
