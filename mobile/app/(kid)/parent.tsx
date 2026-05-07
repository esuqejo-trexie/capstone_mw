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

  const computeFinalScore = (d: any) => {
    if (d.finalScore !== undefined && d.finalScore !== null) {
      return d.finalScore;
    }

    const accuracy = d.accuracyScore || d.pronunciationScore || 0;
    const completeness = d.completenessScore || 0;
    const fluency = d.fluencyScore || 0;
    const profile = learner?.readingProfile;

    let computedFinal = 0;

    if (profile === "Emerging" || profile === "Spark Learner") {
      computedFinal = accuracy * 0.7 + completeness * 0.2 + fluency * 0.1;
    } else if (profile === "Developing" || profile === "Ember Learner") {
      computedFinal = accuracy * 0.6 + completeness * 0.2 + fluency * 0.1;
    } else if (profile === "Transitioning" || profile === "Flame Learner") {
      computedFinal = accuracy * 0.7 + fluency * 0.3;
    } else {
      computedFinal = accuracy;
    }

    return Math.min(100, Math.max(0, computedFinal));
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

    const q = query(ref, orderBy("createdAt", "desc"), limit(10));

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            finalScore: computeFinalScore(d),
          };
        })
        .reverse();
      setSessions(data);
    });

    return unsubscribe;
  }, [unlocked, schoolId, classId, learnerId]);

  const latest = sessions.length ? sessions[sessions.length - 1] : null;

  const safeAccuracy = Number(
    latest?.accuracyScore ?? latest?.pronunciationScore ?? 0,
  );
  const safeCompleteness = Number(latest?.completenessScore ?? 0);
  const safeFluency = Number(latest?.fluencyScore ?? 0);
  const safeFinalScore = latest?.finalScore ?? 0;

  const progressData = sessions.map((s) => s.finalScore);

  const pronunciationData = sessions.map((s) =>
    Number(s.accuracyScore ?? s.pronunciationScore ?? 0),
  );
  const completenessData = sessions.map((s) =>
    Number(s.completenessScore ?? 0),
  );
  const fluencyData = sessions.map((s) => Number(s.fluencyScore ?? 0));

  const activityStats = Object.values(
    sessions.reduce((acc: any, curr: any) => {
      const activityId = curr.activity;
      const comprehensionScore = curr.comprehensionScore || 0;

      if (!acc[activityId]) {
        acc[activityId] = {
          activity: activityId,
          attempts: 0,
          bestReadingScore: 0,
          bestComprehensionScore: 0,
        };
      }

      acc[activityId].attempts += 1;

      const currentReadingScore = curr.finalScore ?? 0;
      if (currentReadingScore > acc[activityId].bestReadingScore) {
        acc[activityId].bestReadingScore = currentReadingScore;
      }

      if (comprehensionScore > acc[activityId].bestComprehensionScore) {
        acc[activityId].bestComprehensionScore = comprehensionScore;
      }

      return acc;
    }, {}),
  ).sort((a: any, b: any) => Number(a.activity) - Number(b.activity));

  const bestActivityStars = learner?.bestActivityStars ?? {};
  const totalStars = Object.values(bestActivityStars).reduce(
    (sum: number, stars: any) => sum + Number(stars ?? 0),
    0,
  );

  const formatScore = (score: number) => {
    if (!score && score !== 0) return "0";
    return Number.isInteger(score) ? score.toString() : score.toFixed(1);
  };

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
    if (safeAccuracy < 70)
      return "Focus on pronunciation and accuracy practice";
    if (safeFluency < 70) return "Encourage smoother reading";
    return "Maintain daily reading habit";
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => "#374151",
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#3B82F6",
    },
  };

  const skillChartConfig = {
    ...chartConfig,
    color: (opacity = 1, index?: number) => {
      if (index === 0) return `rgba(16, 185, 129, ${opacity})`;
      if (index === 1) return `rgba(245, 158, 11, ${opacity})`;
      return `rgba(139, 92, 246, ${opacity})`;
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
          <ActivityIndicator size="large" color="#3B82F6" />
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
          formula: "70% Accuracy + 20% Completeness + 10% Fluency",
        };

      case "Developing":
      case "Ember Learner":
        return {
          title: "Developing Reader",
          desc: "Learners can read simple words and sentences but still need support in fluency and comprehension.",
          focus: "Encourage sentence reading and smoother pacing.",
          formula: "60% Accuracy + 20% Completeness + 20% Fluency",
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
              <View className="bg-orange-50 border border-orange-200 rounded-2xl p-8 mb-6 w-full max-w-md">
                <Text className="text-primary text-center font-sans font-bold text-2xl">
                  Parent Dashboard
                </Text>
                <Text className="text-orange-500 text-center mt-2 font-sans">
                  Enter access code to view progress
                </Text>
              </View>

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
              {/* Header */}
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

                  <View className="flex-row items-center" style={{ gap: 12 }}>
                    <View className="bg-yellow-50 px-4 py-2 rounded-xl flex-row items-center">
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

              {/* LEARNER PROFILE EXPLANATION WITH FORMULA */}
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

                    <View className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-200">
                      <Text className="text-xs text-amber-700 font-semibold mb-1">
                        Assessment Formula
                      </Text>
                      <Text className="text-sm text-amber-800">
                        {profile.formula}
                      </Text>
                    </View>

                    <View className="mt-2 bg-indigo-50 rounded-xl p-3">
                      <Text className="text-xs text-indigo-600 font-semibold mb-1">
                        Recommended Focus
                      </Text>
                      <Text className="text-sm text-indigo-700">
                        {profile.focus}
                      </Text>
                    </View>

                    {/* Pronunciation Assessment Info */}
                    <View className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mt-5 mb-5">
                      <Text className="font-semibold text-indigo-700 mb-1">
                        Pronunciation Assessment
                      </Text>
                      <Text className="text-sm text-indigo-700 leading-5">
                        Pronunciation scores are generated using Microsoft Azure
                        AI Speech services, which analyze the learner's spoken
                        reading.
                      </Text>
                      <Text className="text-sm text-indigo-700 mt-2 leading-5">
                        The system evaluates accuracy, completeness, and fluency
                        to provide objective feedback on reading performance.
                      </Text>
                    </View>
                  </View>
                );
              })()}

              {/* Key Metrics — FIX: use gap style instead of space-x-4 */}
              <View className="flex-row mb-5" style={{ gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <MetricCard
                    title="Accuracy"
                    value={`${formatScore(safeAccuracy)}%`}
                    color="#10B981"
                    description="Latest session"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <MetricCard
                    title="Completeness"
                    value={`${formatScore(safeCompleteness)}%`}
                    color="#F59E0B"
                    description="Latest session"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <MetricCard
                    title="Fluency"
                    value={`${formatScore(safeFluency)}%`}
                    color="#8B5CF6"
                    description="Latest session"
                  />
                </View>
              </View>

              {/* Info about sessions */}
              <View className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5">
                <Text className="font-semibold text-indigo-700 mb-1">
                  About Reading Sessions
                </Text>
                <Text className="text-sm text-indigo-700 leading-5">
                  A session represents one completed reading activity in the
                  app.
                </Text>
                <Text className="text-sm text-indigo-700 mt-2 leading-5">
                  We display the most recent 10 sessions to focus on your
                  child's latest progress and improvement trends.
                </Text>
              </View>

              {/* PROGRESS TREND CHART */}
              <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
                <Text className="font-bold text-gray-800 text-lg">
                  Progress Trend (Reading Score)
                </Text>
                <Text className="text-gray-500 text-sm mt-1 mb-4">
                  Last {sessions.length} sessions • Chronological order
                </Text>

                <LineChart
                  data={{
                    labels: sessions.map((_, i) => `${i + 1}`),
                    datasets: [
                      { data: progressData.length ? progressData : [0] },
                    ],
                  }}
                  width={width - rf(40)}
                  height={rf(180)}
                  chartConfig={chartConfig}
                  bezier
                  style={{ borderRadius: 16 }}
                  formatYLabel={(val) => `${Math.round(parseFloat(val))}%`}
                />
                <Text className="text-xs text-gray-400 mt-3">
                  Higher scores mean better reading ability.
                </Text>
              </View>

              {/* DETAILED METRICS CHART */}
              <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
                <Text className="font-bold text-gray-800 text-lg">
                  Detailed Performance Metrics
                </Text>
                <Text className="text-gray-500 text-sm mt-1 mb-4">
                  Accuracy, Completeness & Fluency over recent sessions
                </Text>

                <LineChart
                  data={{
                    labels: sessions.map((_, i) => `${i + 1}`),
                    datasets: [
                      {
                        data: pronunciationData.length
                          ? pronunciationData
                          : [0],
                        color: () => "#10B981",
                      },
                      {
                        data: completenessData.length ? completenessData : [0],
                        color: () => "#F59E0B",
                      },
                      {
                        data: fluencyData.length ? fluencyData : [0],
                        color: () => "#8B5CF6",
                      },
                    ],
                    legend: ["Accuracy", "Completeness", "Fluency"],
                  }}
                  width={width - rf(40)}
                  height={rf(200)}
                  chartConfig={skillChartConfig}
                  bezier
                  style={{ borderRadius: 16 }}
                  formatYLabel={(val) => `${Math.round(parseFloat(val))}%`}
                />
                <View className="mt-3" style={{ gap: 2 }}>
                  <Text className="text-xs text-gray-400">
                    • Accuracy = how accurately words are read
                  </Text>
                  <Text className="text-xs text-gray-400">
                    • Completeness = how much of the text was completed
                  </Text>
                  <Text className="text-xs text-gray-400">
                    • Fluency = how smooth and natural the reading sounds
                  </Text>
                </View>
              </View>

              {/* Summary Stats — FIX: use gap style instead of space-x-4 */}
              <View className="flex-row mb-5" style={{ gap: 12 }}>
                <View
                  style={{ flex: 1 }}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                >
                  <Text className="text-xs text-gray-600 font-medium text-center">
                    Total Sessions
                  </Text>
                  <Text className="font-bold text-2xl text-gray-800 text-center mt-1">
                    {sessions.length}
                  </Text>
                </View>
                <View
                  style={{ flex: 1 }}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                >
                  <Text className="text-xs text-gray-600 font-medium text-center">
                    Activities
                  </Text>
                  <Text className="font-bold text-2xl text-gray-800 text-center mt-1">
                    {activityStats.length}
                  </Text>
                </View>
              </View>

              {/* Activity History — Full-width flex table */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  marginBottom: 20,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#F9FAFB",
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 15,
                      color: "#1F2937",
                    }}
                  >
                    Activity History
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                  >
                    Best scores across all attempts for each activity
                  </Text>
                </View>

                <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                  {/* Header row */}
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#F3F4F6",
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                      marginBottom: 2,
                    }}
                  >
                    <View style={{ flex: 1.2, paddingHorizontal: 12 }}>
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 11,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        Activity
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        paddingHorizontal: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 11,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        Attempts
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1.5,
                        paddingHorizontal: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 11,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        Best Reading
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1.5,
                        paddingHorizontal: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 11,
                          color: "#6B7280",
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        Comprehension
                      </Text>
                    </View>
                  </View>

                  {activityStats.length === 0 ? (
                    <View
                      style={{
                        backgroundColor: "#FFF",
                        borderRadius: 12,
                        padding: 24,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
                        No activity data available
                      </Text>
                    </View>
                  ) : (
                    activityStats.map((item: any, idx: number) => (
                      <View
                        key={item.activity}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor:
                            idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                          borderRadius: 10,
                          paddingVertical: 12,
                          paddingHorizontal: 4,
                          marginBottom: 2,
                        }}
                      >
                        <View style={{ flex: 1.2, paddingHorizontal: 12 }}>
                          <Text
                            style={{
                              fontWeight: "600",
                              fontSize: 13,
                              color: "#1F2937",
                            }}
                          >
                            Activity {item.activity}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingHorizontal: 12,
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "#DBEAFE",
                              paddingHorizontal: 10,
                              paddingVertical: 3,
                              borderRadius: 999,
                            }}
                          >
                            <Text
                              style={{
                                color: "#1D4ED8",
                                fontSize: 12,
                                fontWeight: "600",
                              }}
                            >
                              {item.attempts}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flex: 1.5,
                            paddingHorizontal: 12,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#059669",
                              fontWeight: "700",
                              fontSize: 13,
                            }}
                          >
                            {formatScore(item.bestReadingScore)}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1.5,
                            paddingHorizontal: 12,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#7C3AED",
                              fontWeight: "700",
                              fontSize: 13,
                            }}
                          >
                            {formatScore(item.bestComprehensionScore)}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* INSIGHTS */}
              <View className="mb-5" style={{ gap: 12 }}>
                <InsightCard
                  title="Overall Performance"
                  value={getInsight()}
                  icon="🎯"
                  fullWidth
                />
                <InsightCard
                  title="Suggested Action"
                  value={getRecommendation()}
                  icon="💡"
                  fullWidth
                />
              </View>

              {/* Formula Example for current learner */}
              {(learner?.readingProfile === "Emerging" ||
                learner?.readingProfile === "Spark Learner" ||
                learner?.readingProfile === "Developing" ||
                learner?.readingProfile === "Ember Learner") &&
                latest && (
                  <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                    <Text className="text-xs text-blue-700">
                      <Text className="font-bold">
                        Current calculation for {learner.readingProfile}{" "}
                        profile:
                      </Text>
                      {"\n"}
                      Latest session: Accuracy {formatScore(safeAccuracy)}% ×
                      {learner.readingProfile === "Emerging" ||
                      learner.readingProfile === "Spark Learner"
                        ? "0.7"
                        : "0.6"}{" "}
                      + Completeness {formatScore(safeCompleteness)}% × 0.2 +
                      Fluency {formatScore(safeFluency)}% × 0.1 = Reading Score{" "}
                      {formatScore(safeFinalScore)}%
                    </Text>
                  </View>
                )}
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

function MetricCard({ title, value, color, description }: any) {
  return (
    <View className="rounded-2xl overflow-hidden shadow-sm">
      <LinearGradient colors={[color, `${color}CC`]} className="p-4">
        <Text className="text-white/90 text-sm font-medium">{title}</Text>
        <Text className="text-white text-3xl font-bold mt-1">{value}</Text>
        {description && (
          <Text className="text-white/80 text-xs mt-1">{description}</Text>
        )}
      </LinearGradient>
    </View>
  );
}

function InsightCard({ title, value, icon, fullWidth = false }: any) {
  return (
    <View
      className="bg-white rounded-2xl p-5"
      style={fullWidth ? { width: "100%" } : { flex: 1 }}
    >
      <View className="flex-row items-center mb-2">
        <Text className="mr-2 text-lg">{icon}</Text>
        <Text className="font-semibold text-gray-600">{title}</Text>
      </View>
      <Text className="text-gray-800 ml-7">{value}</Text>
    </View>
  );
}
