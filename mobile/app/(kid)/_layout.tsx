import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, useWindowDimensions } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const BASE_HEIGHT = 375;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function KidsTabsLayout() {
  const { width, height } = useWindowDimensions();

  // landscape normalization
  const shortSide = Math.min(width, height);

  const rawScale = shortSide / BASE_HEIGHT;
  const scale = clamp(rawScale, 0.85, 1.2);

  const iconSize = clamp(24 * scale, 20, 30);

  return (
    <Tabs
      screenOptions={({ route }) => {
        const hideTabBar = route.name === "(read)" || route.name === "(games)";

        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#FF6E61",
          tabBarInactiveTintColor: "#9CA3AF",

          tabBarStyle: hideTabBar
            ? { display: "none" }
            : {
                height: 60,
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor: "#E5E7EB",
                elevation: 6,
              },

          tabBarItemStyle: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        };
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="home"
              color={color}
              focused={focused}
              iconSize={iconSize}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="read"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="book"
              color={color}
              focused={focused}
              iconSize={iconSize}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="games"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="game-controller"
              color={color}
              focused={focused}
              iconSize={iconSize}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="parent"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="lock-closed"
              color={color}
              focused={focused}
              iconSize={iconSize}
            />
          ),
        }}
      />

      <Tabs.Screen name="(read)" options={{ href: null }} />
      <Tabs.Screen name="(games)" options={{ href: null }} />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
  iconSize,
}: {
  name: IconName;
  color: string;
  focused: boolean;
  iconSize: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const iconName: IconName = focused ? name : (`${name}-outline` as IconName);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name={iconName} size={iconSize} color={color} />
    </Animated.View>
  );
}
