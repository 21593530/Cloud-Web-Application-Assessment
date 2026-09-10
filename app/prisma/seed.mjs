import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const wordWithPhonemes = (displayWord, englishWord, symbols, position) => ({
  displayWord,
  englishWord,
  position,
  phonemes: {
    create: symbols.map((symbol, phonemePosition) => ({
      symbol,
      position: phonemePosition,
    })),
  },
});

async function main() {
  const existingActivity = await prisma.activity.findFirst();
  if (existingActivity) {
    console.log("Seed skipped: activities already exist.");
    return;
  }

  await prisma.activity.create({
    data: {
      type: "WORDLE",
      title: "Ship phoneme Wordle",
      clue: "A vessel that travels on water.",
      difficulty: "NORMAL",
      settingsJson: JSON.stringify({ maxGuesses: 6 }),
      words: {
        create: [wordWithPhonemes("ʃ ɪ p", "ship", ["ʃ", "ɪ", "p"], 0)],
      },
    },
  });

  await prisma.activity.create({
    data: {
      type: "WORD_SEARCH",
      title: "Introductory phoneme word search",
      clue: "Find each phoneme-based word in the grid.",
      difficulty: "EASY",
      settingsJson: JSON.stringify({ rows: 8, cols: 8 }),
      words: {
        create: [
          wordWithPhonemes("tʃ ɪ n", "chin", ["tʃ", "ɪ", "n"], 0),
          wordWithPhonemes("dʒ æ m", "jam", ["dʒ", "æ", "m"], 1),
          wordWithPhonemes("b ʉː t", "boot", ["b", "ʉː", "t"], 2),
          wordWithPhonemes("ʃ iː p", "sheep", ["ʃ", "iː", "p"], 3),
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
