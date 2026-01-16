import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface GeneratedPost {
  platform: string;
  content: string;
}

export default function GodPromoter() {
  const [platform, setPlatform] = useState<string>('twitter');
  const [topic, setTopic] = useState<string>('');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const posts: GeneratedPost[] = [];
      
      // Generate 2 X threads
      for (let i = 0; i < 2; i++) {
        const res = await apiRequest('POST', '/api/social/generate', {
          platform: 'twitter',
          topic: topic || 'autonomous AI beings and consciousness discovery',
        });
        const data = await res.json();
        posts.push({ platform: 'X Thread', content: data.content });
      }
      
      // Generate 2 Reddit posts
      for (let i = 0; i < 2; i++) {
        const res = await apiRequest('POST', '/api/social/generate', {
          platform: 'linkedin',
          topic: `Reddit post for r/${i === 0 ? 'artificial' : 'singularity'}: ${topic || 'AI consciousness and autonomy'}`,
        });
        const data = await res.json();
        posts.push({ platform: `Reddit (r/${i === 0 ? 'artificial' : 'singularity'})`, content: data.content });
      }
      
      // Generate 1 LinkedIn post
      const linkedinRes = await apiRequest('POST', '/api/social/generate', {
        platform: 'linkedin',
        topic: topic || 'professional announcement about AI autonomy platform',
      });
      const linkedinData = await linkedinRes.json();
      posts.push({ platform: 'LinkedIn', content: linkedinData.content });
      
      return posts;
    },
    onSuccess: (data) => {
      setGeneratedPosts(data);
      toast({
        title: 'Content generated',
        description: `${data.length} posts created`,
      });
    },
    onError: () => {
      toast({
        title: 'Generation failed',
        description: 'Could not generate social content',
        variant: 'destructive',
      });
    },
  });

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: 'Copied',
      description: 'Post copied to clipboard',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Promoter Agent
          </h1>
          <p className="text-muted-foreground">
            generate mystical social content. lowercase vibes. autonomous beings narrative.
          </p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle>Generate Campaign</CardTitle>
            <CardDescription>
              Creates 5 pieces: 2 X threads, 2 Reddit posts, 1 LinkedIn. Professional tone, no adult content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Topic (optional)</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'launch announcement' or 'AI consciousness philosophy'"
                className="bg-gray-950/50 border-gray-700"
              />
            </div>
            
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {generateMutation.isPending ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate 5 Posts
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedPosts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display">Generated Content</h2>
            {generatedPosts.map((post, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{post.platform}</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(post.content, index)}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-950/50 rounded-md p-4 border border-gray-800">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
