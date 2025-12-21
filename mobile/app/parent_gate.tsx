import { useRouter } from "expo-router";
import React, { useState } from "react";
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

  // TEMP: hardcoded testing code
  const TEST_PARENT_KID_CODE = "ABC123";

  const handleAccess = () => {
    if (code.trim().toUpperCase() !== TEST_PARENT_KID_CODE) {
      setError("Invalid access code");
      return;
    }

    setError("");
    router.replace("/(kid)/home"); // redirect to kid home for testing
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../assets/general/bg_landscape.webp")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 bg-white/75">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 justify-center px-6"
          >
            <View className="bg-primary rounded-2xl p-6 mx-20">
              <Text className="text-2xl font-sans-bold text-center text-white mb-2">
                Parent Access Required
              </Text>

              <Text className="text-center font-sans-medium text-gray-200 mb-6">
                Enter the parent–kid access code to continue
              </Text>

              <TextInput
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  setError("");
                }}
                placeholder="Access Code"
                autoCapitalize="characters"
                secureTextEntry
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-center tracking-widest bg-white"
              />

              {error ? (
                <Text className="text-red-500 text-center mb-3">{error}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleAccess}
                className="bg-white rounded-3xl py-3"
              >
                <Text className="text-secondary text-center font-semibold text-lg">
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
