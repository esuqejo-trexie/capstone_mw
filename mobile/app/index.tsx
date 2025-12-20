import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function Index() {
  const { width } = useWindowDimensions();

  // Control which form is open: 'signup' or 'signin'
  const [activeForm, setActiveForm] = useState<"none" | "signup" | "signin">(
    "none"
  );

  const slideX = useRef(new Animated.Value(width)).current; // sliding animation
  const panX = useRef(new Animated.Value(0)).current; // gesture drag

  // Sign Up states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Sign In states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Open form with slide-in animation
  const openForm = (form: "signup" | "signin") => {
    setActiveForm(form);
    panX.setValue(0); // reset drag
    Animated.timing(slideX, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // Switch between Sign Up / Sign In forms
  const switchForm = (form: "signup" | "signin") => {
    Animated.timing(slideX, {
      toValue: width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => openForm(form));
  };

  // Handle closing form programmatically
  const closeForm = () => {
    Animated.timing(slideX, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setActiveForm("none"));
  };

  // PanResponder for swipe-to-close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          panX.setValue(gestureState.dx); // move form along with finger
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > width / 2) {
          // Swipe past half width → close form
          Animated.timing(slideX, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setActiveForm("none");
            panX.setValue(0);
          });
        } else {
          // Not enough → snap back
          Animated.spring(panX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handleSignUp = () => {
    console.log({ name, email, password, confirmPassword });
  };

  const handleSignIn = () => {
    console.log({ signInEmail, signInPassword });
  };

  return (
    <View className="flex-1 bg-white overflow-hidden">
      {/* ===== Landing Screen ===== */}
      {activeForm === "none" && (
        <View className="flex-1 flex-row bg-white">
          {/* Left: Logo + Tagline */}
          <View className="flex-[0.55] justify-center items-center px-10">
            <Image
              source={require("../assets/general/SmartRead_logo.webp")}
              style={{
                width: Math.min(width * 0.25, 220),
                height: Math.min(width * 0.25, 220),
              }}
              resizeMode="contain"
              className="mb-2"
            />
            <Text className="text-3xl text-gray-800 font-sans-bold text-center leading-tight">
              Ignite your reading,
            </Text>
            <Text className="text-3xl text-gray-800 font-sans-bold text-center leading-tight">
              Spark your imagination.
            </Text>
          </View>

          {/* Right: Call to Action */}
          <View className="flex-[0.45] justify-center items-center bg-primary px-10">
            <Text className="text-white text-4xl font-sans-bold text-center mb-6">
              Ready to begin?
            </Text>

            <Text className="text-white text-base text-center mb-10 font-sans-medium max-w-sm">
              Create an account and start your child’s reading journey with
              SmartRead.
            </Text>

            <TouchableOpacity
              onPress={() => openForm("signup")}
              className="bg-white px-14 py-4 rounded-2xl shadow-lg active:opacity-90"
            >
              <Text className="text-primary font-sans-bold text-lg">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ===== Sliding Form Container ===== */}
      {activeForm !== "none" && (
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateX: Animated.add(slideX, panX) }],
          }}
          className="absolute inset-0 bg-primary/95"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                paddingHorizontal: 24,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="py-10">
                {/* ===== Sign Up Form ===== */}
                {activeForm === "signup" && (
                  <>
                    <Text className="text-3xl font-sans-bold text-white mb-8">
                      Sign Up
                    </Text>

                    <View className="bg-white rounded-2xl p-7 shadow-xl shadow-black/30">
                      <View className="flex-row gap-x-6">
                        {/* Left Column */}
                        <View className="flex-1 space-y-5">
                          <View>
                            <Text className="text-gray-700 font-sans-semibold mb-2 text-sm">
                              FULL NAME
                            </Text>
                            <TextInput
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl font-sans px-4 py-3.5"
                              placeholder="John Doe"
                              placeholderTextColor="#94A3B8"
                              value={name}
                              onChangeText={setName}
                              autoCapitalize="words"
                            />
                          </View>
                          <View>
                            <Text className="text-gray-700 font-sans-semibold mt-2 mb-2 text-sm">
                              EMAIL ADDRESS
                            </Text>
                            <TextInput
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl font-sans px-4 py-3.5"
                              placeholder="john@example.com"
                              placeholderTextColor="#94A3B8"
                              keyboardType="email-address"
                              autoCapitalize="none"
                              value={email}
                              onChangeText={setEmail}
                            />
                          </View>
                        </View>

                        {/* Right Column */}
                        <View className="flex-1 space-y-5">
                          <View>
                            <Text className="text-gray-700 font-sans-semibold mb-2 text-sm">
                              PASSWORD
                            </Text>
                            <TextInput
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl font-sans px-4 py-3.5"
                              placeholderTextColor="#94A3B8"
                              secureTextEntry
                              value={password}
                              onChangeText={setPassword}
                            />
                          </View>
                          <View>
                            <Text className="text-gray-700 font-sans-semibold mb-2 mt-2 text-sm">
                              CONFIRM PASSWORD
                            </Text>
                            <TextInput
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl font-sans px-4 py-3.5"
                              placeholderTextColor="#94A3B8"
                              secureTextEntry
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                            />
                          </View>
                        </View>
                      </View>

                      {/* Terms Checkbox */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setAgreeTerms(!agreeTerms)}
                        className="flex-row items-start mt-6"
                      >
                        <View
                          className={`w-5 h-5 rounded-md border-2 mr-3 items-center justify-center ${
                            agreeTerms
                              ? "bg-primary border-primary"
                              : "border-gray-400"
                          }`}
                        >
                          {agreeTerms && (
                            <Text className="text-white text-xs font-sans-bold">
                              ✓
                            </Text>
                          )}
                        </View>

                        <Text className="text-gray-500 text-xs font-sans flex-1 leading-4">
                          I agree to the{" "}
                          <Text className="text-primary font-sans-semibold">
                            Terms of Service
                          </Text>{" "}
                          and{" "}
                          <Text className="text-primary font-sans-semibold">
                            Privacy Policy
                          </Text>
                        </Text>
                      </TouchableOpacity>

                      {/* Create Account Button */}
                      <TouchableOpacity
                        className={`rounded-xl py-3.5 mt-6 ${
                          agreeTerms ? "bg-primary" : "bg-gray-400"
                        }`}
                        onPress={handleSignUp}
                        activeOpacity={0.85}
                        disabled={!agreeTerms}
                      >
                        <Text className="text-white text-center font-sans-bold text-base">
                          Create Account
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Link to Sign In */}
                    <TouchableOpacity
                      onPress={() => switchForm("signin")}
                      className="mt-8 self-center"
                    >
                      <Text className="text-white font-sans-semibold underline text-center">
                        Already have an account? Click here to Sign In
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* ===== Sign In Form ===== */}
                {activeForm === "signin" && (
                  <>
                    <Text className="text-3xl font-sans-bold text-white mb-8">
                      Sign In
                    </Text>

                    <View className="bg-white rounded-2xl p-7 shadow-xl shadow-black/30 space-y-5">
                      <View>
                        <Text className="text-gray-700 font-sans-semibold mb-2 text-sm">
                          EMAIL ADDRESS
                        </Text>
                        <TextInput
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl font-sans px-4 py-3.5"
                          placeholder="john@example.com"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={signInEmail}
                          onChangeText={setSignInEmail}
                        />
                      </View>

                      <View>
                        <Text className="text-gray-700 font-sans-semibold mb-2 mt-2 text-sm">
                          PASSWORD
                        </Text>
                        <TextInput
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl font-sans px-4 py-3.5"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry
                          value={signInPassword}
                          onChangeText={setSignInPassword}
                        />
                      </View>

                      <TouchableOpacity
                        className="bg-primary rounded-xl py-3.5 mt-6"
                        onPress={handleSignIn}
                        activeOpacity={0.85}
                      >
                        <Text className="text-white text-center font-sans-bold text-base">
                          Sign In
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Link to Sign Up */}
                    <TouchableOpacity
                      onPress={() => switchForm("signup")}
                      className="mt-8 self-center"
                    >
                      <Text className="text-white font-sans-semibold underline text-center">
                        Don't have an account? Click here to Sign Up
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
}
