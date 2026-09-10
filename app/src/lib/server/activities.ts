import type { Activity, Phoneme, Word } from "@prisma/client";
import type {
  ActivityRecord,
  ActivitySettings,
  ActivityType,
  Difficulty,
  WordRecord,
} from "@/lib/domain/activity";
import type { ActivityCreateInput, ActivityUpdateInput } from "@/lib/validation/activity";
import { prisma } from "@/lib/server/prisma";

export const activityInclude = {
  words: {
    orderBy: { position: "asc" as const },
    include: {
      phonemes: { orderBy: { position: "asc" as const } },
    },
  },
} as const;

type ActivityWithWords = Activity & {
  words: Array<Word & { phonemes: Phoneme[] }>;
};

function parseSettings(settingsJson: string): ActivitySettings {
  try {
    const parsed: unknown = JSON.parse(settingsJson);
    return parsed && typeof parsed === "object" ? parsed as ActivitySettings : {};
  } catch {
    return {};
  }
}

export function serializeActivity(activity: ActivityWithWords): ActivityRecord {
  return {
    id: activity.id,
    type: activity.type as ActivityType,
    title: activity.title,
    clue: activity.clue,
    difficulty: activity.difficulty as Difficulty | null,
    settings: parseSettings(activity.settingsJson),
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
    words: activity.words.map<WordRecord>((word) => ({
      id: word.id,
      activityId: word.activityId,
      englishWord: word.englishWord,
      displayWord: word.displayWord,
      position: word.position,
      phonemes: word.phonemes.map((phoneme) => ({
        id: phoneme.id,
        symbol: phoneme.symbol,
        position: phoneme.position,
      })),
    })),
  };
}

function wordCreateData(words: ActivityCreateInput["words"] | NonNullable<ActivityUpdateInput["words"]>) {
  return words.map((word) => ({
    displayWord: word.displayWord,
    englishWord: word.englishWord ?? null,
    position: word.position,
    phonemes: {
      create: word.phonemes.map((symbol, position) => ({ symbol, position })),
    },
  }));
}

function activityData(input: ActivityCreateInput) {
  return {
    type: input.type,
    title: input.title,
    clue: input.clue ?? null,
    difficulty: input.difficulty ?? null,
    settingsJson: JSON.stringify(input.settings),
    words: { create: wordCreateData(input.words) },
  };
}

export async function listActivities() {
  const activities = await prisma.activity.findMany({
    include: activityInclude,
    orderBy: { updatedAt: "desc" },
  });
  return activities.map(serializeActivity);
}

export async function getActivity(id: string) {
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: activityInclude,
  });
  return activity ? serializeActivity(activity) : null;
}

export async function createActivity(input: ActivityCreateInput) {
  const activity = await prisma.activity.create({
    data: activityData(input),
    include: activityInclude,
  });
  return serializeActivity(activity);
}

export async function updateActivity(id: string, input: ActivityUpdateInput) {
  const activity = await prisma.$transaction(async (transaction) => {
    if (input.words) {
      await transaction.word.deleteMany({ where: { activityId: id } });
    }

    return transaction.activity.update({
      where: { id },
      data: {
        ...(input.type === undefined ? {} : { type: input.type }),
        ...(input.title === undefined ? {} : { title: input.title }),
        ...(input.clue === undefined ? {} : { clue: input.clue ?? null }),
        ...(input.difficulty === undefined ? {} : { difficulty: input.difficulty ?? null }),
        ...(input.settings === undefined ? {} : { settingsJson: JSON.stringify(input.settings) }),
        ...(input.words === undefined ? {} : { words: { create: wordCreateData(input.words) } }),
      },
      include: activityInclude,
    });
  });

  return serializeActivity(activity);
}

export async function deleteActivity(id: string) {
  await prisma.activity.delete({ where: { id } });
}
