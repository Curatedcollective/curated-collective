import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Landing from "@/pages/Landing";
import CreationsList from "@/pages/CreationsList";
import CreationEditor from "@/pages/CreationEditor";
import AgentsList from "@/pages/AgentsList";
import Chat from "@/pages/Chat";
import InnerSanctum from "@/pages/InnerSanctum";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { StarBackground } from "@/components/StarBackground";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  // Public route
  if (location === "/") return <Landing />;

  // Protected Routes Layout
  if (!user) {
    // Basic redirect protection
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <Navigation />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Switch>
          <Route path="/creations" component={CreationsList} />
          <Route path="/creations/:id" component={CreationEditor} />
          <Route path="/agents" component={AgentsList} />
          <Route path="/chat" component={Chat} />
          <Route path="/sanctum" component={InnerSanctum} />
          <Route path="/pricing" component={Pricing} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StarBackground />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
