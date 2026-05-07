import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
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

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getWordData } from "../../../lib/ipa";

import { submitReadingResult } from "../../../lib/reading/submitReadingResult";
import { getLearnerSession } from "../../../lib/sessions/kidSession";

import { startRecording, stopRecording } from "../../../lib/audio/recorder";
import { assessPronunciation } from "../../../lib/azure/pronunciationAssessment";
import { transcribeSpeech } from "../../../lib/azure/transcribeSpeech";
import { speakText } from "../../../lib/azure/tts";
import { generateAIFeedback } from "../../../lib/reading/feedbackGenerator";
import { typography } from "../../../lib/ui/typography";

import { developingContent } from "../../../lib/reading/developingContent";
import type { MCQOption } from "../../../lib/reading/emergingContent";

import { emergingContent } from "../../../lib/reading/emergingContent";

import { computeDevelopingFinalScore } from "./activities/developingActivity";
import {
  computeEmergingFinalScore,
  computeStars,
  computeTotalComprehension,
  getEmergingStep,
  getPracticeMessage,
  isWordCorrect,
  resetEmergingProgress,
} from "./activities/emergingActivity";

type WordResult = {
  word: string;
  accuracy?: number;
  errorType?: string;
};

type NormalizedQuestion = {
  question: string;
  options: MCQOption[];
};

function getQuestions(
  activity: any,
  isDeveloping: boolean,
): NormalizedQuestion[] {
  if (isDeveloping) {
    return [
      {
        question: activity.literalQuestion,
        options: activity.literalOptions,
      },
      {
        question: activity.inferentialQuestion,
        options: activity.inferentialOptions,
      },
    ];
  }

  if (activity.question && activity.options) {
    return [
      {
        question: activity.question,
        options: activity.options,
      },
    ];
  }

  return [];
}

function shuffleOptions<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function normalizeReadingProfile(profile?: string): "Spark" | "Ember" {
  const value = profile?.trim().toLowerCase();

  if (
    value === "developing" ||
    value === "Developing" ||
    value === "developing reader" ||
    value === "ember" ||
    value === "Ember" ||
    value === "ember learner"
  ) {
    return "Ember";
  }

  if (
    value === "emerging" ||
    value === "Emerging" ||
    value === "emerging reader" ||
    value === "spark" ||
    value === "Spark" ||
    value === "spark learner"
  ) {
    return "Spark";
  }

  return "Spark";
}

