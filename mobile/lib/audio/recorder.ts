import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  const permission = await Audio.requestPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("Microphone permission not granted");
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  recording = new Audio.Recording();

  // Expo preset (TypeScript-safe and stable for Expo Go)
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );

  await recording.startAsync();

  console.log("Recording started");
}

export async function stopRecording(): Promise<string | null> {
  if (!recording) return null;

  try {
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    recording = null;

    console.log("Recording saved at:", uri);

    return uri;
  } catch (error) {
    console.error("Error stopping recording:", error);
    recording = null;
    return null;
  }
}
