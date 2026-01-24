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
import { generateAIFeedback } from "../../../lib/reading/feedbackGenerator";
import { typography } from "../../../lib/ui/typography";

export default function StoryScreen() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const { height } = useWindowDimensions();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  const [readingResult, setReadingResult] = useState<{
    accuracy: number;
    correct: number;
    total: number;
    missed: string[];
    extra: string[];
  } | null>(null);

  const [aiFeedback, setAiFeedback] = useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const sentence = "The cat is sitting on the mat.";

  const handleStart = async () => {
    setTranscript(null);
    setReadingResult(null);
    setAiFeedback("");
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

      const score = compareReading(sentence, text);
      setReadingResult(score);

      setIsGeneratingFeedback(true);

      const feedback = await generateAIFeedback({
        targetSentence: sentence,
        transcription: text,
        accuracy: score.accuracy,
        errors: {
          missed: score.missed,
          extra: score.extra,
          mispronounced: [],
        },
      });

      setAiFeedback(feedback);
      setIsGeneratingFeedback(false);
      setShowFeedback(true);
    } catch (error) {
      console.error("Reading error:", error);
      setTranscript("Error recognizing speech");
      setAiFeedback("Let’s try again together!");
      setIsGeneratingFeedback(false);
      setShowFeedback(true);
    }
  };

  const handleReset = async () => {
    try {
      if (isRecording) await stopRecording();
    } finally {
      setIsRecording(false);
      setTranscript(null);
      setReadingResult(null);
      setAiFeedback("");
    }
  };

  function getFallbackFeedback(accuracy: number) {
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
        <SafeAreaView className="flex-1 px-6 py-4">
          {/* HEADER */}
          <Text
            style={{ fontSize: typography.header }}
            className="font-sans-bold text-secondary mb-4"
          >
            Level {level}
          </Text>

          {/* MAIN */}
          <View className="flex-1 items-center justify-center">
            <View
              className="flex-row bg-white rounded-[40px] border-4 border-blue-300 shadow-2xl w-full max-w-[900px]"
              style={{ minHeight: height * 0.55 }}
            >
              {/* LEFT PAGE */}
              <View className="w-1/2 items-center justify-center p-6 border-r-2 border-blue-200">
                <Image
                  source={require("../../../assets/stories/cat.webp")}
                  resizeMode="contain"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: height * 0.45,
                  }}
                />
              </View>

              {/* RIGHT PAGE */}
              <View className="w-1/2 p-6 justify-between">
                <View className="flex-1 justify-center">
                  <Text
                    style={{ fontSize: typography.story }}
                    className="text-center font-sans-extrabold text-gray-800 leading-snug"
                  >
                    {sentence}
                  </Text>
                </View>

                <View className="flex-row justify-center gap-6 mt-6">
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
                      style={{ fontSize: typography.button }}
                      className="text-white font-sans-extrabold"
                    >
                      Listen
                    </Text>
                  </TouchableOpacity>

                  {!isRecording ? (
                    <TouchableOpacity
                      onPress={handleStart}
                      className="bg-green-500 rounded-full px-8 py-4 border-2 border-green-400"
                    >
                      <Text
                        style={{ fontSize: typography.button }}
                        className="text-white font-sans-extrabold"
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
                        style={{ fontSize: typography.button }}
                        className="text-white font-sans-extrabold"
                      >
                        Stop
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* FEEDBACK MODAL */}
          <Modal visible={showFeedback} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View className="bg-white rounded-3xl px-8 py-6 w-[80%] max-w-[520px] items-center gap-4 shadow-xl">
                <Text
                  style={{ fontSize: typography.header }}
                  className="font-sans-bold text-secondary"
                >
                  Reading Feedback
                </Text>

                {readingResult && (
                  <>
                    <Text
                      style={{ fontSize: typography.body }}
                      className="font-sans-extrabold text-green-600"
                    >
                      Accuracy: {readingResult.accuracy}%
                    </Text>

                    <Text
                      style={{ fontSize: typography.body }}
                      className="text-gray-700 text-center"
                    >
                      {isGeneratingFeedback
                        ? "Thinking of feedback..."
                        : aiFeedback ||
                          getFallbackFeedback(readingResult.accuracy)}
                    </Text>

                    <View className="bg-gray-100 rounded-xl px-4 py-3 w-full">
                      <Text
                        style={{ fontSize: typography.caption }}
                        className="font-sans-bold text-secondary"
                      >
                        You said:
                      </Text>
                      <Text
                        style={{ fontSize: typography.caption }}
                        className="text-gray-700 mt-1"
                      >
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
                    <Text
                      style={{ fontSize: typography.button }}
                      className="text-white font-sans-bold"
                    >
                      Try Again
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowFeedback(false)}
                    className="bg-green-500 rounded-full px-6 py-3"
                  >
                    <Text
                      style={{ fontSize: typography.button }}
                      className="text-white font-sans-bold"
                    >
                      Continue
                    </Text>
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
