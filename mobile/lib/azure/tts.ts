import { Audio } from "expo-av";
import { AZURE_TTS_KEY, AZURE_TTS_REGION } from "../config";

/* ===============================
   UTIL: convert buffer → base64
================================ */
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return globalThis.btoa(binary);
}

/* ===============================
   INTERNAL: fetch + play audio
   (shared by all TTS functions)
================================ */
async function playAzureAudio(ssml: string) {
  const response = await fetch(
    `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
    },
  );

  if (!response.ok) {
    throw new Error(`Azure TTS failed: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64Audio = arrayBufferToBase64(audioBuffer);

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
  });

  const sound = new Audio.Sound();

  await sound.loadAsync({
    uri: `data:audio/mp3;base64,${base64Audio}`,
  });

  await sound.playAsync();
}

/* ===============================
   STORY MODE (existing function)
   DO NOT MODIFY — used by reading
================================ */
export async function speakText(text: string) {
  try {
    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="en-US-Jane:DragonHDLatestNeural">
          <prosody rate="-15%" pitch="+1st">
            ${text}
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
   WORD MODE (new — for games)
================================ */
export async function speakWord(text: string) {
  try {
    const clean = text.trim();

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="en-US-Jane:DragonHDLatestNeural">
          <prosody rate="-15%" pitch="+1st">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    await playAzureAudio(ssml);
  } catch (error) {
    console.error("Azure Word TTS Error:", error);
  }
}
