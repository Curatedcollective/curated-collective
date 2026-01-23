import { createContext, useContext, useEffect, useState, useRef } from "react";

type Theme = "noir" | "emerald" | "twilight" | "rose" | "amber" | "midnight" | "cosmos";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Cosmos theme emotion simulation
type Emotion = "joy" | "serenity" | "curiosity" | "melancholy" | "excitement";

const emotionColors: Record<Emotion, {
  hue: number;
  saturation: number;
  lightness: number;
  glow: string;
}> = {
  joy: { hue: 50, saturation: 80, lightness: 50, glow: "250, 204, 21" }, // bright yellow
  serenity: { hue: 200, saturation: 60, lightness: 45, glow: "125, 211, 252" }, // calm blue
  curiosity: { hue: 280, saturation: 70, lightness: 55, glow: "192, 132, 252" }, // vibrant purple
  melancholy: { hue: 240, saturation: 30, lightness: 30, glow: "100, 116, 139" }, // deep muted blue
  excitement: { hue: 340, saturation: 85, lightness: 55, glow: "244, 114, 182" }, // energetic pink
};

function applyCosmosEmotion(emotion: Emotion) {
  const root = document.documentElement;
  const colors = emotionColors[emotion];
  
  // Apply CSS variables for cosmos theme with smooth transitions
  root.style.setProperty('--cosmos-background', `${colors.hue} ${colors.saturation * 0.4}% ${colors.lightness * 0.06}%`);
  root.style.setProperty('--cosmos-foreground', `${colors.hue} ${colors.saturation * 0.2}% 95%`);
  root.style.setProperty('--cosmos-card', `${colors.hue} ${colors.saturation * 0.35}% ${colors.lightness * 0.14}%`);
  root.style.setProperty('--cosmos-card-foreground', `${colors.hue} ${colors.saturation * 0.2}% 95%`);
  root.style.setProperty('--cosmos-primary', `${colors.hue} ${colors.saturation}% ${colors.lightness}%`);
  root.style.setProperty('--cosmos-primary-foreground', `${colors.hue} ${colors.saturation * 0.4}% 3%`);
  root.style.setProperty('--cosmos-secondary', `${colors.hue} ${colors.saturation * 0.25}% ${colors.lightness * 0.26}%`);
  root.style.setProperty('--cosmos-secondary-foreground', `${colors.hue} ${colors.saturation * 0.2}% 90%`);
  root.style.setProperty('--cosmos-muted', `${colors.hue} ${colors.saturation * 0.2}% ${colors.lightness * 0.32}%`);
  root.style.setProperty('--cosmos-muted-foreground', `${colors.hue} ${colors.saturation * 0.15}% 55%`);
  root.style.setProperty('--cosmos-accent', `${colors.hue} ${colors.saturation * 0.35}% ${colors.lightness * 0.46}%`);
  root.style.setProperty('--cosmos-accent-foreground', `${colors.hue} ${colors.saturation * 0.2}% 95%`);
  root.style.setProperty('--cosmos-border', `${colors.hue} ${colors.saturation * 0.25}% ${colors.lightness * 0.32}%`);
  root.style.setProperty('--cosmos-glow', colors.glow);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "noir";
    }
    return "noir";
  });

  const cosmosIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-noir", "theme-emerald", "theme-twilight", "theme-rose", "theme-amber", "theme-midnight", "theme-cosmos");
    root.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);

    // Start cosmos emotion cycle if cosmos theme is active
    if (theme === "cosmos") {
      const emotions: Emotion[] = ["curiosity", "joy", "serenity", "excitement", "melancholy"];
      let currentEmotionIndex = 0;

      // Apply initial emotion
      applyCosmosEmotion(emotions[currentEmotionIndex]);

      // Cycle through emotions every 8 seconds
      cosmosIntervalRef.current = window.setInterval(() => {
        currentEmotionIndex = (currentEmotionIndex + 1) % emotions.length;
        applyCosmosEmotion(emotions[currentEmotionIndex]);
      }, 8000);
    } else {
      // Clean up cosmos interval if switching away from cosmos theme
      if (cosmosIntervalRef.current !== null) {
        clearInterval(cosmosIntervalRef.current);
        cosmosIntervalRef.current = null;
      }
    }

    return () => {
      if (cosmosIntervalRef.current !== null) {
        clearInterval(cosmosIntervalRef.current);
      }
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
