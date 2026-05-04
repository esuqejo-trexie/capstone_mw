import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebaseConfig";

let currentSound: Audio.Sound | null = null;

async function playFirebaseTts(text: string, mode: "story" | "word") {
  try {
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch {}
      currentSound = null;
    }

    const call = httpsCallable(functions, "synthesizeSpeech");
    const result = await call({ text, mode });
    const data = result.data as { audioBase64?: string };
    const base64Audio = data.audioBase64;

    if (!base64Audio) {
      console.error("TTS Playback Error: Firebase returned no audio");
      return;
    }

    const fileUri = FileSystem.cacheDirectory + `tts_${Date.now()}.wav`;

    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Audio.setAudioModeAsync({
      staysActiveInBackground: false,
      interruptionModeAndroid: 1,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    currentSound = new Audio.Sound();

    await currentSound.loadAsync({ uri: fileUri }, { shouldPlay: true });

    currentSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        currentSound?.unloadAsync().catch(() => {});
        currentSound = null;

        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
      }
    });
  } catch (error) {
    console.error("TTS Playback Error:", error);
  }
}

export async function speakText(text: string) {
  if (!text) return;

  await playFirebaseTts(text, "story");
}

export async function speakWord(text: string) {
  const clean = text?.trim();
  if (!clean) return;

  await playFirebaseTts(clean, "word");
}
