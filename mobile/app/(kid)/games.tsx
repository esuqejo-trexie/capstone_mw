import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, functions } from "../../firebaseConfig";
import { getLearnerSession } from "../../lib/sessions/kidSession";

const games = [
  {
    title: "First Letter Quest",
    route: "/(kid)/(games)/firstLetter",
    ticketCost: 1,
    color: "bg-orange-400",
    darkColor: "bg-orange-600",
    iconName: "spell-check",
    rotation: "-4deg",
    delay: 0,
  },
  {
    title: "Word Explorer",
    route: "/(kid)/(games)/wordExplorer",
    ticketCost: 1,
    color: "bg-green-400",
    darkColor: "bg-green-600",
    iconName: "search",
    rotation: "3deg",
    delay: 300,
  },
  {
    title: "Sentence Shuffle",
    route: "/(kid)/(games)/sentenceShuffle",
    ticketCost: 2,
    color: "bg-blue-400",
    darkColor: "bg-blue-600",
    iconName: "random",
    rotation: "-2deg",
    delay: 600,
  },
  {
    title: "Clue Hunt",
    route: "/(kid)/(games)/clueHunt",
    ticketCost: 2,
    color: "bg-purple-400",
    darkColor: "bg-purple-600",
    iconName: "lightbulb",
    rotation: "4deg",
    delay: 900,
  },
];

type GameType = (typeof games)[0];

