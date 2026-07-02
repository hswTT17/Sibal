import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Chip } from "../../components/ui";
import { useApps } from "../../lib/hooks";
import { formatKRW } from "../../lib/api";
import { categoryIcon, colors, radius, shadow } from "../../lib/theme";
import type { ApptechApp } from "../../lib/api";

const PAGE_SIZE = 6;

const FILTERS: { key: string; label: string; sort: (a: ApptechApp, b: ApptechApp) => number }[] = [
  { key: "all", label: "전체", sort: (a, b) => b.reviewCount - a.reviewCount },
  { key: "income", label: "고수익", sort: (a, b) => b.estimatedMonthlyIncomeKRW - a.estimatedMonthlyIncomeKRW },
  { key: "rating", label: "평점높은", sort: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount },
  { key: "reviews", label: "리뷰많은", sort: (a, b) => b.reviewCount - a.reviewCount },
];

export default function EventsScreen() {
  const router = useRouter();
  const { apps } = useApps();
  const [filterKey, setFilterKey] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filter = FILTERS.find((f) => f.key === filterKey)!;
  const sorted = useMemo(() => [...apps].sort(filter.sort), [apps, filterKey]);
  const visible = sorted.slice(0, visibleCount);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>인기 혜택</Text>
          </View>
          <Text style={styles.heroTitle}>지금 가장 인기 있는 앱테크 혜택</Text>
          <Text style={styles.heroSubtitle}>현재 {apps.length}개 앱의 혜택을 확인해보세요.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filterKey === f.key}
              onPress={() => {
                setFilterKey(f.key);
                setVisibleCount(PAGE_SIZE);
              }}
            />
          ))}
        </ScrollView>

        <View style={{ gap: 16 }}>
          {visible.map((app) => (
            <View key={app.id} style={styles.eventCard}>
              <View style={styles.eventCardTop}>
                <View style={styles.eventIcon}>
                  <Text style={{ fontSize: 26 }}>{app.iconEmoji}</Text>
                </View>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>★ {app.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.eventTitle}>{app.name}</Text>
              <Text style={styles.eventBrand} numberOfLines={2}>
                {app.shortDescription}
              </Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {app.categories.slice(0, 2).map((c) => (
                  <View key={c} style={styles.eventTag}>
                    <Text style={styles.eventTagText}>
                      {categoryIcon(c)} {c}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.eventIncome}>{formatKRW(app.estimatedMonthlyIncomeKRW)}/월 예시</Text>
              <Pressable style={styles.eventCta} onPress={() => router.push(`/app-detail/${app.id}`)}>
                <Text style={styles.eventCtaText}>자세히 보기</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>

        {visibleCount < sorted.length && (
          <Pressable style={styles.loadMore} onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            <Text style={styles.loadMoreText}>더보기</Text>
            <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 60 },
  hero: { backgroundColor: colors.primary, borderRadius: radius.card, padding: 24, gap: 8 },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  heroTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  heroSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  eventCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 20, gap: 12, ...shadow.card },
  eventCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eventIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.input,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  eventBadge: { backgroundColor: colors.surfaceHigh, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  eventBadgeText: { fontSize: 11, fontWeight: "700", color: colors.onSurfaceVariant },
  eventTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  eventBrand: { fontSize: 12, color: colors.outline },
  eventTag: { backgroundColor: colors.secondaryContainer, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  eventTagText: { fontSize: 11, fontWeight: "600", color: colors.secondary },
  eventIncome: { fontSize: 12, color: colors.onSurfaceVariant },
  eventCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.input,
    paddingVertical: 13,
  },
  eventCtaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  loadMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.pill,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  loadMoreText: { color: colors.onSurfaceVariant, fontWeight: "600", fontSize: 14 },
});
