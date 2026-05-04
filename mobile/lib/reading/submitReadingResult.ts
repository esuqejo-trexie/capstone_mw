import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebaseConfig";

type SubmitReadingResultParams = {
  schoolId: string;
  classId: string;
  learnerId: string;
  profile: string;
  activity: number;
  stars: number;

  accuracyScore: number;
  completenessScore: number;
  fluencyScore: number;
  pronScore: number;

  finalScore: number;
  comprehensionScore?: number;
  comprehensionMaxScore?: number;
};

export async function submitReadingResult(data: SubmitReadingResultParams) {
  try {
    const callable = httpsCallable(functions, "submitReadingResult");

    const result = await callable(data);

    return result.data;
  } catch (error) {
    console.error("submitReadingResult error:", error);
    throw error;
  }
}
