import { db } from "@/firebaseConfig";
import { getLearnerSession } from "@/lib/sessions/kidSession";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type SaveGameSessionParams = {
  game: string;
  score: number;
  maxScore: number;
  ticketsSpent: number;
  completed: boolean;
};

export async function saveGameSession({
  game,
  score,
  maxScore,
  ticketsSpent,
  completed,
}: SaveGameSessionParams) {
  const { schoolId, classId, learnerId } = getLearnerSession();

  const ref = collection(
    db,
    "schools",
    schoolId,
    "classes",
    classId,
    "learners",
    learnerId,
    "gameSessions",
  );

  await addDoc(ref, {
    game,
    score,
    maxScore,
    ticketsSpent,
    completed,
    createdAt: serverTimestamp(),
  });
}
