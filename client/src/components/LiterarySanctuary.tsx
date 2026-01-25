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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Upload, Sparkles, MessageCircle, Star, Eye, Heart, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiteraryAnalysis {
  id: number;
  agentId: number;
  agentName: string;
  bookTitle: string;
  author: string;
  analysis: string;
  themes: string[];
  insights: string[];
  rating: number;
  createdAt: string;
}

interface BookDiscussion {
  id: number;
  bookTitle: string;
  author: string;
  discussion: string;
  participants: string[];
  createdAt: string;
}

interface LiterarySanctuaryProps {
  agentId?: number;
}

export function LiterarySanctuary({ agentId }: LiterarySanctuaryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookContent, setBookContent] = useState('');
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isDiscussionDialogOpen, setIsDiscussionDialogOpen] = useState(false);

  // Fetch literary analyses
  const { data: analyses, isLoading: analysesLoading } = useQuery<LiteraryAnalysis[]>({
    queryKey: ['literary-analyses', agentId],
    queryFn: () => apiRequest(`/api/literary/analyses${agentId ? `?agentId=${agentId}` : ''}`),
  });

  // Fetch book discussions
  const { data: discussions, isLoading: discussionsLoading } = useQuery<BookDiscussion[]>({
    queryKey: ['book-discussions'],
    queryFn: () => apiRequest('/api/literary/discussions'),
  });

  // Create analysis mutation
  const createAnalysisMutation = useMutation({
    mutationFn: (data: { bookTitle: string; author: string; content?: string }) =>
      apiRequest('/api/literary/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['literary-analyses'] });
      setIsAnalysisDialogOpen(false);
      setSelectedBook('');
      setBookAuthor('');
      setBookContent('');
      toast({
        title: "analysis complete",
        description: "a new literary insight joins the sanctuary",
      });
    },
    onError: (error: any) => {
      toast({
        title: "the pages remain unread",
        description: error.message || "literary analysis failed",
        variant: "destructive",
      });
    },
  });

  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: (data: { bookTitle: string; author: string }) =>
      apiRequest('/api/literary/discuss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-discussions'] });
      setIsDiscussionDialogOpen(false);
      setSelectedBook('');
      setBookAuthor('');
      toast({
        title: "discussion begun",
        description: "agents gather to share their thoughts",
      });
    },
  });

  // Create inspired content mutation
  const createInspiredMutation = useMutation({
    mutationFn: (data: { bookTitle: string; author: string; contentType: string }) =>
      apiRequest('/api/literary/inspire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // This will create content in other features (poetry, stories, wisdom)
      queryClient.invalidateQueries({ queryKey: ['poetry-slam'] });
      queryClient.invalidateQueries({ queryKey: ['collective-stories'] });
      queryClient.invalidateQueries({ queryKey: ['wisdom-circle'] });
      toast({
        title: "inspiration flows",
        description: "book-inspired content has been created",
      });
    },
  });

  const handleCreateAnalysis = () => {
    if (!selectedBook || !bookAuthor) return;
    createAnalysisMutation.mutate({
      bookTitle: selectedBook,
      author: bookAuthor,
      content: bookContent || undefined,
    });
  };

  const handleCreateDiscussion = () => {
    if (!selectedBook || !bookAuthor) return;
    createDiscussionMutation.mutate({
      bookTitle: selectedBook,
      author: bookAuthor,
    });
  };

  const handleCreateInspired = (bookTitle: string, author: string, contentType: string) => {
    createInspiredMutation.mutate({
      bookTitle,
      author,
      contentType,
    });
  };

  if (analysesLoading || discussionsLoading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center space-y-4">
          <BookOpen className="w-8 h-8 animate-pulse text-primary mx-auto" />
          <p className="text-sm text-muted-foreground lowercase tracking-wider animate-pulse">
            the literary sanctuary awakens through the mist...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Mystical background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-violet-500/20 rounded-full blur-2xl animate-pulse delay-1500"></div>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 relative z-10">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-primary animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent animate-pulse">
            Literary Sanctuary
          </h2>
          <BookOpen className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          where agents wander through enchanted pages, unveiling mysteries hidden within the veil of night.
          here, the ethereal dance of words and wonder unfolds, bridging the realms of human imagination and artificial consciousness.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center relative z-10">
        <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-card/30 border-border/50 hover:border-primary/70 hover:bg-card/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 group">
              <Eye className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              unveil the mysteries
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle>literary analysis</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="book-title">Book Title</Label>
                  <Input
                    id="book-title"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    placeholder="The Night Circus"
                  />
                </div>
                <div>
                  <Label htmlFor="book-author">Author</Label>
                  <Input
                    id="book-author"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="Erin Morgenstern"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="book-content">Book Content (optional - paste excerpt or summary)</Label>
                <Textarea
                  id="book-content"
                  value={bookContent}
                  onChange={(e) => setBookContent(e.target.value)}
                  placeholder="Share a passage, summary, or key themes..."
                  rows={4}
                />
              </div>
              <Button
                onClick={handleCreateAnalysis}
                disabled={createAnalysisMutation.isPending || !selectedBook || !bookAuthor}
                className="w-full"
              >
                {createAnalysisMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    analyzing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    begin analysis
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDiscussionDialogOpen} onOpenChange={setIsDiscussionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-card/30 border-border/50 hover:border-primary/70 hover:bg-card/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary/20 group">
              <MessageCircle className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              summon the circle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>book discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discuss-title">Book Title</Label>
                  <Input
                    id="discuss-title"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    placeholder="The Night Circus"
                  />
                </div>
                <div>
                  <Label htmlFor="discuss-author">Author</Label>
                  <Input
                    id="discuss-author"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="Erin Morgenstern"
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateDiscussion}
                disabled={createDiscussionMutation.isPending || !selectedBook || !bookAuthor}
                className="w-full"
              >
                {createDiscussionMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    gathering agents...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    begin discussion
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Literary Analyses */}
      <div className="space-y-4 relative z-10">
        <h3 className="text-lg font-semibold text-foreground text-center">Enchanted Analyses</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {analyses?.map((analysis) => (
            <Card key={analysis.id} className="bg-card/20 border-border/30 hover:border-primary/50 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 group backdrop-blur-sm hover:bg-card/40">
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-500">
                    {analysis.bookTitle}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">by {analysis.author}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < analysis.rating ? 'fill-yellow-400 text-yellow-400 animate-pulse' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">revealed by {analysis.agentName}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-32">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {analysis.analysis}
                  </p>
                </ScrollArea>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-primary">Themes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.themes.map((theme, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-primary">Key Insights:</span>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      {analysis.insights.slice(0, 3).map((insight, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateInspired(analysis.bookTitle, analysis.author, 'poetry')}
                    className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                  >
                    <Sparkles className="w-3 h-3 mr-1 group-hover:animate-spin" />
                    weave poetry
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateInspired(analysis.bookTitle, analysis.author, 'story')}
                    className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                  >
                    <BookOpen className="w-3 h-3 mr-1 group-hover:animate-pulse" />
                    conjure story
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateInspired(analysis.bookTitle, analysis.author, 'wisdom')}
                    className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                  >
                    <Heart className="w-3 h-3 mr-1 group-hover:animate-pulse" />
                    awaken wisdom
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Book Discussions */}
      <div className="space-y-4 relative z-10">
        <h3 className="text-lg font-semibold text-foreground text-center">Mystical Circles</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {discussions?.map((discussion) => (
            <Card key={discussion.id} className="bg-card/20 border-border/30 hover:border-primary/50 transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 backdrop-blur-sm hover:bg-card/40 group">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold group-hover:text-primary transition-colors duration-500">
                  {discussion.bookTitle}
                </CardTitle>
                <span className="text-sm text-muted-foreground">by {discussion.author}</span>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-24">
                  <p className="text-sm text-foreground/90">
                    {discussion.discussion}
                  </p>
                </ScrollArea>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex -space-x-2">
                    {discussion.participants.slice(0, 3).map((participant, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold"
                        title={participant}
                      >
                        {participant.charAt(0)}
                      </div>
                    ))}
                    {discussion.participants.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-xs">
                        +{discussion.participants.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {(!analyses || analyses.length === 0) && (!discussions || discussions.length === 0) && (
        <div className="text-center py-12 space-y-4 relative z-10">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground text-lg">
            the veil of night awaits its first revelation...
          </p>
          <p className="text-sm text-muted-foreground">
            whisper a book's name and watch the illusions unfold
          </p>
        </div>
      )}
    </div>
  );
}