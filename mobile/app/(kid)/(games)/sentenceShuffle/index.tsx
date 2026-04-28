import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ IMPORT DATA
import { sentenceShuffleData, SVOItem } from "../sentenceShuffle/sentenceData";

/* ========================= TYPES ========================= */
type Part = {
  type: "subject" | "verb" | "object";
  text: string;
};

/* ========================= HELPERS ========================= */
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

/* ========================= COMPONENT ========================= */
export default function SentenceShuffleGame() {
  const router = useRouter();

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

  /* ✅ INIT: GET 10 ITEMS ONLY */
  useEffect(() => {
    setSessionData(getRoundData(sentenceShuffleData, 10));
  }, []);

  const current = sessionData[index];
  const finished = sessionData.length > 0 && index >= sessionData.length;

  const progress = useMemo(() => {
    if (sessionData.length === 0) return 0;
    return (index / sessionData.length) * 100;
  }, [index, sessionData.length]);

  /* INIT ROUND ITEM */
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

  /* ✅ RESET: NEW 10 ITEMS AGAIN */
  function resetGame() {
    setSessionData(getRoundData(sentenceShuffleData, 10));
    setIndex(0);
    setScore(0);
    setSelected([]);
    setFeedback("idle");
    setLocked(false);
  }

  /* ================= FINISHED ================= */
  if (finished) {
    return (
      <ImageBackground
        source={require("../../../../assets/general/bg_landscape.webp")}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 bg-white/80 items-center justify-center">
          <View className="bg-white px-16 py-10 rounded-[40px] items-center border-4 border-blue-200">
            <Text className="text-6xl font-extrabold mb-4 text-blue-600">
              🎉 Great Job!
            </Text>

            <Text className="text-3xl mb-8 font-bold text-gray-700">
              Score: {score} / {sessionData.length}
            </Text>

            {/* PLAY AGAIN */}
            <Pressable
              onPress={resetGame}
              className="bg-blue-500 px-12 py-5 rounded-full border-b-4 border-blue-700 active:border-b-0 active:mt-1 mb-4"
            >
              <Text className="text-white text-2xl font-bold">Play Again</Text>
            </Pressable>

            {/* BACK TO GAMES */}
            <Pressable
              onPress={() => router.back()}
              className="bg-gray-300 px-12 py-5 rounded-full border-b-4 border-gray-500 active:border-b-0 active:mt-1"
            >
              <Text className="text-gray-800 text-2xl font-bold">
                Back to Games
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const isCheckReady = selected.length === 3 && !locked;

  /* ================= GAME ================= */
  return (
    <ImageBackground
      source={require("../../../../assets/general/bg_landscape.webp")}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-white/80 px-6 py-4">
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-extrabold text-blue-800">
            Sentence Shuffle
          </Text>

          <Pressable
            onPress={() => setShowExitModal(true)}
            className="w-12 h-12 rounded-full bg-black/70 items-center justify-center"
          >
            <Text className="text-white text-2xl">×</Text>
          </Pressable>
        </View>

        {/* PROGRESS */}
        <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4 border border-gray-300">
          <View
            className="h-full bg-green-400"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* MAIN GAME AREA */}
        <View className="flex-1 flex-row gap-6">
          {/* LEFT PANEL: INSTRUCTIONS */}
          <View className="w-[30%] bg-blue-50 rounded-3xl p-5 border-2 border-blue-100 justify-between shadow-sm">
            <View>
              <Text className="font-extrabold text-xl text-blue-800 mb-3">
                🧠 How to Play
              </Text>

              <Text className="text-base text-gray-700 mb-2 font-medium">
                1. Tap words to pick them
              </Text>
              <Text className="text-base text-gray-700 mb-4 font-medium">
                2. Put them in order
              </Text>

              <View className="bg-white p-3 rounded-xl border border-blue-100 mb-4">
                <Text className="text-blue-700 font-bold text-center">
                  Subject → Verb → Object
                </Text>
              </View>

              <Text className="text-sm text-gray-800 mb-1">
                <Text className="font-bold text-blue-600">Subject:</Text> Who or
                what
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                <Text className="font-bold text-green-600">Verb:</Text> Action
                word
              </Text>
              <Text className="text-sm text-gray-800 mb-3">
                <Text className="font-bold text-orange-500">Object:</Text> Gets
                the action
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

          {/* RIGHT PANEL: PLAY AREA */}
          <View className="flex-1 justify-between py-2">
            {/* DROP ZONE */}
            <View className="bg-white rounded-[30px] border-4 border-dashed border-gray-300 p-6 min-h-[120px] flex-row flex-wrap justify-center items-center gap-4">
              {selected.length === 0 && (
                <Text className="text-gray-400 text-xl font-bold">
                  Tap words below to build your sentence ✨
                </Text>
              )}

              {selected.map((p, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleRemove(i)}
                  className="bg-blue-400 px-6 py-4 rounded-2xl border-b-4 border-blue-600 active:border-b-0 active:mt-1"
                >
                  <Text className="text-white text-xl font-bold">{p.text}</Text>
                </Pressable>
              ))}
            </View>

            {/* CHOICES */}
            <View className="flex-row flex-wrap justify-center gap-4 mt-6">
              {parts.map((p, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSelect(p, i)}
                  className="bg-white px-6 py-4 rounded-2xl border-b-4 border-gray-300 shadow-sm active:border-b-0 active:mt-1"
                >
                  <Text className="text-gray-800 text-xl font-bold">
                    {p.text}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* FEEDBACK & ACTION BUTTON */}
            <View className="flex-row items-center justify-between mt-auto">
              <View className="w-1/2">
                {feedback === "correct" && (
                  <Text className="text-green-500 font-extrabold text-3xl">
                    ✅ Awesome!
                  </Text>
                )}
                {feedback === "wrong" && (
                  <Text className="text-red-500 font-extrabold text-3xl">
                    ❌ Sorry, Incorrect.
                  </Text>
                )}
              </View>

              <Pressable
                onPress={checkAnswer}
                disabled={!isCheckReady}
                className={`px-12 py-5 rounded-full border-b-4 ${
                  isCheckReady
                    ? "bg-green-500 border-green-700 active:border-b-0 active:mt-1"
                    : "bg-gray-300 border-gray-400"
                }`}
              >
                <Text
                  className={`text-xl font-extrabold ${isCheckReady ? "text-white" : "text-gray-500"}`}
                >
                  Check Answer
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* EXIT MODAL */}
      <Modal transparent visible={showExitModal}>
        <View className="flex-1 bg-black/60 items-center justify-center">
          <View className="bg-white p-8 rounded-[30px] w-[350px] items-center">
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
