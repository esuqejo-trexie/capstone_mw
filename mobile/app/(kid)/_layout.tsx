import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function KidsTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#FF6E61",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "home":
              iconName = "home";
              break;
            case "read":
              iconName = "book";
              break;
            case "games":
              iconName = "game-controller";
              break;
            case "parent":
              iconName = "lock-closed"; // important: parent-only
              break;
            default:
              iconName = "home";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ tabBarLabel: "Home" }} />
      <Tabs.Screen name="read" options={{ tabBarLabel: "Read" }} />
      <Tabs.Screen name="games" options={{ tabBarLabel: "Games" }} />
      <Tabs.Screen name="parent" options={{ tabBarLabel: "Parent" }} />
    </Tabs>
  );
}
