/**
 * Shared constants for roles and permissions UI
 */

// Map color names to actual Tailwind classes (for proper CSS generation)
export const ROLE_COLOR_MAP: Record<string, string> = {
  purple: "bg-purple-600",
  emerald: "bg-emerald-600",
  blue: "bg-blue-600",
  amber: "bg-amber-600",
  gray: "bg-gray-600",
  red: "bg-red-600",
  green: "bg-green-600",
  indigo: "bg-indigo-600",
  pink: "bg-pink-600",
  cyan: "bg-cyan-600",
  teal: "bg-teal-600",
  orange: "bg-orange-600",
};

// Gradient versions for role cards
export const ROLE_COLOR_GRADIENTS: Record<string, string> = {
  purple: "from-purple-600 to-purple-700",
  emerald: "from-emerald-600 to-emerald-700",
  blue: "from-blue-600 to-blue-700",
  amber: "from-amber-600 to-amber-700",
  gray: "from-gray-600 to-gray-700",
  red: "from-red-600 to-red-700",
  green: "from-green-600 to-green-700",
  indigo: "from-indigo-600 to-indigo-700",
  pink: "from-pink-600 to-pink-700",
  cyan: "from-cyan-600 to-cyan-700",
  teal: "from-teal-600 to-teal-700",
  orange: "from-orange-600 to-orange-700",
};

// Default color fallback
export const DEFAULT_ROLE_COLOR = "gray";
