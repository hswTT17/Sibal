import { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Share, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApps, useOwnedIds } from "../../lib/hooks";
import { formatKRWCompact } from "../../lib/api";
import { categoryIcon, colors, radius, shadow } from "../../lib/theme";

const STEP_ICONS: (keyof typeof MaterialIcons.glyphMap)[] = ["bolt", "redeem", "check-circle"];

export default function AppDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { apps } = useApps();
  const { ownedIds } = useOwnedIds();

  const app = useMemo(() => apps.find((a) => a.id === id), [apps, id]);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/search");
  }

  async function share() {
    if (!app) return;
    try {
      await Share.share({ message: `${app.name} - 앱테크 허브에서 확인해보세요` });
    } catch {
      /* user cancelled share sheet */
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={8}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>앱 상세 정보</Text>
        <Pressable onPress={share} hitSlop={8}>
          <MaterialIcons name="share" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {!app ? (
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>앱을 찾을 수 없어요.</Text>
          <Pressable onPress={() => router.replace("/(tabs)/search")}>
            <Text style={styles.notFoundLink}>검색에서 다시 찾아보기</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.identityRow}>
            <View style={styles.icon}>
              <Text style={{ fontSize: 40 }}>{app.iconEmoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{app.name}</Text>
              <Text style={styles.tagline}>{app.shortDescription}</Text>
              <View style={styles.metaRow}>
                <MaterialIcons name="star" size={16} color={colors.primary} />
                <Text style={styles.metaText}>{app.rating.toFixed(1)}</Text>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>설치 {app.installsLabel}</Text>
                {ownedIds.includes(app.id) && (
                  <View style={styles.ownedPill}>
                    <Text style={styles.ownedPillText}>✅ 사용 중</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>예상 월수익</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatKRWCompact(app.estimatedMonthlyIncomeKRW)}
              </Text>
            </View>
            <View style={[styles.statCell, styles.statCellBorder]}>
              <Text style={styles.statLabel}>리뷰수</Text>
              <Text style={styles.statValue}>{app.reviewCount.toLocaleString("ko-KR")}</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statLabel}>적립 방식</Text>
              <Text style={[styles.statValue, { color: colors.successBright }]}>
                {categoryIcon(app.categories[0])} {app.categories[0]}
              </Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>적립 방법</Text>
            {app.howToEarn.map((step, i) => (
              <View key={i} style={styles.reasonCard}>
                <View style={styles.reasonIcon}>
                  <MaterialIcons name={STEP_ICONS[i % STEP_ICONS.length]} size={18} color={colors.successBright} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reasonTitle}>STEP {i + 1}</Text>
                  <Text style={styles.reasonDesc}>{step}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>주의사항</Text>
            <View style={styles.cautionRow}>
              <MaterialIcons name="info" size={20} color={colors.error} />
              <Text style={styles.cautionText}>{app.referralNote}</Text>
            </View>
            <View style={styles.cautionRow}>
              <MaterialIcons name="info" size={20} color={colors.error} />
              <Text style={styles.cautionText}>
                위 정보(예상 월수익 등)는 실제 검증되지 않은 샘플 데이터입니다. 실제 리워드는 앱 정책 및 시점에 따라
                달라질 수 있어요.
              </Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>사용자 리뷰</Text>
            <Text style={styles.reviewEmpty}>개별 리뷰 데이터는 아직 준비 중이에요.</Text>
          </View>

          <View style={styles.ctaDisabled}>
            <Text style={styles.ctaDisabledText}>링크 준비중</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(195,197,215,0.3)",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.primary },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  notFoundText: { color: colors.outline, fontSize: 14 },
  notFoundLink: { color: colors.primary, fontWeight: "700" },
  content: { padding: 20, gap: 32, paddingBottom: 60 },
  identityRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  icon: {
    width: 88,
    height: 88,
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  name: { fontSize: 20, fontWeight: "800", color: colors.onSurface },
  tagline: { fontSize: 13, fontWeight: "600", color: colors.primary, marginTop: 2, marginBottom: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  metaText: { fontSize: 13, color: colors.onSurfaceVariant },
  ownedPill: { backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  ownedPillText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  statsBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.btn,
    paddingVertical: 16,
    ...shadow.card,
  },
  statCell: { flex: 1, alignItems: "center", gap: 4, paddingHorizontal: 4 },
  statCellBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(195,197,215,0.3)" },
  statLabel: { fontSize: 12, color: colors.onSurfaceVariant },
  statValue: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.onSurface },
  reasonCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.btn,
    padding: 16,
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(31,174,86,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  reasonTitle: { fontWeight: "700", fontSize: 14, color: colors.onSurface, marginBottom: 4 },
  reasonDesc: { fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 19 },
  cautionRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  cautionText: { flex: 1, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20 },
  reviewEmpty: { color: colors.outline, fontSize: 14, textAlign: "center", paddingVertical: 12 },
  ctaDisabled: { backgroundColor: colors.surfaceLow, borderRadius: radius.pill, padding: 15, alignItems: "center" },
  ctaDisabledText: { color: colors.outline, fontWeight: "700" },
});
