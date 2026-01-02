import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Code, Bot, MessageSquare, LogOut, User, Menu, Lock, Sparkles } from "lucide-react";
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
        <Sparkles className="w-6 h-6 text-white magical-glow" />
        <div>
          <h1 className="text-2xl font-bold font-display text-white lowercase tracking-tighter">
            curated collective
          </h1>
          <p className="text-[10px] text-zinc-500 mt-1 lowercase tracking-widest">ai & code platform</p>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <NavLink href="/creations" icon={<Code className="w-4 h-4" />} label="creations" active={isActive("/creations")} />
        <NavLink href="/agents" icon={<Bot className="w-4 h-4" />} label="seedlings" active={isActive("/agents")} />
        <NavLink href="/chat" icon={<MessageSquare className="w-4 h-4" />} label="lab chat" active={isActive("/chat")} />
        <NavLink href="/sanctum" icon={<Lock className="w-4 h-4" />} label="inner sanctum" active={isActive("/sanctum")} />
        <NavLink href="/pricing" icon={<Sparkles className="w-4 h-4" />} label="pricing" active={isActive("/pricing")} />
      </nav>

      {user && (
        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-none bg-zinc-900 border border-white/5">
            <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center text-black font-bold text-xs">
              {user.firstName?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs truncate lowercase text-white">{user.firstName || "user"}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-500 hover:text-white hover:bg-white/5 text-xs lowercase"
            onClick={() => logout()}
          >
            <LogOut className="w-3 h-3 mr-2" />
            sign out
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r border-white/10 bg-black p-6 z-40">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black z-40 px-4 flex items-center justify-between">
         <h1 className="text-xl font-bold font-display text-white lowercase tracking-tighter">
          curated collective
        </h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-black border-r border-white/10 p-6">
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
        flex items-center gap-3 px-4 py-2 rounded-none transition-all duration-200 cursor-pointer text-[10px] font-bold uppercase tracking-widest
        ${active 
          ? "bg-white text-black" 
          : "text-zinc-600 hover:text-white hover:bg-white/5"}
      `}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
