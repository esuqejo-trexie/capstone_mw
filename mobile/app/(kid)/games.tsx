import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef } from "react";
import { Animated, ImageBackground, Pressable, Text, View } from "react-native";

const games = [
  {
    title: "First Letter Quest",
    route: "/(kid)/(games)/firstLetter",
    color: "bg-orange-400",
    darkColor: "bg-orange-600",
    iconName: "spell-check",
    rotation: "-4deg",
    delay: 0,
  },
  {
    title: "Word Builder",
    route: "/(kid)/(games)/wordBuilder",
    color: "bg-green-400",
    darkColor: "bg-green-600",
    iconName: "puzzle-piece",
    rotation: "3deg",
    delay: 400,
  },
  {
    title: "Sentence Shuffle",
    route: "/(kid)/(games)/sentenceShuffle",
    color: "bg-blue-400",
    darkColor: "bg-blue-600",
    iconName: "random",
    rotation: "-2deg",
    delay: 800,
  },
];

function GameCard({ game }: { game: (typeof games)[0] }) {
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const floatValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
          delay: game.delay,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [
          { rotate: game.rotation },
          { translateY: floatValue },
          { scale: scaleValue },
        ],
      }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(game.route as any)}
        className={`w-64 h-52 rounded-[36px] items-center justify-center border-4 border-white ${game.color} overflow-hidden`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <View className={`absolute bottom-0 w-full h-1/3 ${game.darkColor}`} />

        <View className="bg-white/40 w-20 h-20 rounded-full items-center justify-center mb-4 z-10">
          <FontAwesome5 name={game.iconName} size={36} color="white" />
        </View>

        <Text
          className="text-white text-2xl font-sans-medium text-center px-4 z-10"
          style={{
            textShadowColor: "rgba(0, 0, 0, 0.4)",
            textShadowOffset: { width: 1, height: 2 },
            textShadowRadius: 3,
          }}
        >
          {game.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function GamesScreen() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/70 items-center justify-center px-10">
        <Text className="text-5xl font-sans-bold text-secondary mb-12 tracking-widest">
          Choose a Game!
        </Text>

        <View className="flex-row gap-8 items-center justify-center">
          {games.map((game) => (
            <GameCard key={game.title} game={game} />
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}
