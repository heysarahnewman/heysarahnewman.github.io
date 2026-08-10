/*
  ================================================================
  EDIT THIS FILE to customize the game. Nothing else needs to change.
  ================================================================
*/

const CONFIG = {
  // Page title shown above the grid.
  title: "CONNECTIONS: ANNIVERSARY EDITION",

  // Small line under the title.
  subtitle: "Sixteen things. Four connections. One year of us.",

  // ------------------------------------------------------------
  // GATE: photo verification — six photos of us, player picks the
  // oldest one together to prove they're Ben. Photos live in
  // /us/photos/. `correctPhoto` must match one of `photos[].file`.
  // ------------------------------------------------------------
  gate: {
    prompt: "PLEASE VERIFY YOU ARE BEN.",
    subPrompt: "Select our oldest photo together.",
    photos: [
      { file: "photos/ben-1.jpg", alt: "Photo together 1" },
      { file: "photos/ben-2.jpg", alt: "Photo together 2" },
      { file: "photos/ben-3.jpg", alt: "Photo together 3" },
      { file: "photos/ben-4.jpg", alt: "Photo together 4" },
      { file: "photos/ben-5.jpg", alt: "Photo together 5" },
      { file: "photos/ben-6.jpg", alt: "Photo together 6" },
    ],
    correctPhoto: "photos/ben-6.jpg",
    wrongMessage: "Hmm, not quite. Try again.",
    correctHeading: "Identity verified.",
    correctSubtext: "Hi, Ben! 👋❤️",
  },

  // ------------------------------------------------------------
  // CATEGORIES: exactly 4 groups, each with exactly 4 words/phrases.
  // difficulty controls color + solve order: yellow < green < blue < purple
  // (yellow = easiest, purple = hardest)
  // ------------------------------------------------------------
  categories: [
    {
      difficulty: "yellow",
      name: "Things We're Always Trying to Convince the Other Are Good",
      words: ["Salmon", "TikTok Shop Protein Cheese", "Unnatural Peanut Butter", "Diet Coke"],
    },
    {
      difficulty: "green",
      name: "Things We Like to Watch Together",
      words: ["Hive Mind", "The Rapture", "Linguists", "Vampires"],
    },
    {
      difficulty: "blue",
      name: "Future Plans",
      words: ["A Billion Dollar Idea", "Costa Rica", "Amalfi Coast", "Crystal City"],
    },
    {
      difficulty: "purple",
      name: "My Favorite Place",
      words: ["Is", "Anywhere", "With", "You"],
    },
  ],

  // Shown in the win overlay once all 4 groups are solved.
  winMessage: {
    heading: "You did it! 💛",
    body: "I love you! Happy anniversary <3",
  },
};
