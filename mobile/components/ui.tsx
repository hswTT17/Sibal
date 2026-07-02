import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { categoryIcon, colors, radius, shadow } from "../lib/theme";
import type { ApptechApp } from "../lib/api";
import { formatKRW } from "../lib/api";

export function DisclaimerBanner({ text, icon = "⚠️" }: { text: string; icon?: string }) {
  return (
    <View style={styles.disclaimer}>
      <Text>{icon}</Text>
      <Text style={styles.disclaimerText}>{text}</Text>
    </View>
  );
}

export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "highlight" | "success";
}) {
  return (
    <View style={[styles.statCard, variant === "highlight" && styles.statHighlight]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          variant === "highlight" && { color: colors.primary },
          variant === "success" && { color: colors.successBright },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function CategoryPill({ category }: { category: string }) {
  return (
    <View style={styles.categoryPill}>
      <Text style={styles.categoryPillText}>
        {categoryIcon(category)} {category}
      </Text>
    </View>
  );
}

export function AppListRow({
  app,
  ctaLabel,
  onPress,
  showRecommendTag,
}: {
  app: ApptechApp;
  ctaLabel: string;
  onPress: () => void;
  showRecommendTag?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.listRow}>
      <View style={styles.listIcon}>
        <Text style={{ fontSize: 24 }}>{app.iconEmoji}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {app.name}
          </Text>
          {showRecommendTag && (
            <View style={styles.recommendTag}>
              <Text style={styles.recommendTagText}>추천</Text>
            </View>
          )}
        </View>
        <Text style={styles.listDesc} numberOfLines={1}>
          {app.shortDescription}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <MaterialIcons name="star" size={13} color={colors.primary} />
            <Text style={styles.listMeta}>{app.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.listMeta}>{formatKRW(app.estimatedMonthlyIncomeKRW)}/월 예시</Text>
        </View>
      </View>
      <View style={styles.ctaPill}>
        <Text style={styles.ctaPillText}>{ctaLabel}</Text>
      </View>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.warningBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.warningBorder,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  disclaimerText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.warningText },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.onSurface },
  chip: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.onSurfaceVariant },
  chipTextActive: { color: "#fff" },
  empty: { paddingVertical: 24, alignItems: "center" },
  emptyText: { color: colors.outline, fontSize: 14, textAlign: "center" },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    gap: 6,
    ...shadow.card,
  },
  statHighlight: { backgroundColor: colors.primarySoft },
  statLabel: { fontSize: 12, fontWeight: "600", color: colors.onSurfaceVariant },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.onSurface },
  categoryPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryPillText: { fontSize: 11, fontWeight: "700", color: colors.primary },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 14,
    ...shadow.card,
  },
  listIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.input,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: { fontSize: 15, fontWeight: "700", color: colors.onSurface, flexShrink: 1 },
  listDesc: { fontSize: 12, color: colors.onSurfaceVariant },
  listMeta: { fontSize: 11, color: colors.outline },
  recommendTag: { backgroundColor: "#d9f7e3", borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  recommendTagText: { fontSize: 10, fontWeight: "700", color: colors.successBright },
  ctaPill: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
  ctaPillText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 20, ...shadow.card },
});
