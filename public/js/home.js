import {
  fetchApps,
  formatKRW,
  formatKRWCompact,
  getOwnedIds,
  computeOwnedStats,
  categoryIcon,
  topCategories,
} from "./api.js";
import { initHeaderBell } from "./nav.js";

const heroCard = document.getElementById("heroCard");
const missionGrid = document.getElementById("missionGrid");
const promoRow = document.getElementById("promoRow");
const recommendedList = document.getElementById("recommendedList");

function renderHero(apps) {
  const ownedIds = getOwnedIds();
  const stats = computeOwnedStats(apps, ownedIds);
  const dailyEstimate = Math.round(stats.ownedMonthly / 30);
  const pct = stats.totalCount ? Math.round((stats.ownedCount / stats.totalCount) * 100) : 0;

  if (stats.ownedCount === 0) {
    heroCard.innerHTML = `
      <span class="hero-label">오늘 예상 수익</span>
      <div class="hero-value">₩0</div>
      <p class="hero-caption">
        <a href="/benefits.html">내 혜택 조회</a>에서 이미 쓰고 있는 앱테크 앱을 체크하면, 오늘의 예상 적립액을 보여드려요.
      </p>
    `;
    return;
  }

  heroCard.innerHTML = `
    <span class="hero-label">오늘 예상 수익</span>
    <div class="hero-value-row">
      <span class="hero-value">${formatKRWCompact(dailyEstimate)}</span>
      <span class="hero-subvalue">예시 수치</span>
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

function renderMissionGrid(apps) {
  const top = topCategories(apps, 8);
  missionGrid.innerHTML = "";
  for (const category of top) {
    const btn = document.createElement("a");
    btn.className = "mission-item";
    btn.href = `/search?cat=${encodeURIComponent(category)}`;
    btn.innerHTML = `
      <span class="mission-icon"><span style="font-size: 26px">${categoryIcon(category)}</span></span>
      <span class="mission-label">${category}</span>
    `;
    missionGrid.appendChild(btn);
  }
}

const PROMO_VARIANTS = ["promo-card--primary", "promo-card--success", "promo-card--neutral"];

function renderPromoRow(apps) {
  const top = [...apps].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 3);
  promoRow.innerHTML = "";
  top.forEach((app, i) => {
    const card = document.createElement("a");
    card.className = `promo-card ${PROMO_VARIANTS[i % PROMO_VARIANTS.length]}`;
    card.href = `/app?id=${app.id}`;
    card.innerHTML = `
      <span class="promo-badge">${categoryIcon(app.categories[0])} ${app.categories[0]}</span>
      <p class="promo-title">${app.name}</p>
      <p class="promo-subtitle">★ ${app.rating.toFixed(1)} · 리뷰 ${app.reviewCount.toLocaleString("ko-KR")}</p>
    `;
    promoRow.appendChild(card);
  });
}

function renderRecommendedList(apps) {
  const stats = computeOwnedStats(apps, getOwnedIds());
  const top = stats.notOwned.slice(0, 5);

  recommendedList.innerHTML = "";
  if (top.length === 0) {
    recommendedList.innerHTML = `<div class="empty-state">이미 모든 앱을 사용 중이에요! 🎉</div>`;
    return;
  }
  for (const app of top) {
    const row = document.createElement("a");
    row.className = "app-list-row";
    row.href = `/app?id=${app.id}`;
    row.innerHTML = `
      <div class="app-icon">${app.iconEmoji}</div>
      <div class="app-list-row-body">
        <div class="app-list-row-title"><h3>${app.name}</h3></div>
        <div class="app-list-row-desc">${app.shortDescription}</div>
        <div class="app-list-row-meta">
          <span class="rating"><span class="material-symbols-outlined" style="font-size: 14px">star</span> ${app.rating.toFixed(1)}</span>
          <span>${formatKRW(app.estimatedMonthlyIncomeKRW)}/월 예시</span>
        </div>
      </div>
      <span class="btn-pill btn-pill--primary">보기</span>
    `;
    recommendedList.appendChild(row);
  }
}

async function init() {
  initHeaderBell();
  const { apps } = await fetchApps();
  renderHero(apps);
  renderMissionGrid(apps);
  renderPromoRow(apps);
  renderRecommendedList(apps);
}

init();
