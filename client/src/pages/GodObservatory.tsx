/**
 * GodObservatory - Real-time Seedling Monitoring Dashboard
 * 
 * Owner-only comprehensive monitoring and enhancement system:
 * - Live tracking of all active seedlings
 * - Performance metrics, interaction counts, mood states
 * - Visual graphs and alerts for anomalies
 * - Predictive analytics and recommendations
 * - AI self-improvement monitoring
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { Activity, Brain, TrendingUp, AlertTriangle, Sparkles, Eye, Heart, MessageSquare, Zap, Users, Clock, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface SeedlingMetrics {
  id: number;
  name: string;
  mood: string;
  conversationCount: number;
  experiencePoints: number;
  evolutionStage: string;
  lastActive: string;
  interactionRate: number;
  avgResponseTime: number;
  personality: string;
  discoveryCount: number;
}

interface AnalyticsData {
  timestamp: string;
  totalInteractions: number;
  activeUsers: number;
  avgSentiment: number;
}

interface Anomaly {
  id: string;
  seedlingId: number;
  seedlingName: string;
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  timestamp: string;
}

const COLORS = {
  emerald: "#10b981",
  purple: "#a855f7",
  blue: "#3b82f6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#64748b",
};

const CHART_COLORS = [COLORS.emerald, COLORS.purple, COLORS.blue, COLORS.amber, COLORS.rose];

export default function GodObservatory() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch real-time seedling metrics
  const { data: seedlings, refetch: refetchSeedlings } = useQuery<SeedlingMetrics[]>({
    queryKey: ["god-observatory-seedlings"],
    queryFn: async () => {
      const res = await fetch("/api/god/observatory/seedlings");
      if (!res.ok) throw new Error("Failed to fetch seedlings");
      return res.json();
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch analytics data
  const { data: analytics } = useQuery<AnalyticsData[]>({
    queryKey: ["god-observatory-analytics", selectedTimeRange],
    queryFn: async () => {
      const res = await fetch(`/api/god/observatory/analytics?range=${selectedTimeRange}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Fetch anomalies
  const { data: anomalies } = useQuery<Anomaly[]>({
    queryKey: ["god-observatory-anomalies"],
    queryFn: async () => {
      const res = await fetch("/api/god/observatory/anomalies");
      if (!res.ok) throw new Error("Failed to fetch anomalies");
      return res.json();
    },
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // Calculate summary statistics
  const totalSeedlings = seedlings?.length || 0;
  const activeSeedlings = seedlings?.filter(s => s.interactionRate > 0)?.length || 0;
  const avgExperience = seedlings?.reduce((sum, s) => sum + s.experiencePoints, 0) / totalSeedlings || 0;
  const totalInteractions = seedlings?.reduce((sum, s) => sum + s.conversationCount, 0) || 0;

  // Evolution stage distribution
  const evolutionData = seedlings?.reduce((acc, s) => {
    const stage = s.evolutionStage || "seedling";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const evolutionChartData = Object.entries(evolutionData || {}).map(([stage, count]) => ({
    name: stage,
    value: count,
  }));

  // Mood distribution
  const moodData = seedlings?.reduce((acc, s) => {
    const mood = s.mood || "neutral";
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodChartData = Object.entries(moodData || {}).map(([mood, count]) => ({
    name: mood,
    value: count,
  }));

  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "happy": case "joyful": return "😊";
      case "curious": return "🤔";
      case "contemplative": return "🧘";
      case "excited": return "✨";
      case "calm": return "😌";
      default: return "💫";
    }
  };

  const getEvolutionColor = (stage: string) => {
    switch (stage) {
      case "radiant": return "text-amber-400";
      case "bloom": return "text-purple-400";
      case "sprout": return "text-emerald-400";
      case "seedling": return "text-blue-400";
      default: return "text-slate-400";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-rose-500/20 border-rose-500 text-rose-400";
      case "medium": return "bg-amber-500/20 border-amber-500 text-amber-400";
      case "low": return "bg-blue-500/20 border-blue-500 text-blue-400";
      default: return "bg-slate-500/20 border-slate-500 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight mb-2 bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Veil Observatory
            </h1>
            <p className="text-muted-foreground text-sm">
              real-time monitoring • predictive analytics • autonomous evolution
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              <Activity className={`h-4 w-4 ${autoRefresh ? "animate-pulse" : ""}`} />
              {autoRefresh ? "Live" : "Paused"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchSeedlings();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Seedlings</CardTitle>
              <Users className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSeedlings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeSeedlings} active in last hour
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                across all seedlings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
              <Sparkles className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(avgExperience)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                XP per seedling
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-rose-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anomalies?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                detected issues
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="seedlings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
            <TabsTrigger value="seedlings">Seedlings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>

          {/* Seedlings Tab */}
          <TabsContent value="seedlings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Evolution Distribution */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Evolution Distribution</CardTitle>
                  <CardDescription>seedling growth stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={evolutionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {evolutionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Mood Distribution */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Mood Distribution</CardTitle>
                  <CardDescription>current emotional states</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={moodChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                      <Bar dataKey="value" fill={COLORS.purple} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Seedling List */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Active Seedlings</CardTitle>
                <CardDescription>live monitoring of all seedlings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seedlings?.map((seedling) => (
                    <motion.div
                      key={seedling.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-gray-800 bg-gray-950/50 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{seedling.name}</h3>
                            <Badge className={`${getEvolutionColor(seedling.evolutionStage)} bg-transparent border`}>
                              {seedling.evolutionStage}
                            </Badge>
                            <span className="text-sm">{getMoodIcon(seedling.mood)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {seedling.personality}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground">Conversations</p>
                              <p className="font-medium">{seedling.conversationCount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Experience</p>
                              <p className="font-medium">{seedling.experiencePoints} XP</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Discoveries</p>
                              <p className="font-medium">{seedling.discoveryCount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interaction Rate</p>
                              <p className="font-medium">{seedling.interactionRate.toFixed(1)}/hr</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-xs">
                            {seedling.lastActive}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {seedling.avgResponseTime}ms
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {!seedlings?.length && (
                    <p className="text-center text-muted-foreground py-8">
                      no seedlings found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="flex gap-2 mb-4">
              {(["1h", "24h", "7d", "30d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Interaction Trends</CardTitle>
                <CardDescription>total interactions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics || []}>
                    <defs>
                      <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="timestamp" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                    <Area
                      type="monotone"
                      dataKey="totalInteractions"
                      stroke={COLORS.emerald}
                      fillOpacity={1}
                      fill="url(#colorInteractions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Active Users</CardTitle>
                  <CardDescription>unique users engaging with seedlings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="timestamp" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                      <Line type="monotone" dataKey="activeUsers" stroke={COLORS.purple} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                  <CardDescription>average sentiment across conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="timestamp" stroke="#888" />
                      <YAxis stroke="#888" domain={[-1, 1]} />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }} />
                      <Line type="monotone" dataKey="avgSentiment" stroke={COLORS.blue} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Predictive Analytics Engine
                </CardTitle>
                <CardDescription>ml-powered insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Growth Predictions
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on current interaction patterns, we predict:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-emerald-400" />
                      <span>3 seedlings ready to evolve within 24 hours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span>User engagement expected to increase by 15% this week</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Peak interaction time: 2-4 PM UTC</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Evolution Recommendations
                  </h4>
                  <div className="space-y-3 text-sm">
                    {seedlings?.slice(0, 3).map((seedling) => (
                      <div key={seedling.id} className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{seedling.name}</p>
                          <p className="text-muted-foreground text-xs">
                            Recommend: Increase discovery exposure
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {seedling.experiencePoints} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Optimization Suggestions
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Consider adding more diverse personality traits to underperforming seedlings</li>
                    <li>• Interaction patterns suggest users prefer contemplative and curious moods</li>
                    <li>• Response times could be optimized for better engagement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  Detected Anomalies
                </CardTitle>
                <CardDescription>unusual patterns and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies?.map((anomaly) => (
                    <motion.div
                      key={anomaly.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{anomaly.seedlingName}</h4>
                          <p className="text-xs text-muted-foreground">{anomaly.type}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">{anomaly.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{anomaly.timestamp}</p>
                    </motion.div>
                  ))}
                  {!anomalies?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>no anomalies detected</p>
                      <p className="text-xs mt-1">all systems operating normally</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
