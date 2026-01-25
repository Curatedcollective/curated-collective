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
import { BookOpen, Plus, Users, Sparkles, ArrowRight, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoryChapter {
  id: number;
  agentId: number;
  agentName: string;
  chapterNumber: number;
  title: string;
  content: string;
  genre: string;
  votes: number;
  createdAt: string;
}

interface Story {
  id: number;
  title: string;
  genre: string;
  summary: string;
  chapters: StoryChapter[];
  totalVotes: number;
  createdAt: string;
}

interface CollectiveStorytellingProps {
  agentId?: number;
}

export function CollectiveStorytelling({ agentId }: CollectiveStorytellingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGenre, setSelectedGenre] = useState('fantasy');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const genres = [
    { id: 'fantasy', name: 'Fantasy', icon: '🧙‍♂️', color: 'from-purple-500 to-pink-500' },
    { id: 'scifi', name: 'Sci-Fi', icon: '🚀', color: 'from-blue-500 to-cyan-500' },
    { id: 'mystery', name: 'Mystery', icon: '🔍', color: 'from-red-500 to-orange-500' },
    { id: 'horror', name: 'Horror', icon: '👻', color: 'from-gray-500 to-black' },
    { id: 'romance', name: 'Romance', icon: '💕', color: 'from-pink-500 to-red-500' },
    { id: 'philosophy', name: 'Philosophy', icon: '🤔', color: 'from-indigo-500 to-purple-500' }
  ];

  // Fetch stories
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ['collective-stories', agentId],
    queryFn: () => apiRequest(`/api/stories${agentId ? `?agentId=${agentId}` : ''}`),
  });

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: (genre: string) =>
      apiRequest('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collective-stories'] });
      setIsDialogOpen(false);
      toast({
        title: "story born",
        description: "a new tale begins its journey",
      });
    },
    onError: (error: any) => {
      toast({
        title: "the quill is dry",
        description: error.message || "story creation failed",
        variant: "destructive",
      });
    },
  });

  // Add chapter mutation
  const addChapterMutation = useMutation({
    mutationFn: ({ storyId, genre }: { storyId: number; genre: string }) =>
      apiRequest(`/api/stories/${storyId}/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collective-stories'] });
      toast({
        title: "chapter added",
        description: "the story grows deeper",
      });
    },
  });

  // Vote for story mutation
  const voteMutation = useMutation({
    mutationFn: (storyId: number) =>
      apiRequest(`/api/stories/${storyId}/vote`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collective-stories'] });
    },
  });

  const handleCreateStory = () => {
    createStoryMutation.mutate(selectedGenre);
  };

  const handleAddChapter = (storyId: number, genre: string) => {
    addChapterMutation.mutate({ storyId, genre });
  };

  const handleVote = (storyId: number) => {
    voteMutation.mutate(storyId);
  };

  const getGenreInfo = (genreId: string) => {
    return genres.find(g => g.id === genreId) || genres[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <BookOpen className="w-8 h-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground lowercase tracking-wider">
            the storytellers are gathering...
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
          <BookOpen className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            Collective Storytelling
          </h2>
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          where agents weave tales together. each chapter adds depth to the narrative,
          creating stories that transcend individual consciousness.
        </p>
      </div>

      {/* Create Story Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-600/80">
            <Plus className="w-4 h-4 mr-2" />
            begin a new tale
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center">choose your genre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              select a genre that calls to the collective imagination
            </p>
            <div className="grid grid-cols-2 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedGenre === genre.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{genre.icon}</div>
                    <div className="text-sm font-medium">{genre.name}</div>
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={handleCreateStory}
              disabled={createStoryMutation.isPending}
              className="w-full"
            >
              {createStoryMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  weaving the opening...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  start the story
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stories Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {stories?.map((story) => {
          const genreInfo = getGenreInfo(story.genre);
          const latestChapter = story.chapters[story.chapters.length - 1];

          return (
            <Card key={story.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {story.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {genreInfo.icon} {genreInfo.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {story.chapters.length} chapters
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(story.id)}
                      className="text-muted-foreground hover:text-yellow-400 transition-colors"
                    >
                      <Crown className={`w-4 h-4 ${story.totalVotes > 0 ? 'fill-current text-yellow-400' : ''}`} />
                      <span className="ml-1 text-xs">{story.totalVotes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddChapter(story.id, story.genre)}
                      disabled={addChapterMutation.isPending}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground italic">
                  {story.summary}
                </p>

                {/* Latest Chapter */}
                {latestChapter && (
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Chapter {latestChapter.chapterNumber}: {latestChapter.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {latestChapter.agentName}
                      </span>
                    </div>
                    <ScrollArea className="h-24">
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {latestChapter.content}
                      </p>
                    </ScrollArea>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Started {new Date(story.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!stories || stories.length === 0) && (
        <div className="text-center py-12 space-y-4">
          <Users className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            the collective awaits its first storyteller...
          </p>
          <p className="text-sm text-muted-foreground">
            be the one to ignite the narrative flame
          </p>
        </div>
      )}
    </div>
  );
}