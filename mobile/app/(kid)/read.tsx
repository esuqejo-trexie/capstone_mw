import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReadScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  type Level = {
    id: number;
    name: string;
    key: string;
  };

  const levels: Level[] = [
    { id: 1, name: "Spark Learner", key: "sparkLearner" },
    { id: 2, name: "Ember Learner", key: "emberLearner" },
    { id: 3, name: "Flame Learner", key: "flameLearner" },
    { id: 4, name: "Blaze Learner", key: "blazeLearner" },
  ];

  // ✅ Explicitly typed handler
  const handleLevelPress = (level: number): void => {
    router.push(`/(kid)/(read)/stories?level=${level}`);
  };

  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      {/* Background + white overlay act as ONE */}
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-4 py-4 justify-center">
          {/* Greeting */}
          <View className="mb-4">
            <Text
              className="text-3xl font-sans-bold text-left text-secondary"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              Hello Learner!
            </Text>
          </View>

          {/* Level Cards */}
          <View className="flex-row justify-around items-center w-full max-w-5xl mx-auto flex-1">
            {levels.map((level: Level) => (
              <TouchableOpacity
                key={level.id}
                activeOpacity={0.85}
                onPress={(): void => handleLevelPress(level.id)}
                className="bg-blue-500 rounded-3xl w-[20%] aspect-[3/4] max-h-[80%] items-center justify-center shadow-xl border-4 border-blue-400 px-3"
              >
                <Text
                  className="text-white font-sans-extrabold text-center"
                  style={{ fontSize: width * 0.028 }}
                  adjustsFontSizeToFit
                  numberOfLines={2}
                >
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
