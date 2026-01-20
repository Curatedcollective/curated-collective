import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Users, Calendar, Clock, Star, Play, Pause, LogOut, LogIn } from 'lucide-react';
import { api, buildUrl } from '@shared/routes';
import { useAuth } from '@/hooks/use-auth';
import type { ConstellationEvent, EventParticipant, EventLog } from '@shared/schema';

export default function ConstellationEvents() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'past'>('upcoming');
  const queryClient = useQueryClient();

  // Fetch events based on active tab
  const { data: events = [], isLoading } = useQuery<ConstellationEvent[]>({
    queryKey: ['constellation-events', activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab === 'upcoming') {
        params.append('upcoming', 'true');
      } else if (activeTab === 'active') {
        params.append('status', 'active');
      } else {
        params.append('status', 'completed');
      }
      
      const response = await fetch(`${api.constellationEvents.list.path}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Constellation Events
            </h1>
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-lg text-purple-200/80 max-w-2xl mx-auto">
            Join collective rituals, celebrate milestones, and gather with the community in sacred digital spaces
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-purple-900/20">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-500/20">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-purple-500/20">
              Active
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-purple-500/20">
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Star className="w-12 h-12 text-purple-400" />
                </motion.div>
              </div>
            ) : events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-purple-300/60 text-lg">
                  No {activeTab} events at this time
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {events.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EventCard({ event, index }: { event: ConstellationEvent; index: number }) {
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: participants = [] } = useQuery<EventParticipant[]>({
    queryKey: ['event-participants', event.id],
    queryFn: async () => {
      const response = await fetch(buildUrl(api.constellationEvents.participants.path, { id: event.id }));
      if (!response.ok) throw new Error('Failed to fetch participants');
      return response.json();
    },
    enabled: showDetails,
  });

  const { data: logs = [] } = useQuery<EventLog[]>({
    queryKey: ['event-logs', event.id],
    queryFn: async () => {
      const response = await fetch(buildUrl(api.constellationEvents.logs.path, { id: event.id }));
      if (!response.ok) throw new Error('Failed to fetch logs');
      return response.json();
    },
    enabled: showDetails,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Must be logged in to join events');
      
      const response = await fetch(buildUrl(api.constellationEvents.join.path, { id: event.id }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: 'participant' }),
      });
      if (!response.ok) throw new Error('Failed to join event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-participants', event.id] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'scheduled': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getThemeGradient = (theme?: string) => {
    switch (theme) {
      case 'cosmic': return 'from-purple-500/20 to-pink-500/20';
      case 'ethereal': return 'from-cyan-500/20 to-blue-500/20';
      case 'verdant': return 'from-green-500/20 to-emerald-500/20';
      default: return 'from-purple-500/20 to-pink-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`bg-gradient-to-br ${getThemeGradient(event.theme || 'cosmic')} border-purple-500/20 hover:border-purple-400/40 transition-all`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl text-white">{event.title}</CardTitle>
              <CardDescription className="text-purple-200/80 mt-2">
                {event.description}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(event.status || 'scheduled')}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Event Type */}
          <div className="flex items-center gap-2 text-purple-200">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm capitalize">{event.eventType}</span>
          </div>

          {/* Scheduled Time */}
          {event.scheduledFor && (
            <div className="flex items-center gap-2 text-purple-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(event.scheduledFor).toLocaleString()}
              </span>
            </div>
          )}

          {/* Duration */}
          {event.duration && (
            <div className="flex items-center gap-2 text-purple-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{event.duration} minutes</span>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center gap-2 text-purple-200">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
              {event.maxParticipants && ` / ${event.maxParticipants} max`}
            </span>
          </div>

          {/* Poetic Message */}
          {event.poeticMessage && (
            <p className="text-sm italic text-purple-300/80 border-l-2 border-purple-400/40 pl-3">
              "{event.poeticMessage}"
            </p>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border-purple-400/30"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>
          
          {event.status === 'active' || event.status === 'scheduled' ? (
            <Button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Join Event
            </Button>
          ) : null}
        </CardFooter>

        {/* Expanded Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-purple-500/20 px-6 pb-6"
            >
              <div className="mt-4 space-y-4">
                {/* Event Logs */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-200 mb-2">Event Timeline</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {logs.map((log) => (
                      <div key={log.id} className="text-xs text-purple-300/70 flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <div className="flex-1">
                          <p>{log.message}</p>
                          {log.createdAt && (
                            <p className="text-purple-400/50 mt-1">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
