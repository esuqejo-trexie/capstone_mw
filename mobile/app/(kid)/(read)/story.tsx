import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  sendToSTT,
  startRecording,
  stopRecording,
} from "../../../lib/azure/stt";
import { speakText } from "../../../lib/azure/tts";

export default function StoryScreen() {
  const { width } = useWindowDimensions();
  const { level } = useLocalSearchParams<{ level?: string }>();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const sentence = "The cat is on the mat.";

  const handleStart = async () => {
    setTranscript(null);
    setIsRecording(true);
    await startRecording();
  };

  const handleStop = async () => {
    setIsRecording(false);
    const audioBlob = await stopRecording();
    if (!audioBlob) return;

    try {
      const result = await sendToSTT(audioBlob);
      setTranscript(result?.text ?? "No text recognized");
    } catch {
      setTranscript("Error recognizing speech");
    }
  };

  const handleReset = async () => {
    try {
      if (isRecording) await stopRecording();
    } finally {
      setIsRecording(false);
      setTranscript(null);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-6 py-4">
          {/* TOP - LEVEL */}
          <Text className="text-2xl font-sans-bold text-secondary">
            Level {level}
          </Text>

          {/* CENTER CONTENT */}
          <View className="flex-1 items-center justify-center gap-10">
            {/* SENTENCE */}
            <View className="bg-white rounded-3xl border-4 border-blue-300 shadow-xl px-10 py-5 max-w-[70%]">
              <Text
                className="text-center font-sans-extrabold text-gray-800"
                style={{ fontSize: width * 0.035 }}
                adjustsFontSizeToFit
                numberOfLines={2}
              >
                {sentence}
              </Text>
            </View>

            {/* BUTTON ROW */}
            <View className="flex-row items-center justify-center gap-8">
              {/* LISTEN */}
              <TouchableOpacity
                onPress={() => speakText(sentence)}
                disabled={isRecording}
                className={`rounded-full px-8 py-4 border-2 ${
                  isRecording
                    ? "bg-blue-300 border-blue-200"
                    : "bg-blue-500 border-blue-400"
                }`}
              >
                <Text
                  className="text-white font-sans-extrabold"
                  style={{ fontSize: width * 0.028 }}
                >
                  Listen
                </Text>
              </TouchableOpacity>

              {/* READ / STOP */}
              {!isRecording ? (
                <TouchableOpacity
                  onPress={handleStart}
                  className="bg-green-500 rounded-full px-8 py-4 border-2 border-green-400"
                >
                  <Text
                    className="text-white font-sans-extrabold"
                    style={{ fontSize: width * 0.028 }}
                  >
                    Read
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleStop}
                  className="bg-red-500 rounded-full px-8 py-4 border-2 border-red-400"
                >
                  <Text
                    className="text-white font-sans-extrabold"
                    style={{ fontSize: width * 0.028 }}
                  >
                    Stop
                  </Text>
                </TouchableOpacity>
              )}

              {/* TRY AGAIN */}
              <TouchableOpacity
                onPress={handleReset}
                disabled={isRecording}
                className={`rounded-full px-8 py-4 border-2 ${
                  transcript
                    ? "bg-gray-500 border-gray-400"
                    : "bg-gray-300 border-gray-200"
                }`}
              >
                <Text
                  className="text-white font-sans-extrabold"
                  style={{ fontSize: width * 0.028 }}
                >
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FEEDBACK */}
          {transcript && (
            <View className="bg-white rounded-xl px-6 py-4 border border-gray-300 shadow">
              <Text className="text-lg font-sans-bold text-secondary">
                Heard:
              </Text>
              <Text className="text-base mt-1 text-gray-800">{transcript}</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
