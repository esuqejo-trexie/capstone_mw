import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { ImageBackground, Text, View } from "react-native";

export default function HomeScreen() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80 items-center justify-center">
        <Text className="text-2xl font-bold">Home Screen</Text>
      </View>
    </ImageBackground>
  );
}
