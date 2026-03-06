import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../firebaseConfig";

export async function assessPronunciation(
  audioUri: string,
  referenceText: string,
) {
  // Convert recorded file → blob
  const response = await fetch(audioUri);
  const blob = await response.blob();

  // Convert blob → base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });

  const functions = getFunctions(app);
  const call = httpsCallable(functions, "assessPronunciation");

  const result: any = await call({
    audioBase64: base64,
    referenceText,
  });

  return result.data;
}
