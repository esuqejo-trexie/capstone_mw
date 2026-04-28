import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useMemo } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import rawIpaData from "../../lib/ipa.json";
import {
  clearLearnerSession,
  getLearnerSession,
} from "../../lib/sessions/kidSession";

const ipaData = rawIpaData as Record<
  string,
  { ipa: string; def1: string; def2: string }
>;

export default function HomeScreen() {
  const router = useRouter();
  const learnerData = getLearnerSession();

  const { width, height } = useWindowDimensions();

  const scale = Math.min(width / 812, height / 375);
  const rf = (size: number) => Math.round(size * scale);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // ✅ RANDOM WORD OF THE DAY (filtered)
  const wordOfTheDay = useMemo(() => {
    const stopwords = new Set([
      "a",
      "an",
      "the",
      "is",
      "are",
      "was",
      "were",
      "be",
      "to",
      "of",
      "and",
      "in",
      "on",
      "at",
      "for",
      "with",
      "by",
      "it",
      "as",
    ]);

    const validWords = Object.keys(ipaData).filter((word) => {
      const data = ipaData[word];

      const hasDefinition =
        (data.def1 && data.def1.trim().length > 0) ||
        (data.def2 && data.def2.trim().length > 0);

      const isValidWord = word.length > 2 && !stopwords.has(word);

      return hasDefinition && isValidWord;
    });

    if (!validWords.length) return null;

    const randomWord =
      validWords[Math.floor(Math.random() * validWords.length)];

    return {
      word: randomWord,
      ...ipaData[randomWord],
    };
  }, []);

  const handleLogout = () => {
    clearLearnerSession(); // clears stored learner
    router.replace("/"); // prevents back navigation
  };

  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80 px-6 py-4 justify-between">
        <View className="absolute top-10 right-6 z-50">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-full"
          >
            <Text
              style={{ fontSize: rf(14) }}
              className="text-white font-sans-bold"
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
        {/* 🔹 TOP: Greeting */}
        <View className="items-center mt-2">
          <Text
            style={{ fontSize: rf(28) }}
            className="font-sans-bold text-secondary"
          >
            Hello, {learnerData?.name ?? "Learner"}!
          </Text>

          <Text
            style={{ fontSize: rf(16), marginTop: rf(6) }}
            className="font-sans-medium text-gray-600"
          >
            Let’s learn a new word today ✨
          </Text>
        </View>

        {/* 🔹 WORD POP */}
        <View className="items-center mt-6">
          <View
            style={{
              paddingTop: rf(36), // ✅ extra space for badge
              paddingBottom: rf(24),
              paddingHorizontal: rf(32),
              borderRadius: rf(30),
              width: "65%",
              maxWidth: 500, // ✅ prevent overflow on large screens
              backgroundColor: "#FFFDF5",
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
            }}
            className="border-2 border-yellow-400 items-center relative"
          >
            {/* 🔹 Header Badge */}
            <View
              style={{
                top: -rf(12), // ✅ reduced overlap
                paddingHorizontal: rf(16),
                paddingVertical: rf(4),
              }}
              className="absolute bg-yellow-400 rounded-full"
            >
              <Text
                style={{ fontSize: rf(14) }}
                className="font-sans-bold text-yellow-900 uppercase tracking-widest"
              >
                ⭐ Word Pop
              </Text>
            </View>

            {wordOfTheDay ? (
              <>
                <Text
                  style={{ fontSize: rf(36) }}
                  className="font-sans-extrabold text-gray-800 tracking-tight"
                >
                  {wordOfTheDay.word}
                </Text>

                {wordOfTheDay.ipa && (
                  <View
                    style={{
                      marginTop: rf(4),
                      paddingHorizontal: rf(10),
                      paddingVertical: rf(2),
                    }}
                    className="bg-blue-50 rounded-lg"
                  >
                    <Text
                      style={{ fontSize: rf(18) }}
                      className="text-blue-500 font-sans-medium"
                    >
                      {wordOfTheDay.ipa}
                    </Text>
                  </View>
                )}

                {wordOfTheDay.def1 && (
                  <View
                    style={{ marginTop: rf(16), paddingTop: rf(16) }}
                    className="border-t border-yellow-200 w-full"
                  >
                    <Text
                      style={{ fontSize: rf(16), lineHeight: rf(22) }}
                      className="text-gray-600 text-center font-sans-medium italic"
                    >
                      "{wordOfTheDay.def1}"
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={{ fontSize: rf(16) }} className="text-gray-400">
                Finding a new word...
              </Text>
            )}
          </View>
        </View>

        {/* 🔹 BOTTOM */}
        <View className="items-center mb-2">
          <Text
            style={{ fontSize: rf(14) }}
            className="font-sans-medium text-gray-400"
          >
            Keep learning and earn stars ⭐
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
