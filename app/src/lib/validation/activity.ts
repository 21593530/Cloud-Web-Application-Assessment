import { z } from "zod";
import { ACTIVITY_TYPES, DIFFICULTY_LEVELS } from "@/lib/domain/activity";

const phonemeSymbolSchema = z.string().trim().min(1, "Each phoneme must contain at least one character.").max(20, "Phoneme symbols must be 20 characters or fewer.");

export const activityIdSchema = z.object({
  id: z.string().cuid("Activity ID must be a valid CUID."),
});

export const activitySettingsSchema = z.object({
  maxGuesses: z.number().int().min(1).max(12).optional(),
  rows: z.number().int().min(4).max(20).optional(),
  cols: z.number().int().min(4).max(20).optional(),
}).strict();

export const wordInputSchema = z.object({
  englishWord: z.string().trim().max(100, "English words must be 100 characters or fewer.").nullable().optional(),
  displayWord: z.string().trim().min(1, "A display word is required.").max(200, "Display words must be 200 characters or fewer."),
  position: z.number().int().min(0),
  phonemes: z.array(phonemeSymbolSchema).min(1, "Each word needs at least one phoneme."),
}).strict();

const activityFieldsSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  title: z.string().trim().min(1, "An activity title is required.").max(120, "Activity titles must be 120 characters or fewer."),
  clue: z.string().trim().max(500, "Clues must be 500 characters or fewer.").nullable().optional(),
  difficulty: z.enum(DIFFICULTY_LEVELS).nullable().optional(),
  settings: activitySettingsSchema.default({}),
  words: z.array(wordInputSchema).min(1, "At least one word is required."),
});

export const activityCreateSchema = activityFieldsSchema.superRefine((activity, context) => {
  if (activity.type === "WORDLE" && activity.words.length !== 1) {
    context.addIssue({ code: "custom", path: ["words"], message: "Wordle activities must contain exactly one word." });
  }

  if (activity.type === "WORD_SEARCH" && activity.words.length < 2) {
    context.addIssue({ code: "custom", path: ["words"], message: "Word Search activities must contain at least two words." });
  }

  const positions = activity.words.map((word) => word.position);
  if (new Set(positions).size !== positions.length) {
    context.addIssue({ code: "custom", path: ["words"], message: "Word positions must be unique within an activity." });
  }
});

export const activityUpdateSchema = activityFieldsSchema.partial().extend({
  words: z.array(wordInputSchema).min(1, "At least one word is required.").optional(),
}).superRefine((activity, context) => {
  if (activity.type === "WORDLE" && activity.words && activity.words.length !== 1) {
    context.addIssue({ code: "custom", path: ["words"], message: "Wordle activities must contain exactly one word." });
  }

  if (activity.type === "WORD_SEARCH" && activity.words && activity.words.length < 2) {
    context.addIssue({ code: "custom", path: ["words"], message: "Word Search activities must contain at least two words." });
  }
});

export type ActivityCreateInput = z.infer<typeof activityCreateSchema>;
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;
