import { useTheme } from "@/hooks/use-theme";
import { Button } from "./ui/button";
import { Palette } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const themes = [
  { id: "noir", name: "void", color: "bg-zinc-900", description: "pure darkness" },
  { id: "emerald", name: "aurora", color: "bg-emerald-900", description: "forest mystery" },
  { id: "twilight", name: "twilight", color: "bg-purple-900", description: "cosmic depths" },
  { id: "rose", name: "ember", color: "bg-rose-900", description: "warm embrace" },
  { id: "amber", name: "celestial", color: "bg-amber-900", description: "golden light" },
  { id: "midnight", name: "midnight", color: "bg-blue-900", description: "ocean depths" },
] as const;

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [cosmosUnlocked, setCosmosUnlocked] = useState(() => {
    return localStorage.getItem('cosmosUnlocked') === 'true';
  });

  // Listen for cosmos unlock
  useEffect(() => {
    const handleCosmosUnlock = () => {
      setCosmosUnlocked(localStorage.getItem('cosmosUnlocked') === 'true');
    };
    window.addEventListener('cosmosUnlocked', handleCosmosUnlock);
    return () => window.removeEventListener('cosmosUnlocked', handleCosmosUnlock);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-none hover:bg-white/5"
          data-testid="button-theme-picker"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-black border border-white/10 rounded-none p-2 min-w-[200px]"
        align="end"
      >
        <div className="px-2 py-1 mb-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">sanctuary theme</p>
        </div>
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`flex items-center gap-3 px-3 py-2 rounded-none cursor-pointer ${
              theme === t.id ? "bg-white/10" : "hover:bg-white/5"
            }`}
            data-testid={`button-theme-${t.id}`}
          >
            <div className={`w-4 h-4 rounded-full ${t.color} border border-white/20`} />
            <div className="flex-1">
              <p className="text-sm font-display lowercase tracking-tighter text-white">{t.name}</p>
              <p className="text-[9px] text-zinc-600 lowercase tracking-widest">{t.description}</p>
            </div>
            {theme === t.id && (
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </DropdownMenuItem>
        ))}
        {cosmosUnlocked && (
          <DropdownMenuItem
            onClick={() => setTheme('cosmos' as any)}
            className={`flex items-center gap-3 px-3 py-2 rounded-none cursor-pointer ${
              theme === 'cosmos' ? "bg-white/10" : "hover:bg-white/5"
            }`}
            data-testid="button-theme-cosmos"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-900 via-blue-900 to-pink-900 border border-white/20" />
            <div className="flex-1">
              <p className="text-sm font-display lowercase tracking-tighter text-white">🌌 cosmos</p>
              <p className="text-[9px] text-zinc-600 lowercase tracking-widest">living universe</p>
            </div>
            {theme === 'cosmos' && (
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
