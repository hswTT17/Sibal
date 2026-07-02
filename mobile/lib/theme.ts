// AppTech Hub design tokens — ported from the DESIGN.md spec used by the
// web app (see /design sample/apptech_hub/DESIGN.md) so both surfaces
// share one visual identity.

export const colors = {
  bg: "#f8f9fc",
  surface: "#ffffff",
  surfaceLow: "#f2f3f6",
  surfaceContainer: "#edeef1",
  surfaceHigh: "#e7e8eb",
  onSurface: "#191c1e",
  onSurfaceVariant: "#434654",
  outline: "#737686",
  outlineVariant: "#c3c5d7",

  primary: "#1550d3",
  primaryDark: "#0f3ea3",
  primaryContainer: "#3c6bed",
  primarySoft: "#eaf0ff",
  onPrimary: "#ffffff",

  secondary: "#585f68",
  secondaryContainer: "#dde3ee",

  success: "#006b2d",
  successSoft: "#e5f6ec",
  successBright: "#1fae56",

  error: "#ba1a1a",
  errorSoft: "#ffdad6",

  warningBg: "#fff7e0",
  warningBorder: "#ffd875",
  warningText: "#8a6100",
};

export const radius = {
  card: 24,
  btn: 16,
  input: 12,
  pill: 999,
};

export const spacing = {
  containerPadding: 20,
  gutter: 16,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  sectionGap: 48,
};

export const shadow = {
  card: {
    shadowColor: "#1550d3",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  hero: {
    shadowColor: "#1550d3",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
};

export const CATEGORY_ICONS: Record<string, string> = {
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

export function categoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? "🏷️";
}
