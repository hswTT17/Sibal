import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { colors } from "../lib/theme";
import { getSystemAlerts } from "../lib/api";

export function ScreenHeader({ title = "앱테크 허브" }: { title?: string }) {
  const router = useRouter();
  const [hasAlert, setHasAlert] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSystemAlerts().then((a) => setHasAlert(a.rewardReminder || a.hotDeal));
    }, [])
  );

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <MaterialIcons name="grid-view" size={20} color={colors.primary} />
        <Text style={styles.brand}>{title}</Text>
      </View>
      <Pressable onPress={() => router.push("/(tabs)/my")} style={styles.bellBtn} hitSlop={8}>
        <MaterialIcons name="notifications" size={22} color={colors.onSurfaceVariant} />
        {hasAlert && <View style={styles.dot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(195,197,215,0.3)",
    backgroundColor: colors.bg,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 18, fontWeight: "800", color: colors.primary },
  bellBtn: { padding: 6 },
  dot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
});
