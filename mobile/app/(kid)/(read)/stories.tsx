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

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import { getLearnerSession } from "../../../lib/sessions/kidSession";

type ComprehensionProgress = {
  score: number;
  maxScore: number;
};

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

function getComprehensionMaxForActivity(
  exercise: number,
  readingProfile: "Spark" | "Ember",
) {
  if (readingProfile === "Ember") return 4;
  if (readingProfile === "Spark" && exercise >= 11) return 2;
  return 0;
}

export default function StoriesScreen() {
  const { width } = useWindowDimensions();
  const { level } = useLocalSearchParams<{ level?: string }>();
  const router = useRouter();

  const exercises = Array.from({ length: 20 }, (_, i) => i + 1);

  const [progress, setProgress] = useState<Record<number, number>>({});
  const [comprehensionProgress, setComprehensionProgress] = useState<
    Record<number, ComprehensionProgress>
  >({});
  const [totalStars, setTotalStars] = useState(0);
  const [readingProfile, setReadingProfile] = useState<"Spark" | "Ember">(
    "Spark",
  );
  const [parentEmail, setParentEmail] = useState<string | null>(null);

  // learner session
  const { schoolId, classId, learnerId } = getLearnerSession();

  /*
  --------------------------------------------------
  PROFILE META (UI styling per reading profile)
  --------------------------------------------------
  */

  const profileMeta: Record<string, any> = {
    Spark: {
      label: "Spark Learner",
      color: "bg-blue-500",
      border: "border-blue-300",
    },
    Ember: {
      label: "Ember Learner",
      color: "bg-orange-500",
      border: "border-orange-300",
    },
  };

  const profile = profileMeta[readingProfile] ?? profileMeta.Spark;

  /*
  --------------------------------------------------
  LOAD LEARNER PROFILE
  --------------------------------------------------
  */

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
      if (data?.parentEmail) {
        setParentEmail(data.parentEmail);
      }
      if (data?.readingProfile) {
        setReadingProfile(normalizeReadingProfile(data.readingProfile));
      }
    });

    return () => unsubscribe();
  }, [schoolId, classId, learnerId]);

  /*
  --------------------------------------------------
  LOAD READING SESSION PROGRESS
  --------------------------------------------------
  */

  useEffect(() => {
    const sessionsQuery = query(
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
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const activityStars: Record<number, number> = {};
        const activityComprehension: Record<number, ComprehensionProgress> = {};

        snapshot.forEach((doc) => {
          const data: any = doc.data();

          const activity = Number(data.activity);
          const stars = Number(data.stars ?? 0);
          const comprehensionScore = Number(data.comprehensionScore);
          const comprehensionMaxScore = Number(data.comprehensionMaxScore);

          if (!activityStars[activity] || stars > activityStars[activity]) {
            activityStars[activity] = stars;
          }

          if (
            Number.isFinite(comprehensionScore) &&
            Number.isFinite(comprehensionMaxScore) &&
            comprehensionMaxScore > 0
          ) {
            const current = activityComprehension[activity];
            const currentRatio = current
              ? current.score / current.maxScore
              : -1;
            const nextRatio = comprehensionScore / comprehensionMaxScore;

            if (!current || nextRatio > currentRatio) {
              activityComprehension[activity] = {
                score: comprehensionScore,
                maxScore: comprehensionMaxScore,
              };
            }
          }
        });

        setProgress(activityStars);
        setComprehensionProgress(activityComprehension);

        const total = Object.values(activityStars).reduce(
          (sum, stars) => sum + stars,
          0,
        );

        setTotalStars(total);
      },
      (error) => {
        console.error("Error loading reading sessions:", error);
      },
    );

    return () => unsubscribe();
  }, [schoolId, classId, learnerId]);

  /*
  --------------------------------------------------
  NAVIGATION
  --------------------------------------------------
  */

  const handleReadStory = (exercise: number) => {
    router.push(`/(kid)/(read)/story?level=${level ?? 1}&exercise=${exercise}`);
  };

  const comprehensionActivities = exercises.filter(
    (exercise) => getComprehensionMaxForActivity(exercise, readingProfile) > 0,
  );
  const completedComprehensionActivities = comprehensionActivities.filter(
    (exercise) => comprehensionProgress[exercise],
  );
  const totalComprehensionScore = completedComprehensionActivities.reduce(
    (sum, exercise) => sum + comprehensionProgress[exercise].score,
    0,
  );
  const totalComprehensionMax = comprehensionActivities.reduce(
    (sum, exercise) =>
      sum + getComprehensionMaxForActivity(exercise, readingProfile),
    0,
  );
  const hasComprehensionResults = completedComprehensionActivities.length > 0;
  const allComprehensionDone =
    comprehensionActivities.length > 0 &&
    completedComprehensionActivities.length === comprehensionActivities.length;

  return (
    <ImageBackground
      source={require("../../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-6 py-4">
          {/* HEADER */}

          <View className="mb-6 flex-row items-center justify-between">
            {/* LEFT: PROFILE INFO */}
            <View className="flex-1 pr-4">
              <Text
                className="font-sans-bold text-secondary"
                style={{ fontSize: width * 0.04 }}
                numberOfLines={1}
              >
                {profile.label}
              </Text>

              <Text
                className="text-gray-600 font-sans-medium"
                style={{ fontSize: width * 0.016 }}
                numberOfLines={1}
              >
                Complete activities to unlock the next one.
              </Text>
            </View>

            {/* RIGHT: STATS */}
            <View className="flex-row items-center gap-3">
              {/* ⭐ STARS CARD */}
              <View
                className="px-4 py-2 rounded-2xl justify-center"
                style={{
                  backgroundColor: "#E0F2FE",
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  minWidth: width * 0.2,
                }}
              >
                <Text
                  className="font-sans-bold"
                  style={{ fontSize: width * 0.012, color: "#0369A1" }}
                >
                  Stars
                </Text>

                <View className="flex-row items-center mt-1">
                  <Text style={{ fontSize: width * 0.022 }}>⭐</Text>

                  <Text
                    className="font-sans-extrabold ml-2"
                    style={{
                      fontSize: width * 0.022, // MATCHED VALUE SIZE
                      color: "#0369A1",
                    }}
                  >
                    {totalStars}
                  </Text>
                </View>

                <Text
                  className="font-sans-medium mt-1"
                  style={{ fontSize: width * 0.009, color: "#0284C7" }}
                >
                  Collected
                </Text>
              </View>

              {/* 📘 COMPREHENSION CARD */}
              <View
                className="px-4 py-2 rounded-2xl justify-center"
                style={{
                  backgroundColor: "#F3E8FF",
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  minWidth: width * 0.2,
                }}
              >
                <Text
                  className="font-sans-bold"
                  style={{ fontSize: width * 0.012, color: "#6B21A8" }}
                >
                  Comprehension
                </Text>

                <Text
                  className="font-sans-extrabold mt-1"
                  style={{
                    fontSize: width * 0.022, // MATCHED VALUE SIZE
                    color: "#581C87",
                  }}
                >
                  {`${totalComprehensionScore}/${totalComprehensionMax}`}
                </Text>

                <Text
                  className="font-sans-medium mt-1"
                  style={{ fontSize: width * 0.009, color: "#7E22CE" }}
                  numberOfLines={1}
                >
                  {allComprehensionDone
                    ? "All done"
                    : `${completedComprehensionActivities.length}/${comprehensionActivities.length} done`}
                </Text>
              </View>
            </View>
          </View>

          {/* ACTIVITIES GRID */}

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-center gap-8 mt-2">
              {exercises.map((exercise) => {
                const previousStars = progress[exercise - 1] ?? 0;

                const isDemoAccount =
                  parentEmail === "esquejotreixee@gmail.com";

                const isUnlocked =
                  isDemoAccount || exercise === 1 || previousStars > 0;

                const stars = progress[exercise] ?? 0;
                const comprehension = comprehensionProgress[exercise];
                const activityComprehensionMax = getComprehensionMaxForActivity(
                  exercise,
                  readingProfile,
                );

                return (
                  <View key={exercise} className="items-center">
                    {/* ACTIVITY CARD */}

                    <TouchableOpacity
                      activeOpacity={isUnlocked ? 0.85 : 1}
                      disabled={!isUnlocked}
                      onPress={() => handleReadStory(exercise)}
                      className={`rounded-3xl items-center justify-center border-4 shadow-lg ${
                        isUnlocked
                          ? `${profile.color} ${profile.border}`
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

                    {/* STAR PROGRESS */}

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

                    {activityComprehensionMax > 0 && (
                      <View
                        className="mt-1 px-3 py-1 bg-purple-50 rounded-full"
                        style={{
                          shadowColor: "#000",
                          shadowOpacity: 0.14,
                          shadowRadius: 2,
                          elevation: 2,
                        }}
                      >
                        <Text
                          className="font-sans-bold text-purple-700"
                          style={{ fontSize: width * 0.014 }}
                        >
                          🧠{" "}
                          {comprehension
                            ? `${comprehension.score}/${comprehension.maxScore}`
                            : "--"}
                        </Text>
                      </View>
                    )}
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
