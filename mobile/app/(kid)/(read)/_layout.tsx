import { Stack } from "expo-router";

export default function ReadStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // kid UI = no headers
        animation: "slide_from_right", // smooth navigation
      }}
    >
      {/* Story selection / story view */}
      <Stack.Screen name="story" />
    </Stack>
  );
}
