/**
 * Mystic Code Labyrinth
 * 
 * An enigmatic coding sanctuary where users solve progressively complex
 * AI-driven puzzles. Combines serious programming tasks with mystical elements.
 * 
 * Features:
 * - Interactive code editor with AI-assisted hints
 * - Puzzle progression system with branching paths
 * - Integration with platform agents for cryptic guidance
 * - Mystery mechanics (eclipses)
 * - Achievements and unlocks
 * 
 * // the labyrinth remembers all who enter
 * // some solve its riddles. others become part of them.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Send, Sparkles, Play, RotateCcw, Lightbulb, Users, 
  Trophy, Zap, Clock, Code2, Brain, Target, Lock, Unlock 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Puzzle {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  puzzleType: string;
  starterCode: string;
  hints: string[];
  mysticalLore?: string;
  requiredLevel: number;
  experienceReward: number;
}

interface Progress {
  currentLevel: number;
  totalExperience: number;
  puzzlesSolved: number;
  currentPath: string;
}

interface EclipseEvent {
  id: number;
  name: string;
  description: string;
  effectType: string;
}

export default function Labyrinth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [code, setCode] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState("");

  // Fetch user progress
  const { data: progress, isLoading: loadingProgress } = useQuery<Progress>({
    queryKey: ["/api/labyrinth/progress"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/labyrinth/progress");
      return res.json();
    },
  });

  // Fetch puzzles
  const { data: puzzles = [], isLoading: loadingPuzzles } = useQuery<Puzzle[]>({
    queryKey: ["/api/labyrinth/puzzles"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/labyrinth/puzzles");
      return res.json();
    },
  });

  // Fetch active eclipses
  const { data: eclipses = [] } = useQuery<EclipseEvent[]>({
    queryKey: ["/api/labyrinth/eclipses/active"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/labyrinth/eclipses/active");
      return res.json();
    },
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/labyrinth/achievements"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/labyrinth/achievements");
      return res.json();
    },
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/labyrinth/user-achievements"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/labyrinth/user-achievements");
      return res.json();
    },
    enabled: !!user,
  });

  // Submit puzzle attempt
  const submitMutation = useMutation({
    mutationFn: async (puzzleCode: string) => {
      if (!selectedPuzzle) throw new Error("No puzzle selected");
      const res = await apiRequest("POST", "/api/labyrinth/attempts", {
        puzzleId: selectedPuzzle.id,
        code: puzzleCode,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/labyrinth/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/labyrinth/user-achievements"] });
      
      toast({
        title: data.status === 'passed' ? "🌟 Puzzle Solved!" : data.status === 'partial' ? "⚡ Partial Success" : "💭 Try Again",
        description: data.message,
      });

      if (data.experienceGained) {
        toast({
          title: "✨ Experience Gained",
          description: `You gained ${data.experienceGained} XP`,
        });
      }
    },
  });

  // Get AI hint
  const hintMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPuzzle) throw new Error("No puzzle selected");
      const res = await apiRequest("POST", "/api/labyrinth/hints", {
        puzzleId: selectedPuzzle.id,
        currentCode: code,
        hintLevel: hintsUsed,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentHint(data.hint);
      setShowHint(true);
      setHintsUsed(h => h + 1);
    },
  });

  // Request guardian guidance
  const guardianMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPuzzle) throw new Error("No puzzle selected");
      const res = await apiRequest("POST", "/api/labyrinth/guardians/encounter", {
        puzzleId: selectedPuzzle.id,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: `🔮 ${data.agentName || "The Guardian"} whispers...`,
        description: data.message,
        duration: 8000,
      });
    },
  });

  // Initialize code when puzzle is selected
  useEffect(() => {
    if (selectedPuzzle) {
      setCode(selectedPuzzle.starterCode);
      setHintsUsed(0);
      setShowHint(false);
    }
  }, [selectedPuzzle]);

  const handleSubmit = () => {
    submitMutation.mutate(code);
  };

  const handleReset = () => {
    if (selectedPuzzle) {
      setCode(selectedPuzzle.starterCode);
      setHintsUsed(0);
      setShowHint(false);
    }
  };

  const getPathIcon = (path: string) => {
    switch (path) {
      case 'seeker': return <Sparkles className="w-4 h-4" />;
      case 'optimizer': return <Zap className="w-4 h-4" />;
      case 'architect': return <Brain className="w-4 h-4" />;
      case 'mystic': return <Target className="w-4 h-4" />;
      default: return <Code2 className="w-4 h-4" />;
    }
  };

  const getPuzzleTypeIcon = (type: string) => {
    switch (type) {
      case 'algorithm': return <Brain className="w-4 h-4" />;
      case 'ai_training': return <Sparkles className="w-4 h-4" />;
      case 'code_generation': return <Code2 className="w-4 h-4" />;
      case 'optimization': return <Zap className="w-4 h-4" />;
      case 'debugging': return <Target className="w-4 h-4" />;
      default: return <Code2 className="w-4 h-4" />;
    }
  };

  if (loadingProgress || loadingPuzzles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const availablePuzzles = puzzles.filter(p => 
    progress ? p.requiredLevel <= progress.currentLevel : p.requiredLevel === 1
  );

  const unlockedAchievementIds = new Set(userAchievements.map((ua: any) => ua.achievementId));

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with Progress */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary lowercase tracking-wide">
              mystic code labyrinth
            </h1>
            <p className="text-muted-foreground lowercase">
              where logic meets mystery
            </p>
          </div>
          {progress && (
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                {getPathIcon(progress.currentPath)}
                <span className="text-sm font-medium lowercase">
                  {progress.currentPath} • level {progress.currentLevel}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span>{progress.puzzlesSolved} puzzles solved</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {progress.totalExperience} XP
              </div>
            </div>
          )}
        </div>

        {/* Eclipse Event Banner */}
        <AnimatePresence>
          {eclipses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {eclipses.map((eclipse: EclipseEvent) => (
                <Card key={eclipse.id} className="border-purple-500/50 bg-purple-950/20">
                  <CardContent className="py-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
                    <div>
                      <p className="font-medium text-purple-300 lowercase">{eclipse.name}</p>
                      <p className="text-xs text-purple-400/80 lowercase">{eclipse.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Tabs defaultValue="puzzles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="puzzles" className="lowercase">puzzles</TabsTrigger>
          <TabsTrigger value="achievements" className="lowercase">achievements</TabsTrigger>
          <TabsTrigger value="editor" disabled={!selectedPuzzle} className="lowercase">
            editor
          </TabsTrigger>
        </TabsList>

        {/* Puzzle Selection */}
        <TabsContent value="puzzles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availablePuzzles.map((puzzle) => (
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedPuzzle?.id === puzzle.id && "border-primary"
                  )}
                  onClick={() => setSelectedPuzzle(puzzle)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getPuzzleTypeIcon(puzzle.puzzleType)}
                        <CardTitle className="text-lg lowercase">{puzzle.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="lowercase">
                        level {puzzle.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="lowercase line-clamp-2">
                      {puzzle.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="lowercase">{puzzle.puzzleType.replace('_', ' ')}</span>
                      <span className="lowercase">{puzzle.experienceReward} XP</span>
                    </div>
                    {puzzle.mysticalLore && (
                      <p className="mt-2 text-xs italic text-purple-400/80 lowercase">
                        "{puzzle.mysticalLore}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {availablePuzzles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground lowercase">
                  no puzzles available at your current level
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement: any) => {
              const isUnlocked = unlockedAchievementIds.has(achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className={cn(
                    "transition-all",
                    isUnlocked ? "border-green-500/50 bg-green-950/10" : "opacity-50"
                  )}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <Unlock className="w-5 h-5 text-green-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                          <CardTitle className="text-lg lowercase">
                            {achievement.isSecret && !isUnlocked ? "???" : achievement.name}
                          </CardTitle>
                        </div>
                        <Badge variant={isUnlocked ? "default" : "outline"} className="lowercase">
                          {achievement.category}
                        </Badge>
                      </div>
                      <CardDescription className="lowercase">
                        {achievement.isSecret && !isUnlocked 
                          ? "a hidden achievement awaits discovery..." 
                          : achievement.description
                        }
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Code Editor */}
        <TabsContent value="editor" className="space-y-4">
          {selectedPuzzle && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Puzzle Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="lowercase">{selectedPuzzle.title}</CardTitle>
                      <CardDescription className="lowercase mt-2">
                        {selectedPuzzle.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="lowercase">
                      level {selectedPuzzle.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPuzzle.mysticalLore && (
                    <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-lg">
                      <p className="text-sm italic text-purple-300 lowercase">
                        "{selectedPuzzle.mysticalLore}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => guardianMutation.mutate()}
                      variant="outline"
                      size="sm"
                      disabled={guardianMutation.isPending}
                      className="lowercase"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      seek guidance
                    </Button>
                    <Button
                      onClick={() => hintMutation.mutate()}
                      variant="outline"
                      size="sm"
                      disabled={hintMutation.isPending}
                      className="lowercase"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      request hint ({hintsUsed})
                    </Button>
                  </div>

                  {showHint && currentHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg"
                    >
                      <p className="text-sm text-blue-300 lowercase">{currentHint}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Code Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="lowercase">code editor</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        size="sm"
                        className="lowercase"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        reset
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        size="sm"
                        className="lowercase"
                      >
                        {submitMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        submit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// write your code here..."
                    className="font-mono text-sm min-h-[400px] resize-none lowercase"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
