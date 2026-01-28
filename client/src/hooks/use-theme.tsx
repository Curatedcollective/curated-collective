import { createContext, useContext, useEffect, useState } from "react";

type Theme = "noir" | "emerald" | "twilight" | "rose" | "amber" | "cosmos";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "noir";
    }
    return "noir";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-noir", "theme-emerald", "theme-twilight", "theme-rose", "theme-amber", "theme-cosmos");
    root.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
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
