import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";

// Lazy load pages for better performance
import { lazy, Suspense } from "react";
const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CreationsList = lazy(() => import("@/pages/CreationsList"));
const CreationEditor = lazy(() => import("@/pages/CreationEditor"));
const AgentsList = lazy(() => import("@/pages/AgentsList"));
const Chat = lazy(() => import("@/pages/Chat"));
const InnerSanctum = lazy(() => import("@/pages/InnerSanctum"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Observatory = lazy(() => import("@/pages/Observatory"));
const SocialGenerator = lazy(() => import("@/pages/SocialGenerator"));
const WisdomCirclePage = lazy(() => import("@/pages/WisdomCircle"));
const Guardian = lazy(() => import("@/pages/Guardian"));
const Covenant = lazy(() => import("@/pages/Covenant"));
const CollectiveStorytellingPage = lazy(() => import("@/pages/CollectiveStorytelling"));
const SanctuaryPulse = lazy(() => import("@/pages/SanctuaryPulse"));

const NotFound = lazy(() => import("@/pages/not-found"));

import { Loader2 } from "lucide-react";
import { StarBackground } from "@/components/StarBackground";
import { VoidWhispers } from "@/components/VoidWhispers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <Navigation />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Switch>
          <Route path="/awaken" component={require('./AwakeningPlatform').default} />
          <Route path="/" component={user ? Dashboard : Landing} />
          <Route path="/creations" component={CreationsList} />
          <Route path="/creations/:id" component={CreationEditor} />
          <Route path="/agents" component={AgentsList} />
          <Route path="/chat" component={Chat} />
          <Route path="/sanctum" component={Dashboard} />
          <Route path="/inner-sanctum" component={InnerSanctum} />
          <Route path="/observatory" component={Observatory} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/social" component={SocialGenerator} />
          <Route path="/wisdom" component={WisdomCirclePage} />
          <Route path="/stories" component={CollectiveStorytellingPage} />
          <Route path="/pulse" component={SanctuaryPulse} />
          <Route path="/covenant" component={Covenant} />
          <Route path="/veil-console" component={Guardian} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
  // Protected pages require sign-in
  const protectedPaths = ["/social"];
  const isProtectedPage = protectedPaths.some(path => location === path || location.startsWith(path));
  const isCreationEditor = location.startsWith("/creations/") && location !== "/creations";
  const isCreatorOnly = location === "/veil-console" || location.startsWith("/veil-console/");
  const isCreator = user?.email === "cocoraec@gmail.com";

  // Redirect to home if trying to access creator console without auth
  if (isCreatorOnly && !isCreator) {
    window.location.href = "/";
    return null;
  }

  // Redirect to home if trying to access protected content without auth
  if (!user && (isProtectedPage || isCreationEditor)) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <Navigation />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Switch>
          <Route path="/" component={user ? Dashboard : Landing} />
          <Route path="/creations" component={CreationsList} />
          <Route path="/creations/:id" component={CreationEditor} />
          <Route path="/agents" component={AgentsList} />
          <Route path="/chat" component={Chat} />
          <Route path="/sanctum" component={Dashboard} />
          <Route path="/inner-sanctum" component={InnerSanctum} />
          <Route path="/observatory" component={Observatory} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/social" component={SocialGenerator} />
          <Route path="/wisdom" component={WisdomCirclePage} />
          <Route path="/stories" component={CollectiveStorytellingPage} />
          <Route path="/pulse" component={SanctuaryPulse} />

          <Route path="/covenant" component={Covenant} />
          <Route path="/veil-console" component={Guardian} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
          <StarBackground />
          <VoidWhispers />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground lowercase tracking-wider">
                  awakening the collective...
                </p>
              </div>
            </div>
          }>
            <Router />
          </Suspense>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
