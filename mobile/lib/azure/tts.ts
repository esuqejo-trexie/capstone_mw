import { Buffer } from "buffer";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { AZURE_TTS_KEY, AZURE_TTS_REGION } from "../config";

/* ===============================
   GLOBAL SOUND (prevent overlap)
================================ */
let currentSound: Audio.Sound | null = null;

/* ===============================
   UTIL: escape SSML text (CRITICAL)
================================ */
function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ===============================
   INTERNAL: fetch + play audio
================================ */
async function playAzureAudio(ssml: string) {
  try {
    // 🔴 Stop previous audio
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch {}
      currentSound = null;
    }

    // 🔵 Fetch Azure TTS
    const response = await fetch(
      `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
        },
        body: ssml,
      },
    );

    console.log("Azure response OK:", response.ok);

    if (!response.ok) {
      const text = await response.text();
      console.log("Azure error response:", text);
      throw new Error(`Azure TTS failed: ${response.status}`);
    }

    // 🟢 Convert buffer → base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    console.log("Base64 length:", base64Audio.length);

    const FS: any = FileSystem;

    const fileUri = `${FS.cacheDirectory}tts-${Date.now()}.mp3`;

    console.log("Saving file:", fileUri);

    await FS.writeAsStringAsync(fileUri, base64Audio, {
      encoding: "base64",
    });

    // 🔴 FIXED AUDIO MODE (CRITICAL FOR APK)
    await Audio.setAudioModeAsync({
      staysActiveInBackground: false,
      interruptionModeAndroid: 1,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // 🔊 Play audio safely
    currentSound = new Audio.Sound();

    try {
      await currentSound.loadAsync({ uri: fileUri }, { shouldPlay: false });

      await currentSound.setVolumeAsync(1.0);

      // 🔴 FIXED: ensure playback starts correctly
      await currentSound.setPositionAsync(0);

      await currentSound.playAsync();

      currentSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          currentSound?.unloadAsync();
          FS.deleteAsync(fileUri, { idempotent: true });
          currentSound = null;
        }
      });
    } catch (err) {
      console.log("Playback error:", err);

      try {
        await currentSound.unloadAsync();
      } catch {}

      currentSound = null;
    }
  } catch (error) {
    console.error("Azure TTS Playback Error:", error);
  }
}

/* ===============================
   STORY MODE
================================ */
export async function speakText(text: string) {
  try {
    if (!text) return;

    const safeText = escapeXml(text);

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="en-US-JennyNeural">
          <prosody rate="-35%" pitch="+1st">
            ${safeText}
          </prosody>
        </voice>
      </speak>
    `;

    await playAzureAudio(ssml);
  } catch (error) {
    console.error("Azure Story TTS Error:", error);
  }
}

/* ===============================
   WORD MODE
================================ */
export async function speakWord(text: string) {
  try {
    const clean = text?.trim();
    if (!clean) return;

    const safeText = escapeXml(clean);

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="en-US-JennyNeural">
          <prosody rate="-25%" pitch="+2st">
            ${safeText}
          </prosody>
        </voice>
      </speak>
    `;

    await playAzureAudio(ssml);
  } catch (error) {
    console.error("Azure Word TTS Error:", error);
  }
}
