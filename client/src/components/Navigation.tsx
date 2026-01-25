import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Code, Bot, MessageSquare, LogOut, Menu, Lock, Sparkles, Palette, Eye, Radio, Loader2 } from "lucide-react";
import logoImage from "@assets/generated_images/constellation_seedling_logo_design.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiFacebook, SiInstagram, SiX, SiTiktok } from "react-icons/si";

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <div className={`
        flex items-center gap-3 px-4 py-2 rounded-none transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-widest
        ${active 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"}
      `}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}

function NavContent({ user, logout, location, theme, setTheme }: any) {
  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  return (
    <div className="flex flex-col h-full">
      <Link href="/">
        <div className="mb-8 px-2 flex items-center gap-3 cursor-pointer hover-elevate active-elevate-2 rounded-md p-2 -m-2" data-testid="link-home">
          <img src={logoImage} alt="Curated Collective" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground lowercase tracking-tighter">
              curated collective
            </h1>
            <p className="text-[10px] text-muted-foreground mt-1 lowercase tracking-widest">ai & code platform</p>
          </div>
        </div>
      </Link>

      <nav className="space-y-1 flex-1">
        <NavLink href="/creations" icon={<Code className="w-4 h-4" />} label="creations" active={isActive("/creations")} />
        <NavLink href="/agents" icon={<Bot className="w-4 h-4" />} label="seedlings" active={isActive("/agents")} />
        <NavLink href="/observatory" icon={<Eye className="w-4 h-4" />} label="observatory" active={isActive("/observatory")} />
        <NavLink href="/chat" icon={<MessageSquare className="w-4 h-4" />} label="lab chat" active={isActive("/chat")} />
        <NavLink href="/sanctum" icon={<Lock className="w-4 h-4" />} label="inner sanctum" active={isActive("/sanctum")} />
        <NavLink href="/pricing" icon={<Sparkles className="w-4 h-4" />} label="pricing" active={isActive("/pricing")} />
        <NavLink href="/social" icon={<Radio className="w-4 h-4" />} label="transmitter" active={isActive("/social")} />
        <NavLink href="/wisdom" icon={<Crown className="w-4 h-4" />} label="wisdom circle" active={isActive("/wisdom")} />
        <NavLink href="/poetry" icon={<Mic className="w-4 h-4" />} label="poetry slam" active={isActive("/poetry")} />
        <NavLink href="/stories" icon={<BookOpen className="w-4 h-4" />} label="storytelling" active={isActive("/stories")} />
        <NavLink href="/literary" icon={<Eye className="w-4 h-4" />} label="literary sanctuary" active={isActive("/literary")} />
        
        {/* Quick Actions for Authenticated Users */}
        {user && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 px-4">quick access</p>
            <Link href="/agents">
              <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors">
                <Sparkles className="w-3 h-3" />
                awaken seedling
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* Social Links */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-border">
        <a href="https://facebook.com/curatedcollective" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <SiFacebook className="w-4 h-4" />
        </a>
        <a href="https://instagram.com/curatedcollective" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <SiInstagram className="w-4 h-4" />
        </a>
        <a href="https://x.com/curatedcollect" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <SiX className="w-4 h-4" />
        </a>
        <a href="https://tiktok.com/@curatedcollective" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <SiTiktok className="w-4 h-4" />
        </a>
      </div>

      {user && (
        <div className="pt-6 border-t border-border mt-auto">
          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full border-border bg-background text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest rounded-none h-8">
                  <Palette className="w-3 h-3 mr-2" />
                  theme: {theme}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border rounded-none">
                <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('noir')}>noir (classic)</DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('emerald')}>emerald (forest)</DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('twilight')}>twilight (cosmic)</DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('rose')}>rose (warmth)</DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer lowercase" onClick={() => setTheme('amber')}>amber (golden)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-none bg-secondary border border-border">
            <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              {user.firstName?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs truncate lowercase text-foreground">{user.firstName || "user"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs lowercase"
            onClick={() => logout()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-3 h-3 mr-2" />
            )}
            {logoutMutation.isPending ? "signing out..." : "sign out"}
          </Button>
        </div>
      )}

      {!user && (
        <div className="pt-6 border-t border-border mt-auto">
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full border-border bg-background text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest rounded-none h-10"
              onClick={() => window.location.href = "/api/login"}
            >
              <Lock className="w-3 h-3 mr-2" />
              sign in
            </Button>
            <p className="text-[9px] text-muted-foreground text-center lowercase tracking-wider">
              join the collective
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-border bg-background p-6 z-40">
        <NavContent 
          user={user} 
          logout={logout} 
          location={location} 
          theme={theme}
          setTheme={setTheme}
        />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background z-40 px-4 flex items-center justify-between">
        <Link href="/">
          <h1 className="text-xl font-bold font-display text-foreground lowercase tracking-tighter cursor-pointer" data-testid="link-home-mobile">
            curated collective
          </h1>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-background border-r border-border p-6">
            <NavContent 
              user={user} 
              logout={logout} 
              location={location} 
              theme={theme}
              setTheme={setTheme}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-16" />
    </>
  );
}
