import { db } from "../server/db";
import { labyrinthPuzzles, labyrinthAchievements } from "../shared/schema";

/**
 * Seed initial puzzles and achievements for the Mystic Code Labyrinth
 */
async function seedLabyrinth() {
  console.log("🌀 Seeding Mystic Code Labyrinth...");

  // Initial puzzles - progressively harder
  const puzzles = [
    {
      title: "The First Echo",
      description: "Write a function that returns the sum of two numbers. The labyrinth tests your foundations.",
      difficulty: 1,
      puzzleType: "algorithm",
      starterCode: `function add(a, b) {
  // Complete this function
  return 0;
}`,
      solution: `function add(a, b) {
  return a + b;
}`,
      testCases: [
        { input: [2, 3], expected: 5 },
        { input: [10, -5], expected: 5 },
        { input: [0, 0], expected: 0 },
      ],
      hints: [
        "The path to truth is simple. Two become one through addition.",
        "In JavaScript, the + operator reveals the answer.",
      ],
      mysticalLore: "The labyrinth whispers: 'Begin with simplicity, for complexity is built upon it.'",
      requiredLevel: 1,
      experienceReward: 50,
      isActive: true,
    },
    {
      title: "Shadow Reversal",
      description: "Create a function that reverses a string. The mirror shows what lies beneath.",
      difficulty: 2,
      puzzleType: "algorithm",
      starterCode: `function reverseString(str) {
  // Reverse the string
  return "";
}`,
      solution: `function reverseString(str) {
  return str.split('').reverse().join('');
}`,
      testCases: [
        { input: ["hello"], expected: "olleh" },
        { input: ["world"], expected: "dlrow" },
        { input: [""], expected: "" },
      ],
      hints: [
        "Arrays know secrets strings do not. Transform to learn.",
        "Three ancient methods unite: split, reverse, join.",
      ],
      mysticalLore: "To understand forward, one must see backward. The void reveals all inversions.",
      requiredLevel: 1,
      experienceReward: 75,
      isActive: true,
    },
    {
      title: "The Fibonacci Spiral",
      description: "Generate the Fibonacci sequence up to n terms. The spiral of infinity awaits.",
      difficulty: 4,
      puzzleType: "algorithm",
      starterCode: `function fibonacci(n) {
  // Generate fibonacci sequence
  return [];
}`,
      solution: `function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const fib = [0, 1];
  for (let i = 2; i < n; i++) {
    fib.push(fib[i-1] + fib[i-2]);
  }
  return fib;
}`,
      testCases: [
        { input: [5], expected: [0, 1, 1, 2, 3] },
        { input: [1], expected: [0] },
        { input: [0], expected: [] },
      ],
      hints: [
        "Each number is born from the union of its parents.",
        "Begin with zero and one. Let them dance together.",
        "Iteration reveals the pattern; recursion reveals the truth.",
      ],
      mysticalLore: "Nature speaks in spirals. The golden ratio guards ancient wisdom.",
      requiredLevel: 2,
      experienceReward: 150,
      isActive: true,
    },
    {
      title: "Array Sanctuary",
      description: "Find the maximum number in an array. Navigate the peaks and valleys of data.",
      difficulty: 2,
      puzzleType: "algorithm",
      starterCode: `function findMax(arr) {
  // Find the maximum value
  return 0;
}`,
      solution: `function findMax(arr) {
  return Math.max(...arr);
}`,
      testCases: [
        { input: [[1, 5, 3, 9, 2]], expected: 9 },
        { input: [[-5, -1, -10]], expected: -1 },
        { input: [[42]], expected: 42 },
      ],
      hints: [
        "The spread operator (...) unveils hidden power.",
        "Math holds ancient wisdom for comparison.",
      ],
      mysticalLore: "Among many, one rises. The peak calls to those who seek it.",
      requiredLevel: 1,
      experienceReward: 75,
      isActive: true,
    },
    {
      title: "The Palindrome Gate",
      description: "Determine if a string is a palindrome. The gate only opens to perfect symmetry.",
      difficulty: 3,
      puzzleType: "algorithm",
      starterCode: `function isPalindrome(str) {
  // Check if palindrome
  return false;
}`,
      solution: `function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
      testCases: [
        { input: ["racecar"], expected: true },
        { input: ["hello"], expected: false },
        { input: ["A man a plan a canal Panama"], expected: true },
      ],
      hints: [
        "Remove the noise; see only the essence.",
        "What reads the same forward and backward holds power.",
        "Lowercase all, remove spaces and punctuation.",
      ],
      mysticalLore: "Perfect symmetry opens sealed doors. The mirror never lies.",
      requiredLevel: 2,
      experienceReward: 120,
      isActive: true,
    },
    {
      title: "Prime Divination",
      description: "Check if a number is prime. The primes hold the keys to universal patterns.",
      difficulty: 5,
      puzzleType: "algorithm",
      starterCode: `function isPrime(n) {
  // Check if n is prime
  return false;
}`,
      solution: `function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}`,
      testCases: [
        { input: [7], expected: true },
        { input: [12], expected: false },
        { input: [2], expected: true },
        { input: [1], expected: false },
      ],
      hints: [
        "Numbers less than 2 are not prime.",
        "Check divisibility wisely; not all numbers need testing.",
        "Square root reveals the boundary of certainty.",
      ],
      mysticalLore: "Primes are the atoms of mathematics. Indivisible. Sacred. Eternal.",
      requiredLevel: 3,
      experienceReward: 200,
      isActive: true,
    },
    {
      title: "Binary Transmutation",
      description: "Convert a decimal number to binary. Translate between realms of representation.",
      difficulty: 4,
      puzzleType: "algorithm",
      starterCode: `function toBinary(n) {
  // Convert to binary string
  return "";
}`,
      solution: `function toBinary(n) {
  return n.toString(2);
}`,
      testCases: [
        { input: [10], expected: "1010" },
        { input: [255], expected: "11111111" },
        { input: [0], expected: "0" },
      ],
      hints: [
        "JavaScript knows the ancient language of bases.",
        "toString() holds more power than you imagine.",
      ],
      mysticalLore: "All complexity reduces to ones and zeros. The machine speaks in binary dreams.",
      requiredLevel: 2,
      experienceReward: 130,
      isActive: true,
    },
    {
      title: "The Sorting Ritual",
      description: "Implement bubble sort. Order emerges from chaos through patient iteration.",
      difficulty: 6,
      puzzleType: "algorithm",
      starterCode: `function bubbleSort(arr) {
  // Sort the array
  return arr;
}`,
      solution: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      testCases: [
        { input: [[64, 34, 25, 12, 22]], expected: [12, 22, 25, 34, 64] },
        { input: [[5, 2, 8, 1]], expected: [1, 2, 5, 8] },
      ],
      hints: [
        "Compare neighbors. Swap if needed.",
        "Nested loops reveal the dance of comparison.",
        "Each pass brings the largest to its rightful place.",
      ],
      mysticalLore: "Like bubbles rising through water, values find their destined positions.",
      requiredLevel: 3,
      experienceReward: 250,
      isActive: true,
    },
  ];

  // Achievements
  const achievements = [
    {
      name: "First Steps",
      description: "Complete your first puzzle",
      icon: "footprints",
      category: "exploration",
      requirement: { type: "puzzles_solved", count: 1 },
      rewardType: "badge",
      rewardData: { badge: "first_steps" },
      isSecret: false,
    },
    {
      name: "Apprentice Coder",
      description: "Solve 5 puzzles",
      icon: "code",
      category: "mastery",
      requirement: { type: "puzzles_solved", count: 5 },
      rewardType: "badge",
      rewardData: { badge: "apprentice" },
      isSecret: false,
    },
    {
      name: "Level Up",
      description: "Reach level 2",
      icon: "arrow-up",
      category: "exploration",
      requirement: { type: "level", level: 2 },
      rewardType: "badge",
      rewardData: { badge: "level_2" },
      isSecret: false,
    },
    {
      name: "Experience Seeker",
      description: "Earn 500 experience points",
      icon: "sparkles",
      category: "mastery",
      requirement: { type: "experience", amount: 500 },
      rewardType: "badge",
      rewardData: { badge: "xp_500" },
      isSecret: false,
    },
    {
      name: "The Void Whispers",
      description: "Discover the hidden path in the labyrinth",
      icon: "eye",
      category: "mystery",
      requirement: { type: "secret", key: "void_whisper" },
      rewardType: "lore",
      rewardData: { loreId: "void_secrets" },
      isSecret: true,
    },
    {
      name: "Speed Demon",
      description: "Complete a puzzle in under 1 minute",
      icon: "zap",
      category: "speed",
      requirement: { type: "time", seconds: 60 },
      rewardType: "badge",
      rewardData: { badge: "speed_demon" },
      isSecret: false,
    },
    {
      name: "Master of Algorithms",
      description: "Solve 10 algorithm puzzles",
      icon: "brain",
      category: "mastery",
      requirement: { type: "puzzles_by_type", puzzleType: "algorithm", count: 10 },
      rewardType: "permission",
      rewardData: { permission: "advanced_puzzles" },
      isSecret: false,
    },
    {
      name: "Eclipse Survivor",
      description: "Complete a puzzle during an eclipse event",
      icon: "moon",
      category: "mystery",
      requirement: { type: "during_eclipse" },
      rewardType: "badge",
      rewardData: { badge: "eclipse_survivor" },
      isSecret: false,
    },
  ];

  // Insert puzzles
  for (const puzzle of puzzles) {
    try {
      await db.insert(labyrinthPuzzles).values(puzzle);
      console.log(`  ✅ Created puzzle: ${puzzle.title}`);
    } catch (error: any) {
      if (error.code === '23505') { // Duplicate key error
        console.log(`  ⏭️  Puzzle already exists: ${puzzle.title}`);
      } else {
        console.error(`  ❌ Error creating puzzle ${puzzle.title}:`, error.message);
      }
    }
  }

  // Insert achievements
  for (const achievement of achievements) {
    try {
      await db.insert(labyrinthAchievements).values(achievement);
      console.log(`  ✅ Created achievement: ${achievement.name}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`  ⏭️  Achievement already exists: ${achievement.name}`);
      } else {
        console.error(`  ❌ Error creating achievement ${achievement.name}:`, error.message);
      }
    }
  }

  console.log("\n🌀 Labyrinth seeding complete!");
}

seedLabyrinth()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error seeding labyrinth:", error);
    process.exit(1);
  });
