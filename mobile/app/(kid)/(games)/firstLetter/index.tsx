import { wordImages } from "@/lib/assets/wordImages";
import { speakWord } from "@/lib/azure/tts";
import { emergingQuestions } from "@/lib/games/firstLetterData";
import { saveGameSession } from "@/lib/games/saveGameSession";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* shuffle helper */
function shuffleArray<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

/* generate question set */
function generateQuestions() {
  return shuffleArray(emergingQuestions).slice(0, 10);
}

export default function FirstLetterGame() {
  const router = useRouter();

  const [questions, setQuestions] = useState(() => generateQuestions());
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;

  const question = questions[roundIndex];
  const finished = roundIndex >= questions.length;

  const progress = useMemo(
    () => (roundIndex / questions.length) * 100,
    [roundIndex, questions.length],
  );

  /* orientation lock */
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  /* attention pulse animation */
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, []);

  /* reset round - for retry/new round within same session */
  function resetRound(newSet: boolean) {
    if (newSet) {
      setQuestions(generateQuestions());
    }
    setRoundIndex(0);
    setScore(0);
    setSelected(null);
    setLocked(false);
    setSaved(false);
  }

  /* save game session */
  async function saveResult() {
    if (saved) return;

    await saveGameSession({
      game: "firstLetterQuest",
      score,
      maxScore: questions.length,
      ticketsSpent: 1,
      completed: finished,
    });

    setSaved(true);
  }

  /* AUTO SAVE WHEN GAME FINISHES */
  useEffect(() => {
    if (finished) {
      saveResult();
    }
  }, [finished]);

  function handleChoice(letter: string) {
    if (locked) return;

    setSelected(letter);
    setLocked(true);

    const correct = letter === question.correctLetter;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setSelected(null);
      setLocked(false);
      setRoundIndex((i) => i + 1);
    }, 900);
  }

  function handleImagePress() {
    if (locked) return;
    speakWord(question.spokenWord ?? question.displayWord);
  }

  /* Navigate back to games screen */
  function navigateToGames() {
    // Use replace to go directly to the games screen
    // The exact path should match your route structure
    router.replace("/(kid)/games");
  }

  /* ================= FINISHED ================= */
  if (finished) {
    return (
      <ImageBackground
        source={require("../../../../assets/general/bg_landscape.webp")}
        className="flex-1"
        resizeMode="cover"
      >
        <SafeAreaView className="flex-1 bg-white/70 items-center justify-center px-6">
          <Text className="text-5xl font-sans-bold text-secondary mb-6">
            Finished!
          </Text>

          <Text className="text-3xl font-sans-semibold mb-12">
            Score: {score} / {questions.length}
          </Text>

          <View className="flex-row gap-6 flex-wrap justify-center">
            <Pressable
              onPress={navigateToGames}
              className="bg-secondary px-10 py-5 rounded-3xl"
            >
              <Text className="text-white text-xl font-sans-bold">
                Back to Games
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  /* ================= GAME ================= */
  return (
    <ImageBackground
      source={require("../../../../assets/general/bg_landscape.webp")}
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1 bg-white/70 px-5 py-4">
        {/* EXIT BUTTON */}
        <View className="absolute right-5 top-4 z-50">
          <Pressable
            onPress={() => setShowExitModal(true)}
            className="w-12 h-12 rounded-full bg-black/70 items-center justify-center"
          >
            <Text className="text-white text-2xl font-bold">×</Text>
          </Pressable>
        </View>

        {/* PROGRESS BAR */}
        <View className="w-full h-5 bg-white rounded-full overflow-hidden mb-4">
          <View
            className="h-full bg-green-400"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* CONTENT */}
        <View className="flex-1 flex-row">
          {/* IMAGE SIDE */}
          <View className="flex-1 items-center justify-center">
            <Pressable disabled={locked} onPress={handleImagePress}>
              {({ pressed }) => (
                <Animated.View
                  style={{
                    transform: [
                      { scale: pulse },
                      { scale: pressed ? 0.93 : 1 },
                    ],
                  }}
                  className="h-[85%] max-h-[420px] aspect-square border-[3px] border-gray-500 rounded-3xl bg-white items-center justify-center shadow-lg"
                >
                  <Image
                    source={
                      wordImages[question.word as keyof typeof wordImages]
                    }
                    className="w-[92%] h-[92%]"
                    resizeMode="contain"
                  />

                  <View className="absolute bottom-3 right-3 bg-black/70 px-3 py-2 rounded-full">
                    <Text className="text-white text-lg">🔊</Text>
                  </View>
                </Animated.View>
              )}
            </Pressable>

            <Text className="mt-3 text-base md:text-lg lg:text-xl font-sans-semibold text-gray-700">
              Tap image to hear word.
            </Text>
          </View>

          {/* QUESTION SIDE */}
          <View className="flex-1 items-center justify-center px-3">
            <Text className="text-xl md:text-2xl font-sans-semibold text-center mb-5">
              What is the first letter of this word?
            </Text>

            <Text className="text-5xl md:text-6xl font-sans-bold text-secondary mb-10 tracking-widest leading-[72px] md:leading-[84px]">
              {"_" + question.displayWord.slice(1)}
            </Text>

            <View className="flex-row flex-wrap justify-center gap-5">
              {question.options.map((letter) => {
                const isCorrect = letter === question.correctLetter;
                const isChosen = selected === letter;

                let color = "bg-blue-400";

                if (selected) {
                  if (isChosen && isCorrect) color = "bg-green-500";
                  else if (isChosen && !isCorrect) color = "bg-red-500";
                  else if (isCorrect) color = "bg-green-500";
                  else color = "bg-gray-300";
                }

                return (
                  <Pressable
                    key={letter}
                    disabled={locked}
                    onPress={() => handleChoice(letter)}
                    className={`w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-3xl items-center justify-center ${color}`}
                  >
                    <Text className="text-white text-4xl md:text-5xl font-sans-bold">
                      {letter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View className="flex-row justify-between items-center pt-3">
          <Text className="text-lg font-sans-semibold">
            Round {roundIndex + 1} / {questions.length}
          </Text>

          <Text className="text-lg font-sans-semibold">Score: {score}</Text>
        </View>
      </SafeAreaView>

      {/* EXIT MODAL */}
      <Modal transparent visible={showExitModal} animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white w-full max-w-md rounded-3xl p-8 items-center">
            <Text className="text-2xl font-sans-bold mb-4 text-center">
              Are you sure you want to quit?
            </Text>

            <Text className="text-base text-gray-600 text-center mb-8">
              Your progress will be saved.
            </Text>

            <View className="flex-row gap-6">
              <Pressable
                onPress={() => setShowExitModal(false)}
                className="bg-gray-400 px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-sans-bold text-lg">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  await saveResult();
                  setShowExitModal(false);
                  navigateToGames();
                }}
                className="bg-red-500 px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-sans-bold text-lg">Quit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
