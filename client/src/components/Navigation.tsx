import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Code, Bot, MessageSquare, LogOut, User, Menu, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-8 px-2 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary magical-glow" />
        <div>
          <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Creations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">AI & Code Platform</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        <NavLink href="/creations" icon={<Code className="w-5 h-5" />} label="Creations" active={isActive("/creations")} />
        <NavLink href="/agents" icon={<Bot className="w-5 h-5" />} label="Agents" active={isActive("/agents")} />
        <NavLink href="/chat" icon={<MessageSquare className="w-5 h-5" />} label="Lab Chat" active={isActive("/chat")} />
        <NavLink href="/sanctum" icon={<Lock className="w-5 h-5" />} label="Inner Sanctum" active={isActive("/sanctum")} />
      </nav>

      {user && (
        <div className="pt-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-secondary/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">
              {user.firstName?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user.firstName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-border bg-background/50 backdrop-blur-xl p-6 z-40">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-40 px-4 flex items-center justify-between">
         <h1 className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Creations
        </h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-background border-r border-border p-6">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-16" />
    </>
  );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
        ${active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}
      `}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
