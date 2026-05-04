export type MCQOption = {
  text: string;
  score: 0 | 1 | 2;
  feedback: string;
};

export type DevelopingPage = {
  id: string;
  text: string;
  image: any;

  literalQuestion: string;
  literalOptions: MCQOption[];

  inferentialQuestion?: string;
  inferentialOptions?: MCQOption[];
};

export const developingContent: DevelopingPage[] = [
  {
    id: "dev_1",
    text: "Mom cooks meal.",
    image: require("../../assets/stories/developing/dev01.webp"),

    literalQuestion: "What is Mom doing?",
    literalOptions: [
      {
        text: "Mom is sleeping.",
        score: 0,
        feedback:
          "This is incorrect. The sentence does not say Mom is sleeping.",
      },
      {
        text: "Mom is in the kitchen.",
        score: 1,
        feedback: "This is close, but it does not tell what Mom is doing.",
      },
      {
        text: "Mom is cooking a meal.",
        score: 2,
        feedback: "Correct! It tells exactly what Mom is doing.",
      },
    ],

    inferentialQuestion: "Why do you think Mom is cooking a meal?",
    inferentialOptions: [
      {
        text: "Because Mom wants to sleep.",
        score: 0,
        feedback:
          "This is incorrect. Sleeping is not related to cooking a meal.",
      },
      {
        text: "Because Mom is hungry.",
        score: 1,
        feedback:
          "This is close, but it only talks about Mom being hungry and does not explain the full purpose of cooking for others.",
      },
      {
        text: "Because the family needs food to eat.",
        score: 2,
        feedback:
          "Correct! Cooking a meal is done to provide food for the family.",
      },
    ],
  },

  {
    id: "dev_2",
    text: "Birds build nests.",
    image: require("../../assets/stories/developing/dev02.webp"),
    literalQuestion: "What do birds build?",
    literalOptions: [
      {
        text: "Birds build a pool.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention a pool.",
      },
      {
        text: "Birds build a home.",
        score: 1,
        feedback: 'This is close, but it does not use the word "nests."',
      },
      {
        text: "Birds build nests.",
        score: 2,
        feedback: "Correct! It uses the exact word from the sentence.",
      },
    ],

    inferentialQuestion: "Why do you think birds build nests?",
    inferentialOptions: [
      {
        text: "Because birds like to sing.",
        score: 0,
        feedback:
          "This is incorrect. Singing is not related to building nests.",
      },
      {
        text: "Because birds need somewhere to sleep.",
        score: 1,
        feedback:
          "This is close, but it only explains one use of a nest and does not include safety and caring for their young.",
      },
      {
        text: "Because birds need a home to be safe and raise their babies.",
        score: 2,
        feedback:
          "Correct! Nests keep birds safe and help them care for their babies.",
      },
    ],
  },

  {
    id: "dev_3",
    text: "Alex kicks the ball.",
    image: require("../../assets/stories/developing/dev03.webp"),
    literalQuestion: "What does Alex do to the ball?",
    literalOptions: [
      {
        text: "Alex holds the ball.",
        score: 0,
        feedback:
          "This is incorrect. The sentence does not say Alex holds the ball.",
      },
      {
        text: "Alex plays with the ball.",
        score: 1,
        feedback: "This is close, but it does not tell the exact action.",
      },
      {
        text: "Alex kicks the ball.",
        score: 2,
        feedback: "Correct! It tells exactly what Alex does.",
      },
    ],

    inferentialQuestion: "What do you think Alex is doing?",
    inferentialOptions: [
      {
        text: "Alex is doing homework.",
        score: 0,
        feedback:
          "This is incorrect. Doing homework is not related to kicking a ball.",
      },
      {
        text: "Alex is moving around.",
        score: 1,
        feedback:
          "This is close, but it is too general and does not show that Alex is playing.",
      },
      {
        text: "Alex is playing a game or sport.",
        score: 2,
        feedback:
          "Correct! Kicking a ball usually means playing a game or sport.",
      },
    ],
  },

  {
    id: "dev_4",
    text: "The dog has a collar.",
    image: require("../../assets/stories/developing/dev04.webp"),
    literalQuestion: "What does the dog have?",
    literalOptions: [
      {
        text: "The dog has a bone.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention a bone.",
      },
      {
        text: "The dog has something around its neck.",
        score: 1,
        feedback: "This is close, but it does not name the collar.",
      },
      {
        text: "The dog has a collar.",
        score: 2,
        feedback: "Correct! It uses the exact word from the sentence.",
      },
    ],

    inferentialQuestion: "What can you say about the dog?",
    inferentialOptions: [
      {
        text: "The dog is lost.",
        score: 0,
        feedback:
          "This is incorrect. A collar usually shows the dog belongs to someone.",
      },
      {
        text: "The dog lives with people.",
        score: 1,
        feedback:
          "This is close, but it does not clearly explain that the dog has an owner who takes care of it.",
      },
      {
        text: "The dog has an owner who takes care of it.",
        score: 2,
        feedback: "Correct! A collar shows that the dog has an owner.",
      },
    ],
  },

  {
    id: "dev_5",
    text: "The rug is so dusty.",
    image: require("../../assets/stories/developing/dev05.webp"),
    literalQuestion: "How is the rug?",
    literalOptions: [
      {
        text: "The rug is very soft.",
        score: 0,
        feedback:
          "This is incorrect. The sentence does not describe the rug as soft.",
      },
      {
        text: "The rug is dirty.",
        score: 1,
        feedback: 'This is close, but it does not use the word "dusty."',
      },
      {
        text: "The rug is very dusty.",
        score: 2,
        feedback: "Correct! It tells exactly how the rug is.",
      },
    ],

    inferentialQuestion: "What can you say about the rug?",
    inferentialOptions: [
      {
        text: "The rug is brand new.",
        score: 0,
        feedback: "This is incorrect. A dusty rug is not new.",
      },
      {
        text: "The rug is old.",
        score: 1,
        feedback:
          "This is close, but being old does not fully explain why the rug is dusty.",
      },
      {
        text: "The rug has not been cleaned for a long time.",
        score: 2,
        feedback: "Correct! Dust shows the rug has not been cleaned.",
      },
    ],
  },

  {
    id: "dev_6",
    text: "The cat jumps on the mat.",
    image: require("../../assets/stories/developing/dev06.webp"),
    literalQuestion: "Where does the cat jump?",
    literalOptions: [
      {
        text: "The cat jumps on the bed.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention a bed.",
      },
      {
        text: "The cat jumps on the floor.",
        score: 1,
        feedback: 'This is close, but it does not use the word "mat."',
      },
      {
        text: "The cat jumps on the mat.",
        score: 2,
        feedback: "Correct! It uses the exact place from the sentence.",
      },
    ],

    inferentialQuestion: "Why do you think the cat jumps on the mat?",
    inferentialOptions: [
      {
        text: "Because the cat is hungry.",
        score: 0,
        feedback:
          "This is incorrect. Being hungry is not related to jumping on a mat.",
      },
      {
        text: "Because the cat wants to play.",
        score: 1,
        feedback:
          "This is close, but it only suggests playing and does not explain that the mat is a comfortable place to rest.",
      },
      {
        text: "Because the cat wants a soft and comfortable place to rest.",
        score: 2,
        feedback:
          "Correct! Cats often jump on mats because they are soft and comfortable for resting.",
      },
    ],
  },

  {
    id: "dev_7",
    text: "Dad sips water from a mug.",
    image: require("../../assets/stories/developing/dev07.webp"),
    literalQuestion: "What does Dad drink from?",
    literalOptions: [
      {
        text: "Dad drinks from a bottle.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention a bottle.",
      },
      {
        text: "Dad drinks from a cup.",
        score: 1,
        feedback: 'This is close, but it does not use the word "mug."',
      },
      {
        text: "Dad drinks from a mug.",
        score: 2,
        feedback: "Correct! It uses the exact word from the sentence.",
      },
    ],

    inferentialQuestion: "Why do you think Dad is drinking water?",
    inferentialOptions: [
      {
        text: "Because Dad does not like juice.",
        score: 0,
        feedback: "This is incorrect. The sentence does not talk about juice.",
      },
      {
        text: "Because Dad is eating a meal.",
        score: 1,
        feedback:
          "This is close, but it adds information not found in the sentence and does not give the main reason for drinking.",
      },
      {
        text: "Because Dad is thirsty and needs to drink.",
        score: 2,
        feedback: "Correct! Drinking water usually means a person is thirsty.",
      },
    ],
  },

  {
    id: "dev_8",
    text: "Ted gets a big net.",
    image: require("../../assets/stories/developing/dev08.webp"),
    literalQuestion: "What does Ted get?",
    literalOptions: [
      {
        text: "Ted gets a big ball.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention a ball.",
      },
      {
        text: "Ted gets a net.",
        score: 1,
        feedback: 'This is close, but it is missing the word "big."',
      },
      {
        text: "Ted gets a big net.",
        score: 2,
        feedback: "Correct! It tells the complete answer from the sentence.",
      },
    ],

    inferentialQuestion: "What do you think Ted will do with the big net?",
    inferentialOptions: [
      {
        text: "Ted will use it as a blanket.",
        score: 0,
        feedback: "This is incorrect. A net is not used as a blanket.",
      },
      {
        text: "Ted will carry it to a river.",
        score: 1,
        feedback:
          "This is close, but it only describes where the net might be used and not its purpose.",
      },
      {
        text: "Ted will use it to catch something like fish or butterflies.",
        score: 2,
        feedback: "Correct! A net is used to catch things.",
      },
    ],
  },

  {
    id: "dev_9",
    text: "Crabs have hard shells.",
    image: require("../../assets/stories/developing/dev09.webp"),
    literalQuestion: "What kind of shells do crabs have?",
    literalOptions: [
      {
        text: "Crabs have smooth shells.",
        score: 0,
        feedback: "This is incorrect. The sentence does not say smooth.",
      },
      {
        text: "Crabs have strong shells.",
        score: 1,
        feedback: 'This is close, but it does not use the word "hard."',
      },
      {
        text: "Crabs have hard shells.",
        score: 2,
        feedback: "Correct! It uses the exact word from the sentence.",
      },
    ],

    inferentialQuestion: "Why do you think crabs have hard shells?",
    inferentialOptions: [
      {
        text: "So crabs can look pretty.",
        score: 0,
        feedback: "This is incorrect. The shell is not for appearance.",
      },
      {
        text: "So crabs can be strong.",
        score: 1,
        feedback:
          "This is close, but it is too general and does not explain the real purpose of the shell.",
      },
      {
        text: "So crabs are protected from enemies.",
        score: 2,
        feedback: "Correct! The hard shell protects crabs from danger.",
      },
    ],
  },

  {
    id: "dev_10",
    text: "I wash and iron my dress.",
    image: require("../../assets/stories/developing/dev10.webp"),
    literalQuestion: "What does the speaker do to the dress?",
    literalOptions: [
      {
        text: "The speaker buys a dress.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention buying.",
      },
      {
        text: "The speaker washes the dress.",
        score: 1,
        feedback: 'This is close, but it is missing "iron."',
      },
      {
        text: "The speaker washes and irons the dress.",
        score: 2,
        feedback: "Correct! It tells both actions from the sentence.",
      },
    ],

    inferentialQuestion:
      "Why do you think the speaker washes and irons the dress?",
    inferentialOptions: [
      {
        text: "Because the dress is too small.",
        score: 0,
        feedback:
          "This is incorrect. Size is not related to washing and ironing.",
      },
      {
        text: "Because the dress is dirty.",
        score: 1,
        feedback:
          "This is close, but it only explains washing and does not include ironing to make the dress neat.",
      },
      {
        text: "Because the speaker wants the dress to be clean and neat to wear.",
        score: 2,
        feedback:
          "Correct! Washing cleans the dress and ironing makes it neat.",
      },
    ],
  },

  {
    id: "dev_11",
    text: "It is a gray bunny.",
    image: require("../../assets/stories/developing/dev11.webp"),
    literalQuestion: "What color is the bunny?",
    literalOptions: [
      {
        text: "The bunny is white.",
        score: 0,
        feedback: "This is incorrect. The sentence does not say white.",
      },
      {
        text: "The bunny is a dark color.",
        score: 1,
        feedback: 'This is close, but it does not say "gray."',
      },
      {
        text: "The bunny is gray.",
        score: 2,
        feedback: "Correct! It uses the exact color from the sentence.",
      },
    ],

    inferentialQuestion: "How does the gray color help the bunny?",
    inferentialOptions: [
      {
        text: "It helps the bunny run faster.",
        score: 0,
        feedback:
          "This is incorrect. Color does not help the bunny run faster.",
      },
      {
        text: "It makes the bunny look nice.",
        score: 1,
        feedback:
          "This is close, but it only talks about appearance and does not explain how the color helps the bunny survive.",
      },
      {
        text: "It helps the bunny hide from enemies by blending into its surroundings.",
        score: 2,
        feedback:
          "Correct! The gray color helps the bunny blend in and stay safe.",
      },
    ],
  },

  {
    id: "dev_12",
    text: "The crow picked some stones.",
    image: require("../../assets/stories/developing/dev12.webp"),
    literalQuestion: "What did the crow pick?",
    literalOptions: [
      {
        text: "The crow picked some seeds.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention seeds.",
      },
      {
        text: "The crow picked some things.",
        score: 1,
        feedback: 'This is close, but it does not name "stones."',
      },
      {
        text: "The crow picked some stones.",
        score: 2,
        feedback: "Correct! It uses the exact words from the sentence.",
      },
    ],

    inferentialQuestion: "Why do you think the crow picked up stones?",
    inferentialOptions: [
      {
        text: "Because the crow wanted to eat the stones.",
        score: 0,
        feedback: "This is incorrect. Stones are not food.",
      },
      {
        text: "Because the crow was curious about the stones.",
        score: 1,
        feedback:
          "This is close, but it is too general and does not explain the purpose of picking up the stones.",
      },
      {
        text: "Because the crow needed the stones to help get something it could not reach.",
        score: 2,
        feedback: "Correct! The crow is using the stones as a tool.",
      },
    ],
  },

  {
    id: "dev_13",
    text: "The boy planted a carrot seed.",
    image: require("../../assets/stories/developing/dev13.webp"),
    literalQuestion: "What did the boy plant?",
    literalOptions: [
      {
        text: "The boy planted a flower.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention a flower.",
      },
      {
        text: "The boy planted a seed.",
        score: 1,
        feedback: 'This is close, but it is missing "carrot."',
      },
      {
        text: "The boy planted a carrot seed.",
        score: 2,
        feedback: "Correct! It tells the complete answer.",
      },
    ],

    inferentialQuestion: "What do you think the boy wants to happen?",
    inferentialOptions: [
      {
        text: "The boy wants the seed to disappear.",
        score: 0,
        feedback:
          "This is incorrect. Planting a seed means wanting it to grow.",
      },
      {
        text: "The boy wants to water the garden.",
        score: 1,
        feedback:
          "This is close, but it describes a step and not the main goal.",
      },
      {
        text: "The boy wants the seed to grow into a carrot.",
        score: 2,
        feedback: "Correct! The goal of planting a seed is for it to grow.",
      },
    ],
  },

  {
    id: "dev_14",
    text: "The ant carried a grain of corn.",
    image: require("../../assets/stories/developing/dev14.webp"),
    literalQuestion: "What did the ant carry?",
    literalOptions: [
      {
        text: "The ant carried a leaf.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention a leaf.",
      },
      {
        text: "The ant carried some food.",
        score: 1,
        feedback: 'This is close, but it does not name "grain of corn."',
      },
      {
        text: "The ant carried a grain of corn.",
        score: 2,
        feedback: "Correct! It uses the exact words from the sentence.",
      },
    ],

    inferentialQuestion: "Why do you think the ant carried the grain of corn?",
    inferentialOptions: [
      {
        text: "Because the ant wanted to play with it.",
        score: 0,
        feedback: "This is incorrect. Carrying food is not for playing.",
      },
      {
        text: "Because the ant was hungry.",
        score: 1,
        feedback:
          "This is close, but it only talks about the ant itself and does not explain bringing food for others.",
      },
      {
        text: "Because the ant was bringing food back to feed its colony.",
        score: 2,
        feedback: "Correct! Ants carry food to share with their colony.",
      },
    ],
  },

  {
    id: "dev_15",
    text: "The man is crossing the road.",
    image: require("../../assets/stories/developing/dev15.webp"),
    literalQuestion: "What is the man doing?",
    literalOptions: [
      {
        text: "The man is running in the park.",
        score: 0,
        feedback:
          "This is incorrect. The sentence does not mention running or a park.",
      },
      {
        text: "The man is walking.",
        score: 1,
        feedback: 'This is close, but it does not say "crossing the road."',
      },
      {
        text: "The man is crossing the road.",
        score: 2,
        feedback: "Correct! It tells exactly what the man is doing.",
      },
    ],

    inferentialQuestion: "What should the man do to stay safe?",
    inferentialOptions: [
      {
        text: "The man should run very fast.",
        score: 0,
        feedback:
          "This is incorrect. Running fast is not the safest way to cross the road.",
      },
      {
        text: "The man should watch out for cars.",
        score: 1,
        feedback:
          "This is close, but it is only one part of staying safe and does not include checking both directions.",
      },
      {
        text: "The man should look both ways and cross carefully.",
        score: 2,
        feedback:
          "Correct! Looking both ways and crossing carefully keeps him safe.",
      },
    ],
  },

  {
    id: "dev_16",
    text: "Sid and Ana are watching TV.",
    image: require("../../assets/stories/developing/dev16.webp"),
    literalQuestion: "Who is watching TV?",
    literalOptions: [
      {
        text: "Mom and Dad are watching TV.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention them.",
      },
      {
        text: "Sid is watching TV.",
        score: 1,
        feedback: "This is close, but Ana is missing.",
      },
      {
        text: "Sid and Ana are watching TV.",
        score: 2,
        feedback: "Correct! It names both people.",
      },
    ],

    inferentialQuestion: "What do you think Sid and Ana are doing together?",
    inferentialOptions: [
      {
        text: "Sid and Ana are fighting.",
        score: 0,
        feedback:
          "This is incorrect. The sentence does not suggest they are fighting.",
      },
      {
        text: "Sid and Ana are in the same room.",
        score: 1,
        feedback:
          "This is close, but it only tells where they are and not what they are doing together.",
      },
      {
        text: "Sid and Ana are spending time together and enjoying each other's company.",
        score: 2,
        feedback:
          "Correct! Watching TV together means they are sharing time and enjoying being together.",
      },
    ],
  },

  {
    id: "dev_17",
    text: "I hug my mom with love.",
    image: require("../../assets/stories/developing/dev17.webp"),
    literalQuestion: "How does the speaker hug the mom?",
    literalOptions: [
      {
        text: "The speaker hugs the mom quickly.",
        score: 0,
        feedback: "This is incorrect. The sentence does not say quickly.",
      },
      {
        text: "The speaker hugs the mom tightly.",
        score: 1,
        feedback: 'This is close, but it does not say "with love."',
      },
      {
        text: "The speaker hugs the mom with love.",
        score: 2,
        feedback: "Correct! It uses the exact phrase from the sentence.",
      },
    ],

    inferentialQuestion:
      "What does the hug tell us about how the speaker feels?",
    inferentialOptions: [
      {
        text: "The speaker feels angry.",
        score: 0,
        feedback: "This is incorrect. A hug with love does not show anger.",
      },
      {
        text: "The speaker feels happy.",
        score: 1,
        feedback:
          "This is close, but it only shows a general feeling and does not fully explain the love in the hug.",
      },
      {
        text: "The speaker loves and cares deeply for the mom.",
        score: 2,
        feedback: "Correct! A hug with love shows strong care and affection.",
      },
    ],
  },

  {
    id: "dev_18",
    text: "The animals felt hot.",
    image: require("../../assets/stories/developing/dev18.webp"),
    literalQuestion: "How did the animals feel?",
    literalOptions: [
      {
        text: "The animals felt cold.",
        score: 0,
        feedback: "This is incorrect. The sentence says the opposite.",
      },
      {
        text: "The animals felt tired.",
        score: 1,
        feedback: 'This is close, but it does not say "hot."',
      },
      {
        text: "The animals felt hot.",
        score: 2,
        feedback: "Correct! It tells exactly how they felt.",
      },
    ],

    inferentialQuestion: "Why do you think the animals felt hot?",
    inferentialOptions: [
      {
        text: "Because the animals were sleeping.",
        score: 0,
        feedback: "This is incorrect. Sleeping is not related to feeling hot.",
      },
      {
        text: "Because the animals were playing under the sun.",
        score: 1,
        feedback:
          "This is close, but it adds information not found in the sentence and does not give the main reason.",
      },
      {
        text: "Because the weather outside was very warm.",
        score: 2,
        feedback: "Correct! Warm weather can make animals feel hot.",
      },
    ],
  },

  {
    id: "dev_19",
    text: "She loves to read in the library.",
    image: require("../../assets/stories/developing/dev19.webp"),
    literalQuestion: "Where does she love to read?",
    literalOptions: [
      {
        text: "She loves to read at home.",
        score: 0,
        feedback: "This is incorrect. The sentence does not mention home.",
      },
      {
        text: "She loves to read in a quiet place.",
        score: 1,
        feedback: 'This is close, but it does not say "library."',
      },
      {
        text: "She loves to read in the library.",
        score: 2,
        feedback: "Correct! It uses the exact place.",
      },
    ],

    inferentialQuestion: "What kind of person do you think she is?",
    inferentialOptions: [
      {
        text: "She is a very loud and noisy person.",
        score: 0,
        feedback:
          "This is incorrect. A library is a quiet place, so this does not match.",
      },
      {
        text: "She is a quiet person.",
        score: 1,
        feedback:
          "This is close, but it only describes one trait and does not show her love for reading and learning.",
      },
      {
        text: "She is someone who loves learning and enjoys quiet places.",
        score: 2,
        feedback:
          "Correct! Reading in a library shows she enjoys learning and quiet spaces.",
      },
    ],
  },

  {
    id: "dev_20",
    text: "I read books to learn many things.",
    image: require("../../assets/stories/developing/dev20.webp"),
    literalQuestion: "Why does the speaker read books?",
    literalOptions: [
      {
        text: "The speaker reads books because it is fun.",
        score: 0,
        feedback: "This is incorrect. The sentence does not say this.",
      },
      {
        text: "The speaker reads books to get smart.",
        score: 1,
        feedback: "This is close, but it does not use the exact words.",
      },
      {
        text: "The speaker reads books to learn many things.",
        score: 2,
        feedback: "Correct! It tells the exact reason.",
      },
    ],

    inferentialQuestion: "What does this tell us about the speaker?",
    inferentialOptions: [
      {
        text: "The speaker does not like going to school.",
        score: 0,
        feedback:
          "This is incorrect. Reading to learn shows interest in learning, not dislike.",
      },
      {
        text: "The speaker is a good student.",
        score: 1,
        feedback:
          "This is close, but it assumes school performance and does not directly explain the speaker’s desire to learn.",
      },
      {
        text: "The speaker is curious and wants to keep on learning.",
        score: 2,
        feedback:
          "Correct! Reading to learn shows curiosity and a love for learning.",
      },
    ],
  },
];
