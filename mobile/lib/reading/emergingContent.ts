export type MCQOption = {
  text: string;
  score: 0 | 1 | 2;
};

export type ReadingPage = {
  id: string;
  text: string;
  image: any;

  question?: string;
  options?: MCQOption[];
  correctAnswer?: string; // ✅ added (non-breaking)
};

export const emergingContent: ReadingPage[] = [
  {
    id: "em_1",
    text: "big wig",
    image: require("../../assets/stories/emerging/big_wig.webp"),
  },
  {
    id: "em_2",
    text: "fat cat",
    image: require("../../assets/stories/emerging/fat_cat.webp"),
  },
  {
    id: "em_3",
    text: "red hat",
    image: require("../../assets/stories/emerging/red_hat.webp"),
  },
  {
    id: "em_4",
    text: "hot sun",
    image: require("../../assets/stories/emerging/hot_sun.webp"),
  },
  {
    id: "em_5",
    text: "fun man",
    image: require("../../assets/stories/emerging/fun_man.webp"),
  },
  {
    id: "em_6",
    text: "cup lid",
    image: require("../../assets/stories/emerging/cup_lid.webp"),
  },
  {
    id: "em_7",
    text: "hot pan",
    image: require("../../assets/stories/emerging/hot_pan.webp"),
  },
  {
    id: "em_8",
    text: "sad Tim",
    image: require("../../assets/stories/emerging/sad_tim.webp"),
  },
  {
    id: "em_9",
    text: "wet fox",
    image: require("../../assets/stories/emerging/wet_fox.webp"),
  },
  {
    id: "em_10",
    text: "tin can",
    image: require("../../assets/stories/emerging/tin_can.webp"),
  },

  // WITH QUESTIONS

  {
    id: "em_11",
    text: "jug of jam",
    image: require("../../assets/stories/emerging/jug_of_jam.webp"),
    question: "What is in the jug?",
    correctAnswer: "jam",
    options: [
      { text: "toy", score: 0 },
      { text: "water", score: 1 },
      { text: "jam", score: 2 },
    ],
  },
  {
    id: "em_12",
    text: "Sam and Dan",
    image: require("../../assets/stories/emerging/sam_and_dan.webp"),
    question: "Who are in the phrase?",
    correctAnswer: "Sam and Dan",
    options: [
      { text: "cat and dog", score: 0 },
      { text: "Sam and Ben", score: 1 },
      { text: "Sam and Dan", score: 2 },
    ],
  },
  {
    id: "em_13",
    text: "hen and cow",
    image: require("../../assets/stories/emerging/hen_and_cow.webp"),
    question: "What animals are there?",
    correctAnswer: "hen and cow",
    options: [
      { text: "sun and sky", score: 0 },
      { text: "hen and pig", score: 1 },
      { text: "hen and cow", score: 2 },
    ],
  },
  {
    id: "em_14",
    text: "sun in sky",
    image: require("../../assets/stories/emerging/sun_in_sky.webp"),
    question: "Where is the sun?",
    correctAnswer: "in the sky",
    options: [
      { text: "on the bed", score: 0 },
      { text: "in the air", score: 1 },
      { text: "in the sky", score: 2 },
    ],
  },
  {
    id: "em_15",
    text: "pig in pen",
    image: require("../../assets/stories/emerging/pig_in_pen.webp"),
    question: "Where is the pig?",
    correctAnswer: "in the pen",
    options: [
      { text: "on the rug", score: 0 },
      { text: "in the farm", score: 1 },
      { text: "in the pen", score: 2 },
    ],
  },
  {
    id: "em_16",
    text: "pug on bed",
    image: require("../../assets/stories/emerging/pug_on_bed.webp"),
    question: "Where is the pug?",
    correctAnswer: "on the bed",
    options: [
      { text: "in the sky", score: 0 },
      { text: "on the pillow", score: 1 },
      { text: "on the bed", score: 2 },
    ],
  },
  {
    id: "em_17",
    text: "pen in bag",
    image: require("../../assets/stories/emerging/pen_in_bag.webp"),
    question: "Where is the pen?",
    correctAnswer: "in the bag",
    options: [
      { text: "on the sun", score: 0 },
      { text: "in the box", score: 1 },
      { text: "in the bag", score: 2 },
    ],
  },
  {
    id: "em_18",
    text: "cap on cop",
    image: require("../../assets/stories/emerging/cap_on_cop.webp"),
    question: "Who has the cap?",
    correctAnswer: "the cop",
    options: [
      { text: "the pig", score: 0 },
      { text: "the man", score: 1 },
      { text: "the cop", score: 2 },
    ],
  },
  {
    id: "em_19",
    text: "ham on a pan",
    image: require("../../assets/stories/emerging/ham_on_a_pan.webp"),
    question: "Where is the ham?",
    correctAnswer: "on a pan",
    options: [
      { text: "in the sky", score: 0 },
      { text: "on a plate", score: 1 },
      { text: "on a pan", score: 2 },
    ],
  },
  {
    id: "em_20",
    text: "toy on rug",
    image: require("../../assets/stories/emerging/toy_on_rug.webp"),
    question: "Where is the toy?",
    correctAnswer: "on the rug",
    options: [
      { text: "in the bag", score: 0 },
      { text: "on the floor", score: 1 },
      { text: "on the rug", score: 2 },
    ],
  },
];
