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

const OWNED_KEY = "ownedApps"; // { [appId]: { checkedAt: number } }
const OLD_OWNED_KEY = "ownedAppIds"; // legacy: string[]
const ACTIVITY_KEY = "activityLog"; // { ts, appId, appName, action }[]
const ALERTS_KEY = "systemAlerts"; // { rewardReminder: bool, hotDeal: bool }
const MAX_ACTIVITY = 50;

function migrateLegacyOwned() {
  const legacy = localStorage.getItem(OLD_OWNED_KEY);
  if (!legacy) return;
  try {
    const ids = JSON.parse(legacy) || [];
    const now = Date.now();
    const records = {};
    for (const id of ids) records[id] = { checkedAt: now };
    localStorage.setItem(OWNED_KEY, JSON.stringify(records));
  } catch {
    /* ignore malformed legacy data */
  } finally {
    localStorage.removeItem(OLD_OWNED_KEY);
  }
}

export function getOwnedRecords() {
  migrateLegacyOwned();
  try {
    return JSON.parse(localStorage.getItem(OWNED_KEY)) || {};
  } catch {
    return {};
  }
}

export function getOwnedIds() {
  return Object.keys(getOwnedRecords());
}

function setOwnedRecords(records) {
  localStorage.setItem(OWNED_KEY, JSON.stringify(records));
}

/** Adds/removes an app from "내가 쓰는 앱" and appends a real timestamped activity entry. */
export function setAppOwned(app, owned) {
  const records = getOwnedRecords();
  if (owned) {
    if (!records[app.id]) records[app.id] = { checkedAt: Date.now() };
  } else {
    delete records[app.id];
  }
  setOwnedRecords(records);
  appendActivity(app, owned ? "add" : "remove");
}

function appendActivity(app, action) {
  const log = getActivityLog();
  log.unshift({ ts: Date.now(), appId: app.id, appName: app.name, iconEmoji: app.iconEmoji, action });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log.slice(0, MAX_ACTIVITY)));
}

export function getActivityLog() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || [];
  } catch {
    return [];
  }
}

export function getSystemAlerts() {
  try {
    return { rewardReminder: false, hotDeal: false, ...JSON.parse(localStorage.getItem(ALERTS_KEY)) };
  } catch {
    return { rewardReminder: false, hotDeal: false };
  }
}

export function setSystemAlert(key, value) {
  const alerts = getSystemAlerts();
  alerts[key] = value;
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

/**
 * Derives the "내 혜택" summary from the full app catalog + the apps the
 * user already marked as owned. Shared by the home/my-page dashboards so
 * every surface stays consistent.
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
    owned,
  };
}

/**
 * Estimated "누적 수익" — for each app checked as owned, the real elapsed
 * time since it was checked (not a fabricated history) times its daily
 * rate. Grows naturally the longer someone keeps using the site.
 */
export function computeCumulativeEstimate(apps, ownedRecords) {
  const now = Date.now();
  let total = 0;
  for (const app of apps) {
    const record = ownedRecords[app.id];
    if (!record) continue;
    const elapsedDays = Math.max(0, (now - record.checkedAt) / 86400000);
    total += (app.estimatedMonthlyIncomeKRW / 30) * elapsedDays;
  }
  return Math.round(total);
}

const TIERS = [
  { min: 10, label: "다이아몬드", emoji: "💎" },
  { min: 5, label: "골드", emoji: "🥇" },
  { min: 1, label: "실버", emoji: "🥈" },
  { min: 0, label: "브론즈", emoji: "🥉" },
];

/** A playful tier derived from real "내가 쓰는 앱" count — not a fabricated rank. */
export function computeTier(ownedCount) {
  return TIERS.find((t) => ownedCount >= t.min);
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

export function topCategories(apps, limit) {
  const counts = new Map();
  for (const app of apps) {
    for (const c of app.categories) counts.set(c, (counts.get(c) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category);
}

export function timeAgoLabel(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (sameDay) return `오늘, 오후 ${hh}:${mm}`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일, ${hh}:${mm}`;
}