function GameCard({
  game,
  scale,
  onSelect,
}: {
  game: GameType;
  scale: number;
  onSelect: (game: GameType) => void;
}) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const floatValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: -8 * scale,
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
  }, [floatValue, scale, game.delay]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
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

  const cardWidth = 256 * scale;
  const cardHeight = 208 * scale;

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
        onPress={() => onSelect(game)}
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: 36 * scale,
          borderWidth: 4,
          borderColor: "white",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
        className={`${game.color}`}
      >
        <View
          className={`absolute bottom-0 w-full ${game.darkColor}`}
          style={{ height: cardHeight * 0.33 }}
        />

        <View
          style={{
            width: 80 * scale,
            height: 80 * scale,
            borderRadius: 40 * scale,
          }}
          className="bg-white/40 items-center justify-center mb-2 z-10"
        >
          <FontAwesome5
            name={game.iconName as any}
            size={36 * scale}
            color="white"
          />
        </View>

        <Text
          style={{
            fontSize: 22 * scale,
            textAlign: "center",
            paddingHorizontal: 12 * scale,
            textShadowColor: "rgba(0,0,0,0.4)",
            textShadowOffset: { width: 1, height: 2 },
            textShadowRadius: 3,
          }}
          className="text-white font-sans-medium mt-5 z-10"
        >
          {game.title}
        </Text>

        <View className="flex-row items-center z-10">
          <Text
            style={{ fontSize: 16 * scale }}
            className="text-white font-sans-medium"
          >
            Cost: {game.ticketCost} 🎟
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const { schoolId, classId, learnerId } = getLearnerSession();
  const { width, height } = useWindowDimensions();

  const [tickets, setTickets] = useState(0);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const screenWidth = Math.max(width, height);
  const screenHeight = Math.min(width, height);

  const isTablet = screenWidth / screenHeight < 1.6;

  const columns = isTablet ? 2 : 4;
  const rows = isTablet ? 2 : 1;

  const baseCardWidth = 256;
  const baseCardHeight = 208;
  const baseGap = 24;

  const availableWidth = screenWidth * 0.9;
  const availableHeight = screenHeight * 0.65;

  const requiredBaseWidth = columns * baseCardWidth + (columns - 1) * baseGap;
  const requiredBaseHeight = rows * baseCardHeight + (rows - 1) * baseGap;

  const widthScale = availableWidth / requiredBaseWidth;
  const heightScale = availableHeight / requiredBaseHeight;

  const scale = Math.min(widthScale, heightScale);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
    };

    lockOrientation();

    return () => {
      const unlockOrientation = async () => {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.DEFAULT,
        );
      };

      unlockOrientation();
    };
  }, []);

  useEffect(() => {
    const learnerRef = doc(
      db,
      "schools",
      schoolId,
      "classes",
      classId,
      "learners",
      learnerId,
    );

    const unsubscribe = onSnapshot(learnerRef, (snap) => {
      const data: any = snap.data();
      if (typeof data?.tickets === "number") {
        setTickets(data.tickets);
      }
    });

    return () => unsubscribe();
  }, [schoolId, classId, learnerId]);

  const handleGameSelect = (game: GameType) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  const startGame = async () => {
    if (!selectedGame) return;

    try {
      const spendTicket = httpsCallable(functions, "spendTicket");

      await spendTicket({
        schoolId,
        classId,
        learnerId,
        cost: selectedGame.ticketCost,
      });

      setShowModal(false);

      router.push(selectedGame.route as any);
    } catch (error) {
      console.log("Ticket spending failed:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/general/bg_landscape.webp")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-white/80">
        <SafeAreaView className="flex-1 items-center justify-center">
          {/* HEADER */}
          <View
            className="flex-row items-center justify-between"
            style={{
              width: requiredBaseWidth * scale,
              marginBottom: 30 * scale,
            }}
          >
            <Text
              style={{
                fontSize: 48 * scale,
                letterSpacing: 3,
              }}
              className="font-sans-bold text-secondary"
            >
              Choose a Game!
            </Text>

            <View
              className="flex-row items-center px-5 py-2 rounded-2xl"
              style={{
                backgroundColor: "#FEF3C7",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 28 * scale }}>🎟</Text>

              <Text
                className="font-sans-extrabold ml-2"
                style={{
                  fontSize: 30 * scale,
                  color: "#92400E",
                }}
              >
                {tickets}
              </Text>
            </View>
          </View>

          {/* GAME GRID */}
          <View
            style={{
              gap: baseGap * scale,
              width: requiredBaseWidth * scale,
            }}
            className="flex-row flex-wrap items-center justify-center"
          >
            {games.map((game) => (
              <GameCard
                key={game.title}
                game={game}
                scale={scale}
                onSelect={handleGameSelect}
              />
            ))}
          </View>

          {/* MODAL */}
          <Modal visible={showModal} transparent animationType="fade">
            <View className="absolute inset-0 bg-black/40 items-center justify-center">
              <View
                className="bg-white rounded-3xl items-center"
                style={{
                  width: 420 * scale,
                  padding: 30 * scale,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 10,
                }}
              >
                {selectedGame && (
                  <>
                    <Text
                      className="font-sans-bold text-secondary"
                      style={{
                        fontSize: 28 * scale,
                        marginBottom: 10 * scale,
                      }}
                    >
                      Play Game?
                    </Text>

                    <Text
                      className="font-sans-medium text-center"
                      style={{
                        fontSize: 20 * scale,
                        marginBottom: 20 * scale,
                      }}
                    >
                      {selectedGame.title}
                    </Text>

                    <Text
                      className="font-sans-medium"
                      style={{ fontSize: 18 * scale }}
                    >
                      Cost: 🎟 {selectedGame.ticketCost}
                    </Text>

                    <Text
                      className="font-sans-medium"
                      style={{
                        fontSize: 18 * scale,
                        marginBottom: 24 * scale,
                      }}
                    >
                      You have: 🎟 {tickets}
                    </Text>

                    {tickets < selectedGame.ticketCost && (
                      <Text
                        className="font-sans-medium text-red-500 text-center"
                        style={{
                          fontSize: 16 * scale,
                          marginBottom: 20 * scale,
                        }}
                      >
                        Not enough tickets. Earn more by reading!
                      </Text>
                    )}

                    <View className="flex-row gap-4">
                      <Pressable
                        onPress={() => setShowModal(false)}
                        className="bg-gray-300 rounded-2xl items-center justify-center"
                        style={{
                          paddingVertical: 12 * scale,
                          paddingHorizontal: 28 * scale,
                        }}
                      >
                        <Text className="font-sans-bold">Cancel</Text>
                      </Pressable>

                      <Pressable
                        disabled={tickets < selectedGame.ticketCost}
                        onPress={startGame}
                        className="bg-secondary rounded-2xl items-center justify-center"
                        style={{
                          paddingVertical: 12 * scale,
                          paddingHorizontal: 28 * scale,
                          opacity: tickets < selectedGame.ticketCost ? 0.5 : 1,
                        }}
                      >
                        <Text className="text-white font-sans-bold">Play</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}
