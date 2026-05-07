import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { clueHuntItems, ClueItem } from "./clueHuntData";

function shuffleArray<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getRoundData(data: ClueItem[], count = 10) {
  return shuffleArray(data).slice(0, count);
}

export default function ClueHuntGame() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isCompact = width < 760 || height < 430;

  const [sessionData, setSessionData] = useState<ClueItem[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">(
    "idle",
  );
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    setSessionData(getRoundData(clueHuntItems, 10));
  }, []);

  const current = sessionData[index];
  const finished = sessionData.length > 0 && index >= sessionData.length;

  const progress = useMemo(() => {
    if (sessionData.length === 0) return 0;
    return (index / sessionData.length) * 100;
  }, [index, sessionData.length]);

  useEffect(() => {
    if (current) {
      setOptions(shuffleArray(current.options));
      setSelected(null);
      setFeedback("idle");
      setLocked(false);
    }
  }, [index, current]);

  function checkAnswer() {
    if (!current || !selected) return;

    setLocked(true);

    if (selected === current.answer) {
      setScore((s) => s + 1);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      setIndex((i) => i + 1);
    }, 1000);
  }

  function resetGame() {
    setSessionData(getRoundData(clueHuntItems, 10));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFeedback("idle");
    setLocked(false);
  }

  /* Navigate back to games screen */
  function navigateToGames() {
    // Reset the game state before navigating
    resetGame();
    // Use replace to go directly to the games screen
    router.replace("/(kid)/games");
  }

  if (finished) {
    return (
      <ImageBackground
        source={require("../../../../assets/general/bg_landscape.webp")}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 bg-white/80 items-center justify-center px-4">
          <View className="bg-white items-center border-4 border-green-200 px-12 py-10 rounded-[40px]">
            <Text className="text-6xl font-extrabold text-green-600 mb-4">
              Great Job!
            </Text>

            <Text className="text-3xl font-bold text-gray-700 mb-8">
              Score: {score} / {sessionData.length}
            </Text>

            <Pressable
              onPress={navigateToGames}
              className="bg-gray-300 px-12 py-5 rounded-full border-b-4 border-gray-500"
            >
              <Text className="text-gray-800 font-bold text-xl">
                Back to Games
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../assets/general/bg_landscape.webp")}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-white/80 px-6 py-4">
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-sans-bold text-green-800">
            Clue Hunt
          </Text>

          <Pressable
            onPress={() => setShowExitModal(true)}
            className="w-12 h-12 bg-black/70 rounded-full items-center justify-center"
          >
            <Text className="text-white text-2xl">x</Text>
          </Pressable>
        </View>

        {/* PROGRESS */}
        <View className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <View
            className="h-full bg-green-400"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* TOP INFO BAR */}
        <View className="flex-row justify-between items-center bg-white/90 rounded-2xl px-4 py-3 mb-4 border border-green-100">
          <Text className="text-base font-bold text-gray-700">
            Round {index + 1} / {sessionData.length}
          </Text>

          <Text className="text-base font-extrabold text-green-600">
            Score: {score} / {sessionData.length}
          </Text>
        </View>

        <ScrollView className="flex-1">
          <View className="flex-1 justify-between">
            {/* SCENARIO */}
            <View className="bg-white p-6 rounded-3xl border-2 border-green-100 mb-6">
              <Text className="text-xl font-bold text-gray-800 text-center">
                {current?.scenario}
              </Text>
            </View>

            {/* OPTIONS */}
            <View className="gap-4">
              {options.map((opt, i) => (
                <Pressable
                  key={i}
                  onPress={() => !locked && setSelected(opt)}
                  className={`p-5 rounded-2xl border-b-4 ${
                    selected === opt
                      ? "bg-green-400 border-green-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text className="text-lg font-bold text-gray-800 text-center">
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* FEEDBACK + BUTTON */}
            <View className="mt-6 items-center">
              {feedback === "correct" && (
                <Text className="text-green-500 text-3xl font-extrabold">
                  Awesome!
                </Text>
              )}
              {feedback === "wrong" && (
                <Text className="text-red-500 text-3xl font-extrabold">
                  Sorry, Incorrect.
                </Text>
              )}

              <Pressable
                onPress={checkAnswer}
                disabled={!selected || locked}
                className={`mt-4 px-12 py-5 rounded-full border-b-4 ${
                  selected && !locked
                    ? "bg-green-500 border-green-700"
                    : "bg-gray-300 border-gray-400"
                }`}
              >
                <Text className="text-white font-bold text-xl">
                  Check Answer
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* EXIT MODAL */}
      <Modal transparent visible={showExitModal}>
        <View className="flex-1 bg-black/60 items-center justify-center">
          <View className="bg-white p-8 rounded-3xl items-center w-[320px]">
            <Text className="text-2xl font-extrabold mb-6">Quit Game?</Text>

            <View className="flex-row gap-4">
              <Pressable
                onPress={() => setShowExitModal(false)}
                className="bg-gray-200 px-6 py-4 rounded-xl"
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={navigateToGames}
                className="bg-red-500 px-6 py-4 rounded-xl"
              >
                <Text className="text-white">Quit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
