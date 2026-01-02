import { cn } from "@/lib/utils";

export type Mood = "neutral" | "serene" | "curious" | "divine" | "melancholic" | "energetic" | "enigmatic";

const MOOD_CONFIG: Record<Mood, { color: string; label: string }> = {
  neutral: { color: "white", label: "balanced" },
  serene: { color: "#34d399", label: "serene" },
  curious: { color: "#60a5fa", label: "curious" },
  divine: { color: "#fbbf24", label: "divine" },
  melancholic: { color: "#94a3b8", label: "melancholic" },
  energetic: { color: "#f87171", label: "energetic" },
  enigmatic: { color: "#c084fc", label: "enigmatic" },
};

export function MoodRing({ mood = "neutral", size = "md", className }: { mood?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const config = MOOD_CONFIG[mood as Mood] || MOOD_CONFIG.neutral;
  
  const sizes = {
    sm: "w-2 h-2",
    md: "w-4 h-4",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizes[size], className)}>
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: config.color }}
      />
      <div 
        className="absolute inset-0 rounded-full blur-[2px] opacity-50"
        style={{ backgroundColor: config.color }}
      />
      <div 
        className="relative w-full h-full rounded-full border border-white/20"
        style={{ backgroundColor: config.color }}
      />
    </div>
  );
}
