import { useLocalSearchParams } from "expo-router";
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
import { speakText } from "../../../lib/azure/tts";

export default function StoryScreen() {
  const { width } = useWindowDimensions();
  const { level } = useLocalSearchParams<{ level?: string }>();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // ✅ TEMP hardcoded sentence for Azure TTS testing
  const sentence = "Oh no... that was sad. I want to cry.";

  return (
    <ImageBackground
      source={require("../../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      {/* Background + white overlay act as ONE */}
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-4 py-4 justify-center">
          {/* Header */}
          <View className="mb-6">
            <Text
              className="text-3xl font-sans-bold text-left text-secondary"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              Level {level}
            </Text>
          </View>

          {/* Sentence Display */}
          <View className="flex-1 items-center justify-center">
            <View className="bg-white rounded-3xl px-8 py-6 shadow-xl border-4 border-blue-300 max-w-[80%]">
              <Text
                className="text-center font-sans-extrabold text-secondary"
                style={{ fontSize: width * 0.045 }}
                adjustsFontSizeToFit
              >
                {sentence}
              </Text>
            </View>
          </View>

          {/* TEMP Listen Button (Azure TTS entry point) */}
          <View className="items-center">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                speakText(sentence);
              }}
              className="bg-blue-500 rounded-2xl px-10 py-4 shadow-lg border-4 border-blue-400"
            >
              <Text
                className="text-white font-sans-extrabold"
                style={{ fontSize: width * 0.03 }}
              >
                Listen
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
