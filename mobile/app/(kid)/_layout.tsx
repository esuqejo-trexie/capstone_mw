import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function KidsTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const hideTabBar = route.name === "(read)";

        return {
          headerShown: false,

          tabBarActiveTintColor: "#FF6E61",
          tabBarInactiveTintColor: "#9CA3AF",

          tabBarStyle: hideTabBar
            ? { display: "none" } // 👈 HIDE on read screens
            : {
                height: 56, // 👈 slightly slimmer
                paddingBottom: 6,
                paddingTop: 6,
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
                iconName = "lock-closed";
                break;
              default:
                iconName = "home";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        };
      }}
    >
      {/* MAIN TABS */}
      <Tabs.Screen name="home" />
      <Tabs.Screen name="read" />
      <Tabs.Screen name="games" />
      <Tabs.Screen name="parent" />

      {/* HIDDEN GROUP */}
      <Tabs.Screen name="(read)" options={{ href: null }} />
    </Tabs>
  );
}
