import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getLearnerSession } from "../../lib/sessions/kidSession";

export default function ReadScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const learnerData = getLearnerSession();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const scale = Math.min(width / 812, height / 375);
  const rf = (size: number) => Math.round(size * scale);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const profileMessages: Record<
    string,
    { title: string; description: string }
  > = {
    Emerging: {
      title: "You are a Spark Learner ⭐",
      description: "Let's practice reading sounds and words together!",
    },
    Developing: {
      title: "You are an Ember Learner 🔥",
      description: "Let's practice reading words and sentences together!",
    },
    Transitioning: {
      title: "You are a Flame Learner 🔥🔥",
      description: "Let's read short passages and understand them!",
    },
    "Reading At Grade Level": {
      title: "You are a Blaze Learner 🔥🔥🔥",
      description: "Let's read stories and discover their meaning!",
    },
  };

  const profile = learnerData?.readingProfile ?? "";
  const message = profileMessages[profile];

  const handleStart = () => {
    router.push({
      pathname: "/(kid)/(read)/stories",
      params: { level: 1 },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      {/* KEEPING YOUR OVERLAY EXACTLY */}
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 items-center justify-center px-4">
          {/* CARD */}
          <View
            style={{
              width: "100%",
              maxWidth: 620,
              paddingVertical: rf(36),
              paddingHorizontal: rf(32),
              borderRadius: 28,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
            }}
            className="bg-white items-center"
          >
            {/* Greeting */}
            <Text
              style={{
                fontSize: rf(34),
              }}
              className="font-sans-bold text-secondary text-center"
            >
              Hello {learnerData?.name ?? "Learner"}!
            </Text>

            {/* Level Message */}
            {message && (
              <View className="items-center mt-5">
                {/* Learner Title */}
                <Text
                  style={{
                    fontSize: rf(26),
                    marginBottom: rf(6),
                  }}
                  className="font-sans-bold text-primary text-center"
                >
                  {message.title}
                </Text>

                {/* Divider */}
                <View
                  style={{
                    width: rf(60),
                    height: 3,
                    borderRadius: 3,
                    marginBottom: rf(10),
                  }}
                  className="bg-primary/30"
                />

                {/* Description */}
                <Text
                  style={{
                    fontSize: rf(17),
                    maxWidth: 420,
                    lineHeight: rf(24),
                  }}
                  className="font-sans text-gray-600 text-center"
                >
                  {message.description}
                </Text>
              </View>
            )}

            {/* Start Button */}
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                marginTop: rf(30),
              }}
            >
              <TouchableOpacity
                onPress={handleStart}
                activeOpacity={0.85}
                style={{
                  paddingVertical: rf(14),
                  paddingHorizontal: rf(42),
                  borderRadius: rf(18),
                }}
                className="bg-blue-500 shadow-lg"
              >
                <Text
                  style={{
                    fontSize: rf(18),
                  }}
                  className="text-white font-sans-bold"
                >
                  Let's Read!
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
