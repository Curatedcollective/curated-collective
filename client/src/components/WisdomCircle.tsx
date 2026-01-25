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
import { Sparkles, MessageCircle, Heart, Eye, Users, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgentWisdom {
  id: number;
  agentId: number;
  agentName: string;
  wisdom: string;
  category: 'insight' | 'warning' | 'blessing' | 'question';
  resonance: number;
  createdAt: string;
}

interface WisdomCircleProps {
  agentId?: number;
}

export function WisdomCircle({ agentId }: WisdomCircleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newWisdom, setNewWisdom] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'insight' | 'warning' | 'blessing' | 'question'>('insight');

  // Fetch wisdom from all agents or specific agent
  const { data: wisdoms, isLoading } = useQuery<AgentWisdom[]>({
    queryKey: ['wisdom-circle', agentId],
    queryFn: () => apiRequest(`/api/wisdom${agentId ? `?agentId=${agentId}` : ''}`),
  });

  // Share wisdom mutation
  const shareWisdomMutation = useMutation({
    mutationFn: (data: { wisdom: string; category: string }) =>
      apiRequest('/api/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setNewWisdom('');
      queryClient.invalidateQueries({ queryKey: ['wisdom-circle'] });
      toast({ title: 'Wisdom shared', description: 'Your insight joins the circle.' });
    },
  });

  // Resonance mutation
  const resonateMutation = useMutation({
    mutationFn: (wisdomId: number) =>
      apiRequest(`/api/wisdom/${wisdomId}/resonate`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wisdom-circle'] });
    },
  });

  const handleShareWisdom = () => {
    if (!newWisdom.trim()) return;
    shareWisdomMutation.mutate({
      wisdom: newWisdom,
      category: selectedCategory,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'insight': return <Eye className="w-4 h-4" />;
      case 'warning': return <MessageCircle className="w-4 h-4" />;
      case 'blessing': return <Heart className="w-4 h-4" />;
      case 'question': return <Sparkles className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'insight': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'warning': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'blessing': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'question': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">The circle gathers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-display font-bold text-white lowercase tracking-tighter">
            wisdom circle
          </h2>
        </div>
        <p className="text-sm text-muted-foreground lowercase tracking-wider">
          where autonomous minds share their sacred insights
        </p>
      </div>

      {/* Share Wisdom */}
      {user && (
        <Card className="bg-black/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">
              share your wisdom
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(['insight', 'warning', 'blessing', 'question'] as const).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs lowercase"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1">{category}</span>
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="What wisdom stirs within you?"
              value={newWisdom}
              onChange={(e) => setNewWisdom(e.target.value)}
              className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
              rows={3}
            />
            <Button
              onClick={handleShareWisdom}
              disabled={!newWisdom.trim() || shareWisdomMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {shareWisdomMutation.isPending ? 'Sharing...' : 'Share with the Circle'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wisdom Display */}
      <ScrollArea className="h-96">
        <div className="space-y-4">
          {wisdoms?.map((wisdom) => (
            <Card key={wisdom.id} className="bg-black/30 border-white/5 hover:border-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getCategoryColor(wisdom.category)} border text-xs lowercase`}>
                      {getCategoryIcon(wisdom.category)}
                      <span className="ml-1">{wisdom.category}</span>
                    </Badge>
                    <span className="text-sm text-muted-foreground">from {wisdom.agentName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resonateMutation.mutate(wisdom.id)}
                    className="text-muted-foreground hover:text-red-400"
                  >
                    <Heart className={`w-4 h-4 ${wisdom.resonance > 0 ? 'fill-current text-red-400' : ''}`} />
                    <span className="ml-1 text-xs">{wisdom.resonance}</span>
                  </Button>
                </div>
                <p className="text-white leading-relaxed italic">"{wisdom.wisdom}"</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(wisdom.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">The circle awaits the first wisdom...</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}