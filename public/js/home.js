import { fetchApps, formatKRW } from "./api.js";

const state = {
  apps: [],
  categories: [],
  activeCategory: "전체",
  activeTab: "popularity", // popularity | rating | reviews
};

const chipRow = document.getElementById("chipRow");
const cardGrid = document.getElementById("cardGrid");
const tabButtons = document.querySelectorAll(".tab");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalContent = document.getElementById("modalContent");

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

function render() {
  const filtered =
    state.activeCategory === "전체"
      ? state.apps
      : state.apps.filter((a) => a.categories.includes(state.activeCategory));

  const sorted = sortApps(filtered, state.activeTab).slice(0, 10);

  cardGrid.innerHTML = "";
  if (sorted.length === 0) {
    cardGrid.innerHTML = `<div class="empty-state">해당 카테고리의 앱이 아직 없어요.</div>`;
    return;
  }

  for (const app of sorted) {
    const card = document.createElement("button");
    card.className = "app-card";
    card.innerHTML = `
      <div class="app-card-top">
        <div class="app-icon">${app.iconEmoji}</div>
        <p class="app-name">${app.name}</p>
      </div>
      <div class="app-categories">
        ${app.categories.map((c) => `<span class="category-pill">${c}</span>`).join("")}
      </div>
      <div class="app-income">${formatKRW(app.estimatedMonthlyIncomeKRW)}/월 <span class="sample-badge">예시</span></div>
      <div class="app-meta">
        <span>설치 ${app.installsLabel}</span>
        <span>★ ${app.rating.toFixed(1)} (${app.reviewCount.toLocaleString("ko-KR")})</span>
      </div>
    `;
    card.addEventListener("click", () => openModal(app));
    cardGrid.appendChild(card);
  }
}

function openModal(app) {
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>${app.iconEmoji} ${app.name}</h2>
      <button class="modal-close" id="modalCloseBtn">✕</button>
    </div>
    <p>${app.shortDescription}</p>
    <div class="app-income">${formatKRW(app.estimatedMonthlyIncomeKRW)}/월 <span class="sample-badge">예시</span></div>

    <div class="modal-section-title">적립 방법</div>
    <ul>${app.howToEarn.map((step) => `<li>${step}</li>`).join("")}</ul>

    <div class="modal-section-title">추천인 안내</div>
    <div class="modal-referral">${app.referralNote}</div>

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
    chip.textContent = category;
    chip.addEventListener("click", () => {
      state.activeCategory = category;
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      render();
    });
    chipRow.appendChild(chip);
  }
}

async function init() {
  const { apps } = await fetchApps();
  state.apps = apps;
  state.categories = [...new Set(apps.flatMap((a) => a.categories))].sort();
  renderChips();
  render();
}

init();
