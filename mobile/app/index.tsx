import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

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
    "none",
  );

  // Bottom sheet animation
  const slideY = useRef(new Animated.Value(height)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Sign Up states
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

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
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isSigningUp && !isSigningIn && Math.abs(gesture.dy) > 10,
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
    }),
  ).current;

  const handleSignUp = async () => {
    if (isSigningUp || isSigningIn) return;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setIsSigningUp(true);

      // 🔹 1. Create Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      // 🔹 2. Send email verification
      await sendEmailVerification(user);

      // 🔹 3. Create Firestore user document
      await setDoc(doc(db, "users", user.uid), {
        email: email.trim().toLowerCase(),
        fullName: name,
        role: "parent",
        status: "active",
        createdAt: serverTimestamp(),
      });

      alert(
        "Account created! Please check your email and verify your account before signing in.",
      );

      closeForm();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSignIn = async () => {
    if (isSigningUp || isSigningIn) return;

    if (!signInEmail || !signInPassword) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setIsSigningIn(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInEmail.trim(),
        signInPassword,
      );

      const user = userCredential.user;

      // 🔴 Check email verification FIRST
      if (!user.emailVerified) {
        Alert.alert(
          "Email not verified",
          "Please verify your email before signing in.",
          [
            {
              text: "Resend Email",
              onPress: async () => {
                try {
                  await sendEmailVerification(user);
                  Alert.alert(
                    "Verification Sent",
                    "A new verification email has been sent.",
                  );
                } catch (err) {
                  Alert.alert("Error", "Failed to resend email.");
                }
              },
            },
            {
              text: "OK",
              style: "cancel",
            },
          ],
        );

        await auth.signOut();
        return;
      }

      // 🔹 Continue with Firestore validation
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        alert("Account not properly set up. Please sign up again.");
        await auth.signOut();
        return;
      }

      const userData = userSnap.data();

      if (userData.role !== "parent") {
        alert("This account is not a parent account.");
        await auth.signOut();
        return;
      }

      if (userData.status !== "active") {
        alert("Your account is not active.");
        await auth.signOut();
        return;
      }

      router.replace("/parent_gate");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSigningIn(false);
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
                    disabled={isSigningUp || isSigningIn}
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
                          ? "Join, and start your journey today"
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
                              editable={!isSigningUp && !isSigningIn}
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50"
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
                              editable={!isSigningUp && !isSigningIn}
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50"
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
                            <View className="relative">
                              <TextInput
                                editable={!isSigningUp && !isSigningIn}
                                secureTextEntry={!showPassword}
                                className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 pr-12"
                                value={password}
                                onChangeText={setPassword}
                              />
                              <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4"
                              >
                                <Text className="text-gray-500">
                                  {showPassword ? "Hide" : "Show"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Confirm Password */}
                          <View>
                            <Text className="text-gray-700 text-sm font-medium mb-2">
                              Confirm Password
                            </Text>
                            <View className="relative">
                              <TextInput
                                editable={!isSigningUp && !isSigningIn}
                                secureTextEntry={!showConfirmPassword}
                                className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 pr-12"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                              />
                              <TouchableOpacity
                                onPress={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-4 top-4"
                              >
                                <Text className="text-gray-500">
                                  {showConfirmPassword ? "Hide" : "Show"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Sign Up Button */}
                          <TouchableOpacity
                            className={`py-4 rounded-xl mt-5 shadow-lg ${
                              isSigningUp
                                ? "bg-gray-400"
                                : "bg-primary shadow-primary/30"
                            }`}
                            onPress={handleSignUp}
                            activeOpacity={0.9}
                            disabled={isSigningUp || isSigningIn}
                          >
                            {isSigningUp ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <Text className="text-white text-center font-sans-bold text-lg">
                                Create Account
                              </Text>
                            )}
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
                            disabled={isSigningUp || isSigningIn}
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
                              editable={!isSigningUp && !isSigningIn}
                              className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50"
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
                            <View className="relative">
                              <TextInput
                                editable={!isSigningUp && !isSigningIn}
                                secureTextEntry={!showSignInPassword}
                                className="border border-gray-200 rounded-xl px-5 py-4 bg-gray-50 pr-12"
                                value={signInPassword}
                                onChangeText={setSignInPassword}
                              />
                              <TouchableOpacity
                                onPress={() =>
                                  setShowSignInPassword(!showSignInPassword)
                                }
                                className="absolute right-4 top-4"
                              >
                                <Text className="text-gray-500">
                                  {showSignInPassword ? "Hide" : "Show"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Sign In Button */}
                          <TouchableOpacity
                            className={`py-4 rounded-xl mt-2 shadow-lg ${
                              isSigningIn
                                ? "bg-gray-400"
                                : "bg-primary shadow-primary/30"
                            }`}
                            onPress={handleSignIn}
                            activeOpacity={0.9}
                            disabled={isSigningUp || isSigningIn}
                          >
                            {isSigningIn ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <Text className="text-white text-center font-sans-bold text-lg">
                                Sign In
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* Switch to Sign Up */}
                        <View className="mt-8 pt-6 border-t border-gray-100">
                          <Text className="text-gray-600 text-center">
                            Don't have an account?{" "}
                          </Text>
                          <TouchableOpacity
                            onPress={() => switchForm("signup")}
                            className="mt-2"
                            disabled={isSigningUp || isSigningIn}
                          >
                            <Text className="text-primary text-center font-sans-bold text-base">
                              Sign Up Now
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
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
