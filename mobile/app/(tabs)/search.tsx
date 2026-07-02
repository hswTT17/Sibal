import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SectionHeader, EmptyState, AppListRow } from "../../components/ui";
import { useApps, useOwnedIds } from "../../lib/hooks";
import { topCategories } from "../../lib/api";
import { categoryIcon, colors, radius } from "../../lib/theme";

function matchesQuery(app: { name: string; categories: string[] }, q: string) {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return app.name.toLowerCase().includes(needle) || app.categories.some((c) => c.toLowerCase().includes(needle));
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cat?: string }>();
  const { apps } = useApps();
  const { ownedIds } = useOwnedIds();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(params.cat ?? null);

  useEffect(() => {
    if (params.cat) setCategory(params.cat);
  }, [params.cat]);

  const keywordApps = useMemo(() => [...apps].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4), [apps]);
  const gridCategories = useMemo(() => topCategories(apps, 5), [apps]);

  const filtered = useMemo(
    () =>
      apps
        .filter((a) => matchesQuery(a, query))
        .filter((a) => !category || a.categories.includes(category))
        .sort((a, b) => b.reviewCount - a.reviewCount),
    [apps, query, category]
  );

  const listTitle = query.trim()
    ? `"${query.trim()}" 검색 결과`
    : category
      ? `${categoryIcon(category)} ${category} 앱테크`
      : "추천 앱테크";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="앱 이름이나 혜택을 검색하세요"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View>
          <SectionHeader title="인기 검색어" right={<Text style={styles.mutedSmall}>리뷰 많은 순</Text>} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {keywordApps.map((app, i) => (
              <Pressable key={app.id} style={styles.keywordChip} onPress={() => setQuery(app.name)}>
                <Text style={styles.keywordRank}>{i + 1}.</Text>
                <Text style={styles.keywordName}>{app.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="카테고리" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {gridCategories.map((c) => {
              const active = category === c;
              return (
                <Pressable
                  key={c}
                  style={styles.categoryItem}
                  onPress={() => setCategory(active ? null : c)}
                >
                  <View style={[styles.categoryIcon, active && { backgroundColor: colors.primary }]}>
                    <Text style={{ fontSize: 24 }}>{categoryIcon(c)}</Text>
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <SectionHeader title={listTitle} />
          <View style={{ gap: 12 }}>
            {filtered.length === 0 ? (
              <EmptyState text="조건에 맞는 앱이 없어요." />
            ) : (
              filtered.map((app, i) => (
                <AppListRow
                  key={app.id}
                  app={app}
                  ctaLabel={ownedIds.includes(app.id) ? "열기" : "받기"}
                  showRecommendTag={i === 0 && !query.trim() && !category}
                  onPress={() => router.push(`/app-detail/${app.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 32, paddingBottom: 60 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.3)",
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.onSurface },
  mutedSmall: { fontSize: 12, color: colors.outline },
  keywordChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.35)",
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  keywordRank: { color: colors.primary, fontWeight: "800" },
  keywordName: { color: colors.onSurface, fontWeight: "600" },
  categoryItem: { width: "18%", alignItems: "center", gap: 6 },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontSize: 11, fontWeight: "600", color: colors.onSurfaceVariant },
});
