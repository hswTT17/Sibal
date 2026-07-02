import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { ColorValue } from "react-native";
import { colors } from "../../lib/theme";

function icon(name: keyof typeof MaterialIcons.glyphMap) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <MaterialIcons name={name} color={color as string} size={size} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: "rgba(195,197,215,0.3)" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈", tabBarIcon: icon("home") }} />
      <Tabs.Screen name="events" options={{ title: "이벤트", tabBarIcon: icon("card-giftcard") }} />
      <Tabs.Screen name="search" options={{ title: "검색", tabBarIcon: icon("search") }} />
      <Tabs.Screen name="community" options={{ title: "커뮤니티", tabBarIcon: icon("groups") }} />
      <Tabs.Screen name="my" options={{ title: "마이페이지", tabBarIcon: icon("person") }} />
    </Tabs>
  );
}
