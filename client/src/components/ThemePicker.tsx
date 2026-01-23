import { useTheme } from "@/hooks/use-theme";
import { Button } from "./ui/button";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ThemePickerProps {
  cosmosUnlocked?: boolean;
  variant?: "icon" | "full";
  align?: "start" | "center" | "end";
}

export function ThemePicker({ 
  cosmosUnlocked = false, 
  variant = "icon",
  align = "end" 
}: ThemePickerProps) {
  const { theme, setTheme } = useTheme();

  // Icon variant - minimal button with icon
  if (variant === "icon") {
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
          className="bg-card border-border rounded-none"
          align={align}
        >
          <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('noir')}>noir (classic)</DropdownMenuItem>
          <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('emerald')}>emerald (forest)</DropdownMenuItem>
          <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('twilight')}>twilight (cosmic)</DropdownMenuItem>
          <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('rose')}>rose (warmth)</DropdownMenuItem>
          <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('amber')}>amber (golden)</DropdownMenuItem>
          <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('midnight')}>midnight (ocean)</DropdownMenuItem>
          {cosmosUnlocked && (
            <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('cosmos')}>
              🌌 cosmos (living)
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant - button with label (for navigation)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-border bg-background text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest rounded-none h-8"
          data-testid="button-theme-picker"
        >
          <Palette className="w-3 h-3 mr-2" />
          theme: {theme}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="bg-card border-border rounded-none"
      >
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('noir')}>noir (classic)</DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('emerald')}>emerald (forest)</DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('twilight')}>twilight (cosmic)</DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('rose')}>rose (warmth)</DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('amber')}>amber (golden)</DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('midnight')}>midnight (ocean)</DropdownMenuItem>
        {cosmosUnlocked && (
          <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('cosmos')}>
            🌌 cosmos (living)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
