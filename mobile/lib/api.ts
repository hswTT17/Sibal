import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://sibal-apptech.pages.dev";

export interface ApptechApp {
  id: string;
  name: string;
  categories: string[];
  iconEmoji: string;
  shortDescription: string;
  howToEarn: string[];
  estimatedMonthlyIncomeKRW: number;
  installsLabel: string;
  rating: number;
  reviewCount: number;
  referralNote: string;
  joinUrl: string;
}

export async function fetchApps(): Promise<{ apps: ApptechApp[]; disclaimer: string }> {
  const res = await fetch(`${API_BASE}/api/apps`);
  if (!res.ok) throw new Error("Failed to load apps");
  return res.json();
}

export function formatKRW(amount: number): string {
  return `약 ${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatKRWCompact(amount: number): string {
  return `₩${Math.round(amount).toLocaleString("ko-KR")}`;
}

const OWNED_KEY = "ownedApps"; // { [appId]: { checkedAt: number } }
const ACTIVITY_KEY = "activityLog";
const ALERTS_KEY = "systemAlerts";
const MAX_ACTIVITY = 50;

export type OwnedRecords = Record<string, { checkedAt: number }>;

export interface ActivityEntry {
  ts: number;
  appId: string;
  appName: string;
  iconEmoji: string;
  action: "add" | "remove";
}

export interface SystemAlerts {
  rewardReminder: boolean;
  hotDeal: boolean;
}

export async function getOwnedRecords(): Promise<OwnedRecords> {
  try {
    const raw = await AsyncStorage.getItem(OWNED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getOwnedIds(): Promise<string[]> {
  return Object.keys(await getOwnedRecords());
}

async function setOwnedRecords(records: OwnedRecords): Promise<void> {
  await AsyncStorage.setItem(OWNED_KEY, JSON.stringify(records));
}

/** Adds/removes an app from "내가 쓰는 앱" and appends a real timestamped activity entry. */
export async function setAppOwned(app: ApptechApp, owned: boolean): Promise<void> {
  const records = await getOwnedRecords();
  if (owned) {
    if (!records[app.id]) records[app.id] = { checkedAt: Date.now() };
  } else {
    delete records[app.id];
  }
  await setOwnedRecords(records);
  await appendActivity(app, owned ? "add" : "remove");
}

async function appendActivity(app: ApptechApp, action: "add" | "remove"): Promise<void> {
  const log = await getActivityLog();
  log.unshift({ ts: Date.now(), appId: app.id, appName: app.name, iconEmoji: app.iconEmoji, action });
  await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(log.slice(0, MAX_ACTIVITY)));
}

export async function getActivityLog(): Promise<ActivityEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getSystemAlerts(): Promise<SystemAlerts> {
  try {
    const raw = await AsyncStorage.getItem(ALERTS_KEY);
    return { rewardReminder: false, hotDeal: false, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { rewardReminder: false, hotDeal: false };
  }
}

export async function setSystemAlert(key: keyof SystemAlerts, value: boolean): Promise<void> {
  const alerts = await getSystemAlerts();
  alerts[key] = value;
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export interface OwnedStats {
  ownedCount: number;
  totalCount: number;
  ownedMonthly: number;
  missingMonthly: number;
  notOwned: ApptechApp[];
  owned: ApptechApp[];
}

/**
 * Derives the "내 혜택" summary from the full app catalog + the apps the
 * user already marked as owned. Shared by every screen so they stay
 * consistent (mirrors public/js/api.js on the web side).
 */
export function computeOwnedStats(apps: ApptechApp[], ownedIds: string[]): OwnedStats {
  const owned = apps.filter((a) => ownedIds.includes(a.id));
  const notOwned = apps
    .filter((a) => !ownedIds.includes(a.id))
    .sort((a, b) => b.estimatedMonthlyIncomeKRW - a.estimatedMonthlyIncomeKRW);

  const ownedMonthly = owned.reduce((sum, a) => sum + a.estimatedMonthlyIncomeKRW, 0);
  const missingMonthly = notOwned.reduce((sum, a) => sum + a.estimatedMonthlyIncomeKRW, 0);

  return { ownedCount: owned.length, totalCount: apps.length, ownedMonthly, missingMonthly, notOwned, owned };
}

/**
 * Estimated "누적 수익" — for each app checked as owned, the real elapsed
 * time since it was checked (not a fabricated history) times its daily
 * rate. Grows naturally the longer someone keeps using the app.
 */
export function computeCumulativeEstimate(apps: ApptechApp[], ownedRecords: OwnedRecords): number {
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
export function computeTier(ownedCount: number) {
  return TIERS.find((t) => ownedCount >= t.min)!;
}

export function topCategories(apps: ApptechApp[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const app of apps) {
    for (const c of app.categories) counts.set(c, (counts.get(c) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category);
}

export function timeAgoLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (sameDay) return `오늘, 오후 ${hh}:${mm}`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일, ${hh}:${mm}`;
}
