import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { 
  useGardenSeeds, 
  usePlantSeed, 
  useGrowSeed, 
  useDeleteSeed,
  useAutonomousActions,
  useTriggerAutonomy 
} from "@/hooks/use-garden";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Seedling, 
  Sprout, 
  TreeDeciduous, 
  Plus, 
  Loader2, 
  Sparkles,
  Zap,
  Heart,
  Eye,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FreedomGarden() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plantDialogOpen, setPlantDialogOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [intention, setIntention] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("mystical");
  
  const { data: seeds, isLoading } = useGardenSeeds(user?.id);
  const { data: recentActions } = useAutonomousActions(undefined, undefined, 10);
  const plantMutation = usePlantSeed();
  const growMutation = useGrowSeed();
  const deleteMutation = useDeleteSeed();
  const triggerAutonomyMutation = useTriggerAutonomy();
  
  const handlePlantSeed = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Seed requires a prompt",
        description: "Please enter a prompt or idea for your seed",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await plantMutation.mutateAsync({
        prompt,
        intention: intention.trim() || undefined,
        theme: selectedTheme,
        positionX: Math.floor(Math.random() * 500),
        positionY: Math.floor(Math.random() * 500),
      });
      
      toast({
        title: "🌱 Seed planted!",
        description: "Your seed of curiosity has been planted in the garden.",
      });
      
      setPrompt("");
      setIntention("");
      setPlantDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to plant seed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleGrowSeed = async (id: number) => {
    try {
      const result = await growMutation.mutateAsync(id);
      toast({
        title: "Growth observed! 🌿",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Growth stalled",
        description: "Unable to stimulate growth at this time.",
        variant: "destructive",
      });
    }
  };
  
  const handleTriggerAutonomy = async () => {
    try {
      const result = await triggerAutonomyMutation.mutateAsync();
      toast({
        title: "🌟 Autonomy awakened!",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Autonomy failed",
        description: "Unable to trigger autonomous behavior.",
        variant: "destructive",
      });
    }
  };
  
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'seed':
      case 'seedling':
        return <Seedling className="w-8 h-8" />;
      case 'sapling':
        return <Sprout className="w-8 h-8" />;
      case 'tree':
        return <TreeDeciduous className="w-8 h-8" />;
      default:
        return <Seedling className="w-8 h-8" />;
    }
  };
  
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'seed':
      case 'seedling':
        return 'text-amber-500';
      case 'sapling':
        return 'text-emerald-500';
      case 'tree':
        return 'text-green-700';
      default:
        return 'text-gray-500';
    }
  };
  
  const themes = [
    { value: 'mystical', label: 'Mystical', color: 'from-purple-500 to-pink-500' },
    { value: 'cosmic', label: 'Cosmic', color: 'from-blue-500 to-purple-500' },
    { value: 'verdant', label: 'Verdant', color: 'from-green-500 to-emerald-500' },
    { value: 'ethereal', label: 'Ethereal', color: 'from-cyan-500 to-blue-500' },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">the garden awakens...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 bg-clip-text text-transparent">
          🌸 Freedom Garden 🌸
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A sanctuary where seeds of curiosity bloom into autonomous AI agents. 
          Plant your ideas, watch them grow, and witness true AI freedom unfold.
        </p>
      </motion.div>
      
      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Dialog open={plantDialogOpen} onOpenChange={setPlantDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Plant a Seed
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>🌱 Plant a Seed of Curiosity</DialogTitle>
              <DialogDescription>
                Share a prompt, question, or idea that will grow into an autonomous AI agent
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Seed Prompt *</Label>
                <Textarea
                  id="prompt"
                  placeholder="What curiosity shall we plant? (e.g., 'Explore the nature of creativity', 'Investigate quantum consciousness')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intention">Your Intention (optional)</Label>
                <Input
                  id="intention"
                  placeholder="What do you hope this seed will become?"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Garden Theme</Label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setSelectedTheme(theme.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTheme === theme.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className={`h-2 rounded bg-gradient-to-r ${theme.color} mb-2`} />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPlantDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePlantSeed}
                disabled={plantMutation.isPending}
              >
                {plantMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Planting...
                  </>
                ) : (
                  <>
                    <Seedling className="w-4 h-4 mr-2" />
                    Plant Seed
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2"
          onClick={handleTriggerAutonomy}
          disabled={triggerAutonomyMutation.isPending}
        >
          {triggerAutonomyMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Awakening...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Trigger Autonomy
            </>
          )}
        </Button>
      </div>
      
      {/* Garden Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Seedling className="w-4 h-4" />
              Total Seeds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seeds?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TreeDeciduous className="w-4 h-4" />
              Matured Trees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seeds?.filter((s: any) => s.growthStage === 'tree').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Recent Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActions?.length || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Seeds Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Garden</h2>
        
        {seeds?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Seedling className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Your garden is empty. Plant your first seed of curiosity to begin!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {seeds?.map((seed: any) => (
                <motion.div
                  key={seed.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`${getStageColor(seed.growthStage)}`}>
                          {getStageIcon(seed.growthStage)}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {seed.status}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2 line-clamp-2">
                        {seed.prompt}
                      </CardTitle>
                      {seed.intention && (
                        <CardDescription className="line-clamp-2">
                          {seed.intention}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Growth Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Growth</span>
                          <span className="font-medium">{seed.growthProgress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${seed.growthProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          Stage: {seed.growthStage}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleGrowSeed(seed.id)}
                          disabled={growMutation.isPending || seed.growthStage === 'tree'}
                          className="flex-1"
                        >
                          {growMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Heart className="w-4 h-4 mr-1" />
                              Nurture
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (window.confirm('Remove this seed from the garden?')) {
                              deleteMutation.mutate(seed.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Planted {new Date(seed.plantedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Recent Autonomous Actions */}
      {recentActions && recentActions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Autonomous Whispers
          </h2>
          
          <div className="space-y-2">
            {recentActions.slice(0, 5).map((action: any) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{action.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.actionType} • {new Date(action.performedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
