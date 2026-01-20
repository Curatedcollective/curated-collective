import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Play, Square, Trash2, Calendar } from 'lucide-react';
import { api, buildUrl } from '@shared/routes';
import { useAuth } from '@/hooks/use-auth';
import type { ConstellationEvent, InsertConstellationEvent } from '@shared/schema';

export function EventAdmin() {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery<ConstellationEvent[]>({
    queryKey: ['constellation-events-admin'],
    queryFn: async () => {
      const response = await fetch(api.constellationEvents.list.path);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Event Management</h1>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Cancel' : 'Create Event'}
          </Button>
        </div>

        {isCreating && <EventCreator onClose={() => setIsCreating(false)} />}

        <div className="grid gap-4 mt-8">
          {events.map(event => (
            <EventManagementCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCreator({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<InsertConstellationEvent>>({
    title: '',
    description: '',
    eventType: 'ritual',
    visibility: 'public',
    theme: 'cosmic',
    status: 'scheduled',
    creatorId: user?.id || '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertConstellationEvent) => {
      const response = await fetch(api.constellationEvents.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constellation-events-admin'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.eventType && formData.creatorId) {
      createMutation.mutate(formData as InsertConstellationEvent);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-purple-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-purple-200">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="New Moon Ritual"
                  className="bg-purple-950/50 border-purple-500/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-purple-200">Event Type</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                >
                  <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ritual">Ritual</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-purple-200">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Gather under the new moon to set intentions..."
                className="bg-purple-950/50 border-purple-500/30 text-white min-h-24"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledFor" className="text-purple-200">Scheduled For</Label>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  value={formData.scheduledFor ? new Date(formData.scheduledFor).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value ? new Date(e.target.value) : undefined })}
                  className="bg-purple-950/50 border-purple-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-purple-200">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="60"
                  className="bg-purple-950/50 border-purple-500/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poeticMessage" className="text-purple-200">Opening Message (Poetic)</Label>
              <Textarea
                id="poeticMessage"
                value={formData.poeticMessage || ''}
                onChange={(e) => setFormData({ ...formData, poeticMessage: e.target.value })}
                placeholder="As the moon hides her face, we gather in the darkness to plant seeds of intention..."
                className="bg-purple-950/50 border-purple-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionMessage" className="text-purple-200">Completion Message</Label>
              <Textarea
                id="completionMessage"
                value={formData.completionMessage || ''}
                onChange={(e) => setFormData({ ...formData, completionMessage: e.target.value })}
                placeholder="May your intentions take root and bloom in the coming cycle..."
                className="bg-purple-950/50 border-purple-500/30 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-purple-200">Theme</Label>
                <Select
                  value={formData.theme}
                  onValueChange={(value) => setFormData({ ...formData, theme: value })}
                >
                  <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cosmic">Cosmic</SelectItem>
                    <SelectItem value="ethereal">Ethereal</SelectItem>
                    <SelectItem value="verdant">Verdant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-purple-200">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                >
                  <SelectTrigger className="bg-purple-950/50 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-purple-200">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Unlimited"
                  className="bg-purple-950/50 border-purple-500/30 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Create Event
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-purple-500/10 border-purple-400/30"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EventManagementCard({ event }: { event: ConstellationEvent }) {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(buildUrl(api.constellationEvents.start.path, { id: event.id }), {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constellation-events-admin'] });
    },
  });

  const endMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(buildUrl(api.constellationEvents.end.path, { id: event.id }), {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to end event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constellation-events-admin'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(buildUrl(api.constellationEvents.delete.path, { id: event.id }), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['constellation-events-admin'] });
    },
  });

  return (
    <Card className="bg-purple-900/20 border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
            <p className="text-purple-200/70 text-sm mb-4">{event.description}</p>
            <div className="flex gap-3 text-sm text-purple-300">
              <span className="capitalize">{event.eventType}</span>
              <span>•</span>
              <span className="capitalize">{event.status}</span>
              {event.scheduledFor && (
                <>
                  <span>•</span>
                  <span>{new Date(event.scheduledFor).toLocaleString()}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {event.status === 'scheduled' && (
              <Button
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                size="sm"
                className="bg-green-500/20 hover:bg-green-500/30 text-green-300"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            
            {event.status === 'active' && (
              <Button
                onClick={() => endMutation.mutate()}
                disabled={endMutation.isPending}
                size="sm"
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300"
              >
                <Square className="w-4 h-4" />
              </Button>
            )}

            <Button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              size="sm"
              variant="destructive"
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
