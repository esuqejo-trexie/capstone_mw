import { LinearGradient } from "expo-linear-gradient";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebaseConfig";
import { getLearnerSession } from "../../lib/sessions/kidSession";

export default function Parent() {
  const { width, height } = useWindowDimensions();

  const scale = Math.min(width / 812, height / 375);
  const rf = (size: number) => Math.round(size * scale);

  const session = getLearnerSession();
  if (!session) return null;

  const { schoolId, classId, learnerId, learnerCode } = session;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [learner, setLearner] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const setOrientation = async () => {
      if (mounted) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        );
      }
    };

    setOrientation();

    return () => {
      mounted = false;
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  const handleUnlock = () => {
    if (code.trim().toUpperCase() !== learnerCode) {
      setError("Invalid code");
      return;
    }
    setUnlocked(true);
    setLoading(true);
  };

  const handleExitDashboard = () => {
    Alert.alert(
      "Back to Kid Mode",
      "Are you sure you want to exit the parent dashboard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: () => {
            setUnlocked(false);
            setCode("");
          },
        },
      ],
    );
  };

  useEffect(() => {
    if (!unlocked) return;

    const ref = doc(
      db,
      "schools",
      schoolId,
      "classes",
      classId,
      "learners",
      learnerId,
    );

    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setLearner(snap.data());
      setLoading(false);
    });
  }, [unlocked, schoolId, classId, learnerId]);

  useEffect(() => {
    if (!unlocked) return;

    const ref = collection(
      db,
      "schools",
      schoolId,
      "classes",
      classId,
      "learners",
      learnerId,
      "readingSessions",
    );

    const q = query(ref, orderBy("createdAt", "desc"), limit(7));

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => d.data()).reverse();
      setSessions(data);
    });

    return unsubscribe;
  }, [unlocked, schoolId, classId, learnerId]);

  const latest = sessions.length ? sessions[sessions.length - 1] : null;

  const safePronunciation = Number(latest?.pronunciationScore ?? 0);
  const safeFluency = Number(latest?.fluencyScore ?? 0);

  const computeFinalScore = (s: any) => {
    const p = Number(s.pronunciationScore ?? 0);
    const f = Number(s.fluencyScore ?? 0);

    switch (learner?.readingProfile) {
      case "Spark Learner":
        return p;
      case "Ember Learner":
        return 0.8 * p + 0.2 * f;
      case "Flame Learner":
        return 0.7 * p + 0.3 * f;
      case "Blaze Learner":
        return p;
      default:
        return (p + f) / 2;
    }
  };

  const progressData = sessions.map(computeFinalScore);
  const pronunciationData = sessions.map((s) =>
    Number(s.pronunciationScore ?? 0),
  );
  const fluencyData = sessions.map((s) => Number(s.fluencyScore ?? 0));

  const bestActivityStars = learner?.bestActivityStars ?? {};
  const totalStars = Object.values(bestActivityStars).reduce(
    (sum: number, stars: any) => sum + Number(stars ?? 0),
    0,
  );

  const getInsight = () => {
    if (!progressData.length) return "No data yet";
    const avg =
      progressData.reduce((sum, v) => sum + v, 0) / progressData.length;

    if (avg >= 85) return "Excellent performance";
    if (avg >= 70) return "Good progress";
    return "Needs consistent practice";
  };

  const getRecommendation = () => {
    if (!latest) return "Start a reading activity";
    if (safePronunciation < 70) return "Focus on pronunciation practice";
    if (safeFluency < 70) return "Encourage smoother reading";
    return "Maintain daily reading habit";
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => "#374151",
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#6366F1",
    },
  };

  const skillChartConfig = {
    ...chartConfig,
    color: (opacity = 1, index?: number) => {
      if (index === 0) return `rgba(99, 102, 241, ${opacity})`;
      return `rgba(34, 197, 94, ${opacity})`;
    },
  };

  if (loading && unlocked) {
    return (
      <ImageBackground
        source={require("../../assets/general/bg_landscape.webp")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 bg-white/80 justify-center items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
        </View>
      </ImageBackground>
    );
  }

  const getProfileInfo = () => {
    const profile = learner?.readingProfile;

    switch (profile) {
      case "Emerging":
      case "Spark Learner":
        return {
          title: "Emerging Reader",
          desc: "Learners are beginning to recognize sounds, letters, and simple words. They need guided practice in decoding and word recognition.",
          focus: "Focus on phonics, sounds, and basic word reading.",
        };

      case "Developing":
      case "Ember Learner":
        return {
          title: "Developing Reader",
          desc: "Learners can read simple words and sentences but still need support in fluency and comprehension.",
          focus: "Encourage sentence reading and smoother pacing.",
        };

      case "Transitioning":
      case "Flame Learner":
        return {
          title: "Transitioning Reader",
          desc: "Learners can read short passages with growing fluency but may still struggle with accuracy and expression.",
          focus: "Improve fluency, expression, and understanding of texts.",
        };

      case "Reading At Grade Level":
      case "At Grade Level":
      case "Blaze Learner":
        return {
          title: "At Grade Level",
          desc: "Learners can read and understand grade-level texts independently with good fluency and comprehension.",
          focus: "Maintain fluency and develop deeper comprehension skills.",
        };

      default:
        return null;
    }
  };
  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 px-5">
          {!unlocked && (
            <View className="flex-1 justify-center items-center">
              {/* HEADER CARD */}
              <View className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-6 w-full max-w-md">
                <Text className="text-primary text-center font-sans font-bold text-2xl">
                  Parent Dashboard
                </Text>
                <Text className="text-orange-500 text-center mt-2 font-sans">
                  Enter access code to view progress
                </Text>
              </View>

              {/* INPUT */}
              <View className="w-full max-w-md">
                <TextInput
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    setError("");
                  }}
                  placeholder="Enter Access Code"
                  placeholderTextColor="#9CA3AF"
                  className="border border-orange-200 px-5 py-4 rounded-2xl bg-white text-center text-lg font-sans"
                  autoCapitalize="characters"
                />

                {error && (
                  <Text className="text-red-600 text-center mt-2 font-sans">
                    {error}
                  </Text>
                )}

                {/* BUTTON */}
                <TouchableOpacity onPress={handleUnlock} className="mt-5">
                  <View className="bg-orange-500 rounded-2xl py-4 shadow-sm">
                    <Text className="text-white text-center font-bold font-sans">
                      Unlock Dashboard
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {unlocked && learner && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: rf(20) }}
            >
              {/* HEADER */}
              {/* HEADER */}
              <View className="mb-4 mt-3">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-3xl font-bold text-gray-800">
                      {learner.name}
                    </Text>

                    <Text className="text-indigo-600 font-semibold mt-1">
                      {learner.readingProfile}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View className="bg-yellow-50 px-4 py-2 rounded-xl flex-row items-center mr-3">
                      <Text className="text-yellow-600 text-lg mr-1">⭐</Text>
                      <Text className="font-bold text-yellow-700">
                        {totalStars}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={handleExitDashboard}>
                      <LinearGradient
                        colors={["#EF4444", "#DC2626"]}
                        className="px-4 py-2 rounded-xl"
                      >
                        <Text className="text-white font-bold text-sm">
                          Back to Kid Mode
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* LEARNER PROFILE EXPLANATION */}
              {(() => {
                const profile = getProfileInfo();

                if (!profile) {
                  return (
                    <View className="bg-yellow-50 p-4 rounded-xl mb-4">
                      <Text className="text-yellow-700 text-sm">
                        Learner profile not yet assigned.
                      </Text>
                    </View>
                  );
                }

                return (
                  <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <Text className="font-bold text-gray-800 text-lg mb-1">
                      Learner Profile: {profile.title}
                    </Text>

                    <Text className="text-gray-600 text-sm leading-5">
                      {profile.desc}
                    </Text>

                    <View className="mt-3 bg-indigo-50 rounded-xl p-3">
                      <Text className="text-xs text-indigo-600 font-semibold mb-1">
                        Recommended Focus
                      </Text>
                      <Text className="text-sm text-indigo-700">
                        {profile.focus}
                      </Text>
                    </View>
                  </View>
                );
              })()}

              {/* METRICS */}
              <View className="flex-row mb-5">
                <View className="flex-1 mr-2">
                  <MetricCard
                    title="Pronunciation"
                    value={`${safePronunciation}%`}
                    color="#6366F1"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <MetricCard
                    title="Fluency"
                    value={`${safeFluency}%`}
                    color="#22C55E"
                  />
                </View>
              </View>
              <View className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5">
                <Text className="font-semibold text-indigo-700 mb-1">
                  About Reading Sessions
                </Text>

                <Text className="text-sm text-indigo-700 leading-5">
                  A session represents one completed reading activity in the
                  app. Each session includes your child’s pronunciation and
                  fluency scores.
                </Text>

                <Text className="text-sm text-indigo-700 mt-2 leading-5">
                  We display only the most recent 7 sessions to focus on your
                  child’s latest progress and improvement trends.
                </Text>
              </View>
              {/* PROGRESS */}
              <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
                <Text className="font-bold text-gray-800 text-lg">
                  Reading Progress Over Time
                </Text>
                <Text className="text-gray-500 text-sm mt-1 mb-4">
                  This chart shows your child’s overall reading performance
                  across recent sessions. Higher scores mean better reading
                  ability.
                </Text>

                <LineChart
                  data={{
                    labels: progressData.map((_, i) => `Session ${i + 1}`),
                    datasets: [
                      { data: progressData.length ? progressData : [0] },
                    ],
                  }}
                  width={width - rf(40)}
                  height={rf(180)}
                  chartConfig={chartConfig}
                  bezier
                  style={{ borderRadius: 16 }}
                />

                <Text className="text-xs text-gray-400 mt-3">
                  This score combines pronunciation and fluency.
                </Text>
              </View>
              {/* SKILLS */}
              <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
                <Text className="font-bold text-gray-800 text-lg">
                  Reading Skills Breakdown
                </Text>
                <Text className="text-gray-500 text-sm mt-1 mb-4">
                  This chart compares how clearly your child pronounces words
                  and how smoothly they read.
                </Text>

                <LineChart
                  data={{
                    labels: pronunciationData.map((_, i) => `Session ${i + 1}`),
                    datasets: [
                      {
                        data: pronunciationData.length
                          ? pronunciationData
                          : [0],
                      },
                      {
                        data: fluencyData.length ? fluencyData : [0],
                      },
                    ],
                    legend: ["Pronunciation", "Fluency"],
                  }}
                  width={width - rf(40)}
                  height={rf(200)}
                  chartConfig={skillChartConfig}
                  bezier
                  style={{ borderRadius: 16 }}
                />

                <View className="mt-3">
                  <Text className="text-xs text-gray-400">
                    • Pronunciation = how accurately words are read
                  </Text>
                  <Text className="text-xs text-gray-400">
                    • Fluency = how smooth and natural the reading sounds
                  </Text>
                </View>
              </View>
              {/* INSIGHTS */}
              <View className="mb-5">
                <InsightCard
                  title="Overall Performance"
                  value={getInsight()}
                  icon="🎯"
                  fullWidth
                />
                <View className="mt-3" />
                <InsightCard
                  title="Suggested Action"
                  value={getRecommendation()}
                  icon="💡"
                  fullWidth
                />
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

function MetricCard({ title, value, color }: any) {
  return (
    <View className="flex-1 rounded-2xl overflow-hidden">
      <LinearGradient colors={[color, `${color}CC`]} className="p-5">
        <Text className="text-white/90">{title}</Text>
        <Text className="text-white text-3xl font-bold mt-2">{value}</Text>
      </LinearGradient>
    </View>
  );
}

function InsightCard({ title, value, icon, fullWidth = false }: any) {
  return (
    <View
      className={`bg-white rounded-2xl p-5 ${fullWidth ? "w-full" : "flex-1"}`}
    >
      <View className="flex-row items-center mb-2">
        <Text className="mr-2">{icon}</Text>
        <Text className="font-semibold text-gray-600">{title}</Text>
      </View>
      <Text className="text-gray-800 ml-6">{value}</Text>
    </View>
  );
}
