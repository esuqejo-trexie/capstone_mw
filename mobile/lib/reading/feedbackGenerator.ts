// lib/reading/feedbackGenerator.ts

export type ReadingFeedbackInput = {
  targetSentence: string;
  transcription: string;
  stars: number;
  accuracy: number;
  errors: {
    missed: string[];
    extra: string[];
    mispronounced: string[];
  };
};

const SYSTEM_INSTRUCTIONS = `
You are a reading coach for Grade 3 learners.

STRICT RULES:

1. The target sentence is ALWAYS correct.
2. NEVER rewrite or fix the sentence.
3. ONLY use the provided errors.

FEEDBACK RULES:

- If stars = 3:
  → Give praise ONLY.
  → Do NOT mention errors.

- If stars = 2 or below:
  → Give helpful feedback.

- If there are missed words:
  → Mention ONE missed word in your sentence.
  → Encourage the learner to read it again.

- If there are mispronounced words:
  → Mention the word and encourage clearer pronunciation.

- NEVER give vague feedback like:
  "read all words" or "try again"

STYLE:
- One short sentence only
- Simple English
- Encouraging tone
`;

function buildUserPrompt(input: ReadingFeedbackInput): string {
  return `
Target: ${input.targetSentence}

Child said: ${input.transcription}

Stars: ${input.stars}

Missed words: ${
    input.errors.missed.length ? input.errors.missed.join(", ") : "none"
  }

Mispronounced words: ${
    input.errors.mispronounced.length
      ? input.errors.mispronounced.join(", ")
      : "none"
  }

Instruction:
If there are missed or mispronounced words, mention at least one word in your answer.
`;
}
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateAIFeedback(
  input: ReadingFeedbackInput,
): Promise<string> {
  try {
    const normalizedTarget = normalize(input.targetSentence);
    const normalizedTranscription = normalize(input.transcription);

    const isExactMatch = normalizedTarget === normalizedTranscription;
    if (isExactMatch) {
      return "Excellent! You read it perfectly!";
    }
    const endpoint = process.env.EXPO_PUBLIC_AZURE_GPT_ENDPOINT;
    const apiKey = process.env.EXPO_PUBLIC_AZURE_GPT_API_KEY;
    const deployment = process.env.EXPO_PUBLIC_AZURE_GPT_DEPLOYMENT;
    const apiVersion = process.env.EXPO_PUBLIC_AZURE_GPT_API_VERSION;

    // 🔍 ENV DEBUG (THIS IS THE KEY)

    if (!endpoint || !apiKey || !deployment || !apiVersion) {
      console.warn("⚠️ Azure GPT env vars missing, using fallback feedback.");
      return fallbackFeedback(input);
    }

    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTIONS },
            { role: "user", content: buildUserPrompt(input) },
          ],
          temperature: 0.6,
          max_tokens: 60,
        }),
      },
    );

    const data = await response.json();

    return (
      data?.choices?.[0]?.message?.content?.trim() ?? fallbackFeedback(input)
    );
  } catch (error) {
    console.error("❌ AI feedback error:", error);
    return fallbackFeedback(input);
  }
}

/**
 * Rule-based fallback (child-safe)
 * Used when AI is unavailable or misconfigured
 */
function fallbackFeedback(input: ReadingFeedbackInput): string {
  const { missed, mispronounced } = input.errors;

  if (input.stars === 3) {
    return "Excellent! You read it perfectly!";
  }

  if (missed.length > 0) {
    return `Good try! You missed "${missed[0]}". Let's read it again.`;
  }

  if (mispronounced.length > 0) {
    return `Nice effort! Try saying "${mispronounced[0]}" clearly.`;
  }

  return "Good job! Keep practicing!";
}
