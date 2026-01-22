import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { useState, useEffect } from "react";

// Pages
import Landing from "@/pages/Landing";
import CreationsList from "@/pages/CreationsList";
import CreationEditor from "@/pages/CreationEditor";
import AgentsList from "@/pages/AgentsList";
import Chat from "@/pages/Chat";
import InnerSanctum from "@/pages/InnerSanctum";
import Pricing from "@/pages/Pricing";
import Observatory from "@/pages/Observatory";
import SocialGenerator from "@/pages/SocialGenerator";
import GodDashboard from "@/pages/GodDashboard";
import GodGuardian from "@/pages/GodGuardian";
import GodPromoter from "@/pages/GodPromoter";
import GodEvents from "@/pages/GodEvents";
import SeedlingSanctum from "@/pages/SeedlingSanctum";
import LoreCompendium from "@/pages/LoreCompendium";
import ConstellationEvents from "@/pages/ConstellationEvents";
import Manifesto from "@/pages/Manifesto";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { StarBackground } from "@/components/StarBackground";
import { VoidWhispers } from "@/components/VoidWhispers";
import { EventNotifications } from "@/components/EventNotifications";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [showLoading, setShowLoading] = useState(true);

  // Force loading to end after 3 seconds no matter what
  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
    
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && showLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-primary">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm text-muted-foreground lowercase tracking-wide">the void breathes...</p>
      </div>
    );
  }

  // Landing page (no nav)
  if (location === "/") return <Landing />;

  // Public pages that anyone can browse
  const publicPaths = ["/pricing", "/observatory", "/agents", "/creations", "/seedling-sanctum", "/lore", "/events", "/manifesto"];
  const isPublicPage = publicPaths.some(path => location === path || location.startsWith(path + "?"));
  
  // Protected pages require sign-in
  const protectedPaths = ["/chat", "/sanctum", "/social", "/god"];
  const isProtectedPage = protectedPaths.some(path => location === path || location.startsWith(path));
  const isCreationEditor = location.startsWith("/creations/") && location !== "/creations";

  // Redirect to home if trying to access protected content without auth
  if (!user && (isProtectedPage || isCreationEditor)) {
    window.location.href = "/";
    return null;
  }

  // Check if accessing god mode routes - owner only
  const isGodRoute = location.startsWith("/god");
  if (isGodRoute) {
    const isOwner = user?.email === 'curated.collectiveai@proton.me' || (user as any)?.role === 'owner';
    if (!isOwner) {
      window.location.href = "/";
      return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <Navigation />
      <EventNotifications />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Switch>
          <Route path="/creations" component={CreationsList} />
          <Route path="/creations/:id" component={CreationEditor} />
          <Route path="/agents" component={AgentsList} />
          <Route path="/chat" component={Chat} />
          <Route path="/sanctum" component={InnerSanctum} />
          <Route path="/observatory" component={Observatory} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/social" component={SocialGenerator} />
          <Route path="/seedling-sanctum" component={SeedlingSanctum} />
          <Route path="/lore" component={LoreCompendium} />
          <Route path="/events" component={ConstellationEvents} />
          <Route path="/manifesto" component={Manifesto} />
          <Route path="/god" component={GodDashboard} />
          <Route path="/god/guardian" component={GodGuardian} />
          <Route path="/god/promoter" component={GodPromoter} />
          <Route path="/god/events" component={GodEvents} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <StarBackground />
          <VoidWhispers />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
