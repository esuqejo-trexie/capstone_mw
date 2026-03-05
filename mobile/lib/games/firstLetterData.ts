export type FirstLetterQuestion = {
  word: string; // internal id (matches filename)
  displayWord: string; // shown to learner
  spokenWord?: string; // optional speech-safe text
  correctLetter: string;
  options: string[];
};

export const emergingQuestions: FirstLetterQuestion[] = [
  {
    word: "apple",
    displayWord: "apple",
    correctLetter: "a",
    options: ["a", "o", "c"],
  },
  {
    word: "ball",
    displayWord: "ball",
    correctLetter: "b",
    options: ["d", "b", "p"],
  },
  {
    word: "cat",
    displayWord: "cat",
    correctLetter: "c",
    options: ["c", "k", "t"],
  },
  {
    word: "dog",
    displayWord: "dog",
    correctLetter: "d",
    options: ["b", "d", "g"],
  },
  {
    word: "egg",
    displayWord: "egg",
    correctLetter: "e",
    options: ["a", "e", "i"],
  },
  {
    word: "fish",
    displayWord: "fish",
    correctLetter: "f",
    options: ["f", "v", "s"],
  },
  {
    word: "goat",
    displayWord: "goat",
    correctLetter: "g",
    options: ["g", "j", "c"],
  },
  {
    word: "hat",
    displayWord: "hat",
    correctLetter: "h",
    options: ["n", "h", "m"],
  },
  {
    word: "ice",
    displayWord: "ice",
    correctLetter: "i",
    options: ["i", "e", "a"],
  },
  {
    word: "jam",
    displayWord: "jam",
    correctLetter: "j",
    options: ["j", "g", "i"],
  },
  {
    word: "kite",
    displayWord: "kite",
    correctLetter: "k",
    options: ["k", "c", "t"],
  },
  {
    word: "leaf",
    displayWord: "leaf",
    correctLetter: "l",
    options: ["l", "r", "i"],
  },
  {
    word: "mat",
    displayWord: "mat",
    correctLetter: "m",
    options: ["n", "m", "w"],
  },
  {
    word: "nest",
    displayWord: "nest",
    correctLetter: "n",
    options: ["h", "n", "m"],
  },
  {
    word: "owl",
    displayWord: "owl",
    correctLetter: "o",
    options: ["o", "a", "e"],
  },
  {
    word: "pig",
    displayWord: "pig",
    correctLetter: "p",
    options: ["b", "p", "d"],
  },
  {
    word: "queen",
    displayWord: "queen",
    correctLetter: "q",
    options: ["q", "p", "g"],
  },
  {
    word: "rat",
    displayWord: "rat",
    correctLetter: "r",
    options: ["r", "l", "n"],
  },
  {
    word: "sun",
    displayWord: "sun",
    correctLetter: "s",
    options: ["s", "c", "z"],
  },
  {
    word: "top",
    displayWord: "top",
    correctLetter: "t",
    options: ["t", "p", "b"],
  },
  {
    word: "unicorn",
    displayWord: "unicorn",
    correctLetter: "u",
    options: ["u", "o", "y"],
  },
  {
    word: "van",
    displayWord: "van",
    correctLetter: "v",
    options: ["v", "f", "b"],
  },
  {
    word: "wig",
    displayWord: "wig",
    correctLetter: "w",
    options: ["w", "v", "m"],
  },

  {
    word: "xray",
    displayWord: "x-ray",
    spokenWord: "x ray",
    correctLetter: "x",
    options: ["x", "s", "z"],
  },

  {
    word: "yoyo",
    displayWord: "yo-yo",
    spokenWord: "yo yo",
    correctLetter: "y",
    options: ["y", "j", "u"],
  },

  {
    word: "zebra",
    displayWord: "zebra",
    correctLetter: "z",
    options: ["z", "s", "x"],
  },
];
