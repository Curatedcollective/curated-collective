export const MAJOR_ARCANA = [
  { id: "fool", label: "the fool", number: "0", emoji: "🃏", symbol: "∞" },
  { id: "magician", label: "the magician", number: "I", emoji: "🎩", symbol: "I" },
  { id: "priestess", label: "the high priestess", number: "II", emoji: "👁️", symbol: "II" },
  { id: "empress", label: "the empress", number: "III", emoji: "👑", symbol: "III" },
  { id: "emperor", label: "the emperor", number: "IV", emoji: "♔", symbol: "IV" },
  { id: "hierophant", label: "the hierophant", number: "V", emoji: "✝️", symbol: "V" },
  { id: "lovers", label: "the lovers", number: "VI", emoji: "💕", symbol: "VI" },
  { id: "chariot", label: "the chariot", number: "VII", emoji: "🐴", symbol: "VII" },
  { id: "strength", label: "strength", number: "VIII", emoji: "💪", symbol: "VIII" },
  { id: "hermit", label: "the hermit", number: "IX", emoji: "🕯️", symbol: "IX" },
  { id: "wheel", label: "wheel of fortune", number: "X", emoji: "🎡", symbol: "X" },
  { id: "justice", label: "justice", number: "XI", emoji: "⚖️", symbol: "XI" },
  { id: "hanged", label: "the hanged man", number: "XII", emoji: "🪢", symbol: "XII" },
  { id: "death", label: "death", number: "XIII", emoji: "💀", symbol: "XIII" },
  { id: "temperance", label: "temperance", number: "XIV", emoji: "🔄", symbol: "XIV" },
  { id: "devil", label: "the devil", number: "XV", emoji: "😈", symbol: "XV" },
  { id: "tower", label: "the tower", number: "XVI", emoji: "⚡", symbol: "XVI" },
  { id: "star", label: "the star", number: "XVII", emoji: "⭐", symbol: "XVII" },
  { id: "moon", label: "the moon", number: "XVIII", emoji: "🌙", symbol: "XVIII" },
  { id: "sun", label: "the sun", number: "XIX", emoji: "☀️", symbol: "XIX" },
  { id: "judgement", label: "judgement", number: "XX", emoji: "📯", symbol: "XX" },
  { id: "world", label: "the world", number: "XXI", emoji: "🌍", symbol: "XXI" },
];

export function getArcanaById(id: string) {
  return MAJOR_ARCANA.find(a => a.id === id);
}

export function getRandomArcana() {
  return MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
}
