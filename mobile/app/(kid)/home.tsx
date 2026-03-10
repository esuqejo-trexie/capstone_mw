import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { getLearnerSession } from "../../lib/sessions/kidSession";

export default function HomeScreen() {
  const router = useRouter();
  const learnerData = getLearnerSession();
  console.log("SESSION DATA:", learnerData);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const goToRead = () => {
    router.push({
      pathname: "/(kid)/read",
      params: {
        learner: JSON.stringify(learnerData),
      },
    });
  };

  const goToGames = () => {
    router.push({
      pathname: "/(kid)/games",
      params: {
        learner: JSON.stringify(learnerData),
      },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80 items-center justify-center gap-8">
        <Text className="text-3xl font-bold">
          Hello, {learnerData?.name ?? "Learner"}!
        </Text>

        <View className="flex-row gap-6">
          <TouchableOpacity
            onPress={goToRead}
            className="bg-blue-500 px-10 py-6 rounded-2xl"
          >
            <Text className="text-white text-xl font-bold">Read</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToGames}
            className="bg-green-500 px-10 py-6 rounded-2xl"
          >
            <Text className="text-white text-xl font-bold">Mini Games</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
