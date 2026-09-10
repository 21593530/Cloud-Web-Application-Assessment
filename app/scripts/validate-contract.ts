import { activityCreateSchema } from "../src/lib/validation/activity";

const validWordle = {
  type: "WORDLE" as const,
  title: "Ship phoneme Wordle",
  clue: "A vessel that travels on water.",
  difficulty: "NORMAL" as const,
  settings: { maxGuesses: 6 },
  words: [
    {
      displayWord: "ʃ ɪ p",
      englishWord: "ship",
      position: 0,
      phonemes: ["ʃ", "ɪ", "p"],
    },
  ],
};

const invalidWordle = {
  ...validWordle,
  words: [
    validWordle.words[0],
    { ...validWordle.words[0], position: 1, displayWord: "tʃ ɪ n" },
  ],
};

const invalidPhonemes = {
  ...validWordle,
  words: [{ ...validWordle.words[0], phonemes: ["   "] }],
};

if (!activityCreateSchema.safeParse(validWordle).success) {
  throw new Error("Expected the valid multi-character Wordle payload to pass.");
}

if (activityCreateSchema.safeParse(invalidWordle).success) {
  throw new Error("Expected a Wordle payload with two words to fail.");
}

if (activityCreateSchema.safeParse(invalidPhonemes).success) {
  throw new Error("Expected a blank phoneme symbol to fail.");
}

console.log("Validation contract passed: valid payload accepted and invalid payloads rejected.");
