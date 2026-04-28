import { Buffer } from "buffer";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { AZURE_TTS_KEY, AZURE_TTS_REGION } from "../config";

/* ===============================
   GLOBAL SOUND (prevent overlap)
================================ */
let currentSound: Audio.Sound | null = null;

/* ===============================
   UTIL: escape SSML text
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
    // Stop previous sound
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch {}
      currentSound = null;
    }

    // Fetch TTS
    const response = await fetch(
      `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm",
        },
        body: ssml,
      },
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Azure TTS error:", err);
      return;
    }

    // Convert to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    // ✅ WRITE TO FILE (CRITICAL FOR APK)
    const fileUri = FileSystem.cacheDirectory + `tts_${Date.now()}.wav`;

    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Configure audio
    await Audio.setAudioModeAsync({
      staysActiveInBackground: false,
      interruptionModeAndroid: 1,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Create sound
    currentSound = new Audio.Sound();

    await currentSound.loadAsync({ uri: fileUri }, { shouldPlay: true });

    currentSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        currentSound?.unloadAsync().catch(() => {});
        currentSound = null;

        // optional cleanup
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
      }
    });
  } catch (error) {
    console.error("TTS Playback Error:", error);
  }
}

/* ===============================
   STORY MODE
================================ */
export async function speakText(text: string) {
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
}

/* ===============================
   WORD MODE
================================ */
export async function speakWord(text: string) {
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
}
