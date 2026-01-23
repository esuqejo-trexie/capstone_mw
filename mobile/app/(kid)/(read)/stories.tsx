import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoriesScreen() {
  const { width } = useWindowDimensions();
  const { level } = useLocalSearchParams<{ level?: string }>();
  const router = useRouter();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const handleReadStory = () => {
    router.push(`/(kid)/(read)/story?level=${level ?? 1}`);
  };

  return (
    <ImageBackground
      source={require("../../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      {/* Background + white overlay act as ONE */}
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-4 py-4 justify-center">
          {/* Header (matches read.tsx) */}
          <View className="mb-4">
            <Text
              className="text-3xl font-sans-bold text-left text-secondary"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              Level {level}
            </Text>
          </View>

          {/* TEMP Story Button */}
          <View className="flex-1 items-center justify-center">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleReadStory}
              className="bg-blue-500 rounded-3xl w-[20%] aspect-[3/4] max-h-[80%] items-center justify-center shadow-xl border-4 border-blue-400"
            >
              <Text
                className="text-white font-sans-extrabold text-center"
                style={{ fontSize: width * 0.035 }}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                Read Story
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
