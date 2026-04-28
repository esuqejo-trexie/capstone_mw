export type DevelopingResult = {
  accuracy?: number;
  fluency?: number;
  completeness?: number;
};

/**
 * Developing = full sentence display
 */
export function getDevelopingDisplay(sentence: string) {
  return {
    displayText: sentence,
  };
}

/**
 * Determines if sentence reading is acceptable
 * (optional retry logic)
 */
export function isSentenceAcceptable(result: DevelopingResult) {
  return (result.accuracy ?? 0) >= 70;
}

/* =========================================================
   READING SCORING (ARAL + AZURE ALIGNED)
========================================================= */

/**
 * Developing (Ember) Final Score
 * Focus: words → phrases → early fluency
 */
export function computeDevelopingFinalScore(
  accuracy: number,
  completeness: number,
  fluency: number,
): number {
  return Math.round(accuracy * 0.65 + completeness * 0.25 + fluency * 0.1);
}

/**
 * Converts score into stars (DepEd-based)
 */
export function computeStars(score: number): number {
  if (score >= 85) return 3; // Very Satisfactory / Outstanding
  if (score >= 80) return 2; // Satisfactory
  if (score >= 75) return 1; // Fairly Satisfactory
  return 0; // Did Not Meet Expectations
}

/* =========================================================
   COMPREHENSION (PCM-BASED)
========================================================= */

/**
 * Single question PCM scoring
 */
export function computeComprehensionScore(selectedScore: 0 | 1 | 2) {
  return {
    score: selectedScore,
    maxScore: 2,
  };
}

/**
 * Multiple question support (future-proof)
 */
export function computeTotalComprehension(scores: (0 | 1 | 2)[]) {
  const total = scores.reduce<number>((sum, s) => sum + s, 0);
  const max = scores.length * 2;

  return {
    score: total,
    maxScore: max,
  };
}
