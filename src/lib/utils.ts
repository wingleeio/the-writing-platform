import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return function (): number {
    // Constants for the LCG (these values are commonly used)
    const a = 1664525; // Multiplier
    const c = 1013904223; // Increment
    const m = 2 ** 32; // Modulus (2^32)
    state = (a * state + c) % m;
    return state / m; // Normalize to [0, 1)
  };
}

export function generateUsername(seed: string): string {
  let numericSeed = 0;
  for (let i = 0; i < seed.length; i++) {
    numericSeed += seed.charCodeAt(i) * (i + 1);
  }
  const rng = seededRandom(numericSeed);

  // Define some word lists for username generation
  const adjectives = [
    "Agile",
    "Brave",
    "Calm",
    "Clever",
    "Daring",
    "Elegant",
    "Fierce",
    "Gentle",
    "Happy",
    "Jolly",
    "Kind",
    "Lively",
    "Mighty",
    "Noble",
    "Quick",
    "Quiet",
    "Rapid",
    "Shy",
    "Smart",
    "Strong",
    "Swift",
    "Witty",
    "Bold",
    "Bright",
    "Cheerful",
    "Cool",
    "Dashing",
    "Dynamic",
    "Energetic",
    "Fearless",
    "Friendly",
    "Generous",
    "Graceful",
    "Humble",
    "Joyful",
    "Lucky",
    "Playful",
    "Powerful",
    "Radiant",
    "Reliable",
    "Resilient",
    "Sharp",
    "Sincere",
    "Skillful",
    "Spirited",
    "Steady",
    "Thoughtful",
    "Vibrant",
    "Wise",
    "Zesty",
    "Adventurous",
    "Ambitious",
    "Artistic",
    "Athletic",
    "Blissful",
    "Bubbly",
    "Caring",
    "Charismatic",
    "Charming",
    "Confident",
    "Creative",
    "Determined",
    "Devoted",
    "Eager",
    "Enthusiastic",
    "Excited",
    "Fabulous",
    "Fantastic",
    "Flawless",
    "Focused",
    "Forgiving",
    "Glorious",
    "Gracious",
    "Heroic",
    "Honest",
    "Hopeful",
    "Humorous",
    "Imaginative",
    "Independent",
    "Inspiring",
    "Intelligent",
    "Inventive",
    "Jovial",
    "Kindhearted",
    "Knowledgeable",
    "Loyal",
    "Magnificent",
    "Optimistic",
    "Passionate",
    "Peaceful",
    "Persistent",
    "Polite",
    "Resilient",
    "Trustworthy",
  ];

  const nouns = [
    "Tiger",
    "Eagle",
    "Fox",
    "Bear",
    "Wolf",
    "Hawk",
    "Lion",
    "Shark",
    "Panda",
    "Otter",
    "Falcon",
    "Dolphin",
    "Rabbit",
    "Turtle",
    "Owl",
    "Cheetah",
    "Leopard",
    "Panther",
    "Cobra",
    "Dragon",
    "Phoenix",
    "Unicorn",
    "Griffin",
    "Pegasus",
    "Whale",
    "Penguin",
    "Kangaroo",
    "Zebra",
    "Giraffe",
    "Elephant",
    "Rhino",
    "Hippo",
    "Crocodile",
    "Alligator",
    "Lizard",
    "Frog",
    "Snake",
    "Spider",
    "Scorpion",
    "Antelope",
    "Buffalo",
    "Camel",
    "Chameleon",
    "Deer",
    "Flamingo",
    "Gazelle",
    "Hedgehog",
    "Koala",
    "Lemur",
    "Lynx",
    "Meerkat",
    "Moose",
    "Narwhal",
    "Octopus",
    "Parrot",
    "Platypus",
    "Porcupine",
    "Raccoon",
    "Salamander",
    "Seahorse",
    "Sloth",
    "Squirrel",
    "Starfish",
    "Stingray",
    "Swan",
    "Tapir",
    "Toucan",
    "Walrus",
    "Wombat",
    "Yak",
    "Beetle",
    "Butterfly",
    "Caterpillar",
    "Centipede",
    "Cricket",
    "Firefly",
    "Grasshopper",
    "Honeybee",
    "Ladybug",
    "Mantis",
    "Moth",
    "Termite",
    "Wasp",
    "Jellyfish",
    "Lobster",
    "Crab",
    "Clam",
    "Oyster",
    "Coral",
    "Anemone",
    "Barnacle",
    "Shrimp",
    "Squid",
    "Snail",
    "Worm",
    "Gecko",
    "Salamander",
  ];

  const adjectiveIndex = Math.floor(rng() * adjectives.length);
  const nounIndex = Math.floor(rng() * nouns.length);
  const number = Math.floor(rng() * 1000);

  return `${adjectives[adjectiveIndex]}${nouns[nounIndex]}${number}`;
}
