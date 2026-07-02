import { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScreenHeader } from "../../components/ScreenHeader";
import { DisclaimerBanner, Chip, EmptyState, CategoryPill } from "../../components/ui";
import { useApps } from "../../lib/hooks";
import { colors, radius, shadow } from "../../lib/theme";

export default function CommunityScreen() {
  const router = useRouter();
  const { apps } = useApps();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");

  const categories = useMemo(() => ["전체", ...new Set(apps.flatMap((a) => a.categories))], [apps]);

  const filtered = useMemo(
    () =>
      apps
        .filter((a) => category === "전체" || a.categories.includes(category))
        .filter((a) => !query.trim() || a.name.toLowerCase().includes(query.trim().toLowerCase())),
    [apps, query, category]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader />
      <DisclaimerBanner
        icon="ℹ️"
        text="여기 모은 꿀팁은 실제 사용자 게시글이 아니라, 각 앱의 공식 적립 방법을 정리한 안내 정보예요."
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.pageTitle}>앱테크 꿀팁 모음</Text>
          <Text style={styles.pageSubtitle}>카테고리별로 각 앱의 공식 적립 방법을 모아봤어요.</Text>
        </View>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="앱 이름으로 꿀팁 검색"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {categories.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>

        <View style={{ gap: 12 }}>
          {filtered.length === 0 ? (
            <EmptyState text="조건에 맞는 꿀팁이 없어요." />
          ) : (
            filtered.map((app) => (
              <View key={app.id} style={styles.tipCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={styles.appIcon}>
                    <Text style={{ fontSize: 22 }}>{app.iconEmoji}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.appName}>{app.name}</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                      {app.categories.map((c) => (
                        <CategoryPill key={c} category={c} />
                      ))}
                    </View>
                  </View>
                </View>
                <View style={{ gap: 4 }}>
                  {app.howToEarn.map((step, i) => (
                    <Text key={i} style={styles.tipStep}>
                      · {step}
                    </Text>
                  ))}
                </View>
                <Pressable onPress={() => router.push(`/app-detail/${app.id}`)}>
                  <Text style={styles.tipLink}>자세히 보기 →</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 60 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  pageSubtitle: { fontSize: 13, color: colors.outline, marginTop: 4 },
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
  tipCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 18, gap: 10, ...shadow.card },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  tipStep: { fontSize: 13, color: colors.onSurfaceVariant },
  tipLink: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
