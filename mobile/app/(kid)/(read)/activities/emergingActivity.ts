export type WordResult = {
  word: string;
  accuracy?: number;
  errorType?: string;
};

export const MAX_ATTEMPTS = 3;

/**
 * Splits a phrase into words and determines
 * if the user is in the phrase reading step.
 */
export function getEmergingStep(sentence: string, practiceStep: number) {
  const words = sentence.split(" ");

  const isPhraseStep = practiceStep === words.length;

  const displayText = isPhraseStep ? sentence : words[practiceStep];

  return {
    words,
    isPhraseStep,
    displayText,
  };
}

/**
 * Determines if a practice word was read correctly.
 * Uses Azure pronunciation accuracy.
 */
export function isWordCorrect(wordResults: WordResult[]) {
  return wordResults.every((w) => (w.accuracy ?? 0) >= 70);
}

/**
 * Determines the message shown after word practice.
 */
export function getPracticeMessage(
  correct: boolean,
  attempts: number,
): {
  message: string;
  nextAttempts: number;
  proceed: boolean;
} {
  if (correct) {
    return {
      message: "Great job! 👍",
      nextAttempts: 0,
      proceed: true,
    };
  }

  const newAttempts = attempts + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    return {
      message: "Good try! Let's continue practicing.",
      nextAttempts: 0,
      proceed: true,
    };
  }

  return {
    message: `Try again 😊 (${newAttempts}/${MAX_ATTEMPTS})`,
    nextAttempts: newAttempts,
    proceed: false,
  };
}

/**
 * Computes Pronunciation score.
 * SmartRead formula:
 * Pronunciation = 0.7 Accuracy + 0.3 Completeness
 */
export function computePronunciation(
  accuracy: number,
  completeness: number,
): number {
  return Math.round(accuracy * 0.7 + completeness * 0.3);
}

/**
 * Emerging learners use pronunciation only
 * for their final score.
 */
export function computeEmergingFinalScore(pronunciation: number): number {
  return pronunciation;
}

/**
 * Converts score into stars.
 */
export function computeStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 80) return 2;
  if (score >= 70) return 1;
  return 0;
}
