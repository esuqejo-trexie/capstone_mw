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

export default function ParentGate() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [learnerCode, setLearnerCode] = useState<string | null>(null);
  const [learner, setLearner] = useState<any>(null);
  const [learnerRef, setLearnerRef] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lock orientation
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT,
      );
    };

    lockOrientation();

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

    fetchLearner();
  }, []);

  // Fetch learner linked to parent
  const fetchLearner = async () => {
    try {
      const parentEmail = auth.currentUser?.email;

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

      const docSnap = snapshot.docs[0];
      const learnerData = docSnap.data();

      setLearner(learnerData);
      setLearnerCode(learnerData.learnerCode);
      setLearnerRef(docSnap.ref);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Failed to load learner data.");
      setLoading(false);
    }
  };

  const handleAccess = async () => {
    if (!learnerCode) return;

    if (code.trim().toUpperCase() !== learnerCode) {
      setError("Invalid access code");
      return;
    }

    setError("");

    // Update learner status from Invited → Active (only once)
    if (learnerRef && learner?.status === "Invited") {
      try {
        await updateDoc(learnerRef, {
          status: "Active",
          activatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.log("Status update failed:", err);
      }
    }

    router.replace({
      pathname: "/(kid)/home",
      params: {
        learner: JSON.stringify(learner),
      },
    });
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
