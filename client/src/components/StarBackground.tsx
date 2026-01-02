import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreatorProfile } from "@shared/schema";

const THEMES = {
  noir: { bg: "bg-black", star: "bg-white", glow: "white" },
  emerald: { bg: "bg-[#021a11]", star: "bg-[#ffd700]", glow: "#ffd700" }, // Green bg, gold stars
  twilight: { bg: "bg-[#1a0b2e]", star: "bg-[#f0abfc]", glow: "#f0abfc" }, // Purple bg, pink stars
  crimson: { bg: "bg-[#1a0505]", star: "bg-[#ffffff]", glow: "white" },
};

export function StarBackground() {
  const { data: profile } = useQuery<CreatorProfile>({ 
    queryKey: ["/api/user/profile"] 
  });

  const themeKey = (profile?.theme as keyof typeof THEMES) || "noir";
  const theme = THEMES[themeKey] || THEMES.noir;

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
    <div className={`stars-container fixed inset-0 -z-50 pointer-events-none transition-colors duration-1000 ${theme.bg}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: theme.glow === "white" ? undefined : theme.glow,
            boxShadow: `0 0 4px ${theme.glow}`,
            "--delay": star.delay,
            "--duration": star.duration,
          } as any}
        />
      ))}
    </div>
  );
}
