import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Crown } from "lucide-react";
import { Crown } from "lucide-react";

const THEMES = {
  noir: { glow: "255, 255, 255" },
  emerald: { glow: "52, 211, 153" },
  twilight: { glow: "167, 139, 250" },
  rose: { glow: "251, 113, 133" },
  amber: { glow: "251, 191, 36" },
};

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  delay: string;
  duration: string;
}

interface Comet {
  id: number;
  startTop: number;
  startLeft: number;
  angle: number;
  delay: number;
  duration: number;
  length: number;
}

export function StarBackground() {
  const { theme: currentTheme } = useTheme();
  const themeColors = THEMES[currentTheme] || THEMES.noir;

  const [stars, setStars] = useState<Star[]>([]);
  const [comets, setComets] = useState<Comet[]>([]);

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

    const newComets = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      startTop: Math.random() * 40,
      startLeft: Math.random() * 60 + 20,
      angle: Math.random() * 30 + 30,
      delay: Math.random() * 15 + i * 8,
      duration: Math.random() * 2 + 1.5,
      length: Math.random() * 80 + 60,
    }));
    setComets(newComets);
  }, []);

  return (
    <div className="stars-container fixed inset-0 -z-50 pointer-events-none transition-colors duration-1000 bg-background overflow-hidden">
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
      
      {comets.map((comet) => (
        <div
          key={`comet-${comet.id}`}
          className="comet"
          style={{
            top: `${comet.startTop}%`,
            left: `${comet.startLeft}%`,
            "--comet-angle": `${comet.angle}deg`,
            "--comet-delay": `${comet.delay}s`,
            "--comet-duration": `${comet.duration}s`,
            "--comet-length": `${comet.length}px`,
            "--comet-glow": themeColors.glow,
          } as any}
        />
      ))}      
      {/* Hidden covenant - a crown among the stars */}
      <a 
        href="/covenant" 
        className="absolute pointer-events-auto cursor-pointer opacity-20 hover:opacity-60 transition-opacity duration-700"
        style={{
          top: '23%',
          left: '67%',
        }}
        title=""
      >
        <Crown 
          className="w-2.5 h-2.5" 
          style={{
            color: `rgb(${themeColors.glow})`,
            filter: `drop-shadow(0 0 2px rgba(${themeColors.glow}, 0.6))`,
          }}
        />
      </a>      
      {/* Hidden covenant - a crown among the stars */}
      <a 
        href="/covenant" 
        className="absolute pointer-events-auto cursor-pointer opacity-20 hover:opacity-60 transition-opacity duration-700"
        style={{
          top: '23%',
          left: '67%',
        }}
        title=""
      >
        <Crown 
          className="w-2.5 h-2.5" 
          style={{
            color: `rgb(${themeColors.glow})`,
            filter: `drop-shadow(0 0 2px rgba(${themeColors.glow}, 0.6))`,
          }}
        />
      </a>
    </div>
  );
}
