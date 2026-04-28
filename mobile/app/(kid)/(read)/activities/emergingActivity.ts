export type WordResult = {
  word: string;
  accuracy?: number;
  errorType?: string;
};

export const MAX_ATTEMPTS = 3;

export function resetEmergingProgress() {
  return {
    practiceStep: 0,
    practiceAttempts: 0,
  };
}

/**
 * Splits a phrase into words and determines
 * if the user is in the phrase reading step.
 */
export function getEmergingStep(sentence: string, practiceStep: number) {
  const words = sentence.split(" ");

  const isPhraseStep = practiceStep >= words.length;
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
  if (!wordResults.length) return false;

  const avg =
    wordResults.reduce((sum, w) => sum + (w.accuracy ?? 0), 0) /
    wordResults.length;

  return avg >= 70;
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
      message: "Nice try! Let's move to the next word 😊",
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

/* =========================================================
   READING SCORING (ARAL + AZURE ALIGNED)
========================================================= */

/**
 * Emerging Final Score
 * Focus: decoding (accuracy + completeness)
 */
export function computeEmergingFinalScore(
  accuracy: number,
  completeness: number,
): number {
  return Math.round(accuracy * 0.8 + completeness * 0.2);
}

/**
 * Converts reading score into stars (DepEd-based)
 */
export function computeStars(score: number): number {
  if (score >= 85) return 3; // Very Satisfactory / Outstanding
  if (score >= 80) return 2; // Satisfactory
  if (score >= 75) return 1; // Fairly Satisfactory
  return 0; // Did Not Meet Expectations
}

/* =========================================================
   COMPREHENSION SCORING (PCM-BASED)
========================================================= */

/**
 * Computes comprehension result for a single question
 * (Emerging: 1 question, max = 2)
 */
export function computeComprehensionScore(selectedScore: 0 | 1 | 2) {
  return {
    score: selectedScore,
    maxScore: 2,
  };
}

/**
 * (Future-proof) Computes total comprehension
 * for multiple questions
 */
export function computeTotalComprehension(scores: (0 | 1 | 2)[]) {
  const total = scores.reduce<number>((sum, s) => sum + s, 0);
  const max = scores.length * 2;

  return {
    score: total,
    maxScore: max,
  };
}
