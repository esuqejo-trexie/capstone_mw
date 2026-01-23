import { useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
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
import { compareReading } from "../../../lib/reading/compareText";

export default function StoryScreen() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const { height } = useWindowDimensions();

  const IMAGE_MAX_HEIGHT = height * 0.68; // 🔒 hard safety cap

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<{
    accuracy: number;
    correct: number;
    total: number;
    missed: string[];
    extra: string[];
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const sentence = "The cat is on the mat.";

  const handleStart = async () => {
    setTranscript(null);
    setReadingResult(null);
    setIsRecording(true);
    await startRecording();
  };

  const handleStop = async () => {
    setIsRecording(false);
    const audioBlob = await stopRecording();
    if (!audioBlob) return;

    try {
      const result = await sendToSTT(audioBlob);
      const text = result?.text ?? "No text recognized";
      setTranscript(text);

      const resultScore = compareReading(sentence, text);
      setReadingResult(resultScore);
      setShowFeedback(true);
    } catch {
      setTranscript("Error recognizing speech");
      setReadingResult(null);
    }
  };

  const handleReset = async () => {
    try {
      if (isRecording) await stopRecording();
    } finally {
      setIsRecording(false);
      setTranscript(null);
      setReadingResult(null);
    }
  };

  function getFeedbackMessage(accuracy: number) {
    if (accuracy >= 90) return "Great job! 🎉";
    if (accuracy >= 70) return "Almost there! Try again 💪";
    return "Let’s practice more 😊";
  }

  return (
    <ImageBackground
      source={require("../../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-8 py-4">
          {/* HEADER */}
          <Text className="text-2xl font-sans-bold text-secondary mb-4">
            Level {level}
          </Text>

          {/* MAIN */}
          <View className="flex-1 flex-row items-center justify-center">
            {/* LEFT IMAGE */}
            <View className="w-[45%] items-center justify-center">
              <View
                className="bg-white rounded-3xl border-4 border-blue-300 shadow-xl p-4"
                style={{ maxHeight: height * 0.65 }}
              >
                <Image
                  source={require("../../../assets/stories/cat.webp")}
                  resizeMode="contain"
                  style={{
                    height: "100%",
                    aspectRatio: 3 / 4,
                    maxHeight: height * 0.65,
                  }}
                />
              </View>
            </View>

            {/* RIGHT CONTENT */}
            <View className="w-[55%] items-center px-4">
              {/* SENTENCE */}
              <View className="bg-white rounded-3xl border-4 border-blue-300 shadow-xl px-8 py-6 w-full max-w-[420px]">
                <Text
                  className="text-center font-sans-extrabold text-gray-800 text-3xl"
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {sentence}
                </Text>
              </View>

              {/* BUTTONS */}
              <View className="flex-row gap-6 mt-6">
                <TouchableOpacity
                  onPress={() => speakText(sentence)}
                  disabled={isRecording}
                  className={`rounded-full px-8 py-4 border-2 ${
                    isRecording
                      ? "bg-blue-300 border-blue-200"
                      : "bg-blue-500 border-blue-400"
                  }`}
                >
                  <Text className="text-white font-sans-extrabold text-xl">
                    Listen
                  </Text>
                </TouchableOpacity>

                {!isRecording ? (
                  <TouchableOpacity
                    onPress={handleStart}
                    className="bg-green-500 rounded-full px-8 py-4 border-2 border-green-400"
                  >
                    <Text className="text-white font-sans-extrabold text-xl">
                      Read
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleStop}
                    className="bg-red-500 rounded-full px-8 py-4 border-2 border-red-400"
                  >
                    <Text className="text-white font-sans-extrabold text-xl">
                      Stop
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* FEEDBACK MODAL (unchanged) */}
          <Modal visible={showFeedback} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View className="bg-white rounded-3xl px-8 py-6 w-[80%] max-w-[520px] items-center gap-4 shadow-xl">
                <Text className="text-2xl font-sans-bold text-secondary">
                  Reading Feedback
                </Text>

                {readingResult && (
                  <>
                    <Text className="text-xl font-sans-extrabold text-green-600">
                      Accuracy: {readingResult.accuracy}%
                    </Text>

                    <Text className="text-base text-gray-700 text-center">
                      {getFeedbackMessage(readingResult.accuracy)}
                    </Text>

                    <View className="bg-gray-100 rounded-xl px-4 py-3 w-full">
                      <Text className="text-sm font-sans-bold text-secondary">
                        You said:
                      </Text>
                      <Text className="text-sm text-gray-700 mt-1">
                        {transcript}
                      </Text>
                    </View>
                  </>
                )}

                <View className="flex-row gap-4 mt-4">
                  <TouchableOpacity
                    onPress={() => {
                      setShowFeedback(false);
                      handleReset();
                    }}
                    className="bg-blue-500 rounded-full px-6 py-3"
                  >
                    <Text className="text-white font-sans-bold">Try Again</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowFeedback(false)}
                    className="bg-green-500 rounded-full px-6 py-3"
                  >
                    <Text className="text-white font-sans-bold">Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
