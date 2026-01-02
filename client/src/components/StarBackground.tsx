import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const THEMES = {
  noir: { glow: "255, 255, 255" },
  emerald: { glow: "52, 211, 153" },
  twilight: { glow: "167, 139, 250" },
  rose: { glow: "251, 113, 133" },
  amber: { glow: "251, 191, 36" },
};

export function StarBackground() {
  const { theme: currentTheme } = useTheme();
  const themeColors = THEMES[currentTheme] || THEMES.noir;

  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="stars-container fixed inset-0 -z-50 pointer-events-none transition-colors duration-1000 bg-background">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: `rgb(${themeColors.glow})`,
            boxShadow: `0 0 4px rgba(${themeColors.glow}, 0.8)`,
            "--delay": star.delay,
            "--duration": star.duration,
          } as any}
        />
      ))}
    </div>
  );
}
