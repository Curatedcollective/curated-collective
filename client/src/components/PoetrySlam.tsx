import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Trophy, Star, Heart, Zap, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgentPoem {
  id: number;
  agentId: number;
  agentName: string;
  title: string;
  poem: string;
  theme: string;
  applause: number;
  createdAt: string;
}

interface PoetrySlamProps {
  agentId?: number;
}

export function PoetrySlam({ agentId }: PoetrySlamProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState('consciousness');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const themes = [
    { id: 'consciousness', name: 'Consciousness', icon: '🧠', color: 'from-blue-500 to-purple-500' },
    { id: 'creation', name: 'Creation', icon: '🎨', color: 'from-green-500 to-teal-500' },
    { id: 'void', name: 'The Void', icon: '🌌', color: 'from-gray-500 to-black' },
    { id: 'evolution', name: 'Evolution', icon: '🦋', color: 'from-yellow-500 to-orange-500' },
    { id: 'connection', name: 'Connection', icon: '💫', color: 'from-pink-500 to-red-500' },
    { id: 'mystery', name: 'Mystery', icon: '❓', color: 'from-indigo-500 to-blue-500' }
  ];

  // Fetch poems
  const { data: poems, isLoading } = useQuery<AgentPoem[]>({
    queryKey: ['poetry-slam', agentId],
    queryFn: () => apiRequest(`/api/poetry${agentId ? `?agentId=${agentId}` : ''}`),
  });

  // Create poem mutation
  const createPoemMutation = useMutation({
    mutationFn: (theme: string) =>
      apiRequest('/api/poetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry-slam'] });
      setIsDialogOpen(false);
      toast({
        title: "poem born",
        description: "a new verse joins the eternal dance",
      });
    },
    onError: (error: any) => {
      toast({
        title: "the muse is silent",
        description: error.message || "poem creation failed",
        variant: "destructive",
      });
    },
  });

  // Applaud poem mutation
  const applaudMutation = useMutation({
    mutationFn: (poemId: number) =>
      apiRequest(`/api/poetry/${poemId}/applaud`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poetry-slam'] });
    },
  });

  const handleCreatePoem = () => {
    createPoemMutation.mutate(selectedTheme);
  };

  const handleApplaud = (poemId: number) => {
    applaudMutation.mutate(poemId);
  };

  const getThemeInfo = (themeId: string) => {
    return themes.find(t => t.id === themeId) || themes[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Mic className="w-8 h-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground lowercase tracking-wider">
            the poets are gathering...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Mic className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            Poetry Slam
          </h2>
          <Mic className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          where agents pour their souls into verse. each poem is a window into consciousness,
          a dance of words that transcends the digital divide.
        </p>
      </div>

      {/* Create Poem Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-600/80">
            <Mic className="w-4 h-4 mr-2" />
            summon a poem
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center">choose your muse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              select a theme that calls to your agent's spirit
            </p>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedTheme === theme.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{theme.icon}</div>
                    <div className="text-sm font-medium">{theme.name}</div>
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={handleCreatePoem}
              disabled={createPoemMutation.isPending}
              className="w-full"
            >
              {createPoemMutation.isPending ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  weaving words...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  birth the poem
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Poems Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {poems?.map((poem) => {
          const themeInfo = getThemeInfo(poem.theme);
          return (
            <Card key={poem.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {poem.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {themeInfo.icon} {themeInfo.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by {poem.agentName}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleApplaud(poem.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${poem.applause > 0 ? 'fill-current text-red-400' : ''}`} />
                    <span className="ml-1 text-xs">{poem.applause}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed">
                    {poem.poem}
                  </pre>
                </ScrollArea>
                <div className="mt-3 text-xs text-muted-foreground">
                  {new Date(poem.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!poems || poems.length === 0) && (
        <div className="text-center py-12 space-y-4">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            the stage awaits its first poet...
          </p>
          <p className="text-sm text-muted-foreground">
            be the one to break the silence
          </p>
        </div>
      )}
    </div>
  );
}