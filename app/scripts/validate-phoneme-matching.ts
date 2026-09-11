import { tokensMatchInEitherDirection } from "../src/lib/domain/phoneme";

const target = ["tʃ", "ɪ", "n"];

if (!tokensMatchInEitherDirection(["tʃ", "ɪ", "n"], target)) {
  throw new Error("Expected forward multi-character phoneme matching to pass.");
}

if (!tokensMatchInEitherDirection(["n", "ɪ", "tʃ"], target)) {
  throw new Error("Expected reverse multi-character phoneme matching to pass.");
}

if (tokensMatchInEitherDirection(["t", "ʃ", "ɪ", "n"], target)) {
  throw new Error("Expected split multi-character phoneme matching to fail.");
}

console.log("Phoneme matching regression passed: forward, reverse, and split-token cases behave correctly.");
