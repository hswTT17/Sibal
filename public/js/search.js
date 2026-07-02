import { fetchApps, formatKRW, getOwnedIds, categoryIcon, topCategories } from "./api.js";
import { initHeaderBell } from "./nav.js";

const searchInput = document.getElementById("searchInput");
const keywordRow = document.getElementById("keywordRow");
const categoryGrid = document.getElementById("categoryGrid");
const appList = document.getElementById("appList");
const listTitle = document.getElementById("listTitle");

const state = {
  apps: [],
  query: "",
  category: new URLSearchParams(location.search).get("cat") || null,
};

function matchesQuery(app, q) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return app.name.toLowerCase().includes(needle) || app.categories.some((c) => c.toLowerCase().includes(needle));
}

function renderList() {
  const filtered = state.apps
    .filter((a) => matchesQuery(a, state.query))
    .filter((a) => !state.category || a.categories.includes(state.category))
    .sort((a, b) => b.reviewCount - a.reviewCount);

  listTitle.textContent = state.query.trim()
    ? `"${state.query.trim()}" 검색 결과`
    : state.category
      ? `${categoryIcon(state.category)} ${state.category} 앱테크`
      : "추천 앱테크";

  const ownedIds = getOwnedIds();

  appList.innerHTML = "";
  if (filtered.length === 0) {
    appList.innerHTML = `<div class="empty-state">조건에 맞는 앱이 없어요.</div>`;
    return;
  }

  filtered.forEach((app, i) => {
    const isOwned = ownedIds.includes(app.id);
    const row = document.createElement("a");
    row.className = "app-list-row";
    row.href = `/app?id=${app.id}`;
    row.innerHTML = `
      <div class="app-icon">${app.iconEmoji}</div>
      <div class="app-list-row-body">
        <div class="app-list-row-title">
          <h3>${app.name}</h3>
          ${i === 0 && !state.query && !state.category ? `<span class="tag-recommend">추천</span>` : ""}
        </div>
        <div class="app-list-row-desc">${app.shortDescription}</div>
        <div class="app-list-row-meta">
          <span class="rating"><span class="material-symbols-outlined" style="font-size: 14px">star</span> ${app.rating.toFixed(1)}</span>
          <span>리뷰 ${app.reviewCount.toLocaleString("ko-KR")}</span>
          <span>${formatKRW(app.estimatedMonthlyIncomeKRW)}/월 예시</span>
        </div>
      </div>
      <span class="btn-pill ${isOwned ? "btn-pill--soft" : "btn-pill--primary"}">${isOwned ? "열기" : "받기"}</span>
    `;
    appList.appendChild(row);
  });
}

function renderKeywords() {
  const top = [...state.apps].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  keywordRow.innerHTML = "";
  top.forEach((app, i) => {
    const chip = document.createElement("button");
    chip.className = "keyword-chip";
    chip.innerHTML = `<span class="keyword-rank">${i + 1}.</span><span class="keyword-name">${app.name}</span>`;
    chip.addEventListener("click", () => {
      state.query = app.name;
      searchInput.value = app.name;
      renderList();
      document.getElementById("listTitle").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    keywordRow.appendChild(chip);
  });
}

function renderCategoryGrid() {
  const top = topCategories(state.apps, 5);
  categoryGrid.innerHTML = "";
  for (const category of top) {
    const btn = document.createElement("button");
    btn.className = "mission-item";
    const active = state.category === category;
    btn.innerHTML = `
      <span class="mission-icon" style="${active ? "background: var(--color-primary); color: #fff" : ""}">
        <span style="font-size: 26px">${categoryIcon(category)}</span>
      </span>
      <span class="mission-label">${category}</span>
    `;
    btn.addEventListener("click", () => {
      state.category = state.category === category ? null : category;
      renderCategoryGrid();
      renderList();
    });
    categoryGrid.appendChild(btn);
  }
}

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  renderList();
});

async function init() {
  initHeaderBell();
  const { apps } = await fetchApps();
  state.apps = apps;
  renderKeywords();
  renderCategoryGrid();
  renderList();
}

init();
