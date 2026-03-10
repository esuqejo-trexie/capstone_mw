import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import { getLearnerSession } from "../../../lib/sessions/kidSession";

export default function StoriesScreen() {
  const { width } = useWindowDimensions();
  const { level } = useLocalSearchParams<{ level?: string }>();
  const router = useRouter();

  const exercises = Array.from({ length: 20 }, (_, i) => i + 1);

  const [progress, setProgress] = useState<Record<number, number>>({});

  // Get active learner session
  const { schoolId, classId, learnerId } = getLearnerSession();
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(
        db,
        "schools",
        schoolId,
        "classes",
        classId,
        "learners",
        learnerId,
        "readingSessions",
      ),
      (snapshot) => {
        const activityStars: Record<number, number> = {};

        snapshot.forEach((doc) => {
          const data: any = doc.data();

          const activity = Number(data.activity);
          const stars = Number(data.stars ?? 0);

          if (!activityStars[activity] || stars > activityStars[activity]) {
            activityStars[activity] = stars;
          }
        });

        setProgress(activityStars);
      },
      (error) => {
        console.error("Error loading reading sessions:", error);
      },
    );

    return () => unsubscribe();
  }, [schoolId, classId, learnerId]);

  const handleReadStory = (exercise: number) => {
    router.push(`/(kid)/(read)/story?level=${level ?? 1}&exercise=${exercise}`);
  };

  return (
    <ImageBackground
      source={require("../../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-6 py-4">
          {/* Header */}
          <View className="mb-6 items-center">
            <Text className="text-4xl font-sans-bold text-secondary">
              Spark Learner ✨
            </Text>

            <Text className="text-gray-600 mt-1">
              Complete activities to unlock the next one
            </Text>
          </View>

          {/* Activity Grid */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-center gap-8 mt-2">
              {exercises.map((exercise) => {
                const previousStars = progress[exercise - 1] ?? 0;

                const isUnlocked = exercise === 1 || previousStars > 0;

                const stars = progress[exercise] ?? 0;

                return (
                  <View key={exercise} className="items-center">
                    {/* Activity Card */}
                    <TouchableOpacity
                      activeOpacity={isUnlocked ? 0.85 : 1}
                      disabled={!isUnlocked}
                      onPress={() => handleReadStory(exercise)}
                      className={`rounded-3xl items-center justify-center border-4 shadow-lg ${
                        isUnlocked
                          ? "bg-blue-500 border-blue-300"
                          : "bg-gray-300 border-gray-200"
                      }`}
                      style={{
                        width: width * 0.15,
                        height: width * 0.15,
                      }}
                    >
                      {!isUnlocked ? (
                        <Text
                          style={{ fontSize: width * 0.04 }}
                          className="text-gray-600"
                        >
                          🔒
                        </Text>
                      ) : (
                        <>
                          <Text
                            className="font-sans text-white opacity-90"
                            style={{ fontSize: width * 0.015 }}
                          >
                            Activity
                          </Text>

                          <Text
                            className="text-white font-sans-extrabold"
                            style={{ fontSize: width * 0.045 }}
                          >
                            {exercise}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Star Progress */}
                    <View
                      className="flex-row mt-2 px-3 py-1 bg-white rounded-full"
                      style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.25,
                        shadowRadius: 3,
                        elevation: 3,
                      }}
                    >
                      {[1, 2, 3].map((star) => (
                        <Text key={star} style={{ fontSize: width * 0.02 }}>
                          {star <= stars ? "⭐" : "☆"}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
