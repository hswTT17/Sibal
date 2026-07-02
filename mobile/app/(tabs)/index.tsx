import { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScreenHeader } from "../../components/ScreenHeader";
import { DisclaimerBanner, SectionHeader, EmptyState, AppListRow } from "../../components/ui";
import { useApps, useOwnedIds } from "../../lib/hooks";
import { computeOwnedStats, formatKRWCompact, topCategories } from "../../lib/api";
import { categoryIcon, colors, radius, shadow } from "../../lib/theme";
import type { ApptechApp } from "../../lib/api";

const PROMO_COLORS = [
  ["#3c6bed", "#0f3ea3"],
  ["#1fae56", "#0a5c30"],
  ["#585f68", "#2e3133"],
];

export default function HomeScreen() {
  const router = useRouter();
  const { apps } = useApps();
  const { ownedIds } = useOwnedIds();

  const stats = useMemo(() => computeOwnedStats(apps, ownedIds), [apps, ownedIds]);
  const dailyEstimate = Math.round(stats.ownedMonthly / 30);
  const pct = stats.totalCount ? Math.round((stats.ownedCount / stats.totalCount) * 100) : 0;

  const missionCategories = useMemo(() => topCategories(apps, 8), [apps]);
  const promoApps = useMemo(
    () => [...apps].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 3),
    [apps]
  );
  const recommended = stats.notOwned.slice(0, 5);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader />
      <DisclaimerBanner text="표시된 예상 수익은 실제 검증되지 않은 샘플(예시) 데이터입니다. 실제 리워드는 앱 정책 및 시점에 따라 달라질 수 있어요." />

      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <SectionHeader title="오늘 받을 수 있는 혜택" />
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>오늘 예상 수익</Text>
            {stats.ownedCount === 0 ? (
              <>
                <Text style={styles.heroValue}>₩0</Text>
                <Text style={styles.heroCaption}>
                  <Text onPress={() => router.push("/(tabs)/my")} style={styles.heroLink}>
                    내 혜택 조회
                  </Text>
                  에서 이미 쓰고 있는 앱테크 앱을 체크하면, 오늘의 예상 적립액을 보여드려요.
                </Text>
              </>
            ) : (
              <>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                  <Text style={styles.heroValue}>{formatKRWCompact(dailyEstimate)}</Text>
                  <Text style={styles.heroSub}>예시 수치</Text>
                </View>
                <View style={{ marginTop: 16, gap: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.progressLabel}>
                      사용 중인 앱 {stats.ownedCount}/{stats.totalCount}
                    </Text>
                    <Text style={styles.progressLabel}>{pct}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                </View>
                <Text style={styles.heroCaption}>
                  아직 안 쓰는 앱에서 약 {formatKRWCompact(stats.missingMonthly)} 더 받을 수 있어요.{" "}
                  <Text onPress={() => router.push("/(tabs)/my")} style={styles.heroLink}>
                    내 혜택 자세히 보기 →
                  </Text>
                </Text>
              </>
            )}
          </View>
        </View>

        <View>
          <SectionHeader title="카테고리 둘러보기" />
          <View style={styles.missionGrid}>
            {missionCategories.map((category) => (
              <Pressable
                key={category}
                style={styles.missionItem}
                onPress={() => router.push({ pathname: "/(tabs)/search", params: { cat: category } })}
              >
                <View style={styles.missionIcon}>
                  <Text style={{ fontSize: 24 }}>{categoryIcon(category)}</Text>
                </View>
                <Text style={styles.missionLabel} numberOfLines={1}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="지금 주목받는 앱" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {promoApps.map((app, i) => (
              <PromoCard key={app.id} app={app} colorPair={PROMO_COLORS[i % PROMO_COLORS.length]} />
            ))}
          </ScrollView>
        </View>

        <View>
          <SectionHeader title="아직 안 쓰는 인기 앱" />
          <View style={{ gap: 12 }}>
            {recommended.length === 0 ? (
              <EmptyState text="이미 모든 앱을 사용 중이에요! 🎉" />
            ) : (
              recommended.map((app) => (
                <AppListRow key={app.id} app={app} ctaLabel="보기" onPress={() => router.push(`/app-detail/${app.id}`)} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push("/(tabs)/my")}>
        <MaterialIcons name="playlist-add-check" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

function PromoCard({ app, colorPair }: { app: ApptechApp; colorPair: string[] }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/app-detail/${app.id}`)}
      style={[styles.promoCard, { backgroundColor: colorPair[0] }]}
    >
      <View style={styles.promoBadge}>
        <Text style={styles.promoBadgeText}>
          {categoryIcon(app.categories[0])} {app.categories[0]}
        </Text>
      </View>
      <Text style={styles.promoTitle}>{app.name}</Text>
      <Text style={styles.promoSubtitle}>
        ★ {app.rating.toFixed(1)} · 리뷰 {app.reviewCount.toLocaleString("ko-KR")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 40, paddingBottom: 100 },
  heroCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 22, ...shadow.card },
  heroLabel: { fontSize: 13, fontWeight: "600", color: colors.onSurfaceVariant },
  heroValue: { fontSize: 34, fontWeight: "800", color: colors.primary, marginTop: 6 },
  heroSub: { fontSize: 13, color: colors.onSurfaceVariant },
  progressLabel: { fontSize: 12, fontWeight: "600", color: colors.onSurfaceVariant },
  progressTrack: { height: 10, backgroundColor: colors.surfaceContainer, borderRadius: radius.pill, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.successBright, borderRadius: radius.pill },
  heroCaption: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 14, lineHeight: 19 },
  heroLink: { color: colors.primary, fontWeight: "700" },
  missionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  missionItem: { width: "22%", alignItems: "center", gap: 8 },
  missionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  missionLabel: { fontSize: 11, fontWeight: "600", color: colors.onSurfaceVariant },
  promoCard: { width: 220, height: 150, borderRadius: radius.card, padding: 18, justifyContent: "flex-start", gap: 8 },
  promoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  promoBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  promoTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  promoSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
});
