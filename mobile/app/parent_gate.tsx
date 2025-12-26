import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ParentGate() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const TEST_PARENT_KID_CODE = "ABC123";

  // Lock screen orientation to portrait
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
    };
    lockOrientation();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleAccess = () => {
    if (code.trim().toUpperCase() !== TEST_PARENT_KID_CODE) {
      setError("Invalid access code");
      return;
    }

    setError("");
    router.replace("/(kid)/home");
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../assets/general/bg_portrait.webp")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* White overlay */}
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

              <TextInput
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  setError("");
                }}
                placeholder="Access Code"
                autoCapitalize="characters"
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-center tracking-widest bg-white"
              />

              {error ? (
                <Text className="text-red-500 text-center mb-3">{error}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleAccess}
                className="bg-primary rounded-3xl py-3"
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
