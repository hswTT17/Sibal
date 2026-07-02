import {
  fetchApps,
  formatKRW,
  formatKRWCompact,
  getOwnedIds,
  computeOwnedStats,
  categoryIcon,
} from "./api.js";

const state = {
  apps: [],
  categories: [],
  activeCategory: "전체",
  activeTab: "popularity", // popularity | rating | reviews
  query: "",
};

const chipRow = document.getElementById("chipRow");
const cardGrid = document.getElementById("cardGrid");
const rankingTitle = document.getElementById("rankingTitle");
const tabButtons = document.querySelectorAll(".tab");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalContent = document.getElementById("modalContent");
const heroCard = document.getElementById("heroCard");
const categoryIconGrid = document.getElementById("categoryIconGrid");
const recommendedRow = document.getElementById("recommendedRow");
const searchInputs = [document.getElementById("desktopSearch"), document.getElementById("mobileSearch")].filter(
  Boolean
);

function sortApps(apps, tab) {
  const copy = [...apps];
  if (tab === "rating") {
    return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }
  if (tab === "reviews") {
    return copy.sort((a, b) => b.reviewCount - a.reviewCount);
  }
  // "popularity" — Play Store install counts aren't reliably sortable as
  // strings (e.g. "1000만+" vs "500만+"), so review count is used as a
  // popularity proxy, same as the "reviews" tab but not sliced identically
  // since category filtering happens before the slice in render().
  return copy.sort((a, b) => b.reviewCount - a.reviewCount);
}

function matchesQuery(app, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return app.name.toLowerCase().includes(q) || app.categories.some((c) => c.toLowerCase().includes(q));
}

function renderHero() {
  const ownedIds = getOwnedIds();
  const stats = computeOwnedStats(state.apps, ownedIds);
  const dailyEstimate = Math.round(stats.ownedMonthly / 30);
  const pct = stats.totalCount ? Math.round((stats.ownedCount / stats.totalCount) * 100) : 0;

  if (stats.ownedCount === 0) {
    heroCard.innerHTML = `
      <span class="hero-badge">✨ Daily Prosperity</span>
      <h1 class="hero-title">아직 등록된 내 앱이 없어요</h1>
      <p class="hero-caption">
        <a href="/benefits.html">내 혜택 조회</a>에서 이미 쓰고 있는 앱테크 앱을 체크하면, 오늘의 예상 적립액을 보여드려요.
      </p>
    `;
    return;
  }

  heroCard.innerHTML = `
    <span class="hero-badge">✨ Daily Prosperity</span>
    <h1 class="hero-title">오늘의 예상 적립액</h1>
    <div class="hero-value-row">
      <span class="hero-value">${formatKRWCompact(dailyEstimate)}</span>
      <span class="hero-subvalue">이번 달 약 ${formatKRWCompact(stats.ownedMonthly)} 적립 중 · 예시 수치</span>
    </div>
    <div class="hero-progress">
      <div class="hero-progress-labels">
        <span>사용 중인 앱 ${stats.ownedCount}/${stats.totalCount}</span>
        <span>${pct}%</span>
      </div>
      <div class="hero-progress-track">
        <div class="hero-progress-fill" style="width: ${pct}%"></div>
      </div>
    </div>
    <p class="hero-caption">
      아직 안 쓰는 앱에서 약 ${formatKRWCompact(stats.missingMonthly)} 더 받을 수 있어요.
      <a href="/benefits.html">내 혜택 자세히 보기 →</a>
    </p>
  `;
}

function renderRecommended() {
  const ownedIds = getOwnedIds();
  const stats = computeOwnedStats(state.apps, ownedIds);
  const top = stats.notOwned.slice(0, 6);

  recommendedRow.innerHTML = "";
  if (top.length === 0) {
    recommendedRow.innerHTML = `<div class="empty-state">이미 모든 앱을 사용 중이에요! 🎉</div>`;
    return;
  }
  for (const app of top) {
    recommendedRow.appendChild(buildAppCard(app));
  }
}

function buildAppCard(app) {
  const card = document.createElement("button");
  card.className = "app-card";
  card.innerHTML = `
    <div class="app-card-top">
      <div class="app-icon">${app.iconEmoji}</div>
      <div>
        <p class="app-name">${app.name}</p>
        <div class="app-rating">★ ${app.rating.toFixed(1)} · 리뷰 ${app.reviewCount.toLocaleString("ko-KR")}</div>
      </div>
    </div>
    <div class="app-categories">
      ${app.categories.map((c) => `<span class="category-pill">${categoryIcon(c)} ${c}</span>`).join("")}
    </div>
    <div class="app-income">${formatKRW(app.estimatedMonthlyIncomeKRW)}/월 <span class="sample-badge">예시</span></div>
    <div class="app-meta">
      <span>설치 ${app.installsLabel}</span>
    </div>
  `;
  card.addEventListener("click", () => openModal(app));
  return card;
}

