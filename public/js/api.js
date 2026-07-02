export async function fetchApps() {
  const res = await fetch("/api/apps");
  if (!res.ok) throw new Error("Failed to load apps");
  return res.json(); // { apps, disclaimer }
}

export function formatKRW(amount) {
  return `약 ${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatKRWCompact(amount) {
  return `₩${Math.round(amount).toLocaleString("ko-KR")}`;
}

const STORAGE_KEY = "ownedAppIds";

export function getOwnedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function setOwnedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/**
 * Derives the "내 혜택" summary from the full app catalog + the apps the
 * user already marked as owned. Shared by the home dashboard hero and the
 * benefits page so both surfaces stay consistent.
 */
export function computeOwnedStats(apps, ownedIds) {
  const owned = apps.filter((a) => ownedIds.includes(a.id));
  const notOwned = apps
    .filter((a) => !ownedIds.includes(a.id))
    .sort((a, b) => b.estimatedMonthlyIncomeKRW - a.estimatedMonthlyIncomeKRW);

  const ownedMonthly = owned.reduce((sum, a) => sum + a.estimatedMonthlyIncomeKRW, 0);
  const missingMonthly = notOwned.reduce((sum, a) => sum + a.estimatedMonthlyIncomeKRW, 0);

  return {
    ownedCount: owned.length,
    totalCount: apps.length,
    ownedMonthly,
    missingMonthly,
    notOwned,
  };
}

export const CATEGORY_ICONS = {
  걷기: "🚶",
  설문조사: "📋",
  쇼핑리워드: "🛍️",
  게임: "🎮",
  금융: "🏦",
  잠금화면: "🔒",
  광고시청: "📺",
  추천인: "🤝",
  미션: "🎯",
  방치형: "🌙",
  영상시청: "🎬",
  헬스케어: "💪",
  가상화폐: "🪙",
  퀴즈: "❓",
  화면터치: "👆",
  디톡스: "📵",
  기프티콘: "🎁",
  상품권: "🎫",
  포인트: "⭐",
  현금: "💵",
  여행: "✈️",
  댓글달기: "💬",
};

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] || "🏷️";
}
