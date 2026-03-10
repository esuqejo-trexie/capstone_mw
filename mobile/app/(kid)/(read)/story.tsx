import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { saveReadingSession } from "../../../lib/reading/saveReadingSession";
import { getLearnerSession } from "../../../lib/sessions/kidSession";

import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { startRecording, stopRecording } from "../../../lib/audio/recorder";
import { assessPronunciation } from "../../../lib/azure/pronunciationAssessment";
import { speakText } from "../../../lib/azure/tts";
import { generateAIFeedback } from "../../../lib/reading/feedbackGenerator";
import { typography } from "../../../lib/ui/typography";

import { emergingContent } from "../../../lib/reading/emergingContent";

// NEW: Emerging activity engine
import {
  computeEmergingFinalScore,
  computePronunciation,
  computeStars,
  getEmergingStep,
  getPracticeMessage,
  isWordCorrect,
} from "../(read)/activities/emergingActivity";

type WordResult = {
  word: string;
  accuracy?: number;
  errorType?: string;
};

export default function StoryScreen() {
  const { level, exercise: exerciseParam } = useLocalSearchParams<{
    level?: string;
    exercise?: string;
  }>();

  const { width, height } = useWindowDimensions();

  const { schoolId, classId, learnerId } = getLearnerSession();

  const scale = Math.min(width / 812, height / 375);
  const rf = (size: number) => Math.round(size * scale);
  const rfs = (size: number) => {
    const scaled = size * scale;
    const min = size * 0.9;
    return Math.max(min, scaled);
  };

  const initialExerciseIndex = exerciseParam
    ? Math.max(Number(exerciseParam) - 1, 0)
    : 0;

  const [exerciseIndex] = useState(initialExerciseIndex);

  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [practiceMessage, setPracticeMessage] = useState("");
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  const [readingResult, setReadingResult] = useState<{
    stars: number;
    correct: number;
    total: number;
    missed: string[];
    extra: string[];
  } | null>(null);

  const [aiFeedback, setAiFeedback] = useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const starScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showFeedback) {
      starScale.setValue(0);

      Animated.spring(starScale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [showFeedback]);

  const router = useRouter();

  const activity = emergingContent[exerciseIndex];
  const sentence = activity.text;

  const { words, isPhraseStep, displayText } = getEmergingStep(
    sentence,
    practiceStep,
  );

  const handleStart = async () => {
    setTranscript(null);
    setReadingResult(null);
    setAiFeedback("");
    setIsRecording(true);
    await startRecording();
  };

  const handleStop = async () => {
    setIsRecording(false);

    const audioUri = await stopRecording();
    if (!audioUri) return;

    // WORD PRACTICE STEP
    if (!isPhraseStep) {
      try {
        const json: any = await assessPronunciation(audioUri, displayText);

        if (!json?.NBest?.length) {
          setPracticeMessage("Let's try again!");
          setShowPracticeModal(true);
          return;
        }

        const nbest = json.NBest[0];

        const wordResults: WordResult[] =
          nbest?.Words?.map((w: any) => ({
            word: w.Word,
            accuracy: w.PronunciationAssessment?.AccuracyScore,
            errorType: w.PronunciationAssessment?.ErrorType,
          })) || [];

        const correct = isWordCorrect(wordResults);

        const { message, nextAttempts, proceed } = getPracticeMessage(
          correct,
          practiceAttempts,
        );

        setPracticeMessage(message);
        setPracticeAttempts(nextAttempts);
        setShowPracticeModal(true);

        if (proceed) {
          setPracticeStep((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Practice step error:", error);
        setPracticeMessage("Let's try again!");
        setShowPracticeModal(true);
      }

      return;
    }

    // FINAL PHRASE STEP
    try {
      const json: any = await assessPronunciation(audioUri, sentence);

      if (!json?.NBest?.length) {
        throw new Error("No speech recognized");
      }

      const nbest = json.NBest[0];
      const assessment = nbest.PronunciationAssessment;

      const accuracyScore = assessment?.AccuracyScore || 0;
      const completenessScore = assessment?.CompletenessScore || 0;
      const fluencyScore = assessment?.FluencyScore || 0;
      const pronScore = assessment?.PronScore || 0;

      const words: WordResult[] =
        nbest?.Words?.map((w: any) => ({
          word: w.Word,
          accuracy: w.PronunciationAssessment?.AccuracyScore,
          errorType: w.PronunciationAssessment?.ErrorType,
        })) || [];

      const recognizedText = json.DisplayText || "";
      setTranscript(recognizedText);

      const missed = words
        .filter((w) => w.errorType === "Omission")
        .map((w) => w.word);

      const extra = words
        .filter((w) => w.errorType === "Insertion")
        .map((w) => w.word);

      const mispronounced = words
        .filter((w) => w.errorType === "Mispronunciation")
        .map((w) => w.word);

      // COMPUTE SCORES
      const pronunciation = computePronunciation(
        accuracyScore,
        completenessScore,
      );

      const finalScore = computeEmergingFinalScore(pronunciation);

      const stars = computeStars(finalScore);

      const score = {
        stars,
        correct: words.filter((w) => w.errorType === "None").length,
        total: words.length,
        missed,
        extra,
      };

      setReadingResult(score);

      // SAVE SESSION TO FIRESTORE
      await saveReadingSession({
        schoolId,
        classId,
        learnerId,
        activity: exerciseIndex + 1,
        profile: "Emerging",
        accuracyScore,
        completenessScore,
        fluencyScore,
        pronScore,
        pronunciationScore: pronunciation,
        stars,
      });

      setIsGeneratingFeedback(true);

      const feedback = await generateAIFeedback({
        targetSentence: sentence,
        transcription: recognizedText,
        accuracy: finalScore,
        errors: {
          missed,
          extra,
          mispronounced,
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
        <SafeAreaView
          style={{
            paddingHorizontal: rf(24),
            paddingVertical: rf(16),
          }}
          className="flex-1"
        >
          <Text
            style={{ fontSize: rf(typography.header), marginBottom: rf(16) }}
            className="font-sans-bold text-secondary"
          >
            Activity {exerciseIndex + 1}
          </Text>

          <View className="flex-1 items-center justify-center">
            <View
              className="flex-row bg-white border-4 border-blue-300 shadow-2xl w-full"
              style={{
                borderRadius: rf(40),
                maxWidth: 900,
                minHeight: rf(200),
              }}
            >
              <View
                style={{
                  padding: rf(24),
                }}
                className="w-1/2 items-center justify-center border-r-2 border-blue-200"
              >
                <Image
                  source={activity.image}
                  resizeMode="contain"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: rf(180),
                  }}
                />
              </View>

              <View
                style={{ padding: rf(24) }}
                className="w-1/2 justify-between"
              >
                <View className="flex-1 justify-center">
                  <Text
                    style={{
                      fontSize: rf(typography.story),
                      lineHeight: rf(typography.story + 6),
                    }}
                    className="text-center font-sans-extrabold text-gray-800"
                  >
                    {displayText}
                  </Text>
                </View>

                <View
                  style={{ marginTop: rf(20), gap: rf(20) }}
                  className="flex-row justify-center"
                >
                  <TouchableOpacity
                    onPress={() => speakText(displayText)}
                    disabled={isRecording}
                    style={{
                      paddingVertical: rf(14),
                      paddingHorizontal: rf(28),
                      borderRadius: rf(50),
                      borderWidth: 2,
                    }}
                    className={`${
                      isRecording
                        ? "bg-blue-300 border-blue-200"
                        : "bg-blue-500 border-blue-400"
                    }`}
                  >
                    <Text
                      style={{ fontSize: rf(typography.button) }}
                      className="text-white font-sans-extrabold"
                    >
                      Listen
                    </Text>
                  </TouchableOpacity>

                  {!isRecording ? (
                    <TouchableOpacity
                      onPress={handleStart}
                      style={{
                        paddingVertical: rf(14),
                        paddingHorizontal: rf(28),
                        borderRadius: rf(50),
                        borderWidth: 2,
                      }}
                      className="bg-green-500 border-green-400"
                    >
                      <Text
                        style={{ fontSize: rf(typography.button) }}
                        className="text-white font-sans-extrabold"
                      >
                        Read
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleStop}
                      style={{
                        paddingVertical: rf(14),
                        paddingHorizontal: rf(28),
                        borderRadius: rf(50),
                        borderWidth: 2,
                      }}
                      className="bg-red-500 border-red-400"
                    >
                      <Text
                        style={{ fontSize: rf(typography.button) }}
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

          {/* PRACTICE MODAL */}
          <Modal visible={showPracticeModal} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View className="bg-white rounded-3xl p-8 items-center w-[40%]">
                <Text className="text-2xl font-sans-bold text-secondary mb-4">
                  {practiceMessage}
                </Text>

                <TouchableOpacity
                  onPress={() => setShowPracticeModal(false)}
                  className="bg-blue-500 px-8 py-3 rounded-full"
                >
                  <Text className="text-white font-sans-bold">Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* FEEDBACK MODAL */}
          <Modal visible={showFeedback} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View
                style={{
                  width: width * 0.72,
                  maxHeight: height * 0.85,
                  borderRadius: rf(28),
                  paddingHorizontal: rf(28),
                  paddingTop: rf(24),
                  paddingBottom: rf(16),
                }}
                className="bg-white"
              >
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{
                    alignItems: "center",
                    paddingBottom: rf(10),
                  }}
                >
                  {/* TITLE */}
                  <Text
                    style={{
                      fontSize: rfs(typography.header),
                      marginBottom: rf(6),
                    }}
                    className="font-sans-bold text-secondary text-center"
                  >
                    Reading Feedback
                  </Text>

                  {/* SCORE */}
                  {readingResult && (
                    <>
                      <Animated.Text
                        style={{
                          fontSize: rfs(70),
                          marginBottom: rf(12),
                          transform: [{ scale: starScale }],
                          textShadowColor: "#FFD700",
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 10,
                        }}
                      >
                        {readingResult.stars === 0
                          ? "😊"
                          : "⭐".repeat(readingResult.stars)}
                      </Animated.Text>

                      {/* AI FEEDBACK */}
                      <Text
                        style={{
                          fontSize: rfs(typography.body),
                          lineHeight: rf(typography.body + 8),
                          marginBottom: rf(16),
                          textAlign: "center",
                        }}
                        className="text-gray-700"
                      >
                        {isGeneratingFeedback
                          ? "Thinking of feedback..."
                          : aiFeedback ||
                            getFallbackFeedback(readingResult.stars)}
                      </Text>

                      {/* TRANSCRIPT */}
                      <View
                        style={{
                          padding: rf(16),
                          borderRadius: rf(16),
                          marginBottom: rf(18),
                        }}
                        className="bg-gray-100 w-full"
                      >
                        <Text
                          style={{ fontSize: rf(typography.caption) }}
                          className="font-sans-bold text-secondary"
                        >
                          You said:
                        </Text>

                        <Text
                          style={{
                            fontSize: rfs(typography.caption),
                            marginTop: rf(6),
                          }}
                          className="text-gray-700"
                        >
                          {transcript}
                        </Text>
                      </View>
                    </>
                  )}
                </ScrollView>

                {/* BUTTONS */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: rf(16),
                    marginTop: rf(6),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setShowFeedback(false);
                      handleReset();
                    }}
                    style={{
                      paddingHorizontal: rf(26),
                      paddingVertical: rf(12),
                      borderRadius: rf(50),
                    }}
                    className="bg-blue-500"
                  >
                    <Text
                      style={{ fontSize: rf(typography.button) }}
                      className="text-white font-sans-bold"
                    >
                      Try Again
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowFeedback(false);
                      router.back();
                    }}
                    style={{
                      paddingHorizontal: rf(26),
                      paddingVertical: rf(12),
                      borderRadius: rf(50),
                    }}
                    className="bg-green-500"
                  >
                    <Text
                      style={{ fontSize: rf(typography.button) }}
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
