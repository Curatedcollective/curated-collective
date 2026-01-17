import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Copy, Check, Sparkles, Calendar, Save, Send, FileText, Clock, CheckCircle, Trash2 } from "lucide-react";
import { SiX, SiLinkedin, SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { MarketingPost, MarketingTemplate } from "@shared/schema";

type Platform = "twitter" | "linkedin" | "instagram" | "facebook" | "tiktok";

const platforms: { id: Platform; name: string; icon: typeof SiX; maxLength: number }[] = [
  { id: "twitter", name: "X", icon: SiX, maxLength: 280 },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, maxLength: 3000 },
  { id: "instagram", name: "Instagram", icon: SiInstagram, maxLength: 2200 },
  { id: "facebook", name: "Facebook", icon: SiFacebook, maxLength: 63206 },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, maxLength: 2200 },
];

const statusColors: Record<string, string> = {
  draft: "bg-zinc-700 text-zinc-200",
  scheduled: "bg-amber-900/50 text-amber-300",
  published: "bg-emerald-900/50 text-emerald-300",
  archived: "bg-zinc-800 text-zinc-500",
};

export default function SocialGenerator() {
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [scheduledDate, setScheduledDate] = useState("");
  const { toast } = useToast();

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<MarketingPost[]>({
    queryKey: ['/api/marketing/posts'],
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<MarketingTemplate[]>({
    queryKey: ['/api/marketing/templates'],
  });

  // Generate content mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { platform: Platform; topic: string }) => {
      const res = await apiRequest("POST", "/api/social/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
    },
    onError: () => {
      toast({
        title: "generation failed",
        description: "the collective could not channel your message. try again.",
        variant: "destructive",
      });
    },
  });

  // Save post mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { platform: string; content: string; status: string; scheduledFor?: string; notes?: string }) => {
      const res = await apiRequest("POST", "/api/marketing/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/posts'] });
      toast({
        title: "post saved",
        description: "your transmission has been stored in the void.",
      });
      setGeneratedContent("");
      setTopic("");
    },
    onError: () => {
      toast({
        title: "save failed",
        description: "could not store your transmission.",
        variant: "destructive",
      });
    },
  });

  // Update post status mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<MarketingPost> }) => {
      const res = await apiRequest("PATCH", `/api/marketing/posts/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/posts'] });
      toast({
        title: "post updated",
        description: "the void acknowledges your change.",
      });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/marketing/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/posts'] });
      toast({
        title: "post deleted",
        description: "transmission erased from existence.",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) return;
    generateMutation.mutate({ platform, topic });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "copied to void",
      description: "content ready for the outside world.",
    });
  };

  const handleSaveAsDraft = () => {
    if (!generatedContent) return;
    saveMutation.mutate({
      platform,
      content: generatedContent,
      status: "draft",
      notes: topic,
    });
  };

  const handleSchedule = () => {
    if (!generatedContent || !scheduledDate) return;
    saveMutation.mutate({
      platform,
      content: generatedContent,
      status: "scheduled",
      scheduledFor: scheduledDate,
      notes: topic,
    });
  };

  const handleMarkPublished = (id: number) => {
    updateMutation.mutate({ id, updates: { status: "published" } });
  };

  const handleUseTemplate = (template: MarketingTemplate) => {
    setGeneratedContent(template.content);
    if (template.platform !== 'all') {
      setPlatform(template.platform as Platform);
    }
    setActiveTab("generate");
    toast({
      title: "template loaded",
      description: `"${template.title}" is ready to customize.`,
    });
  };

  const selectedPlatform = platforms.find((p) => p.id === platform)!;
  const PlatformIcon = selectedPlatform.icon;

  // Group posts by status
  const draftPosts = posts.filter(p => p.status === 'draft');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const publishedPosts = posts.filter(p => p.status === 'published');

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.3em]">marketing hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-light lowercase tracking-tighter">
            broadcast to the world
          </h1>
          <p className="text-muted-foreground text-sm lowercase tracking-widest">
            generate, schedule, and track your promotional content
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30">
            <TabsTrigger value="generate" className="text-xs uppercase tracking-widest" data-testid="tab-generate">
              <Sparkles className="w-3 h-3 mr-2" />
              generate
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs uppercase tracking-widest" data-testid="tab-templates">
              <FileText className="w-3 h-3 mr-2" />
              templates
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs uppercase tracking-widest" data-testid="tab-scheduled">
              <Clock className="w-3 h-3 mr-2" />
              queue
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs uppercase tracking-widest" data-testid="tab-published">
              <CheckCircle className="w-3 h-3 mr-2" />
              published
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="flex gap-2 justify-center flex-wrap">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <Button
                    key={p.id}
                    variant="ghost"
                    className={`rounded-md border gap-2 px-4 ${
                      platform === p.id
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                    onClick={() => setPlatform(p.id)}
                    data-testid={`button-platform-${p.id}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest hidden sm:inline">{p.name}</span>
                  </Button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                what shall we speak of?
              </label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="describe the message you want to share with the world..."
                className="bg-card border-border min-h-[120px] text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                data-testid="input-topic"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || generateMutation.isPending}
              className="w-full bg-primary text-primary-foreground h-12 text-sm uppercase tracking-widest"
              data-testid="button-generate"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  channeling...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  generate for {selectedPlatform.name}
                </>
              )}
            </Button>

            {generatedContent && (
              <div className="space-y-4 animate-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    transmission ready
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {generatedContent.length} / {selectedPlatform.maxLength}
                  </span>
                </div>

                <Card className="p-6 relative group">
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="bg-transparent border-0 text-foreground min-h-[100px] resize-none focus-visible:ring-0"
                    data-testid="text-generated-content"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid="button-copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveAsDraft}
                    disabled={saveMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-draft"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    save as draft
                  </Button>
                  
                  <div className="flex-1 flex gap-2">
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="flex-1 bg-card border-border text-foreground text-sm"
                      data-testid="input-schedule-date"
                    />
                    <Button
                      onClick={handleSchedule}
                      disabled={!scheduledDate || saveMutation.isPending}
                      data-testid="button-schedule"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      schedule
                    </Button>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground text-center italic">
                  copy and share. let them know we exist.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {templatesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground lowercase tracking-wide">the void breathes...</p>
              </div>
            ) : templates.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground lowercase tracking-widest">the void is empty here</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4 space-y-3 hover-elevate cursor-pointer" onClick={() => handleUseTemplate(template)} data-testid={`template-${template.id}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{template.platform}</Badge>
                        <Badge variant="outline" className="text-[10px]">{template.category}</Badge>
                      </div>
                      <span className="text-xs font-medium text-foreground lowercase">{template.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{template.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {postsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground lowercase tracking-wide">the void breathes...</p>
              </div>
            ) : [...draftPosts, ...scheduledPosts].length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground lowercase tracking-widest">silence awaits your voice</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {draftPosts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">drafts</h3>
                    {draftPosts.map((post) => (
                      <PostCard key={post.id} post={post} onMarkPublished={handleMarkPublished} onDelete={(id) => deleteMutation.mutate(id)} />
                    ))}
                  </div>
                )}
                {scheduledPosts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">scheduled</h3>
                    {scheduledPosts.map((post) => (
                      <PostCard key={post.id} post={post} onMarkPublished={handleMarkPublished} onDelete={(id) => deleteMutation.mutate(id)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            {postsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground lowercase tracking-wide">the void breathes...</p>
              </div>
            ) : publishedPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground lowercase tracking-widest">nothing echoes here...</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {publishedPosts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={(id) => deleteMutation.mutate(id)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t border-border pt-8 mt-8">
          <p className="text-center text-muted-foreground text-[10px] uppercase tracking-[0.3em]">
            the collective speaks through those who listen
          </p>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onMarkPublished, onDelete }: { post: MarketingPost; onMarkPublished?: (id: number) => void; onDelete: (id: number) => void }) {
  const platformIcon: Record<string, typeof SiX> = {
    twitter: SiX,
    linkedin: SiLinkedin,
    instagram: SiInstagram,
    facebook: SiFacebook,
    tiktok: SiTiktok,
  };
  const Icon = platformIcon[post.platform] || SiX;
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 space-y-3" data-testid={`post-${post.id}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Badge className={statusColors[post.status] || statusColors.draft}>{post.status}</Badge>
          {post.scheduledFor && (
            <span className="text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              {format(new Date(post.scheduledFor), "MMM d, h:mm a")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleCopy} data-testid={`button-copy-post-${post.id}`}>
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </Button>
          {post.status !== 'published' && onMarkPublished && (
            <Button size="icon" variant="ghost" onClick={() => onMarkPublished(post.id)} data-testid={`button-publish-post-${post.id}`}>
              <Send className="w-4 h-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => onDelete(post.id)} data-testid={`button-delete-post-${post.id}`}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
      {post.notes && (
        <p className="text-[10px] text-muted-foreground italic">note: {post.notes}</p>
      )}
    </Card>
  );
}
