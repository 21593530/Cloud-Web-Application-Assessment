export const ACTIVITY_TYPES = ["WORDLE", "WORD_SEARCH"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const DIFFICULTY_LEVELS = ["EASY", "NORMAL", "HARD"] as const;
export type Difficulty = (typeof DIFFICULTY_LEVELS)[number];

export type ActivitySettings = {
  maxGuesses?: number;
  rows?: number;
  cols?: number;
};

export type PhonemeRecord = {
  id: string;
  symbol: string;
  position: number;
};

export type WordRecord = {
  id: string;
  activityId: string;
  englishWord: string | null;
  displayWord: string;
  position: number;
  phonemes: PhonemeRecord[];
};

export type ActivityRecord = {
  id: string;
  type: ActivityType;
  title: string;
  clue: string | null;
  difficulty: Difficulty | null;
  settings: ActivitySettings;
  createdAt: string;
  updatedAt: string;
  words: WordRecord[];
};

export type ActivitySuccessResponse<T> = {
  data: T;
};

export type ActivityErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
