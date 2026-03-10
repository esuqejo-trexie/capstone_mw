type LearnerSession = {
  learnerId: string;
  schoolId: string;
  classId: string;

  name: string;
  learnerCode: string;
  readingProfile: string;
};

let currentLearner: LearnerSession | null = null;

export function setLearnerSession(learner: LearnerSession) {
  currentLearner = learner;
}

export function getLearnerSession(): LearnerSession {
  if (!currentLearner) {
    throw new Error("Learner session not initialized");
  }

  return currentLearner;
}

export function clearLearnerSession() {
  currentLearner = null;
}
