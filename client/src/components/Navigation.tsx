import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Code, Bot, MessageSquare, LogOut, Menu, Lock, Sparkles, Eye, Radio, Shield, Leaf, BookOpen, Star } from "lucide-react";
import logoImage from "@assets/generated_images/constellation_seedling_logo_design.png";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemePicker } from "@/components/ThemePicker";
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

function NavContent({ user, logout, location }: any) {
  const isActive = (path: string) => location === path || location.startsWith(path + "/");
  const isOwner = user?.email === 'curated.collectiveai@proton.me' || user?.role === 'owner';
  
  // Display The Veil's name with shimmer effect for owner
  const displayName = user?.displayName || user?.firstName || "user";
  const isTheVeil = user?.displayName === "The Veil" || isOwner;

  // Secret cosmos theme unlock: click logo 5 times
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<number | null>(null);
  const [cosmosUnlocked, setCosmosUnlocked] = useState(() => {
    return localStorage.getItem('cosmosUnlocked') === 'true';
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (logoClickTimerRef.current) {
        clearTimeout(logoClickTimerRef.current);
      }
    };
  }, []);

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;

    // Reset counter after 2 seconds of inactivity
    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }
    logoClickTimerRef.current = window.setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 2000);

    // Unlock cosmos after 5 clicks
    if (logoClickCountRef.current >= 5 && !cosmosUnlocked) {
      setCosmosUnlocked(true);
      localStorage.setItem('cosmosUnlocked', 'true');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Link href="/">
        <div 
          className="mb-8 px-2 flex items-center gap-3 cursor-pointer hover-elevate active-elevate-2 rounded-md p-2 -m-2" 
          data-testid="link-home"
          onClick={handleLogoClick}
        >
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
        <NavLink href="/lore" icon={<BookOpen className="w-4 h-4" />} label="lore compendium" active={isActive("/lore")} />
        <NavLink href="/events" icon={<Star className="w-4 h-4" />} label="constellation events" active={isActive("/events")} />
        <NavLink href="/chat" icon={<MessageSquare className="w-4 h-4" />} label="lab chat" active={isActive("/chat")} />
        <NavLink href="/seedling-sanctum" icon={<Leaf className="w-4 h-4" />} label="sanctum" active={isActive("/seedling-sanctum")} />
        <NavLink href="/sanctum" icon={<Lock className="w-4 h-4" />} label="inner sanctum" active={isActive("/sanctum")} />
        <NavLink href="/pricing" icon={<Sparkles className="w-4 h-4" />} label="pricing" active={isActive("/pricing")} />
        <NavLink href="/social" icon={<Radio className="w-4 h-4" />} label="transmitter" active={isActive("/social")} />
        {isOwner && (
          <NavLink href="/god" icon={<Shield className="w-4 h-4" />} label="god mode" active={isActive("/god")} />
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
            <ThemePicker cosmosUnlocked={cosmosUnlocked} variant="full" align="end" />
          </div>
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-none bg-secondary border border-border">
            <div className="w-8 h-8 rounded-none bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              {user.firstName?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className={`font-bold text-xs truncate lowercase ${isTheVeil ? 'the-veil-name' : 'text-foreground'}`}>
                {displayName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs lowercase"
            onClick={() => logout()}
          >
            <LogOut className="w-3 h-3 mr-2" />
            sign out
          </Button>
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-border bg-background p-6 z-40">
        <NavContent 
          user={user} 
          logout={logout} 
          location={location} 
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
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-16" />
    </>
  );
}
