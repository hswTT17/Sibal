import { fetchApps, categoryIcon } from "./api.js";
import { initHeaderBell } from "./nav.js";

const tipSearch = document.getElementById("tipSearch");
const categoryChips = document.getElementById("categoryChips");
const tipGrid = document.getElementById("tipGrid");

const state = { apps: [], query: "", category: "전체" };

function render() {
  const filtered = state.apps
    .filter((a) => state.category === "전체" || a.categories.includes(state.category))
    .filter((a) => !state.query || a.name.toLowerCase().includes(state.query.trim().toLowerCase()));

  tipGrid.innerHTML = "";
  if (filtered.length === 0) {
    tipGrid.innerHTML = `<div class="empty-state">조건에 맞는 꿀팁이 없어요.</div>`;
    return;
  }

  for (const app of filtered) {
    const card = document.createElement("div");
    card.className = "tip-card";
    card.innerHTML = `
      <div class="tip-card-head">
        <div class="app-icon">${app.iconEmoji}</div>
        <div>
          <p class="app-name" style="margin: 0">${app.name}</p>
          <div class="app-categories">
            ${app.categories.map((c) => `<span class="category-pill">${categoryIcon(c)} ${c}</span>`).join("")}
          </div>
        </div>
      </div>
      <ol class="tip-steps">
        ${app.howToEarn.map((step) => `<li>${step}</li>`).join("")}
      </ol>
      <a href="/app?id=${app.id}" class="section-link">자세히 보기 <span class="material-symbols-outlined" style="font-size: 16px">chevron_right</span></a>
    `;
    tipGrid.appendChild(card);
  }
}

function renderChips() {
  const categories = ["전체", ...new Set(state.apps.flatMap((a) => a.categories))].sort((a, b) =>
    a === "전체" ? -1 : b === "전체" ? 1 : 0
  );
  categoryChips.innerHTML = "";
  for (const category of categories) {
    const chip = document.createElement("button");
    chip.className = "chip" + (category === state.category ? " active" : "");
    chip.textContent = category === "전체" ? category : `${categoryIcon(category)} ${category}`;
    chip.addEventListener("click", () => {
      state.category = category;
      renderChips();
      render();
    });
    categoryChips.appendChild(chip);
  }
}

tipSearch.addEventListener("input", () => {
  state.query = tipSearch.value;
  render();
});

async function init() {
  initHeaderBell();
  const { apps } = await fetchApps();
  state.apps = apps;
  renderChips();
  render();
}

init();
