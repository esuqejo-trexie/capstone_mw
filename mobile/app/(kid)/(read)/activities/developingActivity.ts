export function computeDevelopingFinalScore(
  accuracy: number,
  completeness: number,
  fluency: number,
): number {
  return Math.round(accuracy * 0.6 + completeness * 0.2 + fluency * 0.2);
}

export function buildDevelopingSessionResult(params: {
  accuracy: number;
  completeness: number;
  fluency: number;
  literalScore: 0 | 1 | 2;
  inferentialScore?: 0 | 1 | 2;
}) {
  const finalScore = computeDevelopingFinalScore(
    params.accuracy,
    params.completeness,
    params.fluency,
  );

  const stars =
    finalScore >= 85 ? 3 : finalScore >= 80 ? 2 : finalScore >= 75 ? 1 : 0;

  return {
    accuracyScore: params.accuracy,
    completenessScore: params.completeness,
    fluencyScore: params.fluency,

    finalScore,
    stars,

    literalScore: params.literalScore,
    inferentialScore: params.inferentialScore ?? null,

    profile: "Developing",
    createdAt: Date.now(),
  };
}
