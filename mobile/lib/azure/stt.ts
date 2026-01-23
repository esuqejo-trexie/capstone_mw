import { Audio } from "expo-av";
import { AZURE_STT_ENDPOINT, AZURE_STT_KEY } from "../config";

let recording: Audio.Recording | null = null;

// --- START RECORDING ---
export async function startRecording() {
  const permission = await Audio.requestPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Audio permission not granted");
  }

  recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );
  await recording.startAsync();
}

// --- STOP & RETURN AUDIO URI ---
export async function stopRecording(): Promise<string | null> {
  if (!recording) return null;

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;

  return uri;
}

// --- SEND TO WHISPER STT (AZURE OPENAI) ---
export async function sendToSTT(audioUri: string) {
  if (!audioUri) {
    throw new Error("No audio URI provided");
  }

  const url = `${AZURE_STT_ENDPOINT}/openai/deployments/whisper-stt/audio/transcriptions?api-version=2024-10-01-preview`;

  const formData = new FormData();

  formData.append("file", {
    uri: audioUri,
    name: "speech.m4a",
    type: "audio/m4a",
  } as any);

  formData.append("model", "whisper-1");
  formData.append("language", "en" as any);

  formData.append("model", "whisper-1");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": AZURE_STT_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Whisper STT Error:", err);
    throw new Error(`Whisper STT failed: ${response.status}`);
  }

  return response.json(); // { text: "..." }
}
