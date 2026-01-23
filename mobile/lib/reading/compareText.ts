export function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(Boolean);
}

export function compareReading(reference: string, spoken: string) {
  const refWords = normalizeText(reference);
  const spokenWords = normalizeText(spoken);

  let correct = 0;
  const missed: string[] = [];
  const extra: string[] = [];

  const spokenSet = new Set(spokenWords);

  refWords.forEach((word) => {
    if (spokenSet.has(word)) {
      correct++;
    } else {
      missed.push(word);
    }
  });

  spokenWords.forEach((word) => {
    if (!refWords.includes(word)) {
      extra.push(word);
    }
  });

  const accuracy = Math.round((correct / refWords.length) * 100);

  return {
    accuracy,
    correct,
    total: refWords.length,
    missed,
    extra,
  };
}
