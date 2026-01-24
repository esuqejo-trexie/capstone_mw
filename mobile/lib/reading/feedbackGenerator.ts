// lib/reading/feedbackGenerator.ts

export type ReadingFeedbackInput = {
  targetSentence: string;
  transcription: string;
  accuracy: number;
  errors: {
    missed: string[];
    extra: string[];
    mispronounced: string[];
  };
};

const SYSTEM_INSTRUCTIONS = `
You are a reading coach for Grade 3 English learners.
Give one short, encouraging response.
Use simple words.
Focus on what the child can improve.
`;

function buildUserPrompt(input: ReadingFeedbackInput): string {
  return `
Target sentence:
${input.targetSentence}

What the child said:
${input.transcription}

Accuracy:
${input.accuracy}%

Errors:
- Missed words: ${input.errors.missed.length ? input.errors.missed.join(", ") : "none"}
- Extra words: ${input.errors.extra.length ? input.errors.extra.join(", ") : "none"}
- Mispronounced words: ${
    input.errors.mispronounced.length
      ? input.errors.mispronounced.join(", ")
      : "none"
  }
`;
}

export async function generateAIFeedback(
  input: ReadingFeedbackInput,
): Promise<string> {
  try {
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
  if (input.errors.missed.length > 0) {
    return "Good try! Remember to read every word you see.";
  }

  if (input.errors.extra.length > 0) {
    return "Nice effort! Try to read only the words in the sentence.";
  }

  if (input.accuracy < 60) {
    return "Keep practicing! Let’s read the sentence together next time.";
  }

  return "Great job reading! Keep it up!";
}
