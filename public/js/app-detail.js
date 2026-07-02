import { fetchApps, formatKRWCompact, getOwnedIds, categoryIcon } from "./api.js";
import { initHeaderBell } from "./nav.js";

const main = document.getElementById("detailMain");
const backBtn = document.getElementById("backBtn");
const shareBtn = document.getElementById("shareBtn");

const STEP_ICONS = ["bolt", "redeem", "check_circle"];

backBtn.addEventListener("click", () => {
  if (window.history.length > 1) window.history.back();
  else window.location.href = "/search";
});

function renderNotFound() {
  main.innerHTML = `
    <div class="empty-state">
      앱을 찾을 수 없어요.<br />
      <a href="/search" style="color: var(--color-primary); font-weight: 700">검색에서 다시 찾아보기</a>
    </div>
  `;
}

function render(app) {
  document.title = `${app.name} | 앱테크 허브`;
  const isOwned = getOwnedIds().includes(app.id);

  main.innerHTML = `
    <section class="detail-identity" style="margin-top: 24px">
      <div class="detail-icon">${app.iconEmoji}</div>
      <div>
        <p class="detail-name">${app.name}</p>
        <p class="detail-tagline">${app.shortDescription}</p>
        <div class="detail-meta-row">
          <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-primary)">star</span>
          <span>${app.rating.toFixed(1)}</span>
          <span>•</span>
          <span>설치 ${app.installsLabel}</span>
          ${isOwned ? `<span class="category-pill">✅ 사용 중</span>` : ""}
        </div>
      </div>
    </section>

    <section class="detail-stats-bar" style="margin-top: 24px">
      <div class="detail-stat">
        <div class="detail-stat-label">예상 월수익</div>
        <div class="detail-stat-value accent">${formatKRWCompact(app.estimatedMonthlyIncomeKRW)}</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-label">리뷰수</div>
        <div class="detail-stat-value">${app.reviewCount.toLocaleString("ko-KR")}</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-label">적립 방식</div>
        <div class="detail-stat-value success">${categoryIcon(app.categories[0])} ${app.categories[0]}</div>
      </div>
    </section>

    <section class="section" style="margin-top: 40px">
      <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin: 0">적립 방법</h3>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px">
        ${app.howToEarn
          .map(
            (step, i) => `
          <div class="reason-card">
            <span class="reason-icon"><span class="material-symbols-outlined" style="font-size: 18px">${STEP_ICONS[i % STEP_ICONS.length]}</span></span>
            <div>
              <p class="reason-title">STEP ${i + 1}</p>
              <p class="reason-desc">${step}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </section>

    <section class="section" style="margin-top: 40px">
      <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin: 0">주의사항</h3>
      <ul class="caution-list" style="margin-top: 12px">
        <li>
          <span class="material-symbols-outlined">info</span>
          <span>${app.referralNote}</span>
        </li>
        <li>
          <span class="material-symbols-outlined">info</span>
          <span>위 정보(예상 월수익 등)는 실제 검증되지 않은 샘플 데이터입니다. 실제 리워드는 앱 정책 및 시점에 따라 달라질 수 있어요.</span>
        </li>
      </ul>
    </section>

    <section class="section" style="margin-top: 40px">
      <div class="section-head">
        <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; margin: 0">사용자 리뷰</h3>
      </div>
      <div class="empty-state">개별 리뷰 데이터는 아직 준비 중이에요.</div>
    </section>

    <a href="${app.joinUrl}" class="modal-cta" aria-disabled="true" style="margin-top: 8px">링크 준비중</a>
  `;
}

async function init() {
  initHeaderBell();
  const id = new URLSearchParams(location.search).get("id");
  const { apps } = await fetchApps();
  const app = apps.find((a) => a.id === id);
  if (!app) {
    renderNotFound();
    return;
  }
  render(app);
}

shareBtn.addEventListener("click", async () => {
  const url = window.location.href;
  const title = document.title;
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch {
      /* user cancelled share sheet */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    shareBtn.querySelector(".material-symbols-outlined").textContent = "check";
    setTimeout(() => {
      shareBtn.querySelector(".material-symbols-outlined").textContent = "share";
    }, 1500);
  } catch {
    /* clipboard unavailable */
  }
});

init();
