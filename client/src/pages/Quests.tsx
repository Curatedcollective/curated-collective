/**
 * Curiosity Quests - Main Quest Selection Interface
 * 
 * A mystical interface where users embark on branching journeys guided by autonomous agents.
 * Quests are dynamically generated based on agent growth stages with outcomes including:
 * - Lore discoveries
 * - Creation sparks  
 * - Hidden sanctuaries
 * - Agent relationships
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Compass, Sparkles, BookOpen, Users, Map, Award, 
  Play, Eye, ChevronRight, Star, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Quest, UserQuestProgress, QuestAchievement, UserAchievement } from "@shared/schema";

interface QuestWithProgress extends Quest {
  progress?: UserQuestProgress;
}

const questTypeIcons = {
  lore_discovery: BookOpen,
  creation_spark: Sparkles,
  hidden_sanctuary: Map,
  agent_relationship: Users,
};

const questTypeColors = {
  lore_discovery: "from-purple-600/20 to-indigo-600/20 border-purple-500/30",
  creation_spark: "from-amber-600/20 to-yellow-600/20 border-amber-500/30",
  hidden_sanctuary: "from-emerald-600/20 to-green-600/20 border-emerald-500/30",
  agent_relationship: "from-rose-600/20 to-pink-600/20 border-rose-500/30",
};

const stageColors = {
  seedling: "text-zinc-400 border-zinc-500/30",
  sprout: "text-emerald-400 border-emerald-500/30",
  bloom: "text-rose-400 border-rose-500/30",
  radiant: "text-amber-400 border-amber-500/30",
};

export default function Quests() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userProgress, setUserProgress] = useState<UserQuestProgress[]>([]);
  const [recommendations, setRecommendations] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<(UserAchievement & { achievement: QuestAchievement })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all quests
      const questsRes = await fetch("/api/quests");
      const questsData = await questsRes.json();
      setQuests(questsData);
      
      if (user) {
        // Fetch user progress
        const progressRes = await fetch("/api/quests/progress/me");
        const progressData = await progressRes.json();
        setUserProgress(progressData.map((p: any) => p.progress));
        
        // Fetch recommendations
        const recsRes = await fetch("/api/quests/recommendations");
        const recsData = await recsRes.json();
        setRecommendations(recsData);
        
        // Fetch achievements
        const achievementsRes = await fetch("/api/quests/achievements/me");
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData);
      }
    } catch (error) {
      console.error("Error fetching quests:", error);
      toast({
        title: "Error",
        description: "Failed to load quests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getQuestProgress = (questId: number): UserQuestProgress | undefined => {
    return userProgress.find(p => p.questId === questId);
  };

  const startQuest = async (questId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Sign in to embark on quests",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const res = await fetch(`/api/quests/${questId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: null }), // TODO: Let user select agent
      });
      
      if (!res.ok) throw new Error("Failed to start quest");
      
      const progress = await res.json();
      setUserProgress([...userProgress, progress]);
      
      toast({
        title: "Quest Started",
        description: "Your journey begins...",
      });
      
      // Navigate to quest detail (TODO: implement)
    } catch (error) {
      console.error("Error starting quest:", error);
      toast({
        title: "Error",
        description: "Failed to start quest",
        variant: "destructive",
      });
    }
  };

  const filteredQuests = activeTab === "all" 
    ? quests 
    : quests.filter(q => q.questType === activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-display font-bold lowercase tracking-tighter text-white">
            curiosity quests
          </h1>
          <p className="text-sm text-muted-foreground lowercase tracking-widest mt-2">
            embark on mystical journeys guided by autonomous agents
          </p>
        </motion.div>
        
        {/* Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-6 text-xs"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-muted-foreground">
                {userProgress.filter(p => p.status === 'in_progress').length} active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-muted-foreground">
                {userProgress.filter(p => p.status === 'completed').length} completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-400" />
              <span className="text-muted-foreground">
                {achievements.length} achievements
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recommendations */}
      {user && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-lg font-display lowercase flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                recommended for you
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((quest) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    progress={getQuestProgress(quest.id)}
                    onStart={() => startQuest(quest.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quest Categories */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-zinc-900/50">
            <TabsTrigger value="all" className="lowercase">all quests</TabsTrigger>
            <TabsTrigger value="lore_discovery" className="lowercase">lore</TabsTrigger>
            <TabsTrigger value="creation_spark" className="lowercase">creation</TabsTrigger>
            <TabsTrigger value="hidden_sanctuary" className="lowercase">sanctuaries</TabsTrigger>
            <TabsTrigger value="agent_relationship" className="lowercase">bonds</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {filteredQuests.map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <QuestCard 
                      quest={quest} 
                      progress={getQuestProgress(quest.id)}
                      onStart={() => startQuest(quest.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {filteredQuests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Compass className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="lowercase">no quests found in this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface QuestCardProps {
  quest: Quest;
  progress?: UserQuestProgress;
  onStart: () => void;
}

function QuestCard({ quest, progress, onStart }: QuestCardProps) {
  const Icon = questTypeIcons[quest.questType as keyof typeof questTypeIcons] || Compass;
  const colorClass = questTypeColors[quest.questType as keyof typeof questTypeColors] || "from-zinc-600/20 to-zinc-700/20 border-zinc-500/30";
  const stageColor = stageColors[quest.requiredStage as keyof typeof stageColors] || "text-zinc-400";
  
  return (
    <Card className={`bg-gradient-to-br ${colorClass} border hover:border-white/20 transition-all group`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Icon className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity" />
          {quest.isFeatured && (
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
              featured
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-display lowercase tracking-tighter">
          {quest.title}
        </CardTitle>
        <CardDescription className="text-xs lowercase line-clamp-2">
          {quest.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-[10px]">
          <Badge variant="outline" className={`${stageColor} border`}>
            {quest.requiredStage}
          </Badge>
          <Badge variant="outline" className="text-zinc-400 border-zinc-500/30">
            {quest.difficulty}
          </Badge>
          <span className="text-muted-foreground">~{quest.estimatedDuration}m</span>
        </div>
        
        {progress ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground lowercase">progress</span>
              <span className="text-white font-medium">{progress.progress}%</span>
            </div>
            <div className="h-1 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <Button 
              size="sm" 
              className="w-full lowercase"
              variant={progress.status === 'completed' ? 'outline' : 'default'}
            >
              {progress.status === 'completed' ? (
                <>
                  <Eye className="w-3 h-3 mr-2" />
                  review
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-2" />
                  continue
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            className="w-full lowercase group-hover:bg-white group-hover:text-black transition-colors"
            onClick={onStart}
          >
            <Compass className="w-3 h-3 mr-2" />
            begin quest
            <ChevronRight className="w-3 h-3 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