function render() {
  const filtered = state.apps
    .filter((a) => state.activeCategory === "전체" || a.categories.includes(state.activeCategory))
    .filter((a) => matchesQuery(a, state.query));

  const sorted = sortApps(filtered, state.activeTab);
  const isSearching = state.query.trim().length > 0;
  const list = isSearching ? sorted : sorted.slice(0, 10);

  rankingTitle.textContent = isSearching ? `"${state.query.trim()}" 검색 결과` : "인기 앱 랭킹";

  cardGrid.innerHTML = "";
  if (list.length === 0) {
    cardGrid.innerHTML = `<div class="empty-state">조건에 맞는 앱이 아직 없어요.</div>`;
    return;
  }

  for (const app of list) {
    cardGrid.appendChild(buildAppCard(app));
  }
}

function openModal(app) {
  const stats = computeOwnedStats(state.apps, getOwnedIds());
  const isOwned = getOwnedIds().includes(app.id);

  modalContent.innerHTML = `
    <div class="modal-header">
      <div class="modal-header-info">
        <div class="app-icon">${app.iconEmoji}</div>
        <div>
          <h2>${app.name}</h2>
          <div class="app-rating">★ ${app.rating.toFixed(1)} · 설치 ${app.installsLabel}</div>
        </div>
      </div>
      <button class="modal-close" id="modalCloseBtn">✕</button>
    </div>
    <p class="modal-desc">${app.shortDescription}</p>

    <div class="modal-stat-row">
      <div>
        <div class="modal-stat-label">예상 월수익</div>
        <div class="modal-stat-value">${formatKRWCompact(app.estimatedMonthlyIncomeKRW)}</div>
      </div>
      <div>
        <div class="modal-stat-label">평점</div>
        <div class="modal-stat-value">★ ${app.rating.toFixed(1)}</div>
      </div>
      <div>
        <div class="modal-stat-label">리뷰수</div>
        <div class="modal-stat-value">${app.reviewCount.toLocaleString("ko-KR")}</div>
      </div>
    </div>

    <div class="app-categories">
      ${app.categories.map((c) => `<span class="category-pill">${categoryIcon(c)} ${c}</span>`).join("")}
      ${isOwned ? `<span class="category-pill">✅ 사용 중</span>` : ""}
    </div>

    <div class="modal-section-title">적립 방법</div>
    <ol class="modal-steps">
      ${app.howToEarn
        .map((step, i) => `<li><span class="modal-step-num">${i + 1}</span><span>${step}</span></li>`)
        .join("")}
    </ol>

    <div class="modal-section-title">추천인 안내</div>
    <div class="modal-referral">🤝 ${app.referralNote}</div>

    <div class="modal-disclaimer">⚠️ 위 정보는 실제 검증되지 않은 샘플 데이터입니다.</div>

    <a href="${app.joinUrl}" class="modal-cta" aria-disabled="true">링크 준비중</a>
  `;
  modalBackdrop.classList.remove("hidden");
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
}

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.activeTab = btn.dataset.tab;
    render();
  });
});

function renderChips() {
  const chips = ["전체", ...state.categories];
  chipRow.innerHTML = "";
  for (const category of chips) {
    const chip = document.createElement("button");
    chip.className = "chip" + (category === state.activeCategory ? " active" : "");
    chip.textContent = category === "전체" ? category : `${categoryIcon(category)} ${category}`;
    chip.addEventListener("click", () => selectCategory(category));
    chipRow.appendChild(chip);
  }
}

function selectCategory(category) {
  state.activeCategory = category;
  renderChips();
  render();
  document.getElementById("rankingSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCategoryIconGrid() {
  const counts = new Map();
  for (const app of state.apps) {
    for (const c of app.categories) {
      counts.set(c, (counts.get(c) || 0) + 1);
    }
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category]) => category);

  categoryIconGrid.innerHTML = "";
  for (const category of top) {
    const btn = document.createElement("button");
    btn.className = "category-icon-btn";
    btn.innerHTML = `
      <span class="category-icon-emoji">${categoryIcon(category)}</span>
      <span class="category-icon-label">${category}</span>
    `;
    btn.addEventListener("click", () => selectCategory(category));
    categoryIconGrid.appendChild(btn);
  }
}

function syncSearchInputs(value) {
  for (const input of searchInputs) {
    if (input.value !== value) input.value = value;
  }
}

function bindSearch() {
  for (const input of searchInputs) {
    input.addEventListener("input", () => {
      state.query = input.value;
      syncSearchInputs(input.value);
      render();
    });
  }
}

function focusSearchFromHash() {
  if (window.location.hash === "#search" && searchInputs.length > 0) {
    const visible = searchInputs.find((el) => el.offsetParent !== null) || searchInputs[0];
    visible.focus();
    document.getElementById("search").scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

async function init() {
  const { apps } = await fetchApps();
  state.apps = apps;
  state.categories = [...new Set(apps.flatMap((a) => a.categories))].sort();
  renderChips();
  renderCategoryIconGrid();
  renderHero();
  renderRecommended();
  render();
  bindSearch();
  focusSearchFromHash();
}

init();
