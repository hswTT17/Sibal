import { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Switch, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { ScreenHeader } from "../../components/ScreenHeader";
import { DisclaimerBanner, SectionHeader, StatCard, EmptyState, CategoryPill } from "../../components/ui";
import { useApps, useOwnedIds } from "../../lib/hooks";
import {
  ActivityEntry,
  OwnedRecords,
  SystemAlerts,
  computeCumulativeEstimate,
  computeOwnedStats,
  computeTier,
  formatKRW,
  formatKRWCompact,
  getActivityLog,
  getOwnedRecords,
  getSystemAlerts,
  setAppOwned,
  setSystemAlert,
  timeAgoLabel,
} from "../../lib/api";
import { categoryIcon, colors, radius, shadow } from "../../lib/theme";

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function MyScreen() {
  const { apps } = useApps();
  const { ownedIds, refresh } = useOwnedIds();
  const [ownedRecords, setOwnedRecords] = useState<OwnedRecords>({});
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [alerts, setAlerts] = useState<SystemAlerts>({ rewardReminder: false, hotDeal: false });
  const [query, setQuery] = useState("");
  const [activityExpanded, setActivityExpanded] = useState(false);

  const loadExtras = useCallback(() => {
    getOwnedRecords().then(setOwnedRecords);
    getActivityLog().then(setActivityLog);
    getSystemAlerts().then(setAlerts);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExtras();
    }, [loadExtras])
  );

  const stats = useMemo(() => computeOwnedStats(apps, ownedIds), [apps, ownedIds]);
  const dailyEstimate = Math.round(stats.ownedMonthly / 30);
  const cumulative = useMemo(() => computeCumulativeEstimate(apps, ownedRecords), [apps, ownedRecords]);
  const tier = computeTier(ownedIds.length);
  const barHeightPct = stats.ownedMonthly > 0 ? 62 : 8;
  const todayIndex = (new Date().getDay() + 6) % 7;

  const filteredChecklist = useMemo(
    () =>
      apps.filter((a) => {
        if (!query.trim()) return true;
        const needle = query.trim().toLowerCase();
        return a.name.toLowerCase().includes(needle) || a.categories.some((c) => c.toLowerCase().includes(needle));
      }),
    [apps, query]
  );

  async function toggleApp(app: (typeof apps)[number], next: boolean) {
    await setAppOwned(app, next);
    refresh();
    loadExtras();
  }

  async function toggleAlert(key: keyof SystemAlerts, value: boolean) {
    await setSystemAlert(key, value);
    setAlerts((prev) => ({ ...prev, [key]: value }));
  }

  const visibleActivity = activityExpanded ? activityLog : activityLog.slice(0, 5);
  const favoriteApps = apps.filter((a) => ownedIds.includes(a.id)).slice(0, 7);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader />
      <DisclaimerBanner text="표시된 예상 수익은 실제 검증되지 않은 샘플(예시) 데이터입니다. 실제 리워드는 앱 정책 및 시점에 따라 달라질 수 있어요." />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={28} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.profileName}>나의 앱테크</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>
                {tier.emoji} {tier.label} 등급
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <StatCard label="오늘의 예상 수익" value={formatKRWCompact(dailyEstimate)} variant="highlight" />
          <StatCard label="이번 달 적립 중" value={formatKRWCompact(stats.ownedMonthly)} variant="success" />
          <StatCard label="누적 예상 수익" value={formatKRWCompact(cumulative)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>주간 예상 리포트</Text>
          <View style={styles.barChart}>
            {WEEK_DAYS.map((day, i) => {
              const isToday = i === todayIndex;
              return (
                <View key={day} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${barHeightPct}%`, backgroundColor: isToday ? colors.primary : colors.primarySoft },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, isToday && { color: colors.primary, fontWeight: "700" }]}>{day}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.barCaption}>* 오늘 적립액을 기준으로 한 추정치이며, 실제 일별 기록이 아닙니다.</Text>
        </View>

        <View style={styles.card}>
          <SectionHeader title="즐겨찾는 앱" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {favoriteApps.map((app) => (
              <View key={app.id} style={styles.favoriteItem}>
                <View style={styles.favoriteIcon}>
                  <Text style={{ fontSize: 20 }}>{app.iconEmoji}</Text>
                </View>
                <Text style={styles.favoriteLabel} numberOfLines={1}>
                  {app.name}
                </Text>
              </View>
            ))}
            <View style={styles.favoriteItem}>
              <View style={[styles.favoriteIcon, styles.favoriteAdd]}>
                <MaterialIcons name="add" size={20} color={colors.outlineVariant} />
              </View>
              <Text style={[styles.favoriteLabel, { color: colors.outlineVariant }]}>추가</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>시스템 알림</Text>
          <View style={styles.alertRow}>
            <View style={styles.alertLabel}>
              <MaterialIcons name="notifications-active" size={20} color={colors.outline} />
              <Text style={styles.alertLabelText}>보상 리마인더</Text>
            </View>
            <Switch
              value={alerts.rewardReminder}
              onValueChange={(v) => toggleAlert("rewardReminder", v)}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <View style={styles.alertRow}>
            <View style={styles.alertLabel}>
              <MaterialIcons name="local-fire-department" size={20} color={colors.outline} />
              <Text style={styles.alertLabelText}>핫딜 알림</Text>
            </View>
            <Switch
              value={alerts.hotDeal}
              onValueChange={(v) => toggleAlert("hotDeal", v)}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>

        <View style={[styles.card, { padding: 0 }]}>
          <View style={{ padding: 20, paddingBottom: 0 }}>
            <Text style={styles.cardTitle}>리워드 내역</Text>
          </View>
          {activityLog.length === 0 ? (
            <View style={{ padding: 20 }}>
              <EmptyState text="아직 활동 내역이 없어요. 아래 체크리스트에서 앱을 선택해보세요." />
            </View>
          ) : (
            <>
              {visibleActivity.map((entry, i) => {
                const app = apps.find((a) => a.id === entry.appId);
                return (
                  <View key={`${entry.ts}-${i}`} style={styles.activityRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                      <View
                        style={[
                          styles.activityIcon,
                          { backgroundColor: entry.action === "add" ? "rgba(31,174,86,0.12)" : colors.surfaceLow },
                        ]}
                      >
                        <MaterialIcons
                          name={entry.action === "add" ? "add-circle" : "remove-circle"}
                          size={18}
                          color={entry.action === "add" ? colors.successBright : colors.outline}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle} numberOfLines={1}>
                          {entry.iconEmoji} {entry.appName} {entry.action === "add" ? "사용 시작" : "체크 해제"}
                        </Text>
                        <Text style={styles.activityTime}>{timeAgoLabel(entry.ts)}</Text>
                      </View>
                    </View>
                    <Text style={[styles.activityTag, { color: entry.action === "add" ? colors.successBright : colors.outline }]}>
                      {entry.action === "add" && app ? `+ 예상 ${formatKRWCompact(app.estimatedMonthlyIncomeKRW)}/월` : "-"}
                    </Text>
                  </View>
                );
              })}
              {activityLog.length > 5 && (
                <Pressable style={styles.activityMoreBtn} onPress={() => setActivityExpanded((v) => !v)}>
                  <Text style={styles.activityMoreText}>{activityExpanded ? "접기" : "전체 활동 보기"}</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        <View>
          <SectionHeader title="내가 쓰는 앱 체크" />
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={18} color={colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="내가 쓰는 앱 검색"
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <View style={{ gap: 8, marginTop: 12 }}>
            {filteredChecklist.length === 0 ? (
              <EmptyState text="검색 결과가 없어요." />
            ) : (
              filteredChecklist.map((app) => {
                const checked = ownedIds.includes(app.id);
                return (
                  <View key={app.id} style={styles.checklistRow}>
                    <View style={styles.checklistIcon}>
                      <Text style={{ fontSize: 18 }}>{app.iconEmoji}</Text>
                    </View>
                    <Text style={styles.checklistName} numberOfLines={1}>
                      {app.name}
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3, flexShrink: 1 }}>
                      {app.categories.map((c) => (
                        <CategoryPill key={c} category={c} />
                      ))}
                    </View>
                    <Switch value={checked} onValueChange={(v) => toggleApp(app, v)} trackColor={{ true: colors.primary }} />
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View>
          <SectionHeader title="아직 안 쓰는 알짜 앱" />
          <View style={{ gap: 8 }}>
            {stats.notOwned.length === 0 ? (
              <EmptyState text="이미 모든 앱을 사용 중이에요! 🎉" />
            ) : (
              stats.notOwned.map((app) => (
                <View key={app.id} style={styles.resultRow}>
                  <Text style={{ fontSize: 18 }}>{app.iconEmoji}</Text>
                  <Text style={styles.checklistName} numberOfLines={1}>
                    {app.name}
                  </Text>
                  <Text style={styles.resultIncome}>{formatKRW(app.estimatedMonthlyIncomeKRW)}/월</Text>
                </View>
              ))
            )}
          </View>
          <View style={styles.resultsDisclaimer}>
            <Text style={styles.resultsDisclaimerText}>
              위 수치는 실제 검증되지 않은 샘플 데이터를 기준으로 계산한 예시입니다. 각 앱의 실제 리워드는 정책/시점에 따라
              다를 수 있으니 참고용으로만 확인해주세요.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 60 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  tierBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tierBadgeText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 20, gap: 14, ...shadow.card },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  barChart: { flexDirection: "row", height: 140, alignItems: "flex-end", justifyContent: "space-between", gap: 6 },
  barCol: { flex: 1, alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" },
  barTrack: { width: "100%", height: "100%", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 6 },
  barDay: { fontSize: 12, color: colors.outline },
  barCaption: { fontSize: 11, color: colors.outline },
  favoriteItem: { width: "22%", alignItems: "center", gap: 6 },
  favoriteIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteAdd: { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed" },
  favoriteLabel: { fontSize: 11, color: colors.onSurfaceVariant },
  alertRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  alertLabel: { flexDirection: "row", alignItems: "center", gap: 10 },
  alertLabelText: { fontSize: 14, color: colors.onSurface },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(195,197,215,0.2)",
  },
  activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  activityTitle: { fontSize: 13, fontWeight: "700", color: colors.onSurface },
  activityTime: { fontSize: 11, color: colors.outline, marginTop: 2 },
  activityTag: { fontSize: 12, fontWeight: "700" },
  activityMoreBtn: { padding: 14, alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(195,197,215,0.2)" },
  activityMoreText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(195,197,215,0.3)",
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.onSurface },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.btn,
    padding: 12,
    ...shadow.card,
  },
  checklistIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistName: { fontSize: 13, fontWeight: "700", color: colors.onSurface, maxWidth: 90 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.btn,
    padding: 12,
    ...shadow.card,
  },
  resultIncome: { marginLeft: "auto", fontSize: 13, fontWeight: "700", color: colors.successBright },
  resultsDisclaimer: { backgroundColor: colors.warningBg, borderRadius: radius.input, padding: 12, marginTop: 12 },
  resultsDisclaimerText: { fontSize: 12, color: colors.warningText },
});
