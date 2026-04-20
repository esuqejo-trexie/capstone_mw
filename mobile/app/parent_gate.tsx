import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collectionGroup,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { setLearnerSession } from "../lib/sessions/kidSession";

export default function ParentGate() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [learners, setLearners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lock orientation
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Check authentication
  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/");
      return;
    }

    fetchLearners();
  }, []);

  const fetchLearners = async () => {
    try {
      const parentEmail = auth.currentUser?.email?.toLowerCase();
      if (!parentEmail) return;

      const q = query(
        collectionGroup(db, "learners"),
        where("parentEmail", "==", parentEmail),
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("No learner linked to this parent account.");
        setLoading(false);
        return;
      }

      const learnersList = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        const learnerId = docSnap.id;
        const classId = docSnap.ref.parent.parent?.id;
        const schoolId = docSnap.ref.parent.parent?.parent?.parent?.id;

        return {
          learnerId,
          classId,
          schoolId,
          ref: docSnap.ref,
          ...data,
        };
      });

      setLearners(learnersList);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Failed to load learner data.");
      setLoading(false);
    }
  };

  const handleAccess = async () => {
    if (!code.trim()) return;

    const normalizedInput = code.trim().toUpperCase();

    // 🔍 Find matching learner
    const matchedLearner = learners.find(
      (l) => l.learnerCode?.toUpperCase() === normalizedInput,
    );

    if (!matchedLearner) {
      setError("Invalid access code");
      return;
    }

    setError("");

    // 🔄 Update status if needed
    if (matchedLearner.ref && matchedLearner.status === "Invited") {
      try {
        await updateDoc(matchedLearner.ref, {
          status: "Active",
          activatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.log("Status update failed:", err);
      }
    }

    // 💾 Save session
    setLearnerSession({
      learnerId: matchedLearner.learnerId,
      schoolId: matchedLearner.schoolId,
      classId: matchedLearner.classId,
      name: matchedLearner.name,
      learnerCode: matchedLearner.learnerCode,
      readingProfile: matchedLearner.readingProfile,
    });

    console.log("SESSION SET:", matchedLearner);

    router.replace("/(kid)/home");
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../assets/general/bg_portrait.webp")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 bg-white/80">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 justify-center px-6"
          >
            <View className="bg-white/90 rounded-3xl p-6 mx-6 shadow-md">
              <Text className="text-2xl font-sans-bold text-center text-primary mb-2">
                Parent Access Required
              </Text>

              <Text className="text-center font-sans-medium text-gray-600 mb-6">
                Enter the parent–kid access code to continue.
              </Text>

              {loading && (
                <Text className="text-center text-gray-500 mb-4">
                  Loading learner information...
                </Text>
              )}

              <TextInput
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  setError("");
                }}
                placeholder="Access Code"
                autoCapitalize="characters"
                editable={!loading}
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-center tracking-widest bg-white"
              />

              {error ? (
                <Text className="text-red-500 text-center mb-3">{error}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleAccess}
                disabled={loading}
                className={`rounded-3xl py-3 ${
                  loading ? "bg-gray-400" : "bg-primary"
                }`}
              >
                <Text className="text-white text-center font-sans-semibold text-lg">
                  Enter Kid Mode
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
}
