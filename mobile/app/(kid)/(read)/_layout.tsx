import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";

export default function ReadStackLayout() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false, // kid UI = no headers
        animation: "slide_from_right", // smooth navigation
      }}
    >
      {/* Story selection */}
      <Stack.Screen name="stories" />

      {/* Actual reading activity */}
      <Stack.Screen name="story" />
    </Stack>
  );
}
