import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export async function saveReadingSession({
  schoolId,
  classId,
  learnerId,
  activity,
  profile,
  accuracyScore,
  completenessScore,
  fluencyScore,
  pronScore,
  pronunciationScore,
  stars,
}: any) {
  try {
    await addDoc(
      collection(
        db,
        "schools",
        schoolId,
        "classes",
        classId,
        "learners",
        learnerId,
        "readingSessions",
      ),
      {
        activity,
        profile,

        accuracyScore,
        completenessScore,
        fluencyScore,
        pronScore,

        pronunciationScore,
        stars,

        createdAt: serverTimestamp(),
      },
    );
  } catch (error) {
    console.error("Error saving reading session:", error);
  }
}
