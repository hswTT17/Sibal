import { fetchApps, formatKRW, categoryIcon } from "./api.js";
import { initHeaderBell } from "./nav.js";

const heroCard = document.getElementById("heroCard");
const filterRow = document.getElementById("filterRow");
const eventGrid = document.getElementById("eventGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const PAGE_SIZE = 6;

const FILTERS = [
  { key: "all", label: "전체", sort: (a, b) => b.reviewCount - a.reviewCount },
  { key: "income", label: "고수익", sort: (a, b) => b.estimatedMonthlyIncomeKRW - a.estimatedMonthlyIncomeKRW },
  { key: "rating", label: "평점높은", sort: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount },
  { key: "reviews", label: "리뷰많은", sort: (a, b) => b.reviewCount - a.reviewCount },
];

const state = {
  apps: [],
  filterKey: "all",
  visibleCount: PAGE_SIZE,
};

function renderHero(apps) {
  heroCard.innerHTML = `
    <span class="promo-badge">인기 혜택</span>
    <p class="promo-title" style="font-size: 22px">지금 가장 인기 있는 앱테크 혜택</p>
    <p class="promo-subtitle">현재 ${apps.length}개 앱의 혜택을 확인해보세요.</p>
  `;
}

function renderFilters() {
  filterRow.innerHTML = "";
  for (const f of FILTERS) {
    const btn = document.createElement("button");
    btn.className = "chip" + (state.filterKey === f.key ? " active" : "");
    btn.textContent = f.label;
    btn.addEventListener("click", () => {
      state.filterKey = f.key;
      state.visibleCount = PAGE_SIZE;
      renderFilters();
      renderGrid();
    });
    filterRow.appendChild(btn);
  }
}

function renderGrid() {
  const filter = FILTERS.find((f) => f.key === state.filterKey);
  const sorted = [...state.apps].sort(filter.sort);
  const visible = sorted.slice(0, state.visibleCount);

  eventGrid.innerHTML = "";
  for (const app of visible) {
    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <div class="event-card-top">
        <div class="event-card-icon">${app.iconEmoji}</div>
        <span class="event-card-badge">★ ${app.rating.toFixed(1)}</span>
      </div>
      <div>
        <h3 class="event-card-title">${app.name}</h3>
        <p class="event-card-brand">${app.shortDescription}</p>
      </div>
      <div class="event-card-tags">
        ${app.categories
          .slice(0, 2)
          .map((c) => `<span class="event-tag">${categoryIcon(c)} ${c}</span>`)
          .join("")}
      </div>
      <p class="app-list-row-meta" style="margin: 0">${formatKRW(app.estimatedMonthlyIncomeKRW)}/월 예시</p>
      <a href="/app?id=${app.id}" class="event-card-cta">
        자세히 보기 <span class="material-symbols-outlined" style="font-size: 18px">arrow_forward</span>
      </a>
    `;
    eventGrid.appendChild(card);
  }

  loadMoreBtn.style.display = state.visibleCount >= sorted.length ? "none" : "flex";
}

loadMoreBtn.addEventListener("click", () => {
  state.visibleCount += PAGE_SIZE;
  renderGrid();
});

async function init() {
  initHeaderBell();
  const { apps } = await fetchApps();
  state.apps = apps;
  renderHero(apps);
  renderFilters();
  renderGrid();
}

init();
