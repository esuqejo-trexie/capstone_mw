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

import { sentenceShuffleData, SVOItem } from "../sentenceShuffle/sentenceData";

type Part = {
  type: "subject" | "verb" | "object";
  text: string;
};

function shuffleArray<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getRoundData(data: SVOItem[], count = 10) {
  return shuffleArray(data).slice(0, count);
}

function buildParts(item: SVOItem): Part[] {
  return shuffleArray([
    { type: "subject", text: item.subject },
    { type: "verb", text: item.verb },
    { type: "object", text: item.object },
  ]);
}

export default function SentenceShuffleGame() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isCompact = width < 760 || height < 430;

  const [sessionData, setSessionData] = useState<SVOItem[]>([]);
  const [index, setIndex] = useState(0);
  const [parts, setParts] = useState<Part[]>([]);
  const [selected, setSelected] = useState<Part[]>([]);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">(
    "idle",
  );
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    setSessionData(getRoundData(sentenceShuffleData, 10));
  }, []);

  const current = sessionData[index];
  const finished = sessionData.length > 0 && index >= sessionData.length;

  const progress = useMemo(() => {
    if (sessionData.length === 0) return 0;
    return (index / sessionData.length) * 100;
  }, [index, sessionData.length]);

  useEffect(() => {
    if (!finished && current) {
      setParts(buildParts(current));
      setSelected([]);
      setFeedback("idle");
      setLocked(false);
    }
  }, [index, current, finished]);

  const userSentence = selected.map((p) => p.text).join(" ");

  function handleSelect(part: Part, i: number) {
    if (locked) return;

    const newParts = [...parts];
    newParts.splice(i, 1);

    setParts(newParts);
    setSelected((prev) => [...prev, part]);
  }

  function handleRemove(i: number) {
    if (locked) return;

    const newSel = [...selected];
    const removed = newSel.splice(i, 1)[0];

    setSelected(newSel);
    setParts((prev) => shuffleArray([...prev, removed]));
  }

  function checkAnswer() {
    if (!current || selected.length !== 3) return;

    setLocked(true);

    if (userSentence === current.correct) {
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
    setSessionData(getRoundData(sentenceShuffleData, 10));
    setIndex(0);
    setScore(0);
    setSelected([]);
    setFeedback("idle");
    setLocked(false);
  }

  if (finished) {
    return (
      <ImageBackground
        source={require("../../../../assets/general/bg_landscape.webp")}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 bg-white/80 items-center justify-center px-4">
          <View
            className={`bg-white items-center border-4 border-blue-200 ${
              isCompact
                ? "w-full px-6 py-6 rounded-[24px]"
                : "px-16 py-10 rounded-[40px]"
            }`}
          >
            <Text
              className={`font-extrabold mb-4 text-blue-600 text-center ${
                isCompact ? "text-4xl" : "text-6xl"
              }`}
            >
              Great Job!
            </Text>

            <Text
              className={`mb-8 font-bold text-gray-700 ${
                isCompact ? "text-xl" : "text-3xl"
              }`}
            >
              Score: {score} / {sessionData.length}
            </Text>

            <Pressable
              onPress={resetGame}
              className={`bg-blue-500 rounded-full border-b-4 border-blue-700 active:border-b-0 active:mt-1 mb-4 ${
                isCompact ? "px-8 py-4" : "px-12 py-5"
              }`}
            >
              <Text
                className={`text-white font-bold ${
                  isCompact ? "text-lg" : "text-2xl"
                }`}
              >
                Play Again
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              className={`bg-gray-300 rounded-full border-b-4 border-gray-500 active:border-b-0 active:mt-1 ${
                isCompact ? "px-8 py-4" : "px-12 py-5"
              }`}
            >
              <Text
                className={`text-gray-800 font-bold ${
                  isCompact ? "text-lg" : "text-2xl"
                }`}
              >
                Back to Games
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const isCheckReady = selected.length === 3 && !locked;

  return (
    <ImageBackground
      source={require("../../../../assets/general/bg_landscape.webp")}
      className="flex-1"
    >
      <SafeAreaView
        className={`flex-1 bg-white/80 ${
          isCompact ? "px-3 py-2" : "px-6 py-4"
        }`}
      >
        <View
          className={`flex-row justify-between items-center ${
            isCompact ? "mb-2" : "mb-3"
          }`}
        >
          <Text
            className={`font-extrabold text-blue-800 ${
              isCompact ? "text-xl" : "text-2xl"
            }`}
          >
            Sentence Shuffle
          </Text>

          <Pressable
            onPress={() => setShowExitModal(true)}
            className={`rounded-full bg-black/70 items-center justify-center ${
              isCompact ? "w-10 h-10" : "w-12 h-12"
            }`}
          >
            <Text className="text-white text-2xl">x</Text>
          </Pressable>
        </View>

        <View
          className={`w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300 ${
            isCompact ? "h-3 mb-2" : "h-4 mb-4"
          }`}
        >
          <View
            className="h-full bg-green-400"
            style={{ width: `${progress}%` }}
          />
        </View>

        <View className={`flex-1 ${isCompact ? "gap-2" : "flex-row gap-6"}`}>
          {!isCompact && (
            <View className="w-[30%] bg-blue-50 rounded-3xl p-5 border-2 border-blue-100 justify-between shadow-sm">
              <View>
                <Text className="font-extrabold text-xl text-blue-800 mb-3">
                  How to Play
                </Text>

                <Text className="text-base text-gray-700 mb-2 font-medium">
                  1. Tap words to pick them
                </Text>
                <Text className="text-base text-gray-700 mb-4 font-medium">
                  2. Put them in order
                </Text>

                <View className="bg-white p-3 rounded-xl border border-blue-100 mb-4">
                  <Text className="text-blue-700 font-bold text-center">
                    Subject - Verb - Object
                  </Text>
                </View>

                <Text className="text-sm text-gray-800 mb-1">
                  <Text className="font-bold text-blue-600">Subject:</Text> Who
                  or what
                </Text>
                <Text className="text-sm text-gray-800 mb-1">
                  <Text className="font-bold text-green-600">Verb:</Text>{" "}
                  Action word
                </Text>
                <Text className="text-sm text-gray-800 mb-3">
                  <Text className="font-bold text-orange-500">Object:</Text>{" "}
                  Gets the action
                </Text>

                <Text className="text-sm font-bold text-gray-500 bg-gray-100 p-2 rounded-lg">
                  Example: The boy kicks the ball
                </Text>
              </View>

              <View className="bg-white p-3 rounded-2xl border border-blue-100">
                <Text className="text-base font-bold text-gray-600">
                  Round {index + 1} of {sessionData.length}
                </Text>
                <Text className="text-lg font-extrabold text-green-600">
                  Score: {score}
                </Text>
              </View>
            </View>
          )}

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingVertical: isCompact ? 4 : 8,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-between">
              {isCompact && (
                <View className="flex-row justify-between items-center bg-white/90 rounded-2xl px-3 py-2 mb-2 border border-blue-100">
                  <Text className="text-sm font-bold text-gray-600">
                    Round {index + 1} of {sessionData.length}
                  </Text>
                  <Text className="text-sm font-extrabold text-green-600">
                    Score: {score}
                  </Text>
                </View>
              )}

              <View
                className={`bg-white border-4 border-dashed border-gray-300 flex-row flex-wrap justify-center items-center ${
                  isCompact
                    ? "rounded-[20px] p-3 min-h-[88px] gap-2"
                    : "rounded-[30px] p-6 min-h-[120px] gap-4"
                }`}
              >
                {selected.length === 0 && (
                  <Text
                    className={`text-gray-400 font-bold text-center ${
                      isCompact ? "text-base" : "text-xl"
                    }`}
                  >
                    Tap words below to build your sentence
                  </Text>
                )}

                {selected.map((p, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleRemove(i)}
                    className={`bg-blue-400 rounded-2xl border-b-4 border-blue-600 active:border-b-0 active:mt-1 ${
                      isCompact ? "px-4 py-3" : "px-6 py-4"
                    }`}
                  >
                    <Text
                      className={`text-white font-bold ${
                        isCompact ? "text-base" : "text-xl"
                      }`}
                    >
                      {p.text}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View
                className={`flex-row flex-wrap justify-center ${
                  isCompact ? "gap-2 mt-3" : "gap-4 mt-6"
                }`}
              >
                {parts.map((p, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleSelect(p, i)}
                    className={`bg-white rounded-2xl border-b-4 border-gray-300 shadow-sm active:border-b-0 active:mt-1 ${
                      isCompact ? "px-4 py-3" : "px-6 py-4"
                    }`}
                  >
                    <Text
                      className={`text-gray-800 font-bold ${
                        isCompact ? "text-base" : "text-xl"
                      }`}
                    >
                      {p.text}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View
                className={`items-center mt-auto ${
                  isCompact ? "gap-2 pt-3" : "flex-row justify-between"
                }`}
              >
                <View className={isCompact ? "w-full min-h-[28px]" : "w-1/2"}>
                  {feedback === "correct" && (
                    <Text
                      className={`text-green-500 font-extrabold ${
                        isCompact ? "text-xl text-center" : "text-3xl"
                      }`}
                    >
                      Awesome!
                    </Text>
                  )}
                  {feedback === "wrong" && (
                    <Text
                      className={`text-red-500 font-extrabold ${
                        isCompact ? "text-xl text-center" : "text-3xl"
                      }`}
                    >
                      Sorry, Incorrect.
                    </Text>
                  )}
                </View>

                <Pressable
                  onPress={checkAnswer}
                  disabled={!isCheckReady}
                  className={`rounded-full border-b-4 ${
                    isCompact ? "w-full py-4" : "px-12 py-5"
                  } ${
                    isCheckReady
                      ? "bg-green-500 border-green-700 active:border-b-0 active:mt-1"
                      : "bg-gray-300 border-gray-400"
                  }`}
                >
                  <Text
                    className={`font-extrabold text-center ${
                      isCompact ? "text-lg" : "text-xl"
                    } ${isCheckReady ? "text-white" : "text-gray-500"}`}
                  >
                    Check Answer
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <Modal transparent visible={showExitModal}>
        <View className="flex-1 bg-black/60 items-center justify-center px-4">
          <View
            className={`bg-white p-8 rounded-[30px] items-center ${
              isCompact ? "w-full max-w-[340px]" : "w-[350px]"
            }`}
          >
            <Text className="text-2xl font-extrabold mb-6 text-gray-800">
              Quit Game?
            </Text>

            <View className="flex-row gap-4 w-full">
              <Pressable
                onPress={() => setShowExitModal(false)}
                className="flex-1 bg-gray-200 py-4 rounded-2xl items-center border-b-4 border-gray-300 active:border-b-0 active:mt-1"
              >
                <Text className="text-gray-700 font-bold text-lg">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                className="flex-1 bg-red-500 py-4 rounded-2xl items-center border-b-4 border-red-700 active:border-b-0 active:mt-1"
              >
                <Text className="text-white font-bold text-lg">Quit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