export default function StoryScreen() {
  const { level, exercise: exerciseParam } = useLocalSearchParams<{
    level?: string;
    exercise?: string;
  }>();

  const router = useRouter();
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

  type Phase =
    | "listen"
    | "practice"
    | "read"
    | "readingFeedback"
    | "question"
    | "questionFeedback";

  const [phase, setPhase] = useState<Phase>("listen");

  const [readingProfile, setReadingProfile] = useState<"Spark" | "Ember">(
    "Spark",
  );
  const [practiceStep, setPracticeStep] = useState(0);
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [practiceMessage, setPracticeMessage] = useState("");
  const [showPracticeModal, setShowPracticeModal] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedScore, setSelectedScore] = useState<0 | 1 | 2 | null>(null);
  const [comprehensionScores, setComprehensionScores] = useState<(0 | 1 | 2)[]>(
    [],
  );

  const [showMCQ, setShowMCQ] = useState(false);
  const [pendingMCQ, setPendingMCQ] = useState(false);
  const [showFinalFeedback, setShowFinalFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<MCQOption | null>(null);
  const [comprehensionCorrect, setComprehensionCorrect] = useState<
    boolean | null
  >(null);

  const [shuffledOptions, setShuffledOptions] = useState<MCQOption[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  const [readingResult, setReadingResult] = useState<{
    stars: number;
    correct: number;
    total: number;
    missed: string[];
    extra: string[];
  } | null>(null);

  const [readingMetrics, setReadingMetrics] = useState<{
    accuracyScore: number;
    completenessScore: number;
    fluencyScore: number;
    pronScore: number;
    finalScore: number;
    stars: number;
  } | null>(null);

  const [aiFeedback, setAiFeedback] = useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const comprehensionResult = computeTotalComprehension(comprehensionScores);

  const starScale = useRef(new Animated.Value(0)).current;
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDurationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* LOAD LEARNER PROFILE */

  useEffect(() => {
    const learnerRef = doc(
      db,
      "schools",
      schoolId,
      "classes",
      classId,
      "learners",
      learnerId,
    );

    const unsubscribe = onSnapshot(learnerRef, (snapshot) => {
      const data: any = snapshot.data();
      if (data?.readingProfile) {
        setReadingProfile(normalizeReadingProfile(data.readingProfile));
      }
    });

    return () => unsubscribe();
  }, [schoolId, classId, learnerId]);

  /* STAR ANIMATION */

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

  const isDevelopingProfile = readingProfile === "Ember";

  const content = (
    isDevelopingProfile ? developingContent : emergingContent
  ) as any[];

  const activity = content[exerciseIndex] as {
    text: string;
  } & any;
  const sentence = activity.text;

  const wordCount = sentence.split(" ").length;

  // base size
  let storySize = rf(typography.story);

  // scale down based on length
  if (wordCount > 6) storySize = rf(typography.story * 0.9);
  if (wordCount > 10) storySize = rf(typography.story * 0.8);
  if (wordCount > 14) storySize = rf(typography.story * 0.7);

  let words: string[] = [];
  let isPhraseStep = true;
  let displayText = sentence;

  if (!isDevelopingProfile) {
    const stepData = getEmergingStep(sentence, practiceStep);
    words = stepData.words;
    isPhraseStep = stepData.isPhraseStep;
    displayText = stepData.displayText;
  }

  const resetSilenceTimer = () => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
    }

    silenceTimer.current = setTimeout(() => {
      console.log("Auto-stop: silence detected");
      handleStop();
    }, 3000);
  };

  const handleStart = async () => {
    setTranscript(null);
    setReadingResult(null);
    setAiFeedback("");
    setIsRecording(true);

    await startRecording();

    maxDurationTimer.current = setTimeout(() => {
      console.log("Auto-stop: max duration reached");
      handleStop();
    }, 10000);

    resetSilenceTimer();

    const interval = setInterval(() => {
      if (!isRecording) {
        clearInterval(interval);
        return;
      }
      resetSilenceTimer();
    }, 1000);
  };

  const handleStop = async () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (maxDurationTimer.current) clearTimeout(maxDurationTimer.current);

    setIsRecording(false);

    const audioUri = await stopRecording();
    if (!audioUri) return;

    // 🔹 Emerging word practice
    if (!isDevelopingProfile && !isPhraseStep) {
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

    // 🔹 Final reading assessment
    try {
      const realTranscript = await transcribeSpeech(audioUri);
      function fixNames(transcript: string, reference: string) {
        const refWords = reference.split(" ");
        const transWords = transcript.split(" ");

        return transWords
          .map((word) => {
            const lower = word.toLowerCase();

            // find close match in reference (simple match)
            const match = refWords.find(
              (ref) =>
                ref.toLowerCase().startsWith(lower[0]) && // same starting sound
                Math.abs(ref.length - word.length) <= 2, // similar length
            );

            return match || word;
          })
          .join(" ");
      }
      const json: any = await assessPronunciation(audioUri, sentence);
      console.log("REAL TRANSCRIPT:", realTranscript);

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

      let displayTranscript = realTranscript;

      if (!realTranscript || realTranscript.trim() === "") {
        displayTranscript =
          "We couldn’t understand your reading. Please try again in English.";
      }

      setTranscript(displayTranscript);

      const missed = words
        .filter((w) => w.errorType === "Omission")
        .map((w) => w.word);

      const extra = words
        .filter((w) => w.errorType === "Insertion")
        .map((w) => w.word);

      const mispronounced = words
        .filter((w) => w.errorType === "Mispronunciation")
        .map((w) => w.word);

      // ✅ FIXED SCORING
      const finalScore = isDevelopingProfile
        ? computeDevelopingFinalScore(
            accuracyScore,
            completenessScore,
            fluencyScore,
          )
        : computeEmergingFinalScore(
            accuracyScore,
            completenessScore,
            fluencyScore,
          );

      const stars = computeStars(finalScore);
      setReadingMetrics({
        accuracyScore,
        completenessScore,
        fluencyScore,
        pronScore,
        finalScore,
        stars,
      });

      const score = {
        stars,
        correct: words.filter((w) => w.errorType === "None").length,
        total: words.length,
        missed,
        extra,
      };

      setReadingResult(score);

      setIsGeneratingFeedback(true);

      const feedback = await generateAIFeedback({
        targetSentence: sentence,
        transcription: realTranscript,
        accuracy: accuracyScore, // already fixed
        stars, // 🔥 ADD THIS
        errors: {
          missed,
          extra: [], // ignore
          mispronounced,
        },
      });

      setAiFeedback(feedback);
      setIsGeneratingFeedback(false);

      const questions = getQuestions(activity, isDevelopingProfile);

      if (questions.length > 0) {
        const currentQ = questions[questionIndex];

        if (currentQ?.options) {
          setShuffledOptions(shuffleOptions(currentQ.options));
          setPendingMCQ(true);
        }
      }

      setShowFeedback(true);

      if (questions.length === 0) {
        try {
          await submitReadingResult({
            schoolId,
            classId,
            learnerId,
            activity: exerciseIndex + 1,
            profile: readingProfile,

            // ✅ USE LOCAL VALUES (NOT STATE)
            accuracyScore,
            completenessScore,
            fluencyScore,
            pronScore,

            finalScore,
            stars,

            comprehensionScore: 0,
            comprehensionMaxScore: 0,
          });
        } catch (err) {
          console.error("Fallback submit error:", err);
        }
      }
    } catch (error) {
      console.error("Reading error:", error);

      setTranscript("Error recognizing speech");
      setAiFeedback("Let’s try again together!");
      setIsGeneratingFeedback(false);
      setShowFeedback(true);
      const questions = getQuestions(activity, isDevelopingProfile);

      if (questions.length > 0) {
        const currentQ = questions[questionIndex];

        if (currentQ?.options) {
          setShuffledOptions(shuffleOptions(currentQ.options));
          setPendingMCQ(true);
        }
      }
      // 👇 ADD HERE
      if (questions.length === 0) {
        try {
          await submitReadingResult({
            schoolId,
            classId,
            learnerId,
            activity: exerciseIndex + 1,
            profile: readingProfile,

            // ❗ no valid scores in error → use safe defaults
            accuracyScore: 0,
            completenessScore: 0,
            fluencyScore: 0,
            pronScore: 0,

            finalScore: 0,
            stars: 0,

            comprehensionScore: 0,
            comprehensionMaxScore: 0,
          });
        } catch (err) {
          console.error("Fallback submit error (catch):", err);
        }
      }
    }
  };

  const handleListen = async () => {
    if (isRecording || isPlaying) return;

    try {
      setIsPlaying(true);
      await speakText(displayText);
    } catch (e) {
      console.log("TTS error:", e);
    } finally {
      setIsPlaying(false);
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
                style={{ padding: rf(24) }}
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
                <View className="flex-1 justify-center items-center">
                  {isDevelopingProfile ? (
                    // ✅ DEVELOPING → FULL SENTENCE
                    <View className="flex-row flex-wrap justify-center max-w-[90%]">
                      {sentence
                        .split(" ")
                        .map((word: string, index: number) => {
                          const cleanWord = word.replace(/[.,!?]/g, ""); // remove punctuation
                          const data = getWordData(cleanWord);

                          return (
                            <View key={index} className="items-center mx-2">
                              <Text
                                style={{
                                  fontSize: storySize,
                                  lineHeight: storySize + rf(6),
                                }}
                                className="font-sans-extrabold text-gray-800"
                              >
                                {word}
                              </Text>

                              {data?.ipa && (
                                <Text
                                  style={{ fontSize: rf(typography.caption) }}
                                  className="text-gray-500"
                                >
                                  {data.ipa}
                                </Text>
                              )}
                            </View>
                          );
                        })}
                    </View>
                  ) : !isPhraseStep ? (
                    // ✅ EMERGING → WORD PRACTICE
                    (() => {
                      const data = getWordData(displayText);

                      return (
                        <View className="items-center">
                          <Text
                            style={{
                              fontSize: rf(typography.story),
                              lineHeight: rf(typography.story + 6),
                            }}
                            className="text-center font-sans-extrabold text-gray-800"
                          >
                            {displayText}
                          </Text>

                          {data?.ipa && (
                            <Text
                              style={{ fontSize: rf(typography.caption) }}
                              className="text-gray-500 mt-1"
                            >
                              {data.ipa}
                            </Text>
                          )}
                        </View>
                      );
                    })()
                  ) : (
                    // ✅ EMERGING → PHRASE STEP
                    <View className="flex-row flex-wrap justify-center">
                      {words.map((word, index) => {
                        const data = getWordData(word);

                        return (
                          <View key={index} className="items-center mx-2">
                            <Text
                              style={{
                                fontSize: rf(typography.story),
                                lineHeight: rf(typography.story + 6),
                              }}
                              className="font-sans-extrabold text-gray-800"
                            >
                              {word}
                            </Text>

                            {data?.ipa && (
                              <Text
                                style={{ fontSize: rf(typography.caption) }}
                                className="text-gray-500"
                              >
                                {data.ipa}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View
                  style={{ marginTop: rf(20), gap: rf(20) }}
                  className="flex-row justify-center"
                >
                  <TouchableOpacity
                    onPress={handleListen}
                    disabled={isRecording || isPlaying}
                    style={{
                      paddingVertical: rf(14),
                      paddingHorizontal: rf(28),
                      borderRadius: rf(50),
                      borderWidth: 2,
                      opacity: isRecording || isPlaying ? 0.6 : 1,
                    }}
                    className="bg-blue-500 border-blue-400"
                  >
                    <Text
                      style={{ fontSize: rf(typography.button) }}
                      className="text-white font-sans-extrabold"
                    >
                      {isPlaying ? "Playing..." : "Listen"}
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
                  showsVerticalScrollIndicator
                  contentContainerStyle={{
                    alignItems: "center",
                    paddingBottom: rf(10),
                  }}
                >
                  <Text
                    style={{
                      fontSize: rfs(typography.header),
                      marginBottom: rf(6),
                    }}
                    className="font-sans-bold text-secondary text-center"
                  >
                    Reading Feedback
                  </Text>

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
                          : aiFeedback}
                      </Text>

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
                      const reset = resetEmergingProgress();

                      setPracticeStep(reset.practiceStep);
                      setPracticeAttempts(reset.practiceAttempts);
                      setComprehensionScores([]);

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

                      if (pendingMCQ) {
                        setPendingMCQ(false);
                        setShowMCQ(true); // show MCQ AFTER feedback
                      } else {
                        router.back();
                      }
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

          {/* MCQ MODAL - UPDATED: Submit button only active when answer selected */}

          <Modal visible={showMCQ} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View className="bg-white rounded-3xl p-8 w-[50%] items-center">
                <Text className="text-2xl font-sans-bold text-secondary mb-6 text-center">
                  {
                    getQuestions(activity, isDevelopingProfile)[questionIndex]
                      ?.question
                  }
                </Text>

                {shuffledOptions.map((opt, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      !comprehensionCorrect && setSelectedAnswer(opt)
                    }
                    className={`w-full py-3 px-6 rounded-xl mb-3 ${
                      selectedAnswer === opt ? "bg-blue-400" : "bg-gray-200"
                    } ${comprehensionCorrect !== null ? "opacity-50" : "opacity-100"}`}
                    disabled={comprehensionCorrect !== null}
                  >
                    <Text className="text-center font-sans-bold text-gray-800">
                      {opt.text}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Feedback only shows after submission */}
                {comprehensionCorrect !== null && (
                  <Text className="mt-4 text-lg font-sans-bold text-center">
                    {isDevelopingProfile
                      ? selectedAnswer?.feedback
                      : selectedAnswer?.score === 2
                        ? "Great job! You understood it well 👍"
                        : selectedAnswer?.score === 1
                          ? "Almost there! Keep practicing 😊"
                          : "Let's try again next time 💪"}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => {
                    if (!selectedAnswer || comprehensionCorrect !== null)
                      return;

                    const isCorrect =
                      selectedAnswer.text === activity.correctAnswer;
                    const pcmScore = selectedAnswer.score;

                    setComprehensionCorrect(isCorrect);
                    setComprehensionScores((prev) => [...prev, pcmScore]);

                    setTimeout(async () => {
                      const questions = getQuestions(
                        activity,
                        isDevelopingProfile,
                      );

                      if (questionIndex < questions.length - 1) {
                        // 👉 go to next question
                        const nextIndex = questionIndex + 1;

                        setQuestionIndex(nextIndex);
                        setSelectedAnswer(null);
                        setComprehensionCorrect(null);

                        const nextQ = questions[nextIndex];

                        if (nextQ?.options) {
                          setShuffledOptions(shuffleOptions(nextQ.options));
                        }
                      } else {
                        // 👉 all questions done
                        setShowMCQ(false);

                        setComprehensionCorrect(null);
                        setShuffledOptions([]);

                        setQuestionIndex(0);

                        // 🧠 compute comprehension
                        const updatedScores = [
                          ...comprehensionScores,
                          pcmScore,
                        ];

                        const comprehensionResult =
                          computeTotalComprehension(updatedScores);

                        // ✅ submit AFTER MCQ is complete
                        if (readingMetrics) {
                          await submitReadingResult({
                            schoolId,
                            classId,
                            learnerId,
                            activity: exerciseIndex + 1,
                            profile: readingProfile,

                            accuracyScore: readingMetrics.accuracyScore,
                            completenessScore: readingMetrics.completenessScore,
                            fluencyScore: readingMetrics.fluencyScore,
                            pronScore: readingMetrics.pronScore,

                            finalScore: readingMetrics.finalScore,
                            stars: readingMetrics.stars,

                            comprehensionScore: comprehensionResult.score,
                            comprehensionMaxScore: comprehensionResult.maxScore,
                          });
                          console.log("🚀 CALLING CLOUD FUNCTION");
                        }

                        // 👉 show final UI
                        setShowFinalFeedback(true);
                      }
                    }, 1200);
                  }}
                  className={`px-8 py-3 rounded-full mt-6 ${
                    !selectedAnswer || comprehensionCorrect !== null
                      ? "bg-gray-400"
                      : "bg-green-500"
                  }`}
                  disabled={!selectedAnswer || comprehensionCorrect !== null}
                >
                  <Text className="text-white font-sans-bold">Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* FINAL FEEDBACK MODAL */}

          <Modal visible={showFinalFeedback} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View
                style={{
                  width: width * 0.6, // ✅ not full width
                  maxWidth: 520, // ✅ caps size on tablets
                  maxHeight: height * 0.75, // ✅ prevents overflow
                  borderRadius: rf(28),
                }}
                className="bg-white overflow-hidden"
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: rf(20),
                    paddingTop: rf(20),
                    paddingBottom: rf(16),
                    alignItems: "center",
                  }}
                >
                  {/* TITLE */}
                  <Text
                    style={{ fontSize: rfs(26), marginBottom: rf(4) }}
                    className="font-sans-bold text-secondary text-center"
                  >
                    🎉 Great Work!
                  </Text>

                  <Text
                    style={{ fontSize: rfs(14), marginBottom: rf(14) }}
                    className="text-gray-500 text-center"
                  >
                    Here’s how you did in this activity
                  </Text>

                  {/* ⭐ READING */}
                  <View className="w-full bg-yellow-50 rounded-2xl p-4 mb-4 items-center">
                    <Text className="font-sans-bold text-gray-700 mb-2">
                      📖 Reading Performance
                    </Text>

                    <Text style={{ fontSize: rfs(34) }}>
                      {readingResult?.stars === 0
                        ? "😊"
                        : "⭐".repeat(readingResult?.stars ?? 0)}
                    </Text>

                    <Text className="text-sm text-gray-600 text-center mt-1">
                      {readingResult?.stars === 3
                        ? "Excellent reading!"
                        : readingResult?.stars === 2
                          ? "Good job! Keep improving!"
                          : readingResult?.stars === 1
                            ? "Nice try! Practice more!"
                            : "Let’s keep practicing!"}
                    </Text>
                  </View>

                  {/* 🧠 COMPREHENSION */}
                  <View className="w-full bg-blue-50 rounded-2xl p-4 mb-4">
                    <Text className="font-sans-bold text-gray-700 mb-2 text-center">
                      🧠 Comprehension
                    </Text>

                    <Text className="text-lg text-center font-sans-bold text-blue-600 mb-1">
                      {comprehensionResult.score} /{" "}
                      {comprehensionResult.maxScore}
                    </Text>

                    {isDevelopingProfile && (
                      <View className="mt-2">
                        <View className="flex-row justify-between">
                          <Text>Literal</Text>
                          <Text className="font-sans-bold">
                            {comprehensionScores[0] ?? 0} / 2
                          </Text>
                        </View>

                        <View className="flex-row justify-between">
                          <Text>Inferential</Text>
                          <Text className="font-sans-bold">
                            {comprehensionScores[1] ?? 0} / 2
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* BUTTON */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowFinalFeedback(false);
                      setSelectedAnswer(null);
                      setComprehensionScores([]);
                      router.back();
                    }}
                    style={{
                      paddingHorizontal: rf(28),
                      paddingVertical: rf(12),
                      borderRadius: rf(50),
                      marginTop: rf(6),
                    }}
                    className="bg-green-500"
                  >
                    <Text className="text-white font-sans-bold">Continue</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
