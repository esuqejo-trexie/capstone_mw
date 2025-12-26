import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
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

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Index() {
  const { height, width } = useWindowDimensions();
  const router = useRouter();

  // 🔒 Lock this screen to portrait
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const [activeForm, setActiveForm] = useState<"none" | "signup" | "signin">(
    "none"
  );

  // Bottom sheet animation
  const slideY = useRef(new Animated.Value(height)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Sign Up states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign In states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Open bottom sheet
  const openForm = (form: "signup" | "signin") => {
    setActiveForm(form);
    panY.setValue(0);

    Animated.timing(slideY, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  // Switch forms
  const switchForm = (form: "signup" | "signin") => {
    Animated.timing(slideY, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => openForm(form));
  };

  // Close bottom sheet
  const closeForm = () => {
    Animated.timing(slideY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setActiveForm("none"));
  };

  // Swipe-down gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          panY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > height * 0.25) {
          closeForm();
          panY.setValue(0);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      closeForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) {
      alert("Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(
        auth,
        signInEmail.trim(),
        signInPassword
      );
      router.replace("/parent_gate");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View className="flex-1 bg-white overflow-hidden">
      {/* ===== Landing Screen ===== */}
      {activeForm === "none" && (
        <View className="flex-1 justify-center items-center px-8">
          <Image
            source={require("../assets/general/SmartRead_logo.webp")}
            style={{ width: 250, height: 250 }}
            resizeMode="contain"
            className="mb-6"
          />

          <Text className="text-3xl font-sans-bold text-center text-gray-800">
            Ignite your reading,
          </Text>
          <Text className="text-3xl font-sans-bold text-center text-gray-800 mb-10">
            Spark your imagination.
          </Text>

          <TouchableOpacity
            onPress={() => openForm("signup")}
            className="bg-primary px-14 py-4 rounded-2xl shadow-lg mt-8"
          >
            <Text className="text-white font-sans-bold text-2xl">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== Bottom Sheet Form ===== */}
      {activeForm !== "none" && (
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateY: Animated.add(slideY, panY) }],
          }}
          className="absolute inset-0"
        >
          <ImageBackground
            source={require("../assets/general/bg_portrait.webp")}
            resizeMode="cover"
            className="flex-1"
          >
            <View className="flex-1 bg-white/80">
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
              >
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    paddingHorizontal: 20,
                  }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Close button */}
                  <TouchableOpacity
                    onPress={() => setActiveForm("none")}
                    className="absolute top-12 right-6 z-10 w-10 h-10 bg-primary rounded-full items-center justify-center shadow-lg shadow-black/10"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-white text-2xl font-bold">×</Text>
                  </TouchableOpacity>

                  {/* Form Container */}
                  <View className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/10">
                    {/* Header */}
                    <View className="mb-8">
                      <Text className="text-3xl font-sans-bold text-txt_blue mb-2">
                        {activeForm === "signup"
                          ? "Create Account"
                          : "Welcome Back"}
                      </Text>
                      <Text className="text-gray-500 text-left font-sans-medium">
                        {activeForm === "signup"
                          ? "Join our community today"
                          : "Sign in to continue your journey"}
                      </Text>
                    </View>

                    {/* ===== Sign Up Form ===== */}
                    {activeForm === "signup" && (
                      <>
                        <View className="space-y-5">
                          {/* Name Input */}
                          <View>
                            <Text className="text-gray-700 text-sm font-medium mb-2">
                              Full Name
                            </Text>
                            <TextInput
                              placeholder="John Doe"
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 focus:border-primary focus:bg-white"
                              value={name}
                              onChangeText={setName}
                              autoCapitalize="words"
                            />
                          </View>

                          {/* Email Input */}
                          <View>
                            <Text className="text-gray-700 text-sm font-medium mb-2">
                              Email
                            </Text>
                            <TextInput
                              placeholder="hello@example.com"
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 focus:border-primary focus:bg-white"
                              value={email}
                              onChangeText={setEmail}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </View>

                          {/* Password Input */}
                          <View>
                            <Text className="text-gray-700 text-sm font-medium mb-2">
                              Password
                            </Text>
                            <TextInput
                              // secureTextEntry  <-- remove this line
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 focus:border-primary focus:bg-white"
                              value={password}
                              onChangeText={setPassword}
                            />
                          </View>

                          {/* Confirm Password */}
                          <View>
                            <Text className="text-gray-700 text-sm font-medium mb-2">
                              Confirm Password
                            </Text>
                            <TextInput
                              // secureTextEntry  <-- remove this line
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 focus:border-primary focus:bg-white"
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                            />
                          </View>

                          {/* Terms & Conditions */}
                          <View className="flex-row items-start mt-2">
                            <TouchableOpacity
                              className="mt-1 mr-3"
                              onPress={() => setTermsChecked(!termsChecked)}
                            >
                              <View className="w-5 h-5 border border-gray-300 rounded bg-white flex items-center justify-center">
                                {termsChecked && (
                                  <Text className="text-primary text-sm leading-none">
                                    ✓
                                  </Text>
                                )}
                              </View>
                            </TouchableOpacity>

                            <Text className="text-gray-600 text-sm flex-1">
                              I agree to the{" "}
                              <Text className="text-primary font-medium">
                                Terms of Service
                              </Text>{" "}
                              and{" "}
                              <Text className="text-primary font-medium">
                                Privacy Policy
                              </Text>
                            </Text>
                          </View>

                          {/* Sign Up Button */}
                          <TouchableOpacity
                            className="bg-primary py-4 rounded-xl mt-2 shadow-lg shadow-primary/30"
                            onPress={handleSignUp}
                            activeOpacity={0.9}
                          >
                            <Text className="text-white text-center font-sans-bold text-lg ">
                              Create Account
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Switch to Sign In */}
                        <View className="mt-8 pt-6 border-t border-gray-100">
                          <Text className="text-gray-600 text-center">
                            Already have an account?{" "}
                          </Text>
                          <TouchableOpacity
                            onPress={() => switchForm("signin")}
                            className="mt-2"
                          >
                            <Text className="text-primary text-center font-sans-bold text-base">
                              Sign In Now
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    {/* ===== Sign In Form ===== */}
                    {activeForm === "signin" && (
                      <>
                        <View className="space-y-5">
                          {/* Email Input */}
                          <View>
                            <Text className="text-gray-700 text-sm font-medium mb-2">
                              Email
                            </Text>
                            <TextInput
                              placeholder="hello@example.com"
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 focus:border-primary focus:bg-white"
                              value={signInEmail}
                              onChangeText={setSignInEmail}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </View>

                          {/* Password Input */}
                          <View>
                            <Text className="text-gray-700 text-sm font-medium mb-2">
                              Password
                            </Text>
                            <TextInput
                              // secureTextEntry  <-- remove this line
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 focus:border-primary focus:bg-white"
                              value={signInPassword}
                              onChangeText={setSignInPassword}
                            />
                          </View>

                          {/* Remember Me */}
                          <View className="flex-row items-center mt-2">
                            <TouchableOpacity
                              className="mr-3"
                              onPress={() => setRememberMe(!rememberMe)}
                            >
                              <View className="w-5 h-5 border border-gray-300 rounded bg-white flex items-center justify-center">
                                {rememberMe && (
                                  <Text className="text-primary text-sm leading-none">
                                    ✓
                                  </Text>
                                )}
                              </View>
                            </TouchableOpacity>

                            <Text className="text-gray-600 text-sm">
                              Remember me
                            </Text>
                          </View>

                          {/* Sign In Button */}
                          <TouchableOpacity
                            className="bg-primary py-4 rounded-xl mt-2 shadow-lg shadow-primary/30"
                            onPress={handleSignIn}
                            activeOpacity={0.9}
                          >
                            <Text className="text-white text-center font-sans-bold text-lg">
                              Sign In
                            </Text>
                          </TouchableOpacity>

                          {/* Divider */}
                          <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-gray-200" />
                            <Text className="mx-4 text-gray-400 text-sm">
                              or continue with
                            </Text>
                            <View className="flex-1 h-px bg-gray-200" />
                          </View>

                          {/* Social Login */}
                          <View className="flex-row justify-center space-x-4">
                            <TouchableOpacity className="w-14 h-14 border border-gray-200 rounded-xl items-center justify-center">
                              <Text className="text-2xl">G</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="w-14 h-14 border border-gray-200 rounded-xl items-center justify-center">
                              <Text className="text-2xl">f</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="w-14 h-14 border border-gray-200 rounded-xl items-center justify-center">
                              <Text className="text-2xl">in</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Switch to Sign Up */}
                        <View className="mt-8 pt-6 border-t border-gray-100">
                          <Text className="text-gray-600 text-center">
                            Don't have an account?{" "}
                          </Text>
                          <TouchableOpacity
                            onPress={() => switchForm("signup")}
                            className="mt-2"
                          >
                            <Text className="text-primary text-center font-sans-bold text-base">
                              Sign Up Now
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Footer */}
                  <View className="mt-8">
                    <Text className="text-gray-400 text-center text-sm">
                      By continuing, you agree to our Terms and Privacy Policy
                    </Text>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </ImageBackground>
        </Animated.View>
      )}
    </View>
  );
}
